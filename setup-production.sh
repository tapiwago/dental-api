#!/bin/bash

# Production deployment script for Dental API with SSL
# Run this script on your Ubuntu server

set -e

echo "🚀 Setting up Dental API Production Environment"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get domain name
read -p "Enter your domain name (e.g., api.yourdomain.com): " DOMAIN_NAME
read -p "Enter your email for SSL certificate: " EMAIL

echo -e "${YELLOW}Domain: $DOMAIN_NAME${NC}"
echo -e "${YELLOW}Email: $EMAIL${NC}"

# Update system
echo -e "${GREEN}📦 Updating system packages...${NC}"
sudo apt update && sudo apt upgrade -y

# Install required packages
echo -e "${GREEN}📦 Installing required packages...${NC}"
sudo apt install -y nginx certbot python3-certbot-nginx ufw

# Configure firewall
echo -e "${GREEN}🔥 Configuring firewall...${NC}"
sudo ufw --force enable
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw allow 5000  # API port
sudo ufw allow 3000  # Frontend port

# Stop Nginx temporarily for certificate generation
sudo systemctl stop nginx

# Generate SSL certificate
echo -e "${GREEN}🔒 Generating SSL certificate with Let's Encrypt...${NC}"
sudo certbot certonly --standalone --agree-tos --no-eff-email --email $EMAIL -d $DOMAIN_NAME

# Create Nginx configuration
echo -e "${GREEN}⚙️ Setting up Nginx configuration...${NC}"
sudo tee /etc/nginx/sites-available/dental-api > /dev/null <<EOF
# Nginx configuration for Dental API with SSL
server {
    listen 80;
    server_name $DOMAIN_NAME;
    
    # Redirect all HTTP traffic to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN_NAME;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN_NAME/privkey.pem;
    
    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Rate limiting
    limit_req_zone \$binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req_zone \$binary_remote_addr zone=login_limit:10m rate=5r/m;
    
    # Proxy settings for API
    location /api {
        limit_req zone=api_limit burst=20 nodelay;
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # CORS headers (as backup)
        add_header Access-Control-Allow-Origin \$http_origin;
        add_header Access-Control-Allow-Credentials true;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        add_header Access-Control-Allow-Headers "Accept, Authorization, Cache-Control, Content-Type, DNT, If-Modified-Since, Keep-Alive, Origin, User-Agent, X-Requested-With";
    }
    
    # Health check endpoint
    location /health {
        proxy_pass http://localhost:5000/health;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # API Documentation
    location /api-docs {
        proxy_pass http://localhost:5000/api-docs;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Frontend (if serving from same domain)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        proxy_pass http://localhost:3000;
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/dental-api /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
echo -e "${GREEN}🧪 Testing Nginx configuration...${NC}"
sudo nginx -t

# Start and enable services
echo -e "${GREEN}🏃 Starting services...${NC}"
sudo systemctl start nginx
sudo systemctl enable nginx

# Setup automatic certificate renewal
echo -e "${GREEN}🔄 Setting up automatic SSL certificate renewal...${NC}"
(sudo crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | sudo crontab -

# Create PM2 startup script
echo -e "${GREEN}📜 Creating PM2 startup configuration...${NC}"
sudo npm install -g pm2

# Setup log rotation
sudo tee /etc/logrotate.d/dental-api > /dev/null <<EOF
/root/dental-api/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 root root
    postrotate
        pm2 reloadLogs
    endscript
}
EOF

echo -e "${GREEN}✅ Production setup complete!${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Update your frontend API URL to: https://$DOMAIN_NAME/api"
echo "2. Start your API with PM2: pm2 start ecosystem.config.js"
echo "3. Save PM2 configuration: pm2 save && pm2 startup"
echo "4. Test your API: https://$DOMAIN_NAME/health"
echo "5. API Documentation: https://$DOMAIN_NAME/api-docs"

echo -e "${GREEN}🎉 Your Dental API is now production-ready with SSL!${NC}"
