import React, { useState } from 'react';
import FoodItem from './FoodItem';
import Cart from './Cart';
import UserProfile from './UserProfile';
import { FOOD_ITEMS } from './mockData';

const LandingPage = ({ onLogout }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleAddToCart = (item) => {
    setCartItems(prev => {
      const existingItem = prev.find(i => i.id === item.id);
      if (existingItem) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i);
      }
      return [...prev, item];
    });
    // Optional: Auto-open cart or show toast
    // setIsCartOpen(true); 
  };

  const handleUpdateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems(prev => prev.map(item => item.id === id ? { ...item, quantity: newQuantity } : item));
  };

  const handleRemoveItem = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-surface font-body selection:bg-primary-container selection:text-on-primary-container">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-outline-variant/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                <span className="material-symbols-outlined text-on-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant</span>
              </div>
              <span className="font-headline text-2xl font-black tracking-tighter text-on-surface">No Bail & No Oil</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-on-surface-variant hover:text-on-surface transition-colors"
                aria-label="Open Cart"
              >
                <span className="material-symbols-outlined text-3xl">shopping_cart</span>
                {cartItemCount > 0 && (
                  <span className="absolute top-0 right-0 w-5 h-5 bg-primary rounded-full text-on-primary flex items-center justify-center text-[10px] font-bold shadow-sm">
                    {cartItemCount}
                  </span>
                )}
              </button>
              <div className="w-px h-6 bg-outline-variant/30"></div>
              <UserProfile onLogout={onLogout} />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-high border border-outline-variant/20">
            <span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            <span className="font-label text-xs uppercase tracking-[0.2em] font-bold text-on-surface">Curated Menu</span>
          </div>
          <h1 className="font-headline text-5xl font-black tracking-tight text-on-surface">
            Experience Culinary <span className="text-primary italic">Excellence</span>
          </h1>
          <p className="font-body text-lg text-on-surface-variant leading-relaxed">
            Select from our exclusive range of gourmet dishes, prepared by world-class chefs.
          </p>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FOOD_ITEMS.map((item) => (
            <FoodItem
              key={item.id}
              item={item}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      </main>

      {/* Cart Sidebar */}
      {isCartOpen && (
        <Cart
          cartItems={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onClose={() => setIsCartOpen(false)}
        />
      )}

      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-secondary/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>
    </div>
  );
};

export default LandingPage;
