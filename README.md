"# Dental API

A simple Node.js Express API with MongoDB integration, designed to run in Docker containers.

## Features

- ✅ Express.js REST API
- ✅ MongoDB database integration
- ✅ Health check endpoint
- ✅ Docker containerization
- ✅ CORS and security middleware
- ✅ Environment configuration

## API Endpoints

- `GET /` - Welcome message and API information
- `GET /health` - Health check endpoint with database status
- `GET /api` - Basic API endpoint

## Quick Start with Docker

### Prerequisites
- Docker and Docker Compose installed

### Running the Application

1. Clone the repository and navigate to the project directory:
```bash
cd dental-api
```

2. Build and start the containers:
```bash
docker-compose up --build
```

3. The API will be available at:
   - API: http://localhost:3000
   - Health Check: http://localhost:3000/health
   - MongoDB: localhost:27017

### Environment Variables

The application uses the following environment variables:

- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 3000)
- `MONGODB_URI` - MongoDB connection string

## Local Development

### Prerequisites
- Node.js (v18 or higher)
- MongoDB running locally

### Setup

1. Install dependencies:
```bash
npm install
```

2. Start MongoDB locally or update the `.env` file with your MongoDB connection string

3. Run the development server:
```bash
npm run dev
```

## Health Check Response

The `/health` endpoint returns:

```json
{
  "status": "OK",
  "timestamp": "2025-07-31T10:30:00.000Z",
  "uptime": 123.456,
  "database": {
    "status": "connected",
    "name": "dental_db"
  },
  "environment": "development",
  "version": "1.0.0"
}
```

## Docker Commands

- Start services: `docker-compose up`
- Start in background: `docker-compose up -d`
- Stop services: `docker-compose down`
- View logs: `docker-compose logs`
- Rebuild containers: `docker-compose up --build`

## Database

The MongoDB container includes:
- Database: `dental_db`
- Sample collections and data
- Persistent volume for data storage

## Security Features

- Helmet.js for security headers
- CORS configuration
- Input validation
- Non-root Docker user
- Environment variable configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request" 
