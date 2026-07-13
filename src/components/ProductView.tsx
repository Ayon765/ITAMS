import React, { useState, useRef } from 'react';
import { read, utils, writeFile } from 'xlsx';
import { Product, Category, Brand, UoM, Permissions } from '../types';
import { 
  Plus, 
  Search, 
  Tag, 
  Cpu, 
  Ruler, 
  Archive, 
  Trash2, 
  AlertTriangle, 
  Lock, 
  ListPlus, 
  Clipboard, 
  Sparkles, 
  HelpCircle,
  X,
  FileSpreadsheet,
  Check,
  FileUp,
  Eye,
  Pencil,
  Calendar
} from 'lucide-react';

interface ProductViewProps {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  uoms: UoM[];
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateProduct: (id: string, updates: Partial<Omit<Product, 'id'>>) => void;
  onDeleteProduct: (id: string) => void;
  onClearAllProducts: () => void;
  onAddProductWithCustomFields: (product: { name: string; category: string; brand: string; uom: string; quantity: number; unitPrice: number; purchaseDate?: string }) => void;
  onAddCategory: (category: Omit<Category, 'id'>) => void;
  onDeleteCategory: (id: string) => void;
  onAddBrand: (brand: Omit<Brand, 'id'>) => void;
  onDeleteBrand: (id: string) => void;
  onAddUoM: (uom: Omit<UoM, 'id'>) => void;
  onDeleteUoM: (id: string) => void;
  userRole: string;
  permissions?: Permissions;
  searchTerm: string;
  activeTab: 'products' | 'categories' | 'brands' | 'uoms';
  onTabChange: (tab: 'products' | 'categories' | 'brands' | 'uoms') => void;
}

