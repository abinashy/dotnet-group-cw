import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

const StarRating = ({ rating, onChange }) => (
  <div className="flex space-x-1">
    {[1, 2, 3, 4, 5].map(star => (
      <button
        key={star}
        type="button"
        className={`text-2xl focus:outline-none ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
        onClick={() => onChange(star)}
        aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
      >
        ★
      </button>
    ))}
  </div>
);

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const Review = () => {
  const query = useQuery();
  const orderId = query.get('orderId');
  const [order, setOrder] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await axios.get(`http://localhost:5124/api/order/${orderId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setOrder(response.data);
        setReviews(response.data.orderItems.map(item => ({
          bookId: item.bookId,
          orderId: response.data.orderId,
          bookTitle: item.bookTitle,
          rating: 0,
          review: ''
        })));
      } catch {
        setOrder(null);
      }
    };
    if (orderId) fetchOrder();
  }, [orderId]);

  const handleRatingChange = (index, rating) => {
    setReviews(reviews => reviews.map((r, i) => i === index ? { ...r, rating } : r));
  };

  const handleReviewChange = (index, review) => {
    setReviews(reviews => reviews.map((r, i) => i === index ? { ...r, review } : r));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Submit all reviews (implement your backend endpoint as needed)
      await axios.post('http://localhost:5124/api/review/batch', {
        orderId,
        reviews: reviews.map(r => ({ bookId: r.bookId, orderId: r.orderId, rating: r.rating, review: r.review }))
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setSuccess(true);
      setTimeout(() => navigate('/myorders'), 2000);
    } catch {
      alert('Failed to submit reviews.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!order) {
    return <div className="flex justify-center items-center min-h-screen text-lg text-gray-500">Loading order details...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 bg-white min-h-screen rounded-xl shadow-2xl relative border border-gray-200">
      <h1 className="text-3xl font-extrabold mb-8 text-center text-black drop-shadow-lg">Leave a Review</h1>
      <div className="bg-gray-50 rounded-xl shadow p-6 mb-8 border border-gray-200">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-2">
          <span className="font-bold text-lg text-black">Order #{order.orderId}</span>
          <span className="ml-4 text-gray-400 text-sm">{new Date(order.orderDate).toLocaleString()}</span>
        </div>
        <div className="text-gray-700">Total: <span className="font-bold text-black">₹{order.finalAmount.toFixed(2)}</span></div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-8">
        {reviews.map((r, idx) => (
          <div key={r.bookId || idx} className="bg-white rounded-lg shadow p-6 flex flex-col gap-2 border border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
              <span className="font-semibold text-lg text-black">{r.bookTitle}</span>
              <StarRating rating={r.rating} onChange={rating => handleRatingChange(idx, rating)} />
            </div>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-black text-black min-h-[80px] resize-none bg-gray-50"
              placeholder="Write your review..."
              value={r.review}
              onChange={e => handleReviewChange(idx, e.target.value)}
              required
            />
          </div>
        ))}
        {!success ? (
          <button
            type="submit"
            className="w-full py-3 bg-black text-white rounded-full font-bold text-lg shadow hover:bg-gray-800 transition-colors duration-200 disabled:opacity-60"
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Reviews'}
          </button>
        ) : (
          <div className="w-full flex justify-center mt-4">
            <span className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-full font-semibold text-lg shadow">
              <svg className="w-6 h-6 mr-2 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Review Submitted
            </span>
          </div>
        )}
      </form>
      {success && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-10 flex flex-col items-center animate-fade-in border border-gray-200">
            <svg className="w-16 h-16 text-black mb-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <div className="text-2xl font-bold text-black mb-2">Review Submitted!</div>
            <div className="text-gray-600 text-center">Thank you for your feedback.<br />Redirecting to My Orders...</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Review; 