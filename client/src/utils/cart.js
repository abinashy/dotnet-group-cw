import axios from 'axios';

export const addToCart = async ({ bookId, quantity = 1 }) => {
    const token = localStorage.getItem('token');
    return axios.post('http://localhost:5124/api/addtocart', {
        BookId: bookId,
        Quantity: quantity,
    }, {
        headers: {
            Authorization: `Bearer ${token}`,
        }
    });
}; 