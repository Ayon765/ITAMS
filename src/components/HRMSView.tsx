import React, { useState } from 'react';
import { Employee, Department, Designation, UserRole, Permissions, UserAccount } from '../types';
import { Plus, Search, UserCheck, Briefcase, Award, Mail, Trash2, Lock, AlertTriangle, RefreshCw, Eye, Pencil } from 'lucide-react';

interface HRMSViewProps {
  employees: Employee[];
  departments: Department[];
  designations: Designation[];
  onAddEmployee: (employee: Omit<Employee, 'id'> & { role?: UserRole }) => void;
  onUpdateEmployee: (id: string, updates: Partial<Omit<Employee, 'id'>>) => void;
  onDeleteEmployee: (id: string) => void;
  onDeleteUser: (id: string) => void;
  onUpdateEmployeePermissions: (id: string, permissions: Permissions) => void;
  onAddDepartment: (dept: { name: string }) => void;
  onAddDesignation: (desig: { name: string }) => void;
  userRole: UserRole;
  users: UserAccount[];
  permissions?: Permissions;
  activeTab: 'employees' | 'departments' | 'designations' | 'users';
  onTabChange: (tab: 'employees' | 'departments' | 'designations' | 'users') => void;
}

export default function HRMSView({
  employees,
  departments,
  designations,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
  onDeleteUser,
  onUpdateEmployeePermissions,
  onAddDepartment,
  onAddDesignation,
  userRole,
  users,
  activeTab,
  onTabChange,
}: HRMSViewProps) {
  // const [activeTab, setActiveTab] = useState<'employees' | 'departments' | 'designations' | 'users'>('employees');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalMode, setModalMode] = useState<'employee' | 'department' | 'designation'>('employee');
  const [operationMode, setOperationMode] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  const isSuperAdmin = userRole === 'Super Admin';

  // Quick Add inline states
  const [deptInput, setDeptInput] = useState('');
  const [desigInput, setDesigInput] = useState('');

  // Form Fields
  const [empName, setEmpName] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empPassword, setEmpPassword] = useState('');
  const [empDept, setEmpDept] = useState('');
  const [empDesig, setEmpDesig] = useState('');
  const [empStatus, setEmpStatus] = useState<'Active' | 'Inactive'>('Active');
  const [empRole, setEmpRole] = useState<UserRole>('General User');
  
  const [permissions, setPermissions] = useState<Permissions>({
    canViewProduct: false, canEditProduct: false,
    canViewPurchase: false, canEditPurchase: false,
    canViewInventory: false, canEditInventory: false,
    canViewBranch: false, canEditBranch: false,
    canViewHRMS: false, canEditHRMS: false,
    canViewApproval: false, canEditApproval: false,
    canViewCashBook: false, canEditCashBook: false,
    canViewReport: false, canEditReport: false
  });


  const [genericName, setGenericName] = useState('');
  const [editingPermissionsEmployee, setEditingPermissionsEmployee] = useState<Employee | null>(null);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);

  const filteredEmployees = employees.filter(e =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDepts = departments.filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDesigs = designations.filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAddModal = (mode: 'employee' | 'department' | 'designation') => {
    setModalMode(mode);
    setOperationMode('add');
    setSelectedEmployeeId(null);
    setEmpName('');
    setEmpEmail('');
    setEmpPassword('');
    setEmpStatus('Active');
    setEmpRole('General User');
    
    if (departments.length > 0 && !empDept) setEmpDept(departments[0].id);
    if (designations.length > 0 && !empDesig) setEmpDesig(designations[0].id);
    setGenericName('');
    setShowAddModal(true);
  };

  const handleOpenEditEmployee = (emp: Employee) => {
    setModalMode('employee');
    setOperationMode('edit');
    setSelectedEmployeeId(emp.id);
    setEmpName(emp.name);
    setEmpEmail(emp.email);
    setEmpPassword(emp.password);
    setEmpDept(emp.departmentId);
    setEmpDesig(emp.designationId);
    setEmpStatus(emp.status);
    setEmpRole(emp.role || 'General User');
    setShowAddModal(true);
  };

  const handleOpenViewEmployee = (emp: Employee) => {
    setModalMode('employee');
    setOperationMode('view');
    setSelectedEmployeeId(emp.id);
    setEmpName(emp.name);
    setEmpEmail(emp.email);
    setEmpPassword(emp.password);
    setEmpDept(emp.departmentId);
    setEmpDesig(emp.designationId);
    setEmpStatus(emp.status);
    setEmpRole(emp.role || 'General User');
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === 'employee') {
      if (operationMode === 'add') {
        if (!empName || !empEmail || !empPassword || !empDept || !empDesig) return;
      } else {
        if (!empName || !empEmail || !empDept || !empDesig) return;
      }
      
      if (operationMode === 'add') {
        onAddEmployee({
          name: empName,
          email: empEmail,
          password: empPassword,
          departmentId: empDept,
          designationId: empDesig,
          status: empStatus,
          permissions: permissions,
          role: empRole
        });
      } else if (operationMode === 'edit' && selectedEmployeeId) {
        onUpdateEmployee(selectedEmployeeId, {
          name: empName,
          email: empEmail,
          password: empPassword,
          departmentId: empDept,
          designationId: empDesig,
          status: empStatus,
          role: empRole
        });
      }
      
      setEmpName('');
      setEmpEmail('');
      setEmpPassword('');
      setPermissions({
        canViewProduct: false, canEditProduct: false,
        canViewPurchase: false, canEditPurchase: false,
        canViewInventory: false, canEditInventory: false,
        canViewBranch: false, canEditBranch: false,
        canViewHRMS: false, canEditHRMS: false,
        canViewApproval: false, canEditApproval: false,
        canViewCashBook: false, canEditCashBook: false,
        canViewReport: false, canEditReport: false
      });
    } else if (modalMode === 'department') {
      if (!genericName) return;
      onAddDepartment({ name: genericName });
      setGenericName('');
    } else if (modalMode === 'designation') {
      if (!genericName) return;
      onAddDesignation({ name: genericName });
      setGenericName('');
    }
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">

      {/* Ultimator Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border-gray-200 shadow-sm p-4 border rounded-xl transition-colors">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 bg-gray-50 text-black placeholder-gray-400 rounded-lg text-sm transition-colors focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {activeTab === 'employees' && (
            <button
              onClick={() => handleOpenAddModal('employee')}
              className="flex items-center gap-2 bg-black hover:bg-zinc-800 text-white px-4 py-2 rounded-lg text-xs font-black hover:cursor-pointer transition-all uppercase tracking-wide"
            >
              <Plus className="w-4 h-4 stroke-[3]" /> Add Employee
            </button>
          )}

          {activeTab === 'departments' && (
            <button
              onClick={() => handleOpenAddModal('department')}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-lg text-xs font-mono font-semibold hover:cursor-pointer transition-all uppercase shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 text-white" /> Add Dept
            </button>
          )}

          {activeTab === 'designations' && (
            <button
              onClick={() => handleOpenAddModal('designation')}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-lg text-xs font-mono font-semibold hover:cursor-pointer transition-all uppercase shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 text-white" /> Add Role
            </button>
          )}
        </div>
      </div>

      {activeTab === 'employees' && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-[10px] uppercase text-zinc-600 tracking-widest">
                <th className="px-6 py-3.5 font-bold">Employee Name</th>
                <th className="px-6 py-3.5 font-bold">Department</th>
                <th className="px-6 py-3.5 font-bold">Designation</th>
                <th className="px-6 py-3.5 font-bold">Role</th>
                <th className="px-6 py-3.5 font-bold text-center">Status</th>
                <th className="px-6 py-3.5 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-xs font-mono text-zinc-800">
              {filteredEmployees.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center font-bold text-xs text-emerald-600">
                        {e.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-sans font-bold text-sm text-gray-900 group-hover:text-emerald-700 transition-colors">{e.name}</div>
                        <div className="text-[11px] text-zinc-500 font-mono flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-zinc-400" /> {e.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-600">
                    <span className="flex items-center gap-2">
                      <Briefcase className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{departments.find(d => d.id === e.departmentId)?.name || 'Custom Dept'}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-600">
                    <span className="flex items-center gap-2">
                      <Award className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{designations.find(d => d.id === e.designationId)?.name || 'IT Staff'}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-600">
                    <span className="px-2 py-1 rounded bg-gray-100 text-[10px] font-bold text-zinc-700">
                      {users.find(u => u.email.toLowerCase() === e.email.toLowerCase())?.role || 'General User'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider ${
                      e.status === 'Active' 
                        ? 'bg-[#00E599]/10 text-[#00E599] border border-[#00E599]/30 shadow-[0_0_8px_rgba(0,229,153,0.15)]' 
                        : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${e.status === 'Active' ? 'bg-[#00E599]' : 'bg-zinc-500'}`} />
                      {e.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => {
                        setEditingPermissionsEmployee(e);
                        setPermissions(e.permissions || {
                          canViewProduct: false, canEditProduct: false,
                          canViewPurchase: false, canEditPurchase: false,
                          canViewInventory: false, canEditInventory: false,
                          canViewBranch: false, canEditBranch: false,
                          canViewHRMS: false, canEditHRMS: false,
                          canViewApproval: false, canEditApproval: false,
                          canViewCashBook: false, canEditCashBook: false,
                          canViewReport: false, canEditReport: false
                        });
                        setShowPermissionsModal(true);
                      }}
                      className="p-1.5 text-zinc-500 hover:text-[#00E599] rounded-lg hover:bg-[#00E599]/10 transition-all border border-transparent hover:border-[#00E599]/30 mr-1"
                      title="MANAGE_PERMISSIONS"
                    >
                      <Lock className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenViewEmployee(e)}
                      className="p-1.5 text-emerald-500 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-all inline-flex items-center justify-center hover:cursor-pointer border border-transparent hover:border-emerald-200"
                      title="VIEW_RECORD"
                    >
                      <Eye className="w-4 h-4 text-[#00FF00]" />
                    </button>
                    <button
                      onClick={() => handleOpenEditEmployee(e)}
                      className="p-1.5 text-yellow-500 hover:text-yellow-600 rounded-lg hover:bg-yellow-50 transition-all inline-flex items-center justify-center hover:cursor-pointer border border-transparent hover:border-yellow-200"
                      title="EDIT_RECORD"
                    >
                      <Pencil className="w-4 h-4 text-[#FFFF00]" />
                    </button>
                    <button
                      onClick={() => onDeleteEmployee(e.id)}
                      className="p-1.5 text-red-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all inline-flex items-center justify-center hover:cursor-pointer border border-transparent hover:border-red-200"
                      title="TERMINATE_RECORD"
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

      {activeTab === 'departments' && (
        <div className="space-y-6 font-mono">
          <div className="bg-white p-5 border border-gray-200 rounded-xl shadow-sm max-w-xl">
            <h3 className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Create New Department
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (deptInput.trim()) {
                  onAddDepartment({ name: deptInput.trim() });
                  setDeptInput('');
                }
              }}
              className="flex gap-2.5"
            >
              <input
                type="text"
                placeholder="Enter department name..."
                value={deptInput}
                onChange={(e) => setDeptInput(e.target.value)}
                className="flex-1 px-3.5 py-2 text-xs border border-gray-200 bg-gray-50 text-black placeholder-gray-400 rounded-lg focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black uppercase tracking-wider hover:cursor-pointer transition-all"
              >
                Create
              </button>
            </form>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2">
            {filteredDepts.map((d) => (
              <div key={d.id} className="bg-white p-2 border border-gray-200 hover:border-emerald-500/40 transition-all rounded-lg shadow-sm flex items-center justify-between group">
                <span className="flex items-center gap-1.5 min-w-0">
                  <div className="p-1 rounded bg-gray-50 text-emerald-600 border border-gray-100 shrink-0">
                    <Briefcase className="w-3 h-3" />
                  </div>
                  <span className="text-[10px] font-sans font-bold text-black group-hover:text-emerald-600 transition-colors truncate">{d.name}</span>
                </span>
                <span className="text-[8px] text-gray-500 bg-gray-50 px-1 py-0.5 rounded border border-gray-100 shrink-0 ml-1">
                  {employees.filter(e => e.departmentId === d.id).length.toLocaleString('bn-BD')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'designations' && (
        <div className="space-y-6 font-mono">
          <div className="bg-white p-5 border border-gray-200 rounded-xl shadow-sm max-w-xl">
            <h3 className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Create New Designation
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (desigInput.trim()) {
                  onAddDesignation({ name: desigInput.trim() });
                  setDesigInput('');
                }
              }}
              className="flex gap-2.5"
            >
              <input
                type="text"
                placeholder="Enter designation name..."
                value={desigInput}
                onChange={(e) => setDesigInput(e.target.value)}
                className="flex-1 px-3.5 py-2 text-xs border border-gray-200 bg-gray-50 text-black placeholder-gray-400 rounded-lg focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black uppercase tracking-wider hover:cursor-pointer transition-all"
              >
                Create
              </button>
            </form>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2">
            {filteredDesigs.map((d) => (
              <div key={d.id} className="bg-white p-2 border border-gray-200 hover:border-emerald-500/40 transition-all rounded-lg shadow-sm flex items-center justify-between group">
                <span className="flex items-center gap-1.5 min-w-0">
                  <div className="p-1 rounded bg-gray-50 text-emerald-600 border border-gray-100 shrink-0">
                    <Award className="w-3 h-3" />
                  </div>
                  <span className="text-[10px] font-sans font-bold text-black group-hover:text-emerald-600 transition-colors truncate">{d.name}</span>
                </span>
                <span className="text-[8px] text-gray-500 bg-gray-50 px-1 py-0.5 rounded border border-gray-100 shrink-0 ml-1">
                  {employees.filter(e => e.designationId === d.id).length.toLocaleString('bn-BD')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-[10px] uppercase text-zinc-600 tracking-widest">
                <th className="px-6 py-3.5 font-bold">User Information</th>
                <th className="px-6 py-3.5 font-bold">System Role</th>
                <th className="px-6 py-3.5 font-bold text-center">Status</th>
                <th className="px-6 py-3.5 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-xs font-mono text-zinc-800">
              {users.map((u) => {
                const emp = employees.find(e => e.email.toLowerCase() === u.email.toLowerCase()) || ({
                  id: `temp_${u.id}`,
                  name: u.name,
                  email: u.email,
                  password: u.password || '123456',
                  departmentId: departments[0]?.id || '',
                  designationId: designations[0]?.id || '',
                  status: u.isTerminated ? 'Inactive' : 'Active',
                  role: u.role,
                  permissions: u.permissions
                } as Employee);

                return (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-sans font-bold text-sm text-gray-900">{u.name}</div>
                      <div className="text-[11px] text-zinc-500 font-mono mt-0.5">{u.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${u.isTerminated ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-700'}`}>
                        {u.role} {u.isTerminated && '(TERMINATED)'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-sans font-bold inline-flex items-center gap-1.5 ${
                        u.isTerminated 
                          ? 'bg-red-500/15 text-red-500 border border-red-500/30' 
                          : 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                      }`}>
                        <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${u.isTerminated ? 'bg-red-500' : 'bg-emerald-500'}`} />
                        {u.isTerminated ? 'Terminated' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {u.role !== 'Super Admin' && (
                        <>
                          <button
                            onClick={() => handleOpenViewEmployee(emp)}
                            className="p-1.5 text-emerald-500 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-all inline-flex items-center justify-center hover:cursor-pointer border border-transparent hover:border-emerald-200 mr-1"
                            title="VIEW_USER"
                          >
                            <Eye className="w-4 h-4 text-[#00FF00]" />
                          </button>
                          <button
                            onClick={() => handleOpenEditEmployee(emp)}
                            className="p-1.5 text-yellow-500 hover:text-yellow-600 rounded-lg hover:bg-yellow-50 transition-all inline-flex items-center justify-center hover:cursor-pointer border border-transparent hover:border-yellow-200 mr-1"
                            title="EDIT_USER"
                          >
                            <Pencil className="w-4 h-4 text-[#FFFF00]" />
                          </button>
                          <button
                            onClick={() => onDeleteUser(u.id)}
                            className={`p-1.5 rounded-lg transition-all inline-flex items-center justify-center hover:cursor-pointer border border-transparent ${u.isTerminated ? 'text-emerald-500 hover:text-emerald-400 hover:bg-emerald-50 hover:border-emerald-200' : 'text-red-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200'}`}
                            title={u.isTerminated ? "RESTORE_USER" : "TERMINATE_USER"}
                          >
                            {u.isTerminated ? <RefreshCw className="w-4 h-4" /> : <Trash2 className="w-4 h-4 text-[#FF0000]" />}
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">
                {operationMode === 'view' ? 'View Employee Details' : operationMode === 'edit' ? 'Edit Employee Record' : (
                  <>
                    {modalMode === 'employee' && 'Add New Employee'}
                    {modalMode === 'department' && 'Add New Department'}
                    {modalMode === 'designation' && 'Add New Designation'}
                  </>
                )}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-gray-500 hover:text-black transition-colors hover:cursor-pointer">
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4 font-mono text-xs">
                {modalMode === 'employee' ? (
                  <>
                    <div>
                      <label className="block text-gray-700 font-bold mb-1.5 uppercase tracking-wider">Full Name</label>
                      <input
                        type="text"
                        required
                        disabled={operationMode === 'view'}
                        value={empName}
                        onChange={(e) => setEmpName(e.target.value)}
                        placeholder="e.g. Alex Mercer"
                        className="w-full bg-white border border-gray-200 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-black placeholder:text-gray-400 focus:outline-none transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-bold mb-1.5 uppercase tracking-wider">Email Address</label>
                      <input
                        type="email"
                        required
                        disabled={operationMode === 'view'}
                        value={empEmail}
                        onChange={(e) => setEmpEmail(e.target.value)}
                        placeholder="alex@company.com"
                        className="w-full bg-white border border-gray-200 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-black placeholder:text-gray-400 focus:outline-none transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-bold mb-1.5 uppercase tracking-wider">Password</label>
                      <input
                        type="password"
                        required={operationMode === 'add'}
                        disabled={operationMode === 'view'}
                        value={empPassword}
                        onChange={(e) => setEmpPassword(e.target.value)}
                        placeholder={operationMode === 'edit' ? "Leave blank to keep unchanged" : "••••••••"}
                        className="w-full bg-white border border-gray-200 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-black placeholder:text-gray-400 focus:outline-none transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-gray-700 font-bold mb-1.5 uppercase tracking-wider">Department</label>
                        <select
                          required
                          disabled={operationMode === 'view'}
                          value={empDept}
                          onChange={(e) => setEmpDept(e.target.value)}
                          className="w-full bg-white border border-gray-200 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-black focus:outline-none transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                          <option value="" disabled>Select Dept</option>
                          {departments.map((d) => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-700 font-bold mb-1.5 uppercase tracking-wider">Designation</label>
                        <select
                          required
                          disabled={operationMode === 'view'}
                          value={empDesig}
                          onChange={(e) => setEmpDesig(e.target.value)}
                          className="w-full bg-white border border-gray-200 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-black focus:outline-none transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                          <option value="" disabled>Select Role</option>
                          {designations.map((d) => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-700 font-bold mb-1.5 uppercase tracking-wider">Status</label>
                      <select
                        disabled={operationMode === 'view'}
                        value={empStatus}
                        onChange={(e) => setEmpStatus(e.target.value as 'Active' | 'Inactive')}
                        className="w-full bg-white border border-gray-200 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-black focus:outline-none transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-700 font-bold mb-1.5 uppercase tracking-wider">Role</label>
                      <select
                        value={empRole}
                        onChange={(e) => setEmpRole(e.target.value as UserRole)}
                        className="w-full bg-white border border-gray-200 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-black focus:outline-none transition-colors"
                      >
                        <option value="Admin">Admin</option>
                        <option value="General User">User</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-gray-700 font-bold mb-1.5 uppercase tracking-wider">
                      {modalMode === 'department' ? 'Department Name' : 'Designation Name'}
                    </label>
                    <input
                      type="text"
                      required
                      value={genericName}
                      onChange={(e) => setGenericName(e.target.value)}
                      placeholder={modalMode === 'department' ? 'e.g. Logistics' : 'e.g. Senior Analyst'}
                      className="w-full bg-white border border-gray-200 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-black placeholder:text-gray-400 focus:outline-none transition-colors"
                    />
                  </div>
                )}
              </div>
              <div className="p-6 pt-0 flex justify-end gap-3 font-mono">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-200 bg-transparent text-gray-700 font-bold hover:bg-gray-50 rounded-lg text-sm transition-colors hover:cursor-pointer uppercase"
                >
                  {operationMode === 'view' ? 'CLOSE' : 'CANCEL'}
                </button>
                {operationMode !== 'view' && (
                  <button
                    type="submit"
                    className="px-5 py-2 bg-black hover:bg-zinc-800 text-white rounded-lg text-sm font-black transition-all hover:cursor-pointer uppercase tracking-wider"
                  >
                    {operationMode === 'add' ? 'SAVE ENTRY' : 'UPDATE ENTRY'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {showPermissionsModal && editingPermissionsEmployee && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">
                Manage Permissions: {editingPermissionsEmployee.name}
              </h3>
              <button onClick={() => setShowPermissionsModal(false)} className="p-1 text-gray-500 hover:text-black transition-colors hover:cursor-pointer">
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>
            <div className="p-6 space-y-4 font-mono text-xs">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'View Products', key: 'canViewProduct' }, { label: 'Edit Products', key: 'canEditProduct' },
                  { label: 'View Purchases', key: 'canViewPurchase' }, { label: 'Edit Purchases', key: 'canEditPurchase' },
                  { label: 'View Inventory', key: 'canViewInventory' }, { label: 'Edit Inventory', key: 'canEditInventory' },
                  { label: 'View Branch', key: 'canViewBranch' }, { label: 'Edit Branch', key: 'canEditBranch' },
                  { label: 'View HRMS', key: 'canViewHRMS' }, { label: 'Edit HRMS', key: 'canEditHRMS' },
                  { label: 'View Approval', key: 'canViewApproval' }, { label: 'Edit Approval', key: 'canEditApproval' },
                  { label: 'View CashBook', key: 'canViewCashBook' }, { label: 'Edit CashBook', key: 'canEditCashBook' },
                  { label: 'View Report', key: 'canViewReport' }, { label: 'Edit Report', key: 'canEditReport' },
                ].map(p => (
                  <label key={p.key} className="flex items-center text-xs text-gray-800">
                    <input 
                      type="checkbox" 
                      checked={permissions[p.key as keyof Permissions]} 
                      onChange={(e) => setPermissions(prev => ({ ...prev, [p.key]: e.target.checked }))} 
                      className="mr-2 border-gray-300 rounded text-emerald-600 focus:ring-emerald-500" 
                    />
                    {p.label}
                  </label>
                ))}
              </div>
            </div>
            <div className="p-6 pt-0 flex justify-end gap-3 font-mono">
              <button
                onClick={() => setShowPermissionsModal(false)}
                className="px-4 py-2 border border-gray-200 bg-transparent text-gray-700 font-bold hover:bg-gray-50 rounded-lg text-xs transition-colors hover:cursor-pointer uppercase"
              >
                ABORT
              </button>
              <button
                onClick={() => {
                  onUpdateEmployeePermissions(editingPermissionsEmployee.id, permissions);
                  setShowPermissionsModal(false);
                }}
                className="px-5 py-2 bg-black hover:bg-zinc-800 text-white rounded-lg text-sm font-black transition-all hover:cursor-pointer uppercase tracking-wider"
              >
                EXECUTE_SAVE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
