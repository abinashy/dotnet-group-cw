import axios from 'axios';

export const addToCart = async ({ userId, bookId, quantity = 1 }) => {
    return axios.post('http://localhost:5124/api/addtocart', {
        UserId: userId,
        BookId: bookId,
        Quantity: quantity,
    });
}; 