"use client";

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, X, Image as ImageIcon, Filter } from 'lucide-react';
import { normalizeProduct } from '@/lib/products';

export default function AdminProducts() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    description: '',
    imageUrl: '',
    discount: '',
  });

  const fetchData = async () => {
    try {
      // 1. Fetch products from real backend
      const prodRes = await fetch('/api/products');
      if (prodRes.ok) {
        const data = await prodRes.json();
        const rawList = data.products || (Array.isArray(data) ? data : []);
        const apiProducts = rawList.map((p: any) => {
          const normalized = normalizeProduct(p);
          return {
            ...normalized,
            _id: normalized.id, // Keep _id for admin panel compatibility if needed
            categoryName: normalized.category?.name || (typeof normalized.category === 'string' ? normalized.category : 'Uncategorized'),
          };
        });
        setProducts(apiProducts);
      }

      // 2. Fetch categories from real backend
      const catRes = await fetch('/api/categories');
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData);
      } else {
        console.error("Failed to fetch real categories from backend");
        // Fallback to avoid empty select if API fails but show error
        setCategories([]);
      }
    } catch (err) {
      console.error("Failed to fetch data", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ 
      name: '', 
      category: categories.length > 0 ? categories[0]._id : '', 
      price: '', 
      stock: '', 
      description: '', 
      imageUrl: '',
      discount: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product: any) => {
    setEditingId(product._id);
    setFormData({ 
      name: product.name, 
      category: typeof product.category === 'object' ? product.category._id : product.category, 
      price: product.price.toString(), 
      stock: product.stock.toString(),
      description: product.description || '',
      imageUrl: product.images && product.images.length > 0 ? product.images[0].url : '',
      discount: product.discount ? product.discount.toString() : ''
    });
    setIsModalOpen(true);
  };

  const deleteProduct = async (id: string) => {
    if(!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert("Product deleted successfully!");
        fetchData();
      } else {
        const err = await res.json();
        alert(`Delete failed: ${err.message || 'Unknown error'}`);
      }
    } catch(err) {
      console.error(err);
      alert("Error deleting product. Is the backend running?");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category) {
      alert("Please select a category.");
      return;
    }

    try {
      const discountPct = Number(formData.discount) || 0;
      const origPrice = Number(formData.price);

      // Backend payload (matches productController schema)
      const payload = {
        name: formData.name,
        description: formData.description || 'No description provided',
        price: origPrice,
        discount: discountPct,
        stock: Number(formData.stock),
        category: formData.category,
        images: formData.imageUrl ? [{ url: formData.imageUrl }] : [],
        image: formData.imageUrl,  // direct image field too
      };

      let res: Response;
      if (editingId) {
        res = await fetch(`/api/products/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        alert(`Product ${editingId ? 'updated' : 'added'} successfully!`);
        setIsModalOpen(false);
        fetchData();
      } else {
        const err = await res.json();
        alert(`Failed to save: ${err.message || 'Unknown error'}. Is the backend running?`);
      }
    } catch(err) {
      console.error(err);
      alert("Failed to save product. Make sure the backend server is running on port 5000.");
    }
  };

  // Filtering
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter ? (p.category?._id === categoryFilter || p.category === categoryFilter) : true;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 relative pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-foreground)]">Products Portfolio</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your inventory, pricing, and product details.</p>
        </div>
        <button onClick={openAddModal} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm">
          <Plus className="w-5 h-5" /> Add Product
        </button>
      </div>

      <div className="bg-white dark:bg-[#1e293b] border border-[var(--color-border)] rounded-2xl shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-[var(--color-border)] flex flex-col md:flex-row justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <input 
              type="text" 
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-background)] focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          </div>
          <div className="flex items-center gap-2 max-w-xs w-full">
            <Filter className="w-4 h-4 text-gray-400" />
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-background)] focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm appearance-none"
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-[#0f172a]/50 text-xs uppercase text-gray-500 border-b border-[var(--color-border)]">
                <th className="px-6 py-4 font-medium">Image</th>
                <th className="px-6 py-4 font-medium">Product Name</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Discount</th>
                <th className="px-6 py-4 font-medium">Stock</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-[var(--color-border)]">
              {filteredProducts.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-500">No products found. Click "Add Product" to create one.</td></tr>
              ) : filteredProducts.map((product) => {
                const stockStatus = product.stock > 10 ? 'Active' : (product.stock > 0 ? 'Low Stock' : 'Out of Stock');
                const imageUrl = product.images && product.images.length > 0 ? product.images[0].url : null;
                
                return (
                  <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-[#0f172a] transition-colors">
                    <td className="px-6 py-4">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 border border-[var(--color-border)] overflow-hidden flex items-center justify-center">
                        {imageUrl ? (
                          <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=Error' }} />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-[var(--color-foreground)]">{product.name}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      {product.category?.name || 'Uncategorized'}
                    </td>
                    <td className="px-6 py-4 font-medium text-[var(--color-foreground)]">
                      <div className="flex flex-col">
                        <span className={product.discount > 0 ? "line-through text-gray-400 text-xs" : ""}>₹{Number(product.originalPrice || product.price || 0).toFixed(2)}</span>
                        {product.discount > 0 && (
                          <span className="text-sm text-green-600 font-bold">₹{Number(product.discountPrice !== undefined ? product.discountPrice : product.price || 0).toFixed(2)}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {product.discount > 0 ? (
                        <span className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">
                          {product.discount}% OFF
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 dark:text-gray-300">{product.stock}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          stockStatus === 'Active' ? 'bg-green-100 text-green-700' :
                          stockStatus === 'Low Stock' ? 'bg-orange-100 text-orange-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {stockStatus}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEditModal(product)} className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteProduct(product._id)} className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Popup for Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1e293b] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden border border-[var(--color-border)] max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)] bg-gray-50/50 dark:bg-slate-800/50">
              <h3 className="text-xl font-bold text-[var(--color-foreground)]">
                {editingId ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-white dark:bg-slate-700 p-1.5 rounded-full shadow-sm">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Product Name <span className="text-red-500">*</span></label>
                  <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 border border-[var(--color-border)] rounded-xl bg-[var(--color-background)] focus:ring-2 focus:ring-indigo-500 transition-shadow" placeholder="e.g. Organic Bananas"/>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Category <span className="text-red-500">*</span></label>
                  <select required value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-2.5 border border-[var(--color-border)] rounded-xl bg-[var(--color-background)] focus:ring-2 focus:ring-indigo-500 transition-shadow">
                    <option value="" disabled>Select a category</option>
                    {categories.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Price (₹) <span className="text-red-500">*</span></label>
                  <input required type="number" step="0.01" min="0" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full px-4 py-2.5 border border-[var(--color-border)] rounded-xl bg-[var(--color-background)] focus:ring-2 focus:ring-indigo-500 transition-shadow" placeholder="0.00"/>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Stock Quantity <span className="text-red-500">*</span></label>
                  <input required type="number" min="0" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} className="w-full px-4 py-2.5 border border-[var(--color-border)] rounded-xl bg-[var(--color-background)] focus:ring-2 focus:ring-indigo-500 transition-shadow" placeholder="100"/>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Discount (%) <span className="text-gray-400 font-normal text-xs">(Optional)</span></label>
                  <input type="number" min="0" max="100" value={formData.discount} onChange={(e) => setFormData({...formData, discount: e.target.value})} className="w-full px-4 py-2.5 border border-[var(--color-border)] rounded-xl bg-[var(--color-background)] focus:ring-2 focus:ring-indigo-500 transition-shadow" placeholder="e.g. 20"/>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Description <span className="text-red-500">*</span></label>
                <textarea required rows={3} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2.5 border border-[var(--color-border)] rounded-xl bg-[var(--color-background)] focus:ring-2 focus:ring-indigo-500 transition-shadow resize-none" placeholder="Detailed product description..."></textarea>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Image URL <span className="text-red-500">*</span></label>
                <input required type="text" value={formData.imageUrl} onChange={(e) => setFormData({...formData, imageUrl: e.target.value})} className="w-full px-4 py-2.5 border border-[var(--color-border)] rounded-xl bg-[var(--color-background)] focus:ring-2 focus:ring-indigo-500 transition-shadow" placeholder="https://images.unsplash.com/photo-..."/>
                
                {formData.imageUrl && (
                  <div className="mt-4 border border-[var(--color-border)] rounded-xl overflow-hidden h-40 relative bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                     <img src={formData.imageUrl} alt="Preview" className="h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x200?text=Invalid+Image+URL' }} />
                  </div>
                )}
              </div>

              <div className="pt-6 mt-2 border-t border-[var(--color-border)] flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-[#1e293b]">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 rounded-xl transition-colors font-medium">Cancel</button>
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-md shadow-indigo-500/20 transition-all hover:-translate-y-0.5">{editingId ? 'Save Changes' : 'Create Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
