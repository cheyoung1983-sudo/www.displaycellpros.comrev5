import { getSignedUrl } from '../src/lib/cloudfront';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function test() {
  const testUrl = "https://assets.displaycellpros.com/forensics/report-001.pdf";

  console.log("--- CloudFront Signed URL Test ---");
  console.log(`Original URL: ${testUrl}`);

  // Note: This will likely fail with a console error if the resolve:secretsmanager hasn't happened
  // but it verifies the code path and dependency loading.
  const signedUrl = getSignedUrl(testUrl);

  if (signedUrl !== testUrl) {
    console.log("✓ Successfully generated a signed URL format.");
    console.log(`Signed URL: ${signedUrl}`);
  } else {
    console.log("✗ Failed to sign URL (check console for missing keys).");
  }
}

test();
