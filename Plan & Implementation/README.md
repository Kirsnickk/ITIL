# ITIL Asset Management - Plan & Implementation

## 📋 Tổng quan (Overview)

Hệ thống quản lý tài sản IT toàn diện cho tổ chức multi-brand retail với:
- **3 quốc gia**: Vietnam, Cambodia, Laos
- **70+ stores** phân tán
- **100+ office employees**
- **500+ IT assets** (laptops, POS, printers, network devices)
- **Multiple brands**: Bata, Crocs, New Balance, etc.

## 🎯 Mục tiêu (Objectives)

### Business Goals
1. **Tăng visibility** - Biết chính xác tài sản gì, ở đâu, ai đang dùng
2. **Giảm cost** - Tối ưu procurement, tránh mua thừa, theo dõi warranty
3. **Compliance** - Đảm bảo license hợp lệ, audit trail đầy đủ
4. **Efficiency** - Tự động hóa workflow procurement, request, handover

### Technical Goals
1. Centralized database - Single source of truth
2. Real-time tracking - Asset lifecycle từ purchase đến retire
3. Automated workflows - Procurement, approval, deployment
4. Dashboard & reporting - Insight nhanh cho management
5. Integration ready - Kết nối với accounting, HR, vendor systems

## 📊 Hiện trạng (Current State Analysis)

### Điểm mạnh (Strengths)
✅ Đã có dữ liệu chi tiết trong Excel (955 files)
✅ Có workflow procurement rõ ràng (ITP00001 - ITP00398)
✅ Tracking theo location (Office/Store/Warehouse)
✅ License management structured (Office/Store/Warehouse)
✅ Handover documents đầy đủ

### Vấn đề (Pain Points)
❌ **Data scattered** - Nhiều files Excel riêng lẻ, khó consolidate
❌ **Manual process** - Copy-paste giữa các files, dễ sai
❌ **No real-time** - Phải mở nhiều files để biết asset status
❌ **Hard to audit** - Tìm lịch sử thay đổi asset khó
❌ **Duplication risk** - Asset IDs, serial numbers có thể duplicate
❌ **Scaling issue** - Mỗi store mới = thêm Excel files

### Data Quality Issues
- Asset IDs không consistent (VA01-LAPTOP-001 vs VA01_LT_001)
- Serial numbers missing ở một số devices
- Status không standardized (Active, Using, In Use, Deployed)
- License assignments không sync với actual users

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                    │
├──────────────┬────────────────┬─────────────────────────┤
│   Web App    │   Mobile App   │    API Gateway          │
│  (React/Vue) │    (Optional)  │   (REST/GraphQL)        │
└──────────────┴────────────────┴─────────────────────────┘
                         │
┌─────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                      │
├──────────────┬────────────────┬─────────────────────────┤
│ Asset Mgmt   │ Procurement    │   License Mgmt          │
│ Module       │ Module         │   Module                │
├──────────────┼────────────────┼─────────────────────────┤
│ Workflow     │ Notification   │   Reporting             │
│ Engine       │ Service        │   Engine                │
└──────────────┴────────────────┴─────────────────────────┘
                         │
┌─────────────────────────────────────────────────────────┐
│                      DATA LAYER                          │
├──────────────┬────────────────┬─────────────────────────┤
│  PostgreSQL  │   File Storage │   Cache (Redis)         │
│  (Main DB)   │   (Docs/Images)│   (Optional)            │
└──────────────┴────────────────┴─────────────────────────┘
                         │
