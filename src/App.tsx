import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Building2,
  Package,
  Users,
  ShoppingCart,
  Database,
  ShieldCheck,
  Receipt,
  BarChart3,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Laptop,
  Check,
  Building,
  UserCheck,
  LogOut,
  Settings,
  Sun,
  Moon,
  Menu
} from 'lucide-react';

// Import local services and components
import {
  loadAppData,
  subscribeToAppData,
  saveAppData,
  addBranch,
  updateBranch,
  deleteBranch,
  clearBranches,
  addBranches,
  addProduct,
  updateProduct,
  deleteProduct,
  clearProducts,
  addProductWithCustomFields,
  addCategory,
  addBrand,
  addUoM,
  deleteCategory,
  deleteBrand,
  deleteUoM,
  addEmployee,
  updateEmployee,
  deleteEmployee,
  updateEmployeePermissions,
  addDepartment,
  addDesignation,
  addPurchase,
  updatePurchase,
  deletePurchase,
  addPurchaseReturn,
  updatePurchaseReturn,
  deletePurchaseReturn,
  addSupplier,
  updateSupplier,
  deleteSupplier,
  addDelivery,
  updateDelivery,
  deleteDelivery,
  addSell,
  updateSell,
  deleteSell,
  addAdjustment,
  updateAdjustment,
  deleteAdjustment,
  addTransfer,
  updateTransfer,
  deleteTransfer,
  addTransaction,
  updateTransaction,
  approvePurchase,
  approveDelivery,
  approveReturn,
  approveAdjustment,
  approveRequisition,
} from './dbService';

import { getRegisteredUsers, saveRegisteredUsers, subscribeToUsers } from './userService';

import { 
  AppState, 
  UserRole, 
  Branch, 
  UserAccount, 
  Permissions, 
  Employee,
  Product,
  Purchase,
  PurchaseReturn,
  Supplier,
  Delivery,
  SellRecord,
  Adjustment,
  InternalTransfer as Transfer,
  CashTransaction
} from './types';

// Views
import AuthView from './components/AuthView';
import DashboardView from './components/DashboardView';
import BranchView from './components/BranchView';
import ProductView from './components/ProductView';
import HRMSView from './components/HRMSView';
import PurchaseView from './components/PurchaseView';
import InventoryView from './components/InventoryView';
import ApprovalView from './components/ApprovalView';
import CashBookView from './components/CashBookView';
import ReportView from './components/ReportView';
import SettingsView from './components/SettingsView';

const menuBgColors: Record<string, string> = {
  'Dashboard': 'bg-[#FF3131]',
  'Branch': 'bg-[#6366F1]',
  'HRMS': 'bg-[#06B6D4]',
  'Product': 'bg-[#10B981]',
  'Purchase': 'bg-[#0f0f0f]',
  'Inventory': 'bg-[#14B8A6]',
  'Approval': 'bg-[#84CC16]',
  'Cash Book': 'bg-[#FACC15]',
  'Report': 'bg-[#8B5CF6]',
  'Settings': 'bg-[#0f0f0f]',
};

const menuShadowColors: Record<string, string> = {
  'Dashboard': 'shadow-[0_0_8px_#FF3131]',
  'Branch': 'shadow-[0_0_8px_#6366F1]',
  'HRMS': 'shadow-[0_0_8px_#06B6D4]',
  'Product': 'shadow-[0_0_8px_#10B981]',
  'Purchase': 'shadow-[0_0_8px_#0f0f0f]',
  'Inventory': 'shadow-[0_0_8px_#14B8A6]',
  'Approval': 'shadow-[0_0_8px_#84CC16]',
  'Cash Book': 'shadow-[0_0_8px_#FACC15]',
  'Report': 'shadow-[0_0_8px_#8B5CF6]',
  'Settings': 'shadow-[0_0_8px_#0f0f0f]',
};

const menuSubmenuShadowColors: Record<string, string> = {
  'Dashboard': 'shadow-[0_0_6px_#FF3131]',
  'Branch': 'shadow-[0_0_6px_#6366F1]',
  'HRMS': 'shadow-[0_0_6px_#06B6D4]',
  'Product': 'shadow-[0_0_6px_#10B981]',
  'Purchase': 'shadow-[0_0_6px_#0f0f0f]',
  'Inventory': 'shadow-[0_0_6px_#14B8A6]',
  'Approval': 'shadow-[0_0_6px_#84CC16]',
  'Cash Book': 'shadow-[0_0_6px_#FACC15]',
  'Report': 'shadow-[0_0_6px_#8B5CF6]',
  'Settings': 'shadow-[0_0_6px_#0f0f0f]',
};

const menuTextColors: Record<string, string> = {
  'Dashboard': 'text-[#FF3131]',
  'Branch': 'text-[#6366F1]',
  'HRMS': 'text-[#06B6D4]',
  'Product': 'text-[#10B981]',
  'Purchase': 'text-[#E4E4E7]',
  'Inventory': 'text-[#14B8A6]',
  'Approval': 'text-[#84CC16]',
  'Cash Book': 'text-[#FACC15]',
  'Report': 'text-[#8B5CF6]',
  'Settings': 'text-[#E4E4E7]',
};

const menuBorderColors: Record<string, string> = {
  'Dashboard': 'border-[#FF3131]/30',
  'Branch': 'border-[#6366F1]/30',
  'HRMS': 'border-[#06B6D4]/30',
  'Product': 'border-[#10B981]/30',
  'Purchase': 'border-[#0f0f0f]/30',
  'Inventory': 'border-[#14B8A6]/30',
  'Approval': 'border-[#84CC16]/30',
  'Cash Book': 'border-[#FACC15]/30',
  'Report': 'border-[#8B5CF6]/30',
  'Settings': 'border-[#0f0f0f]/30',
};

