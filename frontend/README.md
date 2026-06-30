# ITIL Asset Management - Frontend

React + TypeScript + Vite + Material-UI frontend for ITIL Asset Management System.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Backend API running (see `/backend`)

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your backend URL
# VITE_API_URL=http://localhost:4000

# Start development server
npm run dev
```

App runs on http://localhost:5173

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/           # Page components
│   ├── layouts/         # Layout wrappers
│   ├── services/        # API services
│   ├── store/           # Zustand state management
│   ├── types/           # TypeScript types
│   ├── utils/           # Utility functions
│   ├── App.tsx          # Root component
│   └── main.tsx         # Entry point
├── index.html
├── vite.config.ts
└── package.json
```

## 🎨 Features

- **Authentication** - Login with JWT tokens
- **Asset Management** - View, create, update assets
- **Procurement** - Request and approve purchases
- **License Tracking** - Manage software licenses
- **Departments & Locations** - Organizational structure
- **Responsive UI** - Works on desktop and mobile

## 🔗 Pages

- `/` - Dashboard with stats overview
- `/login` - Authentication page
- `/assets` - Asset list and management
- `/assets/:id` - Asset detail view
- `/procurement` - Procurement requests
- `/licenses` - Software licenses
- `/departments` - Departments
- `/locations` - Locations

## 🛠️ Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Material-UI** - Component library
- **TanStack Query** - Data fetching
- **Zustand** - State management
- **Axios** - HTTP client
- **React Router** - Routing
- **React Hook Form** - Form handling

## 🌐 Deployment (Vercel)

### Automatic Deployment

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables:
   - `VITE_API_URL` - Backend API URL (Railway)
4. Deploy automatically on push

### Manual Deployment

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to Vercel
vercel --prod
```

## 🔧 Development

```bash
# Run dev server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🔐 Authentication

JWT token stored in localStorage via Zustand persist middleware:

```typescript
const { user, token, setAuth, logout } = useAuthStore()
```

All API requests automatically include the token via Axios interceptor.

## 📊 API Integration

Services in `/src/services` handle all API calls:

```typescript
// Example: Fetch assets
import { assetService } from '@/services/assetService'

const { data } = useQuery({
  queryKey: ['assets'],
  queryFn: () => assetService.getAssets(),
})
```

## 🎨 Theming

Material-UI theme configured in `src/main.tsx`:

```typescript
const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
})
```

## 📝 Environment Variables

```env
VITE_API_URL=http://localhost:4000
```

## 🚂 Railway + Vercel Stack

- **Backend**: Railway (Node.js API + PostgreSQL)
- **Frontend**: Vercel (React SPA)
- **Database**: Railway PostgreSQL (managed)

### Connect Frontend to Railway Backend

1. Deploy backend to Railway
2. Get Railway API URL (e.g., `https://itil-backend.railway.app`)
3. Set `VITE_API_URL` in Vercel environment variables
4. Redeploy frontend

## 🔗 Related

- Backend: `/backend` - Node.js + Express + Prisma
- Documentation: `/Plan & Implementation`, `/Schema & Flow`
