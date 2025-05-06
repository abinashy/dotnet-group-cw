import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BooksCatalogue = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBooks = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get('http://localhost:5124/api/book');
                setBooks(response.data);
            } catch (err) {
                setError('Failed to fetch books.');
            } finally {
                setLoading(false);
            }
        };
        fetchBooks();
    }, []);

    return (
        <div style={{ padding: '2rem' }}>
            <h2 style={{ fontWeight: 700 }}>Best Sellers</h2>
            <p style={{ color: '#555', marginBottom: '2rem' }}>
                Find Your Next Great Read Among Our Best Sellers.
            </p>
            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <p style={{ color: 'red' }}>{error}</p>
            ) : (
                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                    {books.map((book) => (
                        <div
                            key={book.BookId}
                            style={{
                                width: 220,
                                border: '1px solid #eee',
                                borderRadius: 10,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                padding: 16,
                                background: '#fff',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                            }}
                        >
                            <img
                                src={book.CoverImageUrl || 'https://placehold.co/180x260?text=No+Image'}
                                alt={book.Title}
                                style={{ width: 180, height: 260, objectFit: 'cover', borderRadius: 6, marginBottom: 16 }}
                            />
                            <div style={{ fontWeight: 600, fontSize: 16, textAlign: 'center', marginBottom: 4 }}>
                                {book.Title}
                            </div>
                            <div style={{ color: '#555', fontSize: 14, marginBottom: 8, textAlign: 'center' }}>
                                by {book.Authors && book.Authors.length > 0 ? book.Authors.map(a => `${a.FirstName} ${a.LastName}`).join(', ') : 'Unknown Author'}
                            </div>
                            <div style={{ fontWeight: 500, fontSize: 16, marginBottom: 12 }}>
                                Rs. {book.Price}
                            </div>
                            <button
                                style={{
                                    border: '1px solid #1976d2',
                                    background: '#fff',
                                    color: '#1976d2',
                                    borderRadius: 4,
                                    padding: '8px 0',
                                    width: '100%',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'background 0.2s',
                                }}
                                onClick={() => alert(`Added '${book.Title}' to cart!`)}
                            >
                                ADD TO CART
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BooksCatalogue; 