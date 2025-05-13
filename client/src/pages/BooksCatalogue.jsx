import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BooksCard from '../components/BooksCard';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { theme } from '../theme';

const FILTER_TABS = [
    { key: 'all', label: 'All Books' },
    { key: 'new', label: 'New Arrivals', icon: '🔥' },
    { key: 'bestseller', label: 'Bestsellers', icon: '⭐' },
    { key: 'discount', label: 'Deals', icon: '💸' },
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
    const [totalCount, setTotalCount] = useState(0);
    const [genres, setGenres] = useState([]);
    const [authors, setAuthors] = useState([]);
    const [publishers, setPublishers] = useState([]);
    const [customPrice, setCustomPrice] = useState({ min: '', max: '' });
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const [expandGenres, setExpandGenres] = useState(true);
    const [expandAuthors, setExpandAuthors] = useState(true);
    const [expandPublishers, setExpandPublishers] = useState(true);

    // Helper to get array param from searchParams
    const getArrayParam = (key) => searchParams.getAll(key);
    const getParam = (key, fallback = '') => searchParams.get(key) || fallback;

    // UI state derived from URL
    const selectedGenres = getArrayParam('genres');
    const selectedAuthors = getArrayParam('authors');
    const selectedPublishers = getArrayParam('publishers');
    const selectedLanguages = getArrayParam('languages');
    const selectedPrice = getParam('selectedPrice', null);
    const sortPrice = getParam('sortPrice', 'asc');
    const searchQuery = getParam('search', '');
    const activeTab = getParam('tab', 'all');
    const page = parseInt(getParam('page', '1'), 10);
    const PAGE_SIZE = 8;

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
                setGenres(
                    res.data.filter(
                        g => (g.Name ?? g.name) && (g.GenreId ?? g.genreId)
                    )
                );
            } catch {
                // ignore genre error for now
            }
        };
        const fetchAuthors = async () => {
            try {
                const res = await axios.get('http://localhost:5124/api/Authors');
                setAuthors(
                    res.data.filter(
                        a => (a.FirstName ?? a.firstName) && (a.LastName ?? a.lastName) && (a.AuthorId ?? a.authorId)
                    )
                );
            } catch {
                // ignore author error for now
            }
        };
        const fetchPublishers = async () => {
            try {
                const res = await axios.get('http://localhost:5124/api/Publishers');
                setPublishers(
                    res.data.filter(
                        p => (p.Name ?? p.name) && (p.PublisherId ?? p.publisherId)
                    )
                );
            } catch {
                // ignore publisher error for now
            }
        };
        fetchGenres();
        fetchAuthors();
        fetchPublishers();
    }, []);

    // Build query string for backend filters from searchParams
    const buildQuery = () => {
        const params = new URLSearchParams();
        if (searchQuery.trim() !== "") params.append('search', searchQuery.trim());
        selectedGenres.forEach(g => params.append('genres', g));
        selectedAuthors.forEach(a => params.append('authors', a));
        selectedPublishers.forEach(p => params.append('publishers', p));
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
        params.append('page', page);
        params.append('pageSize', PAGE_SIZE);
        return params.toString();
    };

    // Fetch books from backend with filters
    const fetchBooks = async () => {
        try {
            const query = buildQuery();
            const response = await axios.get(`http://localhost:5124/api/BooksCatalogue?${query}`);
            setBooks(response.data.books || []);
            setTotalCount(response.data.totalCount || 0);
        } catch {
            setBooks([]);
            setTotalCount(0);
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

    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    return (
        <div style={{ display: 'flex', minHeight: '80vh', background: '#fafbfc' }}>
            {/* Side Nav for Genres and Filters */}
            <aside style={{ width: 320, background: '#fff', borderRight: '1px solid #eee', padding: '2rem 1rem 2rem 2rem' }}>
                {/* Genre Box */}
                <div style={{ marginBottom: 32, border: '1px solid #e0e0e0', borderRadius: 10, padding: '18px 18px 12px 18px', background: '#fafbfc' }}>
                    <div
                        style={{ fontWeight: 700, fontSize: 18, marginBottom: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', userSelect: 'none' }}
                        onClick={() => setExpandGenres(exp => !exp)}
                    >
                        All Genres
                        <span style={{ marginLeft: 8, fontSize: 18 }}>{expandGenres ? '▼' : '▶'}</span>
                    </div>
                    {expandGenres && (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {genres.length === 0 && (
                                <li key="no-genres" style={{ color: 'red', fontSize: 14 }}>No genres found. Check API response.</li>
                            )}
                            {genres.map((genre, idx) => {
                                const genreId = genre.GenreId ?? genre.genreId;
                                const genreName = genre.Name ?? genre.name;
                                return (
                                    <li key={`genre-${genreId}`} style={{ marginBottom: idx !== genres.length - 1 ? 6 : 0 }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <input
                                                type="checkbox"
                                                checked={selectedGenres.includes(genreName)}
                                                onChange={() => {
                                                    let newGenres;
                                                    if (selectedGenres.includes(genreName)) {
                                                        newGenres = selectedGenres.filter(g => g !== genreName);
                                                    } else {
                                                        newGenres = [...selectedGenres, genreName];
                                                    }
                                                    setFilter('genres', newGenres, true);
                                                }}
                                            />
                                            {genreName}
                                        </label>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
                {/* Author Box */}
                <div style={{ marginBottom: 32, border: '1px solid #e0e0e0', borderRadius: 10, padding: '18px 18px 12px 18px', background: '#fafbfc' }}>
                    <div
                        style={{ fontWeight: 700, fontSize: 18, marginBottom: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', userSelect: 'none' }}
                        onClick={() => setExpandAuthors(exp => !exp)}
                    >
                        All Authors
                        <span style={{ marginLeft: 8, fontSize: 18 }}>{expandAuthors ? '▼' : '▶'}</span>
                    </div>
                    {expandAuthors && (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: 180, overflowY: 'auto' }}>
                            {authors.length === 0 && (
                                <li key="no-authors" style={{ color: 'red', fontSize: 14 }}>No authors found. Check API response.</li>
                            )}
                            {authors.map((author, idx) => {
                                const authorId = author.AuthorId ?? author.authorId;
                                const firstName = author.FirstName ?? author.firstName;
                                const lastName = author.LastName ?? author.lastName;
                                const authorName = `${firstName} ${lastName}`;
                                return (
                                    <li key={`author-${authorId ?? idx}`} style={{ marginBottom: idx !== authors.length - 1 ? 6 : 0 }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <input
                                                type="checkbox"
                                                checked={selectedAuthors.includes(authorName)}
                                                onChange={() => {
                                                    let newAuthors;
                                                    if (selectedAuthors.includes(authorName)) {
                                                        newAuthors = selectedAuthors.filter(a => a !== authorName);
                                                    } else {
                                                        newAuthors = [...selectedAuthors, authorName];
                                                    }
                                                    setFilter('authors', newAuthors, true);
                                                }}
                                            />
                                            {authorName}
                                        </label>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
                {/* Publisher Box */}
                <div style={{ marginBottom: 32, border: '1px solid #e0e0e0', borderRadius: 10, padding: '18px 18px 12px 18px', background: '#fafbfc' }}>
                    <div
                        style={{ fontWeight: 700, fontSize: 18, marginBottom: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', userSelect: 'none' }}
                        onClick={() => setExpandPublishers(exp => !exp)}
                    >
                        All Publishers
                        <span style={{ marginLeft: 8, fontSize: 18 }}>{expandPublishers ? '▼' : '▶'}</span>
                    </div>
                    {expandPublishers && (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: 180, overflowY: 'auto' }}>
                            {publishers.length === 0 && (
                                <li key="no-publishers" style={{ color: 'red', fontSize: 14 }}>No publishers found. Check API response.</li>
                            )}
                            {publishers.map((publisher, idx) => {
                                const publisherId = publisher.PublisherId ?? publisher.publisherId;
                                const publisherName = publisher.Name ?? publisher.name;
                                return (
                                    <li key={`publisher-${publisherId}`} style={{ marginBottom: idx !== publishers.length - 1 ? 6 : 0 }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <input
                                                type="checkbox"
                                                checked={selectedPublishers.includes(String(publisherId))}
                                                onChange={() => {
                                                    let newPublishers;
                                                    if (selectedPublishers.includes(String(publisherId))) {
                                                        newPublishers = selectedPublishers.filter(p => p !== String(publisherId));
                                                    } else {
                                                        newPublishers = [...selectedPublishers, String(publisherId)];
                                                    }
                                                    setFilter('publishers', newPublishers, true);
                                                }}
                                            />
                                            {publisherName}
                                        </label>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
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
                        background: theme.colors.primary.main,
                        color: theme.colors.primary.contrast,
                        border: 'none',
                        borderRadius: 8,
                        padding: '12px 0',
                        fontWeight: 700,
                        fontSize: 16,
                        cursor: 'pointer',
                        marginTop: 12,
                        marginBottom: 24,
                        boxShadow: theme.shadows.sm
                    }}
                >
                    Reset Filters
                </button>
            </aside>
            {/* Main Content */}
            <main style={{ flex: 1, padding: '2rem 2rem 2rem 2rem' }}>
                <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                    {FILTER_TABS.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setFilter('tab', tab.key)}
                            style={{
                                fontWeight: activeTab === tab.key ? 700 : 500,
                                color: activeTab === tab.key ? theme.colors.primary.main : '#333',
                                background: activeTab === tab.key ? '#eee' : 'transparent',
                                border: 'none',
                                borderBottom: activeTab === tab.key ? `2px solid ${theme.colors.primary.main}` : '2px solid transparent',
                                fontSize: 16,
                                padding: '8px 18px',
                                borderRadius: 6,
                                cursor: 'pointer',
                                outline: 'none',
                                transition: 'background 0.2s, color 0.2s',
                            }}
                        >
                            {tab.icon && <span style={{ marginRight: 6 }}>{tab.icon}</span>}
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
                                : 'All Books'}
                    </h2>
                    <div style={{ flex: 1 }} />
                    <div style={{ position: 'relative', width: 340 }}>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setFilter('search', e.target.value)}
                            placeholder={`Search ${selectedGenres.length === 1 ? selectedGenres[0] : 'Books'}`}
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
                    <>
                        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                            {books.map((book, idx) => (
                                <BooksCard
                                    key={book.bookId || idx}
                                    book={book}
                                    onClick={() => navigate(`/books/${book.bookId}`)}
                                />
                            ))}
                        </div>
                        {/* Pagination Controls */}
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 32, gap: 8 }}>
                            <button
                                onClick={() => setFilter('page', Math.max(1, page - 1))}
                                disabled={page === 1}
                                style={{
                                    padding: '8px 14px',
                                    borderRadius: 6,
                                    border: `1px solid ${theme.colors.primary.main}`,
                                    background: page === 1 ? '#eee' : theme.colors.primary.main,
                                    color: page === 1 ? '#888' : theme.colors.primary.contrast,
                                    fontWeight: 600,
                                    cursor: page === 1 ? 'not-allowed' : 'pointer',
                                    fontSize: 20,
                                    minWidth: 40,
                                }}
                            >
                                &#8592;
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                <button
                                    key={p}
                                    onClick={() => setFilter('page', p)}
                                    style={{
                                        padding: '8px 14px',
                                        borderRadius: 6,
                                        border: p === page ? `2px solid ${theme.colors.primary.main}` : '1px solid #ccc',
                                        background: p === page ? theme.colors.primary.main : '#fff',
                                        color: p === page ? theme.colors.primary.contrast : '#1976d2',
                                        fontWeight: p === page ? 700 : 500,
                                        fontSize: 16,
                                        minWidth: 40,
                                        cursor: p === page ? 'default' : 'pointer',
                                        boxShadow: p === page ? theme.shadows.sm : 'none',
                                        margin: '0 2px',
                                        outline: 'none',
                                        transition: 'background 0.2s, color 0.2s',
                                    }}
                                    disabled={p === page}
                                >
                                    {p}
                                </button>
                            ))}
                            <button
                                onClick={() => setFilter('page', page + 1)}
                                disabled={page === totalPages || totalPages === 0}
                                style={{
                                    padding: '8px 14px',
                                    borderRadius: 6,
                                    border: `1px solid ${theme.colors.primary.main}`,
                                    background: page === totalPages || totalPages === 0 ? '#eee' : theme.colors.primary.main,
                                    color: page === totalPages || totalPages === 0 ? '#888' : theme.colors.primary.contrast,
                                    fontWeight: 600,
                                    cursor: page === totalPages || totalPages === 0 ? 'not-allowed' : 'pointer',
                                    fontSize: 20,
                                    minWidth: 40,
                                }}
                            >
                                &#8594;
                            </button>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default BooksCatalogue; 