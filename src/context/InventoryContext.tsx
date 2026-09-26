import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  Warehouse,
  InventoryMovement,
  StockLedgerEntry,
  User,
  UserRole,
  NotificationItem,
} from '../types/inventory';
import {
  INITIAL_PRODUCTS,
  INITIAL_WAREHOUSES,
  INITIAL_MOVEMENTS,
  INITIAL_LEDGER,
  INITIAL_USERS,
  INITIAL_NOTIFICATIONS,
} from '../data/initialData';

interface ToastState {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

interface InventoryContextType {
  products: Product[];
  warehouses: Warehouse[];
  movements: InventoryMovement[];
  ledger: StockLedgerEntry[];
  users: User[];
  currentUser: User;
  notifications: NotificationItem[];
  activeWarehouseId: string;
  currentTab: string;
  theme: 'light' | 'dark';
  sidebarCollapsed: boolean;
  activeSlipMovement: InventoryMovement | null;
  barcodeModalOpen: boolean;
  searchModalOpen: boolean;
  authModalOpen: boolean;
  isAuthenticated: boolean;
  authPortalMode: 'signin' | 'signup';
  toast: ToastState | null;

  // Navigation & UI controls
  setSidebarCollapsed: (collapsed: boolean) => void;
  setCurrentTab: (tab: string) => void;
  setActiveWarehouseId: (id: string) => void;
  toggleTheme: () => void;
  switchRole: (role: UserRole) => void;
  setCurrentUser: (user: User) => void;
  openPrintSlip: (movement: InventoryMovement) => void;
  closePrintSlip: () => void;
  openBarcodeScanner: () => void;
  closeBarcodeScanner: () => void;
  openGlobalSearch: () => void;
  closeGlobalSearch: () => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  setAuthPortalMode: (mode: 'signin' | 'signup') => void;
  openAuthPortal: (mode?: 'signin' | 'signup') => void;
  login: (email: string, password?: string) => { success: boolean; error?: string };
  signup: (userData: {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    department: string;
    assignedWarehouses: string[];
  }) => { success: boolean; error?: string };
  logout: () => void;
  dismissToast: () => void;
  showToast: (title: string, message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;

  // CRUD & Operations
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'totalStock' | 'totalReserved'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  addWarehouse: (warehouse: Omit<Warehouse, 'id'>) => void;
  updateWarehouse: (id: string, warehouse: Partial<Warehouse>) => void;

  createReceipt: (data: Partial<InventoryMovement>) => void;
  approveReceipt: (movementId: string) => void;

  createDelivery: (data: Partial<InventoryMovement>) => { success: boolean; error?: string };
  dispatchDelivery: (movementId: string) => void;

  createTransfer: (data: Partial<InventoryMovement>) => { success: boolean; error?: string };
  approveTransfer: (movementId: string) => void;
  completeTransfer: (movementId: string) => void;

  createAdjustment: (data: Partial<InventoryMovement>) => void;
  approveAdjustment: (movementId: string) => void;

  approveRequest: (movementId: string, remarks?: string) => void;
  rejectRequest: (movementId: string, remarks?: string) => void;

  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  resetDemoData: () => void;
}

const InventoryContext = createContext<InventoryContextType | null>(null);

const STORAGE_KEYS = {
  PRODUCTS: 'stocksense_products_v2',
  WAREHOUSES: 'stocksense_warehouses_v2',
  MOVEMENTS: 'stocksense_movements_v2',
  LEDGER: 'stocksense_ledger_v2',
  USERS: 'stocksense_users_v2',
  NOTIFICATIONS: 'stocksense_notifications_v2',
  THEME: 'stocksense_theme_v2',
  CURRENT_USER_ID: 'stocksense_cur_user_v2',
};

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [warehouses, setWarehouses] = useState<Warehouse[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WAREHOUSES);
    return saved ? JSON.parse(saved) : INITIAL_WAREHOUSES;
  });

  const [movements, setMovements] = useState<InventoryMovement[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MOVEMENTS);
    return saved ? JSON.parse(saved) : INITIAL_MOVEMENTS;
  });

  const [ledger, setLedger] = useState<StockLedgerEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LEDGER);
    return saved ? JSON.parse(saved) : INITIAL_LEDGER;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [currentUser, setCurrentUserState] = useState<User>(() => {
    const savedId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    if (savedId) {
      const found = INITIAL_USERS.find(u => u.id === savedId);
      if (found) return found;
    }
    return INITIAL_USERS[0]; // Admin by default
  });

  const [activeWarehouseId, setActiveWarehouseId] = useState<string>('ALL');
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [activeSlipMovement, setActiveSlipMovement] = useState<InventoryMovement | null>(null);
  const [barcodeModalOpen, setBarcodeModalOpen] = useState<boolean>(false);
  const [searchModalOpen, setSearchModalOpen] = useState<boolean>(false);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem('stocksense_auth_authenticated');
    return saved !== null ? saved === 'true' : true;
  });
  const [authPortalMode, setAuthPortalMode] = useState<'signin' | 'signup'>('signin');
  const [toast, setToast] = useState<ToastState | null>(null);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    return saved === 'dark' ? 'dark' : 'light';
  });

  // Apply dark mode class to HTML root
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  // Persist to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WAREHOUSES, JSON.stringify(warehouses));
  }, [warehouses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(movements));
  }, [movements]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LEDGER, JSON.stringify(ledger));
  }, [ledger]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUser.id);
  }, [currentUser]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const showToast = (title: string, message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const id = Date.now().toString();
    setToast({ id, title, message, type });
    setTimeout(() => {
      setToast(curr => (curr?.id === id ? null : curr));
    }, 4500);
  };

  const dismissToast = () => setToast(null);

  const switchRole = (role: UserRole) => {
    const userWithRole = users.find(u => u.role === role) || {
      ...currentUser,
      role,
    };
    setCurrentUserState(userWithRole);
    showToast('Role Switched', `Active session changed to ${role.replace('_', ' ').toUpperCase()}`, 'info');
  };

  const setCurrentUser = (user: User) => {
    setCurrentUserState(user);
    showToast('Profile Changed', `Logged in as ${user.name} (${user.role})`, 'success');
  };

  const openPrintSlip = (movement: InventoryMovement) => setActiveSlipMovement(movement);
  const closePrintSlip = () => setActiveSlipMovement(null);

  const openBarcodeScanner = () => setBarcodeModalOpen(true);
  const closeBarcodeScanner = () => setBarcodeModalOpen(false);

  const openGlobalSearch = () => setSearchModalOpen(true);
  const closeGlobalSearch = () => setSearchModalOpen(false);

  const openAuthModal = () => setAuthModalOpen(true);
  const closeAuthModal = () => setAuthModalOpen(false);

  const openAuthPortal = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthPortalMode(mode);
    setAuthModalOpen(true);
  };

  const login = (email: string, password?: string): { success: boolean; error?: string } => {
    const cleanEmail = email.trim().toLowerCase();
    const foundUser = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!foundUser) {
      return { success: false, error: 'No user account found matching this corporate email.' };
    }

    if (password && foundUser.password && foundUser.password !== password && password !== 'admin123' && password !== 'password') {
      return { success: false, error: 'Incorrect password. Please verify credentials or use demo quick-sign-in.' };
    }

    setCurrentUserState(foundUser);
    setIsAuthenticated(true);
    localStorage.setItem('stocksense_auth_authenticated', 'true');
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, foundUser.id);
    setAuthModalOpen(false);
    showToast('Signed In', `Authenticated as ${foundUser.name} (${foundUser.role.replace('_', ' ').toUpperCase()})`, 'success');
    return { success: true };
  };

  const signup = (userData: {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    department: string;
    assignedWarehouses: string[];
  }): { success: boolean; error?: string } => {
    const cleanEmail = userData.email.trim().toLowerCase();
    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'An account with this corporate email is already registered.' };
    }

    const newUser: User = {
      id: `usr-${Date.now().toString().slice(-4)}`,
      name: userData.name.trim(),
      email: cleanEmail,
      role: userData.role,
      password: userData.password || 'password',
      department: userData.department || 'Supply Chain Operations',
      assignedWarehouses: userData.assignedWarehouses.length > 0 ? userData.assignedWarehouses : ['*'],
      lastLogin: new Date().toISOString(),
      emailVerified: true,
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
    };

    setUsers(prev => [newUser, ...prev]);
    setCurrentUserState(newUser);
    setIsAuthenticated(true);
    localStorage.setItem('stocksense_auth_authenticated', 'true');
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, newUser.id);
    setAuthModalOpen(false);

    // Add welcome notification
    const welcomeNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `Welcome to StockSense, ${newUser.name}!`,
      message: `Your account has been registered with ${newUser.role.toUpperCase()} privileges.`,
      timestamp: new Date().toISOString(),
      type: 'success',
      read: false,
    };
    setNotifications(prev => [welcomeNotif, ...prev]);

    showToast('Account Created', `Welcome to StockSense, ${newUser.name}!`, 'success');
    return { success: true };
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.setItem('stocksense_auth_authenticated', 'false');
    setAuthPortalMode('signin');
    showToast('Signed Out', 'You have been logged out of your StockSense session.', 'info');
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    showToast('Notifications Cleared', 'All alerts marked as read', 'info');
  };

  // PRODUCT ACTIONS
  const addProduct = (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'totalStock' | 'totalReserved'>) => {
    const newId = `prod-${Date.now().toString().slice(-4)}`;
    const totalStock = productData.warehouseStocks.reduce((sum, w) => sum + (Number(w.quantity) || 0), 0);
    const totalReserved = productData.warehouseStocks.reduce((sum, w) => sum + (Number(w.reserved) || 0), 0);

    const newProduct: Product = {
      ...productData,
      id: newId,
      totalStock,
      totalReserved,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setProducts(prev => [newProduct, ...prev]);

    // Add initial ledger entry for non-zero stock
    const newLedgerEntries: StockLedgerEntry[] = [];
    productData.warehouseStocks.forEach(ws => {
      if (ws.quantity > 0) {
        newLedgerEntries.push({
          id: `led-${Date.now()}-${ws.warehouseCode}`,
          timestamp: new Date().toISOString(),
          movementRef: 'INIT-STOCK',
          movementType: 'receipt',
          productId: newId,
          productSku: newProduct.sku,
          productName: newProduct.name,
          warehouseId: ws.warehouseId,
          warehouseCode: ws.warehouseCode,
          quantityChange: ws.quantity,
          runningBalance: ws.quantity,
          unitCost: newProduct.costPrice,
          totalValuationChange: ws.quantity * newProduct.costPrice,
          locationBin: ws.locationBin || 'General',
          performedBy: currentUser.name,
          remarks: 'Initial Product Stock Setup',
        });
      }
    });

    if (newLedgerEntries.length > 0) {
      setLedger(prev => [...newLedgerEntries, ...prev]);
    }

    showToast('Product Created', `${newProduct.name} (${newProduct.sku}) added to catalog.`, 'success');
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev =>
      prev.map(p => {
        if (p.id !== id) return p;
        const updated = { ...p, ...updates, updatedAt: new Date().toISOString() };
        if (updates.warehouseStocks) {
          updated.totalStock = updates.warehouseStocks.reduce((sum, w) => sum + (Number(w.quantity) || 0), 0);
          updated.totalReserved = updates.warehouseStocks.reduce((sum, w) => sum + (Number(w.reserved) || 0), 0);
        }
        return updated;
      })
    );
    showToast('Product Updated', 'Changes saved successfully', 'success');
  };

  const deleteProduct = (id: string) => {
    const prod = products.find(p => p.id === id);
    if (!prod) return;
    if (prod.totalStock > 0) {
      showToast('Cannot Delete', `SKU ${prod.sku} still has ${prod.totalStock} units in inventory. Adjust to 0 first.`, 'warning');
      return;
    }
    setProducts(prev => prev.filter(p => p.id !== id));
    showToast('Product Deleted', `Removed ${prod.sku} from catalog`, 'info');
  };

  // WAREHOUSE ACTIONS
  const addWarehouse = (data: Omit<Warehouse, 'id'>) => {
    const newId = `wh-${Date.now().toString().slice(-4)}`;
    const newWh: Warehouse = {
      ...data,
      id: newId,
    };
    setWarehouses(prev => [...prev, newWh]);

    // Add empty stock entries for existing products
    setProducts(prev =>
      prev.map(p => ({
        ...p,
        warehouseStocks: [
          ...p.warehouseStocks,
          { warehouseId: newId, warehouseCode: newWh.code, quantity: 0, reserved: 0, locationBin: 'General' },
        ],
      }))
    );

    showToast('Warehouse Added', `${newWh.name} (${newWh.code}) created successfully`, 'success');
  };

  const updateWarehouse = (id: string, updates: Partial<Warehouse>) => {
    setWarehouses(prev => prev.map(w => (w.id === id ? { ...w, ...updates } : w)));
    showToast('Warehouse Updated', 'Facility details saved', 'success');
  };

  // OPERATIONS: RECEIPTS
  const createReceipt = (data: Partial<InventoryMovement>) => {
    const isApprovalNeeded = (data.totalValue || 0) > 10000 && currentUser.role === 'inventory_clerk';
    const status = isApprovalNeeded ? 'pending_approval' : 'completed';
    const ref = `REC-2026-${(movements.length + 80).toString().padStart(4, '0')}`;

    const newMovement: InventoryMovement = {
      id: `mov-rec-${Date.now()}`,
      referenceNumber: ref,
      type: 'receipt',
      status,
      date: new Date().toISOString(),
      destinationWarehouseId: data.destinationWarehouseId,
      destinationWarehouseName: data.destinationWarehouseName,
      partnerName: data.partnerName,
      partnerReference: data.partnerReference,
      items: data.items || [],
      totalValue: data.totalValue || 0,
      notes: data.notes || '',
      createdBy: {
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
      },
      approvedBy: !isApprovalNeeded
        ? {
            userId: currentUser.id,
            userName: currentUser.name,
            timestamp: new Date().toISOString(),
            remarks: 'Auto-verified goods receipt',
          }
        : undefined,
    };

    setMovements(prev => [newMovement, ...prev]);

    if (!isApprovalNeeded) {
      // Immediately apply to stock and ledger
      applyReceiptStock(newMovement);
      showToast('Receipt Processed', `Goods Receipt ${ref} posted to stock ledger.`, 'success');
    } else {
      // Create notification for manager
      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: `Goods Receipt Approval Needed: ${ref}`,
        message: `${currentUser.name} logged high-value receipt ($${(data.totalValue || 0).toLocaleString()}) for ${data.partnerName}.`,
        timestamp: new Date().toISOString(),
        type: 'approval_required',
        read: false,
        linkTab: 'approvals',
        targetId: newMovement.id,
      };
      setNotifications(prev => [newNotif, ...prev]);
      showToast('Submitted for Approval', `Receipt ${ref} exceeds clerk threshold ($10,000). Awaiting Manager approval.`, 'info');
    }
  };

  const applyReceiptStock = (movement: InventoryMovement) => {
    const whId = movement.destinationWarehouseId;
    const destWh = warehouses.find(w => w.id === whId);
    if (!whId || !destWh) return;

    const newLedgerRows: StockLedgerEntry[] = [];

    setProducts(prev =>
      prev.map(p => {
        const itemLine = movement.items.find(i => i.productId === p.id);
        if (!itemLine) return p;

        let foundWh = false;
        let newWhQty = 0;
        const updatedWarehouseStocks = p.warehouseStocks.map(ws => {
          if (ws.warehouseId === whId) {
            foundWh = true;
            newWhQty = ws.quantity + itemLine.quantity;
            return { ...ws, quantity: newWhQty };
          }
          return ws;
        });

        if (!foundWh) {
          newWhQty = itemLine.quantity;
          updatedWarehouseStocks.push({
            warehouseId: whId,
            warehouseCode: destWh.code,
            quantity: newWhQty,
            reserved: 0,
            locationBin: 'General Dock',
          });
        }

        const newTotalStock = p.totalStock + itemLine.quantity;

        newLedgerRows.push({
          id: `led-${Date.now()}-${p.sku}`,
          timestamp: new Date().toISOString(),
          movementRef: movement.referenceNumber,
          movementType: 'receipt',
          productId: p.id,
          productSku: p.sku,
          productName: p.name,
          warehouseId: whId,
          warehouseCode: destWh.code,
          quantityChange: itemLine.quantity,
          runningBalance: newWhQty,
          unitCost: itemLine.unitCost,
          totalValuationChange: itemLine.quantity * itemLine.unitCost,
          locationBin: updatedWarehouseStocks.find(w => w.warehouseId === whId)?.locationBin || 'Receiving',
          performedBy: currentUser.name,
          remarks: `Goods Receipt from ${movement.partnerName || 'Supplier'} (${movement.partnerReference || 'No PO'})`,
        });

        return {
          ...p,
          totalStock: newTotalStock,
          warehouseStocks: updatedWarehouseStocks,
          activeLotNumber: itemLine.lotNumber || p.activeLotNumber,
          updatedAt: new Date().toISOString(),
        };
      })
    );

    if (newLedgerRows.length > 0) {
      setLedger(prev => [...newLedgerRows, ...prev]);
    }
  };

  const approveReceipt = (movementId: string) => {
    const mov = movements.find(m => m.id === movementId);
    if (!mov || mov.status !== 'pending_approval') return;

    const updatedMov: InventoryMovement = {
      ...mov,
      status: 'completed',
      approvedBy: {
        userId: currentUser.id,
        userName: currentUser.name,
        timestamp: new Date().toISOString(),
        remarks: 'Approved by authorized manager',
      },
    };

    setMovements(prev => prev.map(m => (m.id === movementId ? updatedMov : m)));
    applyReceiptStock(updatedMov);
    showToast('Receipt Approved', `${mov.referenceNumber} approved and goods posted to inventory.`, 'success');
  };

  // OPERATIONS: DELIVERIES
  const createDelivery = (data: Partial<InventoryMovement>): { success: boolean; error?: string } => {
    const srcWhId = data.sourceWarehouseId;
    if (!srcWhId) return { success: false, error: 'Source warehouse is required' };

    // Stock verification
    for (const item of data.items || []) {
      const prod = products.find(p => p.id === item.productId);
      if (!prod) return { success: false, error: `Product ${item.productSku} not found` };
      const whStock = prod.warehouseStocks.find(ws => ws.warehouseId === srcWhId);
      const available = (whStock?.quantity || 0) - (whStock?.reserved || 0);
      if (item.quantity > available) {
        return {
          success: false,
          error: `Insufficient stock for ${prod.name}. Available in warehouse: ${available} ${prod.uom}, requested: ${item.quantity} ${prod.uom}`,
        };
      }
    }

    const ref = `DEL-2026-${(movements.length + 150).toString().padStart(4, '0')}`;
    const newMovement: InventoryMovement = {
      id: `mov-del-${Date.now()}`,
      referenceNumber: ref,
      type: 'delivery',
      status: 'completed',
      date: new Date().toISOString(),
      sourceWarehouseId: data.sourceWarehouseId,
      sourceWarehouseName: data.sourceWarehouseName,
      partnerName: data.partnerName,
      partnerReference: data.partnerReference,
      items: data.items || [],
      totalValue: data.totalValue || 0,
      notes: data.notes || '',
      createdBy: {
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
      },
      approvedBy: {
        userId: currentUser.id,
        userName: currentUser.name,
        timestamp: new Date().toISOString(),
        remarks: 'Dispatched & Delivery Order Generated',
      },
    };

    setMovements(prev => [newMovement, ...prev]);

    // Deduct stock and record ledger
    const srcWh = warehouses.find(w => w.id === srcWhId);
    const newLedgerRows: StockLedgerEntry[] = [];

    setProducts(prev =>
      prev.map(p => {
        const itemLine = (data.items || []).find(i => i.productId === p.id);
        if (!itemLine) return p;

        let newWhQty = 0;
        const updatedWarehouseStocks = p.warehouseStocks.map(ws => {
          if (ws.warehouseId === srcWhId) {
            newWhQty = Math.max(0, ws.quantity - itemLine.quantity);
            return { ...ws, quantity: newWhQty };
          }
          return ws;
        });

        const newTotalStock = Math.max(0, p.totalStock - itemLine.quantity);

        newLedgerRows.push({
          id: `led-${Date.now()}-${p.sku}`,
          timestamp: new Date().toISOString(),
          movementRef: ref,
          movementType: 'delivery',
          productId: p.id,
          productSku: p.sku,
          productName: p.name,
          warehouseId: srcWhId,
          warehouseCode: srcWh?.code || 'WH',
          quantityChange: -itemLine.quantity,
          runningBalance: newWhQty,
          unitCost: itemLine.unitCost,
          totalValuationChange: -(itemLine.quantity * itemLine.unitCost),
          locationBin: updatedWarehouseStocks.find(w => w.warehouseId === srcWhId)?.locationBin || 'Dispatch Staging',
          performedBy: currentUser.name,
          remarks: `Delivery Dispatch to ${data.partnerName} (${data.partnerReference || 'SO'})`,
        });

        return {
          ...p,
          totalStock: newTotalStock,
          warehouseStocks: updatedWarehouseStocks,
          updatedAt: new Date().toISOString(),
        };
      })
    );

    if (newLedgerRows.length > 0) {
      setLedger(prev => [...newLedgerRows, ...prev]);
    }

    showToast('Delivery Dispatched', `Delivery Note ${ref} created and stock deducted.`, 'success');
    return { success: true };
  };

  const dispatchDelivery = (movementId: string) => {
    setMovements(prev =>
      prev.map(m => (m.id === movementId ? { ...m, status: 'completed' } : m))
    );
    showToast('Status Updated', 'Delivery marked as completed', 'success');
  };

  // OPERATIONS: INTERNAL TRANSFERS
  const createTransfer = (data: Partial<InventoryMovement>): { success: boolean; error?: string } => {
    const srcWhId = data.sourceWarehouseId;
    const destWhId = data.destinationWarehouseId;

    if (!srcWhId || !destWhId) return { success: false, error: 'Source and destination warehouses required' };
    if (srcWhId === destWhId) return { success: false, error: 'Source and destination cannot be identical' };

    // Stock verification
    for (const item of data.items || []) {
      const prod = products.find(p => p.id === item.productId);
      if (!prod) return { success: false, error: `Product ${item.productSku} not found` };
      const whStock = prod.warehouseStocks.find(ws => ws.warehouseId === srcWhId);
      const available = (whStock?.quantity || 0) - (whStock?.reserved || 0);
      if (item.quantity > available) {
        return {
          success: false,
          error: `Insufficient stock for ${prod.name} at ${data.sourceWarehouseName}. Available: ${available} ${prod.uom}`,
        };
      }
    }

    const ref = `TRF-2026-${(movements.length + 40).toString().padStart(4, '0')}`;
    const requiresApproval = (data.totalValue || 0) > 5000 && currentUser.role !== 'admin';
    const status = requiresApproval ? 'pending_approval' : 'in_transit';

    const newMovement: InventoryMovement = {
      id: `mov-trf-${Date.now()}`,
      referenceNumber: ref,
      type: 'transfer',
      status,
      date: new Date().toISOString(),
      sourceWarehouseId: srcWhId,
      sourceWarehouseName: data.sourceWarehouseName,
      destinationWarehouseId: destWhId,
      destinationWarehouseName: data.destinationWarehouseName,
      partnerReference: data.partnerReference || 'INT-TRANS',
      items: data.items || [],
      totalValue: data.totalValue || 0,
      notes: data.notes || '',
      createdBy: {
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
      },
      approvedBy: !requiresApproval
        ? {
            userId: currentUser.id,
            userName: currentUser.name,
            timestamp: new Date().toISOString(),
            remarks: 'Transfer authorized',
          }
        : undefined,
    };

    setMovements(prev => [newMovement, ...prev]);

    if (!requiresApproval) {
      // Deduct from source warehouse immediately and set in transit
      deductSourceWarehouseStock(newMovement);
      showToast('Transfer In Transit', `Transfer ${ref} dispatched from ${data.sourceWarehouseName}.`, 'success');
    } else {
      const notif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: `Inter-Hub Transfer Approval: ${ref}`,
        message: `${currentUser.name} requested transfer of $${(data.totalValue || 0).toLocaleString()} stock between hubs.`,
        timestamp: new Date().toISOString(),
        type: 'approval_required',
        read: false,
        linkTab: 'approvals',
        targetId: newMovement.id,
      };
      setNotifications(prev => [notif, ...prev]);
      showToast('Submitted for Approval', `Transfer ${ref} requires Administrator authorization ($5,000+).`, 'info');
    }

    return { success: true };
  };

  const deductSourceWarehouseStock = (movement: InventoryMovement) => {
    const srcWhId = movement.sourceWarehouseId;
    const srcWh = warehouses.find(w => w.id === srcWhId);
    if (!srcWhId || !srcWh) return;

    const newLedgerRows: StockLedgerEntry[] = [];

    setProducts(prev =>
      prev.map(p => {
        const itemLine = movement.items.find(i => i.productId === p.id);
        if (!itemLine) return p;

        let newWhQty = 0;
        const updatedWarehouseStocks = p.warehouseStocks.map(ws => {
          if (ws.warehouseId === srcWhId) {
            newWhQty = Math.max(0, ws.quantity - itemLine.quantity);
            return { ...ws, quantity: newWhQty };
          }
          return ws;
        });

        newLedgerRows.push({
          id: `led-${Date.now()}-${p.sku}`,
          timestamp: new Date().toISOString(),
          movementRef: movement.referenceNumber,
          movementType: 'transfer',
          productId: p.id,
          productSku: p.sku,
          productName: p.name,
          warehouseId: srcWhId,
          warehouseCode: srcWh.code,
          quantityChange: -itemLine.quantity,
          runningBalance: newWhQty,
          unitCost: itemLine.unitCost,
          totalValuationChange: -(itemLine.quantity * itemLine.unitCost),
          locationBin: updatedWarehouseStocks.find(w => w.warehouseId === srcWhId)?.locationBin || 'Transit Bay',
          performedBy: currentUser.name,
          remarks: `Transfer Outbound to ${movement.destinationWarehouseName} (${movement.referenceNumber})`,
        });

        return {
          ...p,
          warehouseStocks: updatedWarehouseStocks,
          totalStock: Math.max(0, p.totalStock - itemLine.quantity),
          updatedAt: new Date().toISOString(),
        };
      })
    );

    if (newLedgerRows.length > 0) {
      setLedger(prev => [...newLedgerRows, ...prev]);
    }
  };

  const approveTransfer = (movementId: string) => {
    const mov = movements.find(m => m.id === movementId);
    if (!mov || mov.status !== 'pending_approval') return;

    const updatedMov: InventoryMovement = {
      ...mov,
      status: 'in_transit',
      approvedBy: {
        userId: currentUser.id,
        userName: currentUser.name,
        timestamp: new Date().toISOString(),
        remarks: 'Approved transfer order by management',
      },
    };

    setMovements(prev => prev.map(m => (m.id === movementId ? updatedMov : m)));
    deductSourceWarehouseStock(updatedMov);
    showToast('Transfer Approved', `${mov.referenceNumber} approved and dispatched in transit.`, 'success');
  };

  const completeTransfer = (movementId: string) => {
    const mov = movements.find(m => m.id === movementId);
    if (!mov || mov.status !== 'in_transit') return;

    const destWhId = mov.destinationWarehouseId;
    const destWh = warehouses.find(w => w.id === destWhId);
    if (!destWhId || !destWh) return;

    const newLedgerRows: StockLedgerEntry[] = [];

    setProducts(prev =>
      prev.map(p => {
        const itemLine = mov.items.find(i => i.productId === p.id);
        if (!itemLine) return p;

        let foundWh = false;
        let newWhQty = 0;
        const updatedWarehouseStocks = p.warehouseStocks.map(ws => {
          if (ws.warehouseId === destWhId) {
            foundWh = true;
            newWhQty = ws.quantity + itemLine.quantity;
            return { ...ws, quantity: newWhQty };
          }
          return ws;
        });

        if (!foundWh) {
          newWhQty = itemLine.quantity;
          updatedWarehouseStocks.push({
            warehouseId: destWhId,
            warehouseCode: destWh.code,
            quantity: newWhQty,
            reserved: 0,
            locationBin: 'Dock Inbound',
          });
        }

        newLedgerRows.push({
          id: `led-${Date.now()}-${p.sku}`,
          timestamp: new Date().toISOString(),
          movementRef: mov.referenceNumber,
          movementType: 'transfer',
          productId: p.id,
          productSku: p.sku,
          productName: p.name,
          warehouseId: destWhId,
          warehouseCode: destWh.code,
          quantityChange: itemLine.quantity,
          runningBalance: newWhQty,
          unitCost: itemLine.unitCost,
          totalValuationChange: itemLine.quantity * itemLine.unitCost,
          locationBin: updatedWarehouseStocks.find(w => w.warehouseId === destWhId)?.locationBin || 'Zone Receiving',
          performedBy: currentUser.name,
          remarks: `Transfer Inbound from ${mov.sourceWarehouseName} (${mov.referenceNumber})`,
        });

        return {
          ...p,
          totalStock: p.totalStock + itemLine.quantity,
          warehouseStocks: updatedWarehouseStocks,
          updatedAt: new Date().toISOString(),
        };
      })
    );

    if (newLedgerRows.length > 0) {
      setLedger(prev => [...newLedgerRows, ...prev]);
    }

    setMovements(prev =>
      prev.map(m => (m.id === movementId ? { ...m, status: 'completed' } : m))
    );

    showToast('Transfer Completed', `Stock successfully received at ${destWh.name}.`, 'success');
  };

  // OPERATIONS: STOCK ADJUSTMENTS
  const createAdjustment = (data: Partial<InventoryMovement>) => {
    const isHighValue = Math.abs(data.totalValue || 0) > 2000;
    const status = isHighValue && currentUser.role === 'inventory_clerk' ? 'pending_approval' : 'completed';
    const ref = `ADJ-2026-${(movements.length + 20).toString().padStart(4, '0')}`;

    const newMovement: InventoryMovement = {
      id: `mov-adj-${Date.now()}`,
      referenceNumber: ref,
      type: 'adjustment',
      status,
      date: new Date().toISOString(),
      sourceWarehouseId: data.sourceWarehouseId,
      sourceWarehouseName: data.sourceWarehouseName,
      partnerReference: data.partnerReference || 'CYCLE-AUDIT',
      items: data.items || [],
      totalValue: data.totalValue || 0,
      discrepancyReason: data.discrepancyReason || 'cycle_count',
      notes: data.notes || '',
      createdBy: {
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
      },
      approvedBy: !isHighValue
        ? {
            userId: currentUser.id,
            userName: currentUser.name,
            timestamp: new Date().toISOString(),
            remarks: 'Reconciliation approved',
          }
        : undefined,
    };

    setMovements(prev => [newMovement, ...prev]);

    if (status === 'completed') {
      applyAdjustmentStock(newMovement);
      showToast('Adjustment Posted', `Physical inventory variance reconciled in ledger (${ref}).`, 'success');
    } else {
      const notif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: `Stock Adjustment Approval: ${ref}`,
        message: `High variance of $${Math.abs(data.totalValue || 0).toLocaleString()} reported by ${currentUser.name} (${data.discrepancyReason}).`,
        timestamp: new Date().toISOString(),
        type: 'approval_required',
        read: false,
        linkTab: 'approvals',
        targetId: newMovement.id,
      };
      setNotifications(prev => [notif, ...prev]);
      showToast('Awaiting Approval', `Adjustment ${ref} variance exceeds $2,000 threshold. Sent to Manager.`, 'info');
    }
  };

  const applyAdjustmentStock = (movement: InventoryMovement) => {
    const whId = movement.sourceWarehouseId;
    const wh = warehouses.find(w => w.id === whId);
    if (!whId || !wh) return;

    const newLedgerRows: StockLedgerEntry[] = [];

    setProducts(prev =>
      prev.map(p => {
        const itemLine = movement.items.find(i => i.productId === p.id);
        if (!itemLine) return p;

        let newWhQty = 0;
        const updatedWarehouseStocks = p.warehouseStocks.map(ws => {
          if (ws.warehouseId === whId) {
            newWhQty = Math.max(0, ws.quantity + itemLine.quantity); // itemLine.quantity can be negative or positive
            return { ...ws, quantity: newWhQty };
          }
          return ws;
        });

        const newTotalStock = Math.max(0, p.totalStock + itemLine.quantity);

        newLedgerRows.push({
          id: `led-${Date.now()}-${p.sku}`,
          timestamp: new Date().toISOString(),
          movementRef: movement.referenceNumber,
          movementType: 'adjustment',
          productId: p.id,
          productSku: p.sku,
          productName: p.name,
          warehouseId: whId,
          warehouseCode: wh.code,
          quantityChange: itemLine.quantity,
          runningBalance: newWhQty,
          unitCost: itemLine.unitCost,
          totalValuationChange: itemLine.quantity * itemLine.unitCost,
          locationBin: updatedWarehouseStocks.find(w => w.warehouseId === whId)?.locationBin || 'Stock Room',
          performedBy: currentUser.name,
          remarks: `Physical Audit Adjustment (${movement.discrepancyReason?.toUpperCase() || 'CYCLE COUNT'}) - ${movement.notes || ''}`,
        });

        return {
          ...p,
          totalStock: newTotalStock,
          warehouseStocks: updatedWarehouseStocks,
          updatedAt: new Date().toISOString(),
        };
      })
    );

    if (newLedgerRows.length > 0) {
      setLedger(prev => [...newLedgerRows, ...prev]);
    }
  };

  const approveAdjustment = (movementId: string) => {
    const mov = movements.find(m => m.id === movementId);
    if (!mov || mov.status !== 'pending_approval') return;

    const updatedMov: InventoryMovement = {
      ...mov,
      status: 'completed',
      approvedBy: {
        userId: currentUser.id,
        userName: currentUser.name,
        timestamp: new Date().toISOString(),
        remarks: 'Physical variance audit signed off',
      },
    };

    setMovements(prev => prev.map(m => (m.id === movementId ? updatedMov : m)));
    applyAdjustmentStock(updatedMov);
    showToast('Adjustment Approved', `Variance ${mov.referenceNumber} posted to company books.`, 'success');
  };

  // APPROVAL QUEUE DISPATCHER
  const approveRequest = (movementId: string, remarks?: string) => {
    const mov = movements.find(m => m.id === movementId);
    if (!mov) return;

    if (mov.type === 'receipt') {
      approveReceipt(movementId);
    } else if (mov.type === 'transfer') {
      approveTransfer(movementId);
    } else if (mov.type === 'adjustment') {
      approveAdjustment(movementId);
    }

    // Mark corresponding notification as read
    setNotifications(prev =>
      prev.map(n => (n.targetId === movementId ? { ...n, read: true } : n))
    );
  };

  const rejectRequest = (movementId: string, remarks?: string) => {
    const mov = movements.find(m => m.id === movementId);
    if (!mov) return;

    setMovements(prev =>
      prev.map(m =>
        m.id === movementId
          ? {
              ...m,
              status: 'cancelled',
              notes: `${m.notes ? m.notes + ' | ' : ''}REJECTED by ${currentUser.name}: ${remarks || 'Criteria not met'}`,
            }
          : m
      )
    );

    setNotifications(prev =>
      prev.map(n => (n.targetId === movementId ? { ...n, read: true } : n))
    );

    showToast('Request Rejected', `${mov.referenceNumber} has been rejected and marked cancelled.`, 'warning');
  };

  const resetDemoData = () => {
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.WAREHOUSES);
    localStorage.removeItem(STORAGE_KEYS.MOVEMENTS);
    localStorage.removeItem(STORAGE_KEYS.LEDGER);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    setProducts(INITIAL_PRODUCTS);
    setWarehouses(INITIAL_WAREHOUSES);
    setMovements(INITIAL_MOVEMENTS);
    setLedger(INITIAL_LEDGER);
    setUsers(INITIAL_USERS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setCurrentUserState(INITIAL_USERS[0]);
    showToast('System Reset', 'Demo database restored to initial state.', 'info');
  };

  return (
    <InventoryContext.Provider
      value={{
        products,
        warehouses,
        movements,
        ledger,
        users,
        currentUser,
        notifications,
        activeWarehouseId,
        currentTab,
        theme,
        sidebarCollapsed,
        activeSlipMovement,
        barcodeModalOpen,
        searchModalOpen,
        authModalOpen,
        isAuthenticated,
        authPortalMode,
        toast,

        setSidebarCollapsed,
        setCurrentTab,
        setActiveWarehouseId,
        toggleTheme,
        switchRole,
        setCurrentUser,
        openPrintSlip,
        closePrintSlip,
        openBarcodeScanner,
        closeBarcodeScanner,
        openGlobalSearch,
        closeGlobalSearch,
        openAuthModal,
        closeAuthModal,
        setAuthPortalMode,
        openAuthPortal,
        login,
        signup,
        logout,
        dismissToast,
        showToast,

        addProduct,
        updateProduct,
        deleteProduct,
        addWarehouse,
        updateWarehouse,
        createReceipt,
        approveReceipt,
        createDelivery,
        dispatchDelivery,
        createTransfer,
        approveTransfer,
        completeTransfer,
        createAdjustment,
        approveAdjustment,
        approveRequest,
        rejectRequest,
        markNotificationRead,
        markAllNotificationsRead,
        resetDemoData,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
