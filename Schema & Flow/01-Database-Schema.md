# Database Schema - ITIL Asset Management

## 📊 Overview

PostgreSQL database với 15 core tables, quan hệ normalized đến 3NF, support full audit trail.

## 🗄️ Core Tables

### 1. assets
Bảng chính cho tất cả IT assets (laptops, POS, printers, network devices)

```sql
CREATE TABLE assets (
    id SERIAL PRIMARY KEY,
    asset_id VARCHAR(50) UNIQUE NOT NULL,  -- VA01-LAPTOP-001, VH02-POS-002
    asset_type_id INTEGER REFERENCES asset_types(id),
    serial_number VARCHAR(100) UNIQUE,
    model VARCHAR(100),
    brand VARCHAR(50),
    purchase_date DATE,
    purchase_price DECIMAL(12,2),
    warranty_end_date DATE,
    location_type VARCHAR(20) CHECK (location_type IN ('OFFICE', 'STORE', 'WAREHOUSE', 'REPAIR', 'RETIRED')),
    location_id INTEGER,  -- Foreign key to stores/offices/warehouses
    status VARCHAR(20) CHECK (status IN ('ACTIVE', 'ASSIGNED', 'AVAILABLE', 'REPAIR', 'RETIRED', 'LOST')),
    condition VARCHAR(20) CHECK (condition IN ('NEW', 'GOOD', 'FAIR', 'POOR', 'BROKEN')),
    procurement_id INTEGER REFERENCES procurements(id),
    notes TEXT,
    qr_code VARCHAR(255),  -- URL to QR code image
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id)
);

CREATE INDEX idx_assets_asset_id ON assets(asset_id);
CREATE INDEX idx_assets_serial ON assets(serial_number);
CREATE INDEX idx_assets_location ON assets(location_type, location_id);
CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_assets_type ON assets(asset_type_id);
```

### 2. asset_types
Phân loại asset (Laptop, Desktop, POS PC, Printer, Scanner, Network Device, etc.)

```sql
CREATE TABLE asset_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,  -- Laptop, Desktop, POS PC, Printer
    category VARCHAR(50),  -- Computing, Printing, Networking, Peripherals
    typical_lifespan_months INTEGER,  -- 36 for laptops, 60 for printers
    requires_license BOOLEAN DEFAULT FALSE,  -- Does this need software licenses?
    depreciation_rate DECIMAL(5,2),  -- Annual depreciation %
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample data
INSERT INTO asset_types (name, category, typical_lifespan_months, requires_license) VALUES
('Laptop', 'Computing', 36, TRUE),
('Desktop', 'Computing', 48, TRUE),
('POS PC', 'Computing', 48, TRUE),
('Mini PC', 'Computing', 36, TRUE),
('Printer - A4', 'Printing', 60, FALSE),
('Printer - Bill', 'Printing', 48, FALSE),
('Scanner - 2D', 'Peripherals', 60, FALSE),
('Network Switch', 'Networking', 84, FALSE),
('Firewall', 'Networking', 60, FALSE),
('WiFi Access Point', 'Networking', 60, FALSE),
('PDT Device', 'Retail', 36, FALSE),
('Monitor', 'Peripherals', 60, FALSE);
```

### 3. asset_assignments
Tracking ai đang giữ asset nào (history table - keep all assignments)

```sql
CREATE TABLE asset_assignments (
    id SERIAL PRIMARY KEY,
    asset_id INTEGER REFERENCES assets(id) ON DELETE CASCADE,
    assigned_to_type VARCHAR(20) CHECK (assigned_to_type IN ('EMPLOYEE', 'STORE', 'WAREHOUSE', 'VENDOR')),
    assigned_to_id INTEGER NOT NULL,  -- employee_id, store_id, warehouse_id
    assigned_by INTEGER REFERENCES users(id),
    assignment_date DATE NOT NULL,
    expected_return_date DATE,
    actual_return_date DATE,
    assignment_status VARCHAR(20) CHECK (assignment_status IN ('ACTIVE', 'RETURNED', 'TRANSFERRED', 'LOST')) DEFAULT 'ACTIVE',
    handover_document_url VARCHAR(255),  -- PDF scan of signed handover form
    return_document_url VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_assignments_asset ON asset_assignments(asset_id);
CREATE INDEX idx_assignments_assignee ON asset_assignments(assigned_to_type, assigned_to_id);
CREATE INDEX idx_assignments_status ON asset_assignments(assignment_status);
CREATE INDEX idx_assignments_dates ON asset_assignments(assignment_date, actual_return_date);
```