┌─────────────────────────────────────────────────────────┐
│                  INTEGRATION LAYER                       │
├──────────────┬────────────────┬─────────────────────────┤
│  Email/SMTP  │   HR System    │   Accounting System     │
│  (Notif)     │   (Employees)  │   (Payments)            │
└──────────────┴────────────────┴─────────────────────────┘
```

## 📅 Implementation Roadmap

### Phase 1: Foundation (Tháng 1-2) - 8 weeks
**Goal**: Xây nền móng - Database, core models, data migration

#### Week 1-2: Database Design & Setup
- [ ] Finalize database schema (xem Schema & Flow folder)
- [ ] Setup PostgreSQL database
- [ ] Create tables với indexes, constraints
- [ ] Setup backup & recovery procedures

#### Week 3-4: Data Migration
- [ ] Extract data từ Excel files sang structured format
- [ ] Clean & normalize data (Asset IDs, statuses, dates)
- [ ] Validate data integrity (no duplicates, missing fields)
- [ ] Import vào database với audit trail

#### Week 5-6: Core API Development
- [ ] Setup backend framework (Node.js/Express hoặc Python/FastAPI)
- [ ] Implement authentication & authorization (JWT)
- [ ] Create RESTful APIs cho:
  - Assets CRUD operations
  - Licenses management
  - Basic search & filter

#### Week 7-8: Basic Web Interface
- [ ] Setup frontend framework (React/Vue)
- [ ] Create layout & navigation
- [ ] Implement pages:
  - Asset list/detail view
  - License dashboard
  - Search functionality
- [ ] Connect frontend với APIs

**Deliverables Phase 1:**
- ✅ Working database với full data migrated
- ✅ RESTful API documented (Swagger/OpenAPI)
- ✅ Basic web app có thể view/search assets
- ✅ Admin có thể CRUD assets manually

---

### Phase 2: Procurement Workflow (Tháng 3-4) - 8 weeks
**Goal**: Digitize procurement process - từ request đến payment

#### Week 1-2: Procurement Data Model
- [ ] Design workflow states & transitions
- [ ] Create procurement tables (requests, approvals, vendors)
- [ ] Implement document attachment storage
- [ ] Build approval routing logic

#### Week 3-4: Request Management
- [ ] Request creation form (item specs, quantity, justification)
- [ ] Auto-generate ITP numbers
- [ ] File upload (quotations, specs, images)
- [ ] Email notifications to approvers

#### Week 5-6: Approval Workflow
- [ ] Multi-level approval chain (Manager → Finance → Director)
- [ ] Approval actions (Approve, Reject, Request Changes)
- [ ] Comments & feedback system
- [ ] Approval history & audit log

#### Week 7-8: Vendor & Contract Management
- [ ] Vendor database (name, contact, rating, history)
- [ ] Contract tracking (start/end dates, renewal alerts)
- [ ] Payment tracking (requested, approved, paid)
- [ ] Integration với accounting system (optional)

**Deliverables Phase 2:**
- ✅ Full procurement workflow digitized
- ✅ Email notifications tự động
- ✅ Document storage system
- ✅ Dashboard cho procurement pipeline

---

### Phase 3: Asset Lifecycle (Tháng 5-6) - 8 weeks
**Goal**: Track full lifecycle - từ mua về đến retire

#### Week 1-2: Deployment & Assignment
- [ ] Handover form digital (employee signs, upload photos)
- [ ] QR code generation cho mỗi asset
- [ ] Assignment history tracking
- [ ] Location tracking (office/store/warehouse/repair)

#### Week 3-4: Maintenance & Support
- [ ] Maintenance schedule (warranty dates, service contracts)
- [ ] Issue reporting (employee báo lỗi device)
- [ ] Repair tracking (sent to vendor, status, return date)
- [ ] Device health monitoring (optional - agent on laptops)

#### Week 5-6: Transfer & Retirement
- [ ] Transfer workflow (employee đổi store, quit, etc.)
- [ ] Data wipe verification before retirement
- [ ] Disposal tracking (sold, donated, recycled)
- [ ] Asset depreciation calculation

#### Week 7-8: Audit Support
- [ ] Audit checklist templates
- [ ] Physical verification workflow (scan QR, confirm condition)
- [ ] Variance reporting (database vs physical)
- [ ] Export audit reports (Excel, PDF)

**Deliverables Phase 3:**
- ✅ QR code labels cho all assets
- ✅ Mobile-friendly handover form
- ✅ Maintenance schedule dashboard
- ✅ Audit tool for yearly verification

---

### Phase 4: License Management (Tháng 7) - 4 weeks
**Goal**: Compliance & cost optimization for software licenses

#### Week 1-2: License Tracking
- [ ] License inventory (Office 365, Adobe, AutoCAD, etc.)
- [ ] Assignments tracking (who has which license)
- [ ] Usage monitoring (active vs inactive)
- [ ] Expiration alerts (30/60/90 days before)

#### Week 3-4: Compliance & Optimization
- [ ] License compliance dashboard (assigned vs purchased)
- [ ] Cost analysis (per user, per department)
- [ ] Renewal workflow (vendor quotes, approval)
- [ ] License reclaim từ resigned employees

**Deliverables Phase 4:**
- ✅ License dashboard với compliance status
- ✅ Auto-alerts for expiring licenses
- ✅ Cost optimization recommendations

---

### Phase 5: Reporting & Analytics (Tháng 8) - 4 weeks
**Goal**: Insights cho management decision-making

#### Week 1-2: Standard Reports
- [ ] Asset summary by location/type/brand
- [ ] Procurement spend analysis (by month, vendor, category)
- [ ] License utilization rates
- [ ] Maintenance cost trending

#### Week 3-4: Advanced Analytics
- [ ] Asset aging analysis (devices nearing end-of-life)
- [ ] Predictive maintenance (failure patterns)
- [ ] Budget forecasting (based on historical spend)
- [ ] Custom report builder

**Deliverables Phase 5:**
- ✅ Pre-built report templates
- ✅ Export to Excel/PDF
- ✅ Scheduled reports (email weekly/monthly)
- ✅ Executive dashboard

---

### Phase 6: Integration & Optimization (Tháng 9-10) - 8 weeks
**Goal**: Connect với external systems, optimize performance

#### Week 1-2: HR Integration
- [ ] Sync employee data (new hires, resignations, transfers)
- [ ] Auto-provisioning workflow (new employee → laptop request)
- [ ] Auto-deprovisioning (resigned → return asset reminder)

#### Week 3-4: Accounting Integration
- [ ] Push approved payments to accounting system
- [ ] Sync vendor information
- [ ] Budget allocation tracking

#### Week 5-6: Performance Optimization
- [ ] Database query optimization
- [ ] API response time improvements
- [ ] Frontend loading speed optimization
- [ ] Mobile responsiveness tuning

#### Week 7-8: Security Hardening
- [ ] Security audit & penetration testing
- [ ] Role-based access control refinement
- [ ] Data encryption at rest and in transit
- [ ] Backup & disaster recovery testing

**Deliverables Phase 6:**
- ✅ Seamless integration với HR/Accounting
- ✅ Sub-second response times
- ✅ Security certification ready
- ✅ 99.9% uptime SLA

---

## 🚀 Quick Win Strategy

Trong khi chờ full system, implement các "quick wins" để có value ngay:

### Week 1: Asset Dashboard Spreadsheet Template
- Consolidate key metrics từ scattered files
- Auto-refresh macros
- Share-point hoặc Google Sheets cho real-time collab

### Week 2-3: Procurement Request Form
- Google Forms hoặc Microsoft Forms
- Auto-populate Excel tracker
- Email notifications via automation (Zapier/Power Automate)

### Week 4: QR Code Generation Script
- Python script generate QR codes từ existing Asset IDs
- Print labels cho assets
- Start physical tagging process

## 📏 Success Metrics (KPIs)

### Operational Metrics
- **Asset visibility**: 100% assets có Asset ID, location, và owner
- **Procurement cycle time**: Giảm từ 30 days xuống 15 days
- **License compliance**: 100% licenses assigned correctly
- **Audit variance**: < 2% difference giữa database và physical count

### Business Metrics
- **Cost savings**: 10-15% giảm unnecessary purchases
- **Time savings**: 20 hours/week giảm manual Excel work
- **User satisfaction**: > 4/5 rating từ IT team và employees

### Technical Metrics
- **System uptime**: > 99% availability
- **API response time**: < 200ms for 95% of requests
- **Data accuracy**: > 98% data quality score

## 👥 Team & Roles

### Core Team
- **Project Manager** (1): Overall coordination, stakeholder management
- **Backend Developer** (1-2): API, database, integrations
- **Frontend Developer** (1): Web interface, UX/UI
- **Data Analyst** (1): Migration, reporting, analytics
- **QA Engineer** (0.5): Testing, validation

### Stakeholders
- **IT Manager**: Sponsor, final approver
- **Finance/Accounting**: Procurement approval, payment tracking
- **Store Managers**: Asset owners tại stores
- **HR**: Employee data sync

## 💰 Budget Estimate

### Development Cost (6 months)
- Team salaries: $60,000 - $100,000 (depending on location/seniority)
- Infrastructure (cloud hosting, database): $500 - $1,000/month
- Tools & licenses (dev tools, testing): $200/month
- **Total Dev Phase**: ~$70,000 - $110,000

### Operational Cost (per year)
- Hosting & infrastructure: $6,000 - $12,000
- Maintenance & support: $10,000 - $20,000
- **Total Annual**: $16,000 - $32,000

### ROI Projection
- Time savings: 20 hrs/week * $50/hr * 52 weeks = **$52,000/year**
- Cost avoidance (optimized procurement): **$30,000/year**
- **Total benefit**: $82,000/year
- **Payback period**: ~12-18 months

---

*Xem thêm chi tiết kỹ thuật tại folder `Schema & Flow`*
