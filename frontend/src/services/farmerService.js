// src/services/farmerService.js - CREATE THIS FILE
class FarmerService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  }

  // Helper method for API calls
  async apiCall(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    console.log(`🔗 FarmerService API Call: ${options.method || 'GET'} ${url}`)
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    }

    // Add authorization token if available
    const token = localStorage.getItem('krishi_access_token')
    if (token) {
      defaultOptions.headers['Authorization'] = `Bearer ${token}`
    }

    const finalOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    }

    try {
      const response = await fetch(url, finalOptions)
      const data = await response.json()
      
      console.log(`✅ FarmerService API Response [${response.status}]:`, data)
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`)
      }
      
      return data
    } catch (error) {
      console.error(`❌ FarmerService API Error for ${endpoint}:`, error)
      
      // Return mock data if API fails (for development)
      if (endpoint === '/farmer/dashboard') {
        return this.getMockDashboardData()
      }
      
      throw error
    }
  }

  // ✅ REAL BACKEND: Get farmer dashboard data
  async getDashboardOverview() {
    try {
      console.log('📊 FarmerService: Loading dashboard overview...')
      
      const response = await this.apiCall('/farmer/dashboard', {
        method: 'GET'
      })

      console.log('📊 FarmerService: Dashboard data loaded =', response)
      
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('📊 FarmerService: Failed to load dashboard data, using mock data')
      
      // Return mock data if backend fails
      return this.getMockDashboardData()
    }
  }

  // ✅ MOCK DATA for development (remove this when backend is ready)
  getMockDashboardData() {
    return {
      success: true,
      data: {
        overview: {
          location: 'Punjab, India',
          stats: {
            activeCrops: 3,
            totalArea: 25.5,
            expectedYield: 120,
            yieldImprovement: 15,
            estimatedValue: 450000,
          },
          weather: {
            humidity: 65,
            windSpeed: 12
          },
          primaryCrop: {
            id: 'wheat-001',
            name: 'Wheat'
          }
        },
        weatherAlerts: [
          {
            id: 1,
            severity: 'medium',
            message: 'Light rain expected in next 2 days. Good for crops.'
          }
        ],
        marketInsights: [
          {
            cropName: 'Wheat',
            currentPrice: 25000,
            trend: 'rising',
            changePercent: 8,
            recommendation: 'Good time to sell wheat. Prices are trending upward.'
          },
          {
            cropName: 'Rice',
            currentPrice: 30000,
            trend: 'stable',
            changePercent: 2,
            recommendation: 'Rice prices are stable. Consider holding for better rates.'
          }
        ],
        todayTasks: [
          {
            id: 1,
            title: 'Water wheat field',
            description: 'Morning irrigation for sector A',
            priority: 'High'
          },
          {
            id: 2,
            title: 'Check pest traps',
            description: 'Inspect yellow sticky traps in rice field',
            priority: 'Medium'
          }
        ],
        cropHealth: [
          {
            name: 'Wheat',
            healthScore: 85,
            status: 'Healthy growth, no issues detected'
          },
          {
            name: 'Rice',
            healthScore: 72,
            status: 'Minor pest activity detected'
          },
          {
            name: 'Corn',
            healthScore: 90,
            status: 'Excellent condition'
          }
        ]
      }
    }
  }

  // ✅ REAL BACKEND: Get crop data
  async getCropData(cropId) {
    try {
      const response = await this.apiCall(`/farmer/crops/${cropId}`, {
        method: 'GET'
      })
      
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Failed to load crop data:', error)
      return {
        success: false,
        message: 'Failed to load crop data'
      }
    }
  }

  // ✅ REAL BACKEND: Update crop data
  async updateCropData(cropId, updates) {
    try {
      const response = await this.apiCall(`/farmer/crops/${cropId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      })
      
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Failed to update crop data:', error)
      return {
        success: false,
        message: 'Failed to update crop data'
      }
    }
  }

  // ✅ REAL BACKEND: Get weather alerts
  async getWeatherAlerts() {
    try {
      const response = await this.apiCall('/farmer/weather-alerts', {
        method: 'GET'
      })
      
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Failed to load weather alerts:', error)
      return {
        success: false,
        message: 'Failed to load weather alerts'
      }
    }
  }

  // ✅ REAL BACKEND: Get market insights
  async getMarketInsights() {
    try {
      const response = await this.apiCall('/farmer/market-insights', {
        method: 'GET'
      })
      
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Failed to load market insights:', error)
      return {
        success: false,
        message: 'Failed to load market insights'
      }
    }
  }
}

export const farmerService = new FarmerService()
