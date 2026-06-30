# ITIL Asset Management System

Hệ thống quản lý tài sản, thiết bị và license IT toàn diện cho tổ chức retail đa quốc gia.

## 📋 Tổng quan

**Phạm vi**: 70+ stores tại Vietnam, Cambodia, Laos  
**Tài sản**: 500+ IT assets (laptops, POS, printers, network devices)  
**Nhân sự**: 100+ office employees  
**Procurement**: 398 ITP records tracked

## 🎯 Mục tiêu

- ✅ **100% visibility** - Biết chính xác tài sản gì, ở đâu, ai đang dùng
- ✅ **Giảm 10-15% cost** - Tối ưu procurement, tránh mua thừa
- ✅ **Compliance** - License hợp lệ, audit trail đầy đủ
- ✅ **Tự động hóa workflow** - Procurement, approval, deployment

## 📁 Cấu trúc Repository

```
ITIL/
├── README.md                          # File này - tổng quan dự án
├── Plan & Implementation/
│   └── README.md                      # Kế hoạch triển khai 6 tháng chi tiết
├── Schema & Flow/
│   ├── README.md                      # Summary của technical docs
│   ├── 01-Database-Schema.md          # PostgreSQL schema (17 tables)
│   ├── 02-Database-Schema-Extended.md # Supporting tables & functions
│   ├── 03-Process-Flows.md            # Business process flowcharts
│   ├── 04-API-Endpoints.md            # RESTful API specification
│   ├── 05-Data-Migration-Guide.md     # Excel → Database migration
│   ├── 06-Migration-Checklist.md      # 4-week migration timeline
│   ├── 07-Technical-Stack.md          # Technology choices
│   └── 08-Deployment-Guide.md         # AWS/On-premise deployment
└── Data/
    ├── Infra Management.xlsx          # Main asset inventory
    ├── LICENSE MMA.xlsx               # License tracking
    ├── Procurement & Request Management.xlsx
    ├── Asset management/              # Office, Store, Warehouse
    ├── Audit 2026 device/             # Audit data
    └── _PUR_Docs/                     # ITP00001-ITP00398 folders

```

## 🚀 Quick Start

### Để hiểu dự án
👉 **Bắt đầu tại**: `Plan & Implementation/README.md`

### Để develop
👉 **Đọc**: `Schema & Flow/` folder (technical documentation)

### Để deploy
👉 **Đọc**: `Schema & Flow/08-Deployment-Guide.md`

## 📊 Hiện trạng

### Data Sources (Excel)
- **955 files** tổng cộng
- **6 core Excel files** chứa master data
- **40+ per-store files** cho Store inventory
- **398 ITP folders** với procurement PDFs
- **2000+ documents** cần migrate

### Pain Points
- ❌ Data scattered across nhiều Excel files
- ❌ Manual copy-paste giữa files
- ❌ Không real-time tracking
- ❌ Hard to audit changes
- ❌ Duplicate risk cao

## 🎯 Giải pháp

### Phase 1-6 Implementation (6 tháng)

**Phase 1** (Tháng 1-2): Foundation  
→ Database setup, data migration

**Phase 2** (Tháng 3-4): Procurement Workflow  
→ Digital procurement process

**Phase 3** (Tháng 5-6): Asset Lifecycle  
→ Assignment, maintenance, retirement

**Phase 4** (Tháng 7): License Management  
→ Compliance & optimization

**Phase 5** (Tháng 8): Reporting & Analytics  
→ Dashboard cho management

**Phase 6** (Tháng 9-10): Integration  
→ Connect HR, Accounting systems

## 🏗️ Technical Architecture

```
Frontend (React + TypeScript)
        ↓
    REST API (Node.js + Express)
        ↓
PostgreSQL Database (17 tables)
        ↓
    File Storage (S3 or local)
```

**Key Features**:
- JWT authentication
- Role-based access control
- Real-time notifications
- Document management
- Audit trail
- Advanced reporting

## 💰 Budget & ROI

### Development Cost
- Team: $70,000 - $110,000 (6 months)
- Infrastructure: $500 - $1,000/month
- **Total Dev**: ~$70K-110K

### Operational Cost
- Hosting: $6K-12K/year
- Maintenance: $10K-20K/year
- **Total Annual**: $16K-32K

### Expected Benefits
- Time savings: **$52K/year**
- Cost avoidance: **$30K/year**
- **Total benefit**: $82K/year
- **Payback**: 12-18 months

## 📖 Documentation

### Business Documents
- [Plan & Implementation](Plan%20%26%20Implementation/README.md) - Roadmap, phases, budget

### Technical Documents
- [Database Schema](Schema%20%26%20Flow/01-Database-Schema.md) - PostgreSQL tables
- [API Endpoints](Schema%20%26%20Flow/04-API-Endpoints.md) - RESTful API spec
- [Migration Guide](Schema%20%26%20Flow/05-Data-Migration-Guide.md) - Excel → DB
- [Deployment Guide](Schema%20%26%20Flow/08-Deployment-Guide.md) - Production setup

### Process Documents
- [Process Flows](Schema%20%26%20Flow/03-Process-Flows.md) - Business workflows
- [Migration Checklist](Schema%20%26%20Flow/06-Migration-Checklist.md) - 4-week plan

## 🔧 Technology Stack

**Backend**: Node.js + Express + Prisma ORM  
**Frontend**: React + TypeScript + Material-UI  
**Database**: PostgreSQL 15+  
**Storage**: AWS S3 or local filesystem  
**Deployment**: AWS (ECS/RDS) or On-premise

## 📈 Success Metrics

**Operational**:
- 100% assets tracked in database
- Procurement cycle: 30 days → 15 days
- License compliance: 100%
- Audit variance: < 2%

**Business**:
- 10-15% cost savings on procurement
- 20 hours/week time savings
- User satisfaction > 4/5

## 🎓 Next Steps

### Week 1
- [ ] Review documentation với stakeholders
- [ ] Get budget approval
- [ ] Assign team members

### Month 1
- [ ] Setup development environment
- [ ] Create database schema
- [ ] Extract data from Excel

### Month 2-6
- [ ] Develop features (按 phases)
- [ ] Testing & QA
- [ ] User training
- [ ] Production deployment

## 📞 Contact

**Project Owner**: IT Manager  
**Technical Lead**: [TBD]  
**Data Lead**: [TBD]

---

**Document Version**: 1.0  
**Created**: 2026-06-30  
**Status**: ✅ Documentation Complete - Ready for Implementation
