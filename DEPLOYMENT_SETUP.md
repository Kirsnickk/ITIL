# ITIL Deployment Setup Guide

## ✅ Đã hoàn thành (2026-06-30)

### 1. Frontend - Vercel
- **Status:** ✅ Deployed
- **URL:** https://frontend-iota-seven-77.vercel.app
- **Environment Variables:** 
  - `VITE_API_URL` = (cần update sau khi backend deploy)

### 2. Code Repository
- **Status:** ✅ Pushed to GitHub
- **Repo:** https://github.com/Kirsnickk/ITIL.git
- **Branch:** main

### 3. CI/CD Workflows
- **Status:** ✅ Created
- **Files:**
  - `.github/workflows/frontend-deploy.yml`
  - `.github/workflows/backend-deploy.yml`

---

## 🔧 Cần làm manual (Railway không thể setup qua CLI)

### Step 1: Setup Railway Project (Web UI)

1. **Đăng nhập Railway:**
   - Truy cập: https://railway.app/
   - Login bằng GitHub account

2. **Tạo Project mới:**
   - Click "New Project"
   - Chọn "Deploy from GitHub repo"
   - Chọn repo: `Kirsnickk/ITIL`
   - Root directory: `backend/`

3. **Thêm PostgreSQL Database:**
   - Trong project, click "+ New"
   - Chọn "Database" → "PostgreSQL"
   - Railway sẽ tự động tạo `DATABASE_URL` environment variable

4. **Config Backend Service:**
   - Service name: `backend`
   - Build command: `npm install && npx prisma generate`
   - Start command: `npm start`
   - Root directory: `/backend`

5. **Set Environment Variables cho Backend:**
   ```
   NODE_ENV=production
   PORT=4000
   JWT_SECRET=<generate-strong-secret-here>
   JWT_EXPIRES_IN=7d
   CORS_ORIGIN=https://frontend-iota-seven-77.vercel.app
   ```

6. **Lấy Railway Domain:**
   - Sau khi deploy, Railway sẽ tạo domain dạng: `*.up.railway.app`
   - Copy domain này

### Step 2: Update Vercel Environment Variables

1. **Truy cập Vercel Dashboard:**
   - https://vercel.com/vanducminh31-archs-projects/frontend

2. **Update VITE_API_URL:**
   - Settings → Environment Variables
   - Edit `VITE_API_URL`
   - Set value: `https://<railway-domain>/api/v1`
   - Redeploy frontend

### Step 3: Setup GitHub Secrets (cho CI/CD)

1. **Truy cập GitHub Repo Settings:**
   - https://github.com/Kirsnickk/ITIL/settings/secrets/actions

2. **Thêm Secrets:**

   **Vercel Secrets:**
   - `VERCEL_TOKEN` = (token đã được cung cấp trước đó)
   - `VERCEL_ORG_ID` = (lấy từ Vercel Settings → General)
   - `VERCEL_PROJECT_ID` = (lấy từ Vercel Project Settings → General)

   **Railway Secret:**
   - `RAILWAY_TOKEN` = (lấy từ Railway Account Settings → Tokens → Create New Token)

### Step 4: Test CI/CD

1. **Test Frontend Auto-deploy:**
   ```bash
   # Thay đổi file trong frontend/
   git add frontend/
   git commit -m "test: trigger frontend deploy"
   git push
   ```

2. **Test Backend Auto-deploy:**
   ```bash
   # Thay đổi file trong backend/
   git add backend/
   git commit -m "test: trigger backend deploy"
   git push
   ```

---

## 📋 Checklist

- [x] Frontend deployed lên Vercel
- [x] Code pushed lên GitHub
- [x] CI/CD workflows created
- [ ] Railway project created
- [ ] PostgreSQL database added
- [ ] Backend deployed lên Railway
- [ ] Environment variables configured (cả 2 platforms)
- [ ] GitHub Secrets configured
- [ ] CI/CD tested và working

---

## 🔑 Token References

**Vercel Token:** (đã được user cung cấp - đang dùng trong Vercel deployment)

**Railway Token:** (token cũ không hợp lệ - cần tạo mới từ Railway Account Settings → Tokens)

---

## 🚀 Production URLs (sau khi setup xong)

- **Frontend:** https://frontend-iota-seven-77.vercel.app
- **Backend API:** https://<your-railway-domain>/api/v1
- **API Health Check:** https://<your-railway-domain>/health

---

## 📖 API Documentation

Sau khi backend deploy, test endpoints:

```bash
# Health check
curl https://<railway-domain>/health

# Login
curl -X POST https://<railway-domain>/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# Get assets (with JWT token)
curl https://<railway-domain>/api/v1/assets \
  -H "Authorization: Bearer <your-jwt-token>"
```

---

**Next Steps:** Follow the manual setup steps above to complete deployment.
