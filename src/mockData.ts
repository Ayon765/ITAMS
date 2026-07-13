import { 
  Branch, Supplier, Category, Brand, UoM, Product, 
  Employee, Department, Designation, Purchase, PurchaseReturn, 
  Delivery, SellRecord, Adjustment, InternalTransfer, Requisition, 
  CashTransaction 
} from './types';

export const initialBranches: Branch[] = [];

export const initialSuppliers: Supplier[] = [
  { id: 's1', name: 'Apex Tech Distributors', company: 'Apex Distribution Inc.', email: 'orders@apextech.com', phone: '+1 800-555-1200', code: 'SUP-APX' },
  { id: 's2', name: 'Sumo Silicon Corp', company: 'Sumo Silicon Ltd.', email: 'sales@sumosilicon.jp', phone: '+81 3-1234-5678', code: 'SUP-SUMO' },
  { id: 's3', name: 'Euro Systems Trade', company: 'Euro Systems GmBH', email: 'b2b@eurosystems.de', phone: '+49 89 24440', code: 'SUP-EURO' }
];

export const initialCategories: Category[] = [];

export const initialBrands: Brand[] = [];

export const initialUoMs: UoM[] = [];

export const initialProducts: Product[] = [];

export const initialDepartments: Department[] = [
  { id: 'd1', name: 'IT Infrastructure' },
  { id: 'd2', name: 'Engineering Operations' },
  { id: 'd3', name: 'Finance & Compliance' },
  { id: 'd4', name: 'Human Resources' }
];

export const initialDesignations: Designation[] = [
  { id: 'ds1', name: 'Chief Technology Officer' },
  { id: 'ds2', name: 'Lead DevOps Engineer' },
  { id: 'ds3', name: 'Principal Database Administrator' },
  { id: 'ds4', name: 'IT Asset Custodian' }
];

export const initialEmployees: Employee[] = [
  { id: 'e1', name: 'Marcus Aurelius', email: 'marcus@assetflow.com', departmentId: 'd1', designationId: 'ds1', status: 'Active' },
  { id: 'e2', name: 'Julia Roberts', email: 'julia@assetflow.com', departmentId: 'd2', designationId: 'ds2', status: 'Active' },
  { id: 'e3', name: 'Winston Churchill', email: 'churchill@assetflow.com', departmentId: 'd3', designationId: 'ds3', status: 'Active' },
  { id: 'e4', name: 'Sophia Loren', email: 'sophia@assetflow.com', departmentId: 'd4', designationId: 'ds4', status: 'Active' }
];

export const initialPurchases: Purchase[] = [
  { id: 'pur1', supplierId: 's1', purchaseDate: '2026-06-01', purchaseOrderNo: 'PO-2026-0001', totalAmount: 45400, status: 'Approved', receivedStatus: 'Received', items: [{ productId: 'p1', quantity: 10, unitPrice: 3490 }, { productId: 'p2', quantity: 10, unitPrice: 1050 }] },
  { id: 'pur2', supplierId: 's2', purchaseDate: '2026-06-15', purchaseOrderNo: 'PO-2026-0002', totalAmount: 75000, status: 'Pending', receivedStatus: 'Pending', items: [{ productId: 'p5', quantity: 20, unitPrice: 3750 }] },
  { id: 'pur3', supplierId: 's3', purchaseDate: '2026-06-18', purchaseOrderNo: 'PO-2026-0003', totalAmount: 120400, status: 'Approved', receivedStatus: 'Pending', items: [{ productId: 'p1', quantity: 30, unitPrice: 3200 }, { productId: 'p3', quantity: 18, unitPrice: 1350 }] }
];

export const initialPurchaseReturns: PurchaseReturn[] = [
  { id: 'pr1', purchaseId: 'pur1', returnDate: '2026-06-05', returnNo: 'PRN-2026-01', supplierId: 's1', refundAmount: 6980, reason: 'Cosmetic damages on display panels on two MacBook Pros on receipt.', status: 'Received', productId: 'p1', quantity: 2 }
];

export const initialDeliveries: Delivery[] = [
  { id: 'dl1', deliveryNo: 'DN-2026-001', branchId: 'b1', productId: 'p1', quantity: 5, deliveryDate: '2026-06-02', handler: 'Marcus Aurelius', status: 'Approved' },
  { id: 'dl2', deliveryNo: 'DN-2026-002', branchId: 'b2', productId: 'p2', quantity: 8, deliveryDate: '2026-06-19', handler: 'Sophia Loren', status: 'Pending' }
];

export const initialSells: SellRecord[] = [
  { id: 'sl1', saleNo: 'SO-2026-091', productId: 'p2', customerName: 'Apex Partner Org', quantity: 2, totalAmount: 3200, saleDate: '2026-06-12' }
];

export const initialAdjustments: Adjustment[] = [
  { id: 'adj1', referenceNo: 'ADJ-2026-001', productId: 'p3', type: 'Deduction', quantity: 1, reason: 'Decommissioned bricked laptop during quarterly cycle.', date: '2026-06-10', status: 'Approved' },
  { id: 'adj2', referenceNo: 'ADJ-2026-002', productId: 'p1', type: 'Addition', quantity: 2, reason: 'Found unmarked evaluation inventory units during auditing.', date: '2026-06-20', status: 'Pending' }
];

export const initialTransfers: InternalTransfer[] = [
  { id: 't1', transferNo: 'TR-26-01', fromBranchId: 'b1', toBranchId: 'b3', productId: 'p1', quantity: 2, date: '2026-06-21', status: 'Completed' }
];

export const initialRequisitions: Requisition[] = [
  { id: 'req1', employeeId: 'e2', productId: 'p1', quantity: 1, reason: 'Needs high computational horsepower for engineering simulations.', date: '2026-06-22', status: 'Pending' }
];

export const initialCashTransactions: CashTransaction[] = [
  { id: 'ct1', type: 'Receipt', date: '2026-06-01', voucherNo: 'RV-1001', partyName: 'Solder Tech Corp (Asset Salvage)', amount: 4800, description: 'Sold legacy bricked server racks for metallic scrap recovery.', category: 'Salvage Income' },
  { id: 'ct2', type: 'Payment', date: '2026-06-05', voucherNo: 'PV-2001', partyName: 'QuickLogistics Express', amount: 1250, description: 'Inter-hub emergency hardware secure freight payment.', category: 'Freight Charges' },
  { id: 'ct3', type: 'Receipt', date: '2026-06-12', voucherNo: 'RV-1002', partyName: 'Apex Partner Org', amount: 3200, description: 'Settlement for partner hardware sales.', category: 'Asset Sale' }
];
