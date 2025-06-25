#!/bin/bash

# GARDENS-NET E-commerce Docker Installation Script
# ================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_header() {
    echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${NC} ${CYAN}$1${NC} ${BLUE}║${NC}"
    echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
}

print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[⚠]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_info() {
    echo -e "${CYAN}[ℹ]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed!"
        echo ""
        print_info "Please install Docker first:"
        echo "  Ubuntu/Debian: curl -fsSL https://get.docker.com | sh"
        echo "  CentOS/RHEL:   curl -fsSL https://get.docker.com | sh"
        echo "  Windows:       Download Docker Desktop"
        echo "  macOS:         Download Docker Desktop"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_warning "Docker Compose not found, using 'docker compose' instead"
        DOCKER_COMPOSE="docker compose"
    else
        DOCKER_COMPOSE="docker-compose"
    fi
}

# Create project directory
create_project_dir() {
    print_header "Creating Project Directory"
    
    read -p "Enter installation directory [./gardens-net]: " INSTALL_DIR
    INSTALL_DIR=${INSTALL_DIR:-./gardens-net}
    
    if [ -d "$INSTALL_DIR" ]; then
        print_warning "Directory $INSTALL_DIR already exists"
        read -p "Continue? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    else
        mkdir -p "$INSTALL_DIR"
        print_status "Created directory: $INSTALL_DIR"
    fi
    
    cd "$INSTALL_DIR"
}

# Generate environment file
generate_env() {
    print_header "Generating Environment Configuration"
    
    cat > .env << 'EOF'
# GARDENS-NET E-commerce Configuration
# ===================================

# Database Configuration
DB_PASSWORD=gardens_secure_password_2024
POSTGRES_DB=gardens_net
POSTGRES_USER=gardens_user
POSTGRES_PASSWORD=gardens_secure_password_2024

# Redis Configuration  
REDIS_PASSWORD=redis_secure_password_2024

# Application Settings
BASE_URL=http://localhost:3000
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NODE_ENV=production
NEXTAUTH_SECRET=your-nextauth-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Database URL
DATABASE_URL=postgresql://gardens_user:gardens_secure_password_2024@postgres:5432/gardens_net

# Redis URL
REDIS_URL=redis://:redis_secure_password_2024@redis:6379

# MikPos Integration
MIKPOS_BASE_URL=http://192.168.1.100:8080
MIKPOS_API_KEY=your-mikpos-api-key
MIKPOS_WEBHOOK_URL=http://localhost:3000/api/mikpos/webhook
MIKPOS_WEBHOOK_SECRET=mikpos-webhook-secret-key
MIKPOS_SYNC_ENABLED=true
MIKPOS_AUTO_SYNC=true
MIKPOS_SYNC_INTERVAL=300

# WhatsApp Business API
WHATSAPP_ACCESS_TOKEN=your-whatsapp-access-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_WEBHOOK_VERIFY_TOKEN=whatsapp-verify-token
WHATSAPP_BUSINESS_ACCOUNT_ID=your-business-account-id
WHATSAPP_APP_ID=your-app-id
WHATSAPP_ENABLED=true

# MikroTik RouterOS API
MIKROTIK_HOST=192.168.1.1
MIKROTIK_USERNAME=admin
MIKROTIK_PASSWORD=your-mikrotik-password
MIKROTIK_PORT=8728
MIKROTIK_SSL_ENABLED=false

# Security
JWT_SECRET=your-jwt-secret-key-here
ENCRYPTION_KEY=your-encryption-key-here

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EOF

    print_status "Environment file created: .env"
    print_warning "Please edit .env file with your actual configuration values"
}

# Create Docker Compose file
create_docker_compose() {
    print_header "Creating Docker Compose Configuration"
    
    cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: gardens-net-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-db.sql:/docker-entrypoint-initdb.d/init-db.sql
    ports:
      - "5432:5432"
    networks:
      - gardens-net
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Redis for caching and sessions
  redis:
    image: redis:7-alpine
    container_name: gardens-net-redis
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    networks:
      - gardens-net
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Main Application
  app:
    image: nichiesdev/gardens-net-ecommerce:latest
    container_name: gardens-net-app
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL}
      - NODE_ENV=${NODE_ENV}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - MIKPOS_BASE_URL=${MIKPOS_BASE_URL}
      - MIKPOS_API_KEY=${MIKPOS_API_KEY}
      - MIKPOS_WEBHOOK_URL=${MIKPOS_WEBHOOK_URL}
      - MIKPOS_WEBHOOK_SECRET=${MIKPOS_WEBHOOK_SECRET}
      - MIKPOS_SYNC_ENABLED=${MIKPOS_SYNC_ENABLED}
      - MIKPOS_AUTO_SYNC=${MIKPOS_AUTO_SYNC}
      - MIKPOS_SYNC_INTERVAL=${MIKPOS_SYNC_INTERVAL}
      - WHATSAPP_ACCESS_TOKEN=${WHATSAPP_ACCESS_TOKEN}
      - WHATSAPP_PHONE_NUMBER_ID=${WHATSAPP_PHONE_NUMBER_ID}
      - WHATSAPP_WEBHOOK_VERIFY_TOKEN=${WHATSAPP_WEBHOOK_VERIFY_TOKEN}
      - WHATSAPP_BUSINESS_ACCOUNT_ID=${WHATSAPP_BUSINESS_ACCOUNT_ID}
      - WHATSAPP_APP_ID=${WHATSAPP_APP_ID}
      - WHATSAPP_ENABLED=${WHATSAPP_ENABLED}
      - MIKROTIK_HOST=${MIKROTIK_HOST}
      - MIKROTIK_USERNAME=${MIKROTIK_USERNAME}
      - MIKROTIK_PASSWORD=${MIKROTIK_PASSWORD}
      - MIKROTIK_PORT=${MIKROTIK_PORT}
      - MIKROTIK_SSL_ENABLED=${MIKROTIK_SSL_ENABLED}
      - JWT_SECRET=${JWT_SECRET}
      - ENCRYPTION_KEY=${ENCRYPTION_KEY}
    ports:
      - "3000:3000"
    volumes:
      - app_uploads:/app/public/uploads
      - app_logs:/app/logs
    networks:
      - gardens-net
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Nginx Reverse Proxy (Optional)
  nginx:
    image: nginx:alpine
    container_name: gardens-net-nginx
    restart: unless-stopped
    depends_on:
      - app
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
      - nginx_logs:/var/log/nginx
    networks:
      - gardens-net
    profiles:
      - production

