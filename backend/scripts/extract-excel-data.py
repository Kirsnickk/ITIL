#!/usr/bin/env python3
"""
Extract real data from Excel files and output JSON for database import.
Reads: C:/Users/vandu/Documents/ITIL/Data/Infra Management.xlsx
Outputs: JSON files for users, assets, departments, locations
"""

import openpyxl
import json
import sys
from pathlib import Path
from datetime import datetime

# Paths
EXCEL_FILE = Path("C:/Users/vandu/Documents/ITIL/Data/Infra Management.xlsx")
OUTPUT_DIR = Path(__file__).parent / "extracted-data"

def clean_value(val):
    """Clean Excel cell value."""
    if val is None or val == "#N/A" or (isinstance(val, str) and val.strip() == ""):
        return None
    if isinstance(val, str):
        return val.strip()
    return val

def extract_users(wb):
    """Extract users from VN_Emails sheet."""
    print("📧 Extracting users from VN_Emails...")
    ws = wb['VN_Emails']
    rows = list(ws.rows)
    headers = [cell.value for cell in rows[0]]
    
    users = []
    for row in rows[1:]:  # Skip header
        data = {headers[i]: clean_value(cell.value) for i, cell in enumerate(row) if i < len(headers)}
        
        # Skip if no email
        if not data.get('Email Address'):
            continue
            
        user = {
            'email': data.get('Email Address'),
            'fullName': data.get('Full Name'),
            'displayName': data.get('Display Name'),
            'englishName': data.get('English Name'),
            'department': data.get('Department'),
            'jobTitle': data.get('JOB TITLE'),
            'license': data.get('O365 license'),
            'country': data.get('Country'),
            'assetId': data.get('Assigned Asset'),
            'mapLevel': data.get('MAP Level'),
        }
        users.append(user)
    
    print(f"   Found {len(users)} users")
    return users

def extract_assets_store(wb):
    """Extract store assets from Asset_Store sheet."""
    print("🏪 Extracting store assets from Asset_Store...")
    ws = wb['Asset_Store']
    rows = list(ws.rows)
    headers = [cell.value for cell in rows[0]]
    
    assets = []
    for row in rows[1:]:  # Skip header
        data = {headers[i]: clean_value(cell.value) for i, cell in enumerate(row) if i < len(headers)}
        
        # Skip template rows and rows without Asset ID
        asset_id = data.get('Asset ID')
        if not asset_id or asset_id == 'Template':
            continue
        
        asset = {
            'assetId': asset_id,
            'status': data.get('Status\n(formula)'),
            'assignedTo': data.get('Assigned To\n(formula)'),
            'description': data.get('Description\n(formula)'),
            'location': 'Store',
            'assetDescription': data.get('Asset Description\n(formula)'),
            'qty': data.get('Qty'),
            'assetType': data.get('Asset Type (formula)'),
            'brand': data.get('Brand'),
            'model': data.get('Model'),
            'additionalSpecs': data.get('Additional Specs'),
            'serialNumber': data.get('S/N'),
            'ram': data.get('RAM (GB)'),
            'hardDisk': data.get('Hard Disk (GB)'),
            'hardDiskType': data.get('Hard Disk Type'),
            'cpu': data.get('CPU'),
            'purchaseDate': data.get('Purchase Date'),
            'vendor': data.get('Vendor/Supplier'),
            'note': data.get('Note'),
            'hostname': data.get('Hostname'),
            'oldHostname': data.get('Old Hostname'),
        }
        assets.append(asset)
    
    print(f"   Found {len(assets)} store assets")
    return assets

def extract_assets_office(wb):
    """Extract office assets from Asset_Office sheet."""
    print("💼 Extracting office assets from Asset_Office...")
    ws = wb['Asset_Office']
    rows = list(ws.rows)
    headers = [cell.value for cell in rows[0]]
    
    assets = []
    for row in rows[1:]:  # Skip header
        data = {headers[i]: clean_value(cell.value) for i, cell in enumerate(row) if i < len(headers)}
        
        # Skip rows without Asset ID
        asset_id = data.get('Asset ID')
        if not asset_id:
            continue
        
        asset = {
            'assetId': asset_id,
            'status': data.get('Status\n(formula)'),
            'assignedTo': data.get('Assigned To\n(formula)'),
            'description': data.get('Description\n(formula)'),
            'location': 'Office',
            'hostname': data.get('Hostname'),
            'adUser': data.get('AD User\n(formula)'),
            'assetName': data.get('Asset Name\n(formula)'),
            'assetType': data.get('Asset Type (formula)'),
            'brand': data.get('Brand'),
            'model': data.get('Model'),
            'serialNumber': data.get('S/N'),
            'ram': data.get('RAM'),
            'hardDisk': data.get('HARD DISK'),
            'cpu': data.get('CPU'),
            'purchaseDate': data.get('Purchase Date'),
            'vendor': data.get('Vendor'),
            'note': data.get('Note'),
        }
        assets.append(asset)
    
    print(f"   Found {len(assets)} office assets")
    return assets

