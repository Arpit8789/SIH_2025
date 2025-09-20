// backend/services/agmarknetService.js - ES MODULE VERSION
import axios from 'axios';
import { chromium } from 'playwright-chromium';

class AgmarknetService {
  constructor() {
    this.baseUrl = 'https://agmarknet.gov.in';
    this.dataGovUrl = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';
    this.apiKey = '579b464db66ec23bdd000001cdd3946e44ce4a7209ff7b23ac571b';
    this.browser = null;
  }

  /* -------------------- Browser Setup -------------------- */
  async initBrowser() {
    if (!this.browser) {
      this.browser = await chromium.launch({ headless: true });
    }
    return this.browser;
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /* -------------------- Fetch REAL Prices -------------------- */
  async fetchRealPrices(commodity, state, market = '') {
    console.log('🕷️ Fetching REAL prices from agmarknet...');

    try {
      // 1️⃣ Browser Scraping
      const browserData = await this.scrapeLiveData(commodity, state, market);
      if (browserData && browserData.modalPrice > 0) {
        console.log('✅ Got real data from agmarknet scraping');
        return browserData;
      }

      // 2️⃣ DATA.GOV.IN API
      const govData = await this.fetchFromDataGovAPI(commodity, state);
      if (govData && govData.modalPrice > 0) {
        console.log('✅ Got real data from data.gov.in API');
        return govData;
      }

      // 3️⃣ Alternative API
      const altData = await this.tryAlternativeEndpoints(commodity, state, market);
      if (altData && altData.modalPrice > 0) {
        console.log('✅ Got real data from alternative source');
        return altData;
      }

      throw new Error('No real data available from any source');
    } catch (error) {
      console.error('❌ All real data sources failed:', error.message);
      throw error;
    }
  }

  /* -------------------- Browser Scraping -------------------- */
  async scrapeLiveData(commodity, state, market) {
    let page = null;
    try {
      const browser = await this.initBrowser();
      page = await browser.newPage();

      await page.setExtraHTTPHeaders({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      });

      await page.goto(`${this.baseUrl}/SearchCmmMkt.aspx`, {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      // Fill dropdowns
      await page.selectOption('#ddlCommodity', commodity.toLowerCase());
      await page.selectOption('#ddlState', state.toLowerCase());
      if (market) await page.selectOption('#ddlMarket', market.toLowerCase());

      await page.click('#btnGo');
      await page.waitForSelector('.gridview', { timeout: 15000 });

      // Extract table data
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
                modalPrice,
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
          commodity,
          state,
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
      console.error('❌ Browser scraping failed:', error.message);
      return null;
    } finally {
      if (page) await page.close();
    }
  }

  /* -------------------- DATA.GOV.IN API -------------------- */
  async fetchFromDataGovAPI(commodity, state) {
    try {
      console.log('📡 Fetching from DATA.GOV.IN API...');

      const params = {
        'api-key': this.apiKey,
        format: 'json',
        limit: '5',
        offset: '0',
        'filters[commodity]': commodity,
        'filters[state]': state
      };

      const response = await axios.get(this.dataGovUrl, { params, timeout: 15000 });

      if (response.data.records?.length > 0) {
        const record = response.data.records[0];
        const modalPrice = parseInt(record.modal_price) || parseInt(record.price) || 0;

        if (modalPrice > 0) {
          return {
            commodity,
            state,
            market: record.market || record.district || 'Market',
            date: record.arrival_date || new Date().toISOString().split('T')[0],
            minPrice: parseInt(record.min_price) || Math.round(modalPrice * 0.9),
            maxPrice: parseInt(record.max_price) || Math.round(modalPrice * 1.1),
            modalPrice,
            priceUnit: 'quintal',
            source: 'data.gov.in_api',
            lastUpdated: new Date().toISOString()
          };
        }
      }

      return null;
    } catch (error) {
      console.error('❌ DATA.GOV.IN API failed:', error.message);
      return null;
    }
  }

  /* -------------------- Alternative Endpoints -------------------- */
  async tryAlternativeEndpoints(commodity, state, market) {
    try {
      const url = `${this.baseUrl}/api/mobile/commodity/${commodity}/${state}`;
      const response = await axios.get(url, { timeout: 10000 });

      if (response.data?.data?.length > 0) {
        const data = response.data.data[0];
        return {
          commodity,
          state,
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
      console.error('❌ Alternative endpoints failed:', error.message);
      return null;
    }
  }

  /* -------------------- Historical Data -------------------- */
  async fetchRealHistoricalData(commodity, state, days = 30) {
    try {
      console.log('📊 Fetching REAL historical data...');

      const params = {
        'api-key': this.apiKey,
        format: 'json',
        limit: days.toString(),
        offset: '0',
        'filters[commodity]': commodity,
        'filters[state]': state
      };

      const response = await axios.get(this.dataGovUrl, { params, timeout: 20000 });

      if (response.data.records?.length > 0) {
        return response.data.records
          .map(r => ({
            date: r.arrival_date || r.date,
            modalPrice: parseInt(r.modal_price) || parseInt(r.price) || 0,
            minPrice: parseInt(r.min_price) || 0,
            maxPrice: parseInt(r.max_price) || 0,
            volume: parseInt(r.quantity) || 0,
            market: r.market || r.district
          }))
          .filter(item => item.modalPrice > 0);
      }

      throw new Error('No historical records found');
    } catch (error) {
      console.error('❌ Real historical data fetch failed:', error.message);
      throw error;
    }
  }
}

export default new AgmarknetService();
