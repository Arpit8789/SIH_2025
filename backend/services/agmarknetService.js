// backend/services/agmarknetService.js - ES MODULE VERSION
import axios from 'axios';
import { chromium } from 'playwright-chromium';
import realDataScraper from '../utils/realDataScraper.js'; // Note: .js extension

class AgmarknetService {
  constructor() {
    this.baseUrl = 'https://agmarknet.gov.in';
    this.dataGovUrl = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';
    this.apiKey = '579b464db66ec23bdd000001cdd3946e44ce4a7209ff7b23ac571b';
    this.browser = null;
  }

  async initBrowser() {
    if (!this.browser) {
      this.browser = await chromium.launch({ headless: true });
    }
    return this.browser;
  }

  async fetchRealPrices(commodity, state, market = '') {
    console.log('🕷️ Fetching REAL prices from agmarknet...');
    
    try {
      // METHOD 1: Direct agmarknet scraping with browser
      const browserData = await this.scrapeLiveData(commodity, state, market);
      if (browserData && browserData.modalPrice > 0) {
        console.log('✅ Got real data from agmarknet scraping');
        return browserData;
      }
      
      // METHOD 2: DATA.GOV.IN API (Real government data)
      const govData = await this.fetchFromDataGovAPI(commodity, state);
      if (govData && govData.modalPrice > 0) {
        console.log('✅ Got real data from data.gov.in API');
        return govData;
      }
      
      // METHOD 3: Alternative agmarknet endpoints
      const altData = await this.tryAlternativeEndpoints(commodity, state, market);
      if (altData && altData.modalPrice > 0) {
        console.log('✅ Got real data from alternative source');
        return altData;
      }
      
      throw new Error('No real data available from any source');
      
    } catch (error) {
      console.error('❌ All real data sources failed:', error);
      throw error;
    }
  }

