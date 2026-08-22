/**
 * SMS alert for a thermal lockout event (see faultTriangulation.ts's
 * THERMAL_LOCKOUT_THRESHOLD_C). Kept separate from faultTriangulation.ts
 * because that module is documented as pure signal-threshold logic with no
 * side effects - this is the one place that actually reaches the network.
 *
 * Reuses the TWILIO_ACCOUNT_SID/TWILIO_AUTH_TOKEN/TWILIO_FROM_NUMBER
 * already configured for Triage AI's dispatch_booking_link (see
 * triageAiTools.ts), sending to a dedicated ops number
 * (THERMAL_LOCKOUT_ALERT_PHONE) rather than a customer-supplied one -
 * this is an internal safety alert, not a customer message.
 */
export async function sendThermalLockoutAlert(params: {
  deviceId: string;
  thermalReading: number;
}): Promise<{ sent: boolean; provider: 'twilio' | 'not-configured'; error?: string }> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;
  const toPhone = process.env.THERMAL_LOCKOUT_ALERT_PHONE;

  if (!accountSid || !authToken || !fromNumber || !toPhone) {
    console.warn('[Thermal Lockout Alert] Twilio not fully configured (TWILIO_ACCOUNT_SID/TWILIO_AUTH_TOKEN/TWILIO_FROM_NUMBER/THERMAL_LOCKOUT_ALERT_PHONE) - skipping real SMS send.');
    return { sent: false, provider: 'not-configured' };
  }

  const body = `D&CP THERMAL LOCKOUT: device ${params.deviceId} hit ${params.thermalReading}C (>= 45C threshold). Diagnostic loop should have aborted and VBUS cut - verify on bench immediately.`;

  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ To: toPhone, From: fromNumber, Body: body }),
      }
    );
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return { sent: false, provider: 'twilio', error: `Twilio ${res.status}: ${text.slice(0, 200)}` };
    }
    return { sent: true, provider: 'twilio' };
  } catch (err: any) {
    return { sent: false, provider: 'twilio', error: err?.message || 'Twilio request failed' };
  }
}
