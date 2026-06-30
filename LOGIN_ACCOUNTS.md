# 🔐 ITIL Login Accounts

**Database đã seed với 3 tài khoản mặc định:**

---

## 👑 Admin Account (Full Access)

```
Email:    admin@itil.com
Password: Admin@123
Role:     ADMIN
```

**Quyền:**
- ✅ Quản lý users, departments, locations
- ✅ Xem/sửa/xóa tất cả assets
- ✅ Approve procurement requests
- ✅ Xem audit logs
- ✅ Full system access

---

## 👔 Manager Account (Department Manager)

```
Email:    manager@itil.com
Password: Manager@123
Role:     MANAGER
```

**Quyền:**
- ✅ Quản lý assets trong department
- ✅ Approve department procurement
- ✅ Xem department reports
- ❌ Không quản lý users/system settings

---

## 👤 User Account (Regular User)

```
Email:    user@itil.com
Password: User@123
Role:     USER
```

**Quyền:**
- ✅ Xem assets assigned to them
- ✅ Create procurement requests
- ✅ Update profile
- ❌ Không approve/delete/manage

---

## 🚀 Chạy Seed Script trên Render

**Option 1: Tự động (Render sẽ chạy khi deploy)**
```bash
# Render.yaml đã config để chạy seed sau migrate
# Không cần làm gì thêm
```

**Option 2: Manual qua Render Shell**
1. Render Dashboard → Service "itil-backend"
2. Tab "Shell"
3. Run commands:
```bash
cd /opt/render/project/src
npm run prisma:seed
```

**Option 3: Local test (development)**
```bash
cd backend
npm run prisma:seed
```

---

## ✅ Verify Seed Hoạt Động

**Test login qua API:**
```bash
curl -X POST https://itil-backend-nv7t.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@itil.com",
    "password": "Admin@123"
  }'
```

**Expected response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "admin@itil.com",
      "role": "ADMIN",
      "firstName": "System",
      "lastName": "Administrator"
    },
    "token": "eyJhbGciOiJIUzI1..."
  }
}
```

---

## 🎯 Next Steps

1. ✅ Seed script pushed to GitHub
2. ⏳ Render auto-deploy (2-3 phút)
3. ⏳ Run seed script trên Render
4. ✅ Test login qua frontend
5. ✅ Bắt đầu sử dụng app!

---

**Default Department:** IT (Information Technology)  
**Default Location:** HQ-VN (Head Office Vietnam)
