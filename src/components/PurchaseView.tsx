import React, { useState, useRef } from 'react';
import { Purchase, PurchaseReturn, Supplier, Product, Permissions } from '../types';
import { Plus, Search, HelpCircle, Truck, RefreshCw, Send, CheckCircle, Clock, Trash2, FileSpreadsheet, FileUp, Eye, Pencil } from 'lucide-react';
import * as XLSX from 'xlsx';
import { formatDate } from '../utils';

interface PurchaseViewProps {
  purchases: Purchase[];
  purchaseReturns: PurchaseReturn[];
  suppliers: Supplier[];
  products: Product[];
  onAddPurchase: (purchase: Omit<Purchase, 'id' | 'status' | 'receivedStatus'>) => void;
  onUpdatePurchase: (id: string, updates: Partial<Omit<Purchase, 'id'>>) => void;
  onDeletePurchase: (id: string) => void;
  onAddPurchaseReturn: (ret: Omit<PurchaseReturn, 'id' | 'status'>) => void;
  onUpdatePurchaseReturn: (id: string, updates: Partial<Omit<PurchaseReturn, 'id'>>) => void;
  onDeletePurchaseReturn: (id: string) => void;
  onAddSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  onUpdateSupplier: (id: string, updates: Partial<Omit<Supplier, 'id'>>) => void;
  onDeleteSupplier: (id: string) => void;
  userRole: string; // Dynamic role checking
  permissions?: Permissions;
  searchTerm: string;
}

