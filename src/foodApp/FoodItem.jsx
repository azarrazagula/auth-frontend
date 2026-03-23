import React, { useState } from 'react';

const FoodItem = ({ item, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);

  const increment = () => setQuantity(prev => prev + 1);
  const decrement = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const handleAdd = () => {
    onAddToCart({ ...item, quantity });
    setQuantity(1); // Reset after adding
  };

  return (
    <div className="group bg-surface-container-low rounded-[32px] overflow-hidden border border-outline-variant/10 hover:border-primary/20 hover:shadow-[0_20px_40px_-15px_rgba(255,144,106,0.15)] transition-all duration-500">
      <div className="relative h-64 overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute top-4 right-4 px-3 py-1 bg-surface/80 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest text-primary border border-outline-variant/20">
          {item.category}
        </div>
      </div>
      
      <div className="p-8 space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <h3 className="font-headline text-xl font-bold text-on-surface leading-tight">{item.name}</h3>
            <span className="font-headline text-lg font-black text-primary">${item.price.toFixed(2)}</span>
          </div>
          <p className="font-body text-sm text-on-surface-variant line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        <div className="flex items-center justify-between gap-4 pt-4 border-t border-outline-variant/10">
          <div className="flex items-center bg-surface-container-high rounded-full p-1 border border-outline-variant/10">
            <button
              onClick={decrement}
              className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface hover:bg-surface-bright transition-colors"
            >
              <span className="material-symbols-outlined text-lg">remove</span>
            </button>
            <span className="w-8 text-center font-headline font-bold text-sm text-on-surface">
              {quantity}
            </span>
            <button
              onClick={increment}
              className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface hover:bg-surface-bright transition-colors"
            >
              <span className="material-symbols-outlined text-lg">add</span>
            </button>
          </div>

          <button
            onClick={handleAdd}
            className="flex-1 py-3 px-6 bg-primary text-on-primary-fixed font-label font-bold text-xs uppercase tracking-[0.15em] rounded-full hover:bg-primary-container active:scale-95 transition-all shadow-lg shadow-primary/10"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodItem;
