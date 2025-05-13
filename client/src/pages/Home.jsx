import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import BooksCard from '../components/BooksCard';
import axios from 'axios';
import { motion } from 'framer-motion';
import placeholderImg from '../assets/placeholder-book.png';
import { theme } from '../theme';

const Home = () => {
    const navigate = useNavigate();
    const [featuredBooks, setFeaturedBooks] = useState([]);
    const [newArrivals, setNewArrivals] = useState([]);
    const [popularGenres, setPopularGenres] = useState([]);
    const [bargainBooks, setBargainBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Carousel scroll helpers
    const scrollRow = (ref, dir) => {
        if (!ref.current) return;
        const scrollAmount = ref.current.offsetWidth * 0.8; // scroll by 80% of container width
        ref.current.scrollBy({ left: dir * scrollAmount, behavior: 'smooth' });
    };
    const bestSellerRef = useRef();
    const newArrivalsRef = useRef();

    // Carousel window state
    const [bestSellerIndex, setBestSellerIndex] = useState(0);
    const [newArrivalsIndex, setNewArrivalsIndex] = useState(0);
    const VISIBLE_COUNT = 5;
    const CARD_WIDTH = 240; // px
    const GAP = 32; // px, must match the gap in the flex container
    const maxBestSellerIndex = Math.max(0, (featuredBooks?.length || 0) - VISIBLE_COUNT);
    const maxNewArrivalsIndex = Math.max(0, (newArrivals?.length || 0) - VISIBLE_COUNT);
    const carouselWidth = VISIBLE_COUNT * CARD_WIDTH + (VISIBLE_COUNT - 1) * GAP;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [featuredResponse, newArrivalsResponse, genresResponse, bargainBooksResponse] =
                    await Promise.all([
                        axios.get('http://localhost:5124/api/bookscatalogue?tab=bestseller&page=1&pageSize=8'),
                        axios.get('http://localhost:5124/api/bookscatalogue?tab=new&page=1&pageSize=8'),
                        axios.get('http://localhost:5124/api/genres'),
                        axios.get('http://localhost:5124/api/bookscatalogue?onSale=true&limit=4')
                    ]);

                setFeaturedBooks(featuredResponse.data.books);
                setNewArrivals(newArrivalsResponse.data.books);
                setPopularGenres(genresResponse.data);
                setBargainBooks(bargainBooksResponse.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    const SectionHeader = ({ title, viewAllLink }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-center mb-6"
        >
            <h2 className="text-3xl font-bold text-gray-800">
                {title}
            </h2>
            <button
                onClick={() => navigate(viewAllLink)}
                className="text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-200"
            >
                View All →
            </button>
        </motion.div>
    );

    return (
        <div className="relative min-h-screen w-full" style={{ backgroundColor: theme.colors.background.default }}>
            {/* Hero Section */}
            <div className="flex flex-col md:flex-row items-center justify-between rounded-2xl p-8 md:p-16 mb-12 mt-6" 
                 style={{ backgroundColor: theme.colors.background.paper, boxShadow: theme.shadows.md }}>
                <div className="flex-1 mb-8 md:mb-0">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4" style={{ color: theme.colors.text.primary }}>
                        Buy and sell your books <span style={{ color: theme.colors.primary.main }}>for the best prices</span>
                    </h1>
                    <p className="text-lg mb-6" style={{ color: theme.colors.text.secondary }}>
                        Find and read more you'll love, and keep track of the books you want to read. Be part of the world's largest community of book lovers on BookNook.
                    </p>
                    <button
                        className="px-6 py-3 font-semibold rounded-lg transition-colors duration-200"
                        style={{ 
                            backgroundColor: theme.colors.primary.main,
                            color: theme.colors.primary.contrast,
                            boxShadow: theme.shadows.sm
                        }}
                        onClick={() => navigate('/books?tab=discount')}
                    >
                        Explore Deals
                    </button>
                </div>
                <img src="/assets/hero-books.png" alt="Book Covers" className="w-64 md:w-80 flex-shrink-0 rounded-xl" style={{ boxShadow: theme.shadows.lg }} />
            </div>

            {/* Best Seller Books Section */}
            <div className="mb-16">
                <h2 className="text-2xl font-bold mb-6 text-center">Best Seller</h2>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: `${carouselWidth}px`, margin: '0 auto' }}>
                    <button
                        aria-label="Scroll left"
                        onClick={() => setBestSellerIndex(i => Math.max(0, i - 1))}
                        disabled={bestSellerIndex === 0}
                        style={{
                            visibility: bestSellerIndex === 0 ? 'hidden' : 'visible',
                            position: 'absolute', left: -50, zIndex: 2,
                            background: '#fff', border: 'none', borderRadius: '50%', boxShadow: '0 2px 8px #0001', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                        }}
                    >
                        <span style={{ fontSize: 24 }}>&#8592;</span>
                    </button>
                    <div style={{ overflow: 'hidden', width: `${carouselWidth}px` }}>
                        <div
                            style={{
                                display: 'flex',
                                gap: `${GAP}px`,
                                transform: `translateX(-${bestSellerIndex * (CARD_WIDTH + GAP)}px)`,
                                transition: 'transform 0.5s cubic-bezier(0.4,0,0.2,1)',
                                width: `${(featuredBooks?.length || 0) * (CARD_WIDTH + GAP) - GAP}px`,
                            }}
                        >
                            {Array.isArray(featuredBooks) && featuredBooks.map(book => (
                                <div style={{ width: CARD_WIDTH, flexShrink: 0 }} key={book.bookId}>
                                    <BooksCard book={book} onClick={() => navigate(`/books/${book.bookId}`)} />
                                </div>
                            ))}
                        </div>
                    </div>
                    <button
                        aria-label="Scroll right"
                        onClick={() => setBestSellerIndex(i => Math.min(maxBestSellerIndex, i + 1))}
                        disabled={bestSellerIndex >= maxBestSellerIndex}
                        style={{
                            visibility: bestSellerIndex >= maxBestSellerIndex ? 'hidden' : 'visible',
                            position: 'absolute', right: -50, zIndex: 2,
                            background: '#fff', border: 'none', borderRadius: '50%', boxShadow: '0 2px 8px #0001', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                        }}
                    >
                        <span style={{ fontSize: 24 }}>&#8594;</span>
                    </button>
                </div>
            </div>

            {/* Feature/Promo Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12 items-center">
                <div className="grid grid-cols-3 gap-2 p-4 rounded-xl" style={{ backgroundColor: theme.colors.background.paper, boxShadow: theme.shadows.sm }}>
                    {Array.isArray(featuredBooks) && [...featuredBooks, ...newArrivals].slice(0, 9).map((book, i) => (
                        <img key={i} src={book.coverImageUrl || placeholderImg} alt={book.title} className="w-full h-32 object-cover rounded-lg" style={{ boxShadow: theme.shadows.sm }} />
                    ))}
                </div>
                <div className="flex flex-col items-start">
                    <h3 className="text-2xl font-bold mb-2" style={{ color: theme.colors.text.primary }}>
                        Find Your Favorite <span style={{ color: theme.colors.primary.main }}>Book Here!</span>
                    </h3>
                    <p className="mb-4" style={{ color: theme.colors.text.secondary }}>
                        Discover, connect, and start accumulating advantages with BookNook. Join our community and find your next favorite read!
                    </p>
                    <div className="flex gap-8 mb-4">
                        <div>
                            <div className="text-xl font-bold" style={{ color: theme.colors.primary.main }}>800+</div>
                            <div style={{ color: theme.colors.text.secondary, fontSize: '0.875rem' }}>Book Listing</div>
                        </div>
                        <div>
                            <div className="text-xl font-bold" style={{ color: theme.colors.primary.main }}>550+</div>
                            <div style={{ color: theme.colors.text.secondary, fontSize: '0.875rem' }}>Register User</div>
                        </div>
                        <div>
                            <div className="text-xl font-bold" style={{ color: theme.colors.primary.main }}>1,200+</div>
                            <div style={{ color: theme.colors.text.secondary, fontSize: '0.875rem' }}>Books Sold</div>
                        </div>
                    </div>
                    <button 
                        className="px-6 py-2 rounded font-semibold transition"
                        style={{ 
                            backgroundColor: theme.colors.primary.main,
                            color: theme.colors.primary.contrast,
                            boxShadow: theme.shadows.sm
                        }}
                        onClick={() => window.location.href = '/books'}
                    >
                        Explore Now
                    </button>
                </div>
            </div>

            {/* New Releases Section */}
            <div className="mb-16">
                <h2 className="text-2xl font-bold mb-6 text-center">New Arrivals</h2>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: `${carouselWidth}px`, margin: '0 auto' }}>
                    <button
                        aria-label="Scroll left"
                        onClick={() => setNewArrivalsIndex(i => Math.max(0, i - 1))}
                        disabled={newArrivalsIndex === 0}
                        style={{
                            visibility: newArrivalsIndex === 0 ? 'hidden' : 'visible',
                            position: 'absolute', left: -50, zIndex: 2,
                            background: '#fff', border: 'none', borderRadius: '50%', boxShadow: '0 2px 8px #0001', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                        }}
                    >
                        <span style={{ fontSize: 24 }}>&#8592;</span>
                    </button>
                    <div style={{ overflow: 'hidden', width: `${carouselWidth}px` }}>
                        <div
                            style={{
                                display: 'flex',
                                gap: `${GAP}px`,
                                transform: `translateX(-${newArrivalsIndex * (CARD_WIDTH + GAP)}px)`,
                                transition: 'transform 0.5s cubic-bezier(0.4,0,0.2,1)',
                                width: `${(newArrivals?.length || 0) * (CARD_WIDTH + GAP) - GAP}px`,
                            }}
                        >
                            {Array.isArray(newArrivals) && newArrivals.map(book => (
                                <div style={{ width: CARD_WIDTH, flexShrink: 0 }} key={book.bookId}>
                                    <BooksCard book={book} onClick={() => navigate(`/books/${book.bookId}`)} />
                                </div>
                            ))}
                        </div>
                    </div>
                    <button
                        aria-label="Scroll right"
                        onClick={() => setNewArrivalsIndex(i => Math.min(maxNewArrivalsIndex, i + 1))}
                        disabled={newArrivalsIndex >= maxNewArrivalsIndex}
                        style={{
                            visibility: newArrivalsIndex >= maxNewArrivalsIndex ? 'hidden' : 'visible',
                            position: 'absolute', right: -50, zIndex: 2,
                            background: '#fff', border: 'none', borderRadius: '50%', boxShadow: '0 2px 8px #0001', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                        }}
                    >
                        <span style={{ fontSize: 24 }}>&#8594;</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Home;
