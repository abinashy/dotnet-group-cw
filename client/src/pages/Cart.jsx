import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from '../context/CartContext';

// Placeholder for update/remove/clear cart API calls
const getUserId = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  const tokenData = JSON.parse(atob(token.split('.')[1]));
  return tokenData["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
};

const updateCartItemQuantity = async (cartId, quantity) => {
  await fetch(`http://localhost:5124/api/cart/item/${cartId}/quantity`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(quantity)
  });
};

const removeCartItem = async (cartId) => {
  await fetch(`http://localhost:5124/api/cart/item/${cartId}`, { method: 'DELETE' });
};

const clearCart = async (refreshCart) => {
  const userId = getUserId();
  if (!userId) return;
  await fetch(`http://localhost:5124/api/cart/clear?userId=${userId}`, { method: 'DELETE' });
  await refreshCart();
};

const CartDrawer = () => {
  const navigate = useNavigate();
  const { cartItems, cartOpen, closeCart, refreshCart } = useCart();

  const total = cartItems.reduce(
    (sum, item) => sum + ((item.discountedPrice && item.discountedPrice < item.price ? item.discountedPrice : item.price) || 0) * item.quantity,
    0
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-40 z-40 transition-opacity ${cartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={closeCart}
      />
      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 w-full max-w-md h-full bg-white shadow-2xl z-50 transform transition-transform duration-300 ${cartOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ maxWidth: 420 }}
      >
        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-200">
          <h2 className="text-2xl font-bold tracking-tight text-black">CART <span className="text-gray-500">({cartItems.length})</span></h2>
          <button onClick={closeCart} className="text-black hover:bg-gray-100 rounded-full p-2 text-2xl transition">&times;</button>
        </div>
        {cartItems.length === 0 ? (
          <div className="text-gray-500 text-center py-16 text-lg">Your cart is empty.</div>
        ) : (
          <div className="flex flex-col h-[calc(100vh-220px)] overflow-y-auto">
            <ul className="divide-y divide-gray-200">
              {cartItems.map((item, idx) => (
                <li key={item.cartId ?? `${item.bookId}-${idx}`} className="flex gap-4 items-center py-6 px-6 bg-white">
                  <img
                    src={item.coverImageUrl || 'https://placehold.co/80x110?text=No+Image'}
                    alt={item.title || `Book #${item.bookId}`}
                    className="w-20 h-28 object-cover rounded border border-gray-200 bg-gray-50"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-black text-lg truncate">{item.title || `Book #${item.bookId}`}</div>
                    <div className="text-gray-500 text-sm mb-2">{item.authorName}</div>
                    <div className="font-bold text-black text-lg mb-2">
                      {item.discountedPrice && item.discountedPrice < item.price ? (
                        <>
                          <span className="line-through text-gray-400 mr-2">₹{(item.price || 0).toFixed(2)}</span>
                          <span className="text-red-600 font-bold">₹{(item.discountedPrice).toFixed(2)}</span>
                          <span className="ml-2 text-xs text-green-600 font-semibold">-
                            {Math.round(100 * (item.price - item.discountedPrice) / item.price)}%
                          </span>
                        </>
                      ) : (
                        <>₹{(item.price || 0).toFixed(2)}</>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 bg-white text-black text-xl disabled:opacity-40"
                        onClick={async () => {
                          if (item.quantity > 1) {
                            await updateCartItemQuantity(item.cartId, item.quantity - 1);
                            await refreshCart();
                          }
                        }}
                        disabled={item.quantity <= 1}
                        aria-label="Decrease quantity"
                      >-</button>
                      <span className="px-3 text-lg font-semibold">{item.quantity}</span>
                      <button
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 bg-white text-black text-xl disabled:opacity-40"
                        onClick={async () => {
                          if (item.quantity < item.availability) {
                            await updateCartItemQuantity(item.cartId, item.quantity + 1);
                            await refreshCart();
                          }
                        }}
                        disabled={item.quantity >= item.availability}
                        aria-label="Increase quantity"
                      >+</button>
                      <button
                        className="ml-4 text-sm text-red-600 font-semibold hover:underline"
                        onClick={async () => {
                          await removeCartItem(item.cartId);
                          await refreshCart();
                        }}
                        aria-label="Remove item"
                      >REMOVE</button>
                    </div>
                    {item.availability === 0 && (
                      <div className="text-xs text-red-600 font-semibold mt-1">Out of Stock</div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <button
              className="mx-6 mt-4 mb-2 py-2 w-auto px-4 rounded-full bg-black text-white font-bold hover:bg-gray-900 transition self-end"
              onClick={() => clearCart(refreshCart)}
            >
              CLEAR CART
            </button>
          </div>
        )}
        {/* Subtotal and Checkout */}
        <div className="border-t border-gray-200 px-6 py-6 bg-white">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg text-gray-700 font-semibold">SUBTOTAL</span>
            <span className="text-2xl font-bold text-black">₹{total.toFixed(2)}</span>
          </div>
          <button
            className="w-full bg-black text-white py-3 rounded-full font-bold text-lg hover:bg-gray-900 transition"
            onClick={() => navigate("/checkout")}
            disabled={cartItems.length === 0}
          >
            CHECK OUT
          </button>
          <div className="text-xs text-gray-400 text-center mt-3">Shipping, taxes, and discounts are calculated at checkout</div>
        </div>
      </aside>
    </>
  );
};

export default CartDrawer;
