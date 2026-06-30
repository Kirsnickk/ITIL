# Deployment Guide - ITIL Asset Management

## 🚀 Deployment Options

### Option 1: Cloud Deployment (AWS)
**Best for**: Scalability, global access, managed services

### Option 2: On-Premise
**Best for**: Data sovereignty, existing infrastructure, cost control

### Option 3: Hybrid
**Best for**: Sensitive data on-premise, public features in cloud

## ☁️ AWS Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         AWS Cloud                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────┐        ┌─────────────────┐            │
│  │   CloudFront    │        │   Route 53      │            │
│  │   (CDN)         │◄───────│   (DNS)         │            │
│  └────────┬────────┘        └─────────────────┘            │
│           │                                                  │
│  ┌────────▼────────┐                                        │
│  │   ALB           │ (Application Load Balancer)            │
│  │   (Load Bal.)   │                                        │
│  └────────┬────────┘                                        │
│           │                                                  │
│  ┌────────▼────────────────────────┐                        │
│  │      ECS / EC2 Cluster          │                        │
│  │  ┌──────────┐  ┌──────────┐    │                        │
│  │  │ Backend  │  │ Backend  │    │                        │
│  │  │ Instance │  │ Instance │    │                        │
│  │  └─────┬────┘  └─────┬────┘    │                        │
│  └────────┼─────────────┼─────────┘                        │
│           │             │                                    │
│  ┌────────▼─────────────▼─────────┐                        │
│  │   RDS PostgreSQL               │                        │
│  │   (Multi-AZ)                   │                        │
│  └────────────────────────────────┘                        │
│                                                               │
│  ┌─────────────────┐   ┌──────────────┐                    │
│  │   S3 Bucket     │   │  ElastiCache │                    │
│  │   (Documents)   │   │  (Redis)     │                    │
│  └─────────────────┘   └──────────────┘                    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### AWS Services Used

**Compute**: 
- ECS (Elastic Container Service) or EC2
- Auto Scaling Group (2-10 instances)

**Database**: 
- RDS PostgreSQL (db.t3.medium, Multi-AZ)
- Automated backups (7-day retention)

**Storage**:
- S3 for documents (Standard tier)
- S3 Lifecycle policy (move to Glacier after 1 year)

**Networking**:
- VPC with public/private subnets
- Security Groups (restrict DB access to backend only)
- NAT Gateway for outbound traffic

**CDN & DNS**:
- CloudFront for frontend assets
- Route 53 for DNS management

**Monitoring**:
- CloudWatch for logs and metrics
- SNS for alerts

### AWS Deployment Steps

#### 1. Setup Infrastructure (Terraform)
```hcl
# terraform/main.tf
provider "aws" {
  region = "ap-southeast-1"
}

# VPC
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
  
  tags = {
    Name = "itil-asset-mgmt-vpc"
  }
}

# RDS PostgreSQL
resource "aws_db_instance" "postgres" {
  identifier = "itil-asset-mgmt-db"
  engine     = "postgres"
  engine_version = "15.4"
  instance_class = "db.t3.medium"
  
  allocated_storage     = 100
  storage_type         = "gp3"
  multi_az             = true
  
  db_name  = "itil_asset_mgmt"
  username = "admin"
  password = var.db_password
  
  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  
  skip_final_snapshot = false
  final_snapshot_identifier = "itil-final-snapshot"
}

# S3 Bucket for documents
resource "aws_s3_bucket" "documents" {
  bucket = "itil-asset-mgmt-docs"
  
  tags = {
    Name = "ITIL Asset Documents"
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "itil-asset-mgmt-cluster"
}
```

#### 2. Deploy Backend to ECS
```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .

EXPOSE 4000

CMD ["node", "src/app.js"]
```

```yaml
# docker-compose.yml (for local testing)
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "4000:4000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/itil_asset_mgmt
      - JWT_SECRET=${JWT_SECRET}
      - AWS_REGION=ap-southeast-1
    depends_on:
      - db
  
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: itil_asset_mgmt
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

#### 3. Deploy Frontend to S3 + CloudFront
```bash
# Build frontend
cd frontend
npm run build

