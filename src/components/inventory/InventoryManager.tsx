import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Settings,
  Edit2,
  Trash2,
  Barcode,
  Check,
  Tag,
  FolderPlus,
  Sliders,
  X,
  PlusCircle,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { InventoryItem, CustomFieldDefinition } from '../../types';

export const InventoryManager: React.FC = () => {
  const {
    activeStore,
    inventory,
    categories,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    adjustStock,
    addCategory,
    addCustomFieldToCategory,
    removeCustomFieldFromCategory,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'items' | 'categories'>('items');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // Add/Edit Item modal state
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Add Category / Custom Field modal state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('emerald');

  const [selectedCatForField, setSelectedCatForField] = useState<string>(categories[0]?.id || '');
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState<'text' | 'number' | 'date' | 'boolean' | 'select'>('text');
  const [newFieldOptions, setNewFieldOptions] = useState('');

  // Item form fields
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState(categories[0]?.id || '');
  const [formStock, setFormStock] = useState(10);
  const [formUnit, setFormUnit] = useState<InventoryItem['unit']>('packet');
  const [formPurchasePrice, setFormPurchasePrice] = useState(80);
  const [formSellingPrice, setFormSellingPrice] = useState(100);
  const [formMrp, setFormMrp] = useState(110);
  const [formLowStockThreshold, setFormLowStockThreshold] = useState(5);
  const [formBarcode, setFormBarcode] = useState('');
  const [formCustomValues, setFormCustomValues] = useState<Record<string, any>>({});

  const storeInventory = inventory.filter((item) => item.storeId === activeStore.id);

  const filteredItems = storeInventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.barcode && item.barcode.includes(searchQuery));
    const matchesCategory =
      selectedCategoryFilter === 'all' || item.category === selectedCategoryFilter;
    const matchesLowStock = !showLowStockOnly || item.stock <= item.lowStockThreshold;

    return matchesSearch && matchesCategory && matchesLowStock;
  });

  const openAddItemModal = () => {
    setEditingItem(null);
    setFormName('');
    setFormCategory(categories[0]?.id || '');
    setFormStock(10);
    setFormUnit('packet');
    setFormPurchasePrice(80);
    setFormSellingPrice(100);
    setFormMrp(110);
    setFormLowStockThreshold(5);
    setFormBarcode(Math.floor(8900000000000 + Math.random() * 99999999999).toString());
    setFormCustomValues({});
    setIsItemModalOpen(true);
  };

  const openEditItemModal = (item: InventoryItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormStock(item.stock);
    setFormUnit(item.unit);
    setFormPurchasePrice(item.purchasePrice);
    setFormSellingPrice(item.sellingPrice);
    setFormMrp(item.mrp || item.sellingPrice);
    setFormLowStockThreshold(item.lowStockThreshold);
    setFormBarcode(item.barcode || '');
    setFormCustomValues(item.customFieldValues || {});
    setIsItemModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingItem) {
      updateInventoryItem({
        ...editingItem,
        name: formName,
        category: formCategory,
        stock: Number(formStock),
        unit: formUnit,
        purchasePrice: Number(formPurchasePrice),
        sellingPrice: Number(formSellingPrice),
        mrp: Number(formMrp),
        lowStockThreshold: Number(formLowStockThreshold),
        barcode: formBarcode,
        customFieldValues: formCustomValues,
      });
    } else {
      addInventoryItem({
        name: formName,
        category: formCategory,
        stock: Number(formStock),
        unit: formUnit,
        purchasePrice: Number(formPurchasePrice),
        sellingPrice: Number(formSellingPrice),
        mrp: Number(formMrp),
        lowStockThreshold: Number(formLowStockThreshold),
        barcode: formBarcode,
        customFieldValues: formCustomValues,
      });
    }
    setIsItemModalOpen(false);
  };

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addCategory(newCatName.trim(), newCatColor);
    setNewCatName('');
    setIsCategoryModalOpen(false);
  };

  const handleAddCustomFieldSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldName.trim() || !selectedCatForField) return;

    const options =
      newFieldType === 'select'
        ? newFieldOptions
            .split(',')
            .map((o) => o.trim())
            .filter(Boolean)
        : undefined;

    addCustomFieldToCategory(selectedCatForField, {
      name: newFieldName.trim(),
      type: newFieldType,
      options,
      required: false,
    });

    setNewFieldName('');
    setNewFieldOptions('');
  };

  // Get active custom fields for current form category
  const currentCategoryConfig = categories.find((c) => c.id === formCategory);

  return (
    <div id="inventory-manager" className="space-y-6 pb-12">
      {/* Header with Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Inventory & Custom Category Fields
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time stock control, price margins, barcodes, and custom attributes for item categories
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="tab-toggle-items"
            onClick={() => setActiveTab('items')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'items'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Stock ({storeInventory.length})
          </button>
          <button
            id="tab-toggle-categories"
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'categories'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Category Custom Fields</span>
          </button>
          {activeTab === 'items' && (
            <button
              id="add-new-item-btn"
              onClick={openAddItemModal}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'items' ? (
        <>
          {/* Filters and Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
              {/* Search input */}
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="inventory-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by item name or barcode..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              {/* Category Filter Pills & Low Stock Toggle */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <select
                  id="category-filter-select"
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none"
                >
                  <option value="all">All Categories ({categories.length})</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <button
                  id="filter-low-stock-toggle"
                  onClick={() => setShowLowStockOnly(!showLowStockOnly)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                    showLowStockOnly
                      ? 'bg-amber-50 border-amber-300 text-amber-900 ring-2 ring-amber-400/20'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Low Stock Only</span>
                </button>
              </div>
            </div>
          </div>

          {/* Inventory Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Item Name & SKU</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3 text-center">Stock Level</th>
                    <th className="py-3 px-3">Buy Price</th>
                    <th className="py-3 px-3">Sell Price</th>
                    <th className="py-3 px-3">Custom Details</th>
                    <th className="py-3 px-3 text-center">Quick Adjust</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                        No inventory products match the search filters.
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => {
                      const isLowStock = item.stock <= item.lowStockThreshold;
                      const cat = categories.find((c) => c.id === item.category);

                      return (
                        <tr key={item.id} className={`hover:bg-slate-50/70 transition-colors ${isLowStock ? 'bg-amber-50/20' : ''}`}>
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900 text-xs">{item.name}</div>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono mt-0.5">
                              <Barcode className="w-3 h-3" />
                              <span>{item.barcode || 'No Barcode'}</span>
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700">
                              {cat?.name || item.category}
                            </span>
                          </td>

                          <td className="py-3 px-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <span className={`font-bold font-mono text-xs ${isLowStock ? 'text-red-600' : 'text-slate-800'}`}>
                                {item.stock} {item.unit}
                              </span>
                              {isLowStock && (
                                <span className="px-1.5 py-0.2 rounded bg-red-100 text-red-700 text-[9px] font-bold uppercase">
                                  Low
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400">Min: {item.lowStockThreshold}</div>
                          </td>

                          <td className="py-3 px-3 font-mono text-slate-500">
                            ₹{item.purchasePrice}
                          </td>

                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-900 font-mono">₹{item.sellingPrice}</div>
                            {item.mrp && item.mrp > item.sellingPrice && (
                              <div className="text-[10px] text-slate-400 line-through">MRP ₹{item.mrp}</div>
                            )}
                          </td>

                          {/* Custom Fields Summary */}
                          <td className="py-3 px-3">
                            {item.customFieldValues && Object.keys(item.customFieldValues).length > 0 ? (
                              <div className="flex flex-wrap gap-1 max-w-[200px]">
                                {Object.entries(item.customFieldValues).slice(0, 2).map(([key, val]) => (
                                  <span key={key} className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                                    {String(val)}
                                  </span>
                                ))}
                                {Object.keys(item.customFieldValues).length > 2 && (
                                  <span className="text-[10px] text-slate-400">+{Object.keys(item.customFieldValues).length - 2} more</span>
                                )}
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">None</span>
                            )}
                          </td>

                          {/* Quick Adjust Buttons */}
                          <td className="py-3 px-3 text-center">
                            <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                              <button
                                onClick={() => adjustStock(item.id, -1)}
                                title="Reduce 1"
                                className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-white hover:text-slate-900 rounded font-bold"
                              >
                                -
                              </button>
                              <span className="w-8 text-center text-xs font-mono font-bold text-slate-800">
                                {item.stock}
                              </span>
                              <button
                                onClick={() => adjustStock(item.id, 1)}
                                title="Add 1"
                                className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-white hover:text-slate-900 rounded font-bold"
                              >
                                +
                              </button>
                              <button
                                onClick={() => adjustStock(item.id, 10)}
                                title="Add 10 pack"
                                className="px-1.5 h-6 text-[10px] text-emerald-700 hover:bg-emerald-100 rounded font-bold ml-1"
                              >
                                +10
                              </button>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openEditItemModal(item)}
                                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
                                title="Edit Product"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Delete "${item.name}" from inventory?`)) {
                                    deleteInventoryItem(item.id);
                                  }
                                }}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                title="Delete Product"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Categories & Custom Fields View */
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-200">
            <div>
              <h2 className="text-base font-bold text-slate-900">Custom Category Schema Builder</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Define specialized attributes for each item category (e.g. FSSAI Batch for spices, Shelf Life for oils, Mandi for grains)
              </p>
            </div>
            <button
              id="btn-create-category"
              onClick={() => setIsCategoryModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Create New Category</span>
            </button>
          </div>

          {/* Category Cards with custom fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map((category) => (
              <div
                key={category.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                      <h3 className="font-bold text-sm text-slate-800">{category.name}</h3>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">
                      ID: {category.id}
                    </span>
                  </div>

                  {/* List of Custom Fields in this Category */}
                  <div className="mt-3 space-y-2">
                    <div className="text-xs font-semibold text-slate-600">Configured Custom Fields:</div>
                    {category.customFields.length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-2">
                        No custom fields yet. Add one below!
                      </p>
                    ) : (
                      <div className="space-y-1.5">
                        {category.customFields.map((field) => (
                          <div
                            key={field.id}
                            className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200/70 text-xs"
                          >
                            <div>
                              <span className="font-semibold text-slate-800">{field.name}</span>
                              <span className="ml-2 text-[10px] font-mono bg-slate-200 px-1.5 py-0.2 rounded text-slate-600">
                                {field.type}
                              </span>
                              {field.options && (
                                <div className="text-[10px] text-slate-400 mt-0.5">
                                  Options: {field.options.join(', ')}
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => removeCustomFieldFromCategory(category.id, field.id)}
                              className="text-slate-400 hover:text-red-600 p-1"
                              title="Remove field"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Inline Add Field Trigger */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setSelectedCatForField(category.id);
                      setNewFieldName('');
                      setNewFieldOptions('');
                    }}
                    className={`w-full py-1.5 text-xs rounded-lg border font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      selectedCatForField === category.id
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                        : 'border-dashed border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>{selectedCatForField === category.id ? 'Editing Form Below' : 'Add Custom Field to this Category'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Field Form */}
          {selectedCatForField && (
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-300 shadow-xs">
              <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                <span>
                  Add Custom Field to Category:{' '}
                  <span className="text-emerald-700">
                    {categories.find((c) => c.id === selectedCatForField)?.name}
                  </span>
                </span>
              </h3>

              <form onSubmit={handleAddCustomFieldSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Field Label / Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newFieldName}
                    onChange={(e) => setNewFieldName(e.target.value)}
                    placeholder="e.g. FSSAI License, Storage Rack, Expiry"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Field Data Type
                  </label>
                  <select
                    value={newFieldType}
                    onChange={(e: any) => setNewFieldType(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="text">Text / String</option>
                    <option value="number">Number (Qty / Days)</option>
                    <option value="date">Date</option>
                    <option value="boolean">Yes / No Toggle</option>
                    <option value="select">Dropdown Options</option>
                  </select>
                </div>

                {newFieldType === 'select' && (
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Options (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={newFieldOptions}
                      onChange={(e) => setNewFieldOptions(e.target.value)}
                      placeholder="Option 1, Option 2, Option 3"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                    />
                  </div>
                )}

                <div className="sm:col-span-3 flex justify-end gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCatForField('')}
                    className="px-3 py-2 text-xs text-slate-600 hover:bg-slate-200 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs"
                  >
                    Save Custom Field to Category
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl my-8 overflow-hidden">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold">
                  {editingItem ? 'Edit Product Details' : 'Add New Kirana Product'}
                </h2>
              </div>
              <button
                onClick={() => setIsItemModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Product Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Aashirvaad Shudh Chakki Atta 10kg"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Item Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => {
                      setFormCategory(e.target.value);
                      // Reset custom field values when category changes
                      setFormCustomValues({});
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Measurement Unit <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formUnit}
                    onChange={(e: any) => setFormUnit(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="packet">Packet (pkt)</option>
                    <option value="kg">Kilogram (kg)</option>
                    <option value="g">Gram (g)</option>
                    <option value="L">Liter (L)</option>
                    <option value="ml">Milliliter (ml)</option>
                    <option value="piece">Piece (pc)</option>
                    <option value="box">Box (box)</option>
                    <option value="bag">Bag / Sack (bag)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Current Stock Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formStock}
                    onChange={(e) => setFormStock(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Low Stock Threshold (Alert Level)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formLowStockThreshold}
                    onChange={(e) => setFormLowStockThreshold(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Purchase / Buy Cost Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    required
                    value={formPurchasePrice}
                    onChange={(e) => setFormPurchasePrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Selling Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    required
                    value={formSellingPrice}
                    onChange={(e) => setFormSellingPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    MRP Printed Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={formMrp}
                    onChange={(e) => setFormMrp(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Barcode / SKU Code
                  </label>
                  <input
                    type="text"
                    value={formBarcode}
                    onChange={(e) => setFormBarcode(e.target.value)}
                    placeholder="e.g. 8901234567890"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              {/* Dynamic Custom Category Fields Section */}
              {currentCategoryConfig && currentCategoryConfig.customFields.length > 0 && (
                <div className="pt-4 border-t border-slate-200">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Tag className="w-3.5 h-3.5 text-emerald-600" />
                    <h3 className="text-xs font-bold text-slate-800">
                      Category Custom Fields ({currentCategoryConfig.name})
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    {currentCategoryConfig.customFields.map((field) => (
                      <div key={field.id}>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          {field.name}
                        </label>
                        {field.type === 'boolean' ? (
                          <label className="flex items-center gap-2 cursor-pointer mt-1 text-xs text-slate-700">
                            <input
                              type="checkbox"
                              checked={!!formCustomValues[field.id]}
                              onChange={(e) =>
                                setFormCustomValues((prev) => ({
                                  ...prev,
                                  [field.id]: e.target.checked,
                                }))
                              }
                              className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                            />
                            <span>Yes / Enabled</span>
                          </label>
                        ) : field.type === 'select' ? (
                          <select
                            value={formCustomValues[field.id] || ''}
                            onChange={(e) =>
                              setFormCustomValues((prev) => ({
                                ...prev,
                                [field.id]: e.target.value,
                              }))
                            }
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                          >
                            <option value="">-- Select option --</option>
                            {field.options?.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                            value={formCustomValues[field.id] || ''}
                            onChange={(e) =>
                              setFormCustomValues((prev) => ({
                                ...prev,
                                [field.id]: e.target.value,
                              }))
                            }
                            placeholder={`Enter ${field.name.toLowerCase()}`}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  {editingItem ? 'Update Product' : 'Save to Inventory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <h3 className="text-sm font-bold">Add New Item Category</h3>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddCategorySubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Frozen Foods, Pooja Items"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tag Color
                </label>
                <select
                  value={newCatColor}
                  onChange={(e) => setNewCatColor(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                >
                  <option value="emerald">Emerald Green</option>
                  <option value="amber">Amber Warm</option>
                  <option value="blue">Sapphire Blue</option>
                  <option value="purple">Purple</option>
                  <option value="rose">Rose Red</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
