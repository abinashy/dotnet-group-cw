import React from 'react';
import AddToCartButton from './Buttons/AddToCartButton';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { theme } from '../theme';

const BooksCard = ({ book, onClick }) => {
    const [hover, setHover] = React.useState(false);
    const navigate = useNavigate();
    const { openCart, refreshCart } = useCart();
    const { isInWishlist, toggleWishlist } = useWishlist();

    const handleAddToCart = async (e) => {
        e.stopPropagation();
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                // Redirect to login page if not authenticated
                navigate('/login', { state: { from: window.location.pathname } });
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
                    quantity: 1
                })
            });

            if (!response.ok) {
                if (response.status === 401) {
                    // Token expired or invalid
                    localStorage.removeItem('token');
                    navigate('/login', { state: { from: window.location.pathname } });
                    return;
                }
                throw new Error('Failed to add to cart');
            }

            // Open and refresh the cart
            await refreshCart();
            openCart();
        } catch (err) {
            console.error('Error adding to cart:', err);
            alert('Failed to add to cart. Please try again.');
        }
    };

    const isOutOfStock = book.availability === 0;
    const isUpcoming = book.status === 'Upcoming';

    return (
        <div
            style={{
                width: 220,
                border: hover ? '2px solid #1976d2' : '1px solid #eee',
                borderRadius: 10,
                boxShadow: hover ? '0 4px 16px rgba(25,118,210,0.12)' : '0 2px 8px rgba(0,0,0,0.05)',
                padding: 16,
                background: '#fff',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'box-shadow 0.2s, border 0.2s',
                position: 'relative',
            }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            onClick={onClick}
        >
            {/* Wishlist Heart Icon */}
            <button
                onClick={e => { 
                    e.stopPropagation(); 
                    toggleWishlist(book, e); 
                }}
                style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    background: 'rgba(255, 255, 255, 0.85)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 2,
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                    transition: 'transform 0.2s, background 0.2s',
                }}
                className="wishlist-heart-btn"
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                aria-label={isInWishlist(book.bookId) ? 'Remove from wishlist' : 'Add to wishlist'}
            >
                {isInWishlist(book.bookId) ? (
                    <svg width="22" height="22" viewBox="0 0 24 24">
                        <defs>
                            <linearGradient id="heartFillGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#F472B6" />
                                <stop offset="100%" stopColor="#E11D48" />
                            </linearGradient>
                        </defs>
                        <path 
                            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" 
                            fill="url(#heartFillGradient)" 
                        />
                    </svg>
                ) : (
                    <svg width="22" height="22" viewBox="0 0 24 24">
                        <path 
                            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" 
                            fill="none" 
                            stroke="#EC4899" 
                            strokeWidth="2" 
                        />
                    </svg>
                )}
            </button>
            <img
                src={book.coverImageUrl || 'https://placehold.co/180x260?text=No+Image'}
                alt={book.title}
                style={{ width: 180, height: 260, objectFit: 'cover', borderRadius: 6, marginBottom: 16 }}
            />
            {book.isOnSale && (
                <div style={{
                    position: 'absolute',
                    top: 10,
                    left: 10,
                    background: '#ff5252',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 13,
                    borderRadius: 6,
                    padding: '2px 10px',
                    zIndex: 2
                }}>
                    {book.discountPercentage ? `-${book.discountPercentage}%` : 'SALE'}
                </div>
            )}
            <div style={{ fontWeight: 600, fontSize: 16, textAlign: 'center', marginBottom: 4 }}>
                {book.title}
            </div>
            <div style={{ color: '#555', fontSize: 14, marginBottom: 8, textAlign: 'center' }}>
                by {book.authors && book.authors.length > 0 
                    ? [...new Set(book.authors.map(a => `${a.firstName} ${a.lastName}`))].join(', ') 
                    : 'Unknown Author'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                <span style={{ color: '#f7b500', fontSize: 16, marginRight: 4 }}>★</span>
                <span style={{ fontWeight: 500, fontSize: 14 }}>
                    {book.averageRating ? book.averageRating.toFixed(1) : 'N/A'}
                </span>
                <span style={{ color: '#888', fontSize: 12, marginLeft: 4 }}>
                    ({book.reviewCount || 0})
                </span>
            </div>
            <div style={{ fontWeight: 500, fontSize: 16, marginBottom: 12, textAlign: 'center' }}>
                {book.isOnSale && book.discountedPrice ? (
                    <>
                        <span style={{ textDecoration: 'line-through', color: '#888', marginLeft: 8, fontSize: 15 }}>Rs. {book.price}</span>
                        <span style={{ color: '#ff5252', fontWeight: 700 }}> Rs. {book.discountedPrice}</span>
                    </>
                ) : (
                    <>Rs. {book.price}</>
                )}
            </div>
            <AddToCartButton
                onClick={handleAddToCart}
                disabled={isOutOfStock || isUpcoming}
                style={{
                    border: `1px solid ${theme.colors.primary.main}`,
                    background: (isOutOfStock || isUpcoming) ? '#eee' : (hover ? theme.colors.primary.main : '#fff'),
                    color: (isOutOfStock || isUpcoming) ? '#888' : (hover ? theme.colors.primary.contrast : theme.colors.primary.main),
                    borderRadius: 4,
                    padding: '8px 0',
                    width: '100%',
                    fontWeight: 600,
                    cursor: (isOutOfStock || isUpcoming) ? 'not-allowed' : 'pointer',
                    transition: 'background 0.2s, color 0.2s',
                }}
            >
                {isUpcoming ? 'COMING SOON' : isOutOfStock ? 'OUT OF STOCK' : 'ADD TO CART'}
            </AddToCartButton>
        </div>
    );
};

export default BooksCard; 