# Deploy to S3
aws s3 sync dist/ s3://itil-asset-mgmt-frontend --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id E1234567890ABC \
  --paths "/*"
```

---

## 🖥️ On-Premise Deployment

### Server Requirements

**Application Server**:
- CPU: 4 cores
- RAM: 8GB
- Storage: 100GB SSD
- OS: Ubuntu 22.04 LTS

**Database Server**:
- CPU: 4 cores
- RAM: 16GB
- Storage: 500GB SSD (RAID 10)
- OS: Ubuntu 22.04 LTS

### Installation Steps

#### 1. Setup Database Server
```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql-15 postgresql-contrib

# Configure PostgreSQL
sudo nano /etc/postgresql/15/main/postgresql.conf
# Edit:
# listen_addresses = '*'
# max_connections = 100
# shared_buffers = 4GB

# Allow remote connections
sudo nano /etc/postgresql/15/main/pg_hba.conf
# Add:
# host    itil_asset_mgmt    app_user    10.0.0.0/24    md5

# Restart
sudo systemctl restart postgresql

# Create database and user
sudo -u postgres psql
CREATE DATABASE itil_asset_mgmt;
CREATE USER app_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE itil_asset_mgmt TO app_user;
```

#### 2. Setup Application Server
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs

# Install Nginx
sudo apt install nginx

# Clone application
git clone https://github.com/company/itil-asset-mgmt.git
cd itil-asset-mgmt/backend

# Install dependencies
npm ci --production

# Configure environment
cp .env.example .env
nano .env
# Edit:
# DATABASE_URL=postgresql://app_user:secure_password@db-server:5432/itil_asset_mgmt
# JWT_SECRET=generate_random_secret
# PORT=4000

# Install PM2 for process management
sudo npm install -g pm2

# Start application
pm2 start src/app.js --name itil-backend
pm2 save
pm2 startup
```

#### 3. Configure Nginx
```nginx
# /etc/nginx/sites-available/itil-asset-mgmt
server {
    listen 80;
    server_name itil.company.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name itil.company.com;
    
    ssl_certificate /etc/ssl/certs/itil.crt;
    ssl_certificate_key /etc/ssl/private/itil.key;
    
    # Frontend (static files)
    location / {
        root /var/www/itil-frontend;
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:4000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    
    # File uploads (increase size limit)
    client_max_body_size 50M;
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/itil-asset-mgmt /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔐 Security Hardening

### SSL/TLS Setup
```bash
# Get Let's Encrypt certificate
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d itil.company.com
```

### Firewall Configuration
```bash
# UFW firewall
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

### Database Security
```sql
-- Revoke public schema access
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO app_user;

-- Create read-only user for reporting
CREATE USER readonly_user WITH PASSWORD 'readonly_pass';
GRANT CONNECT ON DATABASE itil_asset_mgmt TO readonly_user;
GRANT USAGE ON SCHEMA public TO readonly_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;
```

---

## 📊 Monitoring Setup

### Application Monitoring
```javascript
// backend/src/middleware/monitoring.js
const prometheus = require('prom-client');

// Metrics
const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
});

const dbQueryDuration = new prometheus.Histogram({
  name: 'db_query_duration_seconds',
  help: 'Duration of database queries',
  labelNames: ['operation']
});

// Middleware
function trackRequestDuration(req, res, next) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .observe(duration);
  });
  
  next();
}

module.exports = { trackRequestDuration, httpRequestDuration, dbQueryDuration };
```

### Health Check Endpoint
```javascript
// backend/src/routes/health.js
router.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {}
  };
  
  // Check database
  try {
    await db.query('SELECT 1');
    health.checks.database = 'ok';
  } catch (err) {
    health.checks.database = 'error';
    health.status = 'degraded';
  }
  
  // Check file storage
  try {
    await checkFileStorage();
    health.checks.storage = 'ok';
  } catch (err) {
    health.checks.storage = 'error';
    health.status = 'degraded';
  }
  
  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});
```

---

*Final document: README-Summary.md*