def extract_departments(users):
    """Extract unique departments from users."""
    print("🏢 Extracting departments...")
    dept_set = set()
    for user in users:
        dept = user.get('department')
        if dept:
            dept_set.add(dept)
    
    departments = [{'name': dept, 'code': dept.upper().replace(' ', '_')} for dept in sorted(dept_set)]
    print(f"   Found {len(departments)} departments")
    return departments

def extract_locations_from_assets(assets):
    """Extract unique locations from assets."""
    print("📍 Extracting locations...")
    location_set = set()
    for asset in assets:
        assigned_to = asset.get('assignedTo')
        description = asset.get('description')
        if assigned_to:
            location_set.add((assigned_to, description or assigned_to))
    
    locations = [
        {'code': code, 'name': name, 'type': 'Store'} 
        for code, name in sorted(location_set)
    ]
    print(f"   Found {len(locations)} locations")
    return locations

def main():
    """Main extraction process."""
    print(f"\n{'='*60}")
    print("📊 EXTRACTING REAL DATA FROM EXCEL")
    print(f"{'='*60}\n")
    
    # Check Excel file exists
    if not EXCEL_FILE.exists():
        print(f"❌ Excel file not found: {EXCEL_FILE}")
        sys.exit(1)
    
    # Create output directory
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    # Load Excel workbook
    print(f"📂 Loading Excel file: {EXCEL_FILE.name}...")
    wb = openpyxl.load_workbook(EXCEL_FILE, read_only=True, data_only=True)
    print(f"   Sheets available: {wb.sheetnames}\n")
    
    # Extract data
    users = extract_users(wb)
    assets_store = extract_assets_store(wb)
    assets_office = extract_assets_office(wb)
    
    # Combine assets
    all_assets = assets_store + assets_office
    print(f"\n📦 Total assets: {len(all_assets)}")
    
    # Extract derived data
    departments = extract_departments(users)
    locations = extract_locations_from_assets(all_assets)
    
    # Close workbook
    wb.close()
    
    # Write JSON files
    print(f"\n{'='*60}")
    print("💾 WRITING JSON FILES")
    print(f"{'='*60}\n")
    
    files_written = []
    
    # Users
    users_file = OUTPUT_DIR / "users.json"
    with open(users_file, 'w', encoding='utf-8') as f:
        json.dump(users, f, indent=2, ensure_ascii=False)
    files_written.append((users_file, len(users)))
    print(f"✅ {users_file.name}: {len(users)} users")
    
    # Assets
    assets_file = OUTPUT_DIR / "assets.json"
    with open(assets_file, 'w', encoding='utf-8') as f:
        json.dump(all_assets, f, indent=2, ensure_ascii=False)
    files_written.append((assets_file, len(all_assets)))
    print(f"✅ {assets_file.name}: {len(all_assets)} assets")
    
    # Departments
    departments_file = OUTPUT_DIR / "departments.json"
    with open(departments_file, 'w', encoding='utf-8') as f:
        json.dump(departments, f, indent=2, ensure_ascii=False)
    files_written.append((departments_file, len(departments)))
    print(f"✅ {departments_file.name}: {len(departments)} departments")
    
    # Locations
    locations_file = OUTPUT_DIR / "locations.json"
    with open(locations_file, 'w', encoding='utf-8') as f:
        json.dump(locations, f, indent=2, ensure_ascii=False)
    files_written.append((locations_file, len(locations)))
    print(f"✅ {locations_file.name}: {len(locations)} locations")
    
    # Summary
    print(f"\n{'='*60}")
    print("🎉 EXTRACTION COMPLETE")
    print(f"{'='*60}\n")
    print(f"Output directory: {OUTPUT_DIR}")
    print(f"Files written:")
    for file_path, count in files_written:
        print(f"  - {file_path.name}: {count} records")
    print()

if __name__ == '__main__':
    main()
