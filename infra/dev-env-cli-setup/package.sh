#!/bin/bash

# package.sh - Create a zip file of the dev-env-cli package

PACKAGE_NAME="dev-env-cli"
ZIP_FILE="${PACKAGE_NAME}.zip"

# Check if the directory exists
if [ ! -d "$PACKAGE_NAME" ]; then
  echo "Error: $PACKAGE_NAME directory not found."
  exit 1
fi

# Create the zip file
echo "Creating $ZIP_FILE..."
zip -r "$ZIP_FILE" "$PACKAGE_NAME"

echo "✅ Package created: $ZIP_FILE"
echo "To install, run:"
echo "  unzip $ZIP_FILE"
echo "  cd $PACKAGE_NAME"
echo "  ./install.sh"

exit 0
