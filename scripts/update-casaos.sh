#!/bin/bash

# GARDENS-NET E-commerce CasaOS Update Script
# ===========================================

set -e

echo "🔄 GARDENS-NET E-commerce - Update Script"
echo "========================================="

APP_DIR="/DATA/AppData/gardens-net"
BACKUP_DIR="$APP_DIR/backups/$(date +%Y%m%d_%H%M%S)"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Create backup
echo -e "${BLUE}💾 Creating backup...${NC}"
mkdir -p $BACKUP_DIR
cd $APP_DIR
docker-compose exec postgres pg_dump -U gardens_user gardens_net > $BACKUP_DIR/database.sql
cp -r uploads $BACKUP_DIR/
cp .env $BACKUP_DIR/

# Pull latest changes
echo -e "${BLUE}📥 Pulling latest updates...${NC}"
git pull origin main

# Rebuild image
echo -e "${BLUE}🔨 Rebuilding Docker image...${NC}"
docker build -t gardens-net:latest .

# Update services
echo -e "${BLUE}🔄 Updating services...${NC}"
docker-compose down
docker-compose up -d

echo -e "${GREEN}✅ Update completed successfully!${NC}"
echo -e "${YELLOW}💾 Backup saved to: $BACKUP_DIR${NC}"
