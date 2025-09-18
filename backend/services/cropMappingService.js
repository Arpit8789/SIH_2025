// services/cropMappingService.js
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CropMappingService {
  constructor() {
    this.cropDatabase = null;
    this.lastUpdated = null;
  }

  /**
   * Load crop database from JSON file
   */
  async loadCropDatabase() {
    try {
      if (!this.cropDatabase || this.shouldRefreshCache()) {
        const cropDataPath = path.join(__dirname, '../data/stateWiseCrops.json');
        const cropData = await fs.readFile(cropDataPath, 'utf-8');
        this.cropDatabase = JSON.parse(cropData);
        this.lastUpdated = new Date();
        console.log('✅ Crop database loaded successfully');
      }
      return this.cropDatabase;
    } catch (error) {
      console.error('❌ Failed to load crop database:', error);
      return {};
    }
  }

  /**
   * Check if cache should be refreshed (every 24 hours)
   */
  shouldRefreshCache() {
    if (!this.lastUpdated) return true;
    const now = new Date();
    const diffHours = (now - this.lastUpdated) / (1000 * 60 * 60);
    return diffHours > 24;
  }

  /**
   * Get crops for a specific state and season
   */
  async getCropsForStateAndSeason(state, season = null) {
    const crops = await this.loadCropDatabase();
    const stateKey = this.normalizeStateName(state);
    
    if (!crops[stateKey]) {
      console.warn(`⚠️ State not found in database: ${state} (${stateKey})`);
      return [];
    }

    const currentSeason = season || this.getCurrentSeason();
    const seasonData = crops[stateKey][currentSeason];
    
    if (!seasonData || !seasonData.crops) {
      console.warn(`⚠️ No crops found for ${state} in ${currentSeason} season`);
      return [];
    }

    return seasonData.crops.map(crop => ({
      ...crop,
      season: currentSeason,
      state: state,
      stateInfo: {
        code: crops[stateKey].state_code,
        climate: crops[stateKey].climate_zone,
        languages: crops[stateKey].main_languages
      }
    }));
  }

  /**
   * Get major crops for a state (top 3 by area percentage)
   */
  async getMajorCrops(state, season = null) {
    const allCrops = await this.getCropsForStateAndSeason(state, season);
    return allCrops
      .sort((a, b) => (b.area_percentage || 0) - (a.area_percentage || 0))
      .slice(0, 3);
  }

  /**
   * Find crop by name in a state
   */
  async findCropInState(state, cropName, season = null) {
    const crops = await this.getCropsForStateAndSeason(state, season);
    const searchName = cropName.toLowerCase().trim();
    
    return crops.find(crop => 
      crop.name.toLowerCase() === searchName ||
      crop.local_name?.toLowerCase() === searchName ||
      crop.hindi_name?.toLowerCase() === searchName ||
      crop.varieties?.some(variety => variety.toLowerCase().includes(searchName))
    );
  }

  /**
   * Get crop recommendations based on farmer's actual crops
   */
  async getRecommendedCrops(state, actualCrops = [], season = null) {
    const stateCrops = await this.getCropsForStateAndSeason(state, season);
    
    if (!actualCrops || actualCrops.length === 0) {
      // Return top 3 major crops if no actual crops specified
      return this.getMajorCrops(state, season);
    }

    // Find matching crops from database
    const matchedCrops = [];
    
    for (const actualCrop of actualCrops) {
      const foundCrop = await this.findCropInState(state, actualCrop, season);
      if (foundCrop) {
        matchedCrops.push(foundCrop);
      }
    }

    // If no matches found, return major crops
    if (matchedCrops.length === 0) {
      console.warn(`⚠️ No matching crops found for: ${actualCrops.join(', ')} in ${state}`);
      return this.getMajorCrops(state, season);
    }

    return matchedCrops;
  }

  /**
   * Get seasonal crop calendar for a state
   */
  async getSeasonalCalendar(state) {
    const crops = await this.loadCropDatabase();
    const stateKey = this.normalizeStateName(state);
    
    if (!crops[stateKey]) {
      return null;
    }

    const stateData = crops[stateKey];
    const calendar = {};

    // Process each season
    for (const season of ['kharif', 'rabi', 'zaid']) {
      if (stateData[season]) {
        calendar[season] = {
          months: stateData[season].season_months || [],
          crops: stateData[season].crops || [],
          totalCrops: stateData[season].crops?.length || 0,
          majorCrop: stateData[season].crops?.[0]?.name || null
        };
      }
    }

    return {
      state: state,
      stateCode: stateData.state_code,
      climate: stateData.climate_zone,
      languages: stateData.main_languages,
      seasons: calendar
    };
  }

  /**
   * Get crop growth information
   */
  async getCropGrowthInfo(state, cropName, season = null) {
    const crop = await this.findCropInState(state, cropName, season);
    
    if (!crop) {
      return null;
    }

    return {
      name: crop.name,
      localName: crop.local_name,
      hindiName: crop.hindi_name,
      varieties: crop.varieties || [],
      growthStages: crop.growth_stages || [],
      criticalPeriods: crop.critical_periods || [],
      waterRequirement: crop.water_requirement,
      pestDiseases: crop.pest_diseases || [],
      areaPercentage: crop.area_percentage,
      season: season || this.getCurrentSeason(),
      recommendations: this.generateCropRecommendations(crop)
    };
  }

  /**
   * Generate basic crop recommendations
   */
  generateCropRecommendations(crop) {
    const recommendations = [];

    // Water management
    if (crop.water_requirement === 'high' || crop.water_requirement === 'very_high') {
      recommendations.push('Ensure adequate irrigation during critical growth periods');
    } else if (crop.water_requirement === 'low') {
      recommendations.push('Avoid overwatering; this crop is drought tolerant');
    }

    // Growth stage monitoring
    if (crop.critical_periods && crop.critical_periods.length > 0) {
      recommendations.push(`Pay special attention during ${crop.critical_periods.join(' and ')} stages`);
    }

    // Pest management
    if (crop.pest_diseases && crop.pest_diseases.length > 0) {
      recommendations.push(`Monitor for ${crop.pest_diseases.slice(0, 2).join(' and ')} regularly`);
    }

    return recommendations;
  }

  /**
   * Get weather-sensitive crops for alerts
   */
  async getWeatherSensitiveCrops(state, weatherCondition, season = null) {
    const crops = await this.getCropsForStateAndSeason(state, season);
    
    const sensitiveCrops = [];

    for (const crop of crops) {
      let isSensitive = false;
      
      // Rain sensitivity
      if (weatherCondition === 'heavy_rain') {
        if (crop.critical_periods?.includes('Flowering') || 
            crop.critical_periods?.includes('Pollination')) {
          isSensitive = true;
        }
      }
      
      // Heat sensitivity  
      if (weatherCondition === 'extreme_heat') {
        if (crop.water_requirement === 'high' || 
            crop.water_requirement === 'very_high') {
          isSensitive = true;
        }
      }
      
      // Wind sensitivity
      if (weatherCondition === 'strong_winds') {
        if (crop.name.toLowerCase().includes('sugarcane') ||
            crop.name.toLowerCase().includes('banana') ||
            crop.name.toLowerCase().includes('maize')) {
          isSensitive = true;
        }
      }

      if (isSensitive) {
        sensitiveCrops.push({
          ...crop,
          sensitivityReason: this.getSensitivityReason(crop, weatherCondition)
        });
      }
    }

    return sensitiveCrops;
  }

  /**
   * Get reason for weather sensitivity
   */
  getSensitivityReason(crop, weatherCondition) {
    const reasons = {
      heavy_rain: `${crop.name} is sensitive to heavy rain during critical growth periods`,
      extreme_heat: `${crop.name} requires high water and may suffer heat stress`,
      strong_winds: `${crop.name} is susceptible to lodging and physical damage from winds`,
      frost: `${crop.name} is frost-sensitive and may suffer cold damage`,
      hail: `${crop.name} foliage and fruits are vulnerable to hail damage`
    };

    return reasons[weatherCondition] || `${crop.name} may be affected by ${weatherCondition}`;
  }

  /**
   * Normalize state name for database lookup
   */
  normalizeStateName(state) {
    if (!state) return '';
    
    return state
      .trim()
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9_]/g, '')
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('_');
  }

  /**
   * Get current agricultural season based on month
   */
  getCurrentSeason() {
    const month = new Date().getMonth() + 1; // 1-12
    
    if (month >= 6 && month <= 11) return 'kharif';   // Jun-Nov
    if (month >= 12 || month <= 3) return 'rabi';     // Dec-Mar  
    return 'zaid';                                     // Apr-May
  }

  /**
   * Get all available states
   */
  async getAvailableStates() {
    const crops = await this.loadCropDatabase();
    
    return Object.keys(crops).map(stateKey => {
      const stateData = crops[stateKey];
      return {
        name: stateKey.replace(/_/g, ' '),
        code: stateData.state_code,
        climate: stateData.climate_zone,
        languages: stateData.main_languages,
        totalSeasons: Object.keys(stateData).filter(key => 
          ['kharif', 'rabi', 'zaid'].includes(key)
        ).length
      };
    });
  }

  /**
   * Search crops across all states
   */
  async searchCrops(searchTerm, limit = 10) {
    const crops = await this.loadCropDatabase();
    const results = [];
    const searchLower = searchTerm.toLowerCase().trim();

    for (const [stateKey, stateData] of Object.entries(crops)) {
      const stateName = stateKey.replace(/_/g, ' ');
      
      for (const season of ['kharif', 'rabi', 'zaid']) {
        if (stateData[season] && stateData[season].crops) {
          for (const crop of stateData[season].crops) {
            if (crop.name.toLowerCase().includes(searchLower) ||
                crop.local_name?.toLowerCase().includes(searchLower) ||
                crop.hindi_name?.toLowerCase().includes(searchLower)) {
              
              results.push({
                ...crop,
                state: stateName,
                season: season,
                matchType: crop.name.toLowerCase() === searchLower ? 'exact' : 'partial'
              });
            }
          }
        }
      }
    }

    // Sort by relevance (exact matches first, then by area percentage)
    return results
      .sort((a, b) => {
        if (a.matchType === 'exact' && b.matchType !== 'exact') return -1;
        if (b.matchType === 'exact' && a.matchType !== 'exact') return 1;
        return (b.area_percentage || 0) - (a.area_percentage || 0);
      })
      .slice(0, limit);
  }
}

export default new CropMappingService();
