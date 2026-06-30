# Deploy ITIL Backend lên Render.com

## 🚀 1-Click Blueprint Deploy

**Click link này để deploy tự động:**

👉 **https://dashboard.render.com/select-repo?type=blueprint**

---

## Các bước:

### Bước 1: Authorize Render
- Click link trên
- Login với GitHub (nếu chưa)
- Authorize Render truy cập GitHub repos

### Bước 2: Chọn Repository
- Tìm và chọn: `Kirsnickk/ITIL`
- Render sẽ tự động detect `render.yaml`

### Bước 3: Review & Deploy
- Render sẽ tự động:
  - ✅ Tạo PostgreSQL database (free tier)
  - ✅ Tạo Web Service cho backend
  - ✅ Set environment variables
  - ✅ Connect database với backend
  - ✅ Deploy từ branch `main`

### Bước 4: Đợi Deploy (2-3 phút)
- PostgreSQL: ~1 phút
- Backend build + start: ~2 phút

### Bước 5: Lấy Backend URL
- Sau khi deploy xong
- Service name: `itil-backend`
- URL dạng: `https://itil-backend.onrender.com`

---

## ✅ Sau khi deploy xong:

**Update Vercel Environment Variable:**
```bash
VITE_API_URL=https://itil-backend.onrender.com/api/v1
```

**Test API:**
```bash
curl https://itil-backend.onrender.com/health
curl https://itil-backend.onrender.com/api/v1
```

---

## 📊 So sánh Railway vs Render:

| Feature | Railway | Render |
|---------|---------|--------|
| Setup | Web UI manual | 1-click Blueprint |
| Free tier | ✅ 500 hours/month | ✅ 750 hours/month |
| PostgreSQL | ✅ Free | ✅ Free (90 days) |
| Auto-deploy | ✅ GitHub | ✅ GitHub |
| API access | ❌ Token issues | ✅ Full API |

---

## 🎯 Current Status:

- ✅ Frontend: https://frontend-iota-seven-77.vercel.app
- ✅ Code: https://github.com/Kirsnickk/ITIL
- ✅ render.yaml: Ready
- ⏳ Backend: Chờ anh deploy qua link trên

---

**Next: Click link deploy và báo tôi khi xong!**
