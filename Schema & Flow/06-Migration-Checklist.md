# Migration Checklist - Excel to Database

## ✅ Pre-Migration Checklist

### Week 0: Preparation
- [ ] **Backup all Excel files**
  - Copy entire ITIL folder to external drive
  - Zip archive with timestamp: `ITIL_backup_2026-06-30.zip`
  - Store in 3 locations (local, network, cloud)

- [ ] **Setup development environment**
  - Install PostgreSQL 15+
  - Install Python 3.11+ with pandas, openpyxl, psycopg2
  - Setup virtual environment
  - Clone migration scripts repository

- [ ] **Database server setup**
  - Provision server (cloud or on-premise)
  - Configure PostgreSQL with proper memory/disk
  - Setup backup schedule
  - Configure SSL/TLS
  - Create database user accounts with proper permissions

- [ ] **Stakeholder communication**
  - Announce migration timeline
  - Schedule downtime window (if needed)
  - Train key users on new system
  - Setup support channel for issues

---

## 📊 Week 1: Data Extraction & Cleaning

### Day 1-2: Extract to CSV
- [ ] Run extraction script on all 955 Excel files
- [ ] Verify CSV outputs (spot-check 10 files)
- [ ] Document any extraction errors
- [ ] **Deliverable**: `/migration/csv/` folder with all extracted CSVs

### Day 3-4: Data Cleaning
- [ ] Standardize Asset IDs
- [ ] Normalize status values
- [ ] Clean serial numbers (uppercase, trim)
- [ ] Parse dates to YYYY-MM-DD format
- [ ] Fix email formats
- [ ] Remove duplicate records
- [ ] **Deliverable**: `/migration/csv_cleaned/` folder

### Day 5: Data Validation
- [ ] Run validation scripts
- [ ] Generate data quality report
- [ ] Identify critical issues (blocking import)
- [ ] Identify warnings (can import but needs review)
- [ ] Create issue tracker spreadsheet
- [ ] **Deliverable**: `data_quality_report.xlsx`

---

## 🗄️ Week 2: Database Setup & Reference Data

### Day 1-2: Database Creation
- [ ] Create database: `itil_asset_mgmt`
- [ ] Run schema scripts (01-04)
- [ ] Verify all tables created
- [ ] Verify all indexes created
- [ ] Verify all triggers working
- [ ] **Test**: Insert dummy record, verify audit log captured

### Day 3: Reference Data Import
- [ ] Import asset_types (12 types)
- [ ] Import stores (70+ stores)
- [ ] Import vendors (from procurement docs)
- [ ] Verify foreign key constraints
- [ ] **Test**: Try to insert asset with invalid asset_type_id (should fail)

### Day 4-5: Create Migration Users & Permissions
- [ ] Create `migration_admin` user (full access)
- [ ] Create `app_user` user (application runtime)
- [ ] Create `readonly_user` user (reporting)
- [ ] Test permissions
- [ ] Document credentials securely

---

## 📥 Week 3: Core Data Import

### Day 1: Employees Import
- [ ] Import from `Office assets.xlsx` + `Employees.xlsx`
- [ ] Deduplicate records
- [ ] Mark resigned employees
- [ ] Verify count: expect ~100 records
- [ ] **Test**: Query employees by department

### Day 2: Procurements Import
- [ ] Import from `Procurement & Request Management.xlsx`
- [ ] Import procurement_items
- [ ] Link to vendors
- [ ] Verify count: expect ~416 procurements
- [ ] **Test**: Get procurement with items

### Day 3: Assets Import (Main Event!)
- [ ] Import from `Infra Management.xlsx` (Asset_Store, Asset_Office sheets)
- [ ] Import from Store Dashboard + Details
- [ ] Import from Warehouse assets
- [ ] Verify count: expect ~500 assets
- [ ] **Critical Test**: Check no duplicate asset_ids or serial_numbers

### Day 4: Asset Assignments Import
- [ ] Link assets to employees (from Office assets.xlsx)
- [ ] Link assets to stores (from Store Dashboard)
- [ ] Set assignment dates
- [ ] Upload handover documents (where available)
- [ ] **Test**: Get employee with assigned assets

### Day 5: Licenses Import
- [ ] Import from `LICENSE MMA.xlsx` (Office, Store, Warehouse sheets)
- [ ] Create license records (Office 365, Adobe, etc.)
- [ ] Import license_assignments
- [ ] Calculate utilization
- [ ] **Test**: Check license utilization view

---

## 🔧 Week 4: Document Upload & Validation

### Day 1-3: Upload Procurement Documents
- [ ] Scan `_PUR_Docs/ITP00001-ITP00398/` folders
- [ ] Upload PDFs to file storage (S3 or local)
- [ ] Link documents to procurement records
- [ ] Verify counts: expect ~2000+ documents
- [ ] **Test**: Open procurement, download attached invoice PDF