### 4. employees
Thông tin nhân viên (sync từ HR system)

```sql
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(20) UNIQUE NOT NULL,  -- HR employee ID
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    department VARCHAR(100),
    position VARCHAR(100),
    office_location VARCHAR(100),
    join_date DATE,
    resignation_date DATE,
    status VARCHAR(20) CHECK (status IN ('ACTIVE', 'RESIGNED', 'SUSPENDED')) DEFAULT 'ACTIVE',
    manager_id INTEGER REFERENCES employees(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_employees_dept ON employees(department);
```

### 5. stores
Thông tin cửa hàng

```sql
CREATE TABLE stores (
    id SERIAL PRIMARY KEY,
    store_code VARCHAR(10) UNIQUE NOT NULL,  -- VA01, VH02, A001, K702
    store_name VARCHAR(200) NOT NULL,
    brand VARCHAR(50),  -- Bata, Crocs, New Balance
    country VARCHAR(10) CHECK (country IN ('VN', 'KH', 'LA')),
    city VARCHAR(100),
    address TEXT,
    email VARCHAR(100),
    phone VARCHAR(20),
    opening_date DATE,
    closing_date DATE,
    status VARCHAR(20) CHECK (status IN ('OPEN', 'CLOSED', 'TEMP_CLOSED')) DEFAULT 'OPEN',
    store_manager VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stores_code ON stores(store_code);
CREATE INDEX idx_stores_brand ON stores(brand);
CREATE INDEX idx_stores_status ON stores(status);
```

### 6. licenses
Software licenses (Office 365, Adobe, AutoCAD, etc.)

```sql
CREATE TABLE licenses (
    id SERIAL PRIMARY KEY,
    license_type VARCHAR(100) NOT NULL,  -- Office 365 E1, Adobe Creative Cloud, AutoCAD LT
    license_key VARCHAR(255),
    vendor VARCHAR(100),
    purchase_date DATE,
    expiry_date DATE,
    total_seats INTEGER NOT NULL,
    assigned_seats INTEGER DEFAULT 0,
    price_per_seat DECIMAL(10,2),
    auto_renewal BOOLEAN DEFAULT FALSE,
    contract_id INTEGER REFERENCES contracts(id),
    status VARCHAR(20) CHECK (status IN ('ACTIVE', 'EXPIRED', 'CANCELLED')) DEFAULT 'ACTIVE',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_licenses_type ON licenses(license_type);
CREATE INDEX idx_licenses_expiry ON licenses(expiry_date);
CREATE INDEX idx_licenses_status ON licenses(status);
```

### 7. license_assignments
Ai được assign license nào

```sql
CREATE TABLE license_assignments (
    id SERIAL PRIMARY KEY,
    license_id INTEGER REFERENCES licenses(id) ON DELETE CASCADE,
    assigned_to_type VARCHAR(20) CHECK (assigned_to_type IN ('EMPLOYEE', 'STORE', 'SHARED_ACCOUNT')),
    assigned_to_id INTEGER NOT NULL,
    email VARCHAR(100),  -- Email address using the license
    assignment_date DATE NOT NULL,
    revocation_date DATE,
    status VARCHAR(20) CHECK (status IN ('ACTIVE', 'REVOKED')) DEFAULT 'ACTIVE',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_license_assign_license ON license_assignments(license_id);
CREATE INDEX idx_license_assign_user ON license_assignments(assigned_to_type, assigned_to_id);
CREATE INDEX idx_license_assign_status ON license_assignments(status);
```

### 8. procurements
Procurement requests/orders (ITP00001, ITP00002, ...)

