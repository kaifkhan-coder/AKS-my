export type UserRole = 'owner' | 'admin' | 'staff' | 'customer';

export interface StaffPermission {
  canManageInventory: boolean;
  canCreateBills: boolean;
  canManageCredit: boolean;
  canManageStaff: boolean;
  canViewFinancials: boolean;
  canBlockCustomers: boolean;
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  storeId: string;
  permissions?: StaffPermission;
}

export interface StoreProfile {
  id: string;
  name: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  gstin?: string;
  upiId?: string;
  currencySymbol: string;
  createdDate: string;
}

export interface CustomFieldDefinition {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select';
  options?: string[]; // For select type
  required?: boolean;
}

export interface CategoryConfig {
  id: string;
  name: string;
  color: string;
  customFields: CustomFieldDefinition[];
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  unit: 'kg' | 'g' | 'L' | 'ml' | 'packet' | 'piece' | 'box' | 'bag';
  purchasePrice: number;
  sellingPrice: number;
  mrp?: number;
  lowStockThreshold: number;
  barcode?: string;
  storeId: string;
  customFieldValues?: Record<string, string | number | boolean>;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  creditLimit: number;
  currentCredit: number; // Positive means customer owes shop
  isBlocked: boolean;
  blockReason?: string;
  blockedAt?: string;
  notes?: string;
  storeId: string;
  createdAt: string;
}

export interface CreditLedgerEntry {
  id: string;
  customerId: string;
  storeId: string;
  type: 'debit' | 'credit'; // debit = customer took goods on credit, credit = customer paid back money
  amount: number;
  balanceAfter: number;
  date: string;
  paymentMode?: 'cash' | 'upi' | 'bank_transfer' | 'bill_credit';
  billId?: string;
  notes?: string;
  recordedBy: string;
}

export interface BillItem {
  itemId: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

export interface Bill {
  id: string;
  billNumber: string;
  storeId: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  items: BillItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  paymentMethod: 'cash' | 'upi' | 'credit' | 'split';
  paymentDetails?: {
    cashAmount?: number;
    upiAmount?: number;
    creditAmount?: number;
  };
  paidStatus: 'paid' | 'unpaid' | 'partial';
  createdAt: string;
  billedBy: string;
}

export interface CustomerOrder {
  id: string;
  orderNumber: string;
  storeId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryType: 'pickup' | 'home_delivery';
  deliveryAddress?: string;
  items: {
    itemId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    unit: string;
  }[];
  totalAmount: number;
  status: 'pending' | 'packed' | 'ready' | 'delivered' | 'cancelled_fake';
  cancelReason?: string;
  paymentPreference: 'pay_at_store' | 'upi_on_delivery' | 'khata_credit';
  placedAt: string;
  updatedAt: string;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'staff';
  storeId: string;
  status: 'active' | 'inactive';
  permissions: StaffPermission;
  joinedDate: string;
}

export interface KiranaSyncSnapshot {
  id: string;
  timestamp: string;
  folderName: string; // "KiranaSync"
  backupVersion: string;
  storeProfilesCount: number;
  inventoryCount: number;
  customersCount: number;
  billsCount: number;
  ordersCount: number;
  sizeKb: number;
  status: 'synced' | 'pending' | 'failed';
}
