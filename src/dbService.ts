import { AppState, Branch, Product, Category, Brand, UoM, Employee, Department, Designation, Purchase, PurchaseReturn, Supplier, Delivery, SellRecord, Adjustment, InternalTransfer, CashTransaction, Requisition, Permissions, PurchaseItem, UserRole } from './types';
import * as mock from './mockData';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';

const LOCAL_STORAGE_KEY = 'it_asset_management_state';

function isMockItem(item: { id: string }, key: string): boolean {
  const mockKey = `initial${key.charAt(0).toUpperCase() + key.slice(1)}`;
  const mockItems = (mock as any)[mockKey];
  return Array.isArray(mockItems) && mockItems.some((m: any) => m.id === item.id);
}

function mergeArray<T extends { id: string }>(localArr: T[], serverArr: T[], key: string): T[] {
  if (!Array.isArray(localArr)) return serverArr || [];
  if (!Array.isArray(serverArr)) return localArr || [];
  
  const serverMap = new Map(serverArr.map(item => [item.id, item]));
  const merged = [...serverArr];
  const now = Date.now();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  
  for (const localItem of localArr) {
    if (!serverMap.has(localItem.id)) {
      if (isMockItem(localItem, key)) continue;

      const parts = localItem.id.split('_');
      let isRecent = false;
      if (parts.length >= 2) {
        const ts = parseInt(parts[1], 10);
        if (!isNaN(ts) && ts > 0) {
          if (now - ts < ONE_DAY_MS) {
            isRecent = true;
          }
        }
      } else {
        // Assume non-mock, non-timestamped items are local and should be preserved
        isRecent = true;
      }
      
      if (isRecent) {
        console.log(`Preserving unsynced local-only item: ${localItem.id}`);
        merged.push(localItem);
      }
    }
  }
  return merged;
}

export function subscribeToAppData(onUpdate: (state: AppState) => void): () => void {
  const docRef = doc(db, 'app_state', 'master_state');
  return onSnapshot(
    docRef,
    (snapshot) => {
      const defaultState = loadAppData();
      console.log('--- onSnapshot app_state ---');
      console.log('snapshot.exists():', snapshot.exists());
      console.log('hasPendingWrites:', snapshot.metadata.hasPendingWrites);
      console.log('fromCache:', snapshot.metadata.fromCache);
      if (snapshot.exists()) {
        const serverData = snapshot.data() as AppState;
        console.log('serverData employees count:', serverData?.employees?.length);
        console.log('defaultState employees count:', defaultState?.employees?.length);
        
        let data: AppState = { ...defaultState };
        const keys: (keyof AppState)[] = [
          'branches', 'suppliers', 'categories', 'brands', 'uoms', 'products',
          'departments', 'designations', 'employees', 'purchases', 'purchaseReturns',
          'deliveries', 'sells', 'adjustments', 'transfers', 'requisitions',
          'cashTransactions', 'purchaseItems'
        ];
        
        let hasNewLocalPreserved = false;
        for (const key of keys) {
          const localArr = defaultState[key];
          const serverArr = serverData[key];
          if (Array.isArray(localArr)) {
            const sArr = Array.isArray(serverArr) ? serverArr : [];
            const merged = mergeArray(localArr as any[], sArr as any[], key);
            if (merged.length > sArr.length) {
              hasNewLocalPreserved = true;
            }
            (data as any)[key] = merged;
          } else {
            (data as any)[key] = serverData[key] !== undefined ? serverData[key] : defaultState[key];
          }
        }
        
        console.log('Merged data employees count:', data?.employees?.length);
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
        } catch (e) {}
        onUpdate(data);
        
        if (hasNewLocalPreserved && !snapshot.metadata.hasPendingWrites && !snapshot.metadata.fromCache) {
          console.log('Auto-healing: uploading merged local-only data back to server...');
          const cleanState = JSON.parse(JSON.stringify(data));
          setDoc(docRef, cleanState).catch((err) => console.error('Error auto-healing:', err));
        }
      } else {
        const cleanState = JSON.parse(JSON.stringify(defaultState));
        setDoc(docRef, cleanState).catch((err) => console.error('Error init firestore state:', err));
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'app_state/master_state');
    }
  );
}

