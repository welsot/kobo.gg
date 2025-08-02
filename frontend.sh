#!/bin/bash
# Build and deploy the application to production

set -e # Exit on any error

echo "Building Docker images..."
docker compose build frontend

echo "Saving Docker images..."
mkdir -p /tmp/kobogg
docker save kobogg/frontend > /tmp/kobogg/frontend.tar

echo "Copying Docker images to server..."
rsync -avzh --progress --info=progress2 /tmp/kobogg/frontend.tar puzzlik@puzzlik-app:/home/puzzlik/kobo.gg/docker

echo "Deployment instructions:"
echo "-----------------------"
echo "1. Load the Docker images on the server:"
echo "   docker load < /home/puzzlik/kobo.gg/docker/frontend.tar"
echo "2. docker compose up -d"
echo ""
echo "Build complete!"