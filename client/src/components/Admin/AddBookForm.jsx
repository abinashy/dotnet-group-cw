import { useState } from 'react';
import axios from 'axios';

export default function AddBookForm() {
  const [form, setForm] = useState({
    title: '',
    author: '',
    isbn: '',
    description: '',
    genre: '',
    publisher: '',
    language: '',
    format: '',
    publicationDate: '',
    price: '',
    stock: '',
    isOnSale: false,
    discountPrice: '',
    discountStart: '',
    discountEnd: '',
    isAvailableInLibrary: false
  });
  const [message, setMessage] = useState('');

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5124/api/Book', {
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock, 10),
        discountPrice: form.discountPrice ? parseFloat(form.discountPrice) : null,
        publicationDate: form.publicationDate ? new Date(form.publicationDate) : null,
        discountStart: form.discountStart ? new Date(form.discountStart) : null,
        discountEnd: form.discountEnd ? new Date(form.discountEnd) : null
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setMessage('Book added successfully!');
    } catch {
      setMessage('Error adding book.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block font-semibold mb-1">Title</label>
        <input name="title" className="w-full p-2 border rounded focus:ring-2 focus:ring-orange-400" placeholder="Title" value={form.title} onChange={handleChange} required />
      </div>
      <div>
        <label className="block font-semibold mb-1">Author</label>
        <input name="author" className="w-full p-2 border rounded focus:ring-2 focus:ring-orange-400" placeholder="Author" value={form.author} onChange={handleChange} required />
      </div>
      <div>
        <label className="block font-semibold mb-1">ISBN</label>
        <input name="isbn" className="w-full p-2 border rounded focus:ring-2 focus:ring-orange-400" placeholder="ISBN" value={form.isbn} onChange={handleChange} />
      </div>
      <div>
        <label className="block font-semibold mb-1">Description</label>
        <input name="description" className="w-full p-2 border rounded focus:ring-2 focus:ring-orange-400" placeholder="Description" value={form.description} onChange={handleChange} />
      </div>
      <div>
        <label className="block font-semibold mb-1">Genre</label>
        <input name="genre" className="w-full p-2 border rounded focus:ring-2 focus:ring-orange-400" placeholder="Genre" value={form.genre} onChange={handleChange} />
      </div>
      <div>
        <label className="block font-semibold mb-1">Publisher</label>
        <input name="publisher" className="w-full p-2 border rounded focus:ring-2 focus:ring-orange-400" placeholder="Publisher" value={form.publisher} onChange={handleChange} />
      </div>
      <div>
        <label className="block font-semibold mb-1">Language</label>
        <input name="language" className="w-full p-2 border rounded focus:ring-2 focus:ring-orange-400" placeholder="Language" value={form.language} onChange={handleChange} />
      </div>
      <div>
        <label className="block font-semibold mb-1">Format</label>
        <input name="format" className="w-full p-2 border rounded focus:ring-2 focus:ring-orange-400" placeholder="Format" value={form.format} onChange={handleChange} />
      </div>
      <div>
        <label className="block font-semibold mb-1">Publication Date</label>
        <input name="publicationDate" type="date" className="w-full p-2 border rounded focus:ring-2 focus:ring-orange-400" value={form.publicationDate} onChange={handleChange} />
      </div>
      <div>
        <label className="block font-semibold mb-1">Price</label>
        <input name="price" type="number" step="0.01" className="w-full p-2 border rounded focus:ring-2 focus:ring-orange-400" placeholder="Price" value={form.price} onChange={handleChange} required />
      </div>
      <div>
        <label className="block font-semibold mb-1">Stock</label>
        <input name="stock" type="number" className="w-full p-2 border rounded focus:ring-2 focus:ring-orange-400" placeholder="Stock" value={form.stock} onChange={handleChange} required />
      </div>
      <div className="flex items-center gap-2 mt-6">
        <input name="isOnSale" type="checkbox" checked={form.isOnSale} onChange={handleChange} className="h-4 w-4 text-orange-500" />
        <label className="font-semibold">On Sale</label>
      </div>
      <div>
        <label className="block font-semibold mb-1">Discount Price</label>
        <input name="discountPrice" type="number" step="0.01" className="w-full p-2 border rounded focus:ring-2 focus:ring-orange-400" placeholder="Discount Price" value={form.discountPrice} onChange={handleChange} />
      </div>
      <div>
        <label className="block font-semibold mb-1">Discount Start</label>
        <input name="discountStart" type="date" className="w-full p-2 border rounded focus:ring-2 focus:ring-orange-400" value={form.discountStart} onChange={handleChange} />
      </div>
      <div>
        <label className="block font-semibold mb-1">Discount End</label>
        <input name="discountEnd" type="date" className="w-full p-2 border rounded focus:ring-2 focus:ring-orange-400" value={form.discountEnd} onChange={handleChange} />
      </div>
      <div className="flex items-center gap-2 mt-6">
        <input name="isAvailableInLibrary" type="checkbox" checked={form.isAvailableInLibrary} onChange={handleChange} className="h-4 w-4 text-orange-500" />
        <label className="font-semibold">Available in Library</label>
      </div>
      <div className="md:col-span-2 flex flex-col items-center mt-4">
        <button type="submit" className="px-6 py-2 bg-orange-500 text-white rounded-lg font-semibold shadow hover:bg-orange-600 transition">
          Add Book
        </button>
        {message && <div className="mt-2 text-sm font-medium text-orange-700">{message}</div>}
      </div>
    </form>
  );
} 