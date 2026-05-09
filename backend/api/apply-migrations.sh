#!/bin/bash
# Script to apply database migrations using the migration bundle

set -e

# Path to the migration bundle
BUNDLE_PATH="/app/migration-bundle"

# Check if the connection string environment variable exists
if [ -z "${CONNECTIONSTRINGS__DEFAULTCONNECTION}" ]; then
    echo "Error: CONNECTIONSTRINGS__DEFAULTCONNECTION environment variable is not set"
    exit 1
fi

echo "Applying migrations to database..."
echo "Connection: ${CONNECTIONSTRINGS__DEFAULTCONNECTION}"

# Apply migrations using the bundle
chmod +x $BUNDLE_PATH
$BUNDLE_PATH --connection "${CONNECTIONSTRINGS__DEFAULTCONNECTION}"

echo "Database migrations applied successfully"