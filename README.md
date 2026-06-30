# ITIL Asset Management System

Full-stack web application for IT asset management across 70+ retail stores in Vietnam, Cambodia, and Laos.

**Tech Stack:**
- Frontend: React + TypeScript + Vite + Material-UI (Vercel)
- Backend: Node.js + Express + Prisma (Railway)
- Database: PostgreSQL (Railway)

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL database

### Local Development

```bash
# Backend
cd backend
npm install
cp .env.example .env
# Edit .env with DATABASE_URL
npm run prisma:generate
npm run prisma:migrate
npm run dev

# Frontend (separate terminal)
cd frontend
npm install
cp .env.example .env
# Edit .env with VITE_API_URL=http://localhost:4000
npm run dev
```

Backend: http://localhost:4000
Frontend: http://localhost:5173

## 📁 Project Structure

```
ITIL/
├── backend/              # Node.js API
│   ├── prisma/           # Database schema
│   ├── src/              # Source code
│   └── package.json
├── frontend/             # React app
│   ├── src/              # Source code
│   └── package.json
├── Data/                 # Excel data (955 files)
├── Plan & Implementation/
└── Schema & Flow/
```

## 🌐 Deployment (Vercel + Railway)

### 1. Database (Railway PostgreSQL)

1. Create Railway project: https://railway.app
2. Add PostgreSQL service
3. Copy DATABASE_URL from Railway dashboard

### 2. Backend (Railway)

1. In Railway project, click "New Service" → "GitHub Repo"
2. Connect your GitHub repository
3. Configure service:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npx prisma generate && npx prisma migrate deploy`
   - **Start Command**: `npm start`
4. Environment variables (auto-configured):
   - `DATABASE_URL` - From PostgreSQL service
   - `PORT` - Auto-set by Railway
   - `NODE_ENV` - Set to `production`
   - Add manually:
     - `JWT_SECRET` - Random secure string
     - `CORS_ORIGIN` - Your Vercel frontend URL

### 3. Frontend (Vercel)

1. Push code to GitHub
2. Go to https://vercel.com → Import Project
3. Connect GitHub repository
4. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Environment Variables:
   - `VITE_API_URL` - Your Railway backend URL (e.g., `https://itil-backend.up.railway.app`)
6. Deploy

### 4. Verify Deployment

1. Open Vercel frontend URL
2. Login page should load
3. Create first admin user via backend API

## 🔑 First Admin User

After deployment, create admin user:

```bash
curl -X POST https://your-backend.railway.app/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@company.com",
    "username": "admin",
    "password": "SecurePassword123",
    "firstName": "Admin",
    "lastName": "User"
  }'
```

Then manually update user role to ADMIN in database.

## 📊 Features

- **Asset Management** - Track laptops, monitors, network devices (70+ stores)
- **Procurement** - Request and approval workflow (ITP00001-ITP00398)
- **License Tracking** - Software licenses (~500 licenses)
- **Multi-Location** - Vietnam, Cambodia, Laos support
- **Audit Trail** - Full change history
- **Role-Based Access** - Admin/Manager/User/Viewer

## 📖 Documentation

- `/Plan & Implementation/README.md` - 6-month roadmap, budget, ROI
- `/Schema & Flow/` - Database schema, API docs, migration guide
- `/backend/README.md` - Backend API documentation
- `/frontend/README.md` - Frontend development guide

## 🔧 Tech Details

**Backend:**
- Node.js 20 + Express 4
- Prisma ORM 5
- PostgreSQL 15
- JWT authentication
- 17 database tables

**Frontend:**
- React 18 + TypeScript
- Vite build tool
- Material-UI components
- TanStack Query
- Zustand state management

## 💰 Cost Estimate

**Vercel (Frontend):**
- Free tier (sufficient for internal use)
- Auto HTTPS, CDN, auto-deploy

**Railway (Backend + Database):**
- ~$15-20/month
- Managed PostgreSQL
- Auto-scaling
- Included $5/month free credit

**Total: ~$10-15/month**

## 🛠️ Maintenance

```bash
# Update dependencies
cd backend && npm update
cd frontend && npm update

# Database migrations
cd backend
npm run prisma:migrate

# View database
npm run prisma:studio
```

## 📝 Data Migration

955 Excel files in `/Data` ready for migration:

```bash
# Run migration scripts (to be created)
cd backend
node scripts/migrate-assets.js
node scripts/migrate-procurement.js
node scripts/migrate-licenses.js
```

## 🔒 Security

- JWT tokens (7-day expiry)
- Bcrypt password hashing
- CORS configured
- Helmet security headers
- Input validation
- SQL injection protection (Prisma)

## 🌍 Multi-Country Support

- Vietnam: 70+ stores
- Cambodia: Multiple locations
- Laos: Expanding
- Multi-currency support ready

## 📞 Support

For issues, check:
1. Backend logs in Railway dashboard
2. Frontend logs in browser console
3. Database via Prisma Studio

## 🚦 Status

- ✅ Backend API - Complete
- ✅ Frontend UI - Complete
- ✅ Database Schema - Complete
- ⏳ Data Migration - Pending
- ⏳ Production Deployment - Ready to deploy

## 📅 Next Steps

1. **Deploy** - Push to Railway + Vercel
2. **Migrate Data** - Import 955 Excel files
3. **Create Users** - Add team accounts
4. **Training** - Onboard users
5. **Go Live** - Start tracking assets

## 🔗 Links

- GitHub: (Your repository)
- Frontend: (Vercel URL after deploy)
- Backend: (Railway URL after deploy)
- Documentation: `/Plan & Implementation/`

---

Built for ITIL-based asset management across retail operations in Southeast Asia.
