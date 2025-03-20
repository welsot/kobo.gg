#!/bin/bash

# Remove the obj and bin directories
find . -type d -name "bin" -o -name "obj" | xargs rm -rf

# Commit changes to remove cached files
git add .gitignore
git commit -m "Update .gitignore to exclude bin and obj directories"

# Restore IDEs and configuration files that were mistakenly staged for deletion
git reset HEAD .dockerignore .editorconfig api/.config api/.gitignore

# Commit the removal of cached build output and user-specific files
git add -u
git commit -m "Remove build outputs and user-specific files from repository"

echo "Cleanup complete! Repository is now cleaner."