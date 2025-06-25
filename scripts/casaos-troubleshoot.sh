#!/bin/bash

# GARDENS-NET E-commerce CasaOS Troubleshooter
# ============================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔧 GARDENS-NET E-commerce Troubleshooter${NC}"
echo "========================================"

APP_DIR="/DATA/AppData/gardens-net"

# Check if installation exists
if [ ! -d "$APP_DIR" ]; then
    echo -e "${RED}❌ GARDENS-NET installation not found!${NC}"
    echo "Please run the installer first."
    exit 1
fi

cd "$APP_DIR"

echo -e "${BLUE}📊 System Status Check${NC}"
echo "====================="

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker not installed${NC}"
else
    echo -e "${GREEN}✅ Docker installed${NC}"
fi

# Check Docker Compose
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose not available${NC}"
else
    echo -e "${GREEN}✅ Docker Compose available${NC}"
fi

# Check container status
echo ""
echo -e "${BLUE}🐳 Container Status${NC}"
echo "=================="
docker-compose ps

# Check container health
echo ""
echo -e "${BLUE}🏥 Health Checks${NC}"
echo "==============="

# Database health
if docker-compose exec -T postgres pg_isready -U gardens_user; then
    echo -e "${GREEN}✅ Database is healthy${NC}"
else
    echo -e "${RED}❌ Database is not responding${NC}"
    echo "Database logs:"
    docker-compose logs --tail=20 postgres
fi

# Redis health
if docker-compose exec -T redis redis-cli ping | grep -q PONG; then
    echo -e "${GREEN}✅ Redis is healthy${NC}"
else
    echo -e "${RED}❌ Redis is not responding${NC}"
    echo "Redis logs:"
    docker-compose logs --tail=20 redis
fi

# Application health
APP_IP=$(hostname -I | awk '{print $1}')
if curl -f -s "http://$APP_IP:3000/api/health" > /dev/null; then
    echo -e "${GREEN}✅ Application is healthy${NC}"
else
    echo -e "${RED}❌ Application is not responding${NC}"
    echo "Application logs:"
    docker-compose logs --tail=20 app
fi

# Check disk space
echo ""
echo -e "${BLUE}💾 Disk Usage${NC}"
echo "============"
df -h /DATA

# Check memory usage
echo ""
echo -e "${BLUE}🧠 Memory Usage${NC}"
echo "=============="
free -h

# Check network connectivity
echo ""
echo -e "${BLUE}🌐 Network Connectivity${NC}"
echo "======================"
if ping -c 1 8.8.8.8 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Internet connectivity OK${NC}"
else
    echo -e "${RED}❌ No internet connectivity${NC}"
fi

# Common fixes
echo ""
echo -e "${BLUE}🔧 Common Fixes${NC}"
echo "=============="
echo "1. Restart services: ./restart.sh"
echo "2. Check logs: docker-compose logs -f"
echo "3. Rebuild containers: docker-compose up -d --force-recreate"
echo "4. Reset everything: docker-compose down -v && docker-compose up -d"
echo "5. Free up space: docker system prune -a"

# Auto-fix suggestions
echo ""
echo -e "${YELLOW}🤖 Auto-fix Options${NC}"
echo "==================="
echo "Would you like to try automatic fixes? (y/n)"
read -r response

if [[ "$response" =~ ^[Yy]$ ]]; then
    echo "Attempting automatic fixes..."
    
    # Restart services
    echo "🔄 Restarting services..."
    docker-compose restart
    
    # Clean up Docker
    echo "🧹 Cleaning up Docker..."
    docker system prune -f
    
    # Check again
    sleep 10
    if curl -f -s "http://$APP_IP:3000/api/health" > /dev/null; then
        echo -e "${GREEN}✅ Auto-fix successful!${NC}"
    else
        echo -e "${RED}❌ Auto-fix failed. Manual intervention required.${NC}"
    fi
fi

echo ""
echo -e "${BLUE}📞 Support Information${NC}"
echo "====================="
echo "If problems persist:"
echo "• GitHub Issues: https://github.com/gardens-net/ecommerce/issues"
echo "• Documentation: https://docs.gardens-net.com"
echo "• Community: https://discord.gg/gardens-net"
