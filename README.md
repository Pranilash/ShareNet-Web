# ShareNet - Campus Sharing Platform

A full-stack campus sharing platform where students can rent, sell, or give away items to each other. Built with React + Vite (frontend) and Express + MongoDB (backend).

## Features

### User & Authentication
- Campus email (.edu) based registration
- Secure JWT authentication with refresh tokens
- User profiles with trust scores
- Transaction history

### Item Management
- Create, edit, delete item listings
- Support for Rent / Sell / Give modes
- Photo uploads (up to 5 per item)
- Category-based organization
- Availability toggle

### Request System
- Request items from other users
- Accept/reject incoming requests
- Intelligent request routing

### Transaction Workflow
- Full transaction lifecycle management
- States: REQUESTED → ACCEPTED → AGREEMENT_PROPOSED → ACTIVE → RETURN_PENDING → COMPLETED
- Dispute handling
- Automatic trust score updates

### Agreement System
- Structured agreement proposals
- Dual confirmation (owner + borrower)
- Return date tracking for rentals

### Real-Time Chat
- Private chat per transaction (Socket.IO)
- Typing indicators
- Message persistence

### Reminder System
- Automatic reminders before return date
- Overdue notifications
- Daily checks

### Trust Score
- Starts at 50/100
- On-time returns increase score
- Late returns and disputes decrease score
- Influences visibility and matching

### Notifications
- Real-time notifications
- Types: request received, accepted, agreement, reminders, overdue, disputes

### Lost & Found
- Report lost items
- Post found items
- Mark as resolved

## Project Structure

```
ShareNet/
├── ShareNet/                    # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── ui/              # Base components (Button, Card, Modal, etc.)
│   │   │   ├── layout/          # Layout components (Navbar, Layout)
│   │   │   ├── items/           # Item-related components
│   │   │   ├── transactions/    # Transaction components
│   │   │   └── chat/            # Chat components
│   │   ├── pages/               # Page components
│   │   ├── stores/              # Zustand state stores
│   │   ├── hooks/               # Custom React hooks
│   │   └── lib/                 # Utilities (axios, socket)
│   └── package.json
│
└── professional-backend-structure/   # Backend (Express + MongoDB)
    ├── src/
    │   ├── models/              # Mongoose models
    │   ├── controllers/         # Route handlers
    │   ├── routes/              # API routes
    │   ├── middlewares/         # Auth, multer middlewares
    │   ├── utils/               # Utilities (ApiError, ApiResponse)
    │   ├── services/            # Background services (reminders)
    │   ├── db/                  # Database connection
    │   ├── socket.js            # Socket.IO setup
    │   ├── app.js               # Express app
    │   └── index.js             # Entry point
    └── package.json
```

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Cloudinary account (for image uploads)

### Backend Setup

```bash
cd professional-backend-structure

# Install dependencies
npm install

# Copy environment file and configure
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secrets, and Cloudinary credentials

# Create temp folder for uploads
mkdir -p public/temp

# Start development server
npm run dev
```

### Frontend Setup

```bash
cd ShareNet

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env if needed (defaults should work for local development)

# Start development server
npm run dev
```

### Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/api/v1

## API Endpoints

### Users
- `POST /api/v1/users/register` - Register new user
- `POST /api/v1/users/login` - Login
- `POST /api/v1/users/logout` - Logout
- `GET /api/v1/users/current-user` - Get current user
- `PATCH /api/v1/users/update-account` - Update profile
- `PATCH /api/v1/users/avatar` - Update avatar

### Items
- `GET /api/v1/items` - List all items (with filters)
- `GET /api/v1/items/:id` - Get item details
- `POST /api/v1/items` - Create item
- `PATCH /api/v1/items/:id` - Update item
- `DELETE /api/v1/items/:id` - Delete item
- `GET /api/v1/items/my-items` - Get user's items

### Requests
- `POST /api/v1/requests` - Create request
- `GET /api/v1/requests/my-requests` - Get sent requests
- `GET /api/v1/requests/received` - Get received requests
- `POST /api/v1/requests/:id/accept` - Accept request
- `POST /api/v1/requests/:id/reject` - Reject request

### Transactions
- `GET /api/v1/transactions` - Get user's transactions
- `GET /api/v1/transactions/:id` - Get transaction details
- `POST /api/v1/transactions/:id/propose-agreement` - Propose agreement
- `POST /api/v1/transactions/:id/confirm-agreement` - Confirm agreement
- `POST /api/v1/transactions/:id/mark-returned` - Mark as returned
- `POST /api/v1/transactions/:id/confirm-return` - Confirm return
- `POST /api/v1/transactions/:id/dispute` - Raise dispute

### Messages
- `GET /api/v1/messages/:transactionId` - Get chat messages
- `POST /api/v1/messages/:transactionId` - Send message

### Notifications
- `GET /api/v1/notifications` - Get notifications
- `GET /api/v1/notifications/unread-count` - Get unread count
- `PATCH /api/v1/notifications/:id/read` - Mark as read
- `PATCH /api/v1/notifications/read-all` - Mark all as read

### Lost & Found
- `GET /api/v1/lost-found` - Get posts
- `POST /api/v1/lost-found` - Create post
- `PATCH /api/v1/lost-found/:id/resolve` - Mark resolved
- `DELETE /api/v1/lost-found/:id` - Delete post

## Socket.IO Events

### Client → Server
- `join-transaction` - Join transaction chat room
- `send-message` - Send chat message
- `typing` - Start typing indicator
- `stop-typing` - Stop typing indicator
- `leave-transaction` - Leave chat room

### Server → Client
- `new-message` - New message received
- `user-typing` - User is typing
- `user-stop-typing` - User stopped typing
- `notification` - New notification

## Tech Stack

### Frontend
- React 19
- Vite
- React Router 7
- Zustand (state management)
- Socket.IO Client
- Tailwind CSS
- Lucide React (icons)
- React Hot Toast (notifications)
- Axios (HTTP client)
- date-fns (date formatting)

### Backend
- Express.js
- MongoDB + Mongoose
- Socket.IO
- JWT (authentication)
- bcrypt (password hashing)
- Multer (file uploads)
- Cloudinary (image storage)

## License

MIT