  async scrapeLiveData(commodity, state, market) {
    let page = null;
    try {
      const browser = await this.initBrowser();
      page = await browser.newPage();
      
      // Set realistic headers
      await page.setExtraHTTPHeaders({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      });
      
      // Navigate to agmarknet search page
      await page.goto(`${this.baseUrl}/SearchCmmMkt.aspx`, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      // Fill search form
      await page.selectOption('#ddlCommodity', commodity.toLowerCase());
      await page.selectOption('#ddlState', state.toLowerCase());
      if (market) {
        await page.selectOption('#ddlMarket', market.toLowerCase());
      }
      
      // Submit search
      await page.click('#btnGo');
      await page.waitForSelector('.gridview', { timeout: 15000 });
      
      // Extract price data from results table
      const priceData = await page.evaluate(() => {
        const table = document.querySelector('.gridview');
        if (!table) return null;
        
        const rows = table.querySelectorAll('tr');
        for (let row of rows) {
          const cells = row.querySelectorAll('td');
          if (cells.length >= 6) {
            const minPrice = parseInt(cells[cells.length - 3]?.textContent?.replace(/[^\d]/g, ''));
            const maxPrice = parseInt(cells[cells.length - 2]?.textContent?.replace(/[^\d]/g, ''));
            const modalPrice = parseInt(cells[cells.length - 1]?.textContent?.replace(/[^\d]/g, ''));
            
            if (modalPrice && modalPrice > 100) {
              return {
                minPrice: minPrice || modalPrice * 0.9,
                maxPrice: maxPrice || modalPrice * 1.1,
                modalPrice: modalPrice,
                market: cells[1]?.textContent?.trim() || 'Market',
                date: cells[0]?.textContent?.trim() || new Date().toISOString().split('T')[0]
              };
            }
          }
        }
        return null;
      });
      
      if (priceData) {
        return {
          commodity: commodity,
          state: state,
          market: priceData.market,
          date: priceData.date,
          minPrice: Math.round(priceData.minPrice),
          maxPrice: Math.round(priceData.maxPrice),
          modalPrice: Math.round(priceData.modalPrice),
          priceUnit: 'quintal',
          source: 'agmarknet_scraped',
          lastUpdated: new Date().toISOString()
        };
      }
      
      return null;
      
    } catch (error) {
      console.error('❌ Browser scraping failed:', error);
      return null;
    } finally {
      if (page) await page.close();
    }
  }

  async fetchFromDataGovAPI(commodity, state) {
    try {
      console.log('📡 Fetching from DATA.GOV.IN API...');
      
      const params = {
        'api-key': this.apiKey,
        'format': 'json',
        'limit': '5',
        'offset': '0',
        'filters[commodity]': commodity,
        'filters[state]': state
      };
      
      const response = await axios.get(this.dataGovUrl, { 
        params, 
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Krishi-Sahayak/1.0)',
          'Accept': 'application/json'
        }
      });
      
      if (response.data.records && response.data.records.length > 0) {
        const record = response.data.records[0];
        
        const modalPrice = parseInt(record.modal_price) || parseInt(record.price) || 0;
        const minPrice = parseInt(record.min_price) || Math.round(modalPrice * 0.9);
        const maxPrice = parseInt(record.max_price) || Math.round(modalPrice * 1.1);
        
        if (modalPrice > 0) {
          return {
            commodity: commodity,
            state: state,
            market: record.market || record.district || 'Market',
            date: record.arrival_date || new Date().toISOString().split('T')[0],
            minPrice: minPrice,
            maxPrice: maxPrice,
            modalPrice: modalPrice,
            priceUnit: 'quintal',
            source: 'data.gov.in_api',
            lastUpdated: new Date().toISOString()
          };
        }
      }
      
      return null;
      
    } catch (error) {
      console.error('❌ DATA.GOV.IN API failed:', error);
      return null;
    }
  }

  async tryAlternativeEndpoints(commodity, state, market) {
    try {
      // Try agmarknet mobile API or alternative endpoints
      const mobileEndpoint = `${this.baseUrl}/api/mobile/commodity/${commodity}/${state}`;
      
      const response = await axios.get(mobileEndpoint, {
        timeout: 10000,
        headers: {
          'User-Agent': 'AgmarknetMobile/1.0',
          'Accept': 'application/json'
        }
      });
      
      if (response.data && response.data.data) {
        const data = response.data.data[0];
        
        return {
          commodity: commodity,
          state: state,
          market: data.market || market || 'Market',
          date: data.date || new Date().toISOString().split('T')[0],
          minPrice: parseInt(data.min_price) || 0,
          maxPrice: parseInt(data.max_price) || 0,
          modalPrice: parseInt(data.modal_price) || 0,
          priceUnit: 'quintal',
          source: 'agmarknet_mobile_api',
          lastUpdated: new Date().toISOString()
        };
      }
      
      return null;
      
    } catch (error) {
      console.error('❌ Alternative endpoints failed:', error);
      return null;
    }
  }

  async fetchRealHistoricalData(commodity, state, days) {
    try {
      console.log('📊 Fetching REAL historical data...');
      
      // Use DATA.GOV.IN for historical records
      const params = {
        'api-key': this.apiKey,
        'format': 'json',
        'limit': days.toString(),
        'offset': '0',
        'filters[commodity]': commodity,
        'filters[state]': state
      };
      
      const response = await axios.get(this.dataGovUrl, { 
        params, 
        timeout: 20000 
      });
      
      if (response.data.records && response.data.records.length > 0) {
        return response.data.records.map(record => ({
          date: record.arrival_date || record.date,
          modalPrice: parseInt(record.modal_price) || parseInt(record.price) || 0,
          minPrice: parseInt(record.min_price) || 0,
          maxPrice: parseInt(record.max_price) || 0,
          volume: parseInt(record.quantity) || 0,
          market: record.market || record.district
        })).filter(item => item.modalPrice > 0);
      }
      
      throw new Error('No historical records found');
      
    } catch (error) {
      console.error('❌ Real historical data fetch failed:', error);
      throw error;
    }
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

export default new AgmarknetService(); // ⭐ CHANGED: ES Module export
