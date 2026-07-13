import { useState } from 'react';
import { Purchase, Delivery, Branch, Product, Adjustment, CashTransaction, Supplier, Permissions } from '../types';
import { FileText, Printer, Download, BarChart2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ReportPieChart from './ReportPieChart';
import { formatDate } from '../utils';

interface ReportViewProps {
  purchases: Purchase[];
  deliveries: Delivery[];
  branches: Branch[];
  products: Product[];
  adjustments: Adjustment[];
  cashTransactions: CashTransaction[];
  suppliers: Supplier[];
  userRole?: string;
  permissions?: Permissions;
  activeTab?: 'purchase' | 'delivery' | 'branch_stock' | 'current_stock' | 'adjustment' | 'cash_book';
  onTabChange?: (tab: 'purchase' | 'delivery' | 'branch_stock' | 'current_stock' | 'adjustment' | 'cash_book') => void;
}

export default function ReportView({
  purchases,
  deliveries,
  branches,
  products,
  adjustments,
  cashTransactions,
  suppliers,
  activeTab,
  onTabChange,
}: ReportViewProps) {
  const [localActiveReport, setLocalActiveReport] = useState<'purchase' | 'delivery' | 'branch_stock' | 'current_stock' | 'adjustment' | 'cash_book'>('purchase');

  const activeReport = activeTab || localActiveReport;
  const setActiveReport = onTabChange || setLocalActiveReport;

  // Print helper
  const handlePrint = () => {
    window.print();
  };

  // PDF Export helper
  const handleExportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.setTextColor(40, 40, 40);

    let title = '';
    let head: string[][] = [];
    let body: (string | number)[][] = [];

    if (activeReport === 'purchase') {
      title = 'Purchase Order Analysis Report';
      head = [['Purchase Order Ref', 'Supplier Partner', 'Date Post', 'Status', 'Total Spends']];
      body = purchases.map(p => [
        p.purchaseOrderNo,
        suppliers.find(s => s.id === p.supplierId)?.name || 'Bulk Distribution',
        p.purchaseDate,
        p.status,
        `৳${p.totalAmount.toLocaleString('bn-BD')}`
      ]);
    } else if (activeReport === 'delivery') {
      title = 'Asset Delivery & Dispatch Report';
      head = [['Delivery Note', 'Destination Branch', 'Handler Staff', 'Date Dispatched', 'Volume Qty']];
      body = deliveries.map(d => [
        d.deliveryNo,
        branches.find(b => b.id === d.branchId)?.name || 'Branch',
        d.handler,
        d.deliveryDate,
        `${d.quantity} Units`
      ]);
    } else if (activeReport === 'branch_stock') {
      title = 'Branch Stock Allocations Report';
      head = [['Branch Code', 'Branch Name', 'Operating Location', 'Assigned Assets', 'Valuation']];
      body = branches.map(b => {
        const branchDeliveries = deliveries.filter(d => d.branchId === b.id && d.status === 'Approved');
        const totalUnits = branchDeliveries.reduce((sum, d) => sum + d.quantity, 0);
        const estimatedValuation = branchDeliveries.reduce((sum, d) => sum + (d.quantity * 1600), 0);
        return [b.code, b.name, b.location, `${totalUnits} units`, `৳${estimatedValuation.toLocaleString('bn-BD')}`];
      });
    } else if (activeReport === 'current_stock') {
      title = 'Current Stock & Valuation Ledger Report';
      head = [['Product Name', 'Unit of Measure', 'In-Stock Reserve', 'Book Value', 'Total Equity Valuation']];
      body = products.map(p => [
        p.name,
        'Pcs',
        `${p.quantity.toLocaleString('bn-BD')} Units`,
        `৳${p.unitPrice.toLocaleString('bn-BD')}`,
        `৳${(p.quantity * p.unitPrice).toLocaleString('bn-BD')}`
      ]);
    } else if (activeReport === 'adjustment') {
      title = 'Asset Inventory Adjustments Analysis Report';
      head = [['Reference Ref', 'Product Impacted', 'Adjustment Mode', 'Amount Shift', 'Audit Reason']];
      body = adjustments.map(a => [
        a.referenceNo,
        products.find(p => p.id === a.productId)?.name || 'Device',
        a.type,
        `${a.quantity} Units`,
        a.reason
      ]);
    } else if (activeReport === 'cash_book') {
      title = 'Unified Cash Book Report';
      head = [['Voucher No', 'Ledger Group', 'Associate Party', 'Explanation', 'Cash Out', 'Cash In']];
      body = cashTransactions.map(t => [
        t.voucherNo,
        t.category,
        t.partyName,
        t.description,
        t.type === 'Payment' ? `-৳${t.amount.toLocaleString('bn-BD')}` : '-',
        t.type === 'Receipt' ? `+৳${t.amount.toLocaleString('bn-BD')}` : '-'
      ]);
    }

    doc.text(title, 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 14, 28);

    autoTable(doc, {
      startY: 35,
      head: head,
      body: body,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129] },
      styles: { fontSize: 9, cellPadding: 3 },
    });

    doc.save(`${activeReport}_summary_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Report Tools header */}
      <div className="no-print flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <FileText className="w-4 h-4 text-emerald-500" />
          <span>Generating real-time ledger records. Target: System Auditor</span>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExportPDF} className="flex items-center gap-1.5 px-3 py-1.5 border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 hover:cursor-pointer rounded-lg text-xs font-semibold transition-colors">
            <Download className="w-3.5 h-3.5" /> Export PDF
          </button>
          <button onClick={handlePrint} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 bg-transparent text-zinc-600 hover:bg-gray-100 hover:cursor-pointer rounded-lg text-xs font-semibold transition-colors">
            <Printer className="w-3.5 h-3.5" /> Print Report
          </button>
        </div>
      </div>

      {/* Report Content Panels */}
      <div className="print-only bg-white border border-gray-200 rounded-xl p-6 shadow-sm min-h-[400px]">
        {activeReport === 'purchase' && (
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-bold text-gray-900">Procurement Order Analysis</h3>
              <p className="text-xs text-zinc-500">Aggregate logs of verified purchase transactions.</p>
            </div>
            <table className="w-full text-left font-sans text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-xs text-zinc-500 uppercase">
                  <th className="py-2">Purchase Order Ref</th>
                  <th className="py-2">Supplier Partner</th>
                  <th className="py-2">Date Post</th>
                  <th className="py-2 text-center">Procurement Status</th>
                  <th className="py-2 text-right">Total Spends</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800">
                {purchases.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 font-semibold">{p.purchaseOrderNo}</td>
                    <td className="py-3 text-zinc-600">{suppliers.find(s => s.id === p.supplierId)?.name || 'Bulk Distribution'}</td>
                    <td className="py-3 text-xs text-zinc-500">{formatDate(p.purchaseDate)}</td>
                    <td className="py-3 text-center">
                      <span className={`text-xs font-semibold ${
                        p.status === 'Approved' ? 'text-emerald-500' :
                        p.status === 'Rejected' ? 'text-rose-500' : 'text-amber-500'
                      }`}>{p.status}</span>
                    </td>
                    <td className="py-3 text-right font-mono font-bold text-emerald-600">৳{p.totalAmount.toLocaleString('bn-BD')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeReport === 'delivery' && (
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-bold text-gray-900">Asset Delivery & Dispatch Report</h3>
              <p className="text-xs text-zinc-500">Tracks outward asset dispatches with branch custodian handshakes.</p>
            </div>
            <table className="w-full text-left font-sans text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-xs text-zinc-500 uppercase">
                  <th className="py-2">Delivery Note</th>
                  <th className="py-2">Destination Branch</th>
                  <th className="py-2">Handler Staff</th>
                  <th className="py-2">Date Dispatched</th>
                  <th className="py-2 text-right">Volume Qty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800">
                {deliveries.map(d => (
                  <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 font-semibold">{d.deliveryNo}</td>
                    <td className="py-3 text-zinc-600">{branches.find(b => b.id === d.branchId)?.name || 'Branch'}</td>
                    <td className="py-3 text-xs text-zinc-600">{d.handler}</td>
                    <td className="py-3 text-xs text-zinc-500">{formatDate(d.deliveryDate)}</td>
                    <td className="py-3 text-right font-bold text-emerald-600">{d.quantity} Units</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeReport === 'branch_stock' && (
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-bold text-gray-900">Branch Stock Allocations</h3>
              <p className="text-xs text-zinc-500">Visualizer for hardware models spread among geographic operations.</p>
            </div>
            <table className="w-full text-left font-sans text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-xs text-zinc-500 uppercase">
                  <th className="py-2">Branch Code</th>
                  <th className="py-2">Branch Name</th>
                  <th className="py-2">Operating City / Site</th>
                  <th className="py-2 text-right">Assigned Assets Count</th>
                  <th className="py-2 text-right">Allocated Valuation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800">
                {branches.map(b => {
                  const branchDeliveries = deliveries.filter(d => d.branchId === b.id && d.status === 'Approved');
                  const totalUnits = branchDeliveries.reduce((sum, d) => sum + d.quantity, 0);
                  const estimatedValuation = branchDeliveries.reduce((sum, d) => sum + (d.quantity * 1600), 0);
                  return (
                    <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 font-mono text-zinc-500">{b.code}</td>
                      <td className="py-3 font-semibold text-gray-900">{b.name}</td>
                      <td className="py-3 text-xs text-zinc-500">{b.location}</td>
                      <td className="py-3 text-right font-bold text-gray-700">{totalUnits.toLocaleString('bn-BD')} units</td>
                      <td className="py-3 text-right font-mono font-bold text-emerald-600">৳{estimatedValuation.toLocaleString('bn-BD')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {activeReport === 'current_stock' && (
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-bold text-gray-900">Current Stock & Valuation Ledger</h3>
              <p className="text-xs text-zinc-500">Displays real-time asset depletion levels and cost audits.</p>
            </div>
            <table className="w-full text-left font-sans text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-xs text-zinc-500 uppercase">
                  <th className="py-2">Product Name</th>
                  <th className="py-2 text-center">Unit of Measure</th>
                  <th className="py-2 text-right">In-Stock Reserve</th>
                  <th className="py-2 text-right">Book Value</th>
                  <th className="py-2 text-right">Total Equity Valuation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 font-semibold text-gray-900">{p.name}</td>
                    <td className="py-3 text-center text-xs text-zinc-500">Pcs</td>
                    <td className="py-3 text-right font-bold text-gray-700">{p.quantity.toLocaleString('bn-BD')} Units</td>
                    <td className="py-3 text-right font-mono text-gray-600">৳{p.unitPrice.toLocaleString('bn-BD')}</td>
                    <td className="py-3 text-right font-mono font-bold text-emerald-600">৳{(p.quantity * p.unitPrice).toLocaleString('bn-BD')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeReport === 'adjustment' && (
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-bold text-gray-900">Asset Inventory Adjustments Analysis</h3>
              <p className="text-xs text-zinc-500">Historical stock increments/decrements with justification reports.</p>
            </div>
            <table className="w-full text-left font-sans text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-xs text-zinc-500 uppercase">
                  <th className="py-2">Reference Ref</th>
                  <th className="py-2">Product Impacted</th>
                  <th className="py-2">Adjustment Mode</th>
                  <th className="py-2 text-center">Amount Shift</th>
                  <th className="py-2">Audit Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800">
                {adjustments.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 font-semibold">{a.referenceNo}</td>
                    <td className="py-3 text-zinc-700">{products.find(p => p.id === a.productId)?.name || 'Device'}</td>
                    <td className="py-3 text-xs">
                      <span className={`px-2 py-0.5 rounded font-mono ${a.type === 'Addition' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>{a.type}</span>
                    </td>
                    <td className="py-3 text-center font-bold text-gray-700">{a.quantity} Units</td>
                    <td className="py-3 text-xs text-zinc-500">{a.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeReport === 'cash_book' && (
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-bold text-gray-900">Unified Cash Book Report</h3>
              <p className="text-xs text-zinc-500">Official statement of incoming receipts and outgoing operational payments.</p>
            </div>
            
            <ReportPieChart 
              data={[
                { name: 'Income', value: cashTransactions.filter(t => t.type === 'Receipt').reduce((sum, t) => sum + t.amount, 0) },
                { name: 'Expenses', value: cashTransactions.filter(t => t.type === 'Payment').reduce((sum, t) => sum + t.amount, 0) }
              ]}
              colors={['#10b981', '#f43f5e']}
            />

            <table className="w-full text-left font-sans text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-xs text-zinc-500 uppercase">
                  <th className="py-2">Voucher No</th>
                  <th className="py-2">Ledger group</th>
                  <th className="py-2">Associate Party</th>
                  <th className="py-2">Statement explanation</th>
                  <th className="py-2 text-right">Cash Out</th>
                  <th className="py-2 text-right">Cash In</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800">
                {cashTransactions.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 font-mono font-bold text-gray-900">{t.voucherNo}</td>
                    <td className="py-3 text-zinc-500">{t.category}</td>
                    <td className="py-3 text-zinc-700">{t.partyName}</td>
                    <td className="py-3 text-xs text-zinc-500 max-w-xs truncate">{t.description}</td>
                    <td className="py-3 text-right font-mono text-rose-500">{t.type === 'Payment' ? `-৳${t.amount.toLocaleString('bn-BD')}` : '-'}</td>
                    <td className="py-3 text-right font-mono text-emerald-600">{t.type === 'Receipt' ? `+৳${t.amount.toLocaleString('bn-BD')}` : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
