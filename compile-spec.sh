#!/usr/bin/env bash

echo "Starting Redoc compilation from spec.json..."

# Path to your JSON spec
SPEC_PATH="docs/spec.json"
OUTPUT_HTML="docs/spec.html"

# Generate Redoc HTML from JSON
npx redoc-cli bundle "$SPEC_PATH" --output "$OUTPUT_HTML" && \
echo "Generated $OUTPUT_HTML from $SPEC_PATH" && \
echo -e "\n✅ Done!"
