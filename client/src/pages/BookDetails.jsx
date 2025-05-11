import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { FaBook, FaHashtag, FaLanguage, FaGlobe } from 'react-icons/fa';
import { BiBarcode } from 'react-icons/bi';
import { FiBox } from 'react-icons/fi';
import { FaRegCopy } from 'react-icons/fa';
import AddToCartButton from '../components/Buttons/AddToCartButton';
import { addToCart } from '../utils/cart';

// Helper to get initials from name
function getInitials(name) {
    if (!name) return '';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
// Helper to get time ago (simple, for demo)
function timeAgo(dateString) {
    if (!dateString) return '';
    const now = new Date();
    const then = new Date(dateString);
    const diff = now - then;
    const year = 1000 * 60 * 60 * 24 * 365;
    const month = 1000 * 60 * 60 * 24 * 30;
    const day = 1000 * 60 * 60 * 24;
    if (diff > year) return `${Math.floor(diff / year)} year ago`;
    if (diff > month) return `${Math.floor(diff / month)} month ago`;
    if (diff > day) return `${Math.floor(diff / day)} day ago`;
    return 'Today';
}

const BookDetails = () => {
    const { id } = useParams();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        const fetchBook = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await axios.get(`http://localhost:5124/api/books/${id}`);
                setBook(res.data);
                setReviews(res.data.Reviews || []);
            } catch {
                setError('Failed to fetch book details.');
            } finally {
                setLoading(false);
            }
        };
        fetchBook();
    }, [id]);

    // Quantity handlers
    const handleDecrease = () => {
        setQuantity(q => (q > 1 ? q - 1 : 1));
    };
    const handleIncrease = () => {
        setQuantity(q => q + 1);
    };

    if (loading) return <div style={{ padding: 40 }}>Loading...</div>;
    if (error) return <div style={{ padding: 40, color: 'red' }}>{error}</div>;
    if (!book) return null;

    // Helper for genres
    // const genres = book.genres && book.genres.length > 0
    //     ? book.genres.map(g => g.name).join(', ')
    //     : 'N/A';
    const authors = book.authors && book.authors.length > 0
        ? book.authors.map(a => [a.firstName, a.lastName].filter(Boolean).join(' ')).join(', ')
        : 'Unknown Author';

    // Breadcrumbs (simulate)
    const breadcrumbs = [
        { name: 'Home', link: '/' },
        ...(book.genres && book.genres.length > 0 ? book.genres.map(g => ({ name: g.name, link: '#' })) : []),
        { name: book.title }
    ];

    // Ratings summary
    // const avgRating = reviews.length > 0 ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length) : 0;

    const isOutOfStock = book.availability === 0;

    return (
        <div style={{ maxWidth: 1300, margin: '0 auto', padding: '32px 16px', display: 'flex', flexDirection: 'column', gap: 32 }}>
            {/* Breadcrumbs */}
            <div style={{ fontSize: 15, color: '#888', marginBottom: 8 }}>
                {breadcrumbs.map((b, i) => (
                    <span key={i}>
                        {i > 0 && ' / '}
                        {b.link ? <a href={b.link} style={{ color: '#1976d2', textDecoration: 'none' }}>{b.name}</a> : b.name}
                    </span>
                ))}
            </div>
            {/* Main Section */}
            <div style={{ display: 'flex', gap: 40, alignItems: 'flex-start' }}>
                {/* Cover & Genres */}
                <div style={{ minWidth: 260 }}>
                    <img
                        src={book.coverImageUrl || 'https://placehold.co/240x340?text=No+Image'}
                        alt={book.title}
                        style={{ width: 240, height: 340, objectFit: 'cover', borderRadius: 8, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}
                    />
                    {/* Genres */}
                    <div style={{ marginTop: 18 }}>
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>Genres:</div>
                        {book.genres && book.genres.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {book.genres.map((g) => (
                                    <a key={g.genreId} href="#" style={{ color: '#1976d2', textDecoration: 'underline', cursor: 'pointer', fontSize: 15 }}>{g.name}</a>
                                ))}
                            </div>
                        ) : 'N/A'}
                    </div>
                </div>
                {/* Main Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                        <span style={{ fontWeight: 600, fontSize: 16, background: '#f4f6fa', borderRadius: 6, padding: '2px 12px' }}>{book.format || 'Paper Back'}</span>
                    </div>
                    <h1 style={{ fontWeight: 700, fontSize: 32, margin: 0 }}>{book.title}</h1>
                    <div style={{ fontSize: 18, color: '#444', marginBottom: 8 }}>by {authors}</div>
                    {/* Ratings and Reviews */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
                        <span style={{ color: '#f7b500', fontSize: 20 }}>★</span>
                        <span style={{ fontWeight: 600 }}>{reviews.length > 0 ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1) : 'N/A'}</span>
                        <span style={{ color: '#888' }}>| {reviews.length} Book Review{reviews.length !== 1 ? 's' : ''}</span>
                    </div>
                    {/* Seller */}
                    <div style={{ marginBottom: 8 }}>
                        <span>Sold by <span style={{ color: '#1976d2', fontWeight: 500, cursor: 'pointer' }}>BookNook</span></span>
                        {book.stock && book.stock < 10 && (
                            <span style={{ color: 'red', marginLeft: 16 }}>Only {book.stock} item{book.stock > 1 ? 's' : ''} left in stock!</span>
                        )}
                    </div>
                    {/* Description */}
                    <div style={{ margin: '24px 0' }}>
                        <h2 style={{ fontWeight: 700, fontSize: 22, marginBottom: 8 }}>Description</h2>
                        <div style={{ color: '#222', fontSize: 17, lineHeight: 1.7, textAlign: 'justify' }}>{book.description || 'No description available.'}</div>
                    </div>
                    {/* Other Info */}
                    <div style={{ marginTop: 40, marginLeft: 8 /* adjust as needed to align with description */ }}>
                        <h2 style={{ fontWeight: 700, fontSize: 28, marginBottom: 24 }}>Other info</h2>
                        <div style={{ display: 'flex', gap: 24, flexWrap: 'nowrap', justifyContent: 'flex-start' }}>
                            {/* Page Count */}
                            <div style={{ background: '#fafbfc', border: '1px solid #e5e7eb', borderRadius: 12, padding: '28px 32px', minWidth: 140, textAlign: 'center', flex: 1, maxWidth: 200, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ color: '#888', fontWeight: 500, fontSize: 16, marginBottom: 6 }}>Page Count</div>
                                <FaRegCopy size={28} style={{ marginBottom: 8 }} />
                                <div style={{ fontWeight: 700, fontSize: 14, marginTop: 2 }}>{book.pageCount ? `${book.pageCount} Pages` : 'N/A'}</div>
                            </div>
                            {/* ISBN */}
                            <div style={{ background: '#fafbfc', border: '1px solid #e5e7eb', borderRadius: 12, padding: '28px 32px', minWidth: 140, textAlign: 'center', flex: 1, maxWidth: 200, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ color: '#888', fontWeight: 500, fontSize: 16, marginBottom: 6 }}>ISBN</div>
                                <BiBarcode size={28} style={{ marginBottom: 8 }} />
                                <div style={{ fontWeight: 700, fontSize: 14, marginTop: 2, wordBreak: 'break-all' }}>{book.isbn || 'N/A'}</div>
                            </div>
                            {/* Language */}
                            <div style={{ background: '#fafbfc', border: '1px solid #e5e7eb', borderRadius: 12, padding: '28px 32px', minWidth: 140, textAlign: 'center', flex: 1, maxWidth: 200, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ color: '#888', fontWeight: 500, fontSize: 16, marginBottom: 6 }}>Language</div>
                                <FaGlobe size={28} style={{ marginBottom: 8 }} />
                                <div style={{ fontWeight: 700, fontSize: 14, marginTop: 2 }}>{book.language || 'N/A'}</div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Right Side Card */}
                <div style={{ minWidth: 300, background: '#fff', border: '1px solid #eee', borderRadius: 12, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                    <h3 style={{ fontWeight: 600, fontSize: 20, marginBottom: 12 }}>Total Price</h3>
                    <hr style={{ border: 'none', borderTop: '1px solid #e0e0e0', margin: '0 0 18px 0' }} />
                    <div style={{ fontWeight: 700, fontSize: 24, margin: '0 0 18px 0' }}>Rs. {book.price}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                        <button onClick={handleDecrease} style={{ background: '#eee', border: 'none', borderRadius: 6, width: 32, height: 32, fontSize: 20, cursor: 'pointer' }}>-</button>
                        <span style={{ fontWeight: 600 }}>QTY: {quantity}</span>
                        <button onClick={handleIncrease} style={{ background: '#eee', border: 'none', borderRadius: 6, width: 32, height: 32, fontSize: 20, cursor: 'pointer' }}>+</button>
                    </div>
                    <AddToCartButton
                        onClick={async () => {
                            try {
                                if (!quantity || quantity < 1) {
                                    alert('Please select a valid quantity.');
                                    return;
                                }
                                await addToCart({ bookId: book.bookId, quantity });
                                alert('Book added to cart!');
                            } catch {
                                alert('Failed to add to cart.');
                            }
                        }}
                        disabled={isOutOfStock}
                        style={{
                            background: isOutOfStock ? '#eee' : '#1976d2',
                            color: isOutOfStock ? '#888' : '#fff',
                            cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                        }}
                    >
                        {isOutOfStock ? 'OUT OF STOCK' : 'ADD TO CART'}
                    </AddToCartButton>
                </div>
            </div>
            {/* Ratings & Reviews */}
            <div style={{ marginTop: 48, maxWidth: 1000 }}>
                <h2 style={{ fontWeight: 700, fontSize: 28, marginBottom: 24 }}>Ratings & Reviews ({reviews.length})</h2>
                {/* Summary and Input Row */}
                <div style={{ display: 'flex', gap: 32, marginBottom: 36, alignItems: 'stretch' }}>

                </div>
                {/* Reviews List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 32, marginTop: 8 }}>
                    {reviews.length === 0 ? (
                        <div style={{ color: '#888', fontSize: 16 }}>No reviews yet.</div>
                    ) : (
                        reviews.map(r => (
                            <div key={r.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 18 }}>
                                {/* Avatar */}
                                <div style={{ width: 54, height: 54, borderRadius: '50%', background: '#eaf6fa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 22, color: '#1766a6' }}>
                                    {getInitials(r.user)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2 }}>
                                        <span style={{ fontWeight: 700, fontSize: 18 }}>{r.user}</span>
                                        <span style={{ color: '#888', fontSize: 15 }}>{r.date ? timeAgo(r.date) : ''}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                        <span style={{ color: '#f7b500', fontSize: 20 }}>{'★'.repeat(r.rating)}</span>
                                        <span style={{ color: '#888', fontSize: 15 }}>({r.rating})</span>
                                    </div>
                                    <div style={{ fontSize: 16 }}>{r.text}</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookDetails; 