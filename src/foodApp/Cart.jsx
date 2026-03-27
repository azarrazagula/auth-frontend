import React, { useState } from 'react';
import { submitBilling } from '../utils/api';

const Cart = ({ cartItems, onUpdateQuantity, onRemoveItem, onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [billingInfo, setBillingInfo] = useState({
    fullName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + tax;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBillingInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return alert('Your cart is empty!');

    setIsSubmitting(true);
    try {
      await submitBilling(billingInfo);
      alert(`Checkout successful for $${total.toFixed(2)}!\nBilling Address: ${billingInfo.address}, ${billingInfo.city}`);
      onClose();
    } catch (error) {
      console.error('Checkout error:', error);
      alert(error.message || 'There was an error processing your checkout.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-surface max-h-[90vh] shadow-2xl overflow-y-auto animate-in zoom-in-95 duration-300 rounded-[32px] border border-outline-variant/10">

        {/* Header */}
        <div className="sticky top-0 bg-surface/90 backdrop-blur-md p-6 border-b border-outline-variant/20 flex items-center justify-between z-10">
          <h2 className="font-headline text-2xl font-black text-on-surface">Your Cart</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Cart Items */}
          <div className="space-y-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-8 text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl mb-2 opacity-50">shopping_cart</span>
                <p className="font-body text-sm">Your cart is empty.</p>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/10">
                  <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-headline font-bold text-sm text-on-surface line-clamp-1">{item.name}</h4>
                      <p className="font-body text-xs text-on-surface-variant">${item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center bg-surface-container-high rounded-full p-0.5 border border-outline-variant/10">
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center rounded-full text-on-surface hover:bg-surface-bright transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">remove</span>
                        </button>
                        <span className="w-6 text-center font-headline font-bold text-xs text-on-surface">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center rounded-full text-on-surface hover:bg-surface-bright transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">add</span>
                        </button>
                      </div>
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="text-error text-xs font-bold uppercase tracking-wider hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pricing Summary */}
          {cartItems.length > 0 && (
            <div className="space-y-3 p-6 rounded-2xl bg-surface-container border border-outline-variant/10">
              <div className="flex justify-between font-body text-sm text-on-surface-variant">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-body text-sm text-on-surface-variant">
                <span>Tax (8%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="pt-3 border-t border-outline-variant/20 flex justify-between items-center">
                <span className="font-headline font-bold text-on-surface">Total</span>
                <span className="font-headline text-xl font-black text-primary">${total.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Billing Form */}
          {cartItems.length > 0 && (
            <form onSubmit={handleCheckout} className="space-y-6 pt-4 border-t border-outline-variant/20">
              <h3 className="font-headline text-lg font-bold text-on-surface">Billing Details</h3>

              <div className="space-y-4">
                <div className="space-y-1 text-left">
                  <label className="block font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={billingInfo.fullName}
                    onChange={handleInputChange}
                    required
                    className="w-full py-3 px-4 bg-surface-container-high border-none rounded-xl text-on-surface focus:ring-2 focus:ring-primary/40 focus:bg-surface-container-highest transition-all text-sm"
                    placeholder="Jane Doe"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="block font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={billingInfo.email}
                    onChange={handleInputChange}
                    required
                    className="w-full py-3 px-4 bg-surface-container-high border-none rounded-xl text-on-surface focus:ring-2 focus:ring-primary/40 focus:bg-surface-container-highest transition-all text-sm"
                    placeholder="jane@example.com"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="block font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Street Address</label>
                  <input
                    type="text"
                    name="address"
                    value={billingInfo.address}
                    onChange={handleInputChange}
                    required
                    className="w-full py-3 px-4 bg-surface-container-high border-none rounded-xl text-on-surface focus:ring-2 focus:ring-primary/40 focus:bg-surface-container-highest transition-all text-sm"
                    placeholder="123 Culinary Lane"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 text-left">
                    <label className="block font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">City</label>
                    <input
                      type="text"
                      name="city"
                      value={billingInfo.city}
                      onChange={handleInputChange}
                      required
                      className="w-full py-3 px-4 bg-surface-container-high border-none rounded-xl text-on-surface focus:ring-2 focus:ring-primary/40 focus:bg-surface-container-highest transition-all text-sm"
                      placeholder="Foodville"
                    />
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="block font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">State</label>
                    <input
                      type="text"
                      name="state"
                      value={billingInfo.state}
                      onChange={handleInputChange}
                      required
                      className="w-full py-3 px-4 bg-surface-container-high border-none rounded-xl text-on-surface focus:ring-2 focus:ring-primary/40 focus:bg-surface-container-highest transition-all text-sm"
                      placeholder="California"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 text-left">
                    <label className="block font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">ZIP Code</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={billingInfo.zipCode}
                      onChange={handleInputChange}
                      required
                      className="w-full py-3 px-4 bg-surface-container-high border-none rounded-xl text-on-surface focus:ring-2 focus:ring-primary/40 focus:bg-surface-container-highest transition-all text-sm"
                      placeholder="90210"
                    />
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="block font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Country</label>
                    <input
                      type="text"
                      name="country"
                      value={billingInfo.country}
                      onChange={handleInputChange}
                      required
                      className="w-full py-3 px-4 bg-surface-container-high border-none rounded-xl text-on-surface focus:ring-2 focus:ring-primary/40 focus:bg-surface-container-highest transition-all text-sm"
                      placeholder="USA"
                    />
                  </div>
                </div>
              </div>

              <div className="sticky bottom-6 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-primary text-on-primary-fixed font-headline font-extrabold text-sm uppercase tracking-[0.2em] rounded-full shadow-[0_20px_40px_-10px_rgba(255,144,106,0.3)] hover:bg-primary-container active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Processing...' : `Place Order • $${total.toFixed(2)}`}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default Cart;
