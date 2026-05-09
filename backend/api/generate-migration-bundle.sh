#!/bin/bash
# This script generates a migration bundle for the Kobo.gg application

set -e

# Ensure the .NET EF tools are installed
dotnet tool restore

# Generate a migration bundle for the target platform (Linux in this case)
dotnet ef migrations bundle \
  --project api.csproj \
  --configuration Release \
  --self-contained \
  --force \
  -o ./migration-bundle \
  --target-runtime linux-x64

echo "Migration bundle created successfully at '../migration-bundle'"
echo "You can now run this bundle on your production server without the .NET SDK"