#!/usr/bin/env bash

echo "Starting Redoc compilation from spec.json..."

# Path to your JSON spec
SPEC_PATH="docs/spec.json"
OUTPUT_HTML="docs/spec.html"

# Generate Redoc HTML from JSON
npx redoc-cli bundle "$SPEC_PATH" --output "$OUTPUT_HTML" && \
echo "Generated $OUTPUT_HTML from $SPEC_PATH" && \
echo -e "\n✅ Done!"

# Inject changelog into generated HTML
CHANGELOG_HTML="docs/changelog.html"
TARGET_FILE="docs/spec.html"

if [ -f "$CHANGELOG_HTML" ]; then
  echo "Injecting changelog..."
  sed -i '/<body>/r '"$CHANGELOG_HTML" "$TARGET_FILE"
  echo "✅ Injected changelog into $TARGET_FILE"
else
  echo "⚠️ changelog.html not found. Skipping injection."
fi
