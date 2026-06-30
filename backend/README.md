# ITIL Asset Management - Backend API

Node.js + Express + Prisma + PostgreSQL REST API for ITIL Asset Management System.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL database (Railway or local)

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your DATABASE_URL
# Railway will provide this automatically

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Start development server
npm run dev
```

Server runs on http://localhost:4000

## 📁 Project Structure

```
backend/
├── prisma/
│   └── schema.prisma       # Database schema
├── src/
│   ├── config/             # Configuration files
│   ├── controllers/        # Route handlers
│   ├── middleware/         # Auth, error handling
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   ├── utils/              # Utilities
│   └── server.js           # Entry point
├── .env.example            # Environment template
└── package.json
```

## 🔗 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/refresh` - Refresh token

### Assets
- `GET /api/v1/assets` - List assets (with filters)
- `GET /api/v1/assets/:id` - Get asset details
- `POST /api/v1/assets` - Create asset (Admin/Manager)
- `PUT /api/v1/assets/:id` - Update asset (Admin/Manager)
- `DELETE /api/v1/assets/:id` - Delete asset (Admin)

### Procurement
- `GET /api/v1/procurement` - List procurement requests
- `GET /api/v1/procurement/:id` - Get request details
- `POST /api/v1/procurement` - Create request
- `PUT /api/v1/procurement/:id` - Update request (Admin/Manager)
- `POST /api/v1/procurement/:id/approve` - Approve (Admin/Manager)
- `POST /api/v1/procurement/:id/reject` - Reject (Admin/Manager)

### Licenses
- `GET /api/v1/licenses` - List licenses
- `GET /api/v1/licenses/:id` - Get license details
- `POST /api/v1/licenses` - Create license (Admin/Manager)
- `PUT /api/v1/licenses/:id` - Update license (Admin/Manager)
- `DELETE /api/v1/licenses/:id` - Delete license (Admin)

### Departments
- `GET /api/v1/departments` - List departments
- `GET /api/v1/departments/:id` - Get department details
- `POST /api/v1/departments` - Create department (Admin)
- `PUT /api/v1/departments/:id` - Update department (Admin)

### Locations
- `GET /api/v1/locations` - List locations
- `GET /api/v1/locations/:id` - Get location details
- `POST /api/v1/locations` - Create location (Admin)
- `PUT /api/v1/locations/:id` - Update location (Admin)

## 🔐 Authentication

All endpoints except `/auth/register` and `/auth/login` require JWT token:

```bash
Authorization: Bearer <token>
```

### User Roles
- `ADMIN` - Full access
- `MANAGER` - Can create/update assets, approve procurement
- `USER` - Can view and create procurement requests
- `VIEWER` - Read-only access

## 🗄️ Database Models

- **User** - Users and authentication
- **Department** - Organizational units
- **Location** - Physical locations (Office/Store/Warehouse)
- **Asset** - IT assets (laptops, monitors, etc.)
- **ProcurementRequest** - Purchase requests
- **License** - Software licenses
- **MaintenanceRecord** - Asset maintenance history
- **Approval** - Procurement approvals
- **Attachment** - File attachments
- **ChangeHistory** - Asset change tracking
- **AuditLog** - System audit trail
- **Notification** - User notifications

## 🚂 Railway Deployment

1. Create new Railway project
2. Add PostgreSQL service
3. Deploy backend from GitHub:
   - Connect repository
   - Root directory: `backend`
   - Build command: `npm install && npx prisma generate`
   - Start command: `npm start`
4. Environment variables auto-configured by Railway

## 🔧 Development

```bash
# Run dev server with auto-reload
npm run dev

# Generate Prisma client
npm run prisma:generate

# Create migration
npm run prisma:migrate

# Open Prisma Studio (database GUI)
npm run prisma:studio

# Deploy migrations (production)
npm run prisma:deploy
```

## 📝 Environment Variables

```env
DATABASE_URL="postgresql://user:pass@host:5432/db"
PORT=4000
NODE_ENV=development
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

## 🏗️ Tech Stack

- **Node.js 20** - Runtime
- **Express 4** - Web framework
- **Prisma 5** - ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Winston** - Logging

## 📊 API Response Format

Success:
```json
{
  "success": true,
  "data": { ... }
}
```

Error:
```json
{
  "success": false,
  "error": {
    "message": "Error message"
  }
}
```

## 🔗 Related

- Frontend: `/frontend` - React + TypeScript + Vite
- Documentation: `/Plan & Implementation`, `/Schema & Flow`
