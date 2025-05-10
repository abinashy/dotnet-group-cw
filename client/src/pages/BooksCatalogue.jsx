import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BooksCard from '../components/BooksCard';
import { useNavigate, useSearchParams } from 'react-router-dom';

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
    const [customPrice, setCustomPrice] = useState({ min: '', max: '' });
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    // Helper to get array param from searchParams
    const getArrayParam = (key) => searchParams.getAll(key);
    const getParam = (key, fallback = '') => searchParams.get(key) || fallback;

    // UI state derived from URL
    const selectedGenres = getArrayParam('genres');
    const selectedLanguages = getArrayParam('languages');
    const selectedPrice = getParam('selectedPrice', null);
    const sortPrice = getParam('sortPrice', 'asc');
    const searchQuery = getParam('search', '');
    const activeTab = getParam('tab', 'all');

    // Keep custom price UI in sync with URL
    useEffect(() => {
        if (selectedPrice === 'custom') {
            setCustomPrice({
                min: getParam('minPrice', ''),
                max: getParam('maxPrice', ''),
            });
        } else {
            setCustomPrice({ min: '', max: '' });
        }
        // eslint-disable-next-line
    }, [selectedPrice, searchParams]);

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

    // Build query string for backend filters from searchParams
    const buildQuery = () => {
        const params = new URLSearchParams();
        if (searchQuery.trim() !== "") params.append('search', searchQuery.trim());
        selectedGenres.forEach(g => params.append('genres', g));
        selectedLanguages.forEach(l => params.append('languages', l));
        if (selectedPrice) {
            params.append('selectedPrice', selectedPrice);
            if (selectedPrice === 'custom') {
                if (customPrice.min) params.append('minPrice', customPrice.min);
                if (customPrice.max) params.append('maxPrice', customPrice.max);
            } else {
                const range = PRICE_RANGES.find(r => r.key === selectedPrice);
                if (range) {
                    params.append('minPrice', range.min);
                    if (range.max !== Infinity) params.append('maxPrice', range.max);
                }
            }
        }
        if (sortPrice) params.append('sortPrice', sortPrice);
        if (activeTab && activeTab !== 'all') params.append('tab', activeTab);
        return params.toString();
    };

    // Fetch books from backend with filters
    const fetchBooks = async () => {
        try {
            const query = buildQuery();
            const response = await axios.get(`http://localhost:5124/api/book?${query}`);
            setBooks(response.data);
        } catch (err) {
            setBooks([]);
        }
    };

    // Fetch books whenever searchParams change
    useEffect(() => {
        fetchBooks();
        // eslint-disable-next-line
    }, [searchParams]);

    // Update URL (searchParams) when a filter changes
    const setFilter = (key, value, isArray = false) => {
        const params = new URLSearchParams(searchParams);
        if (isArray) {
            params.delete(key);
            value.forEach(v => params.append(key, v));
        } else if (value !== null && value !== undefined && value !== '') {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        setSearchParams(params);
    };

    // Reset all filters
    const resetFilters = () => {
        setSearchParams({});
        setCustomPrice({ min: '', max: '' });
    };

    return (
        <div style={{ display: 'flex', minHeight: '80vh', background: '#fafbfc' }}>
            {/* Side Nav for Genres and Filters */}
            <aside style={{ width: 320, background: '#fff', borderRight: '1px solid #eee', padding: '2rem 1rem 2rem 2rem' }}>
                {/* Genre Box */}
                <div style={{ marginBottom: 32, border: '1px solid #e0e0e0', borderRadius: 10, padding: '18px 18px 12px 18px', background: '#fafbfc' }}>
                    <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 16 }}>All Genres</div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {genres.length === 0 && (
                            <li key="no-genres" style={{ color: 'red', fontSize: 14 }}>No genres found. Check API response.</li>
                        )}
                        {genres.map((genre, idx) => (
                            <li key={`genre-${genre.GenreId}`} style={{ marginBottom: idx !== genres.length - 1 ? 6 : 0 }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedGenres.includes(genre.Name)}
                                        onChange={() => {
                                            let newGenres;
                                            if (selectedGenres.includes(genre.Name)) {
                                                newGenres = selectedGenres.filter(g => g !== genre.Name);
                                            } else {
                                                newGenres = [...selectedGenres, genre.Name];
                                            }
                                            setFilter('genres', newGenres, true);
                                        }}
                                    />
                                    {genre.Name}
                                </label>
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
                                        onChange={() => {
                                            setFilter('selectedPrice', selectedPrice === range.key ? null : range.key);
                                            if (range.key !== 'custom') {
                                                setCustomPrice({ min: '', max: '' });
                                            }
                                        }}
                                    />
                                    {range.label}
                                </label>
                                {range.key === 'custom' && selectedPrice === 'custom' && (
                                    <div style={{ marginLeft: 24, marginTop: 4, display: 'flex', gap: 8 }}>
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            value={customPrice.min}
                                            onChange={e => {
                                                setCustomPrice({ ...customPrice, min: e.target.value });
                                                setFilter('minPrice', e.target.value);
                                            }}
                                            style={{ width: 60, padding: 4, border: '1px solid #ccc', borderRadius: 4 }}
                                        />
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            value={customPrice.max}
                                            onChange={e => {
                                                setCustomPrice({ ...customPrice, max: e.target.value });
                                                setFilter('maxPrice', e.target.value);
                                            }}
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
                                onChange={() => setFilter('sortPrice', 'asc')}
                            />
                            Price Low To High (Default)
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <input
                                type="radio"
                                checked={sortPrice === 'desc'}
                                onChange={() => setFilter('sortPrice', 'desc')}
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
                                            let newLangs;
                                            if (selectedLanguages.includes(lang)) {
                                                newLangs = selectedLanguages.filter(l => l !== lang);
                                            } else {
                                                newLangs = [...selectedLanguages, lang];
                                            }
                                            setFilter('languages', newLangs, true);
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
                            onClick={() => setFilter('tab', tab.key)}
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
                        {selectedGenres.length === 1
                            ? selectedGenres[0]
                            : selectedGenres.length > 1
                                ? `${selectedGenres.length} Genres`
                                : 'All Genres'}
                    </h2>
                    <div style={{ flex: 1 }} />
                    <div style={{ position: 'relative', width: 340 }}>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setFilter('search', e.target.value)}
                            placeholder={`Search on ${selectedGenres.length === 1 ? selectedGenres[0] : 'All Genres'}`}
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
                {books.length === 0 ? (
                    <p>No books found.</p>
                ) : (
                    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                        {books.map((book) => (
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