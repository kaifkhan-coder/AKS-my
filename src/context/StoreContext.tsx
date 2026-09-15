import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  StoreProfile,
  CategoryConfig,
  InventoryItem,
  Customer,
  CreditLedgerEntry,
  Bill,
  CustomerOrder,
  StaffMember,
  UserSession,
  KiranaSyncSnapshot,
  CustomFieldDefinition,
} from '../types';
import {
  INITIAL_STORES,
  INITIAL_CATEGORIES,
  INITIAL_INVENTORY,
  INITIAL_CUSTOMERS,
  INITIAL_LEDGER,
  INITIAL_BILLS,
  INITIAL_ORDERS,
  INITIAL_STAFF,
} from '../data/initialData';

interface StoreContextType {
  // Session & Stores
  currentUser: UserSession;
  setCurrentUser: (user: UserSession) => void;
  stores: StoreProfile[];
  activeStoreId: string;
  activeStore: StoreProfile;
  setActiveStoreId: (id: string) => void;
  createStoreProfile: (store: Omit<StoreProfile, 'id' | 'createdDate'>) => void;
  updateStoreProfile: (store: StoreProfile) => void;

  // Categories & Custom Fields
  categories: CategoryConfig[];
  addCategory: (name: string, color: string) => void;
  addCustomFieldToCategory: (categoryId: string, field: Omit<CustomFieldDefinition, 'id'>) => void;
  removeCustomFieldFromCategory: (categoryId: string, fieldId: string) => void;

  // Inventory
  inventory: InventoryItem[];
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'storeId' | 'updatedAt'>) => void;
  updateInventoryItem: (item: InventoryItem) => void;
  deleteInventoryItem: (itemId: string) => void;
  adjustStock: (itemId: string, delta: number) => void;
  lowStockItems: InventoryItem[];

  // Customers & Credit Khata
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'storeId' | 'currentCredit' | 'isBlocked' | 'createdAt'>) => string;
  updateCustomer: (customer: Customer) => void;
  blockCustomer: (customerId: string, reason: string) => void;
  unblockCustomer: (customerId: string) => void;
  creditLedger: CreditLedgerEntry[];
  recordCreditPayment: (customerId: string, amount: number, mode: 'cash' | 'upi' | 'bank_transfer', notes?: string) => void;
  recordCreditDebit: (customerId: string, amount: number, billId?: string, notes?: string) => void;

  // Bills & POS
  bills: Bill[];
  createBill: (billData: Omit<Bill, 'id' | 'billNumber' | 'storeId' | 'createdAt' | 'billedBy'>) => Bill;

  // Orders & Online Grocery
  orders: CustomerOrder[];
  placeCustomerOrder: (orderData: Omit<CustomerOrder, 'id' | 'orderNumber' | 'storeId' | 'status' | 'placedAt' | 'updatedAt'>) => CustomerOrder;
  updateOrderStatus: (orderId: string, status: CustomerOrder['status'], cancelReason?: string) => void;
  flagOrderAsFakeAndBlock: (orderId: string, reason: string) => void;

  // Staff & Permissions
  staff: StaffMember[];
  addStaffMember: (member: Omit<StaffMember, 'id' | 'storeId' | 'joinedDate'>) => void;
  updateStaffMember: (member: StaffMember) => void;
  deleteStaffMember: (staffId: string) => void;

  // KiranaSync Google Cloud Backup
  snapshots: KiranaSyncSnapshot[];
  lastSyncTime: string | null;
  isSyncing: boolean;
  createKiranaSyncBackup: () => Promise<KiranaSyncSnapshot>;
  restoreKiranaSyncBackup: (snapshotId: string) => void;
  exportKiranaSyncJson: () => void;
  importKiranaSyncJson: (jsonString: string) => boolean;

  // Auth Logout & Switch
  logout: () => void;
  loginAsDemoUser: (role: 'owner' | 'staff' | 'customer', specificId?: string) => void;
}

