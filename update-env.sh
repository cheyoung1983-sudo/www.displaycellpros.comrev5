#!/bin/bash
# ==============================================================================
# Environment Configuration & Key Update Script
# Display & Cell Pros LLC (D&CP)
# ==============================================================================

set -e

ENV_FILE=".env"

echo "Updating $ENV_FILE configuration..."

# Check if OpenAI API key argument was provided, or use default
OPENAI_KEY="${1:-${OPENAI_API_KEY}}"

# Ensure .env exists or create from template
if [ ! -f "$ENV_FILE" ]; then
  if [ -f ".env.example" ]; then
    cp .env.example "$ENV_FILE"
  else
    touch "$ENV_FILE"
  fi
fi

# Update or insert OPENAI_API_KEY
if grep -q "^OPENAI_API_KEY=" "$ENV_FILE"; then
  sed -i "s|^OPENAI_API_KEY=.*|OPENAI_API_KEY=\"$OPENAI_KEY\"|" "$ENV_FILE"
else
  echo "OPENAI_API_KEY=\"$OPENAI_KEY\"" >> "$ENV_FILE"
fi

echo "✅ OPENAI_API_KEY configured in $ENV_FILE"
echo "Backend services are configured with OpenAI SDK and resilient fallback architecture."
