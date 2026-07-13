import { useState } from 'react';
import { Purchase, Delivery, PurchaseReturn, Adjustment, Requisition, Product, Employee, Supplier, Permissions } from '../types';
import { ShieldAlert, CheckCircle, XCircle, Clock, ShoppingCart, Truck, RefreshCw, Sliders, FileText, RotateCcw } from 'lucide-react';
import { formatDate } from '../utils';

interface ApprovalViewProps {
  purchases: Purchase[];
  deliveries: Delivery[];
  purchaseReturns: PurchaseReturn[];
  adjustments: Adjustment[];
  requisitions: Requisition[];
  products: Product[];
  employees: Employee[];
  suppliers: Supplier[];
  onApprovePurchase: (id: string, status: 'Approved' | 'Rejected') => void;
  onApproveDelivery: (id: string, status: 'Approved' | 'Rejected') => void;
  onApproveReturn: (id: string, status: 'Received' | 'Rejected') => void;
  onApproveAdjustment: (id: string, status: 'Approved' | 'Rejected') => void;
  onApproveRequisition: (id: string, status: 'Approved' | 'Rejected') => void;
  activeTab: 'purchase' | 'delivery' | 'return' | 'adjustment' | 'requisition';
  onTabChange: (tab: 'purchase' | 'delivery' | 'return' | 'adjustment' | 'requisition') => void;
  userRole?: string;
  permissions?: Permissions;
}