export function loadAppData(): AppState {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const emps: Employee[] = parsed.employees || [];
      return {
        branches: parsed.branches || [],
        suppliers: parsed.suppliers || [],
        categories: parsed.categories || [],
        brands: parsed.brands || [],
        uoms: parsed.uoms || [],
        products: parsed.products || [],
        departments: parsed.departments || [],
        designations: parsed.designations || [],
        employees: emps,
        purchases: parsed.purchases || [],
        purchaseReturns: parsed.purchaseReturns || [],
        deliveries: parsed.deliveries || [],
        sells: parsed.sells || [],
        adjustments: parsed.adjustments || [],
        transfers: parsed.transfers || [],
        requisitions: parsed.requisitions || [],
        cashTransactions: parsed.cashTransactions || [],
        purchaseItems: parsed.purchaseItems || [],
      };
    }
  } catch (e) {
    console.error('Failed to parse local storage IT Asset data:', e);
  }

  return {
    branches: mock.initialBranches,
    suppliers: mock.initialSuppliers,
    categories: mock.initialCategories,
    brands: mock.initialBrands,
    uoms: mock.initialUoMs,
    products: mock.initialProducts,
    departments: mock.initialDepartments,
    designations: mock.initialDesignations,
    employees: mock.initialEmployees,
    purchases: mock.initialPurchases,
    purchaseReturns: mock.initialPurchaseReturns,
    deliveries: mock.initialDeliveries,
    sells: mock.initialSells,
    adjustments: mock.initialAdjustments,
    transfers: mock.initialTransfers,
    requisitions: mock.initialRequisitions,
    cashTransactions: mock.initialCashTransactions,
    purchaseItems: [],
  };
}

export function saveAppData(state: AppState): void {
  console.log('--- saveAppData called ---');
  console.log('State employees count:', state?.employees?.length);
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Could not save state to local storage:', e);
  }
  const docRef = doc(db, 'app_state', 'master_state');
  const cleanState = JSON.parse(JSON.stringify(state));
  console.log('Calling setDoc for master_state...');
  setDoc(docRef, cleanState)
    .then(() => {
      console.log('setDoc for master_state successfully completed');
    })
    .catch((err) => {
      console.error('Error saving state to Firestore:', err);
    });
}

// State Transmuters that return the new AppState
export function addBranch(
  state: AppState,
  name: string,
  code: string,
  location: string,
  phone: string,
  contactPerson: string
): AppState {
  const newBranch: Branch = {
    id: `branch_${Date.now()}`,
    name,
    code,
    location,
    phone: phone || '',
    contactPerson: contactPerson || '',
  };
  return {
    ...state,
    branches: [...state.branches, newBranch],
  };
}

export function updateBranch(
  state: AppState,
  id: string,
  updates: Partial<Omit<Branch, 'id'>>
): AppState {
  return {
    ...state,
    branches: state.branches.map((b) => (b.id === id ? { ...b, ...updates } : b)),
  };
}

export function deleteBranch(state: AppState, id: string): AppState {
  return {
    ...state,
    branches: state.branches.filter((b) => b.id !== id),
  };
}

export function clearBranches(state: AppState): AppState {
  return {
    ...state,
    branches: [],
  };
}

export function addBranches(
  state: AppState,
  newBranchesList: Omit<Branch, 'id'>[]
): AppState {
  const generatedBranches: Branch[] = newBranchesList.map((b, index) => ({
    id: `branch_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 6)}`,
    name: b.name,
    code: b.code,
    location: b.location || '',
    phone: b.phone || '',
    contactPerson: b.contactPerson || '',
  }));
  return {
    ...state,
    branches: [...state.branches, ...generatedBranches],
  };
}

export function addProduct(
  state: AppState,
  name: string,
  categoryId: string,
  brandId: string,
  uomId: string,
  quantity: number,
  unitPrice: number,
  purchaseDate?: string
): AppState {
  const newProduct: Product = {
    id: `prod_${Date.now()}`,
    name,
    categoryId,
    brandId,
    uomId,
    quantity,
    unitPrice,
    purchaseDate,
  };
  return {
    ...state,
    products: [...state.products, newProduct],
  };
}

export function updateProduct(
  state: AppState,
  id: string,
  updates: Partial<Omit<Product, 'id'>>
): AppState {
  return {
    ...state,
    products: state.products.map((p) => (p.id === id ? { ...p, ...updates } : p)),
  };
}

export function deleteProduct(state: AppState, id: string): AppState {
  return {
    ...state,
    products: state.products.filter((p) => p.id !== id),
  };
}

export function clearProducts(state: AppState): AppState {
  return {
    ...state,
    products: [],
  };
}

