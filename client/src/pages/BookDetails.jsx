import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

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
    const [newReview, setNewReview] = useState('');
    const [rating, setRating] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        const fetchBook = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await axios.get(`http://localhost:5124/api/books/${id}`);
                setBook(res.data);
                setReviews(res.data.Reviews || []);
            } catch (err) {
                setError('Failed to fetch book details.');
            } finally {
                setLoading(false);
            }
        };
        fetchBook();
    }, [id]);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!newReview.trim() || rating === 0) return;
        setSubmitting(true);
        setTimeout(() => {
            setReviews(prev => [
                { id: Date.now(), text: newReview, rating, user: 'You', date: new Date().toLocaleDateString() },
                ...prev
            ]);
            setNewReview('');
            setRating(0);
            setSubmitting(false);
        }, 600);
    };

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
    const genres = book.Genres && book.Genres.length > 0
        ? book.Genres.map(g => g.Name).join(', ')
        : 'N/A';
    const authors = book.Authors && book.Authors.length > 0
        ? book.Authors.map(a => [a.FirstName, a.LastName].filter(Boolean).join(' ')).join(', ')
        : 'Unknown Author';

    // Breadcrumbs (simulate)
    const breadcrumbs = [
        { name: 'Home', link: '/' },
        ...(book.Genres && book.Genres.length > 0 ? book.Genres.map(g => ({ name: g.Name, link: '#' })) : []),
        { name: book.Title }
    ];

    // Ratings summary
    const avgRating = reviews.length > 0 ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length) : 0;

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
                        src={book.CoverImageUrl || 'https://placehold.co/240x340?text=No+Image'}
                        alt={book.Title}
                        style={{ width: 240, height: 340, objectFit: 'cover', borderRadius: 8, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}
                    />
                    {/* Genres */}
                    <div style={{ marginTop: 18 }}>
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>Genres:</div>
                        {book.Genres && book.Genres.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {book.Genres.map((g, i) => (
                                    <a key={g.GenreId} href="#" style={{ color: '#1976d2', textDecoration: 'underline', cursor: 'pointer', fontSize: 15 }}>{g.Name}</a>
                                ))}
                            </div>
                        ) : 'N/A'}
                    </div>
                </div>
                {/* Main Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                        <span style={{ fontWeight: 600, fontSize: 16, background: '#f4f6fa', borderRadius: 6, padding: '2px 12px' }}>{book.Format || 'Paper Back'}</span>
                    </div>
                    <h1 style={{ fontWeight: 700, fontSize: 32, margin: 0 }}>{book.Title}</h1>
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
                        {book.Stock && book.Stock < 10 && (
                            <span style={{ color: 'red', marginLeft: 16 }}>Only {book.Stock} item{book.Stock > 1 ? 's' : ''} left in stock!</span>
                        )}
                    </div>
                    {/* Description */}
                    <div style={{ margin: '24px 0' }}>
                        <h2 style={{ fontWeight: 700, fontSize: 22, marginBottom: 8 }}>Description</h2>
                        <div style={{ color: '#222', fontSize: 17, lineHeight: 1.7 }}>{book.Description || 'No description available.'}</div>
                    </div>
                    {/* Other Info */}
                    <div style={{ display: 'flex', gap: 32, marginTop: 24 }}>
                        <div style={{ background: '#fafbfc', borderRadius: 10, padding: 24, minWidth: 180, textAlign: 'center', flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 6 }}>Page Count</div>
                            <div style={{ fontSize: 20 }}>{book.PageCount ? `${book.PageCount} Pages` : 'N/A'}</div>
                        </div>
                        <div style={{ background: '#fafbfc', borderRadius: 10, padding: 24, minWidth: 180, textAlign: 'center', flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 6 }}>ISBN</div>
                            <div style={{ fontSize: 20 }}>{book.ISBN || 'N/A'}</div>
                        </div>
                        <div style={{ background: '#fafbfc', borderRadius: 10, padding: 24, minWidth: 180, textAlign: 'center', flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 6 }}>Language</div>
                            <div style={{ fontSize: 20 }}>{book.Language || 'N/A'}</div>
                        </div>
                    </div>
                </div>
                {/* Right Side Card */}
                <div style={{ minWidth: 300, background: '#fff', border: '1px solid #eee', borderRadius: 12, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                    <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 12 }}>Get Estimated Arrival Time</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <span role="img" aria-label="location">📍</span>
                        <span>Kathmandu</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <span role="img" aria-label="delivery">🚚</span>
                        <span>Delivery Within 1 to 2 days</span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 24, margin: '18px 0' }}>Rs. {book.Price}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                        <button onClick={handleDecrease} style={{ background: '#eee', border: 'none', borderRadius: 6, width: 32, height: 32, fontSize: 20, cursor: 'pointer' }}>-</button>
                        <span style={{ fontWeight: 600 }}>QTY: {quantity}</span>
                        <button onClick={handleIncrease} style={{ background: '#eee', border: 'none', borderRadius: 6, width: 32, height: 32, fontSize: 20, cursor: 'pointer' }}>+</button>
                    </div>
                    <button style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 32px', fontWeight: 700, fontSize: 18, cursor: 'pointer', width: '100%' }}>ADD TO CART</button>
                </div>
            </div>
            {/* Ratings & Reviews */}
            <div style={{ marginTop: 48, maxWidth: 1000 }}>
                <h2 style={{ fontWeight: 700, fontSize: 28, marginBottom: 24 }}>Ratings & Reviews ({reviews.length})</h2>
                {/* Summary and Input Row */}
                <div style={{ display: 'flex', gap: 32, marginBottom: 36, alignItems: 'stretch' }}>
                    {/* Left: Average Rating */}
                    <div style={{ flex: '0 0 180px', background: '#1766a6', color: '#fff', borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 170, fontWeight: 700, fontSize: 32, boxShadow: '0 2px 12px rgba(23,102,166,0.08)' }}>
                        <div style={{ fontSize: 48, fontWeight: 700 }}>{avgRating.toFixed(1)}</div>
                        <div style={{ fontSize: 18, fontWeight: 400, marginTop: 4 }}>Out of 5.0</div>
                    </div>
                    {/* Right: Review Input */}
                    <div style={{ flex: 1, background: '#eafaf7', borderRadius: 12, padding: 24, display: 'flex', alignItems: 'center', gap: 24, minHeight: 170, position: 'relative' }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 10 }}>How would you rate this book?</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                {[1, 2, 3, 4, 5].map(i => (
                                    <span
                                        key={i}
                                        style={{ fontSize: 32, color: i <= rating ? '#f7b500' : '#ccc', cursor: 'pointer', transition: 'color 0.2s' }}
                                        onClick={() => setRating(i)}
                                    >★</span>
                                ))}
                                <span style={{ fontWeight: 600, fontSize: 22, marginLeft: 8 }}>{rating > 0 ? rating.toFixed(1) : avgRating.toFixed(1)}</span>
                            </div>
                            <form onSubmit={handleReviewSubmit} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <input
                                    type="text"
                                    placeholder="Write a review..."
                                    value={newReview}
                                    onChange={e => setNewReview(e.target.value)}
                                    style={{ flex: 1, padding: 12, borderRadius: 6, border: '1px solid #ddd', fontSize: 16 }}
                                    disabled={submitting}
                                />
                                <button type="submit" style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 24px', fontWeight: 600, fontSize: 16, cursor: 'pointer' }} disabled={submitting || !newReview.trim() || rating === 0}>Submit</button>
                            </form>
                        </div>
                        {/* Illustration (placeholder) */}
                        <div style={{ minWidth: 120, minHeight: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img src="https://cdn-icons-png.flaticon.com/512/1040/1040230.png" alt="review" style={{ width: 90, height: 70, opacity: 0.7 }} />
                        </div>
                    </div>
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