```sql
CREATE TABLE procurements (
    id SERIAL PRIMARY KEY,
    itp_number VARCHAR(20) UNIQUE NOT NULL,  -- ITP00001, ITP00002
    procurement_type VARCHAR(50),  -- IT Equipment, Software, Services
    description TEXT NOT NULL,
    requestor_id INTEGER REFERENCES employees(id),
    department VARCHAR(100),
    justification TEXT,
    estimated_cost DECIMAL(12,2),
    actual_cost DECIMAL(12,2),
    vendor_id INTEGER REFERENCES vendors(id),
    request_date DATE NOT NULL,
    approval_status VARCHAR(20) CHECK (approval_status IN ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')) DEFAULT 'DRAFT',
    delivery_status VARCHAR(20) CHECK (delivery_status IN ('NOT_ORDERED', 'ORDERED', 'PARTIAL', 'DELIVERED', 'CANCELLED')),
    payment_status VARCHAR(20) CHECK (payment_status IN ('NOT_PAID', 'REQUESTED', 'APPROVED', 'PAID')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_proc_itp ON procurements(itp_number);
CREATE INDEX idx_proc_status ON procurements(approval_status);
CREATE INDEX idx_proc_requestor ON procurements(requestor_id);
CREATE INDEX idx_proc_dates ON procurements(request_date);
```

### 9. procurement_items
Chi tiết items trong mỗi procurement

```sql
CREATE TABLE procurement_items (
    id SERIAL PRIMARY KEY,
    procurement_id INTEGER REFERENCES procurements(id) ON DELETE CASCADE,
    item_description TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2),
    total_price DECIMAL(12,2),
    specifications TEXT,  -- CPU, RAM, storage specs
    delivery_date DATE,
    received_quantity INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_proc_items_procurement ON procurement_items(procurement_id);
```

### 10. procurement_approvals
Multi-level approval workflow

```sql
CREATE TABLE procurement_approvals (
    id SERIAL PRIMARY KEY,
    procurement_id INTEGER REFERENCES procurements(id) ON DELETE CASCADE,
    approval_level INTEGER NOT NULL,  -- 1=Manager, 2=Finance, 3=Director
    approver_id INTEGER REFERENCES employees(id),
    approval_status VARCHAR(20) CHECK (approval_status IN ('PENDING', 'APPROVED', 'REJECTED', 'CHANGES_REQUESTED')),
    approval_date TIMESTAMP,
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_approvals_proc ON procurement_approvals(procurement_id);
CREATE INDEX idx_approvals_approver ON procurement_approvals(approver_id);
CREATE INDEX idx_approvals_status ON procurement_approvals(approval_status);
```

### 11. vendors
Supplier information

```sql
CREATE TABLE vendors (
    id SERIAL PRIMARY KEY,
    vendor_code VARCHAR(20) UNIQUE,
    vendor_name VARCHAR(200) NOT NULL,
    contact_person VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    country VARCHAR(50),
    payment_terms VARCHAR(100),  -- Net 30, Net 60
    rating DECIMAL(3,2),  -- 1.00 to 5.00
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(15,2) DEFAULT 0,
    status VARCHAR(20) CHECK (status IN ('ACTIVE', 'INACTIVE', 'BLACKLISTED')) DEFAULT 'ACTIVE',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vendors_name ON vendors(vendor_name);
CREATE INDEX idx_vendors_status ON vendors(status);
```

### 12. contracts
Service contracts (Internet, Printer rental, Firewall subscription)

```sql
CREATE TABLE contracts (
    id SERIAL PRIMARY KEY,
    contract_number VARCHAR(50) UNIQUE NOT NULL,
    contract_type VARCHAR(50),  -- Service, Rental, Subscription, Maintenance
    vendor_id INTEGER REFERENCES vendors(id),
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    auto_renewal BOOLEAN DEFAULT FALSE,
    monthly_cost DECIMAL(10,2),
    annual_cost DECIMAL(12,2),
    payment_frequency VARCHAR(20),  -- Monthly, Quarterly, Annual
    status VARCHAR(20) CHECK (status IN ('ACTIVE', 'EXPIRED', 'CANCELLED', 'PENDING')) DEFAULT 'ACTIVE',
    renewal_notice_days INTEGER DEFAULT 60,  -- Alert 60 days before expiry
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_contracts_number ON contracts(contract_number);
CREATE INDEX idx_contracts_vendor ON contracts(vendor_id);
CREATE INDEX idx_contracts_dates ON contracts(start_date, end_date);
CREATE INDEX idx_contracts_status ON contracts(status);
```

---

*Continued in next file: 02-Database-Schema-Extended.md*
