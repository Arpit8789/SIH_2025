// src/components/market/CropSelector.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, Wheat } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import cropsData from '@/data/crops1.json';
import statesData from '@/data/states.json';
import { DEFAULT_LOCATION } from '@/utils/marketConstants';

const CropSelector = ({ 
  selectedCrop, 
  selectedState, 
  selectedMarket, 
  onSelectionChange, 
  onSearch, 
  loading = false 
}) => {
  const { currentLanguage } = useLanguage();
  const [localSelections, setLocalSelections] = useState({
    crop: selectedCrop || '',
    state: selectedState || DEFAULT_LOCATION.state,
    market: selectedMarket || DEFAULT_LOCATION.market
  });

  // Get available markets for selected state
  const getAvailableMarkets = () => {
    if (!localSelections.state) return [];
    const stateData = statesData.states.find(s => s.id === localSelections.state);
    return stateData ? stateData.markets : [];
  };

  // Handle crop selection
  const handleCropChange = (cropId) => {
    const newSelections = { ...localSelections, crop: cropId };
    setLocalSelections(newSelections);
    onSelectionChange?.(newSelections);
  };

  // Handle state selection
  const handleStateChange = (stateId) => {
    const markets = statesData.states.find(s => s.id === stateId)?.markets || [];
    const defaultMarket = markets.find(m => m.isPrimary)?.id || markets[0]?.id || '';
    
    const newSelections = { 
      ...localSelections, 
      state: stateId, 
      market: defaultMarket 
    };
    setLocalSelections(newSelections);
    onSelectionChange?.(newSelections);
  };

  // Handle market selection
  const handleMarketChange = (marketId) => {
    const newSelections = { ...localSelections, market: marketId };
    setLocalSelections(newSelections);
    onSelectionChange?.(newSelections);
  };

  // Handle search
  const handleSearch = () => {
    if (localSelections.crop && localSelections.state) {
      onSearch?.(localSelections);
    }
  };

  const isSearchEnabled = localSelections.crop && localSelections.state && !loading;

  return (
    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-800">
          <div className="p-2 bg-green-600 rounded-lg">
            <Search className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-xl font-bold">
              {currentLanguage === 'hi' ? '🌾 बाज़ार भाव - Market Intelligence' : '🌾 Market Intelligence'}
            </div>
            <div className="text-sm font-normal text-green-600">
              {currentLanguage === 'hi' ? 'Real-time फसल की दरें और selling insights' : 'Real-time crop prices & selling insights'}
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Crop Selection */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Wheat className="h-4 w-4 text-green-600" />
              {currentLanguage === 'hi' ? 'फसल चुनें' : 'Crop'}
            </label>
            <Select value={localSelections.crop} onValueChange={handleCropChange}>
              <SelectTrigger className="bg-white border-green-200 focus:border-green-400">
                <SelectValue placeholder={
                  currentLanguage === 'hi' ? 'अपनी फसल चुनें...' : 'Select your crop...'
                } />
              </SelectTrigger>
              <SelectContent>
                {cropsData.crops.map((crop) => (
                  <SelectItem key={crop.id} value={crop.id}>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{crop.icon}</span>
                      <div>
                        <div className="font-medium">
                          {crop.name[currentLanguage] || crop.name.en}
                        </div>
                        <div className="text-xs text-gray-500 capitalize">
                          {crop.category} • {crop.season}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* State and Market Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* State Selection */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                {currentLanguage === 'hi' ? 'राज्य' : 'State'}
              </label>
              <Select value={localSelections.state} onValueChange={handleStateChange}>
                <SelectTrigger className="bg-white border-green-200 focus:border-green-400">
                  <SelectValue placeholder={
                    currentLanguage === 'hi' ? 'राज्य चुनें...' : 'Select state...'
                  } />
                </SelectTrigger>
                <SelectContent>
                  {statesData.states
                    .sort((a, b) => a.priority - b.priority)
                    .map((state) => (
                    <SelectItem key={state.id} value={state.id}>
                      <div className="flex items-center gap-2">
                        {state.isDefault && <span className="text-green-600">⭐</span>}
                        <span className="font-medium">
                          {state.name[currentLanguage] || state.name.en}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({state.markets.length} {currentLanguage === 'hi' ? 'मार्केट' : 'markets'})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Market Selection */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                {currentLanguage === 'hi' ? 'मार्केट/मंडी' : 'Market/Mandi'}
              </label>
              <Select 
                value={localSelections.market} 
                onValueChange={handleMarketChange}
                disabled={!localSelections.state}
              >
                <SelectTrigger className="bg-white border-green-200 focus:border-green-400">
                  <SelectValue placeholder={
                    currentLanguage === 'hi' ? 'मार्केट चुनें...' : 'Select market...'
                  } />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableMarkets().map((market) => (
                    <SelectItem key={market.id} value={market.id}>
                      <div className="flex items-center gap-2">
                        {market.isPrimary && <span className="text-blue-600">🏪</span>}
                        <span className="font-medium">
                          {market.name[currentLanguage] || market.name.en}
                        </span>
                        {market.isPrimary && (
                          <span className="text-xs text-blue-600">
                            {currentLanguage === 'hi' ? 'मुख्य' : 'Main'}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Search Button */}
          <Button 
            onClick={handleSearch}
            disabled={!isSearchEnabled}
            className={`w-full h-12 text-base font-semibold transition-all duration-200 ${
              isSearchEnabled 
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl' 
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>{currentLanguage === 'hi' ? 'खोज रहे हैं...' : 'Searching...'}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                <span>{currentLanguage === 'hi' ? '🔍 भाव खोजें' : '🔍 Search Prices'}</span>
              </div>
            )}
          </Button>

          {/* Helper text */}
          <div className="text-xs text-gray-600 text-center bg-white/70 p-2 rounded">
            {isSearchEnabled ? (
              <>
                {currentLanguage === 'hi' 
                  ? `${cropsData.crops.find(c => c.id === localSelections.crop)?.name.hi} के लिए ${statesData.states.find(s => s.id === localSelections.state)?.name.hi} में दरें देखें`
                  : `Get prices for ${cropsData.crops.find(c => c.id === localSelections.crop)?.name.en} in ${statesData.states.find(s => s.id === localSelections.state)?.name.en}`
                }
              </>
            ) : (
              <>
                {currentLanguage === 'hi' 
                  ? 'कृपया फसल और राज्य चुनें'
                  : 'Please select crop and state'
                }
              </>
            )}
          </div>

          {/* Quick Selection Chips */}
          {localSelections.state === 'punjab' && (
            <div className="border-t pt-3">
              <div className="text-xs font-medium text-gray-600 mb-2">
                {currentLanguage === 'hi' ? '🌾 पंजाब की लोकप्रिय फसलें:' : '🌾 Popular Punjab Crops:'}
              </div>
              <div className="flex flex-wrap gap-2">
                {['wheat', 'rice', 'potato'].map(cropId => {
                  const crop = cropsData.crops.find(c => c.id === cropId);
                  return (
                    <button
                      key={cropId}
                      onClick={() => handleCropChange(cropId)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        localSelections.crop === cropId
                          ? 'bg-green-600 text-white'
                          : 'bg-white text-green-600 border border-green-200 hover:bg-green-50'
                      }`}
                    >
                      {crop?.icon} {crop?.name[currentLanguage] || crop?.name.en}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CropSelector;
