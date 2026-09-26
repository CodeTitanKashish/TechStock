export type UserRole = 'admin' | 'warehouse_manager' | 'inventory_clerk' | 'auditor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
  avatar?: string;
  assignedWarehouses: string[]; // Warehouse IDs or ['*'] for all
  department: string;
  lastLogin: string;
  emailVerified: boolean;
}

export type MovementType = 'receipt' | 'delivery' | 'transfer' | 'adjustment';

export type MovementStatus = 'draft' | 'pending_approval' | 'in_transit' | 'completed' | 'cancelled';

export interface ProductStockPerWarehouse {
  warehouseId: string;
  warehouseCode: string;
  quantity: number;
  reserved: number; // reserved for pending deliveries
  locationBin: string; // e.g. "Rack A-04-B"
}

export interface Product {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  description: string;
  category: string;
  uom: string; // Unit of measure: 'pcs', 'box', 'kg', 'meter', 'pallet'
  costPrice: number;
  sellingPrice: number;
  reorderPoint: number;
  safetyStock: number;
  maxStock: number;
  totalStock: number;
  totalReserved: number;
  warehouseStocks: ProductStockPerWarehouse[];
  lotTracking: boolean;
  activeLotNumber?: string;
  weightKg?: number;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  address: string;
  city: string;
  country: string;
  managerName: string;
  contactEmail: string;
  contactPhone: string;
  totalCapacitySqFt: number;
  utilizedCapacitySqFt: number;
  zones: string[]; // e.g., ["Zone A (High Bay)", "Zone B (Cold Store)", "Zone C (Dispatch)"]
  status: 'active' | 'maintenance' | 'inactive';
}

export interface MovementLineItem {
  productId: string;
  productSku: string;
  productName: string;
  quantity: number;
  unitCost: number;
  uom: string;
  lotNumber?: string;
  expiryDate?: string;
}

export interface InventoryMovement {
  id: string;
  referenceNumber: string; // e.g. REC-2026-001, DEL-2026-004, TRF-2026-012, ADJ-2026-008
  type: MovementType;
  status: MovementStatus;
  date: string;
  sourceWarehouseId?: string; // for delivery, transfer, adjustment
  sourceWarehouseName?: string;
  destinationWarehouseId?: string; // for receipt, transfer
  destinationWarehouseName?: string;
  partnerName?: string; // Supplier name for receipts, Customer name for deliveries
  partnerReference?: string; // PO Number, Sales Order Number, Waybill
  items: MovementLineItem[];
  totalValue: number;
  notes?: string;
  createdBy: {
    userId: string;
    userName: string;
    userRole: string;
  };
  approvedBy?: {
    userId: string;
    userName: string;
    timestamp: string;
    remarks?: string;
  };
  discrepancyReason?: 'damaged' | 'scrap' | 'theft' | 'misplaced' | 'surplus' | 'expired' | 'cycle_count';
}

export interface StockLedgerEntry {
  id: string;
  timestamp: string;
  movementRef: string;
  movementType: MovementType;
  productId: string;
  productSku: string;
  productName: string;
  warehouseId: string;
  warehouseCode: string;
  quantityChange: number; // positive for inbound, negative for outbound
  runningBalance: number;
  unitCost: number;
  totalValuationChange: number;
  locationBin: string;
  performedBy: string;
  remarks: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'alert' | 'approval_required' | 'info' | 'success';
  read: boolean;
  linkTab?: string;
  targetId?: string;
}

export interface ReorderSuggestion {
  productId: string;
  sku: string;
  productName: string;
  category: string;
  currentStock: number;
  reorderPoint: number;
  safetyStock: number;
  suggestedReorderQty: number;
  estimatedCost: number;
  preferredWarehouse: string;
}
