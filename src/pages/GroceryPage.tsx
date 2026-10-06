// NutriVision — Smart Grocery List Page
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, Plus, Check, Trash2, Copy, CheckCheck,
  Tag, Download, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppStore } from '../store/useAppStore';
import type { GroceryItem, GroceryCategory } from '../types';
import './GroceryPage.css';

const DEFAULT_GROCERY_ITEMS: GroceryItem[] = [
  { id: 'g1', name: 'Fresh Baby Spinach', quantity: '250g', category: 'vegetables', checked: false, addedAt: new Date() },
  { id: 'g2', name: 'Avocados', quantity: '2 units', category: 'vegetables', checked: false, addedAt: new Date() },
  { id: 'g3', name: 'Chickpeas (Kabuli Chana)', quantity: '500g', category: 'protein', checked: false, addedAt: new Date() },
  { id: 'g4', name: 'Organic Quinoa', quantity: '500g', category: 'grains', checked: false, addedAt: new Date() },
  { id: 'g5', name: 'Greek Yogurt / Curd', quantity: '400g', category: 'dairy', checked: true, addedAt: new Date() },
  { id: 'g6', name: 'Fresh Tender Coconuts', quantity: '3 units', category: 'beverages', checked: false, addedAt: new Date() },
  { id: 'g7', name: 'Chia Seeds', quantity: '200g', category: 'other', checked: false, addedAt: new Date() },
  { id: 'g8', name: 'Blueberries & Strawberries', quantity: '2 packs', category: 'fruits', checked: false, addedAt: new Date() },
];

export function GroceryPage() {
  const { groceryItems, addGroceryItem, toggleGroceryItem, removeGroceryItem } = useAppStore();
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<GroceryCategory>('vegetables');

  // If store items empty, initialize with defaults
  const activeItems = groceryItems.length > 0 ? groceryItems : DEFAULT_GROCERY_ITEMS;

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const item: GroceryItem = {
      id: `item-${Date.now()}`,
      name: newItemName.trim(),
      quantity: newItemQty.trim() || '1 item',
      category: newItemCategory,
      checked: false,
      addedAt: new Date(),
    };

    addGroceryItem(item);
    setNewItemName('');
    setNewItemQty('');
    toast.success(`Added ${item.name} to grocery list!`);
  };

  const handleCopyClipboard = () => {
    const listText = activeItems
      .map(item => `[${item.checked ? 'X' : ' '}] ${item.name} (${item.quantity}) - ${item.category}`)
      .join('\n');
    navigator.clipboard?.writeText(listText);
    toast.success('Grocery list copied to clipboard!');
  };

  // Group by category
  const categories: GroceryCategory[] = ['vegetables', 'fruits', 'protein', 'grains', 'dairy', 'beverages', 'other'];

  const totalCount = activeItems.length;
  const completedCount = activeItems.filter(i => i.checked).length;

  return (
    <div className="grocery-page">
      {/* Header */}
      <div className="grocery-header">
        <div className="container">
          <div className="grocery-header-row">
            <div>
              <span className="badge badge-accent">
                <ShoppingCart size={14} /> Smart Pantry & Kitchen
              </span>
              <h1 className="grocery-title">Smart Grocery List</h1>
              <p className="grocery-subtitle">
                Automatically consolidated from your 7-Day meal plan and nutrition goals. Take it shopping or export anytime.
              </p>
            </div>

            <div className="grocery-actions">
              <button className="btn btn-secondary btn-sm" onClick={handleCopyClipboard}>
                <Copy size={14} /> Copy List
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Add Item Form Bar */}
        <div className="grocery-card add-item-card">
          <form onSubmit={handleAddItem} className="add-item-form">
            <input
              type="text"
              placeholder="Add food or ingredient (e.g. Rolled Oats, Almond Milk)..."
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="grocery-input name-input"
            />
            <input
              type="text"
              placeholder="Qty (e.g. 500g)"
              value={newItemQty}
              onChange={(e) => setNewItemQty(e.target.value)}
              className="grocery-input qty-input"
            />
            <select
              value={newItemCategory}
              onChange={(e) => setNewItemCategory(e.target.value as GroceryCategory)}
              className="grocery-select"
            >
              <option value="vegetables">🥦 Vegetables</option>
              <option value="fruits">🍎 Fruits</option>
              <option value="protein">🥩 Protein & Pulses</option>
              <option value="grains">🌾 Grains & Flours</option>
              <option value="dairy">🧀 Dairy & Alternatives</option>
              <option value="beverages">🥥 Beverages</option>
              <option value="other">✨ Other Essentials</option>
            </select>
            <button type="submit" className="btn btn-primary">
              <Plus size={16} /> Add
            </button>
          </form>
        </div>

        {/* Progress Bar */}
        <div className="grocery-progress-row">
          <span>{completedCount} of {totalCount} items purchased</span>
          <div className="grocery-progress-bar">
            <div
              className="grocery-progress-fill"
              style={{ width: `${totalCount ? (completedCount / totalCount) * 100 : 0}%` }}
            ></div>
          </div>
        </div>

        {/* Items Grouped by Category */}
        <div className="grocery-categories-grid">
          {categories.map(cat => {
            const itemsInCat = activeItems.filter(i => i.category === cat);
            if (itemsInCat.length === 0) return null;

            return (
              <div key={cat} className="grocery-card category-block">
                <div className="category-title-row">
                  <h3 className="category-heading">{cat.toUpperCase()}</h3>
                  <span className="category-badge">{itemsInCat.length}</span>
                </div>

                <div className="category-items-list">
                  {itemsInCat.map(item => (
                    <div
                      key={item.id}
                      className={`grocery-item-row ${item.checked ? 'checked' : ''}`}
                      onClick={() => toggleGroceryItem(item.id)}
                    >
                      <button className={`check-box-btn ${item.checked ? 'active' : ''}`}>
                        {item.checked && <Check size={14} />}
                      </button>
                      <div className="item-text">
                        <span className="item-name">{item.name}</span>
                        <span className="item-qty">{item.quantity}</span>
                      </div>
                      <button
                        className="item-delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeGroceryItem(item.id);
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
