# Auirphila Bakery Frontend

Frontend website for Auirphila Bakery. This is a static website that connects to a separate backend API.

## Features

- Responsive design for all devices
- Product catalog with categories
- Shopping cart functionality
- User authentication with Supabase
- Order placement and checkout
- Order confirmation emails

## Deployment

### Vercel

1. Create a new project in Vercel
2. Connect your GitHub repository
3. Set the following environment variables:
   - `API_URL`: URL of your backend API (e.g., https://auirphila-bakery-api.railway.app)
4. Set the build command to `npm install` (or leave blank for auto-detection)
5. Set the output directory to `.` (root directory)

### Netlify

1. Create a new site in Netlify
2. Connect your GitHub repository
3. Set the following environment variables:
   - `API_URL`: URL of your backend API (e.g., https://auirphila-bakery-api.railway.app)
4. Set the build command to `npm install` (or leave blank for auto-detection)
5. Set the publish directory to `.` (root directory)

## Local Development

To run the frontend locally:

1. Make sure you have a local backend server running
2. Open `frontend-config.js` and set the `API_URL` to your local backend URL (e.g., http://localhost:3000)
3. Open the `index.html` file in your browser or use a local server like Live Server in VS Code

## Connecting to Backend

The frontend connects to the backend API using the configuration in `frontend-config.js`. When deploying, make sure to set the `API_URL` environment variable to the URL of your deployed backend API.