export default function ApprovalView({
  purchases,
  deliveries,
  purchaseReturns,
  adjustments,
  requisitions,
  products,
  employees,
  suppliers,
  onApprovePurchase,
  onApproveDelivery,
  onApproveReturn,
  onApproveAdjustment,
  onApproveRequisition,
  userRole,
  activeTab,
  onTabChange,
}: ApprovalViewProps) {
  const pendingPurchases = purchases.filter(p => p.status === 'Pending');
  const pendingDeliveries = deliveries.filter(d => d.status === 'Pending');
  const pendingReturns = purchaseReturns.filter(r => r.status === 'Pending');
  const pendingAdjustments = adjustments.filter(a => a.status === 'Pending');
  const pendingRequisitions = requisitions.filter(r => r.status === 'Pending');

  const canApprove = userRole === 'Super Admin' || userRole === 'Admin';

  return (
    <div className="space-y-6">
      {/* Role permission notification card */}
      <div className={`p-4 rounded-xl border flex items-center gap-3 ${
        canApprove 
          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-900' 
          : 'bg-amber-500/10 border-amber-500/20 text-amber-900'
      }`}>
        <ShieldAlert className="w-5 h-5 flex-shrink-0" />
        <div className="text-xs">
          <p className="font-semibold">Current Role: {userRole}</p>
          <p className="mt-0.5 text-black dark:text-white">
            {canApprove 
              ? 'Authorized: You can approve or decline ledger requests.' 
              : 'View-Only Status: Approving or rejecting ledger items requires Admin or Super Admin role permissions. Switch roles in the top header.'}
          </p>
        </div>
      </div>

      {/* Grid List layout inside active tab approval queue */}
      <div className="space-y-2.5">
        {activeTab === 'purchase' && (
          pendingPurchases.length === 0 ? (
            <div className="text-center py-12 text-sm text-black dark:text-white">No pending purchases requiring approval.</div>
          ) : (
            pendingPurchases.map((p) => (
              <div key={p.id} className="bg-white p-3 md:p-4 border border-gray-200 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded bg-emerald-500/10 text-emerald-900">
                      <ShoppingCart className="w-3.5 h-3.5" />
                    </span>
                    <h4 className="text-sm font-bold text-black dark:text-white">{p.purchaseOrderNo}</h4>
                    <span className="text-xs px-1.5 py-0.5 bg-gray-200 rounded font-semibold text-black dark:text-white">
                      {suppliers.find(s => s.id === p.supplierId)?.name || 'Supplier'}
                    </span>
                  </div>
                  <p className="text-xs text-black dark:text-white">Total Purchase Value: <span className="font-serif text-emerald-900 dark:text-emerald-100 font-bold">৳{p.totalAmount.toLocaleString('bn-BD')}</span></p>
                  <p className="text-[10px] text-black dark:text-white">Created: {formatDate(p.purchaseDate)}</p>
                </div>
                {canApprove && (
                  <div className="flex gap-2">
                    <button onClick={() => onApprovePurchase(p.id, 'Approved')} className="px-3 py-1.5 bg-emerald-200 hover:bg-emerald-300 text-black dark:text-white rounded text-xs font-semibold flex items-center gap-1 hover:cursor-pointer">
                      <CheckCircle className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button onClick={() => onApprovePurchase(p.id, 'Rejected')} className="px-3 py-1.5 bg-rose-100 text-rose-900 dark:text-rose-100 border border-rose-200 hover:bg-rose-200 rounded text-xs font-semibold flex items-center gap-1 hover:cursor-pointer">
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                )}
              </div>
            ))
          )
        )}

        {activeTab === 'delivery' && (
          pendingDeliveries.length === 0 ? (
            <div className="text-center py-12 text-sm text-black">No pending asset dispatches requiring authorization.</div>
          ) : (
            pendingDeliveries.map((d) => (
              <div key={d.id} className="bg-white p-3 md:p-4 border border-gray-200 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded bg-blue-500/10 text-blue-900">
                      <Truck className="w-3.5 h-3.5" />
                    </span>
                    <h4 className="text-sm font-bold text-black">{d.deliveryNo}</h4>
                    <span className="text-xs px-1.5 py-0.5 bg-gray-200 rounded text-black">
                      To: {Object.values(employees).find(e => e.id === d.handler)?.name || d.handler}
                    </span>
                  </div>
                  <p className="text-xs text-black">Product: {products.find(p => p.id === d.productId)?.name || 'IT equipment'} (Qty: {d.quantity.toLocaleString('bn-BD')})</p>
                  <p className="text-[10px] text-black">Requested: {formatDate(d.deliveryDate)}</p>
                </div>
                {canApprove && (
                  <div className="flex gap-2">
                    <button onClick={() => onApproveDelivery(d.id, 'Approved')} className="px-3 py-1.5 bg-emerald-200 hover:bg-emerald-300 text-black rounded text-xs font-semibold flex items-center gap-1 hover:cursor-pointer">
                      <CheckCircle className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button onClick={() => onApproveDelivery(d.id, 'Rejected')} className="px-3 py-1.5 bg-rose-100 text-rose-900 border border-rose-200 hover:bg-rose-200 rounded text-xs font-semibold flex items-center gap-1 hover:cursor-pointer">
                      <XCircle className="w-3.5 h-3.5" /> Decline
                    </button>
                  </div>
                )}
              </div>
            ))
          )
        )}

        {activeTab === 'return' && (
          pendingReturns.length === 0 ? (
            <div className="text-center py-12 text-sm text-black">No pending return shipments to receive.</div>
          ) : (
            pendingReturns.map((r) => {
              const prodName = products.find(p => p.id === r.productId)?.name || 'Product';
              const supName = suppliers.find(s => s.id === r.supplierId)?.name || 'Supplier';
              return (
                <div key={r.id} className="bg-white p-3 md:p-4 border border-gray-200 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="p-1 rounded bg-orange-500/10 text-orange-900">
                        <RefreshCw className="w-3.5 h-3.5" />
                      </span>
                      <h4 className="text-sm font-bold text-black">{r.returnNo}</h4>
                      <span className="text-xs text-rose-900 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-100">Refund: ৳{r.refundAmount.toLocaleString('bn-BD')}</span>
                    </div>
                    <div className="text-xs text-zinc-600 font-medium">
                      Returned Product: <span className="font-semibold text-zinc-900">{prodName}</span> (Qty: <span className="font-bold text-zinc-900">{r.quantity || 1}</span>)
                    </div>
                    <div className="text-xs text-zinc-500">
                      Supplier: <span className="font-semibold">{supName}</span> | Date: {formatDate(r.returnDate)}
                    </div>
                    <p className="text-xs text-black italic">Reason: {r.reason}</p>
                  </div>
                  {canApprove && (
                    <div className="flex gap-2">
                      <button onClick={() => onApproveReturn(r.id, 'Received')} className="px-3 py-1.5 bg-emerald-200 hover:bg-emerald-300 text-black rounded text-xs font-semibold flex items-center gap-1 hover:cursor-pointer">
                        <CheckCircle className="w-3.5 h-3.5" /> Receive
                      </button>
                      <button onClick={() => onApproveReturn(r.id, 'Rejected')} className="px-3 py-1.5 bg-rose-100 text-rose-900 border border-rose-200 hover:bg-rose-200 rounded text-xs font-semibold flex items-center gap-1 hover:cursor-pointer">
                        <XCircle className="w-3.5 h-3.5" /> Void
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )
        )}

        {activeTab === 'adjustment' && (
          pendingAdjustments.length === 0 ? (
            <div className="text-center py-12 text-sm text-black">No pending stock adjustments.</div>
          ) : (
            pendingAdjustments.map((a) => (
              <div key={a.id} className="bg-white p-3 md:p-4 border border-gray-200 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded bg-amber-500/10 text-amber-900">
                      <Sliders className="w-3.5 h-3.5" />
                    </span>
                    <h4 className="text-sm font-bold text-black">{a.referenceNo}</h4>
                    <span className="text-xs px-1.5 py-0.5 bg-gray-200 rounded text-black font-mono">
                      {a.type} {a.quantity.toLocaleString('bn-BD')} Pcs
                    </span>
                  </div>
                  <p className="text-xs text-black">Item: {products.find(p => p.id === a.productId)?.name || 'Hardware'}</p>
                  <p className="text-xs text-black">Justification: {a.reason}</p>
                </div>
                {canApprove && (
                  <div className="flex gap-2">
                    <button onClick={() => onApproveAdjustment(a.id, 'Approved')} className="px-3 py-1.5 bg-emerald-200 hover:bg-emerald-300 text-black rounded text-xs font-semibold flex items-center gap-1 hover:cursor-pointer">
                      <CheckCircle className="w-3.5 h-3.5" /> Approve Impact
                    </button>
                    <button onClick={() => onApproveAdjustment(a.id, 'Rejected')} className="px-3 py-1.5 bg-rose-100 text-rose-900 border border-rose-200 hover:bg-rose-200 rounded text-xs font-semibold flex items-center gap-1 hover:cursor-pointer">
                      <XCircle className="w-3.5 h-3.5" /> Dismiss
                    </button>
                  </div>
                )}
              </div>
            ))
          )
        )}

        {activeTab === 'requisition' && (
          pendingRequisitions.length === 0 ? (
            <div className="text-center py-12 text-sm text-black">No equipment or laptop requisitions currently in review.</div>
          ) : (
            pendingRequisitions.map((req) => (
              <div key={req.id} className="bg-white p-3 md:p-4 border border-gray-200 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded bg-indigo-500/10 text-indigo-900">
                      <FileText className="w-3.5 h-3.5" />
                    </span>
                    <h4 className="text-sm font-bold text-black">Requisition Request</h4>
                    <span className="text-xs px-1.5 py-0.5 bg-gray-200 rounded font-semibold text-black">
                      By: {employees.find(e => e.id === req.employeeId)?.name || 'Employee'}
                    </span>
                  </div>
                  <p className="text-xs text-black">Required: {products.find(p => p.id === req.productId)?.name || 'Device'} (Qty: {req.quantity.toLocaleString('bn-BD')})</p>
                  <p className="text-xs text-black">Business Case: {req.reason}</p>
                </div>
                {canApprove && (
                  <div className="flex gap-2">
                    <button onClick={() => onApproveRequisition(req.id, 'Approved')} className="px-3 py-1.5 bg-emerald-200 hover:bg-emerald-300 text-black rounded text-xs font-semibold flex items-center gap-1 hover:cursor-pointer">
                      <CheckCircle className="w-3.5 h-3.5" /> Authorize
                    </button>
                    <button onClick={() => onApproveRequisition(req.id, 'Rejected')} className="px-3 py-1.5 bg-rose-100 text-rose-900 border border-rose-200 hover:bg-rose-200 rounded text-xs font-semibold flex items-center gap-1 hover:cursor-pointer">
                      <XCircle className="w-3.5 h-3.5" /> Decline
                    </button>
                  </div>
                )}
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
}
