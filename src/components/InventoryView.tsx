import React, { useState, useRef } from 'react';
import { Delivery, SellRecord, Adjustment, InternalTransfer, Product, Branch, Permissions, Employee } from '../types';
import { Plus, Search, Truck, ShoppingBag, Sliders, RefreshCw, Send, CheckCircle, Clock, Trash2, FileSpreadsheet, FileUp, Eye, Pencil, RotateCcw } from 'lucide-react';
import * as XLSX from 'xlsx';
import { formatDate } from '../utils';

interface InventoryViewProps {
  deliveries: Delivery[];
  sells: SellRecord[];
  adjustments: Adjustment[];
  transfers: InternalTransfer[];
  products: Product[];
  branches: Branch[];
  employees: Employee[];
  onAddDelivery: (deliv: Omit<Delivery, 'id' | 'status'>) => void;
  onUpdateDelivery: (id: string, updates: Partial<Omit<Delivery, 'id'>>) => void;
  onDeleteDelivery: (id: string) => void;
  onAddSell: (sale: Omit<SellRecord, 'id'>) => void;
  onUpdateSell: (id: string, updates: Partial<Omit<SellRecord, 'id'>>) => void;
  onDeleteSell: (id: string) => void;
  onAddAdjustment: (adj: Omit<Adjustment, 'id' | 'status'>) => void;
  onUpdateAdjustment: (id: string, updates: Partial<Omit<Adjustment, 'id'>>) => void;
  onDeleteAdjustment: (id: string) => void;
  onAddTransfer: (trans: Omit<InternalTransfer, 'id'>) => void;
  onUpdateTransfer: (id: string, updates: Partial<Omit<InternalTransfer, 'id'>>) => void;
  onDeleteTransfer: (id: string) => void;
  userRole?: string;
  permissions?: Permissions;
  searchTerm: string;
}

