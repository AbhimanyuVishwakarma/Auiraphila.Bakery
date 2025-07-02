// Configuration for frontend API endpoints
const config = {
  // Change this to your deployed backend URL when deployed
  API_URL: process.env.API_URL || 'http://localhost:3000',
  
  // API endpoints
  endpoints: {
    saveOrder: '/api/save-order',
    confirmOrder: '/api/confirm-order',
    signup: '/api/signup',
    health: '/api/health'
  },
  
  // Get full URL for an endpoint
  getApiUrl: function(endpoint) {
    return this.API_URL + this.endpoints[endpoint];
  }
};

// Export the configuration
if (typeof module !== 'undefined' && module.exports) {
  module.exports = config;
} else {
  // For browser usage
  window.apiConfig = config;
}
