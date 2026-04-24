"use client";

import { useState, useEffect } from 'react';
import { Search, ShieldAlert, ShieldCheck, User as UserIcon, Crown, Loader2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useToast } from '../../../context/ToastContext';

import { fetchApi } from '@/lib/api';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      const res = await fetchApi('/api/users');
      if (res.ok) {
        setUsers(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'superadmin')) {
      fetchUsers();
    }
  }, [currentUser]);

  const toggleUserStatus = async (id: string, currentStatus: string, role: string) => {
    if (role === 'admin' || role === 'superadmin') {
       toast("Administrators cannot be blocked.", "error");
       return;
    }

    const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
    const action = newStatus === 'blocked' ? 'block' : 'unblock';
    
    if(!confirm(`Are you sure you want to ${action} this user?`)) return;

    setUpdatingId(id);
    try {
      const res = await fetchApi(`/api/users/${id}/status`, {
        method: 'PUT',
        body: { status: newStatus }
      });
      
      if(res.ok) {
        toast(`User ${action}ed successfully`);
        setUsers(users.map(u => u._id === id ? { ...u, status: newStatus } : u));
      } else {
        const err = await res.json();
        toast(`Failed to update status: ${err.message}`, "error");
      }
    } catch(err) {
      console.error(err);
      toast("Error updating user status.", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!confirm(`Are you sure you want to change this user's role to ${newRole.toUpperCase()}?`)) return;

    setUpdatingId(userId);
    try {
      const res = await fetchApi(`/api/users/${userId}/role`, {
        method: 'PUT',
        body: { role: newRole }
      });

      if (res.ok) {
        toast(`Role updated to ${newRole.toUpperCase()} successfully`);
        setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
      } else {
        const data = await res.json();
        toast(data.message || 'Failed to update role', 'error');
      }
    } catch (err) {
      console.error(err);
      toast('Error updating role', 'error');
    } finally {
      setUpdatingId(null);
    }
  };


  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div></div>;
  }

  const isSuperAdmin = currentUser?.role === 'superadmin';

  return (
    <div className="space-y-6 relative pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-foreground)] flex items-center gap-2">
            System Users
            {isSuperAdmin && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full uppercase tracking-widest font-black border border-amber-200">Management Mode</span>}
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage registered customers and administrative accounts.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1e293b] border border-[var(--color-border)] rounded-2xl shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-[var(--color-border)] flex flex-col md:flex-row justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <input 
              type="text" 
              placeholder="Search by name or email..."
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
                <th className="px-6 py-4 font-medium">User Profile</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Access Log</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-[var(--color-border)]">
              {filteredUsers.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-500">No users found.</td></tr>
              ) : filteredUsers.map((u) => {
                const isBlocked = u.status === 'blocked';
                const isTargetAdmin = u.role === 'admin';
                const isTargetSuper = u.role === 'superadmin';
                const isSelf = u._id === currentUser?._id;
                const isUpdating = updatingId === u._id;
                
                return (
                  <tr key={u._id} className={`hover:bg-gray-50 dark:hover:bg-[#0f172a] transition-colors ${isUpdating ? 'opacity-50 pointer-events-none' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                          isTargetSuper ? 'bg-amber-100 text-amber-600' : 
                          isTargetAdmin ? 'bg-purple-100 text-purple-600' : 
                          'bg-indigo-100 text-indigo-600'
                        }`}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                           <div className="font-medium text-[var(--color-foreground)] flex items-center gap-2">
                             {u.name}
                             {isSelf && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold uppercase">You</span>}
                           </div>
                           <div className="text-xs text-gray-500">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {isSuperAdmin && !isTargetSuper && !isSelf ? (
                          <select 
                            value={u.role}
                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                            className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-lg border focus:ring-2 focus:outline-none ${
                              isTargetAdmin ? 'bg-purple-50 text-purple-700 border-purple-200 focus:ring-purple-500' : 'bg-gray-50 text-gray-700 border-gray-200 focus:ring-gray-500'
                            }`}
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        ) : (
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                            isTargetSuper ? 'bg-amber-100 text-amber-700 border border-amber-200' : 
                            isTargetAdmin ? 'bg-purple-100 text-purple-700 border border-purple-200' : 
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {isTargetSuper && <Crown className="w-3 h-3" />}
                            {u.role}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isBlocked ? 'bg-red-500' : 'bg-green-500'}`}></span>
                        <span className={`font-medium ${isBlocked ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                          {isBlocked ? 'Blocked' : 'Active'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isTargetSuper ? (
                        <div className="flex items-center justify-end gap-1.5 text-amber-600 font-bold text-[10px] uppercase tracking-tighter">
                          <Crown className="w-3 h-3" />
                          Protected 👑
                        </div>
                      ) : (isTargetAdmin || isTargetSuper) && !isSuperAdmin ? (
                        <span className="text-gray-400 text-xs italic">Protected</span>
                      ) : (
                         <button 
                         disabled={isUpdating}
                         onClick={() => toggleUserStatus(u._id, u.status, u.role)} 
                         className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ml-auto ${
                           isBlocked 
                            ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200' 
                            : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                         }`}
                       >
                         {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : isBlocked ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                         {isBlocked ? 'Unblock' : 'Block Access'}
                       </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
