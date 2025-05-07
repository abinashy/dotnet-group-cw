import React from 'react';

const AddToCartButton = ({ onClick, disabled, children = 'ADD TO CART', style = {} }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        style={{
            background: '#1976d2',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '12px 32px',
            fontWeight: 700,
            fontSize: 18,
            cursor: disabled ? 'not-allowed' : 'pointer',
            width: '100%',
            ...style,
        }}
    >
        {children}
    </button>
);

export default AddToCartButton; 