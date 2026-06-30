# Database Schema - Extended Tables

## 🔧 Maintenance & Support Tables

### 13. maintenance_records
Tracking repairs, services, issues

```sql
CREATE TABLE maintenance_records (
    id SERIAL PRIMARY KEY,
    asset_id INTEGER REFERENCES assets(id) ON DELETE CASCADE,
    maintenance_type VARCHAR(50) CHECK (maintenance_type IN ('REPAIR', 'SERVICE', 'INSPECTION', 'UPGRADE', 'WARRANTY_CLAIM')),
    issue_description TEXT NOT NULL,
    resolution_description TEXT,
    reported_by INTEGER REFERENCES employees(id),
    reported_date DATE NOT NULL,
    assigned_to VARCHAR(100),  -- Vendor or internal technician
    start_date DATE,
    completion_date DATE,
    status VARCHAR(20) CHECK (status IN ('REPORTED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')) DEFAULT 'REPORTED',
    cost DECIMAL(10,2),
    warranty_covered BOOLEAN DEFAULT FALSE,
    downtime_hours INTEGER,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_maint_asset ON maintenance_records(asset_id);
CREATE INDEX idx_maint_status ON maintenance_records(status);
CREATE INDEX idx_maint_dates ON maintenance_records(reported_date, completion_date);
```

### 14. audit_logs
Complete audit trail for compliance

```sql
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    table_name VARCHAR(50) NOT NULL,
    record_id INTEGER NOT NULL,
    action VARCHAR(20) CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')) NOT NULL,
    old_values JSONB,  -- Previous state
    new_values JSONB,  -- New state
    changed_fields TEXT[],  -- Array of changed field names
    user_id INTEGER REFERENCES users(id),
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);
CREATE INDEX idx_audit_action ON audit_logs(action);
```

### 15. documents
Central document storage (PDFs, images, contracts)

```sql
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    document_type VARCHAR(50),  -- Invoice, Quotation, Contract, Handover, Photo
    related_table VARCHAR(50),  -- 'procurements', 'assets', 'contracts'
    related_id INTEGER NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,  -- S3 path or local path
    file_size_bytes BIGINT,
    mime_type VARCHAR(100),
    uploaded_by INTEGER REFERENCES users(id),
    description TEXT,
    tags TEXT[],  -- For searchability
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_docs_related ON documents(related_table, related_id);
CREATE INDEX idx_docs_type ON documents(document_type);
CREATE INDEX idx_docs_uploaded ON documents(uploaded_by);
CREATE INDEX idx_docs_tags ON documents USING GIN(tags);  -- Full-text search on tags
```

### 16. users
System users (IT staff, managers, admin)

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role VARCHAR(50) CHECK (role IN ('ADMIN', 'IT_MANAGER', 'IT_STAFF', 'FINANCE', 'STORE_MANAGER', 'VIEWER')),
    employee_id INTEGER REFERENCES employees(id),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    failed_login_attempts INTEGER DEFAULT 0,
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
```

### 17. notifications
In-app notifications & email queue

```sql
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    notification_type VARCHAR(50),  -- APPROVAL_NEEDED, ASSET_ASSIGNED, LICENSE_EXPIRING
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    related_table VARCHAR(50),
    related_id INTEGER,
    priority VARCHAR(20) CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')) DEFAULT 'MEDIUM',
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    email_sent BOOLEAN DEFAULT FALSE,
    email_sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notif_user ON notifications(user_id);
CREATE INDEX idx_notif_read ON notifications(is_read);
CREATE INDEX idx_notif_type ON notifications(notification_type);
CREATE INDEX idx_notif_created ON notifications(created_at);
```

## 🔗 Relationship Summary

```
employees (1) ----< (N) asset_assignments
employees (1) ----< (N) license_assignments
employees (1) ----< (N) procurements (requestor)
employees (1) ----< (N) maintenance_records (reporter)

assets (1) ----< (N) asset_assignments
assets (1) ----< (N) maintenance_records
assets (N) >---- (1) asset_types
assets (N) >---- (1) procurements

licenses (1) ----< (N) license_assignments
licenses (N) >---- (1) contracts

procurements (1) ----< (N) procurement_items
procurements (1) ----< (N) procurement_approvals
procurements (N) >---- (1) vendors

contracts (N) >---- (1) vendors

stores (1) ----< (N) assets (location)
stores (1) ----< (N) asset_assignments

documents (N) >---- (1) procurements/assets/contracts (polymorphic)

