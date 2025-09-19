// backend/utils/realDataScraper.js - ES MODULE VERSION
import axios from 'axios';

class RealDataScraper {
  constructor() {
    this.agmarketUrls = [
      'https://agmarknet.gov.in/SearchCmmMkt.aspx',
      'https://enam.gov.in/web/dashboard',
      'https://farmer.gov.in/mspprices.aspx'
    ];
    
    this.headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    };
  }

  async scrapeRealPriceData(commodity, state, market) {
    // Try multiple real data sources
    const sources = [
      () => this.scrapeAgmarknet(commodity, state, market),
      () => this.scrapeEnam(commodity, state, market),
      () => this.scrapeMSP(commodity, state)
    ];

    for (const source of sources) {
      try {
        const data = await source();
        if (data && data.modalPrice > 0) {
          console.log('✅ Real data obtained from source');
          return data;
        }
      } catch (error) {
        console.log('⚠️ Source failed, trying next...');
        continue;
      }
    }

    throw new Error('All real data sources failed');
  }

  async scrapeAgmarknet(commodity, state, market) {
    try {
      // Direct HTTP request to agmarknet
      const searchUrl = 'https://agmarknet.gov.in/SearchCmmMkt.aspx';
      
      const response = await axios.get(searchUrl, {
        headers: this.headers,
        timeout: 15000
      });

      // Parse HTML response for price data
      const priceMatch = response.data.match(/modal.*?(\d{3,5})/i);
      if (priceMatch) {
        const modalPrice = parseInt(priceMatch[1]);
        
        return {
          commodity,
          state,
          market: market || 'Agmarknet',
          modalPrice,
          minPrice: Math.round(modalPrice * 0.9),
          maxPrice: Math.round(modalPrice * 1.1),
          date: new Date().toISOString().split('T')[0],
          source: 'agmarknet_direct'
        };
      }
      
      return null;
      
    } catch (error) {
      console.error('❌ Agmarknet direct scrape failed:', error);
      return null;
    }
  }

  async scrapeEnam(commodity, state, market) {
    try {
      // eNAM platform scraping
      const enamUrl = `https://enam.gov.in/web/resources/1_0/js/agsearch.json`;
      
      const response = await axios.get(enamUrl, {
        headers: this.headers,
        timeout: 10000
      });
      
      // Look for matching commodity in eNAM data
      if (response.data && response.data.records) {
        const match = response.data.records.find(record => 
          record.commodity?.toLowerCase().includes(commodity.toLowerCase()) &&
          record.state?.toLowerCase().includes(state.toLowerCase())
        );
        
        if (match && match.modal_price) {
          return {
            commodity,
            state,
            market: match.market || 'eNAM',
            modalPrice: parseInt(match.modal_price),
            minPrice: parseInt(match.min_price) || 0,
            maxPrice: parseInt(match.max_price) || 0,
            date: match.price_date || new Date().toISOString().split('T')[0],
            source: 'enam_platform'
          };
        }
      }
      
      return null;
      
    } catch (error) {
      console.error('❌ eNAM scrape failed:', error);
      return null;
    }
  }

  async scrapeMSP(commodity, state) {
    try {
      // Government MSP data
      const mspUrl = 'https://farmer.gov.in/mspprices.aspx';
      
      const response = await axios.get(mspUrl, {
        headers: this.headers,
        timeout: 10000
      });
      
      // Extract MSP data from government site
      const mspMatch = response.data.match(new RegExp(`${commodity}.*?(\\d{3,5})`, 'i'));
      if (mspMatch) {
        const mspPrice = parseInt(mspMatch[1]);
        
        return {
          commodity,
          state,
          market: 'MSP Rate',
          modalPrice: mspPrice,
          minPrice: mspPrice,
          maxPrice: mspPrice,
          date: new Date().toISOString().split('T')[0],
          source: 'government_msp'
        };
      }
      
      return null;
      
    } catch (error) {
      console.error('❌ MSP scrape failed:', error);
      return null;
    }
  }
}

export default new RealDataScraper(); // ⭐ CHANGED: ES Module export
