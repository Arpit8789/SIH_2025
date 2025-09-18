// src/lib/supabase.js - COMPLETE
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'krishi-sahayak@1.0.0'
    }
  }
})

// Authentication helpers
export const auth = {
  // Sign up new user
  async signUp(email, password, userData = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          ...userData,
          app_name: 'krishi-sahayak'
        }
      }
    })
    return { data, error }
  },

  // Sign in user
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  // Sign out user
  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  // Reset password
  async resetPassword(email) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })
    return { data, error }
  },

  // Update password
  async updatePassword(password) {
    const { data, error } = await supabase.auth.updateUser({
      password
    })
    return { data, error }
  }
}

// Database helpers for agricultural data
export const db = {
  // Farmers
  farmers: {
    async create(farmer) {
      const { data, error } = await supabase
        .from('farmers')
        .insert([farmer])
        .select()
      return { data: data?.[0], error }
    },

    async getById(id) {
      const { data, error } = await supabase
        .from('farmers')
        .select('*')
        .eq('id', id)
        .single()
      return { data, error }
    },

    async update(id, updates) {
      const { data, error } = await supabase
        .from('farmers')
        .update(updates)
        .eq('id', id)
        .select()
      return { data: data?.[0], error }
    }
  },

  // Crops
  crops: {
    async getAll() {
      const { data, error } = await supabase
        .from('crops')
        .select('*')
        .order('name')
      return { data, error }
    },

    async getByCategory(category) {
      const { data, error } = await supabase
        .from('crops')
        .select('*')
        .eq('category', category)
        .order('name')
      return { data, error }
    },

    async getBySeason(season) {
      const { data, error } = await supabase
        .from('crops')
        .select('*')
        .contains('seasons', [season])
        .order('name')
      return { data, error }
    }
  },

  // Market prices
  prices: {
    async getLatest(crop = null, market = null) {
      let query = supabase
        .from('market_prices')
        .select(`
          *,
          crops(name, category),
          markets(name, district, state)
        `)
        .order('date', { ascending: false })

      if (crop) query = query.eq('crop_id', crop)
      if (market) query = query.eq('market_id', market)

      const { data, error } = await query.limit(50)
      return { data, error }
    },

    async getTrends(cropId, marketId, days = 30) {
      const { data, error } = await supabase
        .from('market_prices')
        .select('date, min_price, max_price, avg_price')
        .eq('crop_id', cropId)
        .eq('market_id', marketId)
        .gte('date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .order('date')
      return { data, error }
    }
  },

  // Weather data
  weather: {
    async getByLocation(latitude, longitude) {
      const { data, error } = await supabase
        .from('weather_data')
        .select('*')
        .eq('latitude', latitude)
        .eq('longitude', longitude)
        .order('timestamp', { ascending: false })
        .limit(1)
      return { data: data?.[0], error }
    },

    async getAlerts(location) {
      const { data, error } = await supabase
        .from('weather_alerts')
        .select('*')
        .eq('location', location)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      return { data, error }
    }
  }
}

// Real-time subscriptions
export const realtime = {
  // Subscribe to price changes
  subscribeToPriceChanges(callback) {
    return supabase
      .channel('price-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'market_prices' 
        }, 
        callback
      )
      .subscribe()
  },

  // Subscribe to weather alerts
  subscribeToWeatherAlerts(location, callback) {
    return supabase
      .channel('weather-alerts')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'weather_alerts',
          filter: `location=eq.${location}`
        }, 
        callback
      )
      .subscribe()
  },

  // Unsubscribe
  unsubscribe(subscription) {
    return supabase.removeChannel(subscription)
  }
}

export default supabase
