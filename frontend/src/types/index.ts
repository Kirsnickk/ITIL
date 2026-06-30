export interface User {
  id: string
  email: string
  username: string
  firstName: string
  lastName: string
  role: UserRole
  departmentId?: string
  isActive: boolean
  createdAt: string
  department?: Department
}

export type UserRole = 'ADMIN' | 'MANAGER' | 'USER' | 'VIEWER'

export interface Department {
  id: string
  code: string
  name: string
  description?: string
  managerId?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Location {
  id: string
  code: string
  name: string
  type: LocationType
  country: string
  city?: string
  address?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type LocationType = 'OFFICE' | 'STORE' | 'WAREHOUSE' | 'TRANSITION'

export interface Asset {
  id: string
  assetTag: string
  name: string
  type: AssetType
  category?: string
  serialNumber?: string
  model?: string
  manufacturer?: string
  purchaseDate?: string
  purchaseCost?: number
  warrantyExpiry?: string
  status: AssetStatus
  condition?: string
  locationId?: string
  departmentId?: string
  assignedToId?: string
  notes?: string
  createdAt: string
  updatedAt: string
  location?: Location
  department?: Department
  assignedTo?: User
}

export type AssetType = 
  | 'LAPTOP' 
  | 'DESKTOP' 
  | 'MONITOR' 
  | 'PRINTER' 
  | 'SCANNER' 
  | 'NETWORK_DEVICE' 
  | 'SERVER' 
  | 'MOBILE_DEVICE' 
  | 'TABLET' 
  | 'PERIPHERAL' 
  | 'OTHER'

export type AssetStatus = 
  | 'AVAILABLE' 
  | 'IN_USE' 
  | 'MAINTENANCE' 
  | 'REPAIR' 
  | 'RETIRED' 
  | 'LOST' 
  | 'DAMAGED'

export interface ProcurementRequest {
  id: string
  requestNumber: string
  title: string
  description?: string
  requestorId: string
  departmentId: string
  estimatedCost?: number
  actualCost?: number
  priority: Priority
  status: ProcurementStatus
  requestDate: string
  approvedDate?: string
  completedDate?: string
  vendor?: string
  notes?: string
  createdAt: string
  updatedAt: string
  requestor?: User
  department?: Department
  approvals?: Approval[]
}

export type ProcurementStatus = 
  | 'DRAFT' 
  | 'PENDING_APPROVAL' 
  | 'APPROVED' 
  | 'REJECTED' 
  | 'IN_PROGRESS' 
  | 'COMPLETED' 
  | 'CANCELLED'

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export interface Approval {
  id: string
  procurementId: string
  approverId: string
  status: ApprovalStatus
  comments?: string
  approvedAt?: string
  createdAt: string
  updatedAt: string
  approver?: User
}

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface License {
  id: string
  licenseKey: string
  product: string
  vendor: string
  type: LicenseType
  seatsTotal: number
  seatsUsed: number
  purchaseDate: string
  expiryDate?: string
  cost?: number
  renewalCost?: number
  status: LicenseStatus
  notes?: string
  createdAt: string
  updatedAt: string
}

export type LicenseType = 'PERPETUAL' | 'SUBSCRIPTION' | 'TRIAL'

export type LicenseStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING_RENEWAL'

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  username: string
  password: string
  firstName: string
  lastName: string
  departmentId?: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    message: string
  }
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}
