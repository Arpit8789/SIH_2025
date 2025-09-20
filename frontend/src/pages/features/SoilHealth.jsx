// src/pages/features/SoilHealth.jsx - COMPLETE ADVANCED SOIL HEALTH & NPK CALCULATOR
import React, { useState, useEffect } from 'react';
import { 
  Beaker, 
  Camera, 
  Upload, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Droplets,
  Leaf,
  Mountain,
  Activity,
  MapPin,
  Calendar,
  RefreshCw,
  Download,
  Calculator,
  DollarSign,
  Target,
  Zap,
  Sun,
  Moon,
  BarChart3,
  PieChart,
  LineChart,
  Settings,
  Info,
  ArrowRight,
  ChevronRight,
  Eye,
  Microscope,
  FlaskConical,
  Sprout,
  TreePine,
  Wheat
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';

// ✅ CUSTOM COMPONENTS TO REPLACE MISSING IMPORTS
const Label = ({ children, className = "", ...props }) => (
  <label className={`text-sm font-medium text-gray-700 dark:text-gray-300 ${className}`} {...props}>
    {children}
  </label>
);

const Slider = ({ value, onValueChange, max, step, className = "" }) => (
  <div className="w-full">
    <input
      type="range"
      min="0"
      max={max}
      step={step}
      value={value[0]}
      onChange={(e) => onValueChange([Number(e.target.value)])}
      className={`w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer ${className}`}
      style={{
        background: `linear-gradient(to right, #10b981 0%, #10b981 ${(value[0] / max) * 100}%, #e5e7eb ${(value[0] / max) * 100}%, #e5e7eb 100%)`
      }}
    />
    <style jsx>{`
      input[type="range"]::-webkit-slider-thumb {
        appearance: none;
        height: 20px;
        width: 20px;
        background: #10b981;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      input[type="range"]::-moz-range-thumb {
        height: 20px;
        width: 20px;
        background: #10b981;
        border-radius: 50%;
        cursor: pointer;
        border: none;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
    `}</style>
  </div>
);

const Switch = ({ checked, onCheckedChange, className = "" }) => (
  <button
    onClick={() => onCheckedChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
      checked ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'
    } ${className}`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);

const SoilHealth = () => {
  const [soilTestResults, setSoilTestResults] = useState(null);
  const [npkValues, setNpkValues] = useState({ nitrogen: 45, phosphorus: 18, potassium: 280 });
  const [soilProperties, setSoilProperties] = useState({ ph: 6.8, moisture: 65, organicMatter: 2.8, texture: 'clay-loam' });
  const [selectedCrop, setSelectedCrop] = useState('wheat');
  const [farmArea, setFarmArea] = useState(1);
  const [preferOrganic, setPreferOrganic] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('analysis');

  const { user } = useAuth();

  // Mock comprehensive soil data
  const mockSoilData = {
    overallScore: 78,
    nutrients: [
      { name: 'Nitrogen (N)', value: 45, unit: 'kg/ha', level: 'medium', optimal: '40-60', current: 45 },
      { name: 'Phosphorus (P)', value: 18, unit: 'kg/ha', level: 'low', optimal: '25-35', current: 18 },
      { name: 'Potassium (K)', value: 280, unit: 'kg/ha', level: 'high', optimal: '150-250', current: 280 },
      { name: 'Sulfur (S)', value: 12, unit: 'kg/ha', level: 'medium', optimal: '10-20', current: 12 },
      { name: 'Calcium (Ca)', value: 1200, unit: 'mg/kg', level: 'high', optimal: '800-1500', current: 1200 },
      { name: 'Magnesium (Mg)', value: 150, unit: 'mg/kg', level: 'medium', optimal: '120-200', current: 150 }
    ],
    micronutrients: [
      { name: 'Iron (Fe)', value: 45, unit: 'ppm', level: 'good', status: 'adequate' },
      { name: 'Zinc (Zn)', value: 0.8, unit: 'ppm', level: 'low', status: 'deficient' },
      { name: 'Manganese (Mn)', value: 15, unit: 'ppm', level: 'good', status: 'adequate' },
      { name: 'Boron (B)', value: 0.6, unit: 'ppm', level: 'medium', status: 'marginal' }
    ],
    properties: {
      ph: 6.8,
      moisture: 65,
      organicMatter: 2.8,
      texture: 'Clay Loam',
      electricalConductivity: 0.45,
      cationExchangeCapacity: 18.5,
      bulkDensity: 1.35,
      porosity: 48
    },
    recommendations: [
      {
        title: "Phosphorus Deficiency Critical",
        description: "Apply 25-30 kg/ha of P₂O₅ immediately using DAP or Single Super Phosphate",
        priority: "high",
        urgency: "immediate"
      },
      {
        title: "Soil pH Management",
        description: "pH is slightly acidic. Apply agricultural lime @ 200-300 kg/ha to raise pH to 7.0-7.2",
        priority: "medium",
        urgency: "next_season"
      },
      {
        title: "Organic Matter Enhancement",
        description: "Add well-decomposed FYM or compost @ 5-8 tons/ha to improve soil structure",
        priority: "medium",
        urgency: "ongoing"
      },
      {
        title: "Zinc Deficiency Treatment",
        description: "Apply zinc sulfate @ 25 kg/ha or foliar spray of 0.5% ZnSO₄ solution",
        priority: "high",
        urgency: "before_planting"
      }
    ]
  };

  const cropDatabase = {
    wheat: { name: 'Wheat', icon: '🌾', n: 120, p: 60, k: 40, season: 'Rabi' },
    rice: { name: 'Rice', icon: '🌾', n: 150, p: 75, k: 75, season: 'Kharif' },
    corn: { name: 'Corn', icon: '🌽', n: 180, p: 80, k: 60, season: 'Kharif' },
    cotton: { name: 'Cotton', icon: '🌿', n: 120, p: 60, k: 60, season: 'Kharif' },
    potato: { name: 'Potato', icon: '🥔', n: 180, p: 80, k: 100, season: 'Rabi' },
    tomato: { name: 'Tomato', icon: '🍅', n: 200, p: 100, k: 150, season: 'Both' },
    sugarcane: { name: 'Sugarcane', icon: '🎋', n: 300, p: 150, k: 150, season: 'Annual' },
    mustard: { name: 'Mustard', icon: '🌻', n: 60, p: 40, k: 20, season: 'Rabi' }
  };

  const fertilizerDatabase = {
    organic: {
      urea: { name: 'Organic Compost', n: 0.5, p: 0.3, k: 0.5, price: 8, unit: 'kg' },
      dap: { name: 'Vermicompost', n: 1.5, p: 1.0, k: 1.0, price: 15, unit: 'kg' },
      mop: { name: 'Neem Cake', n: 2.5, p: 1.0, k: 1.5, price: 25, unit: 'kg' },
      complex: { name: 'Bone Meal', n: 3.0, p: 15.0, k: 0.5, price: 35, unit: 'kg' },
      fym: { name: 'Farm Yard Manure', n: 0.5, p: 0.2, k: 0.5, price: 5, unit: 'kg' }
    },
    chemical: {
      urea: { name: 'Urea (46% N)', n: 46, p: 0, k: 0, price: 6, unit: 'kg' },
      dap: { name: 'DAP (18-46-0)', n: 18, p: 46, k: 0, price: 24, unit: 'kg' },
      mop: { name: 'MOP (0-0-60)', n: 0, p: 0, k: 60, price: 18, unit: 'kg' },
      complex: { name: 'NPK 10-26-26', n: 10, p: 26, k: 26, price: 22, unit: 'kg' },
      ssp: { name: 'Single Super Phosphate', n: 0, p: 16, k: 0, price: 12, unit: 'kg' }
    }
  };

  useEffect(() => {
    // Simulate loading soil data
    setIsAnalyzing(true);
    setTimeout(() => {
      setSoilTestResults(mockSoilData);
      setIsAnalyzing(false);
    }, 2000);
  }, []);

  const calculateFertilizerRequirement = () => {
    const crop = cropDatabase[selectedCrop];
    if (!crop) return null;

    const currentN = npkValues.nitrogen || mockSoilData.nutrients[0].value;
    const currentP = npkValues.phosphorus || mockSoilData.nutrients[1].value;
    const currentK = npkValues.potassium || mockSoilData.nutrients[2].value;

    const requiredN = Math.max(0, crop.n - currentN);
    const requiredP = Math.max(0, crop.p - currentP);
    const requiredK = Math.max(0, crop.k - currentK);

    const fertilizerType = preferOrganic ? 'organic' : 'chemical';
    const fertilizers = fertilizerDatabase[fertilizerType];

    // Calculate fertilizer quantities
    const ureaNeeded = requiredN / (fertilizers.urea.n / 100) * farmArea;
    const dapNeeded = requiredP / (fertilizers.dap.p / 100) * farmArea;
    const mopNeeded = requiredK / (fertilizers.mop.k / 100) * farmArea;

    const totalCost = (ureaNeeded * fertilizers.urea.price) + 
                     (dapNeeded * fertilizers.dap.price) + 
                     (mopNeeded * fertilizers.mop.price);

    const expectedYieldIncrease = Math.min(35, (requiredN + requiredP + requiredK) / 8);
    const currentYield = getCropYield(selectedCrop) * farmArea; // tons
    const improvedYield = currentYield * (1 + expectedYieldIncrease / 100);
    const additionalRevenue = (improvedYield - currentYield) * getCropPrice(selectedCrop);

    return {
      required: { n: requiredN, p: requiredP, k: requiredK },
      fertilizers: {
        urea: { quantity: Math.ceil(ureaNeeded), cost: ureaNeeded * fertilizers.urea.price, name: fertilizers.urea.name },
        dap: { quantity: Math.ceil(dapNeeded), cost: dapNeeded * fertilizers.dap.price, name: fertilizers.dap.name },
        mop: { quantity: Math.ceil(mopNeeded), cost: mopNeeded * fertilizers.mop.price, name: fertilizers.mop.name }
      },
      economics: {
        totalCost,
        expectedIncrease: expectedYieldIncrease,
        additionalRevenue,
        roi: totalCost > 0 ? ((additionalRevenue - totalCost) / totalCost * 100).toFixed(1) : 0,
        paybackPeriod: additionalRevenue > 0 ? (totalCost / (additionalRevenue / 12)).toFixed(1) : 0, // months
        currentYield,
        improvedYield
      }
    };
  };

  const getCropYield = (crop) => {
    const yields = {
      wheat: 3.8, rice: 4.2, corn: 5.5, cotton: 2.8, potato: 22.0, tomato: 45.0, sugarcane: 75.0, mustard: 1.8
    };
    return yields[crop] || 3.5;
  };

  const getCropPrice = (crop) => {
    const prices = {
      wheat: 23000, rice: 25000, corn: 18000, cotton: 55000, potato: 12000, tomato: 15000, sugarcane: 3200, mustard: 45000
    };
    return prices[crop] || 20000;
  };

  const getHealthScore = (score) => {
    if (score >= 85) return { label: 'Excellent', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100', icon: '🟢', bgColor: 'bg-green-50 dark:bg-green-900/20' };
    if (score >= 70) return { label: 'Good', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100', icon: '🔵', bgColor: 'bg-blue-50 dark:bg-blue-900/20' };
    if (score >= 55) return { label: 'Moderate', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100', icon: '🟡', bgColor: 'bg-yellow-50 dark:bg-yellow-900/20' };
    return { label: 'Poor', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100', icon: '🔴', bgColor: 'bg-red-50 dark:bg-red-900/20' };
  };

  const getNutrientStatus = (level) => {
    const statusMap = {
      high: { icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-700' },
      medium: { icon: Activity, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-700' },
      low: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-700' },
      good: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-700' }
    };
    return statusMap[level] || statusMap.medium;
  };

  const formatCurrency = (amount) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${Math.round(amount)}`;
  };

  const fertilizerCalc = calculateFertilizerRequirement();

  if (isAnalyzing) {
    return (
      <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'dark' : ''} bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900`}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full mb-6">
              <Beaker className="h-10 w-10 text-green-600 dark:text-green-400 animate-pulse" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">🧪 Analyzing Soil Sample</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Running comprehensive soil health analysis...</p>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
              <span>Processing NPK levels, pH, micronutrients...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'dark' : ''} bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900`}>
      <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              🧪 Advanced Soil Health & NPK Calculator
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
              Scientific soil analysis with fertilizer optimization and cost-benefit analysis
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDarkMode(!darkMode)}
              className="p-2"
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Badge className="px-3 py-1 bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-100">
              🤖 AI Powered
            </Badge>
          </div>
        </div>

        {/* Quick Stats Overview */}
        {soilTestResults && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className={`${getHealthScore(soilTestResults.overallScore).bgColor} border-green-200 dark:border-green-700`}>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {soilTestResults.overallScore}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Soil Health Score</div>
              </CardContent>
            </Card>
            
            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {soilTestResults.properties.ph}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">pH Level</div>
              </CardContent>
            </Card>
            
            <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {soilTestResults.properties.organicMatter}%
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Organic Matter</div>
              </CardContent>
            </Card>
            
            <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {cropDatabase[selectedCrop].icon}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Selected Crop</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <TabsTrigger value="analysis" className="text-gray-700 dark:text-gray-300 data-[state=active]:bg-green-100 dark:data-[state=active]:bg-green-900 data-[state=active]:text-green-700 dark:data-[state=active]:text-green-300">
              🧪 Analysis
            </TabsTrigger>
            <TabsTrigger value="calculator" className="text-gray-700 dark:text-gray-300 data-[state=active]:bg-green-100 dark:data-[state=active]:bg-green-900 data-[state=active]:text-green-700 dark:data-[state=active]:text-green-300">
              🧮 NPK Calculator
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="text-gray-700 dark:text-gray-300 data-[state=active]:bg-green-100 dark:data-[state=active]:bg-green-900 data-[state=active]:text-green-700 dark:data-[state=active]:text-green-300">
              💡 Recommendations
            </TabsTrigger>
            <TabsTrigger value="economics" className="text-gray-700 dark:text-gray-300 data-[state=active]:bg-green-100 dark:data-[state=active]:bg-green-900 data-[state=active]:text-green-700 dark:data-[state=active]:text-green-300">
              💰 Economics
            </TabsTrigger>
          </TabsList>

          {/* Soil Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Analysis */}
              <div className="lg:col-span-2 space-y-6">
                {/* Overall Health Score */}
                {soilTestResults && (
                  <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border-green-200 dark:border-green-700">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                        <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
                        Overall Soil Health Assessment
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <div className="text-5xl font-bold text-green-600 dark:text-green-400 flex items-center gap-3">
                            {getHealthScore(soilTestResults.overallScore).icon}
                            {soilTestResults.overallScore}/100
                          </div>
                          <Badge className={getHealthScore(soilTestResults.overallScore).color}>
                            {getHealthScore(soilTestResults.overallScore).label} Soil Health
                          </Badge>
                        </div>
                        <div className="text-right">
                          <PieChart className="h-16 w-16 text-green-500 mb-2" />
                          <p className="text-sm text-gray-600 dark:text-gray-400">Comprehensive Analysis</p>
                        </div>
                      </div>
                      <Progress value={soilTestResults.overallScore} className="h-4 mb-4" />
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Fertility Status</p>
                          <p className="font-bold text-green-600 dark:text-green-400">Good</p>
                        </div>
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Soil Structure</p>
                          <p className="font-bold text-blue-600 dark:text-blue-400">Excellent</p>
                        </div>
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Biology Index</p>
                          <p className="font-bold text-purple-600 dark:text-purple-400">Good</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Major Nutrients */}
                {soilTestResults && (
                  <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                        <Beaker className="h-5 w-5 text-green-600 dark:text-green-400" />
                        Major Nutrient Analysis (NPK + Secondary)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {soilTestResults.nutrients.map((nutrient, index) => {
                          const status = getNutrientStatus(nutrient.level);
                          return (
                            <div key={index} className={`p-4 rounded-lg border ${status.bg} ${status.border} hover:shadow-lg transition-all duration-200`}>
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{nutrient.name}</h4>
                                <status.icon className={`h-4 w-4 ${status.color}`} />
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex justify-between items-end">
                                  <span className="text-xl font-bold text-gray-900 dark:text-gray-100">{nutrient.value}</span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">{nutrient.unit}</span>
                                </div>
                                
                                <div className="space-y-1">
                                  <div className="flex justify-between text-xs">
                                    <span className="text-gray-600 dark:text-gray-400">Optimal Range</span>
                                    <span className="font-medium text-green-600 dark:text-green-400">{nutrient.optimal}</span>
                                  </div>
                                </div>
                                
                                <Badge variant={nutrient.level === 'high' ? 'default' : nutrient.level === 'medium' ? 'secondary' : 'destructive'} 
                                       className={`text-xs ${nutrient.level === 'high' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : ''}`}>
                                  {nutrient.level.charAt(0).toUpperCase() + nutrient.level.slice(1)} Level
                                </Badge>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Soil Properties */}
                {soilTestResults && (
                  <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                        <Microscope className="h-5 w-5 text-green-600 dark:text-green-400" />
                        Physical & Chemical Properties
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                          <div className="flex items-center gap-2 mb-2">
                            <Droplets className="h-4 w-4 text-blue-500" />
                            <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">pH Level</span>
                          </div>
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{soilTestResults.properties.ph}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {soilTestResults.properties.ph < 6.5 ? 'Acidic' : 
                             soilTestResults.properties.ph > 7.5 ? 'Alkaline' : 'Neutral'}
                          </div>
                        </div>

                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                          <div className="flex items-center gap-2 mb-2">
                            <Droplets className="h-4 w-4 text-green-500" />
                            <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">Moisture</span>
                          </div>
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{soilTestResults.properties.moisture}%</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Optimal Range</div>
                        </div>

                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
                          <div className="flex items-center gap-2 mb-2">
                            <Leaf className="h-4 w-4 text-yellow-500" />
                            <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">Organic Matter</span>
                          </div>
                          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{soilTestResults.properties.organicMatter}%</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Moderate Level</div>
                        </div>

                        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                          <div className="flex items-center gap-2 mb-2">
                            <Mountain className="h-4 w-4 text-purple-500" />
                            <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">Texture</span>
                          </div>
                          <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{soilTestResults.properties.texture}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Good Structure</div>
                        </div>
                      </div>

                      {/* Advanced Properties */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Electrical Conductivity</span>
                            <span className="font-bold text-gray-900 dark:text-gray-100">{soilTestResults.properties.electricalConductivity} dS/m</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">CEC (Nutrient Holding)</span>
                            <span className="font-bold text-gray-900 dark:text-gray-100">{soilTestResults.properties.cationExchangeCapacity} cmol/kg</span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Bulk Density</span>
                            <span className="font-bold text-gray-900 dark:text-gray-100">{soilTestResults.properties.bulkDensity} g/cm³</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Porosity</span>
                            <span className="font-bold text-gray-900 dark:text-gray-100">{soilTestResults.properties.porosity}%</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-base text-gray-900 dark:text-gray-100">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start hover:bg-green-50 dark:hover:bg-green-900/20">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Lab Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start hover:bg-blue-50 dark:hover:bg-blue-900/20">
                      <Camera className="mr-2 h-4 w-4" />
                      Take Soil Photo
                    </Button>
                    <Button variant="outline" className="w-full justify-start hover:bg-purple-50 dark:hover:bg-purple-900/20">
                      <MapPin className="mr-2 h-4 w-4" />
                      Find Testing Labs
                    </Button>
                    <Button variant="outline" className="w-full justify-start hover:bg-orange-50 dark:hover:bg-orange-900/20">
                      <Download className="mr-2 h-4 w-4" />
                      Download Report
                    </Button>
                  </CardContent>
                </Card>

                {/* Micronutrients */}
                {soilTestResults && (
                  <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-base text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <FlaskConical className="h-4 w-4 text-green-600 dark:text-green-400" />
                        Micronutrient Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {soilTestResults.micronutrients.map((nutrient, index) => (
                        <div key={index} className="p-3 border rounded-lg hover:shadow-sm transition-shadow">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-sm text-gray-900 dark:text-gray-100">{nutrient.name}</span>
                            <Badge variant={nutrient.level === 'good' ? 'default' : nutrient.level === 'medium' ? 'secondary' : 'destructive'} 
                                   className={`text-xs ${nutrient.level === 'good' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : ''}`}>
                              {nutrient.status}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-gray-900 dark:text-gray-100">{nutrient.value}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{nutrient.unit}</span>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Soil Health Tips */}
                <Card className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border-green-200 dark:border-green-700">
                  <CardHeader>
                    <CardTitle className="text-base text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <Leaf className="h-4 w-4 text-green-600 dark:text-green-400" />
                      Soil Health Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <p className="text-gray-700 dark:text-gray-300">Regular soil testing every 2-3 years helps maintain optimal fertility</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <p className="text-gray-700 dark:text-gray-300">Crop rotation improves soil structure and prevents nutrient depletion</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                      <p className="text-gray-700 dark:text-gray-300">Organic matter addition enhances water retention and microbial activity</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* NPK Calculator Tab */}
          <TabsContent value="calculator" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Input Section */}
              <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                    <Calculator className="h-5 w-5 text-green-600 dark:text-green-400" />
                    NPK Calculator Input Parameters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Crop Selection */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Select Target Crop</Label>
                    <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(cropDatabase).map(([key, crop]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <span>{crop.icon}</span>
                              <span>{crop.name}</span>
                              <Badge variant="outline" className="text-xs">{crop.season}</Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Required: N-{cropDatabase[selectedCrop].n}, P-{cropDatabase[selectedCrop].p}, K-{cropDatabase[selectedCrop].k} kg/ha
                    </p>
                  </div>

                  {/* Farm Area */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Farm Area (acres)</Label>
                    <Input 
                      type="number" 
                      value={farmArea} 
                      onChange={(e) => setFarmArea(Number(e.target.value))}
                      className="mt-2"
                      min="0.1"
                      step="0.1"
                      placeholder="Enter area in acres"
                    />
                  </div>

                  {/* Current NPK Values */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">Current Soil NPK Levels (kg/ha)</h4>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Label className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                          Nitrogen (N)
                        </Label>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                          {npkValues.nitrogen} kg/ha
                        </span>
                      </div>
                      <Slider
                        value={[npkValues.nitrogen]}
                        onValueChange={(value) => setNpkValues(prev => ({ ...prev, nitrogen: value[0] }))}
                        max={200}
                        step={5}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span>0</span>
                        <span>Optimal: 40-60</span>
                        <span>200</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Label className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
                          Phosphorus (P)
                        </Label>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded">
                          {npkValues.phosphorus} kg/ha
                        </span>
                      </div>
                      <Slider
                        value={[npkValues.phosphorus]}
                        onValueChange={(value) => setNpkValues(prev => ({ ...prev, phosphorus: value[0] }))}
                        max={100}
                        step={2}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span>0</span>
                        <span>Optimal: 25-35</span>
                        <span>100</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Label className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                          Potassium (K)
                        </Label>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded">
                          {npkValues.potassium} kg/ha
                        </span>
                      </div>
                      <Slider
                        value={[npkValues.potassium]}
                        onValueChange={(value) => setNpkValues(prev => ({ ...prev, potassium: value[0] }))}
                        max={400}
                        step={10}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span>0</span>
                        <span>Optimal: 150-250</span>
                        <span>400</span>
                      </div>
                    </div>
                  </div>

                  {/* Fertilizer Preference */}
                  <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                    <div>
                      <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">Prefer Organic Fertilizers</Label>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Sustainable but higher cost & slower release</p>
                    </div>
                    <Switch checked={preferOrganic} onCheckedChange={setPreferOrganic} />
                  </div>
                </CardContent>
              </Card>

              {/* Results Section */}
              {fertilizerCalc && (
                <Card className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border-green-200 dark:border-green-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                      <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
                      Fertilizer Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Nutrient Gap Analysis */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{fertilizerCalc.required.n}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">N Deficit (kg/ha)</div>
                      </div>
                      <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border">
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{fertilizerCalc.required.p}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">P Deficit (kg/ha)</div>
                      </div>
                      <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{fertilizerCalc.required.k}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">K Deficit (kg/ha)</div>
                      </div>
                    </div>

                    {/* Fertilizer Quantities */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        {preferOrganic ? '🌱 Organic' : '⚗️ Chemical'} Fertilizer Requirements
                      </h4>
                      {Object.entries(fertilizerCalc.fertilizers).map(([key, fertilizer]) => (
                        fertilizer.quantity > 0 && (
                          <div key={key} className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg border">
                            <div>
                              <span className="font-medium text-gray-900 dark:text-gray-100">{fertilizer.name}</span>
                              <p className="text-xs text-gray-600 dark:text-gray-400">{fertilizer.quantity} kg needed for {farmArea} acre(s)</p>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-green-600 dark:text-green-400">{formatCurrency(fertilizer.cost)}</div>
                            </div>
                          </div>
                        )
                      ))}
                    </div>

                    {/* Total Investment */}
                    <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-lg border border-green-300 dark:border-green-600">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-green-800 dark:text-green-300">Total Fertilizer Investment</span>
                        <span className="text-xl font-bold text-green-700 dark:text-green-400">{formatCurrency(fertilizerCalc.economics.totalCost)}</span>
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-400">
                        Expected yield increase: +{fertilizerCalc.economics.expectedIncrease}%
                      </div>
                    </div>

                    {/* Yield Projection */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
                        <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                          {fertilizerCalc.economics.currentYield.toFixed(1)} tons
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Current Expected Yield</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                        <div className="text-lg font-bold text-green-600 dark:text-green-400">
                          {fertilizerCalc.economics.improvedYield.toFixed(1)} tons
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Improved Expected Yield</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Scientific Recommendations */}
              <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                    <Zap className="h-5 w-5 text-green-600 dark:text-green-400" />
                    Expert Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {soilTestResults?.recommendations?.map((rec, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${
                      rec.priority === 'high' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700' :
                      rec.priority === 'medium' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700' :
                      'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        {rec.priority === 'high' ? <AlertTriangle className="h-4 w-4 text-red-500" /> :
                         rec.priority === 'medium' ? <Info className="h-4 w-4 text-yellow-500" /> :
                         <CheckCircle className="h-4 w-4 text-green-500" />}
                        <span className={`font-semibold text-sm ${
                          rec.priority === 'high' ? 'text-red-800 dark:text-red-300' :
                          rec.priority === 'medium' ? 'text-yellow-800 dark:text-yellow-300' :
                          'text-green-800 dark:text-green-300'
                        }`}>
                          {rec.priority === 'high' ? 'Critical Priority' : 
                           rec.priority === 'medium' ? 'High Priority' : 'Maintenance'}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {rec.urgency?.replace('_', ' ')}
                        </Badge>
                      </div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">{rec.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{rec.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Seasonal Management */}
              <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                    <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
                    Seasonal Management Plan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Wheat className="h-4 w-4 text-orange-500" />
                      <span className="font-semibold text-gray-900 dark:text-gray-100">Rabi Season (Nov-Apr)</span>
                    </div>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• <strong>Basal dose:</strong> Apply DAP 125 kg/ha + MOP 50 kg/ha at sowing</li>
                      <li>• <strong>First top-dressing:</strong> Urea 65 kg/ha at 21 days after sowing</li>
                      <li>• <strong>Second top-dressing:</strong> Urea 65 kg/ha at flowering stage</li>
                    </ul>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TreePine className="h-4 w-4 text-green-500" />
                      <span className="font-semibold text-gray-900 dark:text-gray-100">Kharif Season (Jun-Oct)</span>
                    </div>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• <strong>Pre-monsoon:</strong> Apply FYM/compost 5 tons/ha</li>
                      <li>• <strong>Sowing time:</strong> Complex fertilizer NPK 150 kg/ha</li>
                      <li>• <strong>Tillering stage:</strong> Urea 100 kg/ha for nitrogen boost</li>
                    </ul>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Sprout className="h-4 w-4 text-blue-500" />
                      <span className="font-semibold text-gray-900 dark:text-gray-100">Summer Management</span>
                    </div>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• <strong>Soil preparation:</strong> Deep plowing for better aeration</li>
                      <li>• <strong>Organic matter:</strong> Green manure crops (Sesbania/Dhaincha)</li>
                      <li>• <strong>Moisture conservation:</strong> Mulching and cover crops</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Economics Tab */}
          <TabsContent value="economics" className="space-y-6">
            {fertilizerCalc && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Investment Analysis */}
                <Card className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20 border-blue-200 dark:border-blue-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                      <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                      Investment & Returns Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border">
                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(fertilizerCalc.economics.totalCost)}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Total Investment</div>
                        <div className="text-xs text-gray-500 dark:text-gray-500">({formatCurrency(fertilizerCalc.economics.totalCost / farmArea)}/acre)</div>
                      </div>
                      <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(fertilizerCalc.economics.additionalRevenue)}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Expected Returns</div>
                        <div className="text-xs text-gray-500 dark:text-gray-500">({formatCurrency(fertilizerCalc.economics.additionalRevenue / farmArea)}/acre)</div>
                      </div>
                    </div>

                    <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-lg border border-green-300 dark:border-green-600">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-green-800 dark:text-green-300">Return on Investment (ROI)</span>
                        <span className="text-2xl font-bold text-green-700 dark:text-green-400">{fertilizerCalc.economics.roi}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-green-700 dark:text-green-400">Payback Period</span>
                        <span className="font-medium text-green-700 dark:text-green-400">{fertilizerCalc.economics.paybackPeriod} months</span>
                      </div>
                    </div>

                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                        <span className="font-semibold text-yellow-800 dark:text-yellow-300">Yield Improvement</span>
                      </div>
                      <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">+{fertilizerCalc.economics.expectedIncrease}%</div>
                      <p className="text-xs text-yellow-600 dark:text-yellow-400">
                        {fertilizerCalc.economics.currentYield.toFixed(1)}t → {fertilizerCalc.economics.improvedYield.toFixed(1)}t per {farmArea} acre(s)
                      </p>
                    </div>

                    {/* Break-even Analysis */}
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                      <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">Break-even Analysis</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Break-even yield increase:</span>
                          <span className="font-bold text-purple-600 dark:text-purple-400">
                            {((fertilizerCalc.economics.totalCost / getCropPrice(selectedCrop)) / farmArea).toFixed(2)} tons
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Profit margin:</span>
                          <span className="font-bold text-green-600 dark:text-green-400">
                            {formatCurrency(fertilizerCalc.economics.additionalRevenue - fertilizerCalc.economics.totalCost)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Comparison: Organic vs Chemical */}
                <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                      <BarChart3 className="h-5 w-5 text-green-600 dark:text-green-400" />
                      Organic vs Chemical Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                        <h4 className="font-semibold text-green-800 dark:text-green-300 mb-3 flex items-center gap-2">
                          🌱 Organic Fertilizers
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Initial Cost:</span>
                            <span className="font-bold text-red-600 dark:text-red-400">Higher (2-3x)</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Nutrient Release:</span>
                            <span className="font-bold text-yellow-600 dark:text-yellow-400">Slow & Sustained</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Soil Health:</span>
                            <span className="font-bold text-green-600 dark:text-green-400">Excellent</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Environment:</span>
                            <span className="font-bold text-green-600 dark:text-green-400">Eco-friendly</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Long-term ROI:</span>
                            <span className="font-bold text-green-600 dark:text-green-400">Very High</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                        <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
                          ⚗️ Chemical Fertilizers
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Initial Cost:</span>
                            <span className="font-bold text-green-600 dark:text-green-400">Lower</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Nutrient Release:</span>
                            <span className="font-bold text-green-600 dark:text-green-400">Fast & Immediate</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Soil Health:</span>
                            <span className="font-bold text-yellow-600 dark:text-yellow-400">Neutral/Decline</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Environment:</span>
                            <span className="font-bold text-orange-600 dark:text-orange-400">Concerns</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Long-term ROI:</span>
                            <span className="font-bold text-yellow-600 dark:text-yellow-400">Moderate</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expert Recommendation */}
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                      <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-2 flex items-center gap-2">
                        💡 Expert Integrated Approach
                      </h4>
                      <p className="text-sm text-purple-700 dark:text-purple-300 mb-3">
                        For optimal results and sustainability, use a **hybrid approach**:
                      </p>
                      <ul className="text-sm text-purple-600 dark:text-purple-400 space-y-1">
                        <li>• <strong>Base application:</strong> 60% organic (compost/FYM) for soil health</li>
                        <li>• <strong>Quick response:</strong> 40% chemical for immediate nutrient needs</li>
                        <li>• <strong>Micronutrients:</strong> Foliar spray for targeted deficiencies</li>
                        <li>• <strong>Long-term goal:</strong> Transition to 80% organic over 3-5 years</li>
                      </ul>
                    </div>

                    {/* Long-term Benefits (3-5 years) */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">Long-term Impact (3-5 years)</h4>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                          <div className="text-lg font-bold text-green-600 dark:text-green-400">+25%</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Yield Stability</div>
                        </div>
                        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">+30%</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Soil Health Score</div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                          <div className="text-lg font-bold text-purple-600 dark:text-purple-400">-40%</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Input Dependency</div>
                        </div>
                      </div>
                    </div>

                    {/* Sustainability Score */}
                    <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded-lg border border-green-200 dark:border-green-700">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900 dark:text-gray-100">Sustainability Score</span>
                        <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {preferOrganic ? '85/100' : '65/100'}
                        </span>
                      </div>
                      <Progress value={preferOrganic ? 85 : 65} className="h-2 mb-2" />
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {preferOrganic ? 
                          'Excellent choice for long-term soil health and environmental sustainability' :
                          'Good for immediate results, consider adding organic components'
                        }
                      </p>
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
