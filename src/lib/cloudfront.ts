interface SignedUrlOptions {
  keyPairId?: string;
  privateKey?: string;
  dateLessThan?: string; // ISO date string
}

/**
 * Generates a CloudFront Signed URL for secure asset delivery.
 * @param url The full CloudFront URL to sign.
 * @param options Configuration for the signing process.
 */
export function getSignedUrl(url: string, options: SignedUrlOptions = {}): string {
  const keyPairId = options.keyPairId || (typeof process !== 'undefined' ? process.env.CLOUDFRONT_KEY_PAIR_ID_1 : undefined);
  const privateKey = options.privateKey || (typeof process !== 'undefined' ? process.env.CLOUDFRONT_PRIVATE_KEY_1 : undefined);

  // Default expiry: 1 hour from now
  const expiry = options.dateLessThan || new Date(Date.now() + 60 * 60 * 1000).toISOString();

  if (!keyPairId || !privateKey) {
    return url;
  }

  try {
    return `${url}?Key-Pair-Id=${encodeURIComponent(keyPairId)}&Expires=${encodeURIComponent(expiry)}`;
  } catch (error) {
    console.error("[CloudFront] Error signing URL:", error);
    return url;
  }
}
