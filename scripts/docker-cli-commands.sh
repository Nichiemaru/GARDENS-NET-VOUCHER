#!/bin/bash

# GARDENS-NET E-commerce Docker CLI Commands
# ==========================================

echo "🐳 GARDENS-NET E-commerce Docker CLI Installation Guide"
echo "======================================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}📋 Quick Installation Commands:${NC}"
echo ""

echo -e "${CYAN}1. Create Project Directory:${NC}"
echo "mkdir gardens-net && cd gardens-net"
echo ""

echo -e "${CYAN}2. Download Configuration Files:${NC}"
echo "curl -O https://raw.githubusercontent.com/your-repo/gardens-net/main/docker-compose.yml"
echo "curl -O https://raw.githubusercontent.com/your-repo/gardens-net/main/.env.example"
echo "curl -O https://raw.githubusercontent.com/your-repo/gardens-net/main/init-db.sql"
echo "cp .env.example .env"
echo ""

echo -e "${CYAN}3. Configure Environment:${NC}"
echo "nano .env  # Edit configuration"
echo ""

echo -e "${CYAN}4. Start Services:${NC}"
echo "docker-compose up -d"
echo ""

echo -e "${CYAN}5. Check Status:${NC}"
echo "docker-compose ps"
echo "docker-compose logs -f app"
echo ""

echo -e "${BLUE}🔧 Management Commands:${NC}"
echo ""

echo -e "${CYAN}Start Services:${NC}"
echo "docker-compose up -d"
echo ""

echo -e "${CYAN}Stop Services:${NC}"
echo "docker-compose down"
echo ""

echo -e "${CYAN}Restart Services:${NC}"
echo "docker-compose restart"
echo ""

echo -e "${CYAN}Update Application:${NC}"
echo "docker-compose pull"
echo "docker-compose up -d"
echo ""

echo -e "${CYAN}View Logs:${NC}"
echo "docker-compose logs -f          # All services"
echo "docker-compose logs -f app      # Application only"
echo "docker-compose logs -f postgres # Database only"
echo ""

echo -e "${CYAN}Execute Commands:${NC}"
echo "docker-compose exec app sh                    # Access app container"
echo "docker-compose exec postgres psql -U gardens_user gardens_net  # Access database"
echo "docker-compose exec redis redis-cli          # Access Redis"
echo ""

echo -e "${CYAN}Backup Database:${NC}"
echo "docker-compose exec postgres pg_dump -U gardens_user gardens_net > backup.sql"
echo ""

echo -e "${CYAN}Restore Database:${NC}"
echo "docker-compose exec -T postgres psql -U gardens_user gardens_net < backup.sql"
echo ""

echo -e "${BLUE}🌐 Access URLs:${NC}"
echo ""
echo -e "${GREEN}Application:${NC} http://localhost:3000"
echo -e "${GREEN}Admin Panel:${NC} http://localhost:3000/admin"
echo -e "${GREEN}MikPos Dashboard:${NC} http://localhost:3000/mikpos/dashboard"
echo -e "${GREEN}Database:${NC} localhost:5432"
echo -e "${GREEN}Redis:${NC} localhost:6379"
echo ""

echo -e "${BLUE}👤 Default Credentials:${NC}"
echo ""
echo -e "${GREEN}Admin Email:${NC} admin@gardens-net.com"
echo -e "${GREEN}Admin Password:${NC} admin123 (change immediately!)"
echo ""

echo -e "${BLUE}🔧 Troubleshooting:${NC}"
echo ""

echo -e "${CYAN}Check Service Health:${NC}"
echo "docker-compose ps"
echo "docker-compose exec app curl http://localhost:3000/api/health"
echo ""

echo -e "${CYAN}Reset Everything:${NC}"
echo "docker-compose down -v  # Remove volumes (data will be lost!)"
echo "docker-compose up -d"
echo ""

echo -e "${CYAN}Update Single Service:${NC}"
echo "docker-compose up -d --no-deps app  # Update app only"
echo ""

echo -e "${CYAN}Scale Services:${NC}"
echo "docker-compose up -d --scale app=2  # Run 2 app instances"
echo ""

echo -e "${BLUE}📦 Production Deployment:${NC}"
echo ""

echo -e "${CYAN}With Nginx (Production):${NC}"
echo "docker-compose --profile production up -d"
echo ""

echo -e "${CYAN}SSL Certificate Setup:${NC}"
echo "mkdir ssl"
echo "# Copy your SSL certificates to ./ssl/"
echo "# Edit nginx.conf to enable SSL"
echo ""

echo -e "${CYAN}Environment Variables for Production:${NC}"
echo "export BASE_URL=https://your-domain.com"
echo "export NODE_ENV=production"
echo "docker-compose up -d"
echo ""

echo -e "${BLUE}🚀 One-Line Installation:${NC}"
echo ""
echo -e "${YELLOW}curl -fsSL https://raw.githubusercontent.com/your-repo/gardens-net/main/scripts/docker-install.sh | bash${NC}"
echo ""

echo -e "${BLUE}📱 Mobile/Remote Access:${NC}"
echo ""
echo "# Allow external access (be careful with security!)"
echo "docker-compose down"
echo "# Edit docker-compose.yml: change '3000:3000' to '0.0.0.0:3000:3000'"
echo "docker-compose up -d"
echo "# Access via: http://YOUR_SERVER_IP:3000"
echo ""

echo -e "${GREEN}✅ Installation complete! Visit http://localhost:3000 to get started.${NC}"
