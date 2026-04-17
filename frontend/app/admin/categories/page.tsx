"use client";

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, X, Image as ImageIcon } from 'lucide-react';

export default function AdminCategories() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
  });

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: '', description: '', imageUrl: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (category: any) => {
    setEditingId(category._id);
    setFormData({ 
      name: category.name, 
      description: category.description || '', 
      imageUrl: category.image?.url || '',
    });
    setIsModalOpen(true);
  };

  const deleteCategory = async (id: string) => {
    if(!confirm("Are you sure you want to delete this category?")) return;
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE'
      });
      if(res.ok) fetchCategories();
    } catch(err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId 
        ? `/api/categories/${editingId}`
        : `/api/categories`;
      
      const method = editingId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          image: { url: formData.imageUrl }
        })
      });
      
      if(res.ok) {
        setIsModalOpen(false);
        fetchCategories();
      } else {
        const error = await res.json();
        alert(`Failed to save category: ${error.message}`);
      }
    } catch(err) {
      console.error(err);
      alert("Failed to save category. Backend unreachable.");
    }
  };

  const filteredCategories = categories.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-foreground)]">Categories</h1>
          <p className="text-sm text-gray-500 mt-1">Manage grocery categories and their images.</p>
        </div>
        <button onClick={openAddModal} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm">
          <Plus className="w-5 h-5" /> Add Category
        </button>
      </div>

      <div className="bg-white dark:bg-[#1e293b] border border-[var(--color-border)] rounded-2xl shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-[var(--color-border)] flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative max-w-md w-full">
            <input 
              type="text" 
              placeholder="Search categories..."
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
                <th className="px-6 py-4 font-medium">Image</th>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Slug</th>
                <th className="px-6 py-4 font-medium">Description</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-[var(--color-border)]">
              {filteredCategories.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-500">No categories found. Click "Add Category" to create one.</td></tr>
              ) : filteredCategories.map((category) => (
                <tr key={category._id} className="hover:bg-gray-50 dark:hover:bg-[#0f172a] transition-colors">
                  <td className="px-6 py-4">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 border border-[var(--color-border)] overflow-hidden flex items-center justify-center">
                      {category.image?.url ? (
                        <img src={category.image.url} alt={category.name} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-[var(--color-foreground)]">{category.name}</td>
                  <td className="px-6 py-4 text-gray-500 font-mono text-xs">{category.slug}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400 max-w-xs truncate">{category.description || '-'}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEditModal(category)} className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteCategory(category._id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
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
                {editingId ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category Name</label>
                <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-background)] focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Exotic Fruits"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (Optional)</label>
                <textarea rows={2} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-background)] focus:ring-2 focus:ring-indigo-500" placeholder="A brief description of this category..."></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image URL</label>
                <input type="text" value={formData.imageUrl} onChange={(e) => setFormData({...formData, imageUrl: e.target.value})} className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-background)] focus:ring-2 focus:ring-indigo-500" placeholder="https://example.com/image.jpg or /categories/fruits.png"/>
                <p className="text-xs text-gray-500 mt-1">Hint: You can use local paths like <code>/categories/fruits.png</code></p>
              </div>
              
              {formData.imageUrl && (
                <div className="mt-4 border border-[var(--color-border)] rounded-xl overflow-hidden h-32 relative bg-gray-50 dark:bg-gray-800">
                  <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover object-center" onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x200?text=Invalid+Image+URL' }} />
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 rounded-lg transition-colors font-medium">Cancel</button>
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium shadow-sm transition-transform hover:scale-105">{editingId ? 'Save Changes' : 'Create Category'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