export default function PurchaseView({
  purchases,
  purchaseReturns,
  suppliers,
  products,
  onAddPurchase,
  onUpdatePurchase,
  onDeletePurchase,
  onAddPurchaseReturn,
  onUpdatePurchaseReturn,
  onDeletePurchaseReturn,
  onAddSupplier,
  onUpdateSupplier,
  onDeleteSupplier,
  userRole,
  searchTerm,
}: PurchaseViewProps) {
  const [activeTab, setActiveTab] = useState<'purchases' | 'returns' | 'suppliers'>('purchases');
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [operationMode, setOperationMode] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [purSupplier, setPurSupplier] = useState('');
  const [purProduct, setPurProduct] = useState('');
  const [purQty, setPurQty] = useState(1);
  const [purPrice, setPurPrice] = useState(0);

  const [retPurchaseRefs, setRetPurchaseRefs] = useState('');
  const [retSupplier, setRetSupplier] = useState('');
  const [retAmount, setRetAmount] = useState(0);
  const [retReason, setRetReason] = useState('');
  const [retProduct, setRetProduct] = useState('');
  const [retQty, setRetQty] = useState(1);

  const [supName, setSupName] = useState('');
  const [supCompany, setSupCompany] = useState('');
  const [supEmail, setSupEmail] = useState('');
  const [supPhone, setSupPhone] = useState('');
  const [supCode, setSupCode] = useState('');

  const filteredPurchases = purchases.filter(p =>
    p.purchaseOrderNo.toLowerCase().includes(localSearchTerm.toLowerCase())
  );

  const filteredReturns = purchaseReturns.filter(r =>
    r.returnNo.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
    r.reason.toLowerCase().includes(localSearchTerm.toLowerCase())
  );

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
    s.company.toLowerCase().includes(localSearchTerm.toLowerCase())
  );

  const handleOpenAddModal = () => {
    setOperationMode('add');
    setSelectedId(null);
    setPurSupplier(suppliers[0]?.id || '');
    setPurProduct(products[0]?.id || '');
    setPurQty(1);
    setPurPrice(0);
    const firstPo = purchases[0];
    setRetPurchaseRefs(firstPo?.id || '');
    setRetSupplier(firstPo?.supplierId || suppliers[0]?.id || '');
    setRetProduct(firstPo?.items[0]?.productId || products[0]?.id || '');
    setRetQty(firstPo?.items[0]?.quantity || 1);
    setRetAmount(firstPo?.items[0] ? (firstPo.items[0].quantity * firstPo.items[0].unitPrice) : 0);
    setRetReason('');
    setSupName('');
    setSupCompany('');
    setSupEmail('');
    setSupPhone('');
    setSupCode('');
    setShowAddModal(true);
  };

  const handleOpenEditPurchase = (p: Purchase) => {
    setActiveTab('purchases');
    setOperationMode('edit');
    setSelectedId(p.id);
    setPurSupplier(p.supplierId);
    if (p.items.length > 0) {
      setPurProduct(p.items[0].productId);
      setPurQty(p.items[0].quantity);
      setPurPrice(p.items[0].unitPrice);
    }
    setShowAddModal(true);
  };

  const handleOpenViewPurchase = (p: Purchase) => {
    setActiveTab('purchases');
    setOperationMode('view');
    setSelectedId(p.id);
    setPurSupplier(p.supplierId);
    if (p.items.length > 0) {
      setPurProduct(p.items[0].productId);
      setPurQty(p.items[0].quantity);
      setPurPrice(p.items[0].unitPrice);
    }
    setShowAddModal(true);
  };

  const handleOpenEditReturn = (r: PurchaseReturn) => {
    setActiveTab('returns');
    setOperationMode('edit');
    setSelectedId(r.id);
    setRetPurchaseRefs(r.purchaseId);
    setRetSupplier(r.supplierId);
    setRetAmount(r.refundAmount);
    setRetReason(r.reason);
    setRetProduct(r.productId || '');
    setRetQty(r.quantity || 1);
    setShowAddModal(true);
  };

  const handleOpenViewReturn = (r: PurchaseReturn) => {
    setActiveTab('returns');
    setOperationMode('view');
    setSelectedId(r.id);
    setRetPurchaseRefs(r.purchaseId);
    setRetSupplier(r.supplierId);
    setRetAmount(r.refundAmount);
    setRetReason(r.reason);
    setRetProduct(r.productId || '');
    setRetQty(r.quantity || 1);
    setShowAddModal(true);
  };

  const handleOpenEditSupplier = (s: Supplier) => {
    setActiveTab('suppliers');
    setOperationMode('edit');
    setSelectedId(s.id);
    setSupName(s.name);
    setSupCompany(s.company);
    setSupEmail(s.email);
    setSupPhone(s.phone);
    setSupCode(s.code);
    setShowAddModal(true);
  };

  const handleOpenViewSupplier = (s: Supplier) => {
    setActiveTab('suppliers');
    setOperationMode('view');
    setSelectedId(s.id);
    setSupName(s.name);
    setSupCompany(s.company);
    setSupEmail(s.email);
    setSupPhone(s.phone);
    setSupCode(s.code);
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'purchases') {
      if (!purSupplier || !purProduct) return;
      
      const purchaseAmount = purQty * purPrice;
      
      if (operationMode === 'add') {
        const purchaseOrderNo = `PO-2026-0${Math.floor(Math.random() * 9000) + 1000}`;
        onAddPurchase({
          supplierId: purSupplier,
          purchaseDate: new Date().toISOString().split('T')[0],
          purchaseOrderNo,
          totalAmount: purchaseAmount,
          items: [{ productId: purProduct, quantity: purQty, unitPrice: purPrice }],
        });
      } else if (operationMode === 'edit' && selectedId) {
        onUpdatePurchase(selectedId, {
          supplierId: purSupplier,
          totalAmount: purchaseAmount,
          items: [{ productId: purProduct, quantity: purQty, unitPrice: purPrice }]
        });
      }
      setPurQty(1);
      setPurPrice(0);
    } else if (activeTab === 'returns') {
      if (!retPurchaseRefs || !retSupplier || !retProduct) return;
      if (operationMode === 'add') {
        const returnNo = `PRN-2026-0${Math.floor(Math.random() * 900) + 100}`;
        onAddPurchaseReturn({
          purchaseId: retPurchaseRefs,
          returnDate: new Date().toISOString().split('T')[0],
          returnNo,
          supplierId: retSupplier,
          refundAmount: retAmount,
          reason: retReason,
          productId: retProduct,
          quantity: retQty,
        });
      } else if (operationMode === 'edit' && selectedId) {
        onUpdatePurchaseReturn(selectedId, {
          purchaseId: retPurchaseRefs,
          supplierId: retSupplier,
          refundAmount: retAmount,
          reason: retReason,
          productId: retProduct,
          quantity: retQty,
        });
      }
      setRetReason('');
      setRetAmount(0);
      setRetProduct('');
      setRetQty(1);
    } else if (activeTab === 'suppliers') {
      if (!supName || !supCompany || !supCode) return;
      if (operationMode === 'add') {
        onAddSupplier({
          name: supName,
          company: supCompany,
          email: supEmail,
          phone: supPhone,
          code: supCode,
        });
      } else if (operationMode === 'edit' && selectedId) {
        onUpdateSupplier(selectedId, {
          name: supName,
          company: supCompany,
          email: supEmail,
          phone: supPhone,
          code: supCode
        });
      }
      setSupName('');
      setSupCompany('');
      setSupEmail('');
      setSupPhone('');
      setSupCode('');
    }
    setShowAddModal(false);
  };

  const handleExportXlsx = () => {
    const worksheet = XLSX.utils.json_to_sheet(purchases.map(p => ({
      'PO No': p.purchaseOrderNo,
      'Supplier ID': p.supplierId,
      'Date': p.purchaseDate,
      'Total Amount': p.totalAmount,
      'Status': p.status,
      'Received Status': p.receivedStatus
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Purchases");
    XLSX.writeFile(workbook, "purchases.xlsx");
  };

  const handleImportXlsx = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json: any[] = XLSX.utils.sheet_to_json(worksheet);

      json.forEach((row: any) => {
        if (row['PO No'] && row['Supplier ID']) {
          onAddPurchase({
            supplierId: row['Supplier ID'],
            purchaseOrderNo: row['PO No'],
            purchaseDate: row['Date'],
            totalAmount: parseFloat(row['Total Amount']) || 0,
            items: [], // Simplified for now
          });
        }
      });
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="space-y-6">

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 bg-gray-50 dark:bg-slate-900/50 text-gray-800 placeholder-gray-400 rounded-lg text-xs transition-colors focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-row flex-wrap items-center gap-3">
          <button
            onClick={handleExportXlsx}
            className="flex items-center gap-1.5 bg-black hover:bg-zinc-900 transition-all text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md hover:cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" /> Export XLSX
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 bg-black hover:bg-zinc-900 transition-all text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md hover:cursor-pointer"
          >
            <FileUp className="w-3.5 h-3.5" /> Import XLSX
          </button>
          <input type="file" ref={fileInputRef} onChange={handleImportXlsx} className="hidden" accept=".xlsx" />
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 bg-black hover:bg-zinc-900 transition-all text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md hover:cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add {activeTab === 'purchases' ? 'Purchase Order' : activeTab === 'returns' ? 'Return' : 'Supplier'}
          </button>
        </div>
      </div>

      {activeTab === 'purchases' && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50 text-xs uppercase text-gray-500 tracking-wider">
                <th className="px-6 py-3 font-semibold">PO #</th>
                <th className="px-6 py-3 font-semibold">Supplier</th>
                <th className="px-6 py-3 font-semibold">Date</th>
                <th className="px-6 py-3 font-semibold text-right">Total Amount</th>
                <th className="px-6 py-3 font-semibold text-center">Procure Status</th>
                <th className="px-6 py-3 font-semibold text-center">Delivery status</th>
                <th className="px-6 py-3 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-800">
              {filteredPurchases.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-semibold text-gray-900 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-emerald-500" />
                    {p.purchaseOrderNo}
                  </td>
                  <td className="px-6 py-4 text-zinc-600">
                    {suppliers.find(s => s.id === p.supplierId)?.name || 'Bulk supplier'}
                  </td>
                  <td className="px-6 py-4 text-xs text-zinc-500">{formatDate(p.purchaseDate)}</td>
                  <td className="px-6 py-4 text-right font-medium text-emerald-600">
                    ৳{p.totalAmount.toLocaleString('bn-BD')}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                      p.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500' :
                      p.status === 'Rejected' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'
                    }`}>
                      {p.status === 'Approved' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-xs text-zinc-500">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-gray-100">
                      {p.receivedStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleOpenViewPurchase(p)}
                      className="p-1.5 text-emerald-500 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors inline-flex items-center justify-center hover:cursor-pointer mr-1"
                      title="View Purchase"
                    >
                      <Eye className="w-4 h-4 text-[#00FF00]" />
                    </button>
                    <button
                      onClick={() => handleOpenEditPurchase(p)}
                      className="p-1.5 text-yellow-500 hover:text-yellow-600 rounded-lg hover:bg-yellow-50 transition-colors inline-flex items-center justify-center hover:cursor-pointer mr-1"
                      title="Edit Purchase"
                    >
                      <Pencil className="w-4 h-4 text-[#FFFF00]" />
                    </button>
                    <button
                      onClick={() => onDeletePurchase(p.id)}
                      className="p-1.5 text-red-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors inline-flex items-center justify-center hover:cursor-pointer"
                      title="Delete Purchase Order"
                    >
                      <Trash2 className="w-4 h-4 text-[#FF0000]" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'returns' && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50 text-xs uppercase text-gray-500 tracking-wider">
                <th className="px-6 py-3 font-semibold">Return No</th>
                <th className="px-6 py-3 font-semibold">Purchase Order Ref</th>
                <th className="px-6 py-3 font-semibold">Product</th>
                <th className="px-6 py-3 font-semibold">Qty</th>
                <th className="px-6 py-3 font-semibold">Supplier</th>
                <th className="px-6 py-3 font-semibold">Return Date</th>
                <th className="px-6 py-3 font-semibold">Reason</th>
                <th className="px-6 py-3 font-semibold text-right">Refund Value</th>
                <th className="px-6 py-3 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-800">
              {filteredReturns.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-semibold text-amber-500 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    {r.returnNo}
                  </td>
                  <td className="px-6 py-4 text-zinc-500">
                    {purchases.find(p => p.id === r.purchaseId)?.purchaseOrderNo || '#PR-2023-091'}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {products.find(p => p.id === r.productId)?.name || 'Product'}
                  </td>
                  <td className="px-6 py-4 text-center font-bold">
                    {r.quantity?.toLocaleString('bn-BD') || 0}
                  </td>
                  <td className="px-6 py-4 text-zinc-600">
                    {suppliers.find(s => s.id === r.supplierId)?.name || 'Supplier'}
                  </td>
                  <td className="px-6 py-4 text-xs text-zinc-500">{formatDate(r.returnDate)}</td>
                  <td className="px-6 py-4 text-xs text-zinc-500 max-w-xs truncate">{r.reason}</td>
                  <td className="px-6 py-4 text-right font-medium text-rose-500">
                    -৳{r.refundAmount.toLocaleString('bn-BD')}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleOpenViewReturn(r)}
                      className="p-1.5 text-emerald-500 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors inline-flex items-center justify-center hover:cursor-pointer mr-1"
                      title="View Return"
                    >
                      <Eye className="w-4 h-4 text-[#00FF00]" />
                    </button>
                    <button
                      onClick={() => handleOpenEditReturn(r)}
                      className="p-1.5 text-yellow-500 hover:text-yellow-600 rounded-lg hover:bg-yellow-50 transition-colors inline-flex items-center justify-center hover:cursor-pointer mr-1"
                      title="Edit Return"
                    >
                      <Pencil className="w-4 h-4 text-[#FFFF00]" />
                    </button>
                    <button
                      onClick={() => onDeletePurchaseReturn(r.id)}
                      className="p-1.5 text-red-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors inline-flex items-center justify-center hover:cursor-pointer"
                      title="Delete Return Request"
                    >
                      <Trash2 className="w-4 h-4 text-[#FF0000]" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'suppliers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSuppliers.map((s) => (
            <div key={s.id} className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-500">{s.code}</span>
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-indigo-500" />
                    <button
                      onClick={() => handleOpenViewSupplier(s)}
                      className="p-1 text-emerald-500 hover:text-emerald-600 rounded hover:bg-emerald-50 transition-colors hover:cursor-pointer"
                      title="View Supplier"
                    >
                      <Eye className="w-4 h-4 text-[#00FF00]" />
                    </button>
                    <button
                      onClick={() => handleOpenEditSupplier(s)}
                      className="p-1 text-yellow-500 hover:text-yellow-600 rounded hover:bg-yellow-50 transition-colors hover:cursor-pointer"
                      title="Edit Supplier"
                    >
                      <Pencil className="w-4 h-4 text-[#FFFF00]" />
                    </button>
                    <button
                      onClick={() => onDeleteSupplier(s.id)}
                      className="p-1 text-red-500 hover:text-red-600 rounded hover:bg-red-50 transition-colors hover:cursor-pointer"
                      title="Delete Supplier"
                    >
                      <Trash2 className="w-4 h-4 text-[#FF0000]" />
                    </button>
                  </div>
                </div>
                <h4 className="text-base font-bold text-gray-800 mb-1">{s.name}</h4>
                <p className="text-xs text-zinc-500 mb-4">{s.company}</p>
                <div className="text-xs space-y-1 text-zinc-600">
                  <p>Email: {s.email}</p>
                  <p>Phone: {s.phone}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-xl border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">
                {operationMode === 'view' ? 'View' : operationMode === 'edit' ? 'Edit' : 'Add'} {activeTab === 'purchases' ? 'Purchase Order' : activeTab === 'returns' ? 'Return Request' : 'Supplier'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <Plus className="w-5 h-5 text-gray-500 rotate-45" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {activeTab === 'purchases' ? (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Supplier *</label>
                    <select
                      disabled={operationMode === 'view'}
                      value={purSupplier}
                      onChange={(e) => setPurSupplier(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 bg-white text-gray-800 rounded-lg focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {suppliers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.company})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Target Product Asset *</label>
                    <select
                      disabled={operationMode === 'view'}
                      value={purProduct}
                      onChange={(e) => setPurProduct(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 bg-white text-gray-800 rounded-lg focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        required
                        disabled={operationMode === 'view'}
                        value={purQty}
                        onChange={(e) => setPurQty(parseInt(e.target.value))}
                        className="w-full px-3 py-2 text-sm border border-gray-200 bg-white text-gray-800 rounded-lg focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Negotiated Price (৳)</label>
                      <input
                        type="number"
                        min="1"
                        required
                        disabled={operationMode === 'view'}
                        value={purPrice}
                        onChange={(e) => setPurPrice(parseInt(e.target.value))}
                        className="w-full px-3 py-2 text-sm border border-gray-200 bg-white text-gray-800 rounded-lg focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                </>
              ) : activeTab === 'returns' ? (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Reference Purchase Order *</label>
                    <select
                      disabled={operationMode === 'view'}
                      value={retPurchaseRefs}
                      onChange={(e) => {
                        const val = e.target.value;
                        setRetPurchaseRefs(val);
                        const po = purchases.find(p => p.id === val);
                        if (po) {
                          setRetSupplier(po.supplierId);
                          if (po.items.length > 0) {
                            const firstItem = po.items[0];
                            setRetProduct(firstItem.productId);
                            setRetQty(firstItem.quantity);
                            setRetAmount(firstItem.quantity * firstItem.unitPrice);
                          }
                        }
                      }}
                      className="w-full px-3 py-2 text-sm border border-gray-200 bg-white text-gray-800 rounded-lg focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      <option value="">-- Select Purchase Order --</option>
                      {purchases.map(p => (
                        <option key={p.id} value={p.id}>{p.purchaseOrderNo} ({suppliers.find(s => s.id === p.supplierId)?.name})</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Select product from the selected Purchase Order */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Product to Return *</label>
                    <select
                      disabled={operationMode === 'view' || !retPurchaseRefs}
                      value={retProduct}
                      onChange={(e) => {
                        const prodId = e.target.value;
                        setRetProduct(prodId);
                        const po = purchases.find(p => p.id === retPurchaseRefs);
                        const item = po?.items.find(it => it.productId === prodId);
                        if (item) {
                          setRetQty(item.quantity);
                          setRetAmount(item.quantity * item.unitPrice);
                        }
                      }}
                      className="w-full px-3 py-2 text-sm border border-gray-200 bg-white text-gray-800 rounded-lg focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      <option value="">-- Select Product --</option>
                      {purchases.find(p => p.id === retPurchaseRefs)?.items.map(item => (
                        <option key={item.productId} value={item.productId}>
                          {products.find(p => p.id === item.productId)?.name || 'Unknown Product'} (Purchased Qty: {item.quantity})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Return Quantity *</label>
                      <input
                        type="number"
                        min="1"
                        max={purchases.find(p => p.id === retPurchaseRefs)?.items.find(item => item.productId === retProduct)?.quantity || 100}
                        required
                        disabled={operationMode === 'view' || !retProduct}
                        value={retQty}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setRetQty(val);
                          const po = purchases.find(p => p.id === retPurchaseRefs);
                          const item = po?.items.find(it => it.productId === retProduct);
                          if (item) {
                            setRetAmount(val * item.unitPrice);
                          }
                        }}
                        className="w-full px-3 py-2 text-sm border border-gray-200 bg-white text-gray-800 rounded-lg focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Refund Amount (৳)</label>
                      <input
                        type="number"
                        required
                        disabled={operationMode === 'view'}
                        value={retAmount}
                        onChange={(e) => setRetAmount(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 bg-white text-gray-800 rounded-lg focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Supplier</label>
                    <select
                      disabled
                      value={retSupplier}
                      className="w-full px-3 py-2 text-sm border border-gray-200 bg-zinc-50 text-zinc-500 rounded-lg focus:outline-none cursor-not-allowed"
                    >
                      {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Reason for Return</label>
                    <textarea
                      required
                      rows={3}
                      disabled={operationMode === 'view'}
                      value={retReason}
                      onChange={(e) => setRetReason(e.target.value)}
                      placeholder="e.g. Broken hardware components or display pixels flickering."
                      className="w-full px-3 py-2 text-sm border border-gray-200 bg-white text-gray-800 rounded-lg focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Supplier Name *</label>
                    <input
                      type="text"
                      required
                      disabled={operationMode === 'view'}
                      value={supName}
                      onChange={(e) => setSupName(e.target.value)}
                      placeholder="e.g. Apex Tech Supply"
                      className="w-full px-3 py-2 text-sm border border-gray-200 bg-white text-gray-800 rounded-lg focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Company *</label>
                    <input
                      type="text"
                      required
                      disabled={operationMode === 'view'}
                      value={supCompany}
                      onChange={(e) => setSupCompany(e.target.value)}
                      placeholder="e.g. Apex Distribution Corp"
                      className="w-full px-3 py-2 text-sm border border-gray-200 bg-white text-gray-800 rounded-lg focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Code *</label>
                      <input
                        type="text"
                        required
                        disabled={operationMode === 'view'}
                        value={supCode}
                        onChange={(e) => setSupCode(e.target.value)}
                        placeholder="e.g. SUP-APEX"
                        className="w-full px-3 py-2 text-sm border border-gray-200 bg-white text-gray-800 rounded-lg focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Phone</label>
                      <input
                        type="text"
                        disabled={operationMode === 'view'}
                        value={supPhone}
                        onChange={(e) => setSupPhone(e.target.value)}
                        placeholder="+1 800-123-112"
                        className="w-full px-3 py-2 text-sm border border-gray-200 bg-white text-gray-800 rounded-lg focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Email</label>
                    <input
                      type="email"
                      disabled={operationMode === 'view'}
                      value={supEmail}
                      onChange={(e) => setSupEmail(e.target.value)}
                      placeholder="e.g. supplies@apex.com"
                      className="w-full px-3 py-2 text-sm border border-gray-200 bg-white text-gray-800 rounded-lg focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                    />
                  </div>
                </>
              )}

              <div className="pt-2 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-200 bg-transparent text-gray-700 hover:bg-gray-100 rounded-lg text-sm transition-colors"
                >
                  {operationMode === 'view' ? 'Close' : 'Cancel'}
                </button>
                {operationMode !== 'view' && (
                  <button
                    type="submit"
                    className="px-4 py-2 bg-black hover:bg-zinc-800 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    {operationMode === 'add' ? 'Save Item' : 'Update Item'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