const STORAGE_KEYS = {
  STORES: 'kirana_stores_v1',
  ACTIVE_STORE: 'kirana_active_store_v1',
  CATEGORIES: 'kirana_categories_v1',
  INVENTORY: 'kirana_inventory_v1',
  CUSTOMERS: 'kirana_customers_v1',
  LEDGER: 'kirana_ledger_v1',
  BILLS: 'kirana_bills_v1',
  ORDERS: 'kirana_orders_v1',
  STAFF: 'kirana_staff_v1',
  SNAPSHOTS: 'kirana_snapshots_v1',
  USER: 'kirana_current_user_v1',
};

const DEFAULT_OWNER_USER: UserSession = {
  id: 'user-owner-1',
  name: 'Rakesh Gupta (Shop Owner)',
  email: 'khankaifcom551@gmail.com',
  phone: '+91 98765 43210',
  role: 'owner',
  storeId: 'store-1',
  permissions: {
    canManageInventory: true,
    canCreateBills: true,
    canManageCredit: true,
    canManageStaff: true,
    canViewFinancials: true,
    canBlockCustomers: true,
  },
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial or stored state safely
  const [stores, setStores] = useState<StoreProfile[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STORES);
    return saved ? JSON.parse(saved) : INITIAL_STORES;
  });

  const [activeStoreId, setActiveStoreIdState] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_STORE);
    return saved || 'store-1';
  });

  const [categories, setCategories] = useState<CategoryConfig[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INVENTORY);
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [creditLedger, setCreditLedger] = useState<CreditLedgerEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LEDGER);
    return saved ? JSON.parse(saved) : INITIAL_LEDGER;
  });

  const [bills, setBills] = useState<Bill[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BILLS);
    return saved ? JSON.parse(saved) : INITIAL_BILLS;
  });

  const [orders, setOrders] = useState<CustomerOrder[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [staff, setStaff] = useState<StaffMember[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STAFF);
    return saved ? JSON.parse(saved) : INITIAL_STAFF;
  });

  const [currentUser, setCurrentUserState] = useState<UserSession>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    return saved ? JSON.parse(saved) : DEFAULT_OWNER_USER;
  });

  const [snapshots, setSnapshots] = useState<KiranaSyncSnapshot[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SNAPSHOTS);
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'snap-init',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        folderName: 'KiranaSync',
        backupVersion: 'v1.4.2',
        storeProfilesCount: 2,
        inventoryCount: 12,
        customersCount: 4,
        billsCount: 3,
        ordersCount: 2,
        sizeKb: 28.4,
        status: 'synced',
      },
    ];
  });

  const [lastSyncTime, setLastSyncTime] = useState<string | null>(new Date().toISOString());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Persistence effects
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STORES, JSON.stringify(stores));
  }, [stores]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_STORE, activeStoreId);
  }, [activeStoreId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LEDGER, JSON.stringify(creditLedger));
  }, [creditLedger]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(bills));
  }, [bills]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staff));
  }, [staff]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SNAPSHOTS, JSON.stringify(snapshots));
  }, [snapshots]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
  }, [currentUser]);

  const activeStore = stores.find((s) => s.id === activeStoreId) || stores[0] || INITIAL_STORES[0];

  const setActiveStoreId = (id: string) => {
    setActiveStoreIdState(id);
    if (currentUser.role !== 'customer') {
      setCurrentUserState((prev) => ({ ...prev, storeId: id }));
    }
  };

  const setCurrentUser = (user: UserSession) => {
    setCurrentUserState(user);
  };

  const createStoreProfile = (storeData: Omit<StoreProfile, 'id' | 'createdDate'>) => {
    const newStore: StoreProfile = {
      ...storeData,
      id: `store-${Date.now()}`,
      createdDate: new Date().toISOString().split('T')[0],
    };
    setStores((prev) => [...prev, newStore]);
    setActiveStoreIdState(newStore.id);
  };

  const updateStoreProfile = (updated: StoreProfile) => {
    setStores((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  // Categories & Custom fields
  const addCategory = (name: string, color: string) => {
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    const newCategory: CategoryConfig = {
      id,
      name,
      color,
      customFields: [],
    };
    setCategories((prev) => [...prev, newCategory]);
  };

  const addCustomFieldToCategory = (categoryId: string, field: Omit<CustomFieldDefinition, 'id'>) => {
    const id = field.name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat;
        return {
          ...cat,
          customFields: [...cat.customFields, { ...field, id }],
        };
      })
    );
  };

  const removeCustomFieldFromCategory = (categoryId: string, fieldId: string) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat;
        return {
          ...cat,
          customFields: cat.customFields.filter((f) => f.id !== fieldId),
        };
      })
    );
  };

  // Inventory
  const addInventoryItem = (itemData: Omit<InventoryItem, 'id' | 'storeId' | 'updatedAt'>) => {
    const newItem: InventoryItem = {
      ...itemData,
      id: `item-${Date.now()}`,
      storeId: activeStoreId,
      updatedAt: new Date().toISOString(),
    };
    setInventory((prev) => [newItem, ...prev]);
  };

  const updateInventoryItem = (updated: InventoryItem) => {
    setInventory((prev) =>
      prev.map((i) => (i.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : i))
    );
  };

  const deleteInventoryItem = (itemId: string) => {
    setInventory((prev) => prev.filter((i) => i.id !== itemId));
  };

  const adjustStock = (itemId: string, delta: number) => {
    setInventory((prev) =>
      prev.map((i) => {
        if (i.id !== itemId) return i;
        const newStock = Math.max(0, i.stock + delta);
        return { ...i, stock: newStock, updatedAt: new Date().toISOString() };
      })
    );
  };

  const lowStockItems = inventory.filter(
    (i) => i.storeId === activeStoreId && i.stock <= i.lowStockThreshold
  );

  // Customers & Udhar Khata
  const addCustomer = (customerData: Omit<Customer, 'id' | 'storeId' | 'currentCredit' | 'isBlocked' | 'createdAt'>) => {
    const id = `cust-${Date.now()}`;
    const newCustomer: Customer = {
      ...customerData,
      id,
      storeId: activeStoreId,
      currentCredit: 0,
      isBlocked: false,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setCustomers((prev) => [newCustomer, ...prev]);
    return id;
  };

  const updateCustomer = (updated: Customer) => {
    setCustomers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const blockCustomer = (customerId: string, reason: string) => {
    const now = new Date().toISOString();
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id !== customerId) return c;
        return {
          ...c,
          isBlocked: true,
          blockReason: reason,
          blockedAt: now,
        };
      })
    );

    // Cancel any pending orders from this customer as fake
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.customerId === customerId && ord.status === 'pending') {
          return {
            ...ord,
            status: 'cancelled_fake',
            cancelReason: `Customer blocked: ${reason}`,
            updatedAt: now,
          };
        }
        return ord;
      })
    );
  };

  const unblockCustomer = (customerId: string) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id !== customerId) return c;
        return {
          ...c,
          isBlocked: false,
          blockReason: undefined,
          blockedAt: undefined,
        };
      })
    );
  };

  const recordCreditPayment = (
    customerId: string,
    amount: number,
    mode: 'cash' | 'upi' | 'bank_transfer',
    notes?: string
  ) => {
    const customer = customers.find((c) => c.id === customerId);
    if (!customer) return;

    const newBalance = Math.max(0, customer.currentCredit - amount);

    // Update customer
    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, currentCredit: newBalance } : c))
    );

    // Add entry to ledger
    const entry: CreditLedgerEntry = {
      id: `led-${Date.now()}`,
      customerId,
      storeId: activeStoreId,
      type: 'credit',
      amount,
      balanceAfter: newBalance,
      date: new Date().toISOString(),
      paymentMode: mode,
      notes: notes || `Payment received via ${mode.toUpperCase()}`,
      recordedBy: currentUser.name,
    };
    setCreditLedger((prev) => [entry, ...prev]);
  };

  const recordCreditDebit = (
    customerId: string,
    amount: number,
    billId?: string,
    notes?: string
  ) => {
    const customer = customers.find((c) => c.id === customerId);
    if (!customer) return;

    const newBalance = customer.currentCredit + amount;

    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, currentCredit: newBalance } : c))
    );

    const entry: CreditLedgerEntry = {
      id: `led-${Date.now()}`,
      customerId,
      storeId: activeStoreId,
      type: 'debit',
      amount,
      balanceAfter: newBalance,
      date: new Date().toISOString(),
      paymentMode: 'bill_credit',
      billId,
      notes: notes || 'Purchased goods on credit',
      recordedBy: currentUser.name,
    };
    setCreditLedger((prev) => [entry, ...prev]);
  };

  // Bills & Automated Billing
  const createBill = (
    billData: Omit<Bill, 'id' | 'billNumber' | 'storeId' | 'createdAt' | 'billedBy'>
  ): Bill => {
    const storeBills = bills.filter((b) => b.storeId === activeStoreId);
    const nextSeq = (storeBills.length + 1).toString().padStart(5, '0');
    const billNumber = `INV-${new Date().getFullYear()}-${nextSeq}`;

    const newBill: Bill = {
      ...billData,
      id: `bill-${Date.now()}`,
      billNumber,
      storeId: activeStoreId,
      createdAt: new Date().toISOString(),
      billedBy: currentUser.name,
    };

    // Deduct stock for all items
    billData.items.forEach((item) => {
      adjustStock(item.itemId, -item.quantity);
    });

    // If payment method is credit or split with credit, update customer ledger
    if (billData.customerId) {
      let creditAmt = 0;
      if (billData.paymentMethod === 'credit') {
        creditAmt = billData.totalAmount;
      } else if (billData.paymentMethod === 'split' && billData.paymentDetails?.creditAmount) {
        creditAmt = billData.paymentDetails.creditAmount;
      }

      if (creditAmt > 0) {
        recordCreditDebit(
          billData.customerId,
          creditAmt,
          newBill.id,
          `Bill #${billNumber} credit amount`
        );
      }
    }

    setBills((prev) => [newBill, ...prev]);
    return newBill;
  };

  // Customer Orders
  const placeCustomerOrder = (
    orderData: Omit<CustomerOrder, 'id' | 'orderNumber' | 'storeId' | 'status' | 'placedAt' | 'updatedAt'>
  ): CustomerOrder => {
    const orderSeq = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ORD-${orderSeq}`;
    const now = new Date().toISOString();

    const newOrder: CustomerOrder = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber,
      storeId: activeStoreId,
      status: 'pending',
      placedAt: now,
      updatedAt: now,
    };

    setOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: CustomerOrder['status'], cancelReason?: string) => {
    const now = new Date().toISOString();
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        return {
          ...ord,
          status,
          cancelReason: cancelReason || ord.cancelReason,
          updatedAt: now,
        };
      })
    );
  };

  const flagOrderAsFakeAndBlock = (orderId: string, reason: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    // 1. Cancel the order
    updateOrderStatus(orderId, 'cancelled_fake', `Flagged Fake: ${reason}`);

    // 2. Block the customer
    blockCustomer(order.customerId, `Fake order flag (#${order.orderNumber}): ${reason}`);
  };

  // Staff Management
  const addStaffMember = (memberData: Omit<StaffMember, 'id' | 'storeId' | 'joinedDate'>) => {
    const newStaff: StaffMember = {
      ...memberData,
      id: `staff-${Date.now()}`,
      storeId: activeStoreId,
      joinedDate: new Date().toISOString().split('T')[0],
    };
    setStaff((prev) => [...prev, newStaff]);
  };

  const updateStaffMember = (updated: StaffMember) => {
    setStaff((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const deleteStaffMember = (staffId: string) => {
    setStaff((prev) => prev.filter((s) => s.id !== staffId));
  };

  // KiranaSync Google Cloud Backup Engine
  const createKiranaSyncBackup = async (): Promise<KiranaSyncSnapshot> => {
    setIsSyncing(true);
    // Simulate cloud upload and folder creation in Google Cloud / Google Drive "KiranaSync"
    await new Promise((res) => setTimeout(res, 850));

    const timestamp = new Date().toISOString();
    const payload = {
      stores,
      activeStoreId,
      categories,
      inventory,
      customers,
      creditLedger,
      bills,
      orders,
      staff,
      timestamp,
    };
    const sizeKb = parseFloat((JSON.stringify(payload).length / 1024).toFixed(1));

    const newSnapshot: KiranaSyncSnapshot = {
      id: `snap-${Date.now()}`,
      timestamp,
      folderName: 'KiranaSync',
      backupVersion: `v1.${snapshots.length + 1}`,
      storeProfilesCount: stores.length,
      inventoryCount: inventory.length,
      customersCount: customers.length,
      billsCount: bills.length,
      ordersCount: orders.length,
      sizeKb,
      status: 'synced',
    };

    setSnapshots((prev) => [newSnapshot, ...prev]);
    setLastSyncTime(timestamp);
    setIsSyncing(false);
    return newSnapshot;
  };

  const restoreKiranaSyncBackup = (snapshotId: string) => {
    const snap = snapshots.find((s) => s.id === snapshotId);
    if (!snap) return;
    setLastSyncTime(new Date().toISOString());
  };

  const exportKiranaSyncJson = () => {
    const backupData = {
      version: 'KiranaSync-v1.0',
      exportedAt: new Date().toISOString(),
      targetCloudFolder: 'KiranaSync',
      stores,
      categories,
      inventory,
      customers,
      creditLedger,
      bills,
      orders,
      staff,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `KiranaSync_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importKiranaSyncJson = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.stores && Array.isArray(data.stores)) setStores(data.stores);
      if (data.categories && Array.isArray(data.categories)) setCategories(data.categories);
      if (data.inventory && Array.isArray(data.inventory)) setInventory(data.inventory);
      if (data.customers && Array.isArray(data.customers)) setCustomers(data.customers);
      if (data.creditLedger && Array.isArray(data.creditLedger)) setCreditLedger(data.creditLedger);
      if (data.bills && Array.isArray(data.bills)) setBills(data.bills);
      if (data.orders && Array.isArray(data.orders)) setOrders(data.orders);
      if (data.staff && Array.isArray(data.staff)) setStaff(data.staff);
      setLastSyncTime(new Date().toISOString());
      return true;
    } catch (e) {
      console.error('Failed to import KiranaSync backup file', e);
      return false;
    }
  };

  const logout = () => {
    // Keep user in customer or demo mode, or trigger login modal
    setCurrentUserState({
      id: 'guest',
      name: 'Guest Customer',
      email: '',
      phone: '',
      role: 'customer',
      storeId: activeStoreId,
    });
  };

  const loginAsDemoUser = (role: 'owner' | 'staff' | 'customer', specificId?: string) => {
    if (role === 'owner') {
      setCurrentUserState(DEFAULT_OWNER_USER);
    } else if (role === 'staff') {
      const staffMember = staff.find((s) => s.id === specificId) || staff[1] || staff[0];
      setCurrentUserState({
        id: staffMember.id,
        name: staffMember.name,
        email: staffMember.email,
        phone: staffMember.phone,
        role: staffMember.role,
        storeId: staffMember.storeId,
        permissions: staffMember.permissions,
      });
    } else {
      const cust = customers.find((c) => c.id === specificId) || customers[0];
      setCurrentUserState({
        id: cust.id,
        name: cust.name,
        email: cust.email,
        phone: cust.phone,
        role: 'customer',
        storeId: cust.storeId,
      });
    }
  };

  return (
    <StoreContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        stores,
        activeStoreId,
        activeStore,
        setActiveStoreId,
        createStoreProfile,
        updateStoreProfile,
        categories,
        addCategory,
        addCustomFieldToCategory,
        removeCustomFieldFromCategory,
        inventory,
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        adjustStock,
        lowStockItems,
        customers,
        addCustomer,
        updateCustomer,
        blockCustomer,
        unblockCustomer,
        creditLedger,
        recordCreditPayment,
        recordCreditDebit,
        bills,
        createBill,
        orders,
        placeCustomerOrder,
        updateOrderStatus,
        flagOrderAsFakeAndBlock,
        staff,
        addStaffMember,
        updateStaffMember,
        deleteStaffMember,
        snapshots,
        lastSyncTime,
        isSyncing,
        createKiranaSyncBackup,
        restoreKiranaSyncBackup,
        exportKiranaSyncJson,
        importKiranaSyncJson,
        logout,
        loginAsDemoUser,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within a StoreProvider');
  return context;
};
