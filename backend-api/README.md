# Auirphila Bakery API

Backend API server for Auirphila Bakery website. This API handles order processing, email confirmations, and user signups.

## Features

- Order saving to Supabase database
- Order confirmation emails via Nodemailer
- User signup with welcome emails
- JWT authentication with Supabase

## API Endpoints

- `GET /health` - Health check endpoint
- `POST /save-order` - Save order to database (requires JWT auth)
- `POST /confirm-order` - Send order confirmation email
- `POST /signup` - Handle user signup and send welcome email

## Environment Variables

Create a `.env` file with the following variables:

```
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
EMAIL_FROM=your_email@gmail.com
SMTP_PASS=your_app_password

# Server Configuration
PORT=3000

# CORS Configuration
FRONTEND_URL=your_frontend_url
```

## Deployment

### Railway

1. Create a new project in Railway
2. Connect your GitHub repository
3. Set the required environment variables
4. Set the start command to `node server.js`

### Render

1. Create a new Web Service in Render
2. Connect your GitHub repository
3. Set the build command to `npm install`
4. Set the start command to `node server.js`
5. Add the environment variables

## Local Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run in production mode
npm start
```
