# Technical Stack - ITIL Asset Management

## 🏗️ Architecture Decision

**Approach**: Modern full-stack web application với microservices-ready architecture

**Deployment**: Cloud-native (AWS/Azure/GCP) hoặc on-premise

## 🔧 Recommended Technology Stack

### Backend Option 1: Node.js + Express (Recommended)

**Pros**: 
- Fast development, large ecosystem
- JavaScript end-to-end (frontend + backend)
- Excellent async I/O for API operations
- Strong PostgreSQL support

**Stack**:
```
- Runtime: Node.js 20 LTS
- Framework: Express.js 4.x
- ORM: Prisma or TypeORM
- Authentication: Passport.js + JWT
- Validation: Joi or Zod
- File Upload: Multer
- Email: Nodemailer
- Logging: Winston
- Testing: Jest + Supertest
```

**Project Structure**:
```
backend/
├── src/
│   ├── config/          # Database, environment configs
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Auth, validation, error handling
│   ├── models/          # Database models (Prisma/TypeORM)
│   ├── routes/          # API route definitions
│   ├── services/        # Business logic layer
│   ├── utils/           # Helpers, validators
│   └── app.js           # Express app setup
├── tests/
├── prisma/              # Database schema
├── package.json
└── .env
```

### Backend Option 2: Python + FastAPI (Alternative)

**Pros**:
- Excellent for data processing
- Strong typing with Pydantic
- Auto-generated API docs
- Great for ML/analytics integration

**Stack**:
```
- Runtime: Python 3.11+
- Framework: FastAPI
- ORM: SQLAlchemy
- Authentication: FastAPI-Users
- Validation: Pydantic
- File Upload: Python-multipart
- Email: FastAPI-Mail
- Testing: Pytest
```

---

### Frontend: React + TypeScript

**Stack**:
```
- Framework: React 18
- Language: TypeScript
- Build Tool: Vite
- UI Library: Material-UI (MUI) or Ant Design
- State Management: Zustand or Redux Toolkit
- Data Fetching: TanStack Query (React Query)
- Forms: React Hook Form + Zod
- Routing: React Router v6
- Charts: Recharts or Chart.js
- Tables: TanStack Table
- Date Handling: date-fns
- HTTP Client: Axios
```

**Project Structure**:
```
frontend/
├── public/
├── src/
│   ├── api/              # API client, endpoints
│   ├── components/       # Reusable UI components
│   │   ├── assets/       # Asset-related components
│   │   ├── procurement/  # Procurement components
│   │   ├── licenses/     # License components
│   │   └── common/       # Shared components
│   ├── layouts/          # Page layouts (Dashboard, Auth)
│   ├── pages/            # Route pages
│   ├── hooks/            # Custom React hooks
│   ├── store/            # State management
│   ├── types/            # TypeScript types/interfaces
│   ├── utils/            # Helper functions
│   ├── App.tsx
│   └── main.tsx
├── package.json
└── tsconfig.json
```

---

### Database: PostgreSQL 15+

**Why PostgreSQL**:
- Robust ACID compliance (critical for asset tracking)
- Excellent JSON support (for flexible specs, audit logs)
- Full-text search (for asset search)
- Rich indexing (GiST, GIN for performance)
- Mature ecosystem, great tooling

**Configuration**:
```yaml
# postgresql.conf optimizations
max_connections: 100
shared_buffers: 4GB
effective_cache_size: 12GB
work_mem: 16MB
maintenance_work_mem: 512MB

# Enable query logging for development
log_statement: 'all'
log_duration: on
```

---

### File Storage

#### Option 1: AWS S3 (Cloud)
```javascript
// S3 setup
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  region: 'ap-southeast-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY
  }
});

async function uploadDocument(file, procurement_id) {
  const key = `documents/${procurement_id}/${file.name}`;
  
  await s3.send(new PutObjectCommand({
    Bucket: 'itil-asset-docs',
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype
  }));
  
  return `https://itil-asset-docs.s3.amazonaws.com/${key}`;
}
```

#### Option 2: Local File System (On-Premise)
```javascript
// Local storage with organized structure
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = `./uploads/${req.params.procurement_id}`;
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});
```

---

### Authentication & Authorization

**JWT-based Authentication**:
```javascript
// Login flow
POST /auth/login
{
  "username": "john.doe",
  "password": "********"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "john.doe",
    "role": "IT_MANAGER",
    "full_name": "John Doe"
  }
}

// Subsequent requests
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Role-Based Access Control (RBAC)**:
```javascript
const permissions = {
  ADMIN: ['*'],  // Full access
  
  IT_MANAGER: [
    'assets:read', 'assets:write', 'assets:delete',
    'procurements:read', 'procurements:approve',
    'licenses:read', 'licenses:assign',
    'reports:read'
  ],
  
  IT_STAFF: [
    'assets:read', 'assets:write',
    'procurements:read', 'procurements:create',
    'licenses:read'
  ],
  
  FINANCE: [
    'procurements:read', 'procurements:approve',
    'reports:read'
  ],
  
  STORE_MANAGER: [
    'assets:read',  // Only assets at their store
    'procurements:create'  // Request new equipment
  ],
  
  VIEWER: [
    'assets:read',
    'reports:read'
  ]
};

// Middleware
function checkPermission(permission) {
  return (req, res, next) => {
    const userRole = req.user.role;
    const allowed = permissions[userRole];
    
    if (allowed.includes('*') || allowed.includes(permission)) {
      next();
    } else {
      res.status(403).json({ error: 'Forbidden' });
    }
  };
}

// Usage
router.delete('/assets/:id', 
  authenticate,
  checkPermission('assets:delete'),
  deleteAsset
);
```

---

### Notification System

**Email Notifications**:
```javascript
// Using Nodemailer
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.company.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

async function sendApprovalNotification(procurement, approver) {
  await transporter.sendMail({
    from: 'IT Asset System <noreply@company.com>',
    to: approver.email,
    subject: `[Action Required] Procurement ${procurement.itp_number}`,
    html: `
      <h2>Procurement Request Awaiting Your Approval</h2>
      <p><strong>ITP Number:</strong> ${procurement.itp_number}</p>
      <p><strong>Description:</strong> ${procurement.description}</p>
      <p><strong>Amount:</strong> $${procurement.estimated_cost}</p>
      <p><a href="https://itil.company.com/procurements/${procurement.id}">
        Click here to review and approve
      </a></p>
    `
  });
}
```

**In-App Notifications**:
```javascript
// Real-time with Socket.io (optional)
import { Server } from 'socket.io';

const io = new Server(httpServer, {
  cors: { origin: process.env.FRONTEND_URL }
});

io.on('connection', (socket) => {
  const userId = socket.handshake.auth.userId;
  socket.join(`user:${userId}`);
});

// Send notification to specific user
function notifyUser(userId, notification) {
  io.to(`user:${userId}`).emit('notification', notification);
}
```

---

*Continued in: 08-Deployment-Guide.md*