export function addProductWithCustomFields(
  state: AppState,
  p: {
    name: string;
    category: string;
    brand: string;
    uom: string;
    quantity: number;
    unitPrice: number;
    purchaseDate?: string;
  }
): AppState {
  const categories = [...state.categories];
  const brands = [...state.brands];
  const uoms = [...state.uoms];

  let catId = p.category;
  const existingCat = categories.find(c => c.id === catId || c.name.toLowerCase() === catId.toLowerCase());
  if (!existingCat && catId.trim()) {
    const newCat = { id: `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`, name: catId.trim() };
    categories.push(newCat);
    catId = newCat.id;
  } else if (existingCat) {
    catId = existingCat.id;
  } else {
    catId = categories[0]?.id || '';
  }

  let brandId = p.brand;
  const existingBrand = brands.find(b => b.id === brandId || b.name.toLowerCase() === brandId.toLowerCase());
  if (!existingBrand && brandId.trim()) {
    const newBrand = { id: `brand_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`, name: brandId.trim() };
    brands.push(newBrand);
    brandId = newBrand.id;
  } else if (existingBrand) {
    brandId = existingBrand.id;
  } else {
    brandId = brands[0]?.id || '';
  }

  let uomId = p.uom;
  const existingUoM = uoms.find(u => u.id === uomId || u.name.toLowerCase() === uomId.toLowerCase());
  if (!existingUoM && uomId.trim()) {
    const newUoM = { id: `uom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`, name: uomId.trim() };
    uoms.push(newUoM);
    uomId = newUoM.id;
  } else if (existingUoM) {
    uomId = existingUoM.id;
  } else {
    uomId = uoms[0]?.id || '';
  }

  const newProduct: Product = {
    id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: p.name,
    categoryId: catId,
    brandId: brandId,
    uomId: uomId,
    quantity: p.quantity,
    unitPrice: p.unitPrice,
    purchaseDate: p.purchaseDate,
  };

  return {
    ...state,
    categories,
    brands,
    uoms,
    products: [...state.products, newProduct],
  };
}

export function addCategory(state: AppState, name: string): AppState {
  const newCategory: Category = {
    id: `cat_${Date.now()}`,
    name,
  };
  return {
    ...state,
    categories: [...state.categories, newCategory],
  };
}

export function addBrand(state: AppState, name: string): AppState {
  const newBrand: Brand = {
    id: `brand_${Date.now()}`,
    name,
  };
  return {
    ...state,
    brands: [...state.brands, newBrand],
  };
}

export function addUoM(state: AppState, name: string): AppState {
  const newUoM: UoM = {
    id: `uom_${Date.now()}`,
    name,
  };
  return {
    ...state,
    uoms: [...state.uoms, newUoM],
  };
}

export function deleteCategory(state: AppState, id: string): AppState {
  return {
    ...state,
    categories: state.categories.filter((c) => c.id !== id),
  };
}

export function deleteBrand(state: AppState, id: string): AppState {
  return {
    ...state,
    brands: state.brands.filter((b) => b.id !== id),
  };
}

export function deleteUoM(state: AppState, id: string): AppState {
  return {
    ...state,
    uoms: state.uoms.filter((u) => u.id !== id),
  };
}

export function addEmployee(
  state: AppState,
  name: string,
  email: string,
  departmentId: string,
  designationId: string,
  status: 'Active' | 'Inactive',
  permissions?: Permissions,
  role?: UserRole,
  password?: string
): AppState {
  const newEmp: Employee = {
    id: `emp_${Date.now()}`,
    name,
    email,
    departmentId,
    designationId,
    status,
    permissions,
    role,
    password,
  };
  return {
    ...state,
    employees: [...state.employees, newEmp],
  };
}

export function updateEmployee(
  state: AppState,
  id: string,
  updates: Partial<Omit<Employee, 'id'>>
): AppState {
  return {
    ...state,
    employees: state.employees.map((e) => (e.id === id ? { ...e, ...updates } : e)),
  };
}

export function deleteEmployee(state: AppState, id: string): AppState {
  return {
    ...state,
    employees: state.employees.filter((emp) => emp.id !== id),
  };
}

export function updateEmployeePermissions(state: AppState, employeeId: string, permissions: Permissions): AppState {
  return {
    ...state,
    employees: state.employees.map((emp) =>
      emp.id === employeeId ? { ...emp, permissions } : emp
    ),
  };
}

export function addDepartment(state: AppState, name: string): AppState {
  const newDept: Department = {
    id: `dept_${Date.now()}`,
    name,
  };
  return {
    ...state,
    departments: [...state.departments, newDept],
  };
}

