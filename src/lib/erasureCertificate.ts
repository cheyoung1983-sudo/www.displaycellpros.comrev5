import { createHmac, timingSafeEqual } from 'crypto';

// NIST SP 800-88 R1 Certificate of Erasure. Zero external API dependencies —
// signing happens entirely inside this module with Node's built-in crypto.

export type SanitizationType = 'Clear' | 'Purge';

function getHmacSecret(): string {
  const secret = process.env.ERASURE_HMAC_SECRET;
  if (!secret) {
    throw new Error('ERASURE_HMAC_SECRET is not configured — cannot sign an erasure certificate.');
  }
  return secret;
}

function buildSignaturePayload(deviceIdentifier: string, sanitizationType: SanitizationType, completedAt: string): string {
  // Binds device metadata + sanitization type + timestamp into one signed
  // string so the certificate can't be replayed against a different device
  // or backdated without invalidating the signature.
  return `${deviceIdentifier}|${sanitizationType}|${completedAt}`;
}

export function signErasureCertificate(
  deviceIdentifier: string,
  sanitizationType: SanitizationType,
  completedAt: string = new Date().toISOString()
): string {
  const payload = buildSignaturePayload(deviceIdentifier, sanitizationType, completedAt);
  return createHmac('sha256', getHmacSecret()).update(payload).digest('hex');
}

export function verifyErasureCertificate(
  deviceIdentifier: string,
  sanitizationType: SanitizationType,
  completedAt: string,
  hmacSignature: string
): boolean {
  const expected = signErasureCertificate(deviceIdentifier, sanitizationType, completedAt);
  const expectedBuf = Buffer.from(expected, 'hex');
  const actualBuf = Buffer.from(hmacSignature, 'hex');
  if (expectedBuf.length !== actualBuf.length) return false;
  return timingSafeEqual(expectedBuf, actualBuf);
}

export interface ErasureCertificateRecord {
  certId: string;
  deviceIdentifier: string;
  sanitizationType: SanitizationType;
  hmacSignature: string;
  completedAt: string;
}

/**
 * Signs and persists a Certificate of Erasure. `deviceIdentifier` should be
 * the device serial number or IMEI — the certificate is meaningless without
 * it, since the HMAC binds signature to a specific device.
 */
export async function issueErasureCertificate(
  deviceIdentifier: string,
  sanitizationType: SanitizationType
): Promise<ErasureCertificateRecord> {
  const completedAt = new Date().toISOString();
  const hmacSignature = signErasureCertificate(deviceIdentifier, sanitizationType, completedAt);

  const { query } = await import('./serverDb.ts');
  const result = await query(
    `INSERT INTO erasure_certificates (device_identifier, hmac_signature, sanitization_type, completed_at)
     VALUES ($1, $2, $3, $4)
     RETURNING cert_id, device_identifier, hmac_signature, sanitization_type, completed_at`,
    [deviceIdentifier, hmacSignature, sanitizationType, completedAt]
  );

  const row = result.rows[0];
  return {
    certId: row.cert_id,
    deviceIdentifier: row.device_identifier,
    sanitizationType: row.sanitization_type,
    hmacSignature: row.hmac_signature,
    completedAt: row.completed_at,
  };
}
