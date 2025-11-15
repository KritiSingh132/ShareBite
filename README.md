# ShareBite 🍽️

A food waste management platform that connects restaurants, NGOs, and delivery agents to reduce food waste and feed communities.

## 📋 Overview

ShareBite is a full-stack web application designed to facilitate food donation and distribution. Restaurants can post surplus food donations, NGOs can request food for their communities, and delivery agents can manage the logistics with real-time tracking and food quality assessment.

## ✨ Features

- **Food Donation Management**: Restaurants can post food donations with details
- **NGO Requests**: NGOs can browse and request available food donations
- **Delivery Tracking**: Real-time tracking of food deliveries
- **Food Quality Assessment**: ML-powered food expiry prediction using image scanning
- **Role-Based Access Control**: Secure access for restaurants, NGOs, and delivery agents
- **Notifications**: Email/SMS notifications for key events
- **API Documentation**: Interactive API docs using Swagger/OpenAPI

## 🛠️ Tech Stack

### Backend
- **Django 5.2.6**: Web framework
- **Django REST Framework**: RESTful API
- **JWT Authentication**: Secure token-based authentication
- **PostgreSQL/SQLite**: Database (PostgreSQL for production, SQLite for development)
- **Django Channels**: WebSocket support for real-time features
- **drf-spectacular**: API documentation

