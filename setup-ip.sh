#!/bin/bash

# Simple production setup script for IP-based deployment
# Run this script on your Ubuntu server (206.81.11.59)

set -e

echo "🚀 Setting up Dental Intel for IP-based deployment (206.81.11.59)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Update system
echo -e "${GREEN}📦 Updating system packages...${NC}"
sudo apt update && sudo apt upgrade -y

# Install required packages
echo -e "${GREEN}📦 Installing required packages...${NC}"
sudo apt install -y nginx nodejs npm mongodb git curl

# Install PM2 globally
echo -e "${GREEN}📦 Installing PM2...${NC}"
sudo npm install -g pm2

# Create application directory
echo -e "${GREEN}📂 Setting up application directories...${NC}"
mkdir -p /var/www/dental
sudo chown -R $USER:$USER /var/www/dental

# Install Node.js 18+ (if needed)
echo -e "${GREEN}📦 Installing Node.js 18...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Configure Nginx
echo -e "${GREEN}🔧 Configuring Nginx...${NC}"
sudo cp nginx-ip.conf /etc/nginx/sites-available/dental
sudo ln -sf /etc/nginx/sites-available/dental /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Start and enable services
echo -e "${GREEN}🚀 Starting services...${NC}"
sudo systemctl start nginx
sudo systemctl enable nginx
sudo systemctl start mongod
sudo systemctl enable mongod

# Configure firewall
echo -e "${GREEN}🔥 Configuring firewall...${NC}"
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
echo "y" | sudo ufw enable

# Create logs directory
mkdir -p /var/www/dental/logs

echo -e "${GREEN}✅ Basic setup complete!${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Upload your code to /var/www/dental/"
echo "2. Install dependencies: cd /var/www/dental && npm install"
echo "3. Build frontend: cd /var/www/dental && npm run build"
echo "4. Start with PM2: pm2 start ecosystem.config.js"
echo "5. Save PM2 config: pm2 save && pm2 startup"
echo ""
echo -e "${GREEN}Your application will be available at: http://206.81.11.59${NC}"
