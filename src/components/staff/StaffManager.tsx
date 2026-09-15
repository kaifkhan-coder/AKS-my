import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  KeyRound,
  Check,
  X,
  Lock,
  Edit2,
  Trash2,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { StaffMember, StaffPermission } from '../../types';

export const StaffManager: React.FC = () => {
  const { activeStore, staffMembers, addStaffMember, updateStaffMember, removeStaffMember } = useStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState<'admin' | 'staff'>('staff');
  const [formPermissions, setFormPermissions] = useState<StaffPermission>({
    canManageInventory: true,
    canBilling: true,
    canCustomerCredit: false,
    canManageStaff: false,
    canCloudSync: false,
    canBlockCustomers: false,
  });

  const storeStaff = staffMembers.filter((s) => s.storeId === activeStore.id);

  const openAddModal = () => {
    setEditingStaff(null);
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormRole('staff');
    setFormPermissions({
      canManageInventory: true,
      canBilling: true,
      canCustomerCredit: false,
      canManageStaff: false,
      canCloudSync: false,
      canBlockCustomers: false,
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (staff: StaffMember) => {
    setEditingStaff(staff);
    setFormName(staff.name);
    setFormEmail(staff.email);
    setFormPhone(staff.phone);
    setFormRole(staff.role);
    setFormPermissions(staff.permissions);
    setIsAddModalOpen(true);
  };

  const handleRoleChange = (role: 'admin' | 'staff') => {
    setFormRole(role);
    if (role === 'admin') {
      // Admins get all permissions by default
      setFormPermissions({
        canManageInventory: true,
        canBilling: true,
        canCustomerCredit: true,
        canManageStaff: true,
        canCloudSync: true,
        canBlockCustomers: true,
      });
    } else {
      // Staff get limited permissions
      setFormPermissions({
        canManageInventory: true,
        canBilling: true,
        canCustomerCredit: false,
        canManageStaff: false,
        canCloudSync: false,
        canBlockCustomers: false,
      });
    }
  };

  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim() || !formPhone.trim()) return;

    if (editingStaff) {
      updateStaffMember({
        ...editingStaff,
        name: formName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim(),
        role: formRole,
        permissions: formPermissions,
      });
    } else {
      addStaffMember({
        name: formName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim(),
        role: formRole,
        permissions: formPermissions,
        status: 'active',
      });
    }

    setIsAddModalOpen(false);
  };

  return (
    <div id="staff-manager-page" className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Store Staff & Role-Based Access Control
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              Security & Permissions
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Grant specific store permissions to partners, store managers, or counter billing staff
          </p>
        </div>

        <button
          id="btn-add-staff-member"
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Staff / Admin</span>
        </button>
      </div>

      {/* Role explanation cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200 flex items-start gap-3 text-xs">
          <Shield className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-emerald-950">Store Admin Role</h4>
            <p className="text-emerald-800 mt-0.5">
              Full administrative privileges: can configure custom category fields, add staff, trigger Google Cloud backups, manage customer credit limits, and block fake-order accounts.
            </p>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-start gap-3 text-xs">
          <KeyRound className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-slate-900">Store Staff / Cashier Role</h4>
            <p className="text-slate-600 mt-0.5">
              Limited operational access: restricted strictly to register checkout, barcode scanning, generating bills, and updating daily stock levels. Cannot invite staff or alter store profile.
            </p>
          </div>
        </div>
      </div>

      {/* Staff Members List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Member Name & Contact</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3">Inventory Access</th>
                <th className="py-3 px-3">POS Billing</th>
                <th className="py-3 px-3">Udhar Khata</th>
                <th className="py-3 px-3">Google Cloud Sync</th>
                <th className="py-3 px-3">Block Fake Orders</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {storeStaff.map((staff) => (
                <tr key={staff.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 text-xs">{staff.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {staff.email} • {staff.phone}
                    </div>
                  </td>

                  <td className="py-3.5 px-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      staff.role === 'admin'
                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {staff.role}
                    </span>
                  </td>

                  <td className="py-3.5 px-3">
                    {staff.permissions.canManageInventory ? (
                      <span className="text-emerald-600 flex items-center gap-1">
                        <Check className="w-4 h-4" /> <span>Allowed</span>
                      </span>
                    ) : (
                      <span className="text-slate-300">Restricted</span>
                    )}
                  </td>

                  <td className="py-3.5 px-3">
                    {staff.permissions.canBilling ? (
                      <span className="text-emerald-600 flex items-center gap-1">
                        <Check className="w-4 h-4" /> <span>Allowed</span>
                      </span>
                    ) : (
                      <span className="text-slate-300">Restricted</span>
                    )}
                  </td>

                  <td className="py-3.5 px-3">
                    {staff.permissions.canCustomerCredit ? (
                      <span className="text-emerald-600 flex items-center gap-1">
                        <Check className="w-4 h-4" /> <span>Allowed</span>
                      </span>
                    ) : (
                      <span className="text-slate-300">Restricted</span>
                    )}
                  </td>

                  <td className="py-3.5 px-3">
                    {staff.permissions.canCloudSync ? (
                      <span className="text-emerald-600 flex items-center gap-1">
                        <Check className="w-4 h-4" /> <span>Allowed</span>
                      </span>
                    ) : (
                      <span className="text-slate-300">Restricted</span>
                    )}
                  </td>

                  <td className="py-3.5 px-3">
                    {staff.permissions.canBlockCustomers ? (
                      <span className="text-emerald-600 flex items-center gap-1">
                        <Check className="w-4 h-4" /> <span>Allowed</span>
                      </span>
                    ) : (
                      <span className="text-slate-300">Restricted</span>
                    )}
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                      {staff.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEditModal(staff)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                        title="Edit Permissions"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Remove staff member "${staff.name}"?`)) {
                            removeStaffMember(staff.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete Member"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Staff Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm">
                  {editingStaff ? 'Edit Staff Permissions' : 'Add New Staff / Admin Access'}
                </h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Staff Member Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Ramesh Verma"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Gmail / Work Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="ramesh@gmail.com"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mobile Number (for OTP) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+91 98111 22233"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Role selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Access Level Role
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleRoleChange('staff')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      formRole === 'staff'
                        ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold text-xs text-slate-900">Staff / Cashier</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Limited to POS register & billing</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleChange('admin')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      formRole === 'admin'
                        ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-500/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold text-xs text-purple-950">Store Admin</div>
                    <div className="text-[11px] text-purple-800 mt-0.5">Full access to cloud sync & finances</div>
                  </button>
                </div>
              </div>

              {/* Granular Permission Toggles */}
              <div className="pt-3 border-t border-slate-200 space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Granular Functional Permissions
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formPermissions.canBilling}
                      onChange={(e) =>
                        setFormPermissions((prev) => ({ ...prev, canBilling: e.target.checked }))
                      }
                      className="rounded text-emerald-600 w-4 h-4"
                    />
                    <span>Generate Bills (POS)</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formPermissions.canManageInventory}
                      onChange={(e) =>
                        setFormPermissions((prev) => ({ ...prev, canManageInventory: e.target.checked }))
                      }
                      className="rounded text-emerald-600 w-4 h-4"
                    />
                    <span>Manage Inventory & Stock</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formPermissions.canCustomerCredit}
                      onChange={(e) =>
                        setFormPermissions((prev) => ({ ...prev, canCustomerCredit: e.target.checked }))
                      }
                      className="rounded text-emerald-600 w-4 h-4"
                    />
                    <span>Manage Udhar Khata</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formPermissions.canBlockCustomers}
                      onChange={(e) =>
                        setFormPermissions((prev) => ({ ...prev, canBlockCustomers: e.target.checked }))
                      }
                      className="rounded text-emerald-600 w-4 h-4"
                    />
                    <span>Block Fake Order Customers</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formPermissions.canCloudSync}
                      onChange={(e) =>
                        setFormPermissions((prev) => ({ ...prev, canCloudSync: e.target.checked }))
                      }
                      className="rounded text-emerald-600 w-4 h-4"
                    />
                    <span>Google Cloud Backup Sync</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formPermissions.canManageStaff}
                      onChange={(e) =>
                        setFormPermissions((prev) => ({ ...prev, canManageStaff: e.target.checked }))
                      }
                      className="rounded text-emerald-600 w-4 h-4"
                    />
                    <span>Add/Manage Other Staff</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  {editingStaff ? 'Update Permissions' : 'Save Staff Access'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
