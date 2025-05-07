import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BooksCard from '../components/BooksCard';
import { useNavigate } from 'react-router-dom';

const FILTER_TABS = [
    { key: 'all', label: 'All Books' },
    { key: 'new', label: 'New Arrivals', icon: '🔥' },
    { key: 'bestseller', label: 'Bestsellers', icon: '⭐' },
    { key: 'discount', label: 'With Discount', icon: '💸' },
    { key: 'award', label: 'Award Winning', icon: '🏆' },
    { key: 'coming', label: 'Coming Soon', icon: '⏳' },
];

const PRICE_RANGES = [
    { key: '0-500', label: '0 - 500', min: 0, max: 500 },
    { key: '500-1200', label: '500 - 1200', min: 500, max: 1200 },
    { key: '1200+', label: 'More than 1200', min: 1200, max: Infinity },
    { key: 'custom', label: 'Custom' },
];

const LANGUAGES = [
    'English',
    'Nepali',
    'Hindi',
];

const BooksCatalogue = () => {
    const [books, setBooks] = useState([]);
    const [genres, setGenres] = useState([]);
    const [selectedGenre, setSelectedGenre] = useState(null);
    const [activeTab, setActiveTab] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPrice, setSelectedPrice] = useState(null);
    const [customPrice, setCustomPrice] = useState({ min: '', max: '' });
    const [selectedLanguages, setSelectedLanguages] = useState([]);
    const [sortPrice, setSortPrice] = useState('asc'); // 'asc' or 'desc'
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const res = await axios.get('http://localhost:5124/api/Genres');
                setGenres(res.data);
            } catch (err) {
                // ignore genre error for now
            }
        };
        fetchGenres();
    }, []);

    useEffect(() => {
        const fetchBooks = async () => {
            setLoading(true);
            setError(null);
            try {
                // You may want to pass filters as query params here
                const response = await axios.get('http://localhost:5124/api/book');
                setBooks(response.data);
            } catch (err) {
                setError('Failed to fetch books.');
            } finally {
                setLoading(false);
            }
        };
        fetchBooks();
    }, [activeTab, selectedGenre]);

    // Filtering logic (client-side for now)
    const filteredBooks = books
        .filter((book) => {
            let genreMatch = true;
            if (selectedGenre) {
                genreMatch = book.Genres && book.Genres.some(g => g.GenreId === selectedGenre);
            }
            // Simulate filter logic for tabs (replace with real API logic as needed)
            let tabMatch = true;
            switch (activeTab) {
                case 'new':
                    tabMatch = book.IsNewArrival;
                    break;
                case 'bestseller':
                    tabMatch = book.IsBestseller;
                    break;
                case 'discount':
                    tabMatch = book.HasDiscount;
                    break;
                case 'award':
                    tabMatch = book.IsAwardWinning;
                    break;
                case 'coming':
                    tabMatch = book.Status && book.Status.toLowerCase() === 'upcoming';
                    break;
                default:
                    tabMatch = true;
            }
            // Price filter
            let priceMatch = true;
            if (selectedPrice) {
                if (selectedPrice === 'custom') {
                    const min = parseFloat(customPrice.min) || 0;
                    const max = parseFloat(customPrice.max) || Infinity;
                    priceMatch = book.Price >= min && book.Price <= max;
                } else {
                    const range = PRICE_RANGES.find(r => r.key === selectedPrice);
                    if (range) {
                        priceMatch = book.Price >= range.min && book.Price <= range.max;
                    }
                }
            }
            // Language filter
            let langMatch = true;
            if (selectedLanguages.length > 0) {
                langMatch = selectedLanguages.includes(book.Language);
            }
            let matches = genreMatch && tabMatch && priceMatch && langMatch;
            // Search filter
            if (searchQuery.trim() !== "") {
                const q = searchQuery.trim().toLowerCase();
                const titleMatch = book.Title && book.Title.toLowerCase().includes(q);
                const authorMatch = book.Authors && book.Authors.some(a => (`${a.FirstName} ${a.LastName}`.toLowerCase().includes(q)));
                matches = matches && (titleMatch || authorMatch);
            }
            return matches;
        })
        .sort((a, b) => {
            if (sortPrice === 'asc') return a.Price - b.Price;
            if (sortPrice === 'desc') return b.Price - a.Price;
            return 0;
        });

    // Add a resetFilters function
    const resetFilters = () => {
        setSelectedGenre(null);
        setSelectedPrice(null);
        setCustomPrice({ min: '', max: '' });
        setSelectedLanguages([]);
        setSortPrice('asc');
        setSearchQuery('');
    };

    return (
        <div style={{ display: 'flex', minHeight: '80vh', background: '#fafbfc' }}>
            {/* Side Nav for Genres and Filters */}
            <aside style={{ width: 320, background: '#fff', borderRight: '1px solid #eee', padding: '2rem 1rem 2rem 2rem' }}>
                {/* Genre Box */}
                <div style={{ marginBottom: 32, border: '1px solid #e0e0e0', borderRadius: 10, padding: '18px 18px 12px 18px', background: '#fafbfc' }}>
                    <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 16 }}>All Genres</div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        <li key="all-genres">
                            <button
                                onClick={() => setSelectedGenre(null)}
                                style={{
                                    background: selectedGenre === null ? '#1976d2' : 'transparent',
                                    color: selectedGenre === null ? '#fff' : '#222',
                                    border: 'none',
                                    borderRadius: 8,
                                    padding: '8px 16px',
                                    marginBottom: 6,
                                    width: '100%',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    fontWeight: 500,
                                }}
                            >
                                All Genres
                            </button>
                        </li>
                        {genres.length === 0 && (
                            <li key="no-genres" style={{ color: 'red', fontSize: 14 }}>No genres found. Check API response.</li>
                        )}
                        {genres.map((genre) => (
                            <li key={`genre-${genre.GenreId}`}>
                                <button
                                    onClick={() => setSelectedGenre(genre.GenreId)}
                                    style={{
                                        background: selectedGenre === genre.GenreId ? '#1976d2' : 'transparent',
                                        color: selectedGenre === genre.GenreId ? '#fff' : '#222',
                                        border: 'none',
                                        borderRadius: 8,
                                        padding: '8px 16px',
                                        marginBottom: 6,
                                        width: '100%',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        fontWeight: 500,
                                    }}
                                >
                                    {genre.Name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
                {/* Price and Sort Box */}
                <div style={{ marginBottom: 32, border: '1px solid #e0e0e0', borderRadius: 10, padding: '18px 18px 12px 18px', background: '#fafbfc' }}>
                    <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>Price (NPR)</div>
                    <div>
                        {PRICE_RANGES.map(range => (
                            <div key={range.key} style={{ marginBottom: 6 }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedPrice === range.key}
                                        onChange={() => setSelectedPrice(selectedPrice === range.key ? null : range.key)}
                                    />
                                    {range.label}
                                </label>
                                {range.key === 'custom' && selectedPrice === 'custom' && (
                                    <div style={{ marginLeft: 24, marginTop: 4, display: 'flex', gap: 8 }}>
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            value={customPrice.min}
                                            onChange={e => setCustomPrice({ ...customPrice, min: e.target.value })}
                                            style={{ width: 60, padding: 4, border: '1px solid #ccc', borderRadius: 4 }}
                                        />
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            value={customPrice.max}
                                            onChange={e => setCustomPrice({ ...customPrice, max: e.target.value })}
                                            style={{ width: 60, padding: 4, border: '1px solid #ccc', borderRadius: 4 }}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    {/* Sort Price By */}
                    <div style={{ fontWeight: 600, fontSize: 15, margin: '18px 0 8px 0' }}>Sort Price By</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <input
                                type="radio"
                                checked={sortPrice === 'asc'}
                                onChange={() => setSortPrice('asc')}
                            />
                            Price Low To High (Default)
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <input
                                type="radio"
                                checked={sortPrice === 'desc'}
                                onChange={() => setSortPrice('desc')}
                            />
                            Price High To Low
                        </label>
                    </div>
                </div>
                {/* Language Box */}
                <div style={{ marginBottom: 16, border: '1px solid #e0e0e0', borderRadius: 10, padding: '18px 18px 12px 18px', background: '#fafbfc' }}>
                    <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>Languages</div>
                    <div>
                        {LANGUAGES.map(lang => (
                            <div key={lang} style={{ marginBottom: 6 }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedLanguages.includes(lang)}
                                        onChange={() => {
                                            setSelectedLanguages(selectedLanguages.includes(lang)
                                                ? selectedLanguages.filter(l => l !== lang)
                                                : [...selectedLanguages, lang]);
                                        }}
                                    />
                                    {lang}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Reset Filters Button */}
                <button
                    onClick={resetFilters}
                    style={{
                        width: '100%',
                        background: '#1976d2',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        padding: '12px 0',
                        fontWeight: 700,
                        fontSize: 16,
                        cursor: 'pointer',
                        marginTop: 12,
                        marginBottom: 24,
                        boxShadow: '0 2px 8px rgba(25,118,210,0.08)'
                    }}
                >
                    Reset Filters
                </button>
            </aside>
            {/* Main Content */}
            <main style={{ flex: 1, padding: '2rem 2rem 2rem 2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                    {FILTER_TABS.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            style={{
                                background: activeTab === tab.key ? '#1976d2' : '#f4f6fa',
                                color: activeTab === tab.key ? '#fff' : '#222',
                                border: 'none',
                                borderRadius: 8,
                                padding: '8px 18px',
                                fontWeight: 600,
                                fontSize: 15,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                cursor: 'pointer',
                                boxShadow: activeTab === tab.key ? '0 2px 8px rgba(25,118,210,0.08)' : 'none',
                                transition: 'background 0.2s',
                            }}
                        >
                            {tab.icon && <span>{tab.icon}</span>}
                            {tab.label}
                        </button>
                    ))}
                </div>
                {/* Title and Search Bar Row */}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32 }}>
                    <h2 style={{ fontWeight: 700, fontSize: 24, marginBottom: 0 }}>
                        {selectedGenre
                            ? (genres.find(g => g.GenreId === selectedGenre)?.Name || 'Genre')
                            : 'All Genres'}
                    </h2>
                    <div style={{ flex: 1 }} />
                    <div style={{ position: 'relative', width: 340 }}>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder={`Search on ${selectedGenre ? (genres.find(g => g.GenreId === selectedGenre)?.Name || 'Genre') : 'All Genres'}`}
                            style={{
                                width: '100%',
                                padding: '10px 44px 10px 18px',
                                borderRadius: 12,
                                border: '1px solid #e0e0e0',
                                fontSize: 16,
                                background: '#fff',
                                outline: 'none',
                            }}
                        />
                        <span style={{
                            position: 'absolute',
                            right: 16,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#888',
                            fontSize: 20,
                            pointerEvents: 'none',
                        }}>
                            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                        </span>
                    </div>
                </div>
                {loading ? (
                    <p>Loading...</p>
                ) : error ? (
                    <p style={{ color: 'red' }}>{error}</p>
                ) : (
                    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                        {filteredBooks.length === 0 && <div>No books found.</div>}
                        {filteredBooks.map((book) => (
                            <BooksCard
                                key={book.BookId}
                                book={book}
                                onClick={() => navigate(`/books/${book.BookId}`)}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default BooksCatalogue; 