# API Endpoints - ITIL Asset Management

## 🌐 RESTful API Design

Base URL: `https://api.itil-asset-mgmt.com/v1`

Authentication: JWT Bearer Token
```
Authorization: Bearer <token>
```

## 📦 Assets Management

### List Assets
```
GET /assets
Query Parameters:
  - status: ACTIVE|ASSIGNED|AVAILABLE|REPAIR|RETIRED
  - location_type: OFFICE|STORE|WAREHOUSE
  - location_id: integer
  - asset_type_id: integer
  - assigned_to: employee_id or store_id
  - search: text search (asset_id, serial, model)
  - page: integer (default: 1)
  - limit: integer (default: 50, max: 200)
  - sort_by: asset_id|purchase_date|status
  - sort_order: asc|desc

Response 200:
{
  "data": [
    {
      "id": 1,
      "asset_id": "VA01-LAPTOP-001",
      "asset_type": "Laptop",
      "serial_number": "5CD12345AB",
      "model": "Dell Latitude 3520",
      "brand": "Dell",
      "status": "ASSIGNED",
      "condition": "GOOD",
      "location_type": "OFFICE",
      "purchase_date": "2024-01-15",
      "warranty_end_date": "2027-01-15",
      "current_assignment": {
        "assigned_to": "John Doe",
        "assignment_date": "2024-02-01"
      },
      "qr_code": "https://storage.../qr/VA01-LAPTOP-001.png"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 487,
    "total_pages": 10
  }
}
```

### Get Asset Details
```
GET /assets/:id

Response 200:
{
  "id": 1,
  "asset_id": "VA01-LAPTOP-001",
  "asset_type": {...},
  "serial_number": "5CD12345AB",
  "model": "Dell Latitude 3520",
  "brand": "Dell",
  "specs": {
    "cpu": "Intel i5-1135G7",
    "ram": "16GB DDR4",
    "storage": "512GB SSD"
  },
  "purchase_date": "2024-01-15",
  "purchase_price": 850.00,
  "warranty_end_date": "2027-01-15",
  "location": {...},
  "status": "ASSIGNED",
  "condition": "GOOD",
  "procurement": {...},
  "assignment_history": [...],
  "maintenance_records": [...],
  "documents": [...],
  "created_at": "2024-01-20T10:30:00Z",
  "updated_at": "2024-02-01T14:20:00Z"
}
```

### Create Asset
```
POST /assets
Body:
{
  "asset_id": "VA01-LAPTOP-002",
  "asset_type_id": 1,
  "serial_number": "5CD67890XY",
  "model": "Dell Latitude 3520",
  "brand": "Dell",
  "purchase_date": "2024-06-15",
  "purchase_price": 850.00,
  "warranty_end_date": "2027-06-15",
  "location_type": "WAREHOUSE",
  "location_id": 1,
  "status": "AVAILABLE",
  "condition": "NEW",
  "procurement_id": 123,
  "specs": {
    "cpu": "Intel i5-1135G7",
    "ram": "16GB DDR4",
    "storage": "512GB SSD"
  }
}

Response 201:
{
  "id": 488,
  "asset_id": "VA01-LAPTOP-002",
  ...
}
```

### Update Asset
```
PATCH /assets/:id
Body: (partial update)
{
  "status": "REPAIR",
  "condition": "FAIR",
  "notes": "Screen flickering, sent to vendor for repair"
}

Response 200: {updated asset object}
```

### Delete Asset
```
DELETE /assets/:id
Response 204: No Content
```

---

## 👤 Asset Assignments

### Assign Asset to Employee
```
POST /assets/:id/assign
Body:
{
  "assigned_to_type": "EMPLOYEE",
  "assigned_to_id": 42,
  "assignment_date": "2024-06-30",
  "expected_return_date": null,
  "handover_document": "base64_encoded_pdf_or_file_upload",
  "notes": "New employee laptop setup"
}

Response 201:
{
  "assignment_id": 156,
  "asset_id": 488,
  "assigned_to": {
    "type": "EMPLOYEE",
    "id": 42,
    "name": "Jane Smith"
  },
  "assignment_date": "2024-06-30",
  "status": "ACTIVE"
}
```

### Return Asset
```
POST /assets/:id/return
Body:
{
  "return_date": "2024-06-30",
  "return_condition": "GOOD",
  "return_document": "base64_encoded_pdf_or_file_upload",
  "notes": "Employee resigned, device returned in good condition"
}

Response 200: {updated assignment object}
```

---

## 📝 Procurement Management

