#!/bin/bash
# ==============================================================================
# Synology DS220+ (stellarcloud) Automated Deployment Script
# Execute via SSH on Synology NAS in /volume1/docker/jewelleray
# ==============================================================================

set -euo pipefail

echo "==> Deploying Jewelleray UAE Platform on Synology DS220+..."

cd /volume1/docker/jewelleray

# Check git updates
git fetch --tags
git checkout phase-7-complete

# Build and restart containers
sudo docker-compose -f docker-compose.prod.yml down
sudo docker-compose -f docker-compose.prod.yml build web
sudo docker-compose -f docker-compose.prod.yml up -d

echo "==> Verifying container health..."
sleep 5
sudo docker ps --filter "name=jewelleray"

echo "==> Deployment Complete. Access URL: https://studio.stellarcloud.synology.me"
