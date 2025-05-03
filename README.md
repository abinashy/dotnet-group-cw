# BookNook - Online Book Library & Retail System

## Project Overview
BookNook is a comprehensive online book library and retail system designed to expand a private book library's reach through e-commerce capabilities. The platform enables users to browse, search, and purchase books from an extensive catalog with rich filtering and sorting options. Built with React (client) and .NET Web API (server), BookNook offers a seamless shopping experience with features such as book bookmarking, cart management, and a specialized order fulfillment process.

## Key Features
- **Catalog Browsing**: Paginated book catalog with detailed book information
- **Advanced Search & Filtering**: Filter by author, genre, availability, price range, ratings, language, format, and publisher
- **Multiple View Options**: Tabs for All Books, Bestsellers, Award Winners, New Releases, New Arrivals, Coming Soon, and Deals
- **User Management**: Registration and authentication system
- **Member Features**:
  - Book bookmarking (whitelist)
  - Shopping cart functionality
  - Order placement and cancellation
  - Book reviews and ratings (post-purchase)
  - Email notifications with claim codes
  - Progressive discount system (5% for 5+ books, 10% stackable after 10 successful orders)
- **Staff Portal**: Order processing via claim code validation
- **Admin Dashboard**:
  - Complete catalog management (CRUD operations)
  - Inventory management
  - Timed discount configuration
  - Promotional banner creation
- **Real-time Order Broadcasting**: Notifications for successful orders

## Technology Stack
### Frontend
- **Framework**: React.js
- **Routing**: React Router

### Backend
- **Framework**: .NET Web API
- **Database**: PostgreSQL

### Development Tools
- **Version Control**: Git
- **Package Manager**: npm (client), NuGet (server)