users (1) ----< (N) notifications
users (1) ----< (N) audit_logs
users (N) >---- (1) employees (optional link)
```

## 📊 Views for Common Queries

### v_current_asset_assignments
Current assignment status for all assets

```sql
CREATE VIEW v_current_asset_assignments AS
SELECT 
    a.id AS asset_id,
    a.asset_id AS asset_code,
    a.asset_type_id,
    at.name AS asset_type,
    a.serial_number,
    a.model,
    a.brand,
    a.location_type,
    a.status,
    aa.assigned_to_type,
    aa.assigned_to_id,
    CASE 
        WHEN aa.assigned_to_type = 'EMPLOYEE' THEN e.full_name
        WHEN aa.assigned_to_type = 'STORE' THEN s.store_name
        ELSE NULL
    END AS assigned_to_name,
    aa.assignment_date,
    aa.handover_document_url
FROM assets a
LEFT JOIN asset_types at ON a.asset_type_id = at.id
LEFT JOIN asset_assignments aa ON a.id = aa.asset_id 
    AND aa.assignment_status = 'ACTIVE'
LEFT JOIN employees e ON aa.assigned_to_type = 'EMPLOYEE' AND aa.assigned_to_id = e.id
LEFT JOIN stores s ON aa.assigned_to_type = 'STORE' AND aa.assigned_to_id = s.id
WHERE a.status != 'RETIRED';
```

### v_license_utilization
License usage summary

```sql
CREATE VIEW v_license_utilization AS
SELECT 
    l.id AS license_id,
    l.license_type,
    l.total_seats,
    COUNT(la.id) FILTER (WHERE la.status = 'ACTIVE') AS assigned_seats,
    l.total_seats - COUNT(la.id) FILTER (WHERE la.status = 'ACTIVE') AS available_seats,
    ROUND(100.0 * COUNT(la.id) FILTER (WHERE la.status = 'ACTIVE') / l.total_seats, 2) AS utilization_percent,
    l.expiry_date,
    CASE 
        WHEN l.expiry_date < CURRENT_DATE THEN 'EXPIRED'
        WHEN l.expiry_date < CURRENT_DATE + INTERVAL '30 days' THEN 'EXPIRING_SOON'
        ELSE 'ACTIVE'
    END AS expiry_status
FROM licenses l
LEFT JOIN license_assignments la ON l.id = la.license_id
WHERE l.status = 'ACTIVE'
GROUP BY l.id;
```

### v_procurement_pipeline
Procurement status dashboard

```sql
CREATE VIEW v_procurement_pipeline AS
SELECT 
    p.id,
    p.itp_number,
    p.description,
    p.procurement_type,
    p.estimated_cost,
    p.actual_cost,
    p.request_date,
    e.full_name AS requestor,
    e.department,
    v.vendor_name,
    p.approval_status,
    p.delivery_status,
    p.payment_status,
    COUNT(pi.id) AS total_items,
    SUM(pi.quantity) AS total_quantity,
    CURRENT_DATE - p.request_date AS days_pending
FROM procurements p
LEFT JOIN employees e ON p.requestor_id = e.id
LEFT JOIN vendors v ON p.vendor_id = v.id
LEFT JOIN procurement_items pi ON p.id = pi.procurement_id
GROUP BY p.id, e.full_name, e.department, v.vendor_name;
```

## 🔐 Database Functions & Triggers

### Auto-update timestamps

```sql
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_assets_timestamp BEFORE UPDATE ON assets
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_employees_timestamp BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_stores_timestamp BEFORE UPDATE ON stores
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Repeat for other tables...
```

### Audit trail trigger

```sql
CREATE OR REPLACE FUNCTION log_audit()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_values)
        VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', row_to_json(OLD));
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values)
        VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', row_to_json(OLD), row_to_json(NEW));
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO audit_logs (table_name, record_id, action, new_values)
        VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', row_to_json(NEW));
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Apply audit to critical tables
CREATE TRIGGER audit_assets AFTER INSERT OR UPDATE OR DELETE ON assets
    FOR EACH ROW EXECUTE FUNCTION log_audit();

CREATE TRIGGER audit_procurements AFTER INSERT OR UPDATE OR DELETE ON procurements
    FOR EACH ROW EXECUTE FUNCTION log_audit();
```

### Auto-generate ITP numbers

```sql
CREATE SEQUENCE itp_sequence START 1;

CREATE OR REPLACE FUNCTION generate_itp_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.itp_number IS NULL THEN
        NEW.itp_number := 'ITP' || LPAD(nextval('itp_sequence')::TEXT, 5, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_itp_number BEFORE INSERT ON procurements
    FOR EACH ROW EXECUTE FUNCTION generate_itp_number();
```

---

*Next: 03-Process-Flows.md*
