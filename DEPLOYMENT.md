# Deployment Guide - Railway + Vercel

Complete deployment instructions for ITIL Asset Management System.

## Architecture

```
[Users] → [Vercel Frontend] → [Railway Backend] → [Railway PostgreSQL]
```

## Step 1: Prepare GitHub Repository

```bash
cd /path/to/ITIL
git add .
git commit -m "Production-ready: Full-stack ITIL Asset Management"
git push origin main
```

## Step 2: Deploy Database (Railway)

1. Go to https://railway.app/new
2. Click "New Project"
3. Select "Deploy PostgreSQL"
4. Wait for deployment (~2 minutes)
5. Copy `DATABASE_URL` from "Variables" tab

Example: `postgresql://postgres:password@host.railway.app:5432/railway`

## Step 3: Deploy Backend (Railway)

1. In same Railway project, click "New Service"
2. Select "GitHub Repo"
3. Authorize Railway to access your repository
4. Select your ITIL repository
5. Click "Deploy Now"

### Backend Configuration:

**Service Settings:**
- Root Directory: `backend`
- Builder: Nixpacks (auto-detected)

**Environment Variables:**
```env
DATABASE_URL=postgresql://... (from PostgreSQL service)
NODE_ENV=production
PORT=4000 (Railway auto-sets this)
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://your-app.vercel.app
```

**Build Settings** (auto-configured by railway.json):
- Build: `npm install && npx prisma generate && npx prisma migrate deploy`
- Start: `npm start`

6. Click "Deploy"
7. Wait for deployment (~3-5 minutes)
8. Copy backend URL from "Settings" → "Domains"

Example: `https://itil-backend.up.railway.app`

## Step 4: Deploy Frontend (Vercel)

1. Go to https://vercel.com/new
2. Import Git Repository → Select ITIL repository
3. Configure Project:

**Build & Output Settings:**
- Framework Preset: `Vite`
- Root Directory: `frontend`
- Build Command: `npm run build` (auto-detected)
- Output Directory: `dist` (auto-detected)

**Environment Variables:**
```env
VITE_API_URL=https://itil-backend.up.railway.app
```
(Use your Railway backend URL from Step 3)

4. Click "Deploy"
5. Wait for deployment (~2-3 minutes)
6. Copy frontend URL

Example: `https://itil-asset-mgmt.vercel.app`

## Step 5: Update CORS

Go back to Railway backend → Environment Variables:

```env
CORS_ORIGIN=https://itil-asset-mgmt.vercel.app
```
(Use your Vercel frontend URL from Step 4)

Railway will auto-redeploy backend.

## Step 6: Create First Admin User

### Option A: Via API

```bash
curl -X POST https://itil-backend.up.railway.app/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@company.com",
    "username": "admin",
    "password": "SecurePassword123!",
    "firstName": "System",
    "lastName": "Administrator"
  }'
```

### Option B: Via Railway PostgreSQL

1. Railway → PostgreSQL service → "Data" tab
2. Run SQL:

```sql
INSERT INTO users (
  id, email, username, "passwordHash", "firstName", "lastName", 
  role, "isActive", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'admin@company.com',
  'admin',
  '$2a$10$hash', -- Replace with bcrypt hash
  'System',
  'Administrator',
  'ADMIN',
  true,
  NOW(),
  NOW()
);
```

To generate bcrypt hash:
```bash
node -e "console.log(require('bcryptjs').hashSync('YourPassword123', 10))"
```

## Step 7: Test Deployment

1. Open Vercel frontend URL
2. You should see login page
3. Login with admin credentials
4. Verify:
   - ✅ Dashboard loads
   - ✅ Assets page loads
   - ✅ Navigation works
   - ✅ API calls succeed

## Troubleshooting

### Frontend shows "Network Error"

**Issue:** Frontend can't reach backend

**Fix:**
1. Check `VITE_API_URL` in Vercel environment variables
2. Verify Railway backend is running
3. Check CORS_ORIGIN in Railway backend variables

### Backend "Database connection failed"

**Issue:** Backend can't connect to PostgreSQL

**Fix:**
1. Verify `DATABASE_URL` in Railway backend variables
2. Check PostgreSQL service is running
3. Verify DATABASE_URL format: `postgresql://user:pass@host:port/db`

### "Prisma client not generated"

**Issue:** Build didn't run Prisma generate

**Fix:**
1. Check Railway build command includes `npx prisma generate`
2. Rebuild service in Railway dashboard

### 401 Unauthorized errors

**Issue:** JWT token issues

**Fix:**
1. Verify `JWT_SECRET` is set in Railway backend
2. Clear browser localStorage and re-login
3. Check token expiry (default 7 days)

## Automatic Deployments

Both Railway and Vercel support auto-deploy on git push:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main

# Vercel auto-deploys frontend (~2 min)
# Railway auto-deploys backend (~3 min)
```

## Custom Domains (Optional)

### Frontend (Vercel):
1. Vercel Project → Settings → Domains
2. Add custom domain: `itil.company.com`
3. Update DNS with Vercel's records
4. SSL auto-provisioned

### Backend (Railway):
1. Railway Service → Settings → Domains
2. Click "Generate Domain" or add custom
3. Update `VITE_API_URL` in Vercel to new domain

## Monitoring

### Railway (Backend):
- View logs: Railway → Service → "Logs" tab
- Monitor metrics: "Metrics" tab (CPU, Memory, Network)
- Database metrics: PostgreSQL service → "Metrics"

### Vercel (Frontend):
- View logs: Vercel Project → Deployments → Click deployment → "Logs"
- Analytics: "Analytics" tab (page views, performance)

## Costs

**Vercel:**
- Free tier: Unlimited bandwidth for personal projects
- Upgrade if needed: $20/month (Pro)

**Railway:**
- $5/month free credit
- ~$10-15/month for backend + PostgreSQL
- Pay-as-you-go (no minimum)

**Total: ~$10-15/month**

## Backup & Recovery

### Database Backup (Railway):

```bash
# Manual backup via Railway CLI
railway db:backup create

# Or via pg_dump
pg_dump $DATABASE_URL > backup.sql
```

### Restore:
```bash
psql $DATABASE_URL < backup.sql
```

## Scaling

### Backend:
- Railway auto-scales based on traffic
- Upgrade plan if needed (Settings → Plan)

### Frontend:
- Vercel auto-scales (CDN + edge network)
- No configuration needed

## Security Checklist

- ✅ JWT_SECRET set to random secure value
- ✅ CORS_ORIGIN set to frontend URL only
- ✅ DATABASE_URL not exposed in frontend
- ✅ HTTPS enforced (auto by Railway/Vercel)
- ✅ Environment variables not committed to git

## Next Steps

1. **Data Migration** - Import 955 Excel files
2. **User Onboarding** - Create team accounts
3. **Training** - Demo for users
4. **Monitoring** - Set up alerts
5. **Backup** - Schedule automated backups

---

**Support:**
- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- Project Docs: `/Plan & Implementation/README.md`
