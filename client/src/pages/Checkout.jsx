import React from "react";

const mockCart = [
  {
    id: 1,
    title: "Mystery of the Lost Island",
    author: "Anne Smith",
    price: 14.99,
    image: "https://covers.openlibrary.org/b/id/10523338-L.jpg",
    rating: 3,
  },
  {
    id: 2,
    title: "Cooking Made Easy",
    author: "Emily Clark",
    price: 9.99,
    image: "https://covers.openlibrary.org/b/id/10523339-L.jpg",
    rating: 3,
  },
];

const shipping = 80.0;
const subtotal = mockCart.reduce((sum, item) => sum + item.price, 0);
const total = subtotal + shipping;

const Checkout = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Books</h1>
        <nav className="space-x-6 text-gray-600">
          <a href="#" className="hover:text-black">HOME</a>
          <a href="#" className="hover:text-black">EXPLORE</a>
          <a href="#" className="hover:text-black">SHOP</a>
          <a href="#" className="hover:text-black">SELL YOUR BOOK</a>
          <span className="relative">
            <svg className="inline w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m5-9v9m4-9v9m1-9h2a2 2 0 002-2V7a2 2 0 00-2-2h-2.28a2 2 0 01-1.72-1H7.28a2 2 0 01-1.72 1H3"></path></svg>
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1">{mockCart.length}</span>
          </span>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row max-w-5xl mx-auto w-full p-4 gap-8">
        {/* Cart Items */}
        <section className="flex-1 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Your Cart</h2>
          <ul>
            {mockCart.map((item) => (
              <li key={item.id} className="flex items-center justify-between border-b py-4 last:border-b-0">
                <div className="flex items-center gap-4">
                  <img src={item.image} alt={item.title} className="w-16 h-20 object-cover rounded shadow" />
                  <div>
                    <div className="font-medium">{item.title}</div>
                    <div className="text-sm text-gray-500">{item.author}</div>
                    <div className="flex items-center mt-1">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${i < item.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.175 0l-3.385 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.045 9.394c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.967z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-semibold text-lg">₹{item.price.toFixed(2)}</span>
                  <button className="mt-2 text-red-500 hover:underline text-sm flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Order Summary */}
        <aside className="w-full md:w-80 bg-white rounded-lg shadow p-6 h-fit">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="flex justify-between mb-2">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Shipping</span>
            <span>₹{shipping.toFixed(2)}</span>
          </div>
          <div className="text-xs text-gray-500 mb-4">Spend ₹474.02 more to get FREE Shipping!</div>
          <div className="flex justify-between font-bold text-lg mb-6">
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
          <button className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-700 transition">Proceed to Checkout</button>
        </aside>
      </main>
    </div>
  );
};

export default Checkout;