export function addDesignation(state: AppState, name: string): AppState {
  const newDesig: Designation = {
    id: `desig_${Date.now()}`,
    name,
  };
  return {
    ...state,
    designations: [...state.designations, newDesig],
  };
}

export function updateTransfer(
  state: AppState,
  id: string,
  updates: Partial<Omit<InternalTransfer, 'id'>>
): AppState {
  return {
    ...state,
    transfers: state.transfers.map((t) => (t.id === id ? { ...t, ...updates } : t)),
  };
}

export function addPurchase(
  state: AppState,
  supplierId: string,
  purchaseDate: string,
  purchaseOrderNo: string,
  totalAmount: number,
  items: Array<{ productId: string; quantity: number; unitPrice: number }>
): AppState {
  const newPurId = `pur_${Date.now()}`;
  const newPur: Purchase = {
    id: newPurId,
    supplierId,
    purchaseDate,
    purchaseOrderNo,
    totalAmount,
    status: 'Pending', // pending until approved in approval tab
    receivedStatus: 'Pending',
    items,
  };
  const newPurchaseItems = items.map((item, idx) => ({
    id: `puritem_${Date.now()}_${idx}`,
    purchaseId: newPurId,
    productId: item.productId,
    quantity: item.quantity,
    unitPrice: item.unitPrice
  }));
  return {
    ...state,
    purchases: [...state.purchases, newPur],
    purchaseItems: [...(state.purchaseItems || []), ...newPurchaseItems]
  };
}

export function updatePurchase(
  state: AppState,
  id: string,
  updates: Partial<Omit<Purchase, 'id'>>
): AppState {
  return {
    ...state,
    purchases: state.purchases.map((p) => (p.id === id ? { ...p, ...updates } : p)),
  };
}

export function addPurchaseReturn(
  state: AppState,
  purchaseId: string,
  returnDate: string,
  returnNo: string,
  supplierId: string,
  refundAmount: number,
  reason: string,
  productId: string,
  quantity: number
): AppState {
  const newRet: PurchaseReturn = {
    id: `ret_${Date.now()}`,
    purchaseId,
    returnDate,
    returnNo,
    supplierId,
    refundAmount,
    reason,
    status: 'Pending',
    productId,
    quantity,
  };
  return {
    ...state,
    purchaseReturns: [...state.purchaseReturns, newRet],
  };
}

export function deletePurchase(state: AppState, id: string): AppState {
  return {
    ...state,
    purchases: state.purchases.filter((p) => p.id !== id),
    purchaseItems: (state.purchaseItems || []).filter((item) => item.purchaseId !== id),
  };
}

export function updatePurchaseReturn(
  state: AppState,
  id: string,
  updates: Partial<Omit<PurchaseReturn, 'id'>>
): AppState {
  return {
    ...state,
    purchaseReturns: state.purchaseReturns.map((r) => (r.id === id ? { ...r, ...updates } : r)),
  };
}

export function deletePurchaseReturn(state: AppState, id: string): AppState {
  return {
    ...state,
    purchaseReturns: state.purchaseReturns.filter((r) => r.id !== id),
  };
}

export function updateSupplier(
  state: AppState,
  id: string,
  updates: Partial<Omit<Supplier, 'id'>>
): AppState {
  return {
    ...state,
    suppliers: state.suppliers.map((s) => (s.id === id ? { ...s, ...updates } : s)),
  };
}

export function deleteSupplier(state: AppState, id: string): AppState {
  return {
    ...state,
    suppliers: state.suppliers.filter((s) => s.id !== id),
  };
}

export function deleteDelivery(state: AppState, id: string): AppState {
  return {
    ...state,
    deliveries: state.deliveries.filter((d) => d.id !== id),
  };
}

export function deleteSell(state: AppState, id: string): AppState {
  return {
    ...state,
    sells: state.sells.filter((s) => s.id !== id),
  };
}

export function deleteAdjustment(state: AppState, id: string): AppState {
  return {
    ...state,
    adjustments: state.adjustments.filter((a) => a.id !== id),
  };
}

export function deleteTransfer(state: AppState, id: string): AppState {
  return {
    ...state,
    transfers: state.transfers.filter((t) => t.id !== id),
  };
}

export function addSupplier(
  state: AppState,
  name: string,
  company: string,
  email: string,
  phone: string,
  code: string
): AppState {
  const newSup: Supplier = {
    id: `sup_${Date.now()}`,
    name,
    company,
    email,
    phone,
    code,
  };
  return {
    ...state,
    suppliers: [...state.suppliers, newSup],
  };
}

