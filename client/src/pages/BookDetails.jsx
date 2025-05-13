import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { FaBook, FaHashtag, FaLanguage, FaGlobe } from 'react-icons/fa';
import { BiBarcode } from 'react-icons/bi';
import { FiBox } from 'react-icons/fi';
import { FaRegCopy } from 'react-icons/fa';
import AddToCartButton from '../components/Buttons/AddToCartButton';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { theme } from '../theme';

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
    const [isDesktop, setIsDesktop] = useState(window.innerWidth > 900);
    const { openCart, refreshCart } = useCart();
    const { isInWishlist, toggleWishlist } = useWishlist();

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

    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth > 900);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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

    // Authors: robust handling
    const authors = Array.isArray(book.authors) && book.authors.length > 0
        ? book.authors.map(a => [a.firstName, a.lastName].filter(Boolean).join(' ')).filter(Boolean).join(', ')
        : 'Unknown Author';

    // Genres: robust handling
    const genres = Array.isArray(book.genres) && book.genres.length > 0
        ? book.genres.map(g => g.name).filter(Boolean).join(', ')
        : 'N/A';

    // Breadcrumbs (simulate)
    const breadcrumbs = [
        { name: 'Home', link: '/' },
        { name: 'Books', link: '/books' },
        { name: book.title }
    ];

    // Ratings summary
    // const avgRating = reviews.length > 0 ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length) : 0;

    const isOutOfStock = book.availability === 0;
    const isUpcoming = book.status === 'Upcoming';

    // Consistent add to cart logic as BooksCard
    const handleAddToCart = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                window.location.href = '/login';
                return;
            }
            const response = await fetch('http://localhost:5124/api/AddToCart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    bookId: book.bookId,
                    quantity: quantity
                })
            });
            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                    return;
                }
                throw new Error('Failed to add to cart');
            }
            await refreshCart();
            openCart();
        } catch (err) {
            alert('Failed to add to cart. Please try again.');
        }
    };

    return (
        <div style={{ maxWidth: 1300, margin: '0 auto', padding: '32px 16px', display: 'flex', flexDirection: 'column', gap: 32 }}>
            {/* Breadcrumbs */}
            <div style={{ fontSize: 15, color: '#888', marginBottom: 8 }}>
                {breadcrumbs.map((b, i) => (
                    <span key={i}>
                        {i > 0 && ' / '}
                        {b.link ? <a href={b.link} style={{ color: theme.colors.primary.main, textDecoration: 'none' }}>{b.name}</a> : b.name}
                    </span>
                ))}
            </div>
            {/* Main Section */}
            <div style={{ display: 'flex', gap: 40, alignItems: 'flex-start', position: 'relative' }}>
                {/* Cover & Genres */}
                <div style={{ minWidth: 260 }}>
                    <div style={{ position: 'relative' }}>
                        <img
                            src={book.coverImageUrl || 'https://placehold.co/240x340?text=No+Image'}
                            alt={book.title}
                            style={{ width: 240, height: 340, objectFit: 'cover', borderRadius: 8, boxShadow: theme.shadows.sm }}
                        />
                        {book.isOnSale && (
                            <div style={{
                                position: 'absolute',
                                top: 16,
                                left: 16,
                                background: '#ff5252',
                                color: '#fff',
                                fontWeight: 700,
                                fontSize: 15,
                                borderRadius: 8,
                                padding: '4px 14px',
                                zIndex: 2
                            }}>
                                {book.discountPercentage ? `-${book.discountPercentage}%` : 'SALE'}
                            </div>
                        )}
                    </div>
                    {/* Genres */}
                    <div style={{ marginTop: 18 }}>
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>Genres:</div>
                        {genres}
                    </div>
                </div>
                {/* Main Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                        <span style={{ fontWeight: 600, fontSize: 16, background: '#f4f6fa', borderRadius: 6, padding: '2px 12px' }}>{book.format || 'Paper Back'}</span>
                    </div>
                    <h1 style={{ fontWeight: 700, fontSize: 32, margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
                        {book.title}
                        <button
                            onClick={(e) => toggleWishlist(book, e)}
                            style={{ 
                                background: 'none', 
                                border: 'none', 
                                cursor: 'pointer', 
                                padding: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'transform 0.2s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                            aria-label={isInWishlist(book.bookId) ? 'Remove from wishlist' : 'Add to wishlist'}
                        >
                            {isInWishlist(book.bookId) ? (
                                <svg width="34" height="34" viewBox="0 0 24 24">
                                    <defs>
                                        <linearGradient id="detailHeartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#F472B6" />
                                            <stop offset="100%" stopColor="#E11D48" />
                                        </linearGradient>
                                        <filter id="heartShadow" x="-20%" y="-20%" width="140%" height="140%">
                                            <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#E11D48" floodOpacity="0.5"/>
                                        </filter>
                                    </defs>
                                    <path 
                                        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" 
                                        fill="url(#detailHeartGradient)" 
                                        filter="url(#heartShadow)"
                                    />
                                </svg>
                            ) : (
                                <svg width="34" height="34" viewBox="0 0 24 24">
                                    <defs>
                                        <linearGradient id="detailHeartStrokeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#F472B6" />
                                            <stop offset="100%" stopColor="#E11D48" />
                                        </linearGradient>
                                    </defs>
                                    <path 
                                        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" 
                                        fill="none" 
                                        stroke="url(#detailHeartStrokeGradient)" 
                                        strokeWidth="2" 
                                    />
                                </svg>
                            )}
                        </button>
                    </h1>
                    <div style={{ fontSize: 18, color: '#444', marginBottom: 8 }}>by {authors}</div>
                    {/* Discounted Price Display */}
                    <div style={{ fontWeight: 700, fontSize: 24, margin: '0 0 18px 0', color: book.isOnSale ? '#ff5252' : '#222', textAlign: 'left' }}>
                        {book.isOnSale && book.discountedPrice ? (
                            <>
                                Rs. {book.discountedPrice}
                                <span style={{ textDecoration: 'line-through', color: '#888', marginLeft: 12, fontSize: 18, fontWeight: 500 }}>Rs. {book.price}</span>
                            </>
                        ) : (
                            <>Rs. {book.price}</>
                        )}
                    </div>
                    {/* Ratings and Reviews */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
                        <span style={{ color: '#f7b500', fontSize: 20 }}>★</span>
                        <span style={{ fontWeight: 600 }}>{reviews.length > 0 ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1) : 'N/A'}</span>
                        <span style={{ color: '#888' }}>| {reviews.length} Book Review{reviews.length !== 1 ? 's' : ''}</span>
                    </div>
                    {/* Seller */}
                    <div style={{ marginBottom: 8 }}>
                        <span>Sold by <span style={{ color: theme.colors.primary.main, fontWeight: 500, cursor: 'pointer' }}>BookNook</span></span>
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
                {isDesktop ? (
                    <div
                        style={{
                            position: 'fixed',
                            top: 100,
                            right: 40,
                            width: 340,
                            background: '#fff',
                            border: '1px solid #eee',
                            borderRadius: 12,
                            padding: 24,
                            boxShadow: theme.shadows.sm,
                            zIndex: 1,
                        }}
                    >
                        <h3 style={{ fontWeight: 600, fontSize: 20, marginBottom: 12 }}>Total Price</h3>
                        <hr style={{ border: 'none', borderTop: '1px solid #e0e0e0', margin: '0 0 18px 0' }} />
                        <div style={{ fontWeight: 700, fontSize: 24, margin: '0 0 18px 0', color: book.isOnSale ? '#ff5252' : '#222' }}>
                            {book.isOnSale && book.discountedPrice ? (
                                <>
                                    Rs. {book.discountedPrice}
                                    <span style={{ textDecoration: 'line-through', color: '#888', marginLeft: 12, fontSize: 18, fontWeight: 500 }}>Rs. {book.price}</span>
                                </>
                            ) : (
                                <>Rs. {book.price}</>
                            )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                            <button
                                onClick={handleDecrease}
                                style={{
                                    background: '#eee',
                                    border: 'none',
                                    borderRadius: 6,
                                    width: 32,
                                    height: 32,
                                    fontSize: 20,
                                    cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                                    opacity: isOutOfStock ? 0.5 : 1
                                }}
                                disabled={isOutOfStock}
                            >-</button>
                            <span style={{ fontWeight: 600 }}>QTY: {quantity}</span>
                            <button
                                onClick={handleIncrease}
                                style={{
                                    background: '#eee',
                                    border: 'none',
                                    borderRadius: 6,
                                    width: 32,
                                    height: 32,
                                    fontSize: 20,
                                    cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                                    opacity: isOutOfStock ? 0.5 : 1
                                }}
                                disabled={isOutOfStock}
                            >+</button>
                        </div>
                        <AddToCartButton
                            onClick={handleAddToCart}
                            disabled={isOutOfStock || isUpcoming}
                            style={{
                                background: (isOutOfStock || isUpcoming) ? '#eee' : theme.colors.primary.main,
                                color: (isOutOfStock || isUpcoming) ? '#888' : theme.colors.primary.contrast,
                                cursor: (isOutOfStock || isUpcoming) ? 'not-allowed' : 'pointer',
                            }}
                        >
                            {isUpcoming ? 'Coming soon' : isOutOfStock ? 'OUT OF STOCK' : 'ADD TO CART'}
                        </AddToCartButton>
                    </div>
                ) : (
                    <div style={{
                        minWidth: 300,
                        background: '#fff',
                        border: '1px solid #eee',
                        borderRadius: 12,
                        padding: 24,
                        boxShadow: theme.shadows.sm,
                        alignSelf: 'flex-start'
                    }}>
                        <h3 style={{ fontWeight: 600, fontSize: 20, marginBottom: 12 }}>Total Price</h3>
                        <hr style={{ border: 'none', borderTop: '1px solid #e0e0e0', margin: '0 0 18px 0' }} />
                        <div style={{ fontWeight: 700, fontSize: 24, margin: '0 0 18px 0', color: book.isOnSale ? '#ff5252' : '#222' }}>
                            {book.isOnSale && book.discountedPrice ? (
                                <>
                                    Rs. {book.discountedPrice}
                                    <span style={{ textDecoration: 'line-through', color: '#888', marginLeft: 12, fontSize: 18, fontWeight: 500 }}>Rs. {book.price}</span>
                                </>
                            ) : (
                                <>Rs. {book.price}</>
                            )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                            <button
                                onClick={handleDecrease}
                                style={{
                                    background: '#eee',
                                    border: 'none',
                                    borderRadius: 6,
                                    width: 32,
                                    height: 32,
                                    fontSize: 20,
                                    cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                                    opacity: isOutOfStock ? 0.5 : 1
                                }}
                                disabled={isOutOfStock}
                            >-</button>
                            <span style={{ fontWeight: 600 }}>QTY: {quantity}</span>
                            <button
                                onClick={handleIncrease}
                                style={{
                                    background: '#eee',
                                    border: 'none',
                                    borderRadius: 6,
                                    width: 32,
                                    height: 32,
                                    fontSize: 20,
                                    cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                                    opacity: isOutOfStock ? 0.5 : 1
                                }}
                                disabled={isOutOfStock}
                            >+</button>
                        </div>
                        <AddToCartButton
                            onClick={handleAddToCart}
                            disabled={isOutOfStock || isUpcoming}
                            style={{
                                background: (isOutOfStock || isUpcoming) ? '#eee' : theme.colors.primary.main,
                                color: (isOutOfStock || isUpcoming) ? '#888' : theme.colors.primary.contrast,
                                cursor: (isOutOfStock || isUpcoming) ? 'not-allowed' : 'pointer',
                            }}
                        >
                            {isUpcoming ? 'Coming soon' : isOutOfStock ? 'OUT OF STOCK' : 'ADD TO CART'}
                        </AddToCartButton>
                    </div>
                )}
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