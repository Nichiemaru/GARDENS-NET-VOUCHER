#!/bin/bash

# GARDENS-NET E-commerce CasaOS Installation Script
# =================================================

set -e

echo "🌱 GARDENS-NET E-commerce - CasaOS Installation"
echo "==============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo -e "${RED}❌ This script should not be run as root${NC}"
   exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Create application directory
APP_DIR="/DATA/AppData/gardens-net"
echo -e "${BLUE}📁 Creating application directory: $APP_DIR${NC}"
sudo mkdir -p $APP_DIR/{uploads,logs,ssl,backups}
sudo chown -R $USER:$USER $APP_DIR

# Copy configuration files
echo -e "${BLUE}📋 Setting up configuration files...${NC}"
cp .env.production $APP_DIR/.env
cp docker-compose.yml $APP_DIR/
cp -r nginx $APP_DIR/
cp -r scripts $APP_DIR/

# Configure MikPos integration
echo -e "${BLUE}🔧 Configuring MikPos integration...${NC}"
if [ -f "scripts/configure-mikpos-env.sh" ]; then
    chmod +x scripts/configure-mikpos-env.sh
    echo -e "${YELLOW}Please configure MikPos settings:${NC}"
    ./scripts/configure-mikpos-env.sh
fi

# Setup MikPos webhook
echo -e "${BLUE}📡 Setting up MikPos webhook...${NC}"
if [ -f "scripts/setup-mikpos-webhook.sh" ]; then
    chmod +x scripts/setup-mikpos-webhook.sh
    cp scripts/setup-mikpos-webhook.sh $APP_DIR/
fi

# Generate SSL certificates (self-signed for local use)
echo -e "${BLUE}🔐 Generating SSL certificates...${NC}"
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout $APP_DIR/ssl/key.pem \
    -out $APP_DIR/ssl/cert.pem \
    -subj "/C=ID/ST=Jakarta/L=Jakarta/O=GARDENS-NET/CN=localhost"

# Set proper permissions
sudo chmod 600 $APP_DIR/ssl/key.pem
sudo chmod 644 $APP_DIR/ssl/cert.pem

# Build Docker image
echo -e "${BLUE}🐳 Building Docker image...${NC}"
docker build -t gardens-net:latest .

# Start services
echo -e "${BLUE}🚀 Starting services...${NC}"
cd $APP_DIR
docker-compose up -d

# Wait for services to be ready
echo -e "${YELLOW}⏳ Waiting for services to start...${NC}"
sleep 30

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo -e "${GREEN}✅ Services started successfully!${NC}"
else
    echo -e "${RED}❌ Some services failed to start. Check logs with: docker-compose logs${NC}"
    exit 1
fi

# Display access information
echo ""
echo -e "${GREEN}🎉 GARDENS-NET E-commerce installed successfully!${NC}"
echo ""
echo -e "${BLUE}📱 Access Information:${NC}"
echo -e "   🌐 Web Interface: ${GREEN}http://localhost:3000${NC}"
echo -e "   🔒 HTTPS Interface: ${GREEN}https://localhost${NC}"
echo -e "   👤 Admin Panel: ${GREEN}http://localhost:3000/admin${NC}"
echo -e "   📊 MikPos Dashboard: ${GREEN}http://localhost:3000/mikpos/dashboard${NC}"
echo ""
echo -e "${BLUE}🔧 Default Credentials:${NC}"
echo -e "   📧 Email: ${YELLOW}admin@gardens-net.com${NC}"
echo -e "   🔑 Password: ${YELLOW}admin123${NC} ${RED}(Change immediately!)${NC}"
echo ""
echo -e "${BLUE}📁 Data Locations:${NC}"
echo -e "   📂 App Data: ${YELLOW}$APP_DIR${NC}"
echo -e "   📸 Uploads: ${YELLOW}$APP_DIR/uploads${NC}"
echo -e "   📝 Logs: ${YELLOW}$APP_DIR/logs${NC}"
echo ""
echo -e "${BLUE}🛠️  Management Commands:${NC}"
echo -e "   🔄 Restart: ${YELLOW}cd $APP_DIR && docker-compose restart${NC}"
echo -e "   📊 Status: ${YELLOW}cd $APP_DIR && docker-compose ps${NC}"
echo -e "   📝 Logs: ${YELLOW}cd $APP_DIR && docker-compose logs -f${NC}"
echo -e "   🛑 Stop: ${YELLOW}cd $APP_DIR && docker-compose down${NC}"
echo ""
echo -e "${GREEN}🚀 Installation completed! Enjoy using GARDENS-NET E-commerce!${NC}"