volumes:
  postgres_data:
  redis_data:
  app_uploads:
  app_logs:
  nginx_logs:

networks:
  gardens-net:
    driver: bridge
EOF

    print_status "Docker Compose file created: docker-compose.yml"
}

# Create database initialization script
create_init_db() {
    print_header "Creating Database Initialization Script"
    
    cat > init-db.sql << 'EOF'
-- GARDENS-NET E-COMMERCE DATABASE INITIALIZATION
-- ===============================================

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock INTEGER DEFAULT 0,
    category VARCHAR(100),
    image_url VARCHAR(500),
    mikpos_id VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    sync_enabled BOOLEAN DEFAULT true,
    last_synced TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    payment_method VARCHAR(50),
    payment_status VARCHAR(50) DEFAULT 'pending',
    mikpos_session_id VARCHAR(255),
    voucher_code VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- MikroTik routers table
CREATE TABLE IF NOT EXISTS mikrotik_routers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    host VARCHAR(255) NOT NULL UNIQUE,
    port INTEGER DEFAULT 8728,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    ssl_enabled BOOLEAN DEFAULT false,
    is_primary BOOLEAN DEFAULT false,
    location VARCHAR(255),
    description TEXT,
    status VARCHAR(50) DEFAULT 'unknown',
    last_check TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sync logs table
CREATE TABLE IF NOT EXISTS sync_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id),
    action VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    error_message TEXT,
    mikpos_response JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user
INSERT INTO users (email, password_hash, name, role) 
VALUES (
    'admin@gardens-net.com', 
    '$2b$10$rQZ8qVZ8qVZ8qVZ8qVZ8qO', -- Change this password hash
    'Administrator', 
    'admin'
) ON CONFLICT (email) DO NOTHING;

