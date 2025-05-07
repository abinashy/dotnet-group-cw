import React from 'react';
import AddToCartButton from './Buttons/AddToCartButton';

const BooksCard = ({ book, onAddToCart, onClick }) => {
    const [hover, setHover] = React.useState(false);
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
            <AddToCartButton
                onClick={e => {
                    e.stopPropagation();
                    if (onAddToCart) onAddToCart(book);
                    else alert(`Added '${book.Title}' to cart!`);
                }}
                style={{
                    border: '1px solid #1976d2',
                    background: hover ? '#1976d2' : '#fff',
                    color: hover ? '#fff' : '#1976d2',
                    borderRadius: 4,
                    padding: '8px 0',
                    width: '100%',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'background 0.2s, color 0.2s',
                }}
            >
                ADD TO CART
            </AddToCartButton>
        </div>
    );
};

export default BooksCard; 