export function addDelivery(
  state: AppState,
  deliveryNo: string,
  branchId: string,
  productId: string,
  quantity: number,
  deliveryDate: string,
  handler: string
): AppState {
  const newDel: Delivery = {
    id: `del_${Date.now()}`,
    deliveryNo,
    branchId,
    productId,
    quantity,
    deliveryDate,
    handler,
    status: 'Pending', // approvals requested
  };
  return {
    ...state,
    deliveries: [...state.deliveries, newDel],
  };
}

export function updateDelivery(
  state: AppState,
  id: string,
  updates: Partial<Omit<Delivery, 'id'>>
): AppState {
  return {
    ...state,
    deliveries: state.deliveries.map((d) => (d.id === id ? { ...d, ...updates } : d)),
  };
}

export function addSell(
  state: AppState,
  saleNo: string,
  productId: string,
  customerName: string,
  quantity: number,
  totalAmount: number,
  saleDate: string
): AppState {
  const newSale: SellRecord = {
    id: `sale_${Date.now()}`,
    saleNo,
    productId,
    customerName,
    quantity,
    totalAmount,
    saleDate,
  };
  // Instantly reduce product inventory when sold
  const updatedProducts = state.products.map((p) => {
    if (p.id === productId) {
      return { ...p, quantity: Math.max(0, p.quantity - quantity) };
    }
    return p;
  });
  return {
    ...state,
    products: updatedProducts,
    sells: [...state.sells, newSale],
  };
}

export function updateSell(
  state: AppState,
  id: string,
  updates: Partial<Omit<SellRecord, 'id'>>
): AppState {
  return {
    ...state,
    sells: state.sells.map((s) => (s.id === id ? { ...s, ...updates } : s)),
  };
}

export function addAdjustment(
  state: AppState,
  referenceNo: string,
  productId: string,
  type: 'Addition' | 'Deduction',
  quantity: number,
  reason: string,
  date: string
): AppState {
  const newAdj: Adjustment = {
    id: `adj_${Date.now()}`,
    referenceNo,
    productId,
    type,
    quantity,
    reason,
    date,
    status: 'Pending',
  };
  return {
    ...state,
    adjustments: [...state.adjustments, newAdj],
  };
}

export function updateAdjustment(
  state: AppState,
  id: string,
  updates: Partial<Omit<Adjustment, 'id'>>
): AppState {
  return {
    ...state,
    adjustments: state.adjustments.map((a) => (a.id === id ? { ...a, ...updates } : a)),
  };
}

export function addTransfer(
  state: AppState,
  transferNo: string,
  fromBranchId: string,
  toBranchId: string,
  productId: string,
  quantity: number,
  date: string,
  status: string
): AppState {
  const newTrans: InternalTransfer = {
    id: `trans_${Date.now()}`,
    transferNo,
    fromBranchId,
    toBranchId,
    productId,
    quantity,
    date,
    status: 'Transferred',
  };
  return {
    ...state,
    transfers: [...state.transfers, newTrans],
  };
}

export function addTransaction(
  state: AppState,
  type: 'Receipt' | 'Payment',
  date: string,
  voucherNo: string,
  partyName: string,
  amount: number,
  description: string,
  category: string,
  attachmentUrl?: string
): AppState {
  const newT: CashTransaction = {
    id: `tx_${Date.now()}`,
    type,
    date,
    voucherNo,
    partyName,
    amount,
    description,
    category,
    attachmentUrl,
  };
  return {
    ...state,
    cashTransactions: [...state.cashTransactions, newT],
  };
}

export function updateTransaction(
  state: AppState,
  id: string,
  updates: Partial<Omit<CashTransaction, 'id'>>
): AppState {
  return {
    ...state,
    cashTransactions: state.cashTransactions.map((t) => (t.id === id ? { ...t, ...updates } : t)),
  };
}

// Approval tab handlers
export function approvePurchase(state: AppState, id: string, status: 'Approved' | 'Rejected'): AppState {
  return {
    ...state,
    purchases: state.purchases.map((p) => {
      if (p.id === id) {
        // If approved, let's increment targeted product stock!
        const updatedProducts = state.products.map((prod) => {
          const itemOrdered = p.items.find((item) => item.productId === prod.id);
          if (status === 'Approved' && itemOrdered) {
            return { ...prod, quantity: prod.quantity + itemOrdered.quantity };
          }
          return prod;
        });
        state.products = updatedProducts;
        return { ...p, status, receivedStatus: status === 'Approved' ? 'Received' : 'Pending' };
      }
      return p;
    }),
  };
}

