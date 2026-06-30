# Data Migration Guide - Excel to Database

## 📥 Migration Overview

**Goal**: Chuyển 955 files Excel sang PostgreSQL database với data integrity và audit trail đầy đủ.

**Timeline**: 2-3 weeks
**Risk Level**: Medium (data quality issues, downtime)

## 🗂️ Source Data Inventory

### Core Files
```
Data/
├── Infra Management.xlsx           ← Main asset inventory (568 rows)
├── LICENSE MMA.xlsx                ← License tracking (72 office + 56 stores)
├── Procurement & Request Management.xlsx  ← 416 procurement records
├── List Device broken.xlsx         ← Broken devices log
├── List laptop broken.xlsx         ← Broken laptops log
└── ittool.xlsx                     ← IT tools inventory

Data/Asset management/
├── Office/
│   ├── Office assets.xlsx          ← 103 office assets
│   └── Employees.xlsx              ← Employee list
├── Store/
│   ├── Dashboard.xlsx              ← Store summary (498 rows)
│   └── Details/*.xlsx              ← Per-store details (40+ stores)
├── Warehouse/
│   └── Asset_List_DSV.xlsx         ← Warehouse inventory
└── Transititons/IT tool.xlsx       ← Transition assets

Data/Audit 2026 device/Data store/
├── Dashboard Store.xlsx            ← Audit dashboard
├── Check List.xlsx                 ← Audit checklist
└── Audit/*.xlsx                    ← Per-store audit results

Data/_PUR_Docs/
└── ITP00001-ITP00398/              ← 398 procurement folders with PDFs
```

## 🔍 Data Quality Assessment

### Issues Found

#### 1. Asset ID Inconsistency
```
✗ VA01-LAPTOP-001
✗ VA01_LT_001  
✗ LAPTOP-VA01-001
✗ VA01LAPTOP001
✓ Standardize to: {STORE_CODE}-{TYPE}-{SEQUENCE}
```

#### 2. Status Values
```
Found: Active, ACTIVE, In Use, Using, Deployed, Assigned
Target: ACTIVE, ASSIGNED, AVAILABLE, REPAIR, RETIRED, LOST
```

#### 3. Missing Data
- 12% assets missing serial numbers
- 8% missing purchase dates
- 15% stores without email addresses
- Some procurement items without actual costs

#### 4. Duplicates
- 3 laptop serial numbers appear twice (check if typo or actual duplicates)
- 2 Asset IDs duplicated across stores
- Some employee emails in multiple records (resigned vs active)

## 📋 Migration Steps

### Phase 1: Data Extraction & Cleaning (Week 1)

#### Step 1.1: Extract to CSV
```python
# Python script to extract all Excel files to standardized CSV
import openpyxl
import pandas as pd
import os

def extract_excel_to_csv(excel_path, output_dir):
    """Extract all sheets from Excel to CSV"""
    wb = openpyxl.load_workbook(excel_path, data_only=True)
    
    for sheet_name in wb.sheetnames:
        df = pd.read_excel(excel_path, sheet_name=sheet_name)
        csv_name = f"{os.path.basename(excel_path)[:-5]}_{sheet_name}.csv"
        df.to_csv(f"{output_dir}/{csv_name}", index=False, encoding='utf-8')
        print(f"Exported: {csv_name}")

# Extract main files
extract_excel_to_csv("Data/Infra Management.xlsx", "migration/csv")
extract_excel_to_csv("Data/LICENSE MMA.xlsx", "migration/csv")
# ... repeat for all files
```

#### Step 1.2: Clean & Normalize
```python
import pandas as pd
import re

def clean_asset_id(asset_id):
    """Standardize asset ID format"""
    if pd.isna(asset_id):
        return None
    
    # Remove spaces, underscores
    clean = re.sub(r'[_\s]+', '-', str(asset_id).upper())
    
    # Parse components
    match = re.match(r'([A-Z0-9]+)[-]?([A-Z]+)[-]?(\d+)', clean)
    if match:
        store, type_code, seq = match.groups()
        return f"{store}-{type_code}-{seq.zfill(3)}"
    
    return clean  # Return as-is if can't parse

def clean_status(status):
    """Map status values to standard"""
    status_map = {
        'active': 'ACTIVE',
        'in use': 'ASSIGNED',
        'using': 'ASSIGNED',
        'deployed': 'ASSIGNED',
        'available': 'AVAILABLE',
        'repair': 'REPAIR',
        'broken': 'REPAIR',
        'retired': 'RETIRED',
        'lost': 'LOST'
    }
    
    if pd.isna(status):
        return 'ACTIVE'  # Default
    
    return status_map.get(str(status).lower(), 'ACTIVE')

# Apply cleaning
df['asset_id'] = df['asset_id'].apply(clean_asset_id)
df['status'] = df['status'].apply(clean_status)
df['serial_number'] = df['serial_number'].str.upper().str.strip()
```

