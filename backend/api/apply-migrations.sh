#!/bin/bash
# Script to apply database migrations using the migration bundle

set -e

# Path to the migration bundle
BUNDLE_PATH="/app/migration-bundle"

# Apply migrations using the bundle
$BUNDLE_PATH --connection "${CONNECTIONSTRINGS__DEFAULTCONNECTION}"

echo "Database migrations applied successfully"