export function approveDelivery(state: AppState, id: string, status: 'Approved' | 'Rejected'): AppState {
  let updatedReturns = state.purchaseReturns;
  let updatedProducts = state.products;

  const updatedDeliveries = state.deliveries.map((d) => {
    if (d.id === id) {
      if (status === 'Approved') {
        // If approved, decrement the product stock!
        updatedProducts = state.products.map((prod) => {
          if (prod.id === d.productId) {
            return { ...prod, quantity: Math.max(0, prod.quantity - d.quantity) };
          }
          return prod;
        });
      } else if (status === 'Rejected') {
        // Automatically generate a new pending PurchaseReturn for that same product and quantity!
        // Find reference purchase order containing this product
        const refPurchase = state.purchases.find(p => p.items.some(item => item.productId === d.productId));
        const unitPrice = refPurchase?.items.find(item => item.productId === d.productId)?.unitPrice || 0;
        const refundAmount = d.quantity * unitPrice;
        
        const newRet: PurchaseReturn = {
          id: `ret_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          purchaseId: refPurchase?.id || 'unknown',
          returnDate: new Date().toISOString().split('T')[0],
          returnNo: `PRN-REJ-${Math.floor(Math.random() * 900) + 100}`,
          supplierId: refPurchase?.supplierId || state.suppliers[0]?.id || 'unknown',
          refundAmount,
          reason: `Rejected dispatch delivery request (No: ${d.deliveryNo}). Automatically generated return.`,
          status: 'Pending',
          productId: d.productId,
          quantity: d.quantity,
        };
        updatedReturns = [...state.purchaseReturns, newRet];
      }
      return { ...d, status };
    }
    return d;
  });

  return {
    ...state,
    products: updatedProducts,
    deliveries: updatedDeliveries,
    purchaseReturns: updatedReturns,
  };
}

export function approveReturn(state: AppState, id: string, status: 'Received' | 'Rejected'): AppState {
  let updatedProducts = state.products;
  let updatedCashTransactions = state.cashTransactions;
  
  const updatedReturns = state.purchaseReturns.map((r) => {
    if (r.id === id) {
      if (status === 'Received') {
        // Decrease that product's stock quantity
        updatedProducts = state.products.map((p) => {
          if (p.id === r.productId) {
            return { ...p, quantity: Math.max(0, p.quantity - r.quantity) };
          }
          return p;
        });

        // Create matching Cash Book transaction for the refund amount
        const supplierName = state.suppliers.find(s => s.id === r.supplierId)?.name || 'Supplier';
        const newTx: CashTransaction = {
          id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          type: 'Receipt',
          date: new Date().toISOString().split('T')[0],
          voucherNo: `RV-PRN-${r.returnNo.split('-').pop() || Math.floor(Math.random() * 1000 + 1000)}`,
          partyName: supplierName,
          amount: r.refundAmount,
          description: `Refund for returned product: ${state.products.find(p => p.id === r.productId)?.name || 'Product'} (Return No: ${r.returnNo})`,
          category: 'Asset Refund',
        };
        updatedCashTransactions = [...state.cashTransactions, newTx];
      }
      return { ...r, status };
    }
    return r;
  });

  return {
    ...state,
    products: updatedProducts,
    cashTransactions: updatedCashTransactions,
    purchaseReturns: updatedReturns,
  };
}

export function approveAdjustment(state: AppState, id: string, status: 'Approved' | 'Rejected'): AppState {
  return {
    ...state,
    adjustments: state.adjustments.map((adj) => {
      if (adj.id === id) {
        // Apply adjustment to stock if approved
        const updatedProducts = state.products.map((prod) => {
          if (status === 'Approved' && prod.id === adj.productId) {
            const finalQty = adj.type === 'Addition' 
              ? prod.quantity + adj.quantity 
              : Math.max(0, prod.quantity - adj.quantity);
            return { ...prod, quantity: finalQty };
          }
          return prod;
        });
        state.products = updatedProducts;
        return { ...adj, status };
      }
      return adj;
    }),
  };
}

export function approveRequisition(state: AppState, id: string, status: 'Approved' | 'Rejected'): AppState {
  return {
    ...state,
    requisitions: state.requisitions.map((req) => {
      if (req.id === id) {
        return { ...req, status };
      }
      return req;
    }),
  };
}
