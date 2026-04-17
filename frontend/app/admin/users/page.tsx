"use client";

import { useState, useEffect } from 'react';
import { Search, ShieldAlert, ShieldCheck, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/users');
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
    // Relying on AuthContext to boot non-admins, but we can dual check
    if (user && user.role === 'admin') {
      fetchUsers();
    }
  }, [user]);

  const toggleUserStatus = async (id: string, currentStatus: string, role: string) => {
    if (role === 'admin') {
       alert("Administrators cannot be blocked.");
       return;
    }

    const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
    const action = newStatus === 'blocked' ? 'block' : 'unblock';
    
    if(!confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
      const res = await fetch(`http://localhost:5000/api/users/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if(res.ok) {
        // Optimistic UI update
        setUsers(users.map(u => u._id === id ? { ...u, status: newStatus } : u));
      } else {
        const err = await res.json();
        alert(`Failed to update status: ${err.message}`);
      }
    } catch(err) {
      console.error(err);
      alert("Error updating user status.");
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div></div>;
  }

  return (
    <div className="space-y-6 relative pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-foreground)]">System Users</h1>
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
                const isAdmin = u.role === 'admin';
                
                return (
                  <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-[#0f172a] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                           <div className="font-medium text-[var(--color-foreground)]">{u.name}</div>
                           <div className="text-xs text-gray-500">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        isAdmin ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {u.role}
                      </span>
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
                      {!isAdmin ? (
                         <button 
                         onClick={() => toggleUserStatus(u._id, u.status, u.role)} 
                         className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ml-auto ${
                           isBlocked 
                            ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200' 
                            : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                         }`}
                       >
                         {isBlocked ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                         {isBlocked ? 'Unblock' : 'Block Access'}
                       </button>
                      ) : (
                        <span className="text-gray-400 text-xs italic">Protected</span>
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
