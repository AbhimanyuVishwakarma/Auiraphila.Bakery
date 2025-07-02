// API Client for making requests to the backend
class ApiClient {
  constructor() {
    // Load configuration
    this.config = window.apiConfig || {
      API_URL: '',
      endpoints: {
        saveOrder: '/api/save-order',
        confirmOrder: '/api/confirm-order',
        signup: '/api/signup',
        health: '/api/health'
      }
    };
  }

  // Get the full URL for an endpoint
  getUrl(endpoint) {
    const baseUrl = this.config.API_URL || '';
    const path = this.config.endpoints[endpoint] || '';
    return `${baseUrl}${path}`;
  }

  // Save order to database
  async saveOrder(orderData, token) {
    try {
      const response = await fetch(this.getUrl('saveOrder'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error saving order:', error);
      throw error;
    }
  }

  // Send order confirmation email
  async confirmOrder(orderData) {
    try {
      const response = await fetch(this.getUrl('confirmOrder'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error confirming order:', error);
      throw error;
    }
  }

  // Sign up a new user
  async signup(userData) {
    try {
      const response = await fetch(this.getUrl('signup'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  }

  // Check API health
  async checkHealth() {
    try {
      const response = await fetch(this.getUrl('health'));
      return await response.json();
    } catch (error) {
      console.error('API health check failed:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const apiClient = new ApiClient();

// For browser usage
if (typeof window !== 'undefined') {
  window.apiClient = apiClient;
}

// For module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = apiClient;
}