export default function ProductView({
  products,
  categories,
  brands,
  uoms,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onClearAllProducts,
  onAddProductWithCustomFields,
  onAddCategory,
  onDeleteCategory,
  onAddBrand,
  onDeleteBrand,
  onAddUoM,
  onDeleteUoM,
  userRole,
  permissions,
  searchTerm,
  activeTab,
  onTabChange,
}: ProductViewProps) {
  // const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'brands' | 'uoms'>('products');
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalMode, setModalMode] = useState<'product' | 'category' | 'brand' | 'uom'>('product');
  const [operationMode, setOperationMode] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Form Fields for single dynamic creation
  const [pName, setPName] = useState('');
  const [pPurchaseDate, setPPurchaseDate] = useState('');
  
  const [useCustomCat, setUseCustomCat] = useState(false);
  const [pCatSelect, setPCatSelect] = useState('');
  const [pCatText, setPCatText] = useState('');

  const [useCustomBrand, setUseCustomBrand] = useState(false);
  const [pBrandSelect, setPBrandSelect] = useState('');
  const [pBrandText, setPBrandText] = useState('');

  const [useCustomUom, setUseCustomUom] = useState(false);
  const [pUomSelect, setPUomSelect] = useState('');
  const [pUomText, setPUomText] = useState('');

  const [pQty, setPQty] = useState(1);
  const [pPrice, setPPrice] = useState(0);

  const [genericName, setGenericName] = useState('');
  const [catInput, setCatInput] = useState('');
  const [brandInput, setBrandInput] = useState('');
  const [uomInput, setUomInput] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Safe checks state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const isAuthorized = userRole === 'Admin' || userRole === 'Super Admin';

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(localSearchTerm.toLowerCase())
  );

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(localSearchTerm.toLowerCase())
  );

  const filteredBrands = brands.filter(b =>
    b.name.toLowerCase().includes(localSearchTerm.toLowerCase())
  );

  const filteredUoms = uoms.filter(u =>
    u.name.toLowerCase().includes(localSearchTerm.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthorized) return;

    if (modalMode === 'product') {
      if (!pName) return;

      const finalCategory = useCustomCat ? pCatText.trim() : pCatSelect;
      const finalBrand = useCustomBrand ? pBrandText.trim() : pBrandSelect;
      const finalUom = useCustomUom ? pUomText.trim() : pUomSelect;

      if (!finalCategory || !finalBrand || !finalUom) return;

      if (operationMode === 'add') {
        onAddProductWithCustomFields({
          name: pName,
          category: finalCategory,
          brand: finalBrand,
          uom: finalUom,
          quantity: pQty,
          unitPrice: pPrice,
          purchaseDate: pPurchaseDate || undefined,
        });
      } else if (operationMode === 'edit' && selectedProductId) {
        onUpdateProduct(selectedProductId, {
          name: pName,
          categoryId: finalCategory,
          brandId: finalBrand,
          uomId: finalUom,
          quantity: pQty,
          unitPrice: pPrice,
          purchaseDate: pPurchaseDate || undefined,
        });
      }

      // Reset
      setPName('');
      setPCatText('');
      setPBrandText('');
      setPUomText('');
      setPQty(1);
      setPPrice(0);
      setPPurchaseDate('');
      setShowAddModal(false);
    } else {
      if (!genericName) return;
      if (modalMode === 'category') {
        onAddCategory({ name: genericName });
      } else if (modalMode === 'brand') {
        onAddBrand({ name: genericName });
      } else if (modalMode === 'uom') {
        onAddUoM({ name: genericName });
      }
      setGenericName('');
      setShowAddModal(false);
    }
  };

  const handleDelete = (id: string) => {
    if (!isAuthorized) return;
    onDeleteProduct(id);
    setDeleteConfirmId(null);
  };

  const handleExportXlsx = () => {
    const headers = ['Name', 'Category', 'Brand', 'UoM', 'Quantity', 'Unit Price', 'Purchase Date'];
    const rows = products.map(p => [
      p.name,
      categories.find(c => c.id === p.categoryId)?.name || '',
      brands.find(b => b.id === p.brandId)?.name || '',
      uoms.find(u => u.id === p.uomId)?.name || '',
      p.quantity,
      p.unitPrice,
      p.purchaseDate || ''
    ]);
    const worksheet = utils.aoa_to_sheet([headers, ...rows]);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, 'Products');
    writeFile(workbook, 'products.xlsx');
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
      
      // Assuming json is an array of objects that can be mapped to Product
      // This is a placeholder for actual product addition logic
      console.log('Imported XLSX:', json);
      // You'd call onAddProduct or similar here
    };
    reader.readAsBinaryString(file);
  };

  const handleOpenAddModal = (mode: 'product' | 'category' | 'brand' | 'uom' = 'product') => {
    setModalMode(mode);
    setOperationMode('add');
    setSelectedProductId(null);
    setPName('');
    setPQty(1);
    setPPrice(0);
    setPPurchaseDate('');
    
    // Intelligently set defaults
    if (categories.length > 0) {
      setPCatSelect(categories[0].id);
      setUseCustomCat(false);
    } else {
      setUseCustomCat(true);
    }

    if (brands.length > 0) {
      setPBrandSelect(brands[0].id);
      setUseCustomBrand(false);
    } else {
      setUseCustomBrand(true);
    }

    if (uoms.length > 0) {
      setPUomSelect(uoms[0].id);
      setUseCustomUom(false);
    } else {
      setUseCustomUom(true);
    }

    setShowAddModal(true);
  };

  const handleOpenEditProduct = (p: Product) => {
    setModalMode('product');
    setOperationMode('edit');
    setSelectedProductId(p.id);
    setPName(p.name);
    setPCatSelect(p.categoryId);
    setPBrandSelect(p.brandId);
    setPUomSelect(p.uomId);
    setPQty(p.quantity);
    setPPrice(p.unitPrice);
    setPPurchaseDate(p.purchaseDate || '');
    setUseCustomCat(false);
    setUseCustomBrand(false);
    setUseCustomUom(false);
    setShowAddModal(true);
  };

  const handleOpenViewProduct = (p: Product) => {
    setModalMode('product');
    setOperationMode('view');
    setSelectedProductId(p.id);
    setPName(p.name);
    setPCatSelect(p.categoryId);
    setPBrandSelect(p.brandId);
    setPUomSelect(p.uomId);
    setPQty(p.quantity);
    setPPrice(p.unitPrice);
    setPPurchaseDate(p.purchaseDate || '');
    setUseCustomCat(false);
    setUseCustomBrand(false);
    setUseCustomUom(false);
    setShowAddModal(true);
  };

  return (
    <div className="space-y-6">

      {/* Role-based Warning Banner */}
      {!isAuthorized && (
        <div className="flex items-start gap-3 bg-amber-50 text-amber-800 border border-amber-200 p-4 rounded-xl text-xs font-semibold shadow-xs">
          <Lock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Access Restrained (Role: {userRole})</p>
            <p className="mt-0.5 font-normal text-amber-700/95 leading-relaxed">
              Only <span className="font-semibold text-amber-900">Admin</span> and <span className="font-semibold text-amber-900">Super Admin</span> users can add custom products, delete items, reset lists, or import bulk product databases.
            </p>
          </div>
        </div>
      )}

      {/* Search and action controllers */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 bg-gray-50 dark:bg-slate-900/50 text-gray-800 placeholder-gray-400 rounded-lg text-xs transition-colors focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isAuthorized ? (
            <>
              {activeTab === 'products' && (
                <button
                  onClick={() => handleOpenAddModal('product')}
                  className="flex items-center gap-1.5 bg-black hover:bg-zinc-800 hover:cursor-pointer transition-colors text-white px-3 py-2 rounded-lg text-xs font-semibold shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Product
                </button>
              )}

              {activeTab === 'products' && (
                <>
                  <button
                    onClick={handleExportXlsx}
                    className="flex items-center gap-1.5 bg-black hover:bg-zinc-800 hover:cursor-pointer transition-colors text-white px-3 py-2 rounded-lg text-xs font-semibold shadow-sm"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" /> Export XLSX
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 bg-black hover:bg-zinc-800 hover:cursor-pointer transition-colors text-white px-3 py-2 rounded-lg text-xs font-semibold shadow-sm"
                  >
                    <FileUp className="w-3.5 h-3.5" /> Import XLSX
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".xlsx, .xls"
                    onChange={handleImportXlsx}
                  />
                </>
              )}

              {activeTab === 'categories' && (
                <button
                  onClick={() => handleOpenAddModal('category')}
                  className="flex items-center gap-1.5 bg-black hover:bg-zinc-800 hover:cursor-pointer transition-colors text-white px-3 py-2 rounded-lg text-xs font-semibold shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> Add New Category
                </button>
              )}

              {activeTab === 'brands' && (
                <button
                  onClick={() => handleOpenAddModal('brand')}
                  className="flex items-center gap-1.5 bg-black hover:bg-zinc-800 hover:cursor-pointer transition-colors text-white px-3 py-2 rounded-lg text-xs font-semibold shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> Add New Brand
                </button>
              )}

              {activeTab === 'uoms' && (
                <button
                  onClick={() => handleOpenAddModal('uom')}
                  className="flex items-center gap-1.5 bg-black hover:bg-zinc-800 hover:cursor-pointer transition-colors text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> Add UoM
                </button>
              )}
            </>
          ) : (
            <button
              disabled
              className="flex items-center gap-2 bg-gray-100 text-gray-400 px-4 py-2 rounded-lg text-xs font-medium cursor-not-allowed border border-gray-200/50"
            >
              <Lock className="w-3.5 h-3.5" /> Add locked (General User)
            </button>
          )}
        </div>
      </div>

      {/* Main Lists Rendering depending on Active sub tab */}
      {activeTab === 'products' && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50 text-xs font-bold uppercase text-gray-500 tracking-wider">
                <th className="px-6 py-4 font-semibold">Product Info</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Brand</th>
                <th className="px-6 py-4 font-semibold text-center">UoM</th>
                <th className="px-6 py-4 text-center font-semibold">Purchase Date</th>
                <th className="px-6 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm text-gray-800">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-gray-900 flex items-center gap-3">
                    <Archive className="w-4 h-4 text-emerald-500" />
                    <span className="capitalize">{p.name}</span>
                  </td>
                  <td className="px-6 py-4 text-zinc-500">
                    <span className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-zinc-400" />
                      {categories.find(c => c.id === p.categoryId)?.name || 'Custom Asset'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-500">
                    <span className="flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-zinc-400" />
                      {brands.find(b => b.id === p.brandId)?.name || 'Unbranded'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-zinc-500">
                    <span className="inline-block px-2 py-0.5 rounded-full bg-zinc-100 text-xs font-mono">
                      {uoms.find(u => u.id === p.uomId)?.name || 'Pcs'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-zinc-500">
                    {p.purchaseDate ? (
                      <span className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-lg font-mono">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        {p.purchaseDate}
                      </span>
                    ) : (
                      <span className="text-gray-300 text-xs font-mono">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {!isAuthorized ? (
                      <div className="inline-flex items-center p-1.5 text-gray-400" title="Locked">
                        <Lock className="w-4 h-4" />
                      </div>
                    ) : deleteConfirmId === p.id ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="text-red-500 text-[10px] font-bold animate-pulse flex items-center gap-0.5 mr-0.5">
                          <AlertTriangle className="w-3 h-3" /> Delete?
                        </span>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="px-2 py-0.5 bg-red-600 hover:bg-red-500 text-white rounded text-[11px] font-bold shadow-xs hover:cursor-pointer transition-colors"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-[11px] font-bold hover:cursor-pointer transition-colors"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => handleOpenViewProduct(p)}
                          className="p-1.5 text-emerald-500 hover:text-emerald-600 rounded hover:bg-emerald-50 transition-colors inline-flex items-center hover:cursor-pointer mr-1"
                          title="View Product"
                        >
                          <Eye className="w-4 h-4 text-[#00FF00]" />
                        </button>
                        <button
                          onClick={() => handleOpenEditProduct(p)}
                          className="p-1.5 text-yellow-500 hover:text-yellow-600 rounded hover:bg-yellow-50 transition-colors inline-flex items-center hover:cursor-pointer mr-1"
                          title="Edit Product"
                        >
                          <Pencil className="w-4 h-4 text-[#FFFF00]" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(p.id)}
                          className="p-1.5 text-red-500 hover:text-red-600 rounded hover:bg-red-50 transition-colors inline-flex items-center hover:cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4 text-[#FF0000]" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 text-xs">
                    No products found in our records. Click <strong>"Add Product"</strong> to easily populate your stock list immediately.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Categories sub tabs render */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          {/* Inline Quick Add Category Form */}
          <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-xs max-w-xl">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Quick Add Category</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (catInput.trim()) {
                  onAddCategory({ name: catInput.trim() });
                  setCatInput('');
                }
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                placeholder="Type category name... (e.g. Laptops, Monitors, Network Switches)"
                value={catInput}
                onChange={(e) => setCatInput(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs border border-gray-200 bg-white text-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="px-4 py-1.5 bg-black hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold hover:cursor-pointer transition-colors whitespace-nowrap"
              >
                Add Category
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredCategories.map((c) => (
              <div key={c.id} className="bg-white p-4 border border-gray-200 rounded-xl shadow-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-medium text-gray-800 capitalize">{c.name}</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-zinc-500">{products.filter(p => p.categoryId === c.id).length} Products</span>
                  <button
                    className="p-1.5 text-emerald-500 hover:text-emerald-600 rounded hover:bg-emerald-50 transition-colors inline-flex items-center hover:cursor-pointer"
                    title="View Category"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#00FF00]" />
                  </button>
                  <button
                    className="p-1.5 text-yellow-500 hover:text-yellow-600 rounded hover:bg-yellow-50 transition-colors inline-flex items-center hover:cursor-pointer"
                    title="Edit Category"
                  >
                    <Pencil className="w-3.5 h-3.5 text-[#FFFF00]" />
                  </button>
                  <button
                    onClick={() => onDeleteCategory(c.id)}
                    className="p-1.5 text-red-500 hover:text-red-600 rounded hover:bg-red-50 transition-colors inline-flex items-center hover:cursor-pointer"
                    title="Delete Category"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-[#FF0000]" />
                  </button>
                </div>
              </div>
            ))}
            {filteredCategories.length === 0 && (
              <div className="text-center py-8 col-span-full text-zinc-500 text-xs">No product categories registered. Click "Add Category" or write one in the quick add box above!</div>
            )}
          </div>
        </div>
      )}

      {/* Brands list view */}
      {activeTab === 'brands' && (
        <div className="space-y-6">
          {/* Inline Quick Add Brand Form */}
          <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-xs max-w-xl">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Quick Add Brand</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (brandInput.trim()) {
                  onAddBrand({ name: brandInput.trim() });
                  setBrandInput('');
                }
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                placeholder="Type brand name... (e.g. Apple, Lenovo, Cisco)"
                value={brandInput}
                onChange={(e) => setBrandInput(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs border border-gray-200 bg-white text-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="px-4 py-1.5 bg-black hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold hover:cursor-pointer transition-colors whitespace-nowrap"
              >
                Add Brand
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredBrands.map((b) => (
              <div key={b.id} className="bg-white p-4 border border-gray-200 rounded-xl shadow-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-gray-800 capitalize">{b.name}</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-zinc-500">{products.filter(p => p.brandId === b.id).length} Products</span>
                  <button
                    className="p-1.5 text-emerald-500 hover:text-emerald-600 rounded hover:bg-emerald-50 transition-colors inline-flex items-center hover:cursor-pointer"
                    title="View Brand"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#00FF00]" />
                  </button>
                  <button
                    className="p-1.5 text-yellow-500 hover:text-yellow-600 rounded hover:bg-yellow-50 transition-colors inline-flex items-center hover:cursor-pointer"
                    title="Edit Brand"
                  >
                    <Pencil className="w-3.5 h-3.5 text-[#FFFF00]" />
                  </button>
                  <button
                    onClick={() => onDeleteBrand(b.id)}
                    className="p-1.5 text-red-500 hover:text-red-600 rounded hover:bg-red-50 transition-colors inline-flex items-center hover:cursor-pointer"
                    title="Delete Brand"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-[#FF0000]" />
                  </button>
                </div>
              </div>
            ))}
            {filteredBrands.length === 0 && (
              <div className="text-center py-8 col-span-full text-zinc-500 text-xs">No brands registered. Click "Add Brand" or write one in the quick add box above!</div>
            )}
          </div>
        </div>
      )}

      {/* UoM list components */}
      {activeTab === 'uoms' && (
        <div className="space-y-6">
          {/* Inline Quick Add UoM Form */}
          <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-xs max-w-xl">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Quick Add Unit of Measure (UoM)</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (uomInput.trim()) {
                  onAddUoM({ name: uomInput.trim() });
                  setUomInput('');
                }
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                placeholder="Type unit name... (e.g. Pcs, Units, Boxes)"
                value={uomInput}
                onChange={(e) => setUomInput(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs border border-gray-200 bg-white text-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="px-4 py-1.5 bg-black hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold hover:cursor-pointer transition-colors whitespace-nowrap"
              >
                Add UoM
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredUoms.map((u) => (
              <div key={u.id} className="bg-white p-4 border border-gray-200 rounded-xl shadow-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-teal-400" />
                  <span className="text-sm font-medium text-gray-800 uppercase font-mono">{u.name}</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-zinc-500">{products.filter(p => p.uomId === u.id).length} Products</span>
                  <button
                    className="p-1.5 text-emerald-500 hover:text-emerald-600 rounded hover:bg-emerald-50 transition-colors inline-flex items-center hover:cursor-pointer"
                    title="View UoM"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#00FF00]" />
                  </button>
                  <button
                    className="p-1.5 text-yellow-500 hover:text-yellow-600 rounded hover:bg-yellow-50 transition-colors inline-flex items-center hover:cursor-pointer"
                    title="Edit UoM"
                  >
                    <Pencil className="w-3.5 h-3.5 text-[#FFFF00]" />
                  </button>
                  <button
                    onClick={() => onDeleteUoM(u.id)}
                    className="p-1.5 text-red-500 hover:text-red-600 rounded hover:bg-red-50 transition-colors inline-flex items-center hover:cursor-pointer"
                    title="Delete UoM"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-[#FF0000]" />
                  </button>
                </div>
              </div>
            ))}
            {filteredUoms.length === 0 && (
              <div className="text-center py-8 col-span-full text-zinc-500 text-xs">No Units of Measure registered. Click "Add UoM" or write one in the quick add box above!</div>
            )}
          </div>
        </div>
      )}

      {/* Single Dynamic Add Modal - support selected or typed custom category/brand/uom on the fly */}
      {showAddModal && isAuthorized && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-lg rounded-xl border border-gray-100 overflow-hidden shadow-xl animate-in fade-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 capitalize">
                {operationMode === 'view' ? 'View' : operationMode === 'edit' ? 'Edit' : 'Add New'} {modalMode === 'product' ? 'Product' : modalMode}
              </h3>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="p-1 hover:bg-gray-100 rounded transition-colors hover:cursor-pointer"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {modalMode === 'product' ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Product Name *</label>
                    <input
                      type="text"
                      required
                      disabled={operationMode === 'view'}
                      value={pName}
                      onChange={(e) => setPName(e.target.value)}
                      placeholder="e.g. Dell Latitude 5440"
                      className="w-full px-3 py-2 text-sm border border-gray-200 bg-white text-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-70 disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* Dynamic Category option */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Category *</label>
                      <button
                        type="button"
                        onClick={() => setUseCustomCat(!useCustomCat)}
                        className="text-[10px] font-bold text-emerald-600 hover:underline"
                      >
                        {useCustomCat ? 'Select list instead' : '+ Write custom text'}
                      </button>
                    </div>
                    {useCustomCat ? (
                      <input
                        type="text"
                        required
                        disabled={operationMode === 'view'}
                        value={pCatText}
                        onChange={(e) => setPCatText(e.target.value)}
                        placeholder="Write custom category name, e.g. Gadgets"
                        className="w-full px-3 py-2 text-sm border border-gray-200 bg-white text-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-70 disabled:cursor-not-allowed"
                      />
                    ) : (
                      <select
                        required
                        disabled={operationMode === 'view'}
                        value={pCatSelect}
                        onChange={(e) => setPCatSelect(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 bg-white text-gray-800 rounded-lg focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    )}
                  </div>

                  {/* Dynamic Brand options */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Brand *</label>
                      <button
                        type="button"
                        onClick={() => setUseCustomBrand(!useCustomBrand)}
                        className="text-[10px] font-bold text-emerald-600 hover:underline"
                      >
                        {useCustomBrand ? 'Select list instead' : '+ Write custom brand'}
                      </button>
                    </div>
                    {useCustomBrand ? (
                      <input
                        type="text"
                        required
                        disabled={operationMode === 'view'}
                        value={pBrandText}
                        onChange={(e) => setPBrandText(e.target.value)}
                        placeholder="e.g. Sony"
                        className="w-full px-3 py-2 text-sm border border-gray-200 bg-white text-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-70 disabled:cursor-not-allowed"
                      />
                    ) : (
                      <select
                        required
                        disabled={operationMode === 'view'}
                        value={pBrandSelect}
                        onChange={(e) => setPBrandSelect(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 bg-white text-gray-800 rounded-lg focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                    )}
                  </div>

                  {/* Dynamic UoM options */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Unit of Measure *</label>
                      <button
                        type="button"
                        onClick={() => setUseCustomUom(!useCustomUom)}
                        className="text-[10px] font-bold text-emerald-600 hover:underline"
                      >
                        {useCustomUom ? 'Select list instead' : '+ Write custom UoM'}
                      </button>
                    </div>
                    {useCustomUom ? (
                      <input
                        type="text"
                        required
                        disabled={operationMode === 'view'}
                        value={pUomText}
                        onChange={(e) => setPUomText(e.target.value)}
                        placeholder="e.g. Cartons or Packets"
                        className="w-full px-3 py-2 text-sm border border-gray-200 bg-white text-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-70 disabled:cursor-not-allowed"
                      />
                    ) : (
                      <select
                        required
                        disabled={operationMode === 'view'}
                        value={pUomSelect}
                        onChange={(e) => setPUomSelect(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 bg-white text-gray-800 rounded-lg focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {uoms.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                      </select>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Quantity</label>
                      <input
                        type="number"
                        min="0"
                        disabled={operationMode === 'view'}
                        value={pQty}
                        onChange={(e) => setPQty(parseInt(e.target.value, 10) || 0)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 bg-white text-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-70 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Unit Price (৳)</label>
                      <input
                        type="number"
                        min="0"
                        disabled={operationMode === 'view'}
                        value={pPrice}
                        onChange={(e) => setPPrice(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 bg-white text-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-70 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Purchase Date</label>
                    <input
                      type="date"
                      disabled={operationMode === 'view'}
                      value={pPurchaseDate}
                      onChange={(e) => setPPurchaseDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 bg-white text-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-70 disabled:cursor-not-allowed"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                    {modalMode === 'category' ? 'Category Name' : modalMode === 'brand' ? 'Brand Name' : 'UoM Name'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={genericName}
                    onChange={(e) => setGenericName(e.target.value)}
                    placeholder={`Write name of new ${modalMode}...`}
                    className="w-full px-3 py-2 text-sm border border-gray-200 bg-white text-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              )}

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-200 bg-transparent text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-semibold transition-colors hover:cursor-pointer animate-none"
                >
                  {operationMode === 'view' ? 'Close' : 'Cancel'}
                </button>
                {operationMode !== 'view' && (
                  <button
                    type="submit"
                    className="px-4 py-2 bg-black hover:bg-zinc-800 text-white rounded-lg text-sm font-semibold transition-colors hover:cursor-pointer"
                  >
                    {operationMode === 'add' ? 'Save Item' : 'Update Item'}
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
