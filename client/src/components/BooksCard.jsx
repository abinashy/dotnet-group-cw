import React from 'react';
import AddToCartButton from './Buttons/AddToCartButton';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const BooksCard = ({ book, onClick }) => {
    const [hover, setHover] = React.useState(false);
    const navigate = useNavigate();
    const { openCart, refreshCart } = useCart();

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
                by {book.authors && book.authors.length > 0 ? book.authors.map(a => `${a.firstName} ${a.lastName}`).join(', ') : 'Unknown Author'}
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
                    border: '1px solid #1976d2',
                    background: (isOutOfStock || isUpcoming) ? '#eee' : (hover ? '#1976d2' : '#fff'),
                    color: (isOutOfStock || isUpcoming) ? '#888' : (hover ? '#fff' : '#1976d2'),
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