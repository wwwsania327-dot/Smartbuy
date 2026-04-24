"use client";

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, X, Ticket } from 'lucide-react';
import { getCoupons, createCoupon, updateCoupon, deleteCoupon } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function AdminCoupons() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'superadmin';

  const [searchTerm, setSearchTerm] = useState('');
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    discount: 0,
    type: 'percentage',
    usageType: 'general',
    maxDiscount: '',
    isActive: true,
  });

  const fetchCouponsList = async () => {
    try {
      setLoading(true);
      const data = await getCoupons();
      setCoupons(data);
    } catch (err) {
      console.error("Failed to fetch coupons", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCouponsList();
  }, []);

  const openAddModal = () => {
    if (!isSuperAdmin) return;
    setEditingId(null);
    setFormData({ 
        code: '', 
        discount: 0, 
        type: 'percentage', 
        usageType: 'general', 
        maxDiscount: '', 
        isActive: true 
    });
    setIsModalOpen(true);
  };

  const openEditModal = (coupon: any) => {
    if (!isSuperAdmin) return;
    setEditingId(coupon._id);
    setFormData({ 
      code: coupon.code, 
      discount: coupon.discount, 
      type: coupon.type,
      usageType: coupon.usageType,
      maxDiscount: coupon.maxDiscount || '',
      isActive: coupon.isActive,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!isSuperAdmin) return;
    if(!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      const res = await deleteCoupon(id);
      if(res.ok) fetchCouponsList();
    } catch(err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) return;
    try {
      const payload = {
        ...formData,
        discount: Number(formData.discount),
        maxDiscount: formData.maxDiscount === '' ? null : Number(formData.maxDiscount)
      };

      const res = editingId 
        ? await updateCoupon(editingId, payload)
        : await createCoupon(payload);
      
      if(res.ok) {
        setIsModalOpen(false);
        fetchCouponsList();
      } else {
        const error = await res.json();
        alert(`Failed to save coupon: ${error.message}`);
      }
    } catch(err) {
      console.error(err);
      alert("Failed to save coupon.");
    }
  };

  const filteredCoupons = coupons.filter(c => 
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUsageTypeBadge = (type: string) => {
    switch(type) {
      case 'first_order':
        return <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700 uppercase">First Order</span>;
      case 'second_order':
        return <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 uppercase">Second Order</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700 uppercase">General</span>;
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-foreground)]">Coupon Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage discounts and promotional offers.</p>
        </div>
        {isSuperAdmin && (
          <button onClick={openAddModal} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm">
            <Plus className="w-5 h-5" /> Add Coupon
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-[#1e293b] border border-[var(--color-border)] rounded-2xl shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-[var(--color-border)] flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative max-w-md w-full">
            <input 
              type="text" 
              placeholder="Search by code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-background)] focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-[#0f172a]/50 text-xs uppercase text-gray-500 border-b border-[var(--color-border)]">
                <th className="px-6 py-4 font-medium">Code</th>
                <th className="px-6 py-4 font-medium">Discount</th>
                <th className="px-6 py-4 font-medium">Usage Type</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-[var(--color-border)]">
              {loading ? (
                 <tr><td colSpan={5} className="text-center py-8 text-gray-500">Loading coupons...</td></tr>
              ) : filteredCoupons.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-500">No coupons found.</td></tr>
              ) : filteredCoupons.map((coupon) => (
                <tr key={coupon._id} className="hover:bg-gray-50 dark:hover:bg-[#0f172a] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded text-indigo-600 dark:text-indigo-400">
                            <Ticket className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-[var(--color-foreground)]">{coupon.code}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                        <span className="font-medium text-[var(--color-foreground)]">
                            {coupon.type === 'percentage' ? `${coupon.discount}%` : `₹${coupon.discount}`} OFF
                        </span>
                        {coupon.maxDiscount && (
                            <span className="text-[10px] text-gray-400">Max: ₹{coupon.maxDiscount}</span>
                        )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getUsageTypeBadge(coupon.usageType)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${coupon.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {coupon.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {isSuperAdmin ? (
                        <>
                          <button onClick={() => openEditModal(coupon)} className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(coupon._id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400 italic">View Only</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Popup */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e293b] rounded-2xl w-full max-w-lg shadow-xl overflow-hidden border border-[var(--color-border)]">
            <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
              <h3 className="text-xl font-bold text-[var(--color-foreground)]">
                {editingId ? 'Edit Coupon' : 'Add New Coupon'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Coupon Code</label>
                    <input required type="text" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})} className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-background)] focus:ring-2 focus:ring-indigo-500 uppercase" placeholder="e.g. SAVE50"/>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Discount Value</label>
                    <input required type="number" value={formData.discount} onChange={(e) => setFormData({...formData, discount: Number(e.target.value)})} className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-background)] focus:ring-2 focus:ring-indigo-500" placeholder="0"/>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                    <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-background)] focus:ring-2 focus:ring-indigo-500">
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Usage Type</label>
                    <select value={formData.usageType} onChange={(e) => setFormData({...formData, usageType: e.target.value})} className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-background)] focus:ring-2 focus:ring-indigo-500">
                        <option value="general">General</option>
                        <option value="first_order">First Order</option>
                        <option value="second_order">Second Order</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Discount (Optional)</label>
                    <input type="number" value={formData.maxDiscount} onChange={(e) => setFormData({...formData, maxDiscount: e.target.value})} className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-background)] focus:ring-2 focus:ring-indigo-500" placeholder="No Limit"/>
                </div>

                <div className="col-span-2 flex items-center gap-3 py-2">
                    <input 
                        type="checkbox" 
                        id="isActive"
                        checked={formData.isActive} 
                        onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">Mark as Active</label>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 rounded-lg transition-colors font-medium">Cancel</button>
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium shadow-sm transition-transform hover:scale-105">
                    {editingId ? 'Save Changes' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
