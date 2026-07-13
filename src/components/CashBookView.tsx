import React, { useState } from 'react';
import { CashTransaction, Permissions } from '../types';
import { Plus, Search, Landmark, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft, Paperclip, Eye, X, Pencil } from 'lucide-react';
import { formatDate } from '../utils';

interface CashBookViewProps {
  cashTransactions: CashTransaction[];
  onAddTransaction: (transaction: Omit<CashTransaction, 'id'>) => void;
  onUpdateTransaction: (id: string, updates: Partial<Omit<CashTransaction, 'id'>>) => void;
  userRole?: string;
  permissions?: Permissions;
}

export default function CashBookView({ cashTransactions, onAddTransaction, onUpdateTransaction }: CashBookViewProps) {
  const [activeTab, setActiveTab] = useState<'received' | 'payments'>('received');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [operationMode, setOperationMode] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewAttachment, setPreviewAttachment] = useState<string | null>(null);

  // Form Fields
  const [partyName, setPartyName] = useState('');
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachmentUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Computations
  const totalReceived = cashTransactions
    .filter(t => t.type === 'Receipt')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalPayments = cashTransactions
    .filter(t => t.type === 'Payment')
    .reduce((sum, t) => sum + t.amount, 0);

  const cashBalance = totalReceived - totalPayments;

  const filteredTransactions = cashTransactions
    .filter(t => {
      const isCorrectType = activeTab === 'received' ? t.type === 'Receipt' : t.type === 'Payment';
      const matchesSearch = t.voucherNo.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            t.partyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            t.description.toLowerCase().includes(searchTerm.toLowerCase());
      return isCorrectType && matchesSearch;
    });

  const handleOpenAddModal = () => {
    setOperationMode('add');
    setSelectedId(null);
    setPartyName('');
    setAmount(0);
    setDescription('');
    setCategory(activeTab === 'received' ? 'Loan' : '');
    setAttachmentUrl('');
    setShowAddModal(true);
  };

  const handleOpenEditTransaction = (t: CashTransaction) => {
    setOperationMode('edit');
    setSelectedId(t.id);
    setPartyName(t.partyName);
    setAmount(t.amount);
    setDescription(t.description);
    setCategory(t.category);
    setAttachmentUrl(t.attachmentUrl || '');
    setShowAddModal(true);
  };

  const handleOpenViewTransaction = (t: CashTransaction) => {
    setOperationMode('view');
    setSelectedId(t.id);
    setPartyName(t.partyName);
    setAmount(t.amount);
    setDescription(t.description);
    setCategory(t.category);
    setAttachmentUrl(t.attachmentUrl || '');
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partyName || amount <= 0) return;

    if (operationMode === 'add') {
      const prefix = activeTab === 'received' ? 'RV' : 'PV';
      const voucherNo = `${prefix}-2026-0${Math.floor(Math.random() * 900) + 100}`;

      onAddTransaction({
        type: activeTab === 'received' ? 'Receipt' : 'Payment',
        date: new Date().toISOString().split('T')[0],
        voucherNo,
        partyName,
        amount,
        description,
        category: category || (activeTab === 'received' ? 'Loan' : 'Operational Freight'),
        attachmentUrl: attachmentUrl || undefined,
      });
    } else if (operationMode === 'edit' && selectedId) {
      onUpdateTransaction(selectedId, {
        partyName,
        amount,
        description,
        category,
        attachmentUrl: attachmentUrl || undefined,
      });
    }

    setPartyName('');
    setAmount(0);
    setDescription('');
    setCategory('');
    setAttachmentUrl('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Ledger Balances Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Total Cash Received</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="p-1 rounded-full bg-emerald-500/10 text-emerald-500">
              <TrendingUp className="w-4 h-4" />
            </span>
            <span className="text-2xl font-bold font-mono text-emerald-600">৳{totalReceived.toLocaleString('bn-BD')}</span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Total Cash Payments</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="p-1 rounded-full bg-rose-500/10 text-rose-500">
              <TrendingDown className="w-4 h-4" />
            </span>
            <span className="text-2xl font-bold font-mono text-rose-500">৳{totalPayments.toLocaleString('bn-BD')}</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 bg-emerald-500/5 hover:border-emerald-500/20 transition-all flex flex-col justify-between shadow-sm">
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Active Cash Balance</p>
          <p className="text-3xl font-serif text-emerald-500 mt-2">৳{cashBalance.toLocaleString('bn-BD')}</p>
        </div>
      </div>

      <div className="flex border-b border-gray-200 gap-4">
        {[
          { id: 'received', name: 'Cash Received (Income)', count: cashTransactions.filter(t => t.type === 'Receipt').length },
          { id: 'payments', name: 'Cash Payments (Expenses)', count: cashTransactions.filter(t => t.type === 'Payment').length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any);
              setSearchTerm('');
            }}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 hover:cursor-pointer flex items-center gap-2 ${
              activeTab === tab.id
                ? 'border-emerald-500 text-emerald-500 font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {tab.name}
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={`Search vouchers in ${activeTab === 'received' ? 'receipts' : 'payments'}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 bg-white rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
          />
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 hover:cursor-pointer transition-colors text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> Create {activeTab === 'received' ? 'Receipt Voucher' : 'Payment Voucher'}
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/50 text-xs uppercase text-gray-500 tracking-wider">
              <th className="px-6 py-3 font-semibold">Voucher info</th>
              <th className="px-6 py-3 font-semibold">Date</th>
              <th className="px-6 py-3 font-semibold">Ledger Group</th>
              <th className="px-6 py-3 font-semibold">Party / Associate</th>
              <th className="px-6 py-3 font-semibold">Ledger Explanation</th>
              <th className="px-6 py-3 font-semibold text-center">Voucher Image</th>
              <th className="px-6 py-3 font-semibold text-right">Amount Value</th>
              <th className="px-6 py-3 font-semibold text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm text-gray-800">
            {filteredTransactions.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50/50">
                <td className="px-6 py-4 font-semibold text-gray-900 flex items-center gap-2">
                  {t.type === 'Receipt' ? <ArrowUpRight className="w-4 h-4 text-emerald-500" /> : <ArrowDownLeft className="w-4 h-4 text-rose-500" />}
                  {t.voucherNo}
                </td>
                <td className="px-6 py-4 text-xs text-zinc-500">{formatDate(t.date)}</td>
                <td className="px-6 py-4 text-zinc-600">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-zinc-100 text-xs font-semibold">
                    {t.category}
                  </span>
                </td>
                <td className="px-6 py-4 font-medium">{t.partyName}</td>
                <td className="px-6 py-4 text-xs text-zinc-500 max-w-sm truncate">{t.description}</td>
                <td className="px-6 py-4 text-center">
                  {t.attachmentUrl ? (
                    <button
                      onClick={() => setPreviewAttachment(t.attachmentUrl!)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 text-xs font-medium hover:cursor-pointer transition-colors"
                      title="View attached voucher image"
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenEditTransaction(t)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium hover:cursor-pointer transition-colors"
                    >
                      <Paperclip className="w-3.5 h-3.5" /> Attachment
                    </button>
                  )}
                </td>
                <td className={`px-6 py-4 text-right font-bold ${
                  t.type === 'Receipt' ? 'text-emerald-600' : 'text-rose-500'
                }`}>
                  {t.type === 'Receipt' ? '+' : '-'}৳{t.amount.toLocaleString('bn-BD')}
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => handleOpenViewTransaction(t)}
                    className="p-1.5 text-emerald-500 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors inline-flex items-center justify-center hover:cursor-pointer mr-1"
                    title="View Transaction"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleOpenEditTransaction(t)}
                    className="p-1.5 text-yellow-500 hover:text-yellow-600 rounded-lg hover:bg-yellow-50 transition-colors inline-flex items-center justify-center hover:cursor-pointer"
                    title="Edit Transaction"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-xl border border-gray-100 overflow-hidden shadow-xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">
                {operationMode === 'view' ? 'View' : operationMode === 'edit' ? 'Edit' : 'Create'} {activeTab === 'received' ? 'Receipt Voucher' : 'Payment Voucher'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <Plus className="w-5 h-5 text-gray-500 rotate-45" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                  {activeTab === 'received' ? 'Source of Income / Received From *' : 'Paid To / Party *'}
                </label>
                <input
                  type="text"
                  required
                  disabled={operationMode === 'view'}
                  value={partyName}
                  onChange={(e) => setPartyName(e.target.value)}
                  placeholder="e.g. Salvage Recycler Group"
                  className="w-full px-3 py-2 text-sm border border-gray-200 bg-white text-gray-800 rounded-lg focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed focus:border-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Amount (৳) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    disabled={operationMode === 'view'}
                    value={amount}
                    onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 bg-white text-gray-800 rounded-lg focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Ledger Category</label>
                  {activeTab === 'received' ? (
                    <select
                      disabled={operationMode === 'view'}
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 bg-white text-gray-800 rounded-lg focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed focus:border-emerald-500 hover:cursor-pointer"
                    >
                      {!['Loan', 'Loan Refund', 'Payment', 'Received'].includes(category) && category && (
                        <option value={category}>{category}</option>
                      )}
                      <option value="Loan">Loan</option>
                      <option value="Loan Refund">Loan Refund</option>
                      <option value="Payment">Payment</option>
                      <option value="Received">Received</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      disabled={operationMode === 'view'}
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="e.g. Asset Sale / Maintenance"
                      className="w-full px-3 py-2 text-sm border border-gray-200 bg-white text-gray-800 rounded-lg focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed focus:border-emerald-500"
                    />
                  )}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Ledger Explanation / Description</label>
                <textarea
                  required
                  rows={2}
                  disabled={operationMode === 'view'}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Metallic salvage recycling scrap recovery settlement payment."
                  className="w-full px-3 py-2 text-sm border border-gray-200 bg-white text-gray-800 rounded-lg focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Attach Voucher Image or PDF (Optional)</label>
                <div className="flex items-center gap-3">
                  <label className={`flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 hover:border-emerald-500 bg-gray-50 rounded-lg text-xs font-medium text-gray-600 hover:cursor-pointer transition-colors flex-1 overflow-hidden ${operationMode === 'view' ? 'opacity-70 cursor-not-allowed' : ''}`}>
                    <Paperclip className="w-4 h-4 shrink-0 text-emerald-500" />
                    <span className="truncate">{attachmentUrl ? 'File attached successfully' : 'Choose image or PDF file...'}</span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      disabled={operationMode === 'view'}
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  {attachmentUrl && operationMode !== 'view' && (
                    <button
                      type="button"
                      onClick={() => setAttachmentUrl('')}
                      className="p-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 rounded-lg text-xs hover:cursor-pointer transition-colors"
                      title="Remove attachment"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {attachmentUrl && (
                  <div className="mt-2 rounded-lg overflow-hidden border border-gray-200 max-h-24 flex items-center justify-center bg-gray-50">
                    <img src={attachmentUrl} alt="Voucher preview" className="object-contain h-24 w-full" />
                  </div>
                )}
              </div>

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
                    className="px-4 py-2 bg-black hover:bg-zinc-800 text-white rounded-lg text-sm font-black transition-colors uppercase tracking-wider"
                  >
                    {operationMode === 'add' ? 'Post Voucher' : 'Update Voucher'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attachment Preview Modal */}
      {previewAttachment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-3xl w-full rounded-2xl border border-gray-200 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                <Paperclip className="w-4 h-4 text-emerald-500" /> Attached Voucher Image
              </h3>
              <button
                onClick={() => setPreviewAttachment(null)}
                className="p-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors hover:cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 overflow-auto flex-1 flex items-center justify-center bg-gray-100/50 min-h-[300px]">
              <img src={previewAttachment} alt="Attached voucher" className="max-h-[75vh] max-w-full object-contain rounded" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
