export interface Branch {
  id: string;
  name: string;
  code: string;
  location: string;
  phone: string;
  contactPerson: string;
}

export interface Supplier {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  code: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Brand {
  id: string;
  name: string;
}

export interface UoM {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  brandId: string;
  uomId: string;
  quantity: number;
  unitPrice: number;
  damagedQty?: number;
  repairRequiredQty?: number;
  scrapQty?: number;
  purchaseDate?: string;
}

export interface Permissions {
  canViewProduct: boolean;
  canEditProduct: boolean;
  canViewPurchase: boolean;
  canEditPurchase: boolean;
  canViewInventory: boolean;
  canEditInventory: boolean;
  canViewBranch: boolean;
  canEditBranch: boolean;
  canViewHRMS: boolean;
  canEditHRMS: boolean;
  canViewApproval: boolean;
  canEditApproval: boolean;
  canViewCashBook: boolean;
  canEditCashBook: boolean;
  canViewReport: boolean;
  canEditReport: boolean;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  departmentId: string;
  designationId: string;
  status: 'Active' | 'Inactive';
  role?: UserRole;
  password?: string;
  permissions?: Permissions;
}

export interface Department {
  id: string;
  name: string;
}

export interface Designation {
  id: string;
  name: string;
}

export interface Purchase {
  id: string;
  supplierId: string;
  purchaseDate: string;
  purchaseOrderNo: string;
  totalAmount: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  receivedStatus: 'Pending' | 'Received' | 'Returned';
  items: Array<{ productId: string; quantity: number; unitPrice: number }>;
}

export interface PurchaseReturn {
  id: string;
  purchaseId: string;
  returnDate: string;
  returnNo: string;
  supplierId: string;
  refundAmount: number;
  reason: string;
  status: 'Pending' | 'Received' | 'Rejected';
  productId: string;
  quantity: number;
}

export interface Delivery {
  id: string;
  deliveryNo: string;
  branchId: string;
  productId: string;
  quantity: number;
  deliveryDate: string;
  handler: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface SellRecord {
  id: string;
  saleNo: string;
  productId: string;
  customerName: string;
  quantity: number;
  totalAmount: number;
  saleDate: string;
}

export interface Adjustment {
  id: string;
  referenceNo: string;
  productId: string;
  type: 'Addition' | 'Deduction';
  quantity: number;
  reason: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface InternalTransfer {
  id: string;
  transferNo: string;
  fromBranchId: string;
  toBranchId: string;
  productId: string;
  quantity: number;
  date: string;
  status: 'Transferred' | 'Completed';
}

export interface Requisition {
  id: string;
  employeeId: string;
  productId: string;
  quantity: number;
  reason: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface CashTransaction {
  id: string;
  type: 'Receipt' | 'Payment';
  date: string;
  voucherNo: string;
  partyName: string;
  amount: number;
  description: string;
  category: string;
  attachmentUrl?: string;
}

export type UserRole = 'Super Admin' | 'Admin' | 'General User';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  permissions?: Permissions;
  isTerminated?: boolean;
}

export type AssetCondition = 'Good' | 'Damaged' | 'Repair Required' | 'Scrap';

export interface PurchaseItem {
  id: string;
  purchaseId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface AppState {
  branches: Branch[];
  suppliers: Supplier[];
  categories: Category[];
  brands: Brand[];
  uoms: UoM[];
  products: Product[];
  departments: Department[];
  designations: Designation[];
  employees: Employee[];
  purchases: Purchase[];
  purchaseReturns: PurchaseReturn[];
  deliveries: Delivery[];
  sells: SellRecord[];
  adjustments: Adjustment[];
  transfers: InternalTransfer[];
  requisitions: Requisition[];
  cashTransactions: CashTransaction[];
  purchaseItems?: PurchaseItem[];
}

