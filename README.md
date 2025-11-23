# Lab Booking System - Full Stack MERN Application

A comprehensive pathology lab/diagnostic center booking system built with React, Express, MongoDB, and Node.js.

## Features

### Public Features
- Browse test catalog with search and filters
- Add tests to cart
- Book appointments (home collection or lab visit)
- View gallery and testimonials
- Dark/Light mode support

### Admin Features
- Dashboard with statistics
- Manage tests, bookings, notes, gallery, testimonials
- User management
- Booking status management

## Tech Stack

### Backend
- Node.js & Express
- MongoDB with Mongoose
- JWT authentication with HTTP-only cookies
- Express Validator

### Frontend
- React 18 with Vite
- Tailwind CSS
- Ant Design (antd)
- React Router
- Axios

## Project Structure

```
jpdc/
├── backend/
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── middleware/      # Auth middleware
│   └── server.js        # Express server
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── contexts/    # React contexts
│   │   └── utils/       # Utility functions
│   └── package.json
└── README.md
```

## Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lab-booking
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

4. Start the server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

## Deployment

> **📚 For complete deployment instructions, see:**
> - **[QUICK_START.md](./QUICK_START.md)** - Quick setup guide
> - **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Detailed deployment documentation with Nginx

### Quick Deployment

For automated setup, use the provided script:

```bash
bash setup-server.sh
```

This will automatically:
- Install all dependencies (Node.js, MongoDB, Nginx, PM2)
- Configure backend with PM2 for auto-restart
- Build and configure frontend
- Setup Nginx as reverse proxy
- Configure firewall
- Enable auto-start on boot

### AWS EC2 Deployment

#### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# Install PM2 for process management
sudo npm install -g pm2
```

#### 2. Backend Deployment

```bash
# Clone or upload your project
cd /var/www/lab-booking/backend

# Install dependencies
npm install --production

# Create .env file with production values
nano .env
```

Production `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lab-booking
JWT_SECRET=your-very-secure-jwt-secret-key
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
```

```bash
# Start with PM2
pm2 start server.js --name lab-booking-api
pm2 save
pm2 startup
```

#### 3. Frontend Deployment

```bash
# Build frontend
cd /var/www/lab-booking/frontend
npm install
npm run build

# Install Nginx
sudo apt install nginx -y

# Create Nginx config
sudo nano /etc/nginx/sites-available/lab-booking
```

Nginx configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend
    location / {
        root /var/www/lab-booking/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/lab-booking /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 4. SSL Certificate (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

#### 5. Firewall Configuration

```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

## Environment Variables

### Backend
- `PORT`: Server port (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `NODE_ENV`: Environment (development/production)
- `FRONTEND_URL`: Frontend URL for CORS

### Frontend
- `VITE_API_URL`: Backend API URL

## API Endpoints

### Auth
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Tests
- `GET /api/tests` - Get all tests
- `GET /api/tests/:id` - Get single test
- `POST /api/tests` - Create test (admin)
- `PUT /api/tests/:id` - Update test (admin)
- `DELETE /api/tests/:id` - Delete test (admin)

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/me` - Get user bookings
- `GET /api/bookings` - Get all bookings (admin)
- `PUT /api/bookings/:id/status` - Update status (admin)

### Notes, Gallery, Testimonials, Users
- Similar CRUD operations (see routes files)

## Default Admin Account

Create an admin user manually in MongoDB or through registration and update role:

```javascript
// In MongoDB shell
use lab-booking
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

## Maintenance

### View Logs
```bash
pm2 logs lab-booking-api
```

### Restart Services
```bash
pm2 restart lab-booking-api
sudo systemctl restart nginx
sudo systemctl restart mongod
```

### Backup MongoDB
```bash
mongodump --out /backup/$(date +%Y%m%d)
```

## Support

For issues or questions, please contact the development team.