export default function InventoryView({
  deliveries,
  sells,
  adjustments,
  transfers,
  products,
  branches,
  employees,
  onAddDelivery,
  onUpdateDelivery,
  onDeleteDelivery,
  onAddSell,
  onUpdateSell,
  onDeleteSell,
  onAddAdjustment,
  onUpdateAdjustment,
  onDeleteAdjustment,
  onAddTransfer,
  onUpdateTransfer,
  onDeleteTransfer,
  searchTerm,
}: InventoryViewProps) {
  const [activeTab, setActiveTab] = useState<'deliveries' | 'sell' | 'adjustments' | 'transfers'>('deliveries');
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [operationMode, setOperationMode] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form Fields
  const [delBranch, setDelBranch] = useState('');
  const [delProduct, setDelProduct] = useState('');
  const [delQty, setDelQty] = useState(1);
  const [delHandler, setDelHandler] = useState('');

  const [saleProduct, setSaleProduct] = useState('');
  const [saleCustomer, setSaleCustomer] = useState('');
  const [saleQty, setSaleQty] = useState(1);
  const [salePrice, setSalePrice] = useState(0);

  const [adjProduct, setAdjProduct] = useState('');
  const [adjType, setAdjType] = useState<'Addition' | 'Deduction'>('Addition');
  const [adjQty, setAdjQty] = useState(1);
  const [adjReason, setAdjReason] = useState('');

  const [transFrom, setTransFrom] = useState('');
  const [transTo, setTransTo] = useState('');
  const [transProduct, setTransProduct] = useState('');
  const [transQty, setTransQty] = useState(1);

  const filteredDeliveries = deliveries.filter(d =>
    d.deliveryNo.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
    d.handler.toLowerCase().includes(localSearchTerm.toLowerCase())
  );

  const filteredSells = sells.filter(s =>
    s.saleNo.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
    s.customerName.toLowerCase().includes(localSearchTerm.toLowerCase())
  );

  const filteredAdjustments = adjustments.filter(a =>
    a.referenceNo.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
    a.reason.toLowerCase().includes(localSearchTerm.toLowerCase())
  );

  const filteredTransfers = transfers.filter(t =>
    t.transferNo.toLowerCase().includes(localSearchTerm.toLowerCase())
  );

  const handleOpenAddModal = () => {
    setOperationMode('add');
    setSelectedId(null);
    if (branches.length > 0) {
      setDelBranch(branches[0].id);
      setTransFrom(branches[0].id);
      setTransTo(branches[1]?.id || branches[0].id);
    }
    if (products.length > 0) {
      setDelProduct(products[0].id);
      setSaleProduct(products[0].id);
      setAdjProduct(products[0].id);
      setTransProduct(products[0].id);
    }
    setShowAddModal(true);
  };

  const handleOpenEditDelivery = (d: Delivery) => {
    setActiveTab('deliveries');
    setOperationMode('edit');
    setSelectedId(d.id);
    setDelBranch(d.branchId);
    setDelProduct(d.productId);
    setDelQty(d.quantity);
    setDelHandler(d.handler);
    setShowAddModal(true);
  };

  const handleOpenViewDelivery = (d: Delivery) => {
    setActiveTab('deliveries');
    setOperationMode('view');
    setSelectedId(d.id);
    setDelBranch(d.branchId);
    setDelProduct(d.productId);
    setDelQty(d.quantity);
    setDelHandler(d.handler);
    setShowAddModal(true);
  };

  const handleOpenEditSell = (s: SellRecord) => {
    setActiveTab('sell');
    setOperationMode('edit');
    setSelectedId(s.id);
    setSaleProduct(s.productId);
    setSaleCustomer(s.customerName);
    setSaleQty(s.quantity);
    setSalePrice(s.totalAmount / s.quantity);
    setShowAddModal(true);
  };

  const handleOpenViewSell = (s: SellRecord) => {
    setActiveTab('sell');
    setOperationMode('view');
    setSelectedId(s.id);
    setSaleProduct(s.productId);
    setSaleCustomer(s.customerName);
    setSaleQty(s.quantity);
    setSalePrice(s.totalAmount / s.quantity);
    setShowAddModal(true);
  };

  const handleOpenEditAdjustment = (a: Adjustment) => {
    setActiveTab('adjustments');
    setOperationMode('edit');
    setSelectedId(a.id);
    setAdjProduct(a.productId);
    setAdjType(a.type);
    setAdjQty(a.quantity);
    setAdjReason(a.reason);
    setShowAddModal(true);
  };

  const handleOpenViewAdjustment = (a: Adjustment) => {
    setActiveTab('adjustments');
    setOperationMode('view');
    setSelectedId(a.id);
    setAdjProduct(a.productId);
    setAdjType(a.type);
    setAdjQty(a.quantity);
    setAdjReason(a.reason);
    setShowAddModal(true);
  };

  const handleOpenEditTransfer = (t: InternalTransfer) => {
    setActiveTab('transfers');
    setOperationMode('edit');
    setSelectedId(t.id);
    setTransFrom(t.fromBranchId);
    setTransTo(t.toBranchId);
    setTransProduct(t.productId);
    setTransQty(t.quantity);
    setShowAddModal(true);
  };

  const handleOpenViewTransfer = (t: InternalTransfer) => {
    setActiveTab('transfers');
    setOperationMode('view');
    setSelectedId(t.id);
    setTransFrom(t.fromBranchId);
    setTransTo(t.toBranchId);
    setTransProduct(t.productId);
    setTransQty(t.quantity);
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'deliveries') {
      if (!delBranch || !delProduct) return;
      if (operationMode === 'add') {
        const deliveryNo = `DN-2026-0${Math.floor(Math.random() * 900) + 100}`;
        onAddDelivery({
          deliveryNo,
          branchId: delBranch,
          productId: delProduct,
          quantity: delQty,
          deliveryDate: new Date().toISOString().split('T')[0],
          handler: delHandler || 'Asset Lead',
        });
      } else if (operationMode === 'edit' && selectedId) {
        onUpdateDelivery(selectedId, {
          branchId: delBranch,
          productId: delProduct,
          quantity: delQty,
          handler: delHandler
        });
      }
      setDelQty(1);
      setDelHandler('');
    } else if (activeTab === 'sell') {
      if (!saleProduct) return;
      if (operationMode === 'add') {
        const saleNo = `SO-2026-0${Math.floor(Math.random() * 900) + 100}`;
        onAddSell({
          saleNo,
          productId: saleProduct,
          customerName: saleCustomer || 'Walk-in Client',
          quantity: saleQty,
          totalAmount: saleQty * salePrice,
          saleDate: new Date().toISOString().split('T')[0],
        });
      } else if (operationMode === 'edit' && selectedId) {
        onUpdateSell(selectedId, {
          productId: saleProduct,
          customerName: saleCustomer,
          quantity: saleQty,
          totalAmount: saleQty * salePrice
        });
      }
      setSaleCustomer('');
      setSaleQty(1);
      setSalePrice(0);
    } else if (activeTab === 'adjustments') {
      if (!adjProduct) return;
      if (operationMode === 'add') {
        const referenceNo = `ADJ-2026-0${Math.floor(Math.random() * 900) + 100}`;
        onAddAdjustment({
          referenceNo,
          productId: adjProduct,
          type: adjType,
          quantity: adjQty,
          reason: adjReason || 'Routine equipment cycle update.',
          date: new Date().toISOString().split('T')[0],
        });
      } else if (operationMode === 'edit' && selectedId) {
        onUpdateAdjustment(selectedId, {
          productId: adjProduct,
          type: adjType,
          quantity: adjQty,
          reason: adjReason
        });
      }
      setAdjQty(1);
      setAdjReason('');
    } else if (activeTab === 'transfers') {
      if (!transFrom || !transTo || !transProduct) return;
      if (operationMode === 'add') {
        const transferNo = `TR-2026-0${Math.floor(Math.random() * 900) + 100}`;
        onAddTransfer({
          transferNo,
          fromBranchId: transFrom,
          toBranchId: transTo,
          productId: transProduct,
          quantity: transQty,
          date: new Date().toISOString().split('T')[0],
          status: 'Transferred',
        });
      } else if (operationMode === 'edit' && selectedId) {
        onUpdateTransfer(selectedId, {
          fromBranchId: transFrom,
          toBranchId: transTo,
          productId: transProduct,
          quantity: transQty
        });
      }
      setTransQty(1);
    }
    setShowAddModal(false);
  };

  const handleExportXlsx = () => {
    let data: any[] = [];
    let sheetName = 'Inventory';
    let filename = 'inventory.xlsx';

    if (activeTab === 'deliveries') {
        data = deliveries.map(d => ({ 'Delivery No': d.deliveryNo, 'Branch ID': d.branchId, 'Product ID': d.productId, 'Quantity': d.quantity, 'Status': d.status }));
        sheetName = 'Deliveries';
        filename = 'deliveries.xlsx';
    } else if (activeTab === 'sell') {
        data = sells.map(s => ({ 'Sale No': s.saleNo, 'Customer': s.customerName, 'Product ID': s.productId, 'Quantity': s.quantity, 'Amount': s.totalAmount }));
        sheetName = 'Sales';
        filename = 'sales.xlsx';
    } else if (activeTab === 'adjustments') {
        data = adjustments.map(a => ({ 'Adjustment No': a.referenceNo, 'Product ID': a.productId, 'Quantity': a.quantity, 'Reason': a.reason, 'Status': a.status }));
        sheetName = 'Adjustments';
        filename = 'adjustments.xlsx';
    } else if (activeTab === 'transfers') {
        data = transfers.map(t => ({ 'Transfer No': t.transferNo, 'From Branch': t.fromBranchId, 'To Branch': t.toBranchId, 'Product ID': t.productId, 'Quantity': t.quantity }));
        sheetName = 'Transfers';
        filename = 'transfers.xlsx';
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, filename);
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

      if (activeTab === 'deliveries') {
        json.forEach(row => {
            if (row['Delivery No'] && row['Branch ID']) {
                onAddDelivery({
                    deliveryNo: row['Delivery No'],
                    branchId: row['Branch ID'],
                    productId: row['Product ID'],
                    quantity: parseInt(row['Quantity']) || 1,
                    deliveryDate: new Date().toISOString().split('T')[0],
                    handler: 'Imported',
                });
            }
        });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="space-y-6">

      {/* Tabs Switcher */}
      <div className="flex flex-row flex-wrap border-b border-gray-200 gap-1 pb-px">
        {(['deliveries', 'sell', 'adjustments', 'transfers'] as const).map((tab) => {
          const labels: Record<string, string> = {
            deliveries: 'Dispatch / Deliveries',
            sell: 'Asset Sells',
            adjustments: 'Stock Adjustments',
            transfers: 'Internal Transfers'
          };
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs md:text-sm font-semibold border-b-2 transition-all duration-150 hover:cursor-pointer -mb-px ${
                isActive
                  ? 'border-emerald-500 text-emerald-600 font-bold'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {labels[tab]}
            </button>
          );
        })}
      </div>

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
            className="flex items-center gap-1.5 bg-black hover:bg-zinc-900 transition-all text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" /> Export XLSX
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 bg-black hover:bg-zinc-900 transition-all text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:cursor-pointer"
          >
            <FileUp className="w-3.5 h-3.5" /> Import XLSX
          </button>
          <input type="file" ref={fileInputRef} onChange={handleImportXlsx} className="hidden" accept=".xlsx" />
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 bg-black hover:bg-zinc-900 transition-all text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add {activeTab === 'deliveries' ? 'Dispatch' : activeTab === 'sell' ? 'Sale' : activeTab === 'adjustments' ? 'Adjustment' : 'Transfer'}
          </button>
        </div>
      </div>

      {/* Deliveries lists */}
      {activeTab === 'deliveries' && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50 text-xs uppercase text-gray-500 dark:text-gray-400 tracking-wider">
                <th className="px-6 py-3 font-semibold">Delivery Order</th>
                <th className="px-6 py-3 font-semibold">Target Branch</th>
                <th className="px-6 py-3 font-semibold">Asset Product</th>
                <th className="px-6 py-3 font-semibold text-center">Quantity</th>
                <th className="px-6 py-3 font-semibold">Dispatch Date</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-sm text-black dark:text-white">
              {filteredDeliveries.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-semibold text-gray-900 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-emerald-500" />
                    {d.deliveryNo}
                  </td>
                  <td className="px-6 py-4 text-zinc-600">
                    {branches.find(b => b.id === d.branchId)?.name || 'Custom Office'}
                  </td>
                  <td className="px-6 py-4 font-medium">
                    {products.find(p => p.id === d.productId)?.name || 'Item'}
                  </td>
                  <td className="px-6 py-4 text-center font-semibold text-zinc-800">{d.quantity.toLocaleString('bn-BD')}</td>
                  <td className="px-6 py-4 text-xs text-zinc-500">{formatDate(d.deliveryDate)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      d.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500' :
                      d.status === 'Rejected' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'
                    }`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleOpenViewDelivery(d)}
                      className="p-1.5 text-emerald-500 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors inline-flex items-center justify-center hover:cursor-pointer mr-1"
                      title="View Delivery"
                    >
                      <Eye className="w-4 h-4 text-[#00FF00]" />
                    </button>
                    <button
                      onClick={() => handleOpenEditDelivery(d)}
                      className="p-1.5 text-yellow-500 hover:text-yellow-600 rounded-lg hover:bg-yellow-50 transition-colors inline-flex items-center justify-center hover:cursor-pointer mr-1"
                      title="Edit Delivery"
                    >
                      <Pencil className="w-4 h-4 text-[#FFFF00]" />
                    </button>
                    <button
                      onClick={() => onDeleteDelivery(d.id)}
                      className="p-1.5 text-red-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors inline-flex items-center justify-center hover:cursor-pointer"
                      title="Delete Delivery Order"
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

      {/* Sell tab */}
      {activeTab === 'sell' && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50 text-xs uppercase text-gray-500 dark:text-gray-400 tracking-wider">
                <th className="px-6 py-3 font-semibold">Sale Order #</th>
                <th className="px-6 py-3 font-semibold">Asset Retired/Sold</th>
                <th className="px-6 py-3 font-semibold">Customer / Partner</th>
                <th className="px-6 py-3 font-semibold text-center">Quantity</th>
                <th className="px-6 py-3 font-semibold">Date</th>
                <th className="px-6 py-3 font-semibold text-right">Total Income</th>
                <th className="px-6 py-3 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-sm text-black dark:text-white">
              {filteredSells.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-semibold text-gray-900 flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-emerald-500" />
                    {s.saleNo}
                  </td>
                  <td className="px-6 py-4 text-zinc-700">
                    {products.find(p => p.id === s.productId)?.name || 'Commodity asset'}
                  </td>
                  <td className="px-6 py-4 text-xs text-zinc-500">{s.customerName}</td>
                  <td className="px-6 py-4 text-center">{s.quantity.toLocaleString('bn-BD')}</td>
                  <td className="px-6 py-4 text-xs text-zinc-500">{formatDate(s.saleDate)}</td>
                  <td className="px-6 py-4 text-right font-bold text-emerald-600">
                    ৳{s.totalAmount.toLocaleString('bn-BD')}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleOpenViewSell(s)}
                      className="p-1.5 text-emerald-500 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors inline-flex items-center justify-center hover:cursor-pointer mr-1"
                      title="View Sale"
                    >
                      <Eye className="w-4 h-4 text-[#00FF00]" />
                    </button>
                    <button
                      onClick={() => handleOpenEditSell(s)}
                      className="p-1.5 text-yellow-500 hover:text-yellow-600 rounded-lg hover:bg-yellow-50 transition-colors inline-flex items-center justify-center hover:cursor-pointer mr-1"
                      title="Edit Sale"
                    >
                      <Pencil className="w-4 h-4 text-[#FFFF00]" />
                    </button>
                    <button
                      onClick={() => onDeleteSell(s.id)}
                      className="p-1.5 text-red-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors inline-flex items-center justify-center hover:cursor-pointer"
                      title="Delete Sale Record"
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

      {/* Adjustments lists */}
      {activeTab === 'adjustments' && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50 text-xs uppercase text-gray-500 dark:text-gray-400 tracking-wider">
                <th className="px-6 py-3 font-semibold">Reference</th>
                <th className="px-6 py-3 font-semibold">Product</th>
                <th className="px-6 py-3 font-semibold">Type</th>
                <th className="px-6 py-3 font-semibold text-center">Stock Shift Qty</th>
                <th className="px-6 py-3 font-semibold">Reason</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-sm text-black dark:text-white">
              {filteredAdjustments.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-semibold text-gray-900 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-amber-500" />
                    {a.referenceNo}
                  </td>
                  <td className="px-6 py-4 font-medium">{products.find(p => p.id === a.productId)?.name || 'Custom Gear'}</td>
                  <td className="px-6 py-4 text-xs">
                    <span className={`px-2 py-0.5 rounded font-mono ${
                      a.type === 'Addition' ? 'bg-emerald-500/15 text-emerald-500' : 'bg-rose-500/15 text-rose-500'
                    }`}>
                      {a.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center font-bold">{a.quantity.toLocaleString('bn-BD')} Units</td>
                  <td className="px-6 py-4 text-xs text-zinc-500 max-w-xs">{a.reason}</td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-semibold">{a.status}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleOpenViewAdjustment(a)}
                      className="p-1.5 text-emerald-500 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors inline-flex items-center justify-center hover:cursor-pointer mr-1"
                      title="View Adjustment"
                    >
                      <Eye className="w-4 h-4 text-[#00FF00]" />
                    </button>
                    <button
                      onClick={() => handleOpenEditAdjustment(a)}
                      className="p-1.5 text-yellow-500 hover:text-yellow-600 rounded-lg hover:bg-yellow-50 transition-colors inline-flex items-center justify-center hover:cursor-pointer mr-1"
                      title="Edit Adjustment"
                    >
                      <Pencil className="w-4 h-4 text-[#FFFF00]" />
                    </button>
                    <button
                      onClick={() => onDeleteAdjustment(a.id)}
                      className="p-1.5 text-red-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors inline-flex items-center justify-center hover:cursor-pointer"
                      title="Delete Adjustment"
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

      {/* Internal Transfers list */}
      {activeTab === 'transfers' && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50 text-xs uppercase text-gray-500 dark:text-gray-400 tracking-wider">
                <th className="px-6 py-3 font-semibold">Transfer Ref</th>
                <th className="px-6 py-3 font-semibold">From Branch</th>
                <th className="px-6 py-3 font-semibold">To Branch</th>
                <th className="px-6 py-3 font-semibold">Asset Product</th>
                <th className="px-6 py-3 font-semibold text-center">Quantity</th>
                <th className="px-6 py-3 font-semibold text-right">Transfer Date</th>
                <th className="px-6 py-3 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-sm text-black dark:text-white">
              {filteredTransfers.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-semibold text-gray-900 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-indigo-500" />
                    {t.transferNo}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{branches.find(b => b.id === t.fromBranchId)?.name || 'Source'}</td>
                  <td className="px-6 py-4 text-gray-600">{branches.find(b => b.id === t.toBranchId)?.name || 'Dest'}</td>
                  <td className="px-6 py-4 font-semibold text-gray-900">{products.find(p => p.id === t.productId)?.name || 'Gear'}</td>
                  <td className="px-6 py-4 text-center font-bold">{t.quantity.toLocaleString('bn-BD')}</td>
                  <td className="px-6 py-4 text-right text-xs text-zinc-500">{formatDate(t.date)}</td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleOpenViewTransfer(t)}
                      className="p-1.5 text-emerald-500 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors inline-flex items-center justify-center hover:cursor-pointer mr-1"
                      title="View Transfer"
                    >
                      <Eye className="w-4 h-4 text-[#00FF00]" />
                    </button>
                    <button
                      onClick={() => handleOpenEditTransfer(t)}
                      className="p-1.5 text-yellow-500 hover:text-yellow-600 rounded-lg hover:bg-yellow-50 transition-colors inline-flex items-center justify-center hover:cursor-pointer mr-1"
                      title="Edit Transfer"
                    >
                      <Pencil className="w-4 h-4 text-[#FFFF00]" />
                    </button>
                    <button
                      onClick={() => onDeleteTransfer(t.id)}
                      className="p-1.5 text-red-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors inline-flex items-center justify-center hover:cursor-pointer"
                      title="Delete Internal Transfer"
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

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-xl border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">
                {operationMode === 'view' ? 'View' : operationMode === 'edit' ? 'Edit' : 'Log'} {activeTab === 'deliveries' ? 'Dispatch Delivery' : activeTab === 'sell' ? 'Asset Sale' : activeTab === 'adjustments' ? 'Stock Adjustment' : 'Internal Transfer'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <Plus className="w-5 h-5 text-gray-500 rotate-45" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {activeTab === 'deliveries' ? (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Target Branch *</label>
                    <select
                      disabled={operationMode === 'view'}
                      value={delBranch}
                      onChange={(e) => setDelBranch(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 bg-white text-gray-800 rounded-lg focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Product Asset *</label>
                    <select
                      disabled={operationMode === 'view'}
                      value={delProduct}
                      onChange={(e) => setDelProduct(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 bg-white text-gray-800 rounded-lg focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {products.map(p => <option key={p.id} value={p.id}>{p.name} (In stock: {p.quantity.toLocaleString('bn-BD')})</option>)}
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
                        value={delQty}
                        onChange={(e) => setDelQty(parseInt(e.target.value))}
                        className="w-full px-3 py-2 text-sm border border-gray-200 bg-white text-gray-800 rounded-lg focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Custodian/Handler</label>
                      <input
                        type="text"
                        disabled={operationMode === 'view'}
                        value={delHandler}
                        onChange={(e) => setDelHandler(e.target.value)}
                        placeholder="e.g. Marcus Aurelius"
                        className="w-full px-3 py-2 text-sm border border-gray-200 bg-white text-gray-800 rounded-lg focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                </>
              ) : activeTab === 'sell' ? (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Asset Sold *</label>
                    <select
                      disabled={operationMode === 'view'}
                      value={saleProduct}
                      onChange={(e) => setSaleProduct(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 bg-white text-gray-800 rounded-lg focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Customer / Partner Name</label>
                    <input
                      type="text"
                      disabled={operationMode === 'view'}
                      value={saleCustomer}
                      onChange={(e) => setSaleCustomer(e.target.value)}
                      placeholder="e.g. Apex Corp"
                      className="w-full px-3 py-2 text-sm border border-gray-200 bg-white text-gray-800 rounded-lg focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        required
                        disabled={operationMode === 'view'}
                        value={saleQty}
                        onChange={(e) => setSaleQty(parseInt(e.target.value))}
                        className="w-full px-3 py-2 text-sm border border-gray-200 bg-white text-gray-800 rounded-lg focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Price Per Unit Sold ($)</label>
                      <input
                        type="number"
                        min="1"
                        required
                        disabled={operationMode === 'view'}
                        value={salePrice}
                        onChange={(e) => setSalePrice(parseInt(e.target.value))}
                        className="w-full px-3 py-2 text-sm border border-gray-200 bg-white text-gray-800 rounded-lg focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                </>
              ) : activeTab === 'adjustments' ? (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Target Product *</label>
                    <select
                      disabled={operationMode === 'view'}
                      value={adjProduct}
                      onChange={(e) => setAdjProduct(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 bg-white text-gray-800 rounded-lg focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Adjustment Type *</label>
                      <select
                        disabled={operationMode === 'view'}
                        value={adjType}
                        onChange={(e) => setAdjType(e.target.value as any)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 bg-white text-gray-800 rounded-lg focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        <option value="Addition">Addition (Stock surplus / audit add)</option>
                        <option value="Deduction">Deduction (Decommission / damage)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Quantity Impacted</label>
                      <input
                        type="number"
                        min="1"
                        required
                        disabled={operationMode === 'view'}
                        value={adjQty}
                        onChange={(e) => setAdjQty(parseInt(e.target.value))}
                        className="w-full px-3 py-2 text-sm border border-gray-200 bg-white text-gray-800 rounded-lg focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Adjustment Reason *</label>
                    <textarea
                      required
                      rows={2}
                      disabled={operationMode === 'view'}
                      value={adjReason}
                      onChange={(e) => setAdjReason(e.target.value)}
                      placeholder="Specify reason, for safety compliance auditing..."
                      className="w-full px-3 py-2 text-sm border border-gray-200 bg-white text-gray-800 rounded-lg focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">From Branch *</label>
                      <select
                        disabled={operationMode === 'view'}
                        value={transFrom}
                        onChange={(e) => setTransFrom(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 bg-white text-gray-800 rounded-lg focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">To Branch *</label>
                      <select
                        disabled={operationMode === 'view'}
                        value={transTo}
                        onChange={(e) => setTransTo(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 bg-white text-gray-800 rounded-lg focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {branches.map(b => b.id !== transFrom && <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Product Asset *</label>
                    <select
                      disabled={operationMode === 'view'}
                      value={transProduct}
                      onChange={(e) => setTransProduct(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 bg-white text-gray-800 rounded-lg focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Transfer Quantity</label>
                    <input
                      type="number"
                      min="1"
                      required
                      disabled={operationMode === 'view'}
                      value={transQty}
                      onChange={(e) => setTransQty(parseInt(e.target.value))}
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