const menuBoxShadows: Record<string, string> = {
  'Dashboard': 'shadow-[0_0_20px_rgba(255,49,49,0.15)]',
  'Branch': 'shadow-[0_0_20px_rgba(99,102,241,0.15)]',
  'HRMS': 'shadow-[0_0_20px_rgba(6,182,212,0.15)]',
  'Product': 'shadow-[0_0_20px_rgba(16,185,129,0.15)]',
  'Purchase': 'shadow-[0_0_20px_rgba(15,15,15,0.15)]',
  'Inventory': 'shadow-[0_0_20px_rgba(20,184,166,0.15)]',
  'Approval': 'shadow-[0_0_20px_rgba(132,204,22,0.15)]',
  'Cash Book': 'shadow-[0_0_20px_rgba(250,204,21,0.15)]',
  'Report': 'shadow-[0_0_20px_rgba(139,92,246,0.15)]',
  'Settings': 'shadow-[0_0_20px_rgba(15,15,15,0.15)]',
};

export default function App() {
  const [appData, setAppData] = useState<AppState | null>(null);
  const [activeMenu, setActiveMenu] = useState<string>('Dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isProductExpanded, setIsProductExpanded] = useState(false);
  const [isHrmsExpanded, setIsHrmsExpanded] = useState(false);
  const [isApprovalExpanded, setIsApprovalExpanded] = useState(false);
  const [isReportExpanded, setIsReportExpanded] = useState(false);
  const [productActiveTab, setProductActiveTab] = useState<'products' | 'categories' | 'brands' | 'uoms'>('products');
  const [hrmsActiveTab, setHrmsActiveTab] = useState<'employees' | 'departments' | 'designations' | 'users'>('employees');
  const [approvalActiveTab, setApprovalActiveTab] = useState<'purchase' | 'delivery' | 'return' | 'adjustment' | 'requisition'>('purchase');
  const [reportActiveTab, setReportActiveTab] = useState<'purchase' | 'delivery' | 'branch_stock' | 'current_stock' | 'adjustment' | 'cash_book'>('purchase');
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [activeRole, setActiveRole] = useState<UserRole>(() => {
    try {
      const raw = localStorage.getItem('active_user_session');
      if (raw) {
        const u: UserAccount = JSON.parse(raw);
        return u.role;
      }
    } catch (e) {}
    return 'Super Admin';
  });
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [registeredUsers, setRegisteredUsers] = useState<UserAccount[]>([]);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('theme_preference');
      return stored === 'dark';
    } catch (e) {
      return false;
    }
  });

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('theme_preference', next ? 'dark' : 'light');
      return next;
    });
  };

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const raw = localStorage.getItem('active_user_session');
      if (raw) {
        const u: UserAccount = JSON.parse(raw);
        return u;
      }
    } catch (e) {}
    return null;
  });

  // Load state on mount via durable Firestore cloud sync
  useEffect(() => {
    const unsubAppData = subscribeToAppData((data) => {
      setAppData(data);
    });
    
    const unsubUsers = subscribeToUsers((users) => {
      setRegisteredUsers(users);
    });
    
    return () => {
      unsubAppData();
      unsubUsers();
    };
  }, []);

  useEffect(() => {
    if (currentUser) {
      setActiveRole(currentUser.role);
    }
  }, [currentUser]);

  const handleLogin = (user: UserAccount) => {
    setCurrentUser(user);
    setActiveRole(user.role);
    localStorage.setItem('active_user_session', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('active_user_session');
  };

  if (!currentUser) {
    return <AuthView onLogin={handleLogin} />;
  }

  if (!appData) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500"></div>
          <p className="text-zinc-400 text-sm font-mono tracking-wider">Initialising Assets Database...</p>
        </div>
      </div>
    );
  }

  // Handle local state transformations & persistence
  const updateStateAndPersist = (updater: (prev: AppState) => AppState) => {
    if (!appData) return;
    const next = updater(appData);
    setAppData(next);
    saveAppData(next);
  };

  const handleImportState = (newAppData: AppState, newUsers?: UserAccount[]) => {
    setAppData(newAppData);
    saveAppData(newAppData);
    if (newUsers && newUsers.length > 0) {
      setRegisteredUsers(newUsers);
      saveRegisteredUsers(newUsers);
    }
  };

  const wsBroadcast = (action: string, details: string) => {
    // WebSocket support removed
  };

  // State manipulation closures
  const handleAddBranch = (branch: Omit<Branch, 'id'>) => {
    updateStateAndPersist((prev) => 
      addBranch(prev, branch.name, branch.code, branch.location, branch.phone, branch.contactPerson)
    );
    wsBroadcast('Branch Added', `Created new branch "${branch.name}" (Code: ${branch.code})`);
  };

  const handleUpdateBranch = (id: string, updates: Partial<Omit<Branch, 'id'>>) => {
    updateStateAndPersist((prev) => updateBranch(prev, id, updates));
    wsBroadcast('Branch Updated', `Branch details were modified`);
  };

  const handleDeleteBranch = (id: string) => {
    updateStateAndPersist((prev) => deleteBranch(prev, id));
    wsBroadcast('Branch Deleted', `A branch was removed from the matrix`);
  };

  const handleAddBranches = (branchesList: Omit<Branch, 'id'>[]) => {
    updateStateAndPersist((prev) => addBranches(prev, branchesList));
    wsBroadcast('Bulk Branch Import', `Imported ${branchesList.length} branches`);
  };

  const handleAddProduct = (p: { name: string; categoryId: string; brandId: string; uomId: string; quantity: number; unitPrice: number; purchaseDate?: string }) => {
    updateStateAndPersist((prev) => addProduct(prev, p.name, p.categoryId, p.brandId, p.uomId, p.quantity, p.unitPrice, p.purchaseDate));
    wsBroadcast('Asset Added', `Registered new asset "${p.name}" (Quantity: ${p.quantity})`);
  };

  const handleUpdateProduct = (id: string, updates: Partial<Omit<Product, 'id'>>) => {
    updateStateAndPersist((prev) => updateProduct(prev, id, updates));
    wsBroadcast('Asset Updated', `Asset details were modified`);
  };

  const handleDeleteProduct = (id: string) => {
    updateStateAndPersist((prev) => deleteProduct(prev, id));
    wsBroadcast('Asset Deleted', `Asset item was deleted from inventory`);
  };

  const handleClearProducts = () => {
    updateStateAndPersist((prev) => clearProducts(prev));
  };

  const handleAddProductWithCustomFields = (p: { name: string; category: string; brand: string; uom: string; quantity: number; unitPrice: number; purchaseDate?: string }) => {
    updateStateAndPersist((prev) => addProductWithCustomFields(prev, p));
  };

  const handleAddCategory = (c: { name: string }) => {
    updateStateAndPersist((prev) => addCategory(prev, c.name));
  };

  const handleDeleteCategory = (id: string) => {
    updateStateAndPersist((prev) => deleteCategory(prev, id));
  };

  const handleAddBrand = (b: { name: string }) => {
    updateStateAndPersist((prev) => addBrand(prev, b.name));
  };

  const handleDeleteBrand = (id: string) => {
    updateStateAndPersist((prev) => deleteBrand(prev, id));
  };

  const handleAddUoM = (u: { name: string }) => {
    updateStateAndPersist((prev) => addUoM(prev, u.name));
  };

  const handleDeleteUoM = (id: string) => {
    updateStateAndPersist((prev) => deleteUoM(prev, id));
  };

  const handleAddEmployee = (e: { name: string; email: string; password?: string; departmentId: string; designationId: string; status: 'Active' | 'Inactive'; permissions?: Permissions; role?: UserRole }) => {
    updateStateAndPersist((prev) => addEmployee(prev, e.name, e.email, e.departmentId, e.designationId, e.status, e.permissions, e.role, e.password));
    wsBroadcast('Employee Registered', `Registered new employee "${e.name}" (${e.email})`);
    
    // Also create a user account for the employee to allow login
    if (e.password) {
      const users = getRegisteredUsers();
      const newUser: UserAccount = {
        id: `user_${Date.now()}`,
        name: e.name,
        email: e.email,
        password: e.password,
        role: e.role || 'General User',
        permissions: e.permissions
      };
      saveRegisteredUsers([...users, newUser]);
    }
  };

  const handleUpdateEmployeePermissions = (id: string, permissions: Permissions) => {
    let updatedEmployee: Employee | undefined;
    updateStateAndPersist((prev) => {
      const next = updateEmployeePermissions(prev, id, permissions);
      updatedEmployee = next.employees.find(emp => emp.id === id);
      return next;
    });
    
    // Update user account permissions
    if (updatedEmployee) {
      const users = getRegisteredUsers();
      const updatedUsers = users.map(user => 
        user.email.toLowerCase() === updatedEmployee!.email.toLowerCase() ? { ...user, permissions } : user
      );
      saveRegisteredUsers(updatedUsers);

      // If the currently logged in user is updated, update the state
      if (currentUser && currentUser.email.toLowerCase() === updatedEmployee!.email.toLowerCase()) {
        const updatedUser = { ...currentUser, permissions };
        setCurrentUser(updatedUser);
        localStorage.setItem('active_user_session', JSON.stringify(updatedUser));
      }
    }
  };

  const handleUpdateEmployee = (id: string, updates: Partial<Omit<Employee, 'id'>> & { password?: string; role?: UserRole }) => {
    const cleanUpdates = { ...updates };
    if (!cleanUpdates.password || cleanUpdates.password.trim() === '') {
      delete cleanUpdates.password;
    }

    if (id.startsWith('temp_')) {
      const userId = id.substring(5);
      const users = getRegisteredUsers();
      const user = users.find(u => u.id === userId);
      if (user) {
        const updatedUsers = users.map(u => u.id === userId ? {
          ...u,
          name: cleanUpdates.name !== undefined ? cleanUpdates.name : u.name,
          email: cleanUpdates.email !== undefined ? cleanUpdates.email : u.email,
          password: cleanUpdates.password !== undefined ? cleanUpdates.password : u.password,
          role: cleanUpdates.role !== undefined ? cleanUpdates.role : u.role,
        } : u);
        saveRegisteredUsers(updatedUsers);
        
        // Let's create an employee record for this user now so they have one!
        updateStateAndPersist((prev) => addEmployee(prev, cleanUpdates.name || user.name, cleanUpdates.email || user.email, cleanUpdates.departmentId || '', cleanUpdates.designationId || '', cleanUpdates.status || 'Active', user.permissions));
      }
      return;
    }

    // Get the employee's original email before the update
    const emp = appData.employees.find(e => e.id === id);
    const originalEmail = emp?.email;

    updateStateAndPersist((prev) => updateEmployee(prev, id, cleanUpdates));

    if (originalEmail) {
      const users = getRegisteredUsers();
      const updatedUsers = users.map(user => {
        if (user.email.toLowerCase() === originalEmail.toLowerCase()) {
          return {
            ...user,
            name: cleanUpdates.name !== undefined ? cleanUpdates.name : user.name,
            email: cleanUpdates.email !== undefined ? cleanUpdates.email : user.email,
            password: cleanUpdates.password !== undefined ? cleanUpdates.password : user.password,
            role: cleanUpdates.role !== undefined ? cleanUpdates.role : user.role,
          };
        }
        return user;
      });
      saveRegisteredUsers(updatedUsers);

      // If the currently logged in user is updated, update the state
      if (currentUser && currentUser.email.toLowerCase() === originalEmail.toLowerCase()) {
        const updatedUser = {
          ...currentUser,
          name: cleanUpdates.name !== undefined ? cleanUpdates.name : currentUser.name,
          email: cleanUpdates.email !== undefined ? cleanUpdates.email : currentUser.email,
          role: cleanUpdates.role !== undefined ? cleanUpdates.role : currentUser.role,
        };
        setCurrentUser(updatedUser);
        localStorage.setItem('active_user_session', JSON.stringify(updatedUser));
      }
    }
  };

  const handleDeleteEmployee = (id: string) => {
    updateStateAndPersist((prev) => deleteEmployee(prev, id));
  };

  const handleDeleteUser = (id: string) => {
    const users = getRegisteredUsers();
    saveRegisteredUsers(users.map(u => u.id === id ? { ...u, isTerminated: !u.isTerminated } : u));
  };

  const handleAddDepartment = (d: { name: string }) => {
    updateStateAndPersist((prev) => addDepartment(prev, d.name));
  };

  const handleAddDesignation = (des: { name: string }) => {
    updateStateAndPersist((prev) => addDesignation(prev, des.name));
  };

  const handleAddPurchase = (pur: { supplierId: string; purchaseDate: string; purchaseOrderNo: string; totalAmount: number; items: any[] }) => {
    updateStateAndPersist((prev) => addPurchase(prev, pur.supplierId, pur.purchaseDate, pur.purchaseOrderNo, pur.totalAmount, pur.items));
  };

  const handleUpdatePurchase = (id: string, updates: Partial<Omit<Purchase, 'id'>>) => {
    updateStateAndPersist((prev) => updatePurchase(prev, id, updates));
  };

  const handleDeletePurchase = (id: string) => {
    updateStateAndPersist((prev) => deletePurchase(prev, id));
  };

  const handleAddPurchaseReturn = (r: { purchaseId: string; returnDate: string; returnNo: string; supplierId: string; refundAmount: number; reason: string; productId: string; quantity: number }) => {
    updateStateAndPersist((prev) => addPurchaseReturn(prev, r.purchaseId, r.returnDate, r.returnNo, r.supplierId, r.refundAmount, r.reason, r.productId, r.quantity));
  };

  const handleUpdatePurchaseReturn = (id: string, updates: Partial<Omit<PurchaseReturn, 'id'>>) => {
    updateStateAndPersist((prev) => updatePurchaseReturn(prev, id, updates));
  };

  const handleDeletePurchaseReturn = (id: string) => {
    updateStateAndPersist((prev) => deletePurchaseReturn(prev, id));
  };

  const handleAddSupplier = (s: { name: string; company: string; email: string; phone: string; code: string }) => {
    updateStateAndPersist((prev) => addSupplier(prev, s.name, s.company, s.email, s.phone, s.code));
  };

  const handleUpdateSupplier = (id: string, updates: Partial<Omit<Supplier, 'id'>>) => {
    updateStateAndPersist((prev) => updateSupplier(prev, id, updates));
  };

  const handleDeleteSupplier = (id: string) => {
    updateStateAndPersist((prev) => deleteSupplier(prev, id));
  };

  const handleAddDelivery = (d: { deliveryNo: string; branchId: string; productId: string; quantity: number; deliveryDate: string; handler: string }) => {
    updateStateAndPersist((prev) => addDelivery(prev, d.deliveryNo, d.branchId, d.productId, d.quantity, d.deliveryDate, d.handler));
  };

  const handleUpdateDelivery = (id: string, updates: Partial<Omit<Delivery, 'id'>>) => {
    updateStateAndPersist((prev) => updateDelivery(prev, id, updates));
  };

  const handleDeleteDelivery = (id: string) => {
    updateStateAndPersist((prev) => deleteDelivery(prev, id));
  };

  const handleAddSell = (s: { saleNo: string; productId: string; customerName: string; quantity: number; totalAmount: number; saleDate: string }) => {
    updateStateAndPersist((prev) => addSell(prev, s.saleNo, s.productId, s.customerName, s.quantity, s.totalAmount, s.saleDate));
  };

  const handleUpdateSell = (id: string, updates: Partial<Omit<SellRecord, 'id'>>) => {
    updateStateAndPersist((prev) => updateSell(prev, id, updates));
  };

  const handleDeleteSell = (id: string) => {
    updateStateAndPersist((prev) => deleteSell(prev, id));
  };

  const handleAddAdjustment = (a: { referenceNo: string; productId: string; type: 'Addition' | 'Deduction'; quantity: number; reason: string; date: string }) => {
    updateStateAndPersist((prev) => addAdjustment(prev, a.referenceNo, a.productId, a.type, a.quantity, a.reason, a.date));
  };

  const handleUpdateAdjustment = (id: string, updates: Partial<Omit<Adjustment, 'id'>>) => {
    updateStateAndPersist((prev) => updateAdjustment(prev, id, updates));
  };

  const handleDeleteAdjustment = (id: string) => {
    updateStateAndPersist((prev) => deleteAdjustment(prev, id));
  };

  const handleAddTransfer = (t: { transferNo: string; fromBranchId: string; toBranchId: string; productId: string; quantity: number; date: string; status: string }) => {
    updateStateAndPersist((prev) => addTransfer(prev, t.transferNo, t.fromBranchId, t.toBranchId, t.productId, t.quantity, t.date, t.status));
  };

  const handleUpdateTransfer = (id: string, updates: Partial<Omit<Transfer, 'id'>>) => {
    updateStateAndPersist((prev) => updateTransfer(prev, id, updates));
  };

  const handleDeleteTransfer = (id: string) => {
    updateStateAndPersist((prev) => deleteTransfer(prev, id));
  };

  const handleAddTransaction = (t: { type: 'Receipt' | 'Payment'; date: string; voucherNo: string; partyName: string; amount: number; description: string; category: string; attachmentUrl?: string }) => {
    updateStateAndPersist((prev) => addTransaction(prev, t.type, t.date, t.voucherNo, t.partyName, t.amount, t.description, t.category, t.attachmentUrl));
  };

  // Actions Approvals
  const handleUpdateTransaction = (id: string, updates: Partial<Omit<CashTransaction, 'id'>>) => {
    updateStateAndPersist((prev) => updateTransaction(prev, id, updates));
  };

  const handleApprovePurchase = (id: string, status: 'Approved' | 'Rejected') => {
    updateStateAndPersist((prev) => approvePurchase(prev, id, status));
  };

  const handleApproveDelivery = (id: string, status: 'Approved' | 'Rejected') => {
    updateStateAndPersist((prev) => approveDelivery(prev, id, status));
  };

  const handleApproveReturn = (id: string, status: 'Received' | 'Rejected') => {
    updateStateAndPersist((prev) => approveReturn(prev, id, status));
  };

  const handleApproveAdjustment = (id: string, status: 'Approved' | 'Rejected') => {
    updateStateAndPersist((prev) => approveAdjustment(prev, id, status));
  };

  const handleApproveRequisition = (id: string, status: 'Approved' | 'Rejected') => {
    updateStateAndPersist((prev) => approveRequisition(prev, id, status));
  };

  const sidebarItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Branch', icon: Building2 },
    { name: 'HRMS', icon: Users, hasSubmenu: true, subItems: [
        { name: 'Employees Registry', id: 'employees' },
        { name: 'Department Matrix', id: 'departments' },
        { name: 'Designations Index', id: 'designations' },
        { name: 'User Accounts', id: 'users' }
      ] 
    },
    { name: 'Product', icon: Package, hasSubmenu: true, subItems: [
        { name: 'Products', id: 'products' },
        { name: 'Categories', id: 'categories' },
        { name: 'Brands', id: 'brands' },
        { name: 'UoMs', id: 'uoms' }
      ] 
    },
    { name: 'Purchase', icon: ShoppingCart },
    { name: 'Inventory', icon: Database },
    { name: 'Approval', icon: ShieldCheck, hasSubmenu: true, subItems: [
        { name: 'Purchase Approve', id: 'purchase' },
        { name: 'Delivery Approve', id: 'delivery' },
        { name: 'Supplier Return Approve', id: 'return' },
        { name: 'Adjustment Approve', id: 'adjustment' },
        { name: 'Requisition Approval', id: 'requisition' }
      ] 
    },
    { name: 'Cash Book', icon: Receipt },
    { name: 'Report', icon: BarChart3, hasSubmenu: true, subItems: [
        { name: 'Purchase Report', id: 'purchase' },
        { name: 'Delivery Report', id: 'delivery' },
        { name: 'Branch Stock Report', id: 'branch_stock' },
        { name: 'Current Stock Report', id: 'current_stock' },
        { name: 'Adjustment Report', id: 'adjustment' },
        { name: 'Cash Book Report', id: 'cash_book' }
      ] 
    },
    { name: 'Settings', icon: Settings },
  ].filter(item => {
    // Always show to admin roles
    if (!currentUser || currentUser.role === 'Super Admin' || currentUser.role === 'Admin') return true;
    
    // For General User, fetch latest permissions from registered users list
    const users = getRegisteredUsers();
    const latestUser = users.find(u => u.id === currentUser.id);
    const userPermissions = latestUser?.permissions || currentUser.permissions;

    if (item.name === 'Branch') return userPermissions?.canViewBranch;
    if (item.name === 'Product') return userPermissions?.canViewProduct;
    if (item.name === 'HRMS') return userPermissions?.canViewHRMS;
    if (item.name === 'Purchase') return userPermissions?.canViewPurchase;
    if (item.name === 'Inventory') return userPermissions?.canViewInventory;
    if (item.name === 'Approval') return userPermissions?.canViewApproval;
    if (item.name === 'Cash Book') return userPermissions?.canViewCashBook;
    if (item.name === 'Report') return userPermissions?.canViewReport;
    
    return true;
  });

  return (
    <div className={`min-h-screen flex font-sans antialiased transition-colors duration-300 ${darkMode ? 'dark bg-[#0b0f19] text-slate-100' : 'bg-gray-50 text-gray-900'}`}>
      
      {/* Sidebar Navigation - Sleek Blue Theme */}
      <aside className={`${isSidebarCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 flex-shrink-0 bg-[#0d3b66] border-r border-gray-200 flex flex-col justify-between select-none relative z-20 text-white`}>
        {/* Floating Slide Toggle Handle */}
        <button 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute top-8 -right-4 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center shadow-lg border border-zinc-800 hover:scale-110 active:scale-95 transition-transform hover:cursor-pointer z-50"
          title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <Menu className="w-4 h-4 stroke-[2.5]" />
        </button>

        <div>
          {/* Brand Header */}
          <div className={`p-6 border-b border-[#0d3b66] flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} bg-[#0a2e50]`}>
            <div className="p-2.5 bg-white text-[#0d3b66] font-black rounded-lg flex items-center justify-center">
              <Laptop className="w-5 h-5 stroke-[2.5]" />
            </div>
            {!isSidebarCollapsed && (
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-xs font-extrabold text-white tracking-wider font-sans uppercase">IT Asset Management</h1>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Menu */}
          <div className="px-3 py-4">
            {!isSidebarCollapsed && (
              <div className="px-3 pb-2 text-[10px] font-mono text-white/60 uppercase tracking-widest">Core Modules</div>
            )}
            <nav className="space-y-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isSelected = activeMenu === item.name;
                const hasSubmenu = item.hasSubmenu;
                const isExpanded = item.name === 'Product' ? isProductExpanded : item.name === 'HRMS' ? isHrmsExpanded : item.name === 'Approval' ? isApprovalExpanded : item.name === 'Report' ? isReportExpanded : false;
                
                return (
                  <div key={item.name} className="relative group/nav-item">
                    <button
                      onClick={() => {
                        if (isSidebarCollapsed) {
                          setActiveMenu(item.name);
                          setIsSidebarCollapsed(false);
                          if (hasSubmenu) {
                            if (item.name === 'Product') setIsProductExpanded(true);
                            if (item.name === 'HRMS') setIsHrmsExpanded(true);
                            if (item.name === 'Approval') setIsApprovalExpanded(true);
                            if (item.name === 'Report') setIsReportExpanded(true);
                          }
                        } else {
                          if (hasSubmenu) {
                            if (item.name === 'Product') setIsProductExpanded(!isProductExpanded);
                            if (item.name === 'HRMS') setIsHrmsExpanded(!isHrmsExpanded);
                            if (item.name === 'Approval') setIsApprovalExpanded(!isApprovalExpanded);
                            if (item.name === 'Report') setIsReportExpanded(!isReportExpanded);
                            setActiveMenu(item.name);
                          } else {
                            setActiveMenu(item.name);
                          }
                        }
                      }}
                      className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-2.5' : 'justify-between px-3.5 py-2.5'} text-xs rounded-lg font-semibold transition-all hover:cursor-pointer group ${
                        isSelected
                          ? `bg-[#152454] text-white border ${menuBorderColors[item.name] || 'border-[#00E599]/30'} ${menuBoxShadows[item.name] || 'shadow-[0_0_20px_rgba(0,229,153,0.1)]'} font-bold`
                          : 'text-white/80 hover:bg-[#111d42] hover:text-white border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 transition-colors ${isSelected ? (menuTextColors[item.name] || 'text-[#00E599]') : 'text-white/60 group-hover:text-white'}`} />
                        {!isSidebarCollapsed && <span className="tracking-wide">{item.name}</span>}
                      </div>
                      {!isSidebarCollapsed && hasSubmenu && (
                        <motion.div 
                          animate={{ rotate: isExpanded ? 90 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                           <ChevronRight className="w-4 h-4" />
                        </motion.div>
                      )}
                      {!isSidebarCollapsed && isSelected && !hasSubmenu && (
                        <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${menuBgColors[item.name] || 'bg-[#00E599]'} ${menuShadowColors[item.name] || 'shadow-[0_0_8px_#00E599]'}`} />
                      )}
                    </button>

                    {/* Collapsed Tooltip */}
                    {isSidebarCollapsed && (
                      <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 bg-[#0a2e50] text-white text-xs py-1 px-2.5 rounded shadow-lg pointer-events-none opacity-0 group-hover/nav-item:opacity-100 transition-opacity whitespace-nowrap z-50 border border-white/10 font-sans tracking-wide">
                        {item.name}
                      </div>
                    )}
                    
                    {!isSidebarCollapsed && hasSubmenu && (
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden pl-8 mt-1 space-y-1"
                          >
                              {item.subItems.map((sub: any) => {
                                const isSubActive = 
                                  (item.name === 'Product' && productActiveTab === sub.id) || 
                                  (item.name === 'HRMS' && hrmsActiveTab === sub.id) ||
                                  (item.name === 'Approval' && approvalActiveTab === sub.id) ||
                                  (item.name === 'Report' && reportActiveTab === sub.id);
 
                                return (
                                  <button
                                    key={sub.id}
                                    onClick={() => {
                                      if (item.name === 'Product') setProductActiveTab(sub.id);
                                      if (item.name === 'HRMS') setHrmsActiveTab(sub.id);
                                      if (item.name === 'Approval') setApprovalActiveTab(sub.id);
                                      if (item.name === 'Report') setReportActiveTab(sub.id);
                                      setActiveMenu(item.name);
                                    }}
                                    className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors hover:cursor-pointer ${
                                      isSubActive
                                      ? 'text-white font-bold'
                                      : 'text-white/70 hover:text-white'
                                    }`}
                                  >
                                    <span>{sub.name}</span>
                                    {isSubActive && (
                                      <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${menuBgColors[item.name] || 'bg-[#00E599]'} ${menuSubmenuShadowColors[item.name] || 'shadow-[0_0_6px_#00E599]'}`} />
                                    )}
                                  </button>
                                );
                              })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        </div>

        {/* HUD System Status Footer */}
        <div className={`p-4 border-t border-[#1b2b5a] bg-[#080f24] ${isSidebarCollapsed ? 'flex justify-center items-center' : ''}`}>
          {isSidebarCollapsed ? (
            <div className="relative group/footer-status flex justify-center items-center py-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00E599] animate-pulse shadow-[0_0_8px_#00E599]" />
              <div className="absolute left-full ml-4 bg-[#0a2e50] text-white text-xs py-1 px-2.5 rounded shadow-lg pointer-events-none opacity-0 group-hover/footer-status:opacity-100 transition-opacity whitespace-nowrap z-50 border border-white/10 font-mono">
                STORAGE CLUSTER: SYNCED
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between text-[11px] font-mono mb-1.5">
                <span className="text-blue-300/60">STORAGE CLUSTER</span>
                <span className="text-[#00E599] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00E599]" /> SYNCED
                </span>
              </div>
              <div className="w-full bg-blue-950/80 h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#00E599] h-full w-[42%] rounded-full shadow-[0_0_8px_#00E599]" />
              </div>
              <div className="flex justify-between text-[9px] font-mono text-blue-300/50 mt-1.5">
                <span>LOCAL_STORAGE</span>
                <span>{ (42.8).toLocaleString('bn-BD') } MB / { (100).toLocaleString('bn-BD') } MB</span>
              </div>
            </>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 overflow-y-auto p-8 lg:p-12 relative transition-colors duration-300 ${darkMode ? 'bg-[#0b0f19]' : 'bg-white'}`}>
        
        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Top Tech HUD Header */}
          <header className={`no-print flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b transition-colors duration-300 ${darkMode ? 'border-slate-800' : 'border-gray-100'}`}>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 text-[10px] font-mono rounded border transition-colors duration-300 ${darkMode ? 'bg-slate-900/50 text-slate-400 border-slate-800' : 'bg-slate-50 text-slate-500 border-gray-200'}`}>WORKSPACE</span>
                <span className="text-slate-300 font-mono">/</span>
                <span className="text-xs font-mono text-emerald-600">MODULE.{activeMenu.toUpperCase()}</span>
              </div>
              <h2 className={`text-3xl font-black tracking-tight font-sans uppercase transition-colors duration-300 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                {activeMenu} <span className="text-slate-400 font-light">HUB</span>
              </h2>
            </div>
            
            <div className="flex items-center gap-3 self-end md:self-auto">
              {/* Theme Toggle Switch */}
              <button
                onClick={toggleDarkMode}
                className={`relative flex items-center h-8 w-14 rounded-full p-1 cursor-pointer transition-colors duration-300 shrink-0 ${
                  darkMode ? 'bg-[#1e293b] border border-slate-700' : 'bg-gray-200 border border-gray-300'
                }`}
                title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                <motion.div
                  layout
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                  className="flex items-center justify-center h-6 w-6 rounded-full bg-white shadow-md"
                  style={{ x: darkMode ? 22 : 0 }}
                >
                  {darkMode ? (
                    <Moon className="w-3.5 h-3.5 text-indigo-500 stroke-[2.5]" />
                  ) : (
                    <Sun className="w-3.5 h-3.5 text-amber-500 stroke-[2.5]" />
                  )}
                </motion.div>
              </button>

              {/* System Node Pill */}
              <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 border rounded-lg text-xs font-mono transition-colors duration-300 ${
                darkMode ? 'bg-slate-900/50 border-slate-800 text-slate-400' : 'bg-slate-50 border-gray-100 text-slate-500'
              }`}>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>ACTIVE_NODE</span>
              </div>

              {/* Dynamic System Role Selector locked */}
              <div className="relative">
                <div
                  className="flex items-center gap-2 px-3 py-2 border border-[#272730]/60 text-white bg-[#0F0F14] rounded-lg shadow-sm"
                >
                  <span className="text-zinc-500 text-xs font-mono">AUTH_ROLE:</span>
                  <span className="text-[#00E599] text-xs font-mono font-bold ml-1">{activeRole}</span>
                </div>
              </div>

              {/* Logged in User Pill & Logout */}
              <div className={`flex items-center gap-2 pl-2 border-l transition-colors duration-300 ${darkMode ? 'border-slate-800' : 'border-gray-100'}`}>
                <div className="hidden lg:flex flex-col text-right">
                  <span className={`text-xs font-bold font-sans truncate max-w-[120px] transition-colors duration-300 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{currentUser.name}</span>
                  <span className={`text-[10px] font-mono truncate max-w-[120px] transition-colors duration-300 ${darkMode ? 'text-slate-450' : 'text-slate-400'}`}>{currentUser.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 bg-rose-950/30 hover:bg-rose-900/50 text-rose-400 hover:text-rose-300 border border-rose-900/40 rounded-lg transition-colors hover:cursor-pointer inline-flex items-center gap-1.5 text-xs font-mono font-semibold"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">EXIT</span>
                </button>
              </div>
            </div>
          </header>

        {/* View Routing & Render Container */}
        <div>
          {activeMenu === 'Dashboard' && (
            <DashboardView
              branches={appData.branches}
              suppliers={appData.suppliers}
              employees={appData.employees}
              adjustments={appData.adjustments}
              purchases={appData.purchases}
              deliveries={appData.deliveries}
              products={appData.products}
              users={registeredUsers}
            />
          )}

          {activeMenu === 'Branch' && (
            <BranchView
              branches={appData.branches}
              onAddBranch={handleAddBranch}
              onUpdateBranch={handleUpdateBranch}
              onDeleteBranch={handleDeleteBranch}
              onAddBranches={handleAddBranches}
              userRole={activeRole}
              permissions={currentUser?.permissions}
            />
          )}

          {activeMenu === 'Product' && (
            <ProductView
              products={appData.products}
              categories={appData.categories}
              brands={appData.brands}
              uoms={appData.uoms}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
              onClearAllProducts={handleClearProducts}
              onAddProductWithCustomFields={handleAddProductWithCustomFields}
              onAddCategory={handleAddCategory}
              onDeleteCategory={handleDeleteCategory}
              onAddBrand={handleAddBrand}
              onDeleteBrand={handleDeleteBrand}
              onAddUoM={handleAddUoM}
              onDeleteUoM={handleDeleteUoM}
              userRole={activeRole}
              permissions={currentUser?.permissions}
              searchTerm={globalSearchTerm}
              activeTab={productActiveTab}
              onTabChange={setProductActiveTab}
            />
          )}

          {activeMenu === 'HRMS' && (
            <HRMSView
              employees={appData.employees}
              departments={appData.departments}
              designations={appData.designations}
              onAddEmployee={handleAddEmployee}
              onUpdateEmployee={handleUpdateEmployee}
              onDeleteEmployee={handleDeleteEmployee}
              onDeleteUser={handleDeleteUser}
              onUpdateEmployeePermissions={handleUpdateEmployeePermissions}
              onAddDepartment={handleAddDepartment}
              onAddDesignation={handleAddDesignation}
              userRole={activeRole}
              users={registeredUsers}
              permissions={currentUser?.permissions}
              activeTab={hrmsActiveTab}
              onTabChange={setHrmsActiveTab}
            />
          )}

          {activeMenu === 'Purchase' && (
            <PurchaseView
              purchases={appData.purchases}
              purchaseReturns={appData.purchaseReturns}
              suppliers={appData.suppliers}
              products={appData.products}
              onAddPurchase={handleAddPurchase}
              onUpdatePurchase={handleUpdatePurchase}
              onDeletePurchase={handleDeletePurchase}
              onAddPurchaseReturn={handleAddPurchaseReturn}
              onUpdatePurchaseReturn={handleUpdatePurchaseReturn}
              onDeletePurchaseReturn={handleDeletePurchaseReturn}
              onAddSupplier={handleAddSupplier}
              onUpdateSupplier={handleUpdateSupplier}
              onDeleteSupplier={handleDeleteSupplier}
              userRole={activeRole}
              permissions={currentUser?.permissions}
              searchTerm={globalSearchTerm}
            />
          )}

          {activeMenu === 'Inventory' && (
            <InventoryView
              deliveries={appData.deliveries}
              sells={appData.sells}
              adjustments={appData.adjustments}
              transfers={appData.transfers}
              products={appData.products}
              branches={appData.branches}
              employees={appData.employees}
              onAddDelivery={handleAddDelivery}
              onUpdateDelivery={handleUpdateDelivery}
              onDeleteDelivery={handleDeleteDelivery}
              onAddSell={handleAddSell}
              onUpdateSell={handleUpdateSell}
              onDeleteSell={handleDeleteSell}
              onAddAdjustment={handleAddAdjustment}
              onUpdateAdjustment={handleUpdateAdjustment}
              onDeleteAdjustment={handleDeleteAdjustment}
              onAddTransfer={handleAddTransfer}
              onUpdateTransfer={handleUpdateTransfer}
              onDeleteTransfer={handleDeleteTransfer}
              userRole={activeRole}
              permissions={currentUser?.permissions}
              searchTerm={globalSearchTerm}
            />
          )}

          {activeMenu === 'Approval' && (
            <ApprovalView
              purchases={appData.purchases}
              deliveries={appData.deliveries}
              purchaseReturns={appData.purchaseReturns}
              adjustments={appData.adjustments}
              requisitions={appData.requisitions}
              products={appData.products}
              employees={appData.employees}
              suppliers={appData.suppliers}
              onApprovePurchase={handleApprovePurchase}
              onApproveDelivery={handleApproveDelivery}
              onApproveReturn={handleApproveReturn}
              onApproveAdjustment={handleApproveAdjustment}
              onApproveRequisition={handleApproveRequisition}
              userRole={activeRole}
              permissions={currentUser?.permissions}
              activeTab={approvalActiveTab}
              onTabChange={setApprovalActiveTab}
            />
          )}

          {activeMenu === 'Cash Book' && (
            <CashBookView
              cashTransactions={appData.cashTransactions}
              onAddTransaction={handleAddTransaction}
              onUpdateTransaction={handleUpdateTransaction}
              userRole={activeRole}
              permissions={currentUser?.permissions}
            />
          )}

          {activeMenu === 'Report' && (
            <ReportView
              purchases={appData.purchases}
              deliveries={appData.deliveries}
              branches={appData.branches}
              products={appData.products}
              adjustments={appData.adjustments}
              cashTransactions={appData.cashTransactions}
              suppliers={appData.suppliers}
              userRole={activeRole}
              permissions={currentUser?.permissions}
              activeTab={reportActiveTab}
              onTabChange={setReportActiveTab}
            />
          )}

          {activeMenu === 'Settings' && (
            <SettingsView
              appData={appData}
              registeredUsers={registeredUsers}
              onImportState={handleImportState}
              userRole={activeRole}
            />
          )}
        </div>
        </div>
      </main>
      </div>
  );
}
