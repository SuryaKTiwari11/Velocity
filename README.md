# Employee Management System (EMS)

This project is an Employee Management System built with Node.js, Express, and React. It provides user authentication, employee management, and other HR-related functionalities.

## Project Structure

```
project/
  ├── backend/        # Node.js and Express backend
  ├── frontend/       # React frontend with Vite
  └── readmes/        # Documentation and guides
```

## Features

- User authentication (login/signup)
- OTP verification
- Password reset functionality
- Employee record management
- Profile management
- HR admin dashboard

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database

### Installation

1. Clone the repository
2. Install backend dependencies:
   ```
   cd backend
   npm install
   ```
3. Install frontend dependencies:
   ```
   cd frontend
   npm install
   ```
4. Configure your environment variables (see `.env.example` in both folders)

### Running the Application

1. Start the backend server:
   ```
   cd backend
   npm start
   ```
2. Start the frontend development server:
   ```
   cd frontend
   npm run dev
   ```

### Running Tests

To run API tests:

```
cd frontend
node test-all-endpoints.js
```

To test admin endpoints specifically:

```
cd frontend
node admin-endpoints-test.js
```

## Advanced Backend & DevOps Roadmap

For detailed information on implementing advanced backend and DevOps concepts in this project, see the [Advanced Implementation Roadmap](readmes/advanced-implementation-roadmap.md).

The roadmap covers:

### 🧱 Message Queues & Event-Driven Architecture

- Redis implementation
- BullMQ for background jobs
- Job scheduling and processing

### 🔔 Real-Time Capabilities

- Socket.io integration
- Real-time notifications
- Live dashboard updates

### ☁️ DevOps & Infrastructure

- Containerization with Docker
- CI/CD pipeline with GitHub Actions
- Monitoring with Prometheus and Grafana

### 🗃️ Database & Caching Design

- Redis caching layer
- Cache-aside pattern implementation
- Rate limiting with Redis

### ⚙️ Scalability Patterns & Fault Tolerance

- Circuit breaker pattern
- Bulkhead pattern for API routes
- Load testing with k6

### 📚 Deployment Strategy

- Blue-Green deployment
- Database setup with RDS
- Redis caching with ElastiCache

### 📦 Advanced Topics

- CQRS pattern implementation
- Event sourcing
- OpenTelemetry tracing

## License

This project is licensed under the MIT License.
