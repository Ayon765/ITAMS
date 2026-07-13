import React, { useState, useRef } from 'react';
import { read, utils } from 'xlsx';
import { Branch, UserRole, Permissions } from '../types';
import { 
  Plus, 
  Search, 
  Building2, 
  MapPin, 
  Phone, 
  User, 
  X, 
  Trash2, 
  Check, 
  AlertTriangle, 
  Lock, 
  FileSpreadsheet, 
  ListPlus,
  Clipboard,
  Sparkles,
  HelpCircle,
  FileUp,
  Eye,
  Pencil
} from 'lucide-react';

interface BranchViewProps {
  branches: Branch[];
  onAddBranch: (branch: Omit<Branch, 'id'>) => void;
  onUpdateBranch: (id: string, updates: Partial<Omit<Branch, 'id'>>) => void;
  onDeleteBranch: (id: string) => void;
  onAddBranches: (branches: Omit<Branch, 'id'>[]) => void;
  userRole: UserRole;
  permissions?: Permissions;
}

export default function BranchView({ 
  branches, 
  onAddBranch, 
  onUpdateBranch,
  onDeleteBranch, 
  onAddBranches, 
  userRole 
}: BranchViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  
  // Single branch form fields
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  
  // Safe state confirmation ID for deletion
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAuthorized = userRole === 'Admin' || userRole === 'Super Admin';

  const handleOpenAddModal = () => {
    setModalMode('add');
    setSelectedBranchId(null);
    setName('');
    setCode('');
    setLocation('');
    setPhone('');
    setContactPerson('');
    setShowAddModal(true);
  };

  const handleOpenEditModal = (branch: Branch) => {
    setModalMode('edit');
    setSelectedBranchId(branch.id);
    setName(branch.name);
    setCode(branch.code);
    setLocation(branch.location);
    setPhone(branch.phone);
    setContactPerson(branch.contactPerson);
    setShowAddModal(true);
  };

  const handleOpenViewModal = (branch: Branch) => {
    setModalMode('view');
    setSelectedBranchId(branch.id);
    setName(branch.name);
    setCode(branch.code);
    setLocation(branch.location);
    setPhone(branch.phone);
    setContactPerson(branch.contactPerson);
    setShowAddModal(true);
  };

  const filteredBranches = branches.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.contactPerson && b.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthorized) return;
    if (!name || !code) return;
    
    if (modalMode === 'add') {
      onAddBranch({ name, code, location, phone, contactPerson });
    } else if (modalMode === 'edit' && selectedBranchId) {
      onUpdateBranch(selectedBranchId, { name, code, location, phone, contactPerson });
    }
    
    setName('');
    setCode('');
    setLocation('');
    setPhone('');
    setContactPerson('');
    setShowAddModal(false);
  };

  const handleDelete = (id: string) => {
    if (!isAuthorized) return;
    onDeleteBranch(id);
    setDeleteConfirmId(null);
  };

  const handleImportXlsx = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target?.result;
      const workbook = read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const json = utils.sheet_to_json(sheet);
      
      onAddBranches(json as Omit<Branch, 'id'>[]);
    };
    reader.readAsBinaryString(file);
  };


  return (
    <div className="space-y-6">
      {/* Title & Stats Preview */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-black">Branches & Sites</h2>
          <p className="text-xs text-black">Manage all office locations, distribution hubs, and onsite coordinators.</p>
        </div>
        <div className="text-xs bg-emerald-50 text-black px-3 py-1.5 rounded-lg border border-emerald-100 font-medium">
          Total Branches: {branches.length.toLocaleString('bn-BD')}
        </div>
      </div>

      {/* Role-based Warning Banner */}
      {!isAuthorized && (
        <div className="flex items-start gap-3 bg-amber-50 text-amber-800 border border-amber-200 p-4 rounded-xl text-xs font-semibold shadow-xs">
          <Lock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Privilege Restricted (Role: {userRole})</p>
            <p className="mt-0.5 font-normal text-amber-700/95 leading-relaxed">
              Only <span className="font-semibold text-amber-900">Admin</span> and <span className="font-semibold text-amber-900">Super Admin</span> users have permission to create, delete, or clear branch records. 
              To perform these actions, please switch your session role using the role selector dropdown in the top-right corner of the application.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search branches by name, short form, location, manager..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 bg-white rounded-lg text-sm text-black placeholder-black focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 bg-black hover:bg-zinc-800 hover:cursor-pointer transition-colors text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Add New Branch
          </button>
          {isAuthorized ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 bg-black hover:bg-zinc-800 hover:cursor-pointer transition-colors text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-sm"
            >
              <FileUp className="w-3.5 h-3.5" /> Import XLSX
            </button>
          ) : (
            <button
              disabled
              className="flex items-center gap-2 bg-black/50 text-white/50 px-4 py-2 rounded-lg text-xs font-medium cursor-not-allowed"
              title="Requires Admin or Super Admin Role"
            >
              <Lock className="w-3.5 h-3.5" /> Import XLSX (Locked)
            </button>
          )}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".xlsx, .xls"
            onChange={handleImportXlsx}
          />
        </div>
      </div>

      {/* Branches Table Layout */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-black">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm text-black dark:text-white">
            <thead className="bg-gray-50/75 text-xs font-semibold text-black uppercase tracking-wider border-b border-gray-200 dark:bg-zinc-950 dark:text-white dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Short Form</th>
                <th className="px-6 py-4">Branch Name</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Branch Manager</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {filteredBranches.map((branch) => (
                <tr key={branch.id} className="hover:bg-gray-50/50 transition-colors dark:hover:bg-zinc-900/50">
                  <td className="px-6 py-4 font-mono text-xs dark:text-white">
                    <span className="px-2 py-0.5 rounded bg-gray-100 text-black font-bold uppercase dark:bg-zinc-900 dark:text-white dark:border dark:border-slate-800">
                      {branch.code}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-black dark:text-white">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-emerald-50 rounded-lg text-black dark:bg-zinc-900 dark:text-white">
                        <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <span className="capitalize">{branch.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-black dark:text-white">
                      <MapPin className="w-3.5 h-3.5 text-black dark:text-white flex-shrink-0" />
                      <span>{branch.location || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-black dark:text-white">
                      <User className="w-3.5 h-3.5 text-black dark:text-white flex-shrink-0" />
                      <span className="font-medium text-black dark:text-white">{branch.contactPerson || 'Unassigned'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-black dark:text-white">
                    <div className="flex items-center gap-2 text-black dark:text-white">
                      <Phone className="w-3.5 h-3.5 text-black dark:text-white flex-shrink-0" />
                      <span>{branch.phone || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {!isAuthorized ? (
                      <div className="inline-flex items-center p-1.5 text-gray-400" title="Delete feature locked for General Users">
                        <Lock className="w-4 h-4" />
                      </div>
                    ) : deleteConfirmId === branch.id ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="text-red-500 text-xs font-semibold mr-1 flex items-center gap-0.5 anonym-warning animate-pulse">
                          <AlertTriangle className="w-3 h-3" /> Delete?
                        </span>
                        <button
                          onClick={() => handleDelete(branch.id)}
                          className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-semibold shadow-xs hover:cursor-pointer transition-colors"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-semibold hover:cursor-pointer transition-colors"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => handleOpenViewModal(branch)}
                          className="p-1.5 text-emerald-500 hover:text-emerald-600 rounded hover:bg-emerald-50 transition-colors inline-flex items-center hover:cursor-pointer mr-1"
                          title="View Branch"
                        >
                          <Eye className="w-4 h-4 text-[#00FF00]" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(branch)}
                          className="p-1.5 text-yellow-500 hover:text-yellow-600 rounded hover:bg-yellow-50 transition-colors inline-flex items-center hover:cursor-pointer mr-1"
                          title="Edit Branch"
                        >
                          <Pencil className="w-4 h-4 text-[#FFFF00]" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(branch.id)}
                          className="p-1.5 text-red-500 hover:text-red-600 rounded hover:bg-red-50 transition-colors inline-flex items-center hover:cursor-pointer"
                          title="Delete Branch"
                        >
                          <Trash2 className="w-4 h-4 text-[#FF0000]" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {filteredBranches.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 text-xs">
                    No branches currently active. Use the <strong>"Add New Branch"</strong> button above to populate your branch directory manually.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Single Add Branch Modal */}
      {showAddModal && isAuthorized && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-xl border border-gray-100 overflow-hidden shadow-xl animate-in fade-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">
                {modalMode === 'add' ? 'Add New Branch' : modalMode === 'edit' ? 'Edit Branch' : 'Branch Details'}
              </h3>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="p-1 hover:bg-gray-100 rounded transition-colors hover:cursor-pointer"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Short Form *</label>
                <input
                  type="text"
                  required
                  disabled={modalMode === 'view'}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. BR-CHI-05 or DHA"
                  className="w-full px-3 py-2 text-sm border border-gray-200 bg-white text-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-70 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Branch Name *</label>
                <input
                  type="text"
                  required
                  disabled={modalMode === 'view'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dhaka Main Branch"
                  className="w-full px-3 py-2 text-sm border border-gray-200 bg-white text-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-70 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Location</label>
                <input
                  type="text"
                  disabled={modalMode === 'view'}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. 500 W Madison St, Chicago, IL"
                  className="w-full px-3 py-2 text-sm border border-gray-200 bg-white text-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-70 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Branch Manager</label>
                <input
                  type="text"
                  disabled={modalMode === 'view'}
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className="w-full px-3 py-2 text-sm border border-gray-200 bg-white text-[#18181B] rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-70 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Phone</label>
                <input
                  type="text"
                  disabled={modalMode === 'view'}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +1 312-555-0145"
                  className="w-full px-3 py-2 text-sm border border-gray-200 bg-white text-[#18181B] rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-70 disabled:cursor-not-allowed"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-200 bg-transparent text-gray-700 hover:bg-gray-100 rounded-lg text-sm transition-colors hover:cursor-pointer"
                >
                  {modalMode === 'view' ? 'Close' : 'Cancel'}
                </button>
                {modalMode !== 'view' && (
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors hover:cursor-pointer shadow-sm"
                  >
                    {modalMode === 'add' ? 'Create Branch' : 'Save Changes'}
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
