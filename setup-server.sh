#!/bin/bash

# Lab Booking System - Automated Server Setup Script
# This script automates the deployment setup process
# Run with: bash setup-server.sh

set -e  # Exit on error

echo "=========================================="
echo "Lab Booking System - Server Setup"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
   echo -e "${RED}Please do not run as root. Use sudo when needed.${NC}"
   exit 1
fi

# Variables
PROJECT_DIR="/var/www/lab-booking"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"
DOMAIN=""
SERVER_IP=""

# Get domain or IP
read -p "Enter your domain name (or press Enter to use IP address): " DOMAIN
if [ -z "$DOMAIN" ]; then
    read -p "Enter your server IP address: " SERVER_IP
    DOMAIN=$SERVER_IP
fi

echo ""
echo -e "${YELLOW}Starting setup...${NC}"
echo ""

# Step 1: Update system
echo -e "${GREEN}[1/10] Updating system packages...${NC}"
sudo apt update && sudo apt upgrade -y

# Step 2: Install Node.js
echo -e "${GREEN}[2/10] Installing Node.js...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "Node.js already installed: $(node --version)"
fi

# Step 3: Install MongoDB
echo -e "${GREEN}[3/10] Installing MongoDB...${NC}"
if ! command -v mongod &> /dev/null; then
    wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
    echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
    sudo apt-get update
    sudo apt-get install -y mongodb-org
    sudo systemctl start mongod
    sudo systemctl enable mongod
else
    echo "MongoDB already installed"
    sudo systemctl start mongod
fi

# Step 4: Install Nginx
echo -e "${GREEN}[4/10] Installing Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    sudo apt install nginx -y
    sudo systemctl start nginx
    sudo systemctl enable nginx
else
    echo "Nginx already installed"
fi

# Step 5: Install PM2
echo -e "${GREEN}[5/10] Installing PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
else
    echo "PM2 already installed: $(pm2 --version)"
fi

# Step 6: Create project directory
echo -e "${GREEN}[6/10] Setting up project directory...${NC}"
sudo mkdir -p $PROJECT_DIR
sudo chown -R $USER:$USER $PROJECT_DIR

# Check if project files exist
if [ ! -d "$BACKEND_DIR" ] || [ ! -d "$FRONTEND_DIR" ]; then
    echo -e "${YELLOW}Warning: Project files not found in $PROJECT_DIR${NC}"
    echo "Please ensure your project files are in:"
    echo "  - $BACKEND_DIR"
    echo "  - $FRONTEND_DIR"
    echo ""
    read -p "Press Enter to continue after uploading files, or Ctrl+C to exit..."
fi

# Step 7: Setup Backend
echo -e "${GREEN}[7/10] Setting up backend...${NC}"
if [ -d "$BACKEND_DIR" ]; then
    cd $BACKEND_DIR
    
    # Install dependencies
    npm install --production
    
    # Create .env if it doesn't exist
    if [ ! -f ".env" ]; then
        echo "Creating backend .env file..."
        cat > .env << EOF
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lab-booking
JWT_SECRET=$(openssl rand -base64 32)
NODE_ENV=production
FRONTEND_URL=http://$DOMAIN
EOF
        echo -e "${GREEN}Backend .env file created${NC}"
    else
        echo "Backend .env file already exists"
    fi
    
    # Start with PM2
    pm2 delete lab-booking-api 2>/dev/null || true
    pm2 start server.js --name lab-booking-api
    pm2 save
    echo -e "${GREEN}Backend started with PM2${NC}"
else
    echo -e "${RED}Backend directory not found!${NC}"
fi

# Step 8: Setup Frontend
echo -e "${GREEN}[8/10] Setting up frontend...${NC}"
if [ -d "$FRONTEND_DIR" ]; then
    cd $FRONTEND_DIR
    
    # Install dependencies
    npm install
    
    # Create .env if it doesn't exist
    if [ ! -f ".env" ]; then
        echo "Creating frontend .env file..."
        cat > .env << EOF
VITE_API_URL=http://$DOMAIN/api
EOF
        echo -e "${GREEN}Frontend .env file created${NC}"
    else
        echo "Frontend .env file already exists"
    fi
    
    # Build frontend
    npm run build
    echo -e "${GREEN}Frontend built successfully${NC}"
else
    echo -e "${RED}Frontend directory not found!${NC}"
fi

# Step 9: Configure Nginx
echo -e "${GREEN}[9/10] Configuring Nginx...${NC}"
sudo tee /etc/nginx/sites-available/lab-booking > /dev/null << EOF
server {
    listen 80;
    server_name $DOMAIN;

    client_max_body_size 10M;

    # Frontend
    location / {
        root $FRONTEND_DIR/dist;
        index index.html;
        try_files \$uri \$uri/ /index.html;
        
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)\$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/lab-booking /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and restart Nginx
if sudo nginx -t; then
    sudo systemctl restart nginx
    echo -e "${GREEN}Nginx configured and restarted${NC}"
else
    echo -e "${RED}Nginx configuration test failed!${NC}"
    exit 1
fi

# Step 10: Configure Firewall
echo -e "${GREEN}[10/10] Configuring firewall...${NC}"
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
echo "y" | sudo ufw enable
echo -e "${GREEN}Firewall configured${NC}"

# Setup PM2 startup
echo ""
echo -e "${YELLOW}Setting up PM2 startup...${NC}"
pm2 startup | grep "sudo" | bash || true

echo ""
echo "=========================================="
echo -e "${GREEN}Setup Complete!${NC}"
echo "=========================================="
echo ""
echo "Your application should be accessible at:"
echo -e "${GREEN}http://$DOMAIN${NC}"
echo ""
echo "Useful commands:"
echo "  - View backend logs: pm2 logs lab-booking-api"
echo "  - Restart backend: pm2 restart lab-booking-api"
echo "  - Restart Nginx: sudo systemctl restart nginx"
echo "  - Check services: pm2 status && sudo systemctl status nginx"
echo ""
echo "To setup SSL certificate (if you have a domain):"
echo "  sudo apt install certbot python3-certbot-nginx -y"
echo "  sudo certbot --nginx -d $DOMAIN"
echo ""