### Frontend
- **React 19**: UI library
- **Vite**: Build tool and dev server
- **React Router**: Client-side routing
- **Bootstrap 5**: UI framework
- **Tailwind CSS**: Utility-first CSS
- **Axios**: HTTP client

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.10+** ([Download](https://www.python.org/downloads/))
- **Node.js 18+** and **npm** ([Download](https://nodejs.org/))
- **PostgreSQL** (optional, for production use)
- **Git** ([Download](https://git-scm.com/))

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ShareBite
```

### 2. Backend Setup

#### Create and Activate Virtual Environment

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

#### Install Python Dependencies

```bash
pip install -r requirements.txt
```

If `requirements.txt` doesn't exist, install the dependencies manually:

```bash
pip install django==5.2.6
pip install djangorestframework
pip install djangorestframework-simplejwt
pip install django-cors-headers
pip install channels
pip install drf-spectacular
pip install psycopg2-binary
pip install pillow
pip install numpy
pip install onnxruntime
```

#### Run Database Migrations

```bash
python manage.py migrate
```

#### Create Superuser (Optional)

You can create a superuser using the provided script:

```bash
python scripts/create_superuser.py
```

Or manually:

```bash
python manage.py createsuperuser
```

Default credentials (if using script):
- Username: `admin`
- Email: `admin@example.com`
- Password: `Admin!234`

### 3. Frontend Setup

#### Navigate to Frontend Directory

```bash
cd frontend
```

#### Install Dependencies

```bash
npm install
```

## 🏃 Running the Application

### Start Backend Server

From the project root directory (with virtual environment activated):

```bash
python manage.py runserver
```

The backend API will be available at: `http://localhost:8000`

**API Endpoints:**
- API Root: `http://localhost:8000/api/`
- Admin Panel: `http://localhost:8000/admin/`
- API Documentation: `http://localhost:8000/api/docs/`
- API Schema: `http://localhost:8000/api/schema/`

### Start Frontend Development Server

Open a new terminal, navigate to the frontend directory:

```bash
cd frontend
npm run dev
```

The frontend will be available at: `http://localhost:5173` (default Vite port)

### Access the Application

- **Frontend**: Open your browser and navigate to `http://localhost:5173`
- **Backend API**: `http://localhost:8000/api/`
- **Admin Panel**: `http://localhost:8000/admin/`

## 📁 Project Structure

```
ShareBite/
├── accounts/              # User authentication and profiles
├── donations/             # Food donation management
├── deliveries/            # Delivery tracking and management
├── notifications/         # Notification system
├── frontend/              # React frontend application
│   ├── src/              # Source files
│   ├── public/           # Static assets
│   └── package.json      # Frontend dependencies
├── sharebite/             # Django project settings
│   ├── settings.py       # Project configuration
│   ├── urls.py           # URL routing
│   └── wsgi.py           # WSGI configuration
├── scripts/               # Utility scripts
│   └── create_superuser.py
├── manage.py              # Django management script
└── db.sqlite3             # SQLite database (development)
```

## 🔐 Authentication

The API uses JWT (JSON Web Token) authentication. To authenticate:

1. **Obtain Token**: POST to `http://localhost:8000/api/token/`
   ```json
   {
     "username": "your_username",
     "password": "your_password"
   }
   ```

2. **Use Token**: Include the token in the Authorization header:
   ```
   Authorization: Bearer <your_access_token>
   ```

3. **Refresh Token**: POST to `http://localhost:8000/api/token/refresh/`
   ```json
   {
     "refresh": "your_refresh_token"
   }
   ```

## 🗄️ Database Configuration

By default, the project uses SQLite for development. To use PostgreSQL:

1. Set environment variable:
   ```bash
   set DB_ENGINE=postgres  # Windows
   export DB_ENGINE=postgres  # macOS/Linux
   ```

2. Update database credentials in `sharebite/settings.py` if needed.

3. Create the database:
   ```sql
   CREATE DATABASE sharebite;
   CREATE USER sharebite_user WITH PASSWORD 'Kriti143';
   GRANT ALL PRIVILEGES ON DATABASE sharebite TO sharebite_user;
   ```

4. Run migrations:
   ```bash
   python manage.py migrate
   ```

## 🧪 Development

### Running Tests

```bash
python manage.py test
```

### Creating Migrations

After modifying models:

```bash
python manage.py makemigrations
python manage.py migrate
```

### Building Frontend for Production

```bash
cd frontend
npm run build
```

## 📚 API Documentation

Interactive API documentation is available at:
- Swagger UI: `http://localhost:8000/api/docs/`
- OpenAPI Schema: `http://localhost:8000/api/schema/`

## 👥 User Roles

- **Restaurant**: Can post food donations and manage their listings
- **NGO**: Can browse and request food donations
- **Delivery Agent**: Can manage deliveries and scan food quality
- **Admin**: Full system access

## 🔧 Environment Variables (Optional)

You can customize the superuser creation by setting:

- `SB_ADMIN_USERNAME`: Admin username (default: `admin`)
- `SB_ADMIN_EMAIL`: Admin email (default: `admin@example.com`)
- `SB_ADMIN_PASSWORD`: Admin password (default: `Admin!234`)
- `DB_ENGINE`: Database engine (`sqlite` or `postgres`)

## 📝 Notes

- The project uses SQLite by default for easy development setup
- CORS is enabled for all origins in development (configure appropriately for production)
- Debug mode is enabled by default (disable for production)
- Make sure to update the `SECRET_KEY` in `settings.py` for production use

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


## 🚀 Deployment to Render

### Frontend Deployment

To deploy the frontend on Render:

1. **Push your code to a Git repository** (GitHub, GitLab, or Bitbucket)

2. **Connect to Render**:
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Static Site"
   - Connect your repository

3. **Configure the Static Site**:
   - **Name**: `sharebite-frontend` (or your preferred name)
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: Leave empty (root of repository)
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`
   - **Environment Variable**: 
     - Key: `VITE_API_BASE`
     - Value: `https://your-backend-url.onrender.com` (replace with your actual backend URL)

4. **Deploy**: Click "Create Static Site"

   **OR** if using `render.yaml`:
   - Render will automatically detect the `render.yaml` file
   - Update the `VITE_API_BASE` value in `render.yaml` with your backend URL
   - Render will use the configuration from the file

5. **After deployment**: Your frontend will be available at `https://your-frontend-name.onrender.com`

### Backend Deployment (Optional)

If you also want to deploy the backend on Render:

1. Create a new **Web Service** on Render
2. Connect your repository
3. Configure:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn sharebite.wsgi:application`
   - **Environment Variables**:
     - `DJANGO_SETTINGS_MODULE=sharebite.settings`
     - `SECRET_KEY` (generate a new secret key for production)
     - `DEBUG=False`
     - `ALLOWED_HOSTS=your-backend-url.onrender.com`
     - `DB_ENGINE=postgres` (if using PostgreSQL)
     - Database connection string (Render provides PostgreSQL automatically)
4. Update your frontend's `VITE_API_BASE` to point to the deployed backend

### Important Notes for Deployment

- **Environment Variables**: Make sure to set `VITE_API_BASE` in Render's environment variables section (not just in the code)
- **CORS**: Update `CORS_ALLOWED_ORIGINS` in `settings.py` to include your frontend URL
- **Database**: Use PostgreSQL in production (Render provides free PostgreSQL databases)
- **Static Files**: Configure Django to serve static files properly (use WhiteNoise or similar)
- **Secret Key**: Never commit the production `SECRET_KEY` to version control

## 👤 Author

Kriti Singh

---

**Happy Coding! 🚀**