### Day 4: Upload Handover Documents
- [ ] Scan `Handover document/` folders
- [ ] Link to asset_assignments
- [ ] **Test**: View asset assignment history with documents

### Day 5: Data Validation & Reconciliation
- [ ] Run full database validation
- [ ] Compare record counts: Excel vs Database
- [ ] Spot-check 20 random assets (compare Excel vs DB)
- [ ] Check referential integrity (all FKs valid)
- [ ] Generate reconciliation report
- [ ] **Deliverable**: `migration_validation_report.pdf`

---

## 🚀 Go-Live Checklist

### Pre-Launch (Day before)
- [ ] Full database backup
- [ ] Deploy application to production server
- [ ] Configure production database connection
- [ ] SSL/TLS verification
- [ ] Load testing (100 concurrent users)
- [ ] Security scan (OWASP)
- [ ] Final data sync (if any changes in Excel during migration)

### Launch Day
- [ ] **09:00** - Final database backup
- [ ] **09:30** - Switch DNS/URL to new application
- [ ] **10:00** - IT team login test
- [ ] **10:30** - Finance team login test
- [ ] **11:00** - Store managers login test
- [ ] **13:00** - All-hands announcement: System is live!
- [ ] **14:00** - Monitor server metrics
- [ ] **17:00** - End-of-day report

### Post-Launch (Week 1)
- [ ] Daily health checks
- [ ] Monitor error logs
- [ ] Collect user feedback
- [ ] Fix critical bugs (hotfix)
- [ ] Schedule non-critical fixes for next release
- [ ] Archive old Excel files (DO NOT DELETE - keep for audit)

---

## 🔍 Validation Queries

### Assets Count Reconciliation
```sql
-- Database
SELECT location_type, COUNT(*) 
FROM assets 
WHERE status != 'RETIRED'
GROUP BY location_type;

-- Compare with Excel:
-- Office assets.xlsx: ~103 records
-- Store Dashboard.xlsx: ~498 records
-- Warehouse: ~50 records
```

### License Assignments Check
```sql
-- All licenses should be within seat limits
SELECT 
    l.license_type,
    l.total_seats,
    COUNT(la.id) as assigned,
    CASE 
        WHEN COUNT(la.id) > l.total_seats THEN '❌ OVER-ASSIGNED'
        ELSE '✓ OK'
    END as status
FROM licenses l
LEFT JOIN license_assignments la ON l.id = la.license_id AND la.status = 'ACTIVE'
GROUP BY l.id, l.license_type, l.total_seats
HAVING COUNT(la.id) > l.total_seats;  -- Should return 0 rows
```

### Orphaned Records Check
```sql
-- Assets without valid location
SELECT asset_id, location_type, location_id
FROM assets
WHERE location_type = 'STORE' 
  AND location_id NOT IN (SELECT id FROM stores);
-- Should return 0 rows

-- Assignments without valid employee
SELECT aa.id, aa.assigned_to_id
FROM asset_assignments aa
WHERE aa.assigned_to_type = 'EMPLOYEE'
  AND aa.assigned_to_id NOT IN (SELECT id FROM employees);
-- Should return 0 rows
```

---

## ⚠️ Rollback Plan

### If Critical Issues Found During Migration

#### Scenario 1: Data Import Fails
- **Action**: Fix data cleaning scripts, re-run import
- **Impact**: Low (still in migration phase)
- **Decision**: Continue with fixed data

#### Scenario 2: Go-Live Issues (Minor)
- **Action**: Hotfix in production, monitor closely
- **Impact**: Medium (users see minor bugs)
- **Decision**: Proceed, fix quickly

#### Scenario 3: Go-Live Issues (Critical)
- **Action**: ROLLBACK to Excel-based process
- **Impact**: High (system unusable)
- **Steps**:
  1. Announce rollback to all users
  2. Restore Excel files from backup
  3. Continue using Excel temporarily
  4. Fix issues in staging environment
  5. Schedule new go-live date

### Rollback Triggers
- **CRITICAL**: 50%+ of users cannot login
- **CRITICAL**: Data corruption detected
- **CRITICAL**: Security breach identified
- **Major**: 30%+ of core features broken
- **Major**: Performance degradation (>10s page load)

---

## 📈 Success Metrics

### Week 1 Post-Launch
- [ ] System uptime > 95%
- [ ] Average page load < 2 seconds
- [ ] Zero critical bugs
- [ ] < 5 minor bugs reported
- [ ] 80%+ of users successfully logged in

### Month 1 Post-Launch
- [ ] 100% of assets in database
- [ ] 90%+ of employees using system daily
- [ ] All procurement requests submitted via system
- [ ] Excel files archived (not actively used)
- [ ] User satisfaction score > 4/5

---

*Migration complete! Next: 07-Technical-Stack.md*
