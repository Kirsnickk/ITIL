# Railway Deployment - Step by Step

**Lý do cần setup qua Web UI:** Railway CLI token chỉ hoạt động SAU KHI project đã được tạo và linked với GitHub repo.

---

## Bước 1: Tạo Railway Project (5 phút)

1. **Truy cập Railway:**
   - URL: https://railway.app/new
   - Đăng nhập bằng GitHub account (khuyến nghị) hoặc email

2. **Deploy from GitHub Repo:**
   - Click "Deploy from GitHub repo"
   - Authorize Railway để truy cập GitHub
   - Chọn repo: `Kirsnickk/ITIL`
   - Railway sẽ tự động detect monorepo structure

3. **Configure Backend Service:**
   - Railway sẽ hỏi "Which service to deploy?"
   - Chọn: `backend/`
   - Service name: `itil-backend`

---

## Bước 2: Thêm PostgreSQL Database (3 phút)

1. **Trong Railway Dashboard:**
   - Click "+ New" trong project
   - Chọn "Database"
   - Chọn "PostgreSQL"

2. **Connect Database to Backend:**
   - Railway tự động tạo biến `DATABASE_URL`
   - Backend service sẽ tự động nhận biến này

---

## Bước 3: Configure Environment Variables (5 phút)

**Trong Backend Service → Variables tab, thêm:**

```bash
NODE_ENV=production
PORT=4000

# JWT Configuration
JWT_SECRET=<generate-strong-random-string-here>
JWT_EXPIRES_IN=7d

# CORS - Frontend URL từ Vercel
CORS_ORIGIN=https://frontend-iota-seven-77.vercel.app

# Database - Tự động có sẵn từ PostgreSQL service
# DATABASE_URL=(Railway tự động inject)
```

**Tạo JWT_SECRET mạnh:**
```bash
# Option 1: OpenSSL
openssl rand -base64 32

# Option 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## Bước 4: Deploy Settings

1. **Build Command:**
   - Railway auto-detect từ `railway.json`
   - Hoặc set manual: `npm install && npx prisma generate && npx prisma migrate deploy`

2. **Start Command:**
   - Auto-detect từ `package.json` script `start`
   - Hoặc set manual: `npm start`

3. **Root Directory:**
   - Set: `backend` (quan trọng cho monorepo)

---

## Bước 5: Custom Domain & Deployment URL

1. **Railway sẽ tự động generate domain:**
   - Format: `<service-name>-production-<hash>.up.railway.app`
   - Ví dụ: `itil-backend-production-a1b2.up.railway.app`

2. **Copy domain này** để update Vercel environment variable

---

## Bước 6: Verify Deployment

**Test API endpoints:**

```bash
# 1. Health check
curl https://your-railway-domain.up.railway.app/health

# Expected response:
# {"status":"ok","timestamp":"2026-06-30T..."}

# 2. API base endpoint
curl https://your-railway-domain.up.railway.app/api/v1

# 3. Test login (sau khi seed initial user)
curl -X POST https://your-railway-domain.up.railway.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

---

## Bước 7: Update Vercel Environment Variable

1. **Truy cập Vercel Dashboard:**
   - https://vercel.com/vanducminh31-archs-projects/frontend/settings/environment-variables

2. **Edit VITE_API_URL:**
   - Current value: `https://itil-backend-production.up.railway.app/api/v1`
   - New value: `https://<your-actual-railway-domain>/api/v1`

3. **Redeploy Frontend:**
   - Vercel dashboard → Deployments tab
   - Click "..." on latest deployment → "Redeploy"

---

## Bước 8: Enable Auto-Deploy from GitHub

**Railway auto-deploy đã được bật mặc định:**
- Mỗi khi push code lên branch `main`
- Railway tự động rebuild và redeploy backend
- Check deployment logs trong Railway dashboard

**Để tắt auto-deploy (không khuyến nghị):**
- Service Settings → GitHub → Toggle off "Auto Deploy"

---

## Bước 9: Setup GitHub Secrets (cho CI/CD workflows)

Sau khi Railway project đã chạy, lấy Railway token mới:

1. **Tạo Project Token:**
   - Railway Dashboard → Project Settings → Tokens
   - Click "Create Token"
   - Name: `github-actions`
   - Copy token value

2. **Add to GitHub Secrets:**
   - https://github.com/Kirsnickk/ITIL/settings/secrets/actions
   - New secret: `RAILWAY_TOKEN` = (token vừa tạo)

3. **Vercel secrets (nếu chưa có):**
   - `VERCEL_TOKEN` = (đã có từ trước)
   - `VERCEL_ORG_ID` = (lấy từ Vercel Settings → General)
   - `VERCEL_PROJECT_ID` = (lấy từ Vercel Project Settings → General)

---

## Troubleshooting

### 1. Build Failed - Prisma Migration Error
**Lỗi:** `P3009: Failed to create database`

**Fix:**
- Railway PostgreSQL database phải được tạo TRƯỚC khi deploy backend
- Check Variables tab có `DATABASE_URL` chưa
- Format đúng: `postgresql://user:pass@host:port/db`

### 2. CORS Error khi Frontend gọi API
**Lỗi:** `Access-Control-Allow-Origin`

**Fix:**
- Check `CORS_ORIGIN` trong Railway backend variables
- Phải match chính xác Vercel frontend URL
- Không dùng trailing slash: ✅ `https://frontend.vercel.app` | ❌ `https://frontend.vercel.app/`

### 3. 502 Bad Gateway
**Lỗi:** Backend không start được

**Fix:**
- Check Railway logs: Service → Deployments → Click deployment → View logs
- Common issues:
  - PORT mismatch (phải dùng `process.env.PORT`)
  - Prisma client not generated
  - Database connection string invalid

### 4. JWT Token Invalid
**Lỗi:** Frontend login thành công nhưng subsequent requests fail

**Fix:**
- Check `JWT_SECRET` giống nhau ở cả development và production
- Token phải đủ dài (min 32 characters)
- Check expiry: `JWT_EXPIRES_IN=7d`

---

## Next Steps

Sau khi Railway backend deployed thành công:

1. ✅ **Test API endpoints** (health, login, get assets)
2. ✅ **Update Vercel VITE_API_URL** với Railway domain thật
3. ✅ **Redeploy frontend** để nhận API URL mới
4. ✅ **Test full flow:** Login → Dashboard → CRUD operations
5. ✅ **Setup monitoring:** Railway metrics, error tracking

---

**Current Status:**
- ✅ Frontend: https://frontend-iota-seven-77.vercel.app
- ⏳ Backend: Cần deploy qua Railway Web UI
- ✅ Code: https://github.com/Kirsnickk/ITIL
- ✅ CI/CD workflows: Ready (cần GitHub secrets)