### List Procurements
```
GET /procurements
Query Parameters:
  - approval_status: DRAFT|PENDING|APPROVED|REJECTED
  - delivery_status: NOT_ORDERED|ORDERED|DELIVERED
  - payment_status: NOT_PAID|REQUESTED|PAID
  - requestor_id: integer
  - date_from: YYYY-MM-DD
  - date_to: YYYY-MM-DD
  - page, limit, sort_by, sort_order

Response 200: {paginated list of procurements}
```

### Create Procurement Request
```
POST /procurements
Body:
{
  "procurement_type": "IT Equipment",
  "description": "5 laptops for new employees",
  "justification": "Q2 2024 hiring expansion",
  "requestor_id": 10,
  "department": "IT",
  "estimated_cost": 4250.00,
  "items": [
    {
      "item_description": "Dell Latitude 3520, i5, 16GB, 512GB SSD",
      "quantity": 5,
      "unit_price": 850.00,
      "specifications": {
        "cpu": "Intel i5-1135G7",
        "ram": "16GB DDR4",
        "storage": "512GB SSD"
      }
    }
  ],
  "documents": [
    {
      "document_type": "Quotation",
      "file": "base64_or_multipart_upload"
    }
  ]
}

Response 201:
{
  "id": 124,
  "itp_number": "ITP00399",
  "approval_status": "PENDING",
  ...
}
```

### Approve/Reject Procurement
```
POST /procurements/:id/approve
Body:
{
  "approval_level": 1,
  "action": "APPROVED",
  "comments": "Budget approved for Q2 hiring"
}

Response 200: {updated procurement with approval record}
```

---

## 🎫 Licenses Management

### List Licenses
```
GET /licenses
Query Parameters:
  - license_type: string
  - status: ACTIVE|EXPIRED|CANCELLED
  - expiring_within_days: integer
  - utilization_above: percentage (e.g., 80)
  - page, limit, sort_by

Response 200:
{
  "data": [
    {
      "id": 1,
      "license_type": "Office 365 E1",
      "total_seats": 100,
      "assigned_seats": 87,
      "available_seats": 13,
      "utilization_percent": 87.0,
      "expiry_date": "2025-01-15",
      "days_until_expiry": 199,
      "status": "ACTIVE"
    }
  ]
}
```

### Assign License
```
POST /licenses/:id/assign
Body:
{
  "assigned_to_type": "EMPLOYEE",
  "assigned_to_id": 42,
  "email": "jane.smith@company.com",
  "assignment_date": "2024-06-30"
}

Response 201: {license assignment object}
```

### Revoke License
```
POST /licenses/:id/revoke
Body:
{
  "assignment_id": 87,
  "revocation_date": "2024-06-30",
  "reason": "Employee resigned"
}

Response 200: {updated assignment}
```

---

## 🔧 Maintenance Records

### Create Maintenance Record
```
POST /maintenance
Body:
{
  "asset_id": 488,
  "maintenance_type": "REPAIR",
  "issue_description": "Screen flickering and occasional black screen",
  "reported_by": 42,
  "reported_date": "2024-06-25",
  "assigned_to": "Dell Service Center"
}

Response 201: {maintenance record}
```

### Update Maintenance Status
```
PATCH /maintenance/:id
Body:
{
  "status": "COMPLETED",
  "completion_date": "2024-06-30",
  "resolution_description": "Replaced screen panel, tested OK",
  "cost": 120.00,
  "warranty_covered": true
}

Response 200: {updated maintenance record}
```

---

## 📊 Reports & Analytics

### Asset Summary Report
```
GET /reports/asset-summary
Query Parameters:
  - group_by: location|type|status|brand
  - location_type: OFFICE|STORE|WAREHOUSE
  - date_from, date_to

Response 200:
{
  "summary": {
    "total_assets": 487,
    "by_status": {
      "ACTIVE": 420,
      "REPAIR": 12,
      "AVAILABLE": 55
    },
    "by_type": {
      "Laptop": 180,
      "Desktop": 45,
      "POS PC": 120,
      ...
    },
    "total_value": 425600.00
  }
}
```

### Procurement Spend Report
```
GET /reports/procurement-spend
Query Parameters:
  - date_from, date_to
  - group_by: month|vendor|category

Response 200:
{
  "period": "2024-01-01 to 2024-06-30",
  "total_spend": 156780.00,
  "by_month": [...],
  "by_vendor": [...],
  "top_categories": [...]
}
```

---

*Next: 05-Data-Migration-Guide.md*
