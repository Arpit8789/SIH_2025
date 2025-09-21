// src/pages/features/SoilHealth.jsx - Enhanced Crop-Specific Soil Health Calculator
import React, { useState, useEffect, useRef } from 'react';
import { 
  Beaker, 
  Upload, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Droplets,
  Leaf,
  Activity,
  MapPin,
  RefreshCw,
  Download,
  Calculator,
  Target,
  Sun,
  Moon,
  BarChart3,
  Settings,
  Info,
  ArrowRight,
  Eye,
  Microscope,
  FlaskConical,
  Sprout,
  TreePine,
  Wheat,
  FileText,
  Smartphone,
  Cloud,
  Package
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Enhanced Custom Components with Dark Mode Support
const Label = ({ children, className = "", ...props }) => (
  <label className={`text-sm font-medium text-gray-700 dark:text-gray-300 ${className}`} {...props}>
    {children}
  </label>
);

const Switch = ({ checked, onCheckedChange, className = "" }) => (
  <button
    onClick={() => onCheckedChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
      checked ? 'bg-green-600 shadow-lg' : 'bg-gray-200 dark:bg-gray-700'
    } ${className}`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 shadow-lg ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);

const SoilHealth = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('crop-selection');
  const [analysisMethod, setAnalysisMethod] = useState('manual');
  const [selectedCrop, setSelectedCrop] = useState('');
  const [farmArea, setFarmArea] = useState(1);
  const [location, setLocation] = useState('');
  const [soilResults, setSoilResults] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const fileInputRef = useRef(null);

  // Enhanced Manual Input State
  const [manualData, setManualData] = useState({
    nitrogen: 45,
    phosphorus: 18,
    potassium: 280,
    ph: 6.8,
    moisture: 65,
    organicMatter: 2.8,
    temperature: 25,
    humidity: 70
  });

  // Enhanced Crop Database with Detailed Indian Agricultural Context
  const cropDatabase = {
    wheat: { 
      name: 'Wheat (गेहूं)', 
      icon: '🌾', 
      season: 'Rabi (Oct-Apr)',
      // Recommended NPK for high-yielding varieties
      n: 120, p: 60, k: 40, s: 30,
      optimalPh: [6.0, 7.5],
      waterReq: 'Medium (450-650mm)',
      yield: 4.5, // tonnes per hectare
      price: 23000, // per tonne
      soilType: 'Well-drained loamy soil',
      fertilizers: {
        urea: '260 kg/ha (46% N)',
        dap: '130 kg/ha (18-46-0)',
        mop: '67 kg/ha (60% K2O)',
        ssp: '375 kg/ha (16% P2O5)'
      },
      organicOptions: {
        fym: '10-12 tonnes/ha before sowing',
        compost: '8-10 tonnes/ha',
        vermicompost: '5-6 tonnes/ha',
        greenManure: 'Dhaincha, Sesbania before wheat'
      },
      deficiencySymptoms: {
        nitrogen: 'Yellowing of older leaves, stunted growth',
        phosphorus: 'Purple tinge on leaves, delayed maturity',
        potassium: 'Brown leaf margins, weak stems'
      }
    },
    rice: { 
      name: 'Rice (चावल)', 
      icon: '🌾', 
      season: 'Kharif (Jun-Oct)',
      n: 150, p: 75, k: 75, s: 45,
      optimalPh: [5.5, 7.0],
      waterReq: 'High (1200-1800mm)',
      yield: 5.2,
      price: 25000,
      soilType: 'Clay loam with good water holding capacity',
      fertilizers: {
        urea: '326 kg/ha (46% N)',
        dap: '163 kg/ha (18-46-0)',
        mop: '125 kg/ha (60% K2O)',
        zinc: '25 kg ZnSO4/ha'
      },
      organicOptions: {
        fym: '12-15 tonnes/ha',
        compost: '10-12 tonnes/ha',
        vermicompost: '6-8 tonnes/ha',
        greenManure: 'Azolla cultivation in standing water'
      },
      deficiencySymptoms: {
        nitrogen: 'Light green to yellow leaves',
        phosphorus: 'Dark green leaves with purple tinge',
        zinc: 'Brown spots on leaves, stunted growth'
      }
    },
    cotton: { 
      name: 'Cotton (कपास)', 
      icon: '🌿', 
      season: 'Kharif (Apr-Dec)',
      n: 120, p: 60, k: 60, s: 40,
      optimalPh: [5.8, 8.0],
      waterReq: 'Medium (700-1300mm)',
      yield: 2.8,
      price: 55000,
      soilType: 'Deep black cotton soil',
      fertilizers: {
        urea: '260 kg/ha split application',
        dap: '130 kg/ha at sowing',
        mop: '100 kg/ha',
        boron: '1 kg B/ha for better flowering'
      },
      organicOptions: {
        fym: '10-12 tonnes/ha',
        compost: '8-10 tonnes/ha',
        vermicompost: '5-6 tonnes/ha',
        neem: 'Neem cake 250 kg/ha for pest control'
      },
      deficiencySymptoms: {
        nitrogen: 'Pale green leaves, reduced boll formation',
        potassium: 'Yellow leaf margins, poor fiber quality',
        boron: 'Square and boll shedding'
      }
    },
    sugarcane: { 
      name: 'Sugarcane (गन्ना)', 
      icon: '🎋', 
      season: 'Annual (Feb-Apr sowing)',
      n: 300, p: 150, k: 150, s: 80,
      optimalPh: [6.0, 7.5],
      waterReq: 'Very High (1800-2500mm)',
      yield: 75.0,
      price: 3200,
      soilType: 'Deep fertile loamy to clay loam',
      fertilizers: {
        urea: '652 kg/ha in 3-4 splits',
        dap: '326 kg/ha basal',
        mop: '250 kg/ha',
        zinc: '25 kg ZnSO4/ha'
      },
      organicOptions: {
        fym: '25-30 tonnes/ha',
        compost: '20-25 tonnes/ha',
        vermicompost: '12-15 tonnes/ha',
        pressMud: '10-12 tonnes/ha (sugar mill waste)'
      },
      deficiencySymptoms: {
        nitrogen: 'Light green leaves, thin canes',
        phosphorus: 'Purple leaves, poor root development',
        potassium: 'Yellow leaf margins, lodging'
      }
    },
    tomato: { 
      name: 'Tomato (टमाटर)', 
      icon: '🍅', 
      season: 'Both seasons',
      n: 200, p: 100, k: 150, s: 50,
      optimalPh: [6.0, 7.0],
      waterReq: 'High (600-800mm)',
      yield: 45.0,
      price: 15000,
      soilType: 'Well-drained sandy loam to loam',
      fertilizers: {
        urea: '435 kg/ha in splits',
        dap: '217 kg/ha',
        mop: '250 kg/ha',
        calcium: '200 kg gypsum/ha for blossom end rot'
      },
      organicOptions: {
        fym: '15-20 tonnes/ha',
        compost: '12-15 tonnes/ha',
        vermicompost: '8-10 tonnes/ha',
        biofertilizers: 'Azotobacter + PSB'
      },
      deficiencySymptoms: {
        nitrogen: 'Yellow lower leaves, small fruits',
        calcium: 'Blossom end rot in fruits',
        potassium: 'Yellow leaf edges, poor fruit quality'
      }
    },
    potato: { 
      name: 'Potato (आलू)', 
      icon: '🥔', 
      season: 'Rabi (Oct-Feb)',
      n: 180, p: 80, k: 100, s: 40,
      optimalPh: [5.2, 6.4],
      waterReq: 'Medium (500-700mm)',
      yield: 25.0,
      price: 12000,
      soilType: 'Well-drained sandy loam',
      fertilizers: {
        urea: '391 kg/ha',
        dap: '174 kg/ha',
        mop: '167 kg/ha',
        sulphur: '40 kg S/ha for better quality'
      },
      organicOptions: {
        fym: '20-25 tonnes/ha',
        compost: '15-18 tonnes/ha',
        vermicompost: '10-12 tonnes/ha',
        bioFertilizer: 'Azotobacter + PSB + KSB'
      },
      deficiencySymptoms: {
        nitrogen: 'Light green foliage, small tubers',
        phosphorus: 'Purple leaves, delayed maturity',
        potassium: 'Brown leaf margins, hollow heart'
      }
    }
  };

  // Analysis Methods Configuration (Removed Camera option)
  const analysisMethods = [
    {
      id: 'manual',
      title: 'Manual Input',
      description: 'Enter soil parameters manually from lab report',
      icon: Calculator,
      color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
    },
    {
      id: 'upload',
      title: 'Lab Report Upload',
      description: 'Upload your soil test report (PDF/Image)',
      icon: Upload,
      color: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
    },
    {
      id: 'iot',
      title: 'IoT Sensor Data',
      description: 'Connect with smart soil sensors',
      icon: Smartphone,
      color: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700'
    }
  ];

  // File upload handler
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  // Simulate realistic soil analysis with crop-specific evaluation
  const performAnalysis = async () => {
    if (!selectedCrop) {
      alert('Please select a crop before starting analysis');
      return;
    }

    setIsAnalyzing(true);
    
    const processingTime = {
      manual: 1500,
      upload: 3000,
      iot: 2000
    };

    setTimeout(() => {
      const mockResults = generateCropSpecificResults();
      setSoilResults(mockResults);
      setIsAnalyzing(false);
      setActiveTab('results');
    }, processingTime[analysisMethod]);
  };

  const generateCropSpecificResults = () => {
    const crop = cropDatabase[selectedCrop];
    const { nitrogen, phosphorus, potassium, ph, moisture, organicMatter } = manualData;

    // Crop-specific health scoring algorithm
    let healthScore = 50;
    
    // pH scoring based on crop-specific optimal range
    const phOptimal = crop.optimalPh;
    const phMid = (phOptimal[0] + phOptimal[1]) / 2;
    if (ph >= phOptimal[0] && ph <= phOptimal[1]) {
      healthScore += 15;
    } else if (Math.abs(ph - phMid) < 1) {
      healthScore += 10;
    } else {
      healthScore += 5;
    }

    // NPK scoring based on crop requirements
    const nDeficit = Math.max(0, crop.n - nitrogen);
    const pDeficit = Math.max(0, crop.p - phosphorus);
    const kDeficit = Math.max(0, crop.k - potassium);

    healthScore += Math.max(0, 15 - (nDeficit / crop.n * 15));
    healthScore += Math.max(0, 15 - (pDeficit / crop.p * 15));
    healthScore += Math.max(0, 10 - (kDeficit / crop.k * 10));

    // Organic matter and moisture based on crop needs
    healthScore += Math.min(10, organicMatter * 3);
    healthScore += Math.min(10, moisture / 10);

    return {
      overallScore: Math.min(95, Math.max(20, Math.round(healthScore))),
      cropSuitability: calculateCropSuitability(crop, { nitrogen, phosphorus, potassium, ph }),
      location: location || 'Punjab, India',
      testDate: new Date().toLocaleDateString(),
      selectedCrop: crop,
      parameters: {
        nitrogen: { 
          value: nitrogen, 
          required: crop.n,
          status: nitrogen >= crop.n * 0.8 ? 'sufficient' : nitrogen >= crop.n * 0.5 ? 'moderate' : 'deficient',
          deficit: Math.max(0, crop.n - nitrogen)
        },
        phosphorus: { 
          value: phosphorus, 
          required: crop.p,
          status: phosphorus >= crop.p * 0.8 ? 'sufficient' : phosphorus >= crop.p * 0.5 ? 'moderate' : 'deficient',
          deficit: Math.max(0, crop.p - phosphorus)
        },
        potassium: { 
          value: potassium, 
          required: crop.k,
          status: potassium >= crop.k * 0.8 ? 'sufficient' : potassium >= crop.k * 0.5 ? 'moderate' : 'deficient',
          deficit: Math.max(0, crop.k - potassium)
        },
        ph: { 
          value: ph, 
          optimal: phOptimal,
          status: ph >= phOptimal[0] && ph <= phOptimal[1] ? 'optimal' : ph < phOptimal[0] ? 'acidic' : 'alkaline'
        },
        moisture: { value: moisture, status: moisture > 50 ? 'adequate' : 'low' },
        organicMatter: { value: organicMatter, status: organicMatter > 2.5 ? 'good' : organicMatter > 1.5 ? 'moderate' : 'low' }
      },
      recommendations: generateCropSpecificRecommendations(crop, { nitrogen, phosphorus, potassium, ph }),
      economics: calculateDetailedEconomics(crop, { nitrogen, phosphorus, potassium })
    };
  };

  const calculateCropSuitability = (crop, current) => {
    let suitabilityScore = 100;
    
    // Reduce score based on nutrient deficits
    suitabilityScore -= Math.min(30, (Math.max(0, crop.n - current.nitrogen) / crop.n) * 30);
    suitabilityScore -= Math.min(25, (Math.max(0, crop.p - current.phosphorus) / crop.p) * 25);
    suitabilityScore -= Math.min(20, (Math.max(0, crop.k - current.potassium) / crop.k) * 20);
    
    // pH suitability
    const phMid = (crop.optimalPh[0] + crop.optimalPh[1]) / 2;
    if (Math.abs(current.ph - phMid) > 1) suitabilityScore -= 15;
    
    return Math.max(40, Math.round(suitabilityScore));
  };

  const generateCropSpecificRecommendations = (crop, current) => {
    const recommendations = [];
    
    // Nitrogen recommendations
    if (current.nitrogen < crop.n * 0.8) {
      const nDeficit = crop.n - current.nitrogen;
      recommendations.push({
        priority: 'high',
        category: 'Fertilizer',
        title: `Nitrogen Deficiency for ${crop.name}`,
        action: `Apply ${Math.round(nDeficit * 2.17)} kg Urea/ha (${Math.round(nDeficit)} kg N/ha deficit)`,
        timing: crop.season.includes('Rabi') ? 'Split: 50% basal + 25% at tillering + 25% at flowering' : 'Split: 50% basal + 30% at 30 DAS + 20% at 60 DAS',
        organic: `Alternative: Apply ${crop.organicOptions.fym} or ${crop.organicOptions.compost}`,
        cost: Math.round(nDeficit * 2.17 * 6 * farmArea)
      });
    }

    // Phosphorus recommendations
    if (current.phosphorus < crop.p * 0.8) {
      const pDeficit = crop.p - current.phosphorus;
      recommendations.push({
        priority: 'high',
        category: 'Fertilizer',
        title: `Phosphorus Enhancement for ${crop.name}`,
        action: `Apply ${Math.round(pDeficit * 2.17)} kg DAP/ha (${Math.round(pDeficit)} kg P/ha deficit)`,
        timing: 'Full dose at sowing as basal application',
        organic: `Alternative: Apply ${crop.organicOptions.vermicompost} + Rock Phosphate 250 kg/ha`,
        cost: Math.round(pDeficit * 2.17 * 24 * farmArea)
      });
    }

    // Potassium recommendations
    if (current.potassium < crop.k * 0.8) {
      const kDeficit = crop.k - current.potassium;
      recommendations.push({
        priority: 'medium',
        category: 'Fertilizer',
        title: `Potassium Supplementation for ${crop.name}`,
        action: `Apply ${Math.round(kDeficit * 1.67)} kg MOP/ha (${Math.round(kDeficit)} kg K/ha deficit)`,
        timing: '50% basal + 50% at flowering/fruiting stage',
        organic: `Alternative: Wood ash 500 kg/ha or Banana pseudostem compost`,
        cost: Math.round(kDeficit * 1.67 * 18 * farmArea)
      });
    }

    // pH correction recommendations
    if (current.ph < crop.optimalPh[0]) {
      recommendations.push({
        priority: 'medium',
        category: 'Soil Amendment',
        title: `Soil pH Correction for ${crop.name}`,
        action: `Apply Lime @ ${Math.round((crop.optimalPh[0] - current.ph) * 500)} kg/ha to increase pH`,
        timing: '2-3 weeks before sowing, mix well with soil',
        organic: 'Alternative: Wood ash 1-2 tonnes/ha',
        cost: Math.round((crop.optimalPh[0] - current.ph) * 500 * 8 * farmArea)
      });
    } else if (current.ph > crop.optimalPh[1]) {
      recommendations.push({
        priority: 'medium',
        category: 'Soil Amendment',
        title: `Reduce Soil Alkalinity for ${crop.name}`,
        action: `Apply Gypsum @ ${Math.round((current.ph - crop.optimalPh[1]) * 1000)} kg/ha`,
        timing: 'Before sowing, incorporate into soil',
        organic: 'Alternative: Sulphur 200-300 kg/ha + organic matter',
        cost: Math.round((current.ph - crop.optimalPh[1]) * 1000 * 3 * farmArea)
      });
    }

    // Organic matter recommendations
    recommendations.push({
      priority: 'low',
      category: 'Organic',
      title: `Soil Health Improvement for ${crop.name}`,
      action: `Apply ${crop.organicOptions.fym} every season`,
      timing: '15-20 days before sowing for decomposition',
      organic: `Options: ${crop.organicOptions.compost} or ${crop.organicOptions.vermicompost}`,
      cost: Math.round(5000 * farmArea) // Cost of FYM
    });

    return recommendations;
  };

  const calculateDetailedEconomics = (crop, current) => {
    const nDeficit = Math.max(0, crop.n - current.nitrogen);
    const pDeficit = Math.max(0, crop.p - current.phosphorus);
    const kDeficit = Math.max(0, crop.k - current.potassium);

    // Fertilizer costs (₹/kg)
    const ureaNeeded = nDeficit * 2.17; // kg/ha
    const dapNeeded = pDeficit * 2.17;
    const mopNeeded = kDeficit * 1.67;

    const fertilizerCost = (ureaNeeded * 6) + (dapNeeded * 24) + (mopNeeded * 18);
    const organicCost = 5000; // FYM cost per hectare

    // Yield impact calculation
    const nutrientDeficitImpact = ((nDeficit + pDeficit + kDeficit) / (crop.n + crop.p + crop.k)) * 100;
    const expectedYieldLoss = Math.min(40, nutrientDeficitImpact * 1.5); // Max 40% loss
    const potentialYieldIncrease = expectedYieldLoss * 0.8; // 80% recoverable with proper fertilization

    const currentYield = crop.yield * (1 - expectedYieldLoss / 100);
    const improvedYield = crop.yield * (1 - expectedYieldLoss / 100 + potentialYieldIncrease / 100);
    const additionalYield = improvedYield - currentYield;
    
    const additionalRevenue = additionalYield * farmArea * crop.price;
    const totalCost = (fertilizerCost + organicCost) * farmArea;

    return {
      totalCost,
      fertilizerCost: fertilizerCost * farmArea,
      organicCost: organicCost * farmArea,
      additionalRevenue,
      currentYield: currentYield * farmArea,
      improvedYield: improvedYield * farmArea,
      yieldIncrease: additionalYield * farmArea,
      roi: totalCost > 0 ? ((additionalRevenue - totalCost) / totalCost * 100).toFixed(1) : 0,
      profitIncrease: additionalRevenue - totalCost
    };
  };

  const getStatusColor = (status) => {
    const colors = {
      sufficient: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700',
      moderate: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700',
      deficient: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700',
      optimal: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700',
      acidic: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700',
      alkaline: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700',
      good: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700',
      adequate: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700',
      low: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
    };
    return colors[status] || colors.moderate;
  };

  if (isAnalyzing) {
    return (
      <div className={`min-h-screen transition-all duration-300 ${darkMode ? 'dark' : ''} bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900`}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="relative mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/40 dark:to-blue-900/40 rounded-full mb-6 shadow-lg">
                <Beaker className="h-12 w-12 text-green-600 dark:text-green-400 animate-pulse" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full animate-ping"></div>
            </div>
            
            <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              🧪 Analyzing Soil for {selectedCrop ? cropDatabase[selectedCrop].name : 'Selected Crop'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
              {analysisMethod === 'manual' && 'Processing manual soil parameters...'}
              {analysisMethod === 'upload' && 'Extracting data from lab report...'}
              {analysisMethod === 'iot' && 'Fetching real-time sensor data...'}
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-center space-x-3 text-sm text-gray-500 dark:text-gray-400">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                <span>Running crop-specific soil analysis...</span>
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500">
                Evaluating NPK levels, pH, and crop compatibility for optimal recommendations
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-300 ${darkMode ? 'dark' : ''} bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900`}>
      <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
              🧪 Smart Crop-Specific Soil Analyzer
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Advanced soil analysis with personalized fertilizer and organic recommendations based on your crop selection
            </p>
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700">
                🌾 Crop-Specific
              </Badge>
              <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700">
                📊 Detailed Analysis
              </Badge>
              <Badge variant="outline" className="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700">
                🌱 Organic Options
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDarkMode(!darkMode)}
              className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1 rounded-lg shadow-sm">
            <TabsTrigger 
              value="crop-selection" 
              className="text-gray-700 dark:text-gray-300 data-[state=active]:bg-green-100 dark:data-[state=active]:bg-green-900/30 data-[state=active]:text-green-700 dark:data-[state=active]:text-green-300"
            >
              🌾 Select Crop
            </TabsTrigger>
            <TabsTrigger 
              value="input" 
              className="text-gray-700 dark:text-gray-300 data-[state=active]:bg-green-100 dark:data-[state=active]:bg-green-900/30 data-[state=active]:text-green-700 dark:data-[state=active]:text-green-300"
              disabled={!selectedCrop}
            >
              📊 Soil Data
            </TabsTrigger>
            <TabsTrigger 
              value="results" 
              className="text-gray-700 dark:text-gray-300 data-[state=active]:bg-green-100 dark:data-[state=active]:bg-green-900/30 data-[state=active]:text-green-700 dark:data-[state=active]:text-green-300"
              disabled={!soilResults}
            >
              🧪 Results
            </TabsTrigger>
            <TabsTrigger 
              value="recommendations" 
              className="text-gray-700 dark:text-gray-300 data-[state=active]:bg-green-100 dark:data-[state=active]:bg-green-900/30 data-[state=active]:text-green-700 dark:data-[state=active]:text-green-300"
              disabled={!soilResults}
            >
              💡 Recommendations
            </TabsTrigger>
          </TabsList>

          {/* Crop Selection Tab */}
          <TabsContent value="crop-selection" className="space-y-6">
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <Sprout className="h-5 w-5 text-green-600 dark:text-green-400" />
                  Choose Your Crop for Targeted Soil Analysis
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Select your target crop to get specific soil requirements, fertilizer recommendations, and organic alternatives.
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(cropDatabase).map(([key, crop]) => (
                    <div
                      key={key}
                      onClick={() => setSelectedCrop(key)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                        selectedCrop === key 
                          ? 'border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/20 shadow-md' 
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-green-300 dark:hover:border-green-600'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="text-3xl">{crop.icon}</div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">{crop.name}</h3>
                          <Badge variant="outline" className="text-xs mt-1">
                            {crop.season}
                          </Badge>
                        </div>
                        {selectedCrop === key && (
                          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                        )}
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex justify-between">
                          <span>NPK Required:</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {crop.n}-{crop.p}-{crop.k}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Optimal pH:</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {crop.optimalPh[0]}-{crop.optimalPh[1]}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Water Need:</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100 text-xs">
                            {crop.waterReq}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Avg. Yield:</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {crop.yield} t/ha
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedCrop && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded-lg border border-green-200 dark:border-green-700">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                      <Info className="h-4 w-4 text-green-600 dark:text-green-400" />
                      Selected: {cropDatabase[selectedCrop].name}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong className="text-gray-900 dark:text-gray-100">Soil Type:</strong>
                        <p className="text-gray-600 dark:text-gray-400">{cropDatabase[selectedCrop].soilType}</p>
                      </div>
                      <div>
                        <strong className="text-gray-900 dark:text-gray-100">Market Price:</strong>
                        <p className="text-gray-600 dark:text-gray-400">₹{cropDatabase[selectedCrop].price.toLocaleString()}/tonne</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={farmArea}
                          onChange={(e) => setFarmArea(Number(e.target.value))}
                          placeholder="Farm area"
                          className="w-24 h-8 text-sm"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">acres</span>
                      </div>
                      
                      <Button 
                        onClick={() => setActiveTab('input')}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        Proceed to Soil Analysis
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Input Data Tab */}
          <TabsContent value="input" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Analysis Method Selection */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                      <Settings className="h-5 w-5 text-green-600 dark:text-green-400" />
                      Choose Analysis Method
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {analysisMethods.map((method) => (
                        <div
                          key={method.id}
                          onClick={() => setAnalysisMethod(method.id)}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                            analysisMethod === method.id 
                              ? 'border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/20' 
                              : `border-gray-200 dark:border-gray-700 ${method.color} hover:border-gray-300 dark:hover:border-gray-600`
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`p-2 rounded-lg ${analysisMethod === method.id ? 'bg-green-100 dark:bg-green-900/40' : 'bg-white dark:bg-gray-700'} shadow-sm`}>
                              <method.icon className={`h-5 w-5 ${analysisMethod === method.id ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`} />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{method.title}</h3>
                              <p className="text-xs text-gray-600 dark:text-gray-400">{method.description}</p>
                            </div>
                          </div>
                          {analysisMethod === method.id && (
                            <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
                              <CheckCircle className="h-3 w-3" />
                              Selected
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Method-specific Input Interface */}
                {analysisMethod === 'manual' && (
                  <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                        <Calculator className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        Manual Soil Parameters Entry
                      </CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Enter values from your soil test report for {selectedCrop ? cropDatabase[selectedCrop].name : 'selected crop'}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* NPK Values */}
                        <div className="space-y-4">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <FlaskConical className="h-4 w-4 text-green-600 dark:text-green-400" />
                            NPK Levels (kg/ha)
                          </h4>
                          
                          {[
                            { key: 'nitrogen', label: 'Nitrogen (N)', color: 'blue', max: 200, required: selectedCrop ? cropDatabase[selectedCrop].n : 0 },
                            { key: 'phosphorus', label: 'Phosphorus (P)', color: 'orange', max: 100, required: selectedCrop ? cropDatabase[selectedCrop].p : 0 },
                            { key: 'potassium', label: 'Potassium (K)', color: 'purple', max: 400, required: selectedCrop ? cropDatabase[selectedCrop].k : 0 }
                          ].map(({ key, label, color, max, required }) => (
                            <div key={key} className={`p-3 bg-${color}-50 dark:bg-${color}-900/20 rounded-lg border border-${color}-200 dark:border-${color}-700`}>
                              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                {label}
                              </Label>
                              <Input
                                type="number"
                                value={manualData[key]}
                                onChange={(e) => setManualData(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                                className="mb-2"
                                placeholder={`Enter ${label.toLowerCase()}`}
                              />
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                <div>Current: {manualData[key]} kg/ha | Required: {required} kg/ha</div>
                                <div className={`${manualData[key] >= required * 0.8 ? 'text-green-600' : manualData[key] >= required * 0.5 ? 'text-yellow-600' : 'text-red-600'}`}>
                                  Status: {manualData[key] >= required * 0.8 ? 'Sufficient' : manualData[key] >= required * 0.5 ? 'Moderate' : 'Deficient'}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Other Parameters */}
                        <div className="space-y-4">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <Microscope className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                            Soil Properties
                          </h4>
                          
                          {[
                            { key: 'ph', label: 'pH Level', range: '0-14', unit: '', optimal: selectedCrop ? cropDatabase[selectedCrop].optimalPh : [6, 7] },
                            { key: 'moisture', label: 'Moisture Content', range: '0-100', unit: '%' },
                            { key: 'organicMatter', label: 'Organic Matter', range: '0-10', unit: '%' },
                            { key: 'temperature', label: 'Soil Temperature', range: '10-40', unit: '°C' }
                          ].map(({ key, label, range, unit, optimal }) => (
                            <div key={key} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                {label}
                              </Label>
                              <Input
                                type="number"
                                step="0.1"
                                value={manualData[key]}
                                onChange={(e) => setManualData(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                                className="mb-2"
                                placeholder={`Enter ${label.toLowerCase()}`}
                              />
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                <div>Current: {manualData[key]}{unit} | Range: {range}</div>
                                {optimal && (
                                  <div className={`${manualData[key] >= optimal[0] && manualData[key] <= optimal[1] ? 'text-green-600' : 'text-orange-600'}`}>
                                    Optimal for {selectedCrop ? cropDatabase[selectedCrop].name : 'crop'}: {optimal[0]}-{optimal[1]}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {analysisMethod === 'upload' && (
                  <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                        <Upload className="h-5 w-5 text-green-600 dark:text-green-400" />
                        Upload Soil Test Report
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                      />
                      
                      <div 
                        onClick={triggerFileUpload}
                        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-green-400 dark:hover:border-green-500 transition-colors cursor-pointer"
                      >
                        <Upload className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                          {uploadedFile ? uploadedFile.name : 'Click to upload soil test report'}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          Supports PDF, JPG, PNG files up to 10MB
                        </p>
                        <Button className="bg-green-600 hover:bg-green-700 text-white">
                          <FileText className="h-4 w-4 mr-2" />
                          Choose File
                        </Button>
                        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                          AI will automatically extract NPK, pH, and other parameters for {selectedCrop ? cropDatabase[selectedCrop].name : 'your crop'}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {analysisMethod === 'iot' && (
                  <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                        <Smartphone className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        IoT Sensor Integration
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <Alert className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700">
                          <Cloud className="h-4 w-4" />
                          <AlertDescription>
                            Connect your smart soil sensors for real-time data collection and continuous monitoring for {selectedCrop ? cropDatabase[selectedCrop].name : 'your crop'}.
                          </AlertDescription>
                        </Alert>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                            <Smartphone className="h-4 w-4 mr-2" />
                            Connect Sensors
                          </Button>
                          <Button variant="outline" className="border-orange-200 dark:border-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Sync Data
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar - Crop Info */}
              <div className="space-y-6">
                {selectedCrop && (
                  <Card className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border-green-200 dark:border-green-700 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                        <span className="text-2xl">{cropDatabase[selectedCrop].icon}</span>
                        {cropDatabase[selectedCrop].name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                        <div className="text-sm text-gray-600 dark:text-gray-400">Required NPK (kg/ha)</div>
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {cropDatabase[selectedCrop].n}-{cropDatabase[selectedCrop].p}-{cropDatabase[selectedCrop].k}
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Season:</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{cropDatabase[selectedCrop].season}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Optimal pH:</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {cropDatabase[selectedCrop].optimalPh[0]}-{cropDatabase[selectedCrop].optimalPh[1]}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Water Need:</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100 text-xs">
                            {cropDatabase[selectedCrop].waterReq}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Expected Yield:</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {cropDatabase[selectedCrop].yield} t/ha
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Farm Area:</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{farmArea} acres</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Analysis Button */}
                <Button 
                  onClick={performAnalysis}
                  disabled={!selectedCrop}
                  className="w-full h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                >
                  <Beaker className="h-5 w-5 mr-2" />
                  Analyze Soil for {selectedCrop ? cropDatabase[selectedCrop].name.split(' ')[0] : 'Crop'}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="space-y-6">
            {soilResults && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Results */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Overall Health Score */}
                  <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border-green-200 dark:border-green-700 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                        <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
                        Soil Health for {soilResults.selectedCrop.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <div className="text-6xl font-bold text-green-600 dark:text-green-400 flex items-center gap-3 mb-2">
                            {soilResults.overallScore >= 80 ? '🟢' : soilResults.overallScore >= 60 ? '🟡' : '🔴'}
                            {soilResults.overallScore}/100
                          </div>
                          <Badge className={`${soilResults.overallScore >= 80 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : soilResults.overallScore >= 60 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'}`}>
                            {soilResults.overallScore >= 80 ? 'Excellent' : soilResults.overallScore >= 60 ? 'Good' : 'Needs Improvement'}
                          </Badge>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            Crop Suitability: {soilResults.cropSuitability}% | {soilResults.testDate}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl mb-2">{soilResults.selectedCrop.icon}</div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Crop-Specific Analysis</p>
                        </div>
                      </div>
                      <Progress value={soilResults.overallScore} className="h-4" />
                    </CardContent>
                  </Card>

                  {/* Detailed Parameters */}
                  <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                        <Microscope className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        Crop-Specific Parameter Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* NPK Parameters */}
                        {['nitrogen', 'phosphorus', 'potassium'].map((key) => {
                          const param = soilResults.parameters[key];
                          return (
                            <div key={key} className={`p-4 rounded-lg border ${getStatusColor(param.status)}`}>
                              <div className="flex justify-between items-center mb-2">
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100 capitalize flex items-center gap-2">
                                  {key === 'nitrogen' && <span className="text-blue-500">N</span>}
                                  {key === 'phosphorus' && <span className="text-orange-500">P</span>}
                                  {key === 'potassium' && <span className="text-purple-500">K</span>}
                                  {key.charAt(0).toUpperCase() + key.slice(1)}
                                </h4>
                                <Badge variant="outline" className={getStatusColor(param.status)}>
                                  {param.status}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600 dark:text-gray-400">Current:</span>
                                  <span className="font-bold text-gray-900 dark:text-gray-100 ml-2">{param.value} kg/ha</span>
                                </div>
                                <div>
                                  <span className="text-gray-600 dark:text-gray-400">Required:</span>
                                  <span className="font-bold text-gray-900 dark:text-gray-100 ml-2">{param.required} kg/ha</span>
                                </div>
                              </div>
                              {param.deficit > 0 && (
                                <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                                  Deficit: {param.deficit} kg/ha
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {/* pH Parameter */}
                        <div className={`p-4 rounded-lg border ${getStatusColor(soilResults.parameters.ph.status)}`}>
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100">pH Level</h4>
                            <Badge variant="outline" className={getStatusColor(soilResults.parameters.ph.status)}>
                              {soilResults.parameters.ph.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Current pH:</span>
                              <span className="font-bold text-gray-900 dark:text-gray-100 ml-2">{soilResults.parameters.ph.value}</span>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Optimal Range:</span>
                              <span className="font-bold text-gray-900 dark:text-gray-100 ml-2">
                                {soilResults.parameters.ph.optimal[0]}-{soilResults.parameters.ph.optimal[1]}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar - Economics & Actions */}
                <div className="space-y-6">
                  <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-base text-gray-900 dark:text-gray-100">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button variant="outline" className="w-full justify-start hover:bg-green-50 dark:hover:bg-green-900/20">
                        <Download className="mr-2 h-4 w-4" />
                        Download Report
                      </Button>
                      <Button variant="outline" className="w-full justify-start hover:bg-blue-50 dark:hover:bg-blue-900/20">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Re-analyze
                      </Button>
                      <Button variant="outline" className="w-full justify-start hover:bg-purple-50 dark:hover:bg-purple-900/20">
                        <Eye className="mr-2 h-4 w-4" />
                        View History
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Economic Summary */}
                  <Card className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20 border-blue-200 dark:border-blue-700 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-base text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        💰 Economic Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                        <div className="text-lg font-bold text-red-600 dark:text-red-400">
                          ₹{Math.round(soilResults.economics.totalCost).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Total Investment</div>
                      </div>
                      <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                        <div className="text-lg font-bold text-green-600 dark:text-green-400">
                          +₹{Math.round(soilResults.economics.additionalRevenue).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Additional Revenue</div>
                      </div>
                      <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                        <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          {soilResults.economics.roi}%
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">ROI</div>
                      </div>
                      <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                        <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                          +{(soilResults.economics.yieldIncrease).toFixed(1)}t
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Yield Increase</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-6">
            {soilResults && (
              <div className="space-y-6">
                {/* Fertilizer Recommendations */}
                <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                      <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      Fertilizer Recommendations for {soilResults.selectedCrop.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {soilResults.recommendations.filter(rec => rec.category === 'Fertilizer').map((rec, index) => (
                        <div key={index} className={`p-4 rounded-lg border ${
                          rec.priority === 'high' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700' :
                          'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700'
                        }`}>
                          <div className="flex items-center gap-2 mb-3">
                            <AlertTriangle className={`h-4 w-4 ${rec.priority === 'high' ? 'text-red-500' : 'text-yellow-500'}`} />
                            <span className={`font-semibold text-sm ${
                              rec.priority === 'high' ? 'text-red-800 dark:text-red-300' :
                              'text-yellow-800 dark:text-yellow-300'
                            }`}>
                              {rec.priority === 'high' ? 'High Priority' : 'Medium Priority'}
                            </span>
                            <Badge variant="outline" className="text-xs ml-auto">
                              ₹{rec.cost.toLocaleString()}
                            </Badge>
                          </div>
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">{rec.title}</h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <strong className="text-gray-900 dark:text-gray-100">Chemical:</strong>
                              <p className="text-gray-600 dark:text-gray-400">{rec.action}</p>
                            </div>
                            <div>
                              <strong className="text-gray-900 dark:text-gray-100">Timing:</strong>
                              <p className="text-gray-600 dark:text-gray-400">{rec.timing}</p>
                            </div>
                            <div>
                              <strong className="text-green-700 dark:text-green-300">Organic Alternative:</strong>
                              <p className="text-green-600 dark:text-green-400">{rec.organic}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Organic Options */}
                <Card className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border-green-200 dark:border-green-700 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                      <Leaf className="h-5 w-5 text-green-600 dark:text-green-400" />
                      Organic Fertilizer Options for {soilResults.selectedCrop.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(soilResults.selectedCrop.organicOptions).map(([type, recommendation]) => (
                        <div key={type} className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-700">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2 capitalize flex items-center gap-2">
                            {type === 'fym' && <span>🐄</span>}
                            {type === 'compost' && <span>🍂</span>}
                            {type === 'vermicompost' && <span>🪱</span>}
                            {type === 'greenManure' && <span>🌱</span>}
                            {type === 'neem' && <span>🌿</span>}
                            {type === 'pressMud' && <span>🏭</span>}
                            {type === 'biofertilizers' && <span>🦠</span>}
                            {type === 'bioFertilizer' && <span>🦠</span>}
                            {type.replace(/([A-Z])/g, ' $1').trim()}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{recommendation}</p>
                          <div className="text-xs text-green-600 dark:text-green-400">
                            Cost: ₹{type === 'fym' ? '3,000-4,000' : type === 'vermicompost' ? '8,000-10,000' : '2,000-3,000'}/hectare
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Soil Amendments */}
                <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                      <Settings className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      Soil Amendment Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {soilResults.recommendations.filter(rec => rec.category === 'Soil Amendment').map((rec, index) => (
                        <div key={index} className="p-4 rounded-lg border bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">{rec.title}</h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <strong className="text-gray-900 dark:text-gray-100">Action:</strong>
                              <p className="text-gray-600 dark:text-gray-400">{rec.action}</p>
                            </div>
                            <div>
                              <strong className="text-gray-900 dark:text-gray-100">When:</strong>
                              <p className="text-gray-600 dark:text-gray-400">{rec.timing}</p>
                            </div>
                            <div>
                              <strong className="text-green-700 dark:text-green-300">Organic Option:</strong>
                              <p className="text-green-600 dark:text-green-400">{rec.organic}</p>
                            </div>
                            <div className="text-xs text-purple-600 dark:text-purple-400">
                              Estimated Cost: ₹{rec.cost.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Long-term Soil Health */}
                <Card className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20 border-blue-200 dark:border-blue-700 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                      <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      Long-term Soil Health Strategy
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                          🔄 Crop Rotation
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Rotate {soilResults.selectedCrop.name} with legumes (pulses) to naturally fix nitrogen and break pest cycles.
                        </p>
                      </div>
                      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                          🍂 Cover Crops
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Plant green manure crops during fallow periods to maintain soil health and add organic matter.
                        </p>
                      </div>
                      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                          📊 Regular Testing
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Test soil every 6 months to monitor changes and adjust fertilizer applications accordingly.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SoilHealth;
