# 🌐 GARDENS-NET E-commerce

**Complete MikroTik Hotspot Management & E-commerce Solution**

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/nichies-projects/v0-gardens-net-e-commerce)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/Ur2jNInLFyL)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue?style=for-the-badge&logo=docker)](https://hub.docker.com/r/gardens-net/ecommerce)
[![CasaOS](https://img.shields.io/badge/CasaOS-Compatible-green?style=for-the-badge)](https://casaos.io)

---

## 🚀 **Quick Installation**

### **⚡ CasaOS (Recommended - One Click)**
\`\`\`bash
# Method 1: CasaOS App Store
# Go to CasaOS → App Store → Search "GARDENS-NET" → Install

# Method 2: One-Line Installer
curl -fsSL https://install.gardens-net.com/casaos | bash
\`\`\`

### **🐳 Docker (Universal)**
\`\`\`bash
# Quick Start
curl -fsSL https://install.gardens-net.com/docker | bash

# Or Manual
git clone https://github.com/gardens-net/ecommerce.git
cd ecommerce
docker-compose up -d
\`\`\`

### **📦 Manual Installation**
\`\`\`bash
# Clone repository
git clone https://github.com/gardens-net/ecommerce.git
cd ecommerce

# Install dependencies
npm install

# Configure environment
cp .env.example .env
nano .env

# Start development server
npm run dev
\`\`\`

---

## 🎯 **Features**

### **🏪 E-commerce Platform**
- 🛒 **Product Management** - Complete inventory system
- 💳 **Payment Integration** - Multiple payment gateways
- 📱 **Mobile Responsive** - Works on all devices
- 🎨 **Modern UI/UX** - Beautiful, intuitive interface

### **🌐 MikroTik Integration**
- 🎫 **Voucher Generation** - Automated hotspot vouchers
- 📊 **User Management** - Complete user control
- 📈 **Analytics Dashboard** - Real-time statistics
- 🔧 **Router Management** - Multiple router support

### **📱 WhatsApp Integration**
- 💬 **Auto Delivery** - Instant voucher delivery
- 📋 **Professional Templates** - Branded messages
- 📊 **Delivery Tracking** - Message status monitoring
- 🎨 **Custom Branding** - Your business identity

### **⚙️ Admin Features**
- 👥 **User Management** - Complete user control
- 📊 **Analytics** - Comprehensive reporting
- 🔧 **System Settings** - Full configuration control
- 🔐 **Security** - Role-based access control

---

## 📋 **Requirements**

### **Minimum System Requirements**
- **RAM:** 2GB minimum, 4GB recommended
- **Storage:** 5GB free space
- **CPU:** 2 cores minimum
- **Network:** Internet connection required

### **Software Requirements**
- **Docker:** 20.10+ (for Docker installation)
- **Docker Compose:** 2.0+ (for Docker installation)
- **Node.js:** 18+ (for manual installation)
- **PostgreSQL:** 13+ (for manual installation)

### **Network Requirements**
- **Ports:** 3000 (web), 5432 (database), 6379 (redis)
- **MikroTik Access:** API port 8728/8729 (SSL)
- **Internet:** For WhatsApp API and updates

---

## 🔧 **Installation Methods**

### **🏠 CasaOS Installation (Easiest)**

#### **Method 1: App Store (Recommended)**
1. Open **CasaOS Dashboard**
2. Go to **App Store**
3. Search **"GARDENS-NET"**
4. Click **"Install"**
5. Wait for installation to complete
6. Access at `http://your-casaos-ip:3000`

#### **Method 2: One-Line Command**
\`\`\`bash
# SSH to your CasaOS server
ssh user@your-casaos-ip

# Run installer
curl -fsSL https://install.gardens-net.com/casaos | bash

# Follow the prompts
\`\`\`

#### **Method 3: Manual CasaOS**
\`\`\`bash
# Create app directory
mkdir -p /DATA/AppData/gardens-net
cd /DATA/AppData/gardens-net

# Download configuration
wget https://raw.githubusercontent.com/gardens-net/ecommerce/main/casaos-docker-compose.yml
mv casaos-docker-compose.yml docker-compose.yml

# Download environment template
wget https://raw.githubusercontent.com/gardens-net/ecommerce/main/.env.casaos
mv .env.casaos .env

# Start services
docker-compose up -d

# Check status
docker-compose ps
\`\`\`

---

### **🐳 Docker Installation**

#### **Method 1: Quick Installer**
\`\`\`bash
curl -fsSL https://install.gardens-net.com/docker | bash
\`\`\`

#### **Method 2: Docker Compose**
\`\`\`bash
# Create project directory
mkdir gardens-net && cd gardens-net

# Download docker-compose.yml
curl -O https://raw.githubusercontent.com/gardens-net/ecommerce/main/docker-compose.yml

# Download environment template
curl -O https://raw.githubusercontent.com/gardens-net/ecommerce/main/.env.example
cp .env.example .env

# Edit configuration
nano .env

# Start services
docker-compose up -d

# Check logs
docker-compose logs -f
\`\`\`

#### **Method 3: Docker Run**
\`\`\`bash
# Start PostgreSQL
docker run -d --name gardens-postgres \
  -e POSTGRES_DB=gardens_net \
  -e POSTGRES_USER=gardens_user \
  -e POSTGRES_PASSWORD=gardens_secure_password_2024 \
  -v gardens_postgres_data:/var/lib/postgresql/data \
  -p 5432:5432 \
  postgres:15

# Start Redis
docker run -d --name gardens-redis \
  -v gardens_redis_data:/data \
  -p 6379:6379 \
  redis:7-alpine

# Start Application
docker run -d --name gardens-app \
  -e DATABASE_URL=postgresql://gardens_user:gardens_secure_password_2024@host.docker.internal:5432/gardens_net \
  -e REDIS_URL=redis://host.docker.internal:6379 \
  -p 3000:3000 \
  gardens-net/ecommerce:latest
\`\`\`

---

### **📦 Manual Installation**

#### **Prerequisites**
\`\`\`bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# Install Redis
sudo apt-get install redis-server
\`\`\`

#### **Application Setup**
\`\`\`bash
# Clone repository
git clone https://github.com/gardens-net/ecommerce.git
cd ecommerce

# Install dependencies
npm install

# Setup database
sudo -u postgres createuser gardens_user
sudo -u postgres createdb gardens_net
sudo -u postgres psql -c "ALTER USER gardens_user PASSWORD 'gardens_secure_password_2024';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE gardens_net TO gardens_user;"

# Initialize database
psql -h localhost -U gardens_user -d gardens_net -f scripts/init-db.sql

# Configure environment
cp .env.example .env
nano .env  # Edit with your settings

# Build application
npm run build

# Start application
npm start
\`\`\`

---

## ⚙️ **Configuration**

### **Environment Variables**
\`\`\`bash
# Application
NODE_ENV=production
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://gardens_user:gardens_secure_password_2024@localhost:5432/gardens_net

# MikroTik Configuration
MIKROTIK_HOST=192.168.1.1
MIKROTIK_USERNAME=admin
MIKROTIK_PASSWORD=your-mikrotik-password
MIKROTIK_PORT=8728
MIKROTIK_SSL_ENABLED=false

# WhatsApp Business API
WHATSAPP_ACCESS_TOKEN=your-whatsapp-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_BUSINESS_ACCOUNT_ID=your-business-account-id
WHATSAPP_APP_ID=your-app-id
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your-webhook-verify-token

# MikPos Integration
MIKPOS_BASE_URL=http://localhost:3000
MIKPOS_WEBHOOK_URL=http://localhost:3000/api/mikpos/webhook
MIKPOS_WEBHOOK_SECRET=mikpos-webhook-secret-2024
MIKPOS_API_KEY=your-mikpos-api-key
\`\`\`

### **First Time Setup**
1. **Access Application:** `http://localhost:3000`
2. **Login as Admin:** 
   - Email: `admin@gardens-net.com`
   - Password: `admin123` ⚠️ **Change immediately!**
3. **Configure MikroTik:** Go to Settings → MikroTik
4. **Setup WhatsApp:** Go to Settings → WhatsApp Integration
5. **Add Products:** Go to Admin → Products

---

## 🔍 **Access Information**

### **Application URLs**
- **🏠 Main Application:** `http://localhost:3000`
- **👤 Admin Panel:** `http://localhost:3000/admin`
- **📊 MikPos Dashboard:** `http://localhost:3000/mikpos/dashboard`
- **🛒 Customer Portal:** `http://localhost:3000/customer`
- **⚙️ Settings:** `http://localhost:3000/admin/settings`

### **Default Credentials**
- **📧 Admin Email:** `admin@gardens-net.com`
- **🔑 Admin Password:** `admin123` ⚠️ **Change immediately!**

### **Database Access**
- **🌐 Host:** `localhost:5432`
- **📊 Database:** `gardens_net`
- **👤 Username:** `gardens_user`
- **🔑 Password:** `gardens_secure_password_2024`

---

## 🛠️ **Management Commands**

### **Docker Management**
\`\`\`bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart services
docker-compose restart

# View logs
docker-compose logs -f

# Update to latest version
docker-compose pull
docker-compose up -d

# Backup database
docker-compose exec postgres pg_dump -U gardens_user gardens_net > backup.sql

# Restore database
docker-compose exec -T postgres psql -U gardens_user gardens_net < backup.sql
\`\`\`

### **Application Management**
\`\`\`bash
# Development mode
npm run dev

# Production build
npm run build
npm start

# Database migration
npm run db:migrate

# Seed database
npm run db:seed

# Run tests
npm test
\`\`\`

---

## 🚨 **Troubleshooting**

### **Common Issues**

#### **Port Already in Use**
\`\`\`bash
# Check what's using port 3000
sudo netstat -tulpn | grep :3000

# Kill process using port
sudo kill -9 $(sudo lsof -t -i:3000)

# Or change port in docker-compose.yml
ports:
  - "3001:3000"
\`\`\`

#### **Database Connection Failed**
\`\`\`bash
# Check database status
docker-compose ps postgres

# Restart database
docker-compose restart postgres

# Check database logs
docker-compose logs postgres

# Reset database (⚠️ This deletes all data!)
docker-compose down -v
docker-compose up -d
\`\`\`

#### **Memory Issues**
\`\`\`bash
# Check memory usage
free -h
docker stats

# Reduce memory limits in docker-compose.yml
deploy:
  resources:
    limits:
      memory: 512M
\`\`\`

#### **WhatsApp Integration Issues**
\`\`\`bash
# Test WhatsApp connection
curl -X POST http://localhost:3000/api/whatsapp/test

# Check WhatsApp logs
docker-compose logs app | grep whatsapp

# Verify environment variables
docker-compose exec app env | grep WHATSAPP
\`\`\`

### **Diagnostic Tools**
\`\`\`bash
# Run comprehensive diagnostics
./scripts/casaos-troubleshoot.sh

# Check application health
curl http://localhost:3000/api/health

# View detailed logs
docker-compose logs --tail=100 app
\`\`\`

---

## 📚 **Documentation**

### **API Documentation**
- **📖 API Docs:** `http://localhost:3000/api/docs`
- **🔧 Admin API:** `http://localhost:3000/api/admin`
- **📱 WhatsApp API:** `http://localhost:3000/api/whatsapp`
- **🌐 MikroTik API:** `http://localhost:3000/api/mikrotik`

### **User Guides**
- **👤 Admin Guide:** [docs/admin-guide.md](docs/admin-guide.md)
- **🛒 Customer Guide:** [docs/customer-guide.md](docs/customer-guide.md)
- **🔧 Developer Guide:** [docs/developer-guide.md](docs/developer-guide.md)
- **📱 WhatsApp Setup:** [docs/whatsapp-setup.md](docs/whatsapp-setup.md)

---

## 🤝 **Support**

### **Community Support**
- **💬 Discord:** [Join our Discord](https://discord.gg/gardens-net)
- **📧 Email:** support@gardens-net.com
- **🐛 Issues:** [GitHub Issues](https://github.com/gardens-net/ecommerce/issues)
- **📖 Wiki:** [GitHub Wiki](https://github.com/gardens-net/ecommerce/wiki)

### **Professional Support**
- **🏢 Enterprise Support:** enterprise@gardens-net.com
- **🔧 Custom Development:** dev@gardens-net.com
- **📞 Phone Support:** +62-xxx-xxxx-xxxx

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 **Acknowledgments**

- **MikroTik** - For the excellent RouterOS API
- **WhatsApp Business** - For the messaging platform
- **CasaOS** - For the amazing home server platform
- **Docker** - For containerization technology
- **Next.js** - For the amazing React framework

---

**Made with ❤️ by GARDENS-NET Team**

*Automatically synced with your [v0.dev](https://v0.dev) deployments*
