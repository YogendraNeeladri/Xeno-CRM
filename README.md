# Mini CRM Platform

A full-stack CRM platform built with React.js, Node.js, Express, and MongoDB, featuring campaign management, customer segmentation, and AI-powered features.

## 🚀 Features

- Customer and Order Management
- Campaign Segment Builder with Rule-based Filtering
- Campaign Delivery Engine
- Google OAuth 2.0 Authentication
- AI-Powered Features:
  - Natural Language to Rules Conversion
  - AI Message Generator
  - Campaign Summary Generator
  - Send Time Predictor
  - Lookalike Segment Generator
  - Campaign Auto-Tagger

## 🏗️ Architecture

```
CRM/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── store/        # Redux store
│   │   └── services/     # API services
├── server/                # Node.js backend
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── services/         # Business logic
│   └── consumers/        # Message queue consumers
└── ai/                   # AI service integration
```

## 🛠️ Tech Stack

- **Frontend**: React.js, Redux Toolkit, Material-UI
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: Google OAuth 2.0
- **Message Queue**: Redis Streams
- **AI Integration**: OpenAI API
- **Deployment**: Vercel (Frontend), Railway (Backend)

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB
- Redis
- Google Cloud Platform account (for OAuth)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/mini-crm.git
cd mini-crm
```

2. Install dependencies:
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. Set up environment variables:
```bash
# Server (.env)
MONGODB_URI=your_mongodb_uri
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
OPENAI_API_KEY=your_openai_api_key
REDIS_URL=your_redis_url

# Client (.env)
REACT_APP_API_URL=your_api_url
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

4. Start the development servers:
```bash
# Start server
cd server
npm run dev

# Start client
cd ../client
npm start
```

## 📝 API Documentation

### Core Endpoints

- `POST /api/customers` - Create new customer
- `POST /api/orders` - Create new order
- `POST /api/segments` - Create campaign segment
- `POST /api/campaigns` - Create and send campaign
- `GET /api/campaigns/:id/stats` - Get campaign statistics

### Authentication

- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/google/callback` - Google OAuth callback

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for AI capabilities
- Material-UI for the component library
- MongoDB for the database 