#### Step 1.3: Validate Data
```python
def validate_assets(df):
    """Run validation checks"""
    issues = []
    
    # Check for duplicates
    dup_assets = df[df.duplicated(subset=['asset_id'], keep=False)]
    if len(dup_assets) > 0:
        issues.append(f"CRITICAL: {len(dup_assets)} duplicate Asset IDs")
    
    dup_serials = df[df.duplicated(subset=['serial_number'], keep=False)]
    if len(dup_serials) > 0:
        issues.append(f"WARNING: {len(dup_serials)} duplicate Serial Numbers")
    
    # Check for missing required fields
    missing_asset_id = df['asset_id'].isna().sum()
    if missing_asset_id > 0:
        issues.append(f"CRITICAL: {missing_asset_id} assets without Asset ID")
    
    missing_type = df['asset_type'].isna().sum()
    if missing_type > 0:
        issues.append(f"WARNING: {missing_type} assets without type")
    
    # Print report
    print("\n=== VALIDATION REPORT ===")
    for issue in issues:
        print(f"  {issue}")
    
    return len([i for i in issues if 'CRITICAL' in i]) == 0

# Run validation
if validate_assets(df):
    print("\n✓ Validation passed - ready for import")
else:
    print("\n✗ Critical issues found - fix before import")
```

---

### Phase 2: Database Setup (Week 1-2)

#### Step 2.1: Create Database
```bash
# Create PostgreSQL database
createdb itil_asset_mgmt

# Run schema creation
psql -d itil_asset_mgmt -f schema/01-create-tables.sql
psql -d itil_asset_mgmt -f schema/02-create-indexes.sql
psql -d itil_asset_mgmt -f schema/03-create-views.sql
psql -d itil_asset_mgmt -f schema/04-create-triggers.sql
```

#### Step 2.2: Insert Reference Data
```sql
-- Asset types
INSERT INTO asset_types (name, category, typical_lifespan_months) VALUES
('Laptop', 'Computing', 36),
('Desktop', 'Computing', 48),
('POS PC', 'Computing', 48),
('Mini PC', 'Computing', 36),
('Printer - A4', 'Printing', 60),
('Printer - Bill', 'Printing', 48),
('Scanner - 2D', 'Peripherals', 60),
('Network Switch', 'Networking', 84),
('Firewall', 'Networking', 60),
('WiFi Access Point', 'Networking', 60),
('PDT Device', 'Retail', 36),
('Monitor', 'Peripherals', 60);

-- Stores (from Store/Dashboard.xlsx)
COPY stores (store_code, store_name, brand, country, city, opening_date, status)
FROM '/migration/csv/stores_cleaned.csv'
WITH (FORMAT csv, HEADER true);
```

---

### Phase 3: Data Import (Week 2)

#### Import Order (to respect foreign key constraints)
```
1. employees
2. stores
3. vendors
4. asset_types (already done)
5. procurements
6. procurement_items
7. contracts
8. licenses
9. assets
10. asset_assignments
11. license_assignments
12. maintenance_records
13. documents
```

#### Step 3.1: Import Employees
```python
import psycopg2
import pandas as pd

def import_employees(csv_path, conn):
    df = pd.read_csv(csv_path)
    
    cursor = conn.cursor()
    
    for _, row in df.iterrows():
        cursor.execute("""
            INSERT INTO employees 
            (employee_id, full_name, email, department, position, join_date, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (employee_id) DO UPDATE SET
                full_name = EXCLUDED.full_name,
                email = EXCLUDED.email,
                department = EXCLUDED.department
        """, (
            row['employee_id'],
            row['full_name'],
            row['email'],
            row['department'],
            row['position'],
            row['join_date'],
            'ACTIVE' if pd.isna(row.get('resignation_date')) else 'RESIGNED'
        ))
    
    conn.commit()
    print(f"✓ Imported {len(df)} employees")
```

#### Step 3.2: Import Assets
```python
def import_assets(csv_path, conn):
    df = pd.read_csv(csv_path)
    
    cursor = conn.cursor()
    imported = 0
    errors = []
    
    for idx, row in df.iterrows():
        try:
            # Get asset_type_id
            cursor.execute(
                "SELECT id FROM asset_types WHERE name = %s",
                (row['asset_type'],)
            )
            asset_type_id = cursor.fetchone()[0]
            
            # Insert asset
            cursor.execute("""
                INSERT INTO assets 
                (asset_id, asset_type_id, serial_number, model, brand,
                 purchase_date, purchase_price, warranty_end_date,
                 location_type, location_id, status, condition)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (
                row['asset_id'],
                asset_type_id,
                row.get('serial_number'),
                row.get('model'),
                row.get('brand'),
                row.get('purchase_date'),
                row.get('purchase_price'),
                row.get('warranty_end_date'),
                row.get('location_type', 'WAREHOUSE'),
                row.get('location_id'),
                row.get('status', 'ACTIVE'),
                row.get('condition', 'GOOD')
            ))
            
            imported += 1
            
        except Exception as e:
            errors.append({
                'row': idx,
                'asset_id': row.get('asset_id'),
                'error': str(e)
            })
    
    conn.commit()
    
    print(f"✓ Imported {imported} assets")
    if errors:
        print(f"✗ {len(errors)} errors:")
        for err in errors[:5]:  # Show first 5
            print(f"  Row {err['row']}: {err['error']}")
```

---

*Continued in: 06-Migration-Checklist.md*
