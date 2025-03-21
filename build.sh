#!/bin/bash
# Build and deploy the application to production

set -e # Exit on any error

echo "Building Docker images..."
docker compose build frontend backend

echo "Saving Docker images..."
mkdir -p /tmp/kobogg
docker save kobogg/frontend > /tmp/kobogg/frontend.tar
docker save kobogg/backend > /tmp/kobogg/backend.tar

echo "Copying Docker images to server..."
rsync -avzh --progress --info=progress2 /tmp/kobogg/frontend.tar puzzlik@puzzlik-app:/home/puzzlik/kobo.gg/docker
rsync -avzh --progress --info=progress2 /tmp/kobogg/backend.tar puzzlik@puzzlik-app:/home/puzzlik/kobo.gg/docker

echo "Deployment instructions:"
echo "-----------------------"
echo "1. Load the Docker images on the server:"
echo "   docker load < /home/puzzlik/kobo.gg/docker/frontend.tar"
echo "   docker load < /home/puzzlik/kobo.gg/docker/backend.tar"
echo ""
echo "2. Apply database migrations:"
echo "   docker compose --profile migrations up migrations"
echo ""
echo "3. Start or restart all services:"
echo "   docker compose up -d"
echo ""
echo "Build complete!"