-- Insert sample products
INSERT INTO products (name, description, price, stock, category, mikpos_id) VALUES
    ('Daily 1 Hari', 'Paket internet harian 1 hari unlimited', 15000, 100, 'daily', 'daily_1d'),
    ('Daily 3 Hari', 'Paket internet harian 3 hari unlimited', 40000, 100, 'daily', 'daily_3d'),
    ('Weekly 1 Minggu', 'Paket internet mingguan 1 minggu unlimited', 75000, 50, 'weekly', 'weekly_1w'),
    ('Monthly 1 Bulan', 'Paket internet bulanan 1 bulan unlimited', 250000, 30, 'monthly', 'monthly_1m')
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_mikpos_id ON products(mikpos_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_sync_logs_product_id ON sync_logs(product_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_created_at ON sync_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_mikrotik_routers_host ON mikrotik_routers(host);
CREATE INDEX IF NOT EXISTS idx_mikrotik_routers_primary ON mikrotik_routers(is_primary);

-- Update timestamps trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mikrotik_routers_updated_at BEFORE UPDATE ON mikrotik_routers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EOF

    print_status "Database initialization script created: init-db.sql"
}

# Create nginx configuration
create_nginx_config() {
    print_header "Creating Nginx Configuration"
    
    cat > nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    upstream app {
        server app:3000;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;

    server {
        listen 80;
        server_name _;
        
        # For Let's Encrypt challenges
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }
        
        # Redirect HTTP to HTTPS (uncomment for production)
        # return 301 https://$host$request_uri;
        
        # For development, proxy directly
        location / {
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # WebSocket support
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
        }
    }

    server {
        listen 443 ssl http2;
        server_name your-domain.com;

        # SSL Configuration (uncomment and configure for production)
        # ssl_certificate /etc/nginx/ssl/cert.pem;
        # ssl_certificate_key /etc/nginx/ssl/key.pem;
        # ssl_protocols TLSv1.2 TLSv1.3;
        # ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
        # ssl_prefer_server_ciphers off;

        # Security Headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        # add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";

        # Gzip Compression
        gzip on;
        gzip_vary on;
        gzip_min_length 1024;
        gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

        # Rate limiting for API endpoints
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Rate limiting for login
        location /admin/login {
            limit_req zone=login burst=5 nodelay;
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Main application
        location / {
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # WebSocket support
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
        }

        # Static files caching
        location /_next/static/ {
            proxy_pass http://app;
            proxy_cache_valid 200 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
EOF

    print_status "Nginx configuration created: nginx.conf"
}

# Create management scripts
create_management_scripts() {
    print_header "Creating Management Scripts"
    
    # Start script
    cat > start.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting GARDENS-NET E-commerce..."
docker-compose up -d
echo "✅ Services started!"
echo "📱 Application: http://localhost:3000"
echo "🗄️  Database: localhost:5432"
echo "🔴 Redis: localhost:6379"
EOF

    # Stop script
    cat > stop.sh << 'EOF'
#!/bin/bash
echo "🛑 Stopping GARDENS-NET E-commerce..."
docker-compose down
echo "✅ Services stopped!"
EOF

    # Restart script
    cat > restart.sh << 'EOF'
#!/bin/bash
echo "🔄 Restarting GARDENS-NET E-commerce..."
docker-compose restart
echo "✅ Services restarted!"
EOF

    # Update script
    cat > update.sh << 'EOF'
#!/bin/bash
echo "📦 Updating GARDENS-NET E-commerce..."
docker-compose pull
docker-compose up -d
echo "✅ Update completed!"
EOF

    # Logs script
    cat > logs.sh << 'EOF'
#!/bin/bash
if [ -z "$1" ]; then
    echo "📋 Showing all logs..."
    docker-compose logs -f
else
    echo "📋 Showing logs for: $1"
    docker-compose logs -f "$1"
fi
EOF

    # Backup script
    cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "💾 Creating backup..."
docker-compose exec postgres pg_dump -U gardens_user gardens_net > "$BACKUP_DIR/database.sql"
cp .env "$BACKUP_DIR/"
cp docker-compose.yml "$BACKUP_DIR/"

echo "✅ Backup created: $BACKUP_DIR"
EOF

    # Status script
    cat > status.sh << 'EOF'
#!/bin/bash
echo "📊 GARDENS-NET E-commerce Status"
echo "================================"
docker-compose ps
echo ""
echo "🔍 Health Checks:"
docker-compose exec app curl -s http://localhost:3000/api/health | jq '.' 2>/dev/null || echo "App health check failed"
EOF

    chmod +x *.sh
    print_status "Management scripts created and made executable"
}

# Install application
install_app() {
    print_header "Installing GARDENS-NET E-commerce"
    
    print_info "Pulling Docker images..."
    $DOCKER_COMPOSE pull
    
    print_info "Starting services..."
    $DOCKER_COMPOSE up -d postgres redis
    
    print_info "Waiting for database to be ready..."
    sleep 10
    
    print_info "Starting application..."
    $DOCKER_COMPOSE up -d app
    
    print_info "Waiting for application to start..."
    sleep 15
    
    # Check if services are running
    if $DOCKER_COMPOSE ps | grep -q "Up"; then
        print_status "Installation completed successfully!"
        echo ""
        print_info "🌐 Application URL: http://localhost:3000"
        print_info "👤 Admin Login: admin@gardens-net.com"
        print_info "🔑 Default Password: admin123 (change immediately!)"
        echo ""
        print_info "📋 Management Commands:"
        echo "  ./start.sh    - Start services"
        echo "  ./stop.sh     - Stop services"
        echo "  ./restart.sh  - Restart services"
        echo "  ./update.sh   - Update application"
        echo "  ./logs.sh     - View logs"
        echo "  ./status.sh   - Check status"
        echo "  ./backup.sh   - Create backup"
    else
        print_error "Installation failed! Check logs with: $DOCKER_COMPOSE logs"
        exit 1
    fi
}

# Main installation process
main() {
    print_header "GARDENS-NET E-commerce Docker Installation"
    echo ""
    print_info "This script will install GARDENS-NET E-commerce using Docker"
    echo ""
    
    check_docker
    create_project_dir
    generate_env
    create_docker_compose
    create_init_db
    create_nginx_config
    create_management_scripts
    
    echo ""
    read -p "Proceed with installation? (Y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Nn]$ ]]; then
        print_warning "Installation cancelled"
        exit 0
    fi
    
    install_app
    
    print_header "Installation Complete!"
    print_status "GARDENS-NET E-commerce is now running!"
    echo ""
    print_warning "Next Steps:"
    echo "1. Edit .env file with your actual configuration"
    echo "2. Configure MikPos integration"
    echo "3. Setup WhatsApp Business API"
    echo "4. Add MikroTik routers"
    echo "5. Change default admin password"
    echo ""
    print_info "Documentation: https://github.com/your-repo/gardens-net"
    print_info "Support: support@gardens-net.com"
}

# Run main function
main "$@"
