import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BooksCard from '../components/BooksCard';
import axios from 'axios';
import { motion } from 'framer-motion';
import placeholderImg from '../assets/placeholder-book.png';

const Home = () => {
    const navigate = useNavigate();
    const [featuredBooks, setFeaturedBooks] = useState([]);
    const [newArrivals, setNewArrivals] = useState([]);
    const [popularGenres, setPopularGenres] = useState([]);
    const [bargainBooks, setBargainBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [featuredResponse, newArrivalsResponse, genresResponse, bargainBooksResponse] = 
                    await Promise.all([
                        axios.get('http://localhost:5124/api/bookscatalogue?featured=true'),
                        axios.get('http://localhost:5124/api/bookscatalogue?sort=publicationDate&limit=8'),
                        axios.get('http://localhost:5124/api/genres'),
                        axios.get('http://localhost:5124/api/bookscatalogue?onSale=true&limit=4')
                    ]);

                setFeaturedBooks(featuredResponse.data);
                setNewArrivals(newArrivalsResponse.data);
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
        <div className="relative min-h-screen w-full bg-gray-100 overflow-x-hidden">
            {/* Hero Section */}
            <div className="flex flex-col md:flex-row items-center justify-between bg-gray-100 rounded-2xl p-8 md:p-16 mb-12 mt-6">
                <div className="flex-1 mb-8 md:mb-0">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
                        Buy and sell your books <span className="text-blue-600">for the best prices</span>
                    </h1>
                    <p className="text-lg text-gray-700 mb-6">
                        Find and read more you'll love, and keep track of the books you want to read. Be part of the world's largest community of book lovers on BookNook.
                    </p>
                    <form
                        className="flex w-full max-w-md bg-white rounded-lg shadow-md overflow-hidden border border-blue-200 mb-2"
                        onSubmit={e => {
                            e.preventDefault();
                            if (searchTerm.trim()) {
                                navigate(`/books?search=${encodeURIComponent(searchTerm.trim())}`);
                            }
                        }}
                    >
                        <input
                            type="text"
                            className="flex-grow px-4 py-3 text-lg outline-none bg-transparent"
                            placeholder="Search for Books..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-6 py-3 font-semibold hover:bg-blue-700 transition-colors duration-200"
                        >
                            Search
                        </button>
                    </form>
                </div>
                <img src="/assets/hero-books.png" alt="Book Covers" className="w-64 md:w-80 flex-shrink-0 rounded-xl shadow-lg" />
            </div>

            {/* Best Seller Books Section */}
            <div className="mb-16">
                <h2 className="text-2xl font-bold mb-6 text-center">Best Seller Books</h2>
                <div className="flex gap-6 overflow-x-auto pb-4">
                    {featuredBooks.slice(0, 8).map(book => (
                        <div className="min-w-[220px]">
                            <BooksCard key={book.bookId} book={book} onClick={() => navigate(`/books/${book.bookId}`)} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Feature/Promo Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12 items-center">
                <div className="grid grid-cols-3 gap-2 bg-yellow-50 p-4 rounded-xl">
                    {[...featuredBooks, ...newArrivals].slice(0, 9).map((book, i) => (
                        <img key={i} src={book.coverImageUrl || placeholderImg} alt={book.title} className="w-full h-32 object-cover rounded-lg shadow" />
                    ))}
                </div>
                <div className="flex flex-col items-start">
                    <h3 className="text-2xl font-bold mb-2 text-blue-800">Find Your Favorite <span className="text-blue-600">Book Here!</span></h3>
                    <p className="text-gray-700 mb-4">Discover, connect, and start accumulating advantages with BookNook. Join our community and find your next favorite read!</p>
                    <div className="flex gap-8 mb-4">
                        <div>
                            <div className="text-xl font-bold text-blue-700">800+</div>
                            <div className="text-gray-500 text-sm">Book Listing</div>
                        </div>
                        <div>
                            <div className="text-xl font-bold text-blue-700">550+</div>
                            <div className="text-gray-500 text-sm">Register User</div>
                        </div>
                        <div>
                            <div className="text-xl font-bold text-blue-700">1,200+</div>
                            <div className="text-gray-500 text-sm">Books Sold</div>
                        </div>
                    </div>
                    <button className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700 transition">Explore Now</button>
                </div>
            </div>

            {/* New Releases Section */}
            <div className="mb-16">
                <h2 className="text-2xl font-bold mb-6 text-center">New Releases</h2>
                <div className="flex gap-6 overflow-x-auto pb-4">
                    {newArrivals.slice(0, 8).map(book => (
                        <div className="min-w-[220px]">
                            <BooksCard key={book.bookId} book={book} onClick={() => navigate(`/books/${book.bookId}`)} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Home;
