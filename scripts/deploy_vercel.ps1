# Vercel Best Practice Deployment Script
# This script automates the recommended Link -> Pull -> Build -> Deploy flow.

$ProjectName = "www.displaycellpros.com"

Write-Host "--- Starting Vercel Deployment for $ProjectName ---" -ForegroundColor Cyan

# Ensure SystemRoot is set (Fixes "spawn cmd.exe ENOENT" in some Node.js environments)
if (-not $env:SystemRoot) {
    $env:SystemRoot = "C:\Windows"
    Write-Host "[Env] SystemRoot was missing, set to C:\Windows" -ForegroundColor Gray
}

# 1. Link to the Vercel project if not already linked
Write-Host "[1/4] Verifying Vercel project link..." -ForegroundColor Yellow
vercel link --yes

# 2. Pull environment variables to ensure local build matches production secrets
Write-Host "[2/4] Pulling development environment variables..." -ForegroundColor Yellow
vercel env pull .env.local --yes

# 3. Perform a local Vercel build
# This catch configuration errors before they hit the server.
Write-Host "[3/4] Executing local Vercel build (Pre-verification)..." -ForegroundColor Yellow
vercel build

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Local Vercel build failed. Deployment aborted." -ForegroundColor Red
    exit $LASTEXITCODE
}

# 4. Deploy using the prebuilt bundle
# This is faster and more reliable than letting Vercel build remotely.
Write-Host "[4/4] Deploying prebuilt bundle to Vercel..." -ForegroundColor Yellow
vercel deploy --prebuilt --prod

Write-Host "--- Deployment Sequence Complete ---" -ForegroundColor Green
