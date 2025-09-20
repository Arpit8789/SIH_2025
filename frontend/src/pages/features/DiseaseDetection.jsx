// src/pages/features/DiseaseDetection.jsx - ENHANCED AI DISEASE DETECTION - PUNJAB FOCUSED
import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  Scan, 
  AlertTriangle, 
  CheckCircle,
  Lightbulb,
  Calendar,
  MapPin,
  Thermometer,
  Droplets,
  Bug,
  Leaf,
  RefreshCw,
  Sun,
  Moon,
  Target,
  Zap,
  Activity,
  TrendingUp,
  Eye,
  Shield,
  Microscope,
  FlaskConical,
  Heart,
  BarChart3,
  Info,
  ChevronRight,
  Download,
  Share2,
  Bookmark,
  ImageIcon,
  X
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';

// Enhanced ImageUploader component with working file input
const ImageUploader = ({ onImageUpload, maxFiles = 3, maxSizeInMB = 10, placeholder, preview = true }) => {
  const [images, setImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (files) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.slice(0, maxFiles).filter(file => {
      const sizeInMB = file.size / (1024 * 1024);
      return sizeInMB <= maxSizeInMB && file.type.startsWith('image/');
    });

    const newImages = validFiles.map(file => ({
      file,
      url: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9),
      name: file.name
    }));
    
    setImages(newImages);
    onImageUpload(newImages);
  };

  const removeImage = (imageId) => {
    const newImages = images.filter(img => img.id !== imageId);
    // Revoke URL to prevent memory leaks
    const imageToRemove = images.find(img => img.id === imageId);
    if (imageToRemove) {
      URL.revokeObjectURL(imageToRemove.url);
    }
    setImages(newImages);
    onImageUpload(newImages);
  };

  return (
    <div className="space-y-6">
      {/* Large Upload Area */}
      <div
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 cursor-pointer ${
          isDragging 
            ? 'border-green-500 bg-green-50 dark:bg-green-950/20 scale-105' 
            : 'border-gray-300 dark:border-gray-600 hover:border-green-400 hover:bg-green-50/50 dark:hover:bg-green-950/10'
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFileSelect(e.dataTransfer.files);
        }}
        onClick={() => document.getElementById('file-upload').click()}
      >
        <div className="space-y-4">
          <div className="relative">
            <Camera className="h-20 w-20 mx-auto text-green-500 mb-4" />
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center animate-bounce">
              <Zap className="h-4 w-4 text-white" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
              {placeholder || 'Upload Crop Images for AI Analysis'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Drag & drop your crop images here, or click to browse
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <ImageIcon className="h-4 w-4" />
              <span>Supports: JPG, PNG, WebP • Max {maxFiles} images • {maxSizeInMB}MB each</span>
            </div>
          </div>
          <Button variant="outline" className="mt-4" size="lg">
            <Upload className="w-5 h-5 mr-2" />
            Choose Images
          </Button>
        </div>
      </div>
      
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
        id="file-upload"
      />
      
      {/* Image Previews */}
      {images.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100">
            Uploaded Images ({images.length}/{maxFiles})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((image) => (
              <div key={image.id} className="relative group">
                <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                  <img 
                    src={image.url} 
                    alt={`Upload ${image.name}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(image.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-all duration-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{image.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const DiseaseDetection = () => {
  const [uploadedImages, setUploadedImages] = useState([]);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('detection');

  const { user } = useAuth();

  // Punjab-specific disease data with realistic names
  const mockAnalysisResult = {
    primaryDetection: {
      diseaseName: 'Brown Leaf Spot (Tikka Disease)',
      scientificName: 'Alternaria alternata',
      confidence: 92,
      severity: 'High',
      affectedArea: 28,
      cropType: 'Wheat (Kanak)',
      symptoms: [
        'Small brown spots with yellow halos on leaf surface',
        'Spots gradually enlarge and merge together',
        'Leaves turn yellow and dry up from edges',
        'Dark brown lesions on leaf sheaths'
      ],
      causes: 'Fungal infection caused by Alternaria alternata. Thrives in warm, humid conditions (25-30°C with 80-90% humidity). Spreads through wind-borne spores and rain splash.',
      riskFactors: [
        'High humidity after rain',
        'Dense crop canopy',
        'Nitrogen deficiency',
        'Poor air circulation',
        'Previous crop residues'
      ]
    },
    alternativeDetections: [
      { diseaseName: 'Yellow Rust (Peeli Kirmi)', confidence: 78, severity: 'Medium' },
      { diseaseName: 'Powdery Mildew (Safed Phaphoond)', confidence: 65, severity: 'Low' },
      { diseaseName: 'Leaf Blight (Patta Jhulsa)', confidence: 52, severity: 'Low' }
    ],
    recommendations: {
      immediate: [
        {
          title: 'Fungicide Spray (तत्काल छिड़काव)',
          description: 'Apply Mancozeb 75% WP @ 2g/liter or Propiconazole 25% EC @ 1ml/liter immediately',
          dosage: '500-600 liters per hectare, repeat after 15 days',
          urgency: 'Critical',
          effectiveness: 88
        },
        {
          title: 'Remove Infected Plant Parts',
          description: 'Cut and destroy severely infected leaves and stems to prevent spore spread',
          dosage: 'Manual removal, burn infected material',
          urgency: 'Immediate',
          effectiveness: 85
        },
        {
          title: 'Improve Drainage',
          description: 'Create proper water channels to avoid waterlogging in fields',
          dosage: 'Clear field drainage within 24 hours',
          urgency: 'Within 24 hours',
          effectiveness: 75
        }
      ],
      preventive: [
        {
          title: 'Resistant Wheat Varieties',
          description: 'Plant disease-resistant varieties like PBW-725, DBW-187, or WH-1105 for next season',
          effectiveness: 90,
          cost: 'Low'
        },
        {
          title: 'Crop Rotation',
          description: 'Rotate with non-cereal crops like mustard, gram, or sugarcane for 1-2 seasons',
          effectiveness: 80,
          cost: 'Low'
        },
        {
          title: 'Balanced Nutrition',
          description: 'Apply balanced NPK fertilizer with adequate potash and micronutrients',
          effectiveness: 70,
          cost: 'Medium'
        },
        {
          title: 'Field Sanitation',
          description: 'Remove crop residues and weeds that harbor fungal spores',
          effectiveness: 75,
          cost: 'Low'
        }
      ],
      organic: [
        {
          title: 'Neem Oil Spray',
          description: 'Natural fungicide effective against early infection stages',
          preparation: 'Mix 5ml neem oil + 1ml liquid soap per liter of water',
          frequency: 'Spray every 10 days in evening',
          effectiveness: 65
        },
        {
          title: 'Turmeric-Garlic Solution',
          description: 'Traditional Punjabi remedy with antifungal properties',
          preparation: 'Boil 50g turmeric + 100g garlic in 1 liter water, strain and dilute 1:10',
          frequency: 'Spray twice weekly',
          effectiveness: 55
        },
        {
          title: 'Cow Urine Treatment',
          description: 'Natural immune booster commonly used in Punjab',
          preparation: 'Mix 1 liter fresh cow urine with 10 liters water',
          frequency: 'Spray weekly as preventive measure',
          effectiveness: 50
        },
        {
          title: 'Baking Soda Solution',
          description: 'Changes leaf surface pH to prevent fungal growth',
          preparation: 'Mix 1 teaspoon baking soda + 0.5ml soap per liter water',
          frequency: 'Spray every 15 days',
          effectiveness: 60
        }
      ]
    },
    environmentalFactors: {
      temperature: 26,
      humidity: 82,
      rainfall: 'Moderate (12mm in last week)',
      diseaseRisk: 'High',
      forecast: 'Favorable conditions for fungal diseases due to high humidity'
    },
    economicImpact: {
      potentialLoss: '25-40% yield loss if untreated',
      treatmentCost: '₹1,800-2,500 per acre',
      expectedSavings: '₹8,000-15,000 per acre',
      roi: '400-500%'
    }
  };

  // Punjab-specific recent analyses
  const recentAnalyses = [
    {
      id: 1,
      diseaseName: 'Yellow Rust (Peeli Kirmi)',
      cropType: 'Wheat (Kanak)',
      confidence: 94,
      severity: 'High',
      date: '2025-09-18',
      status: 'Treated',
      thumbnail: '🌾'
    },
    {
      id: 2,
      diseaseName: 'Pink Bollworm',
      cropType: 'Cotton (Kapas)',
      confidence: 89,
      severity: 'High',
      date: '2025-09-15',
      status: 'Active',
      thumbnail: '🌿'
    },
    {
      id: 3,
      diseaseName: 'Downy Mildew',
      cropType: 'Mustard (Sarson)',
      confidence: 85,
      severity: 'Medium',
      date: '2025-09-12',
      status: 'Recovered',
      thumbnail: '🌻'
    },
    {
      id: 4,
      diseaseName: 'Red Rot Disease',
      cropType: 'Sugarcane (Ganna)',
      confidence: 91,
      severity: 'High',
      date: '2025-09-10',
      status: 'Active',
      thumbnail: '🎋'
    },
    {
      id: 5,
      diseaseName: 'Bacterial Blight',
      cropType: 'Rice (Dhan)',
      confidence: 87,
      severity: 'Medium',
      date: '2025-09-08',
      status: 'Treated',
      thumbnail: '🌾'
    }
  ];

  // Punjab-specific common diseases
  const commonDiseases = [
    {
      name: 'Yellow Rust (Peeli Kirmi)',
      cropTypes: ['Wheat', 'Barley', 'Oats'],
      prevalence: 'Very High',
      season: 'Rabi (Winter)',
      symptoms: 'Yellow powdery stripes on leaves, reduced grain filling',
      severity: 'Critical',
      icon: '🌾',
      localName: 'Peeli Kirmi'
    },
    {
      name: 'Pink Bollworm',
      cropTypes: ['Cotton'],
      prevalence: 'High',
      season: 'Kharif (Monsoon)',
      symptoms: 'Pink caterpillars inside cotton bolls, damaged seeds',
      severity: 'High',
      icon: '🌿',
      localName: 'Gulabi Sundi'
    },
    {
      name: 'Late Blight (Jhulsa Rog)',
      cropTypes: ['Potato', 'Tomato'],
      prevalence: 'High',
      season: 'Winter-Spring',
      symptoms: 'Dark water-soaked spots with white fungal growth',
      severity: 'Critical',
      icon: '🥔',
      localName: 'Jhulsa Rog'
    },
    {
      name: 'Downy Mildew',
      cropTypes: ['Mustard', 'Cauliflower', 'Cabbage'],
      prevalence: 'Medium',
      season: 'Rabi (Winter)',
      symptoms: 'White downy growth on leaf undersides, yellowing',
      severity: 'Medium',
      icon: '🌻',
      localName: 'Safed Phaphundh'
    },
    {
      name: 'Brown Plant Hopper',
      cropTypes: ['Rice', 'Wheat'],
      prevalence: 'High',
      season: 'Kharif (Monsoon)',
      symptoms: 'Yellowing and drying of plants, hopperburn symptoms',
      severity: 'High',
      icon: '🌾',
      localName: 'Bhura Phudka'
    },
    {
      name: 'Red Rot Disease',
      cropTypes: ['Sugarcane'],
      prevalence: 'Medium',
      season: 'Year Round',
      symptoms: 'Red discoloration of internodes, foul smell',
      severity: 'High',
      icon: '🎋',
      localName: 'Lal Sadak Rog'
    },
    {
      name: 'Aphid Infestation',
      cropTypes: ['Mustard', 'Potato', 'Peas'],
      prevalence: 'Very High',
      season: 'Rabi (Winter)',
      symptoms: 'Small green insects on leaves, sticky honeydew',
      severity: 'Medium',
      icon: '🐛',
      localName: 'Chepsa/Mahat'
    },
    {
      name: 'Stem Borer',
      cropTypes: ['Rice', 'Sugarcane', 'Maize'],
      prevalence: 'High',
      season: 'Kharif (Monsoon)',
      symptoms: 'Dead heart in young plants, white ear heads',
      severity: 'High',
      icon: '🌾',
      localName: 'Tana Bhedhak'
    }
  ];

  const weatherFactors = {
    temperature: 24,
    humidity: 75,
    rainfall: 8, // mm in last 24h
    windSpeed: 12,
    diseaseRisk: 'Medium',
    conditions: 'Partly cloudy with high humidity',
    forecast: 'Moderate risk conditions for next 3 days'
  };

  const diseaseStats = {
    totalDetected: 2247,
    accuracy: 93.8,
    cropsSaved: 15420,
    farmersHelped: 3890
  };

  useEffect(() => {
    // Auto-populate with sample result for demonstration
    setTimeout(() => {
      setAnalysisResult(mockAnalysisResult);
    }, 1500);
  }, []);

  const handleImageUpload = (images) => {
    setUploadedImages(images);
    setAnalysisResult(null);
  };

  const analyzeImages = async () => {
    if (uploadedImages.length === 0) return;

    setIsAnalyzing(true);
    setAnalysisProgress(0);

    // Simulate progressive analysis
    const steps = [
      { progress: 20, message: 'प्रसंस्करण छवियों...' },
      { progress: 45, message: 'AI रोग पहचान मॉडल चल रहा है...' },
      { progress: 65, message: 'पौधों के लक्षणों का विश्लेषण...' },
      { progress: 85, message: 'रोग डेटाबेस से मिलान...' },
      { progress: 100, message: 'रिपोर्ट तैयार करना...' }
    ];

    for (let step of steps) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAnalysisProgress(step.progress);
    }

    // Set Punjab-specific result
    setAnalysisResult(mockAnalysisResult);
    setIsAnalyzing(false);
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
      case 'high':
        return 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700';
      case 'moderate':
      case 'medium':
        return 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700';
      case 'low':
      case 'mild':
        return 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700';
      default:
        return 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return 'text-green-600 dark:text-green-400';
    if (confidence >= 75) return 'text-blue-600 dark:text-blue-400';
    if (confidence >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'treated': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'active': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      case 'recovered': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'dark' : ''} bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900`}>
      <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              🔬 AI-Powered Crop Disease Detection
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
              Advanced CNN-based disease identification for Punjab crops with instant treatment recommendations
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

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/30 border-blue-200 dark:border-blue-700">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{diseaseStats.totalDetected}</div>
              <div className="text-xs text-blue-700 dark:text-blue-300">Diseases Detected</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/30 border-green-200 dark:border-green-700">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{diseaseStats.accuracy}%</div>
              <div className="text-xs text-green-700 dark:text-green-300">AI Accuracy</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/30 border-purple-200 dark:border-purple-700">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{diseaseStats.cropsSaved}</div>
              <div className="text-xs text-purple-700 dark:text-purple-300">Crops Saved</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/30 border-orange-200 dark:border-orange-700">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{diseaseStats.farmersHelped}</div>
              <div className="text-xs text-orange-700 dark:text-orange-300">Punjab Farmers</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <TabsTrigger value="detection" className="text-gray-700 dark:text-gray-300 data-[state=active]:bg-green-100 dark:data-[state=active]:bg-green-900 data-[state=active]:text-green-700 dark:data-[state=active]:text-green-300">
              🔬 Detection
            </TabsTrigger>
            <TabsTrigger value="history" className="text-gray-700 dark:text-gray-300 data-[state=active]:bg-green-100 dark:data-[state=active]:bg-green-900 data-[state=active]:text-green-700 dark:data-[state=active]:text-green-300">
              📊 History
            </TabsTrigger>
            <TabsTrigger value="database" className="text-gray-700 dark:text-gray-300 data-[state=active]:bg-green-100 dark:data-[state=active]:bg-green-900 data-[state=active]:text-green-700 dark:data-[state=active]:text-green-300">
              🗂️ Disease Database
            </TabsTrigger>
          </TabsList>

          {/* Disease Detection Tab */}
          <TabsContent value="detection" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Image Upload & Analysis */}
              <div className="lg:col-span-2 space-y-6">
                {/* Upload Section */}
                <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                      <Camera className="h-5 w-5 text-green-600 dark:text-green-400" />
                      Upload Crop Images for AI Disease Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ImageUploader
                      onImageUpload={handleImageUpload}
                      maxFiles={3}
                      maxSizeInMB={10}
                      placeholder="Upload clear images of affected crop parts (leaves, stems, fruits)"
                      preview={true}
                    />
                    
                    {uploadedImages.length > 0 && (
                      <div className="mt-8 text-center">
                        <Button 
                          onClick={analyzeImages}
                          disabled={isAnalyzing}
                          className="px-10 py-3 bg-green-600 hover:bg-green-700 text-white text-lg"
                          size="lg"
                        >
                          {isAnalyzing ? (
                            <>
                              <Scan className="mr-3 h-6 w-6 animate-spin" />
                              Analyzing Images...
                            </>
                          ) : (
                            <>
                              <Scan className="mr-3 h-6 w-6" />
                              Start AI Disease Analysis
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Analysis Progress */}
                {isAnalyzing && (
                  <Card className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20 border-blue-200 dark:border-blue-700">
                    <CardContent className="p-8">
                      <div className="text-center space-y-6">
                        <div className="relative">
                          <div className="animate-pulse">
                            <Microscope className="h-20 w-20 mx-auto text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="absolute -top-2 -right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                            <Zap className="h-5 w-5 text-white" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
                            AI Disease Detection in Progress
                          </h3>
                          <Progress value={analysisProgress} className="w-full h-4 mb-3" />
                          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                            {analysisProgress}% Complete
                          </p>
                        </div>
                        <div className="grid grid-cols-3 gap-6 text-sm">
                          <div className={`p-4 rounded-lg ${analysisProgress > 30 ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                            <FlaskConical className="h-6 w-6 mx-auto mb-2" />
                            CNN Processing
                          </div>
                          <div className={`p-4 rounded-lg ${analysisProgress > 60 ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                            <Eye className="h-6 w-6 mx-auto mb-2" />
                            Pattern Recognition
                          </div>
                          <div className={`p-4 rounded-lg ${analysisProgress > 90 ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                            <Target className="h-6 w-6 mx-auto mb-2" />
                            Report Generation
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Analysis Results */}
                {analysisResult && (
                  <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-green-200 dark:border-green-700 shadow-lg">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          AI Disease Analysis Results
                        </CardTitle>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            PDF Report
                          </Button>
                          <Button variant="outline" size="sm">
                            <Share2 className="h-4 w-4 mr-1" />
                            Share
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-8">
                      {/* Primary Detection */}
                      <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded-xl p-8 border border-green-200 dark:border-green-700">
                        <div className="flex items-start justify-between mb-6">
                          <div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                              {analysisResult.primaryDetection.diseaseName}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 italic mb-3">
                              {analysisResult.primaryDetection.scientificName}
                            </p>
                            <div className="flex items-center gap-3 mt-3">
                              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 px-3 py-1">
                                🌾 {analysisResult.primaryDetection.cropType}
                              </Badge>
                              <Badge className={`px-3 py-1 ${getSeverityColor(analysisResult.primaryDetection.severity)}`}>
                                ⚠️ {analysisResult.primaryDetection.severity} Risk
                              </Badge>
                            </div>
                          </div>
                          <div className="text-center">
                            <div className={`text-5xl font-bold ${getConfidenceColor(analysisResult.primaryDetection.confidence)} mb-2`}>
                              {analysisResult.primaryDetection.confidence}%
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">AI Confidence</p>
                            <div className="mt-3">
                              <Progress value={analysisResult.primaryDetection.confidence} className="w-24 h-3" />
                            </div>
                          </div>
                        </div>

                        {/* Key Metrics */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl border border-red-200 dark:border-red-700">
                            <AlertTriangle className="h-8 w-8 mx-auto text-red-500 mb-3" />
                            <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-1">
                              {analysisResult.primaryDetection.affectedArea}%
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Area Affected</p>
                          </div>
                          
                          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl border border-orange-200 dark:border-orange-700">
                            <Activity className="h-8 w-8 mx-auto text-orange-500 mb-3" />
                            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                              {analysisResult.environmentalFactors.diseaseRisk}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Risk Level</p>
                          </div>
                          
                          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl border border-green-200 dark:border-green-700">
                            <TrendingUp className="h-8 w-8 mx-auto text-green-500 mb-3" />
                            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                              {analysisResult.economicImpact.roi}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Treatment ROI</p>
                          </div>
                        </div>

                        {/* Symptoms & Risk Factors */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2 text-lg">
                              <Eye className="h-5 w-5 text-blue-500" />
                              Identified Symptoms
                            </h4>
                            <ul className="space-y-3">
                              {analysisResult.primaryDetection.symptoms.map((symptom, index) => (
                                <li key={index} className="flex items-start gap-3 text-sm">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                  <span className="text-gray-700 dark:text-gray-300 leading-relaxed">{symptom}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2 text-lg">
                              <Shield className="h-5 w-5 text-red-500" />
                              Risk Factors
                            </h4>
                            <ul className="space-y-3">
                              {analysisResult.primaryDetection.riskFactors.map((factor, index) => (
                                <li key={index} className="flex items-start gap-3 text-sm">
                                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                                  <span className="text-gray-700 dark:text-gray-300 leading-relaxed">{factor}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Pathogen Information */}
                        <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
                          <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2 text-lg">
                            🦠 Disease Information
                          </h4>
                          <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                            {analysisResult.primaryDetection.causes}
                          </p>
                        </div>
                      </div>

                      {/* Treatment Recommendations */}
                      <div className="bg-green-50 dark:bg-green-950/20 rounded-xl p-8 border border-green-200 dark:border-green-700">
                        <h4 className="font-semibold text-green-800 dark:text-green-400 mb-6 flex items-center gap-2 text-xl">
                          💡 Treatment Recommendations (इलाज की सिफारिशें)
                        </h4>
                        
                        <Tabs defaultValue="immediate" className="space-y-6">
                          <TabsList className="grid w-full grid-cols-3 bg-white dark:bg-gray-800">
                            <TabsTrigger value="immediate" className="text-red-600 data-[state=active]:bg-red-100 dark:data-[state=active]:bg-red-900">
                              🚨 तत्काल उपचार
                            </TabsTrigger>
                            <TabsTrigger value="preventive" className="text-blue-600 data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900">
                              🛡️ रोकथाम
                            </TabsTrigger>
                            <TabsTrigger value="organic" className="text-green-600 data-[state=active]:bg-green-100 dark:data-[state=active]:bg-green-900">
                              🌱 जैविक उपचार
                            </TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="immediate" className="space-y-4">
                            {analysisResult.recommendations.immediate.map((rec, index) => (
                              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-red-200 dark:border-red-700 hover:shadow-md transition-shadow">
                                <div className="flex items-start gap-4">
                                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 font-bold text-lg flex-shrink-0">
                                    {index + 1}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between mb-3">
                                      <h5 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">{rec.title}</h5>
                                      <Badge variant="outline" className="text-xs text-red-600 border-red-300">
                                        {rec.urgency}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">{rec.description}</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                        <span className="text-gray-500 dark:text-gray-400">Dosage:</span>
                                        <span className="font-medium text-gray-900 dark:text-gray-100 ml-2 block mt-1">{rec.dosage}</span>
                                      </div>
                                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                        <span className="text-gray-500 dark:text-gray-400">Effectiveness:</span>
                                        <span className="font-medium text-green-600 dark:text-green-400 ml-2">{rec.effectiveness}%</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </TabsContent>
                          
                          <TabsContent value="preventive" className="space-y-4">
                            {analysisResult.recommendations.preventive.map((rec, index) => (
                              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-blue-200 dark:border-blue-700 hover:shadow-md transition-shadow">
                                <div className="flex items-start gap-4">
                                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-lg flex-shrink-0">
                                    {index + 1}
                                  </div>
                                  <div className="flex-1">
                                    <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 text-lg">{rec.title}</h5>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">{rec.description}</p>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                        <span className="text-gray-500 dark:text-gray-400">Effectiveness:</span>
                                        <span className="font-medium text-green-600 dark:text-green-400 ml-2">{rec.effectiveness}%</span>
                                      </div>
                                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                        <span className="text-gray-500 dark:text-gray-400">Cost:</span>
                                        <span className="font-medium text-blue-600 dark:text-blue-400 ml-2">{rec.cost}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </TabsContent>
                          
                          <TabsContent value="organic" className="space-y-4">
                            {analysisResult.recommendations.organic.map((rec, index) => (
                              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-green-200 dark:border-green-700 hover:shadow-md transition-shadow">
                                <div className="flex items-start gap-4">
                                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 font-bold text-lg flex-shrink-0">
                                    {index + 1}
                                  </div>
                                  <div className="flex-1">
                                    <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 text-lg">{rec.title}</h5>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">{rec.description}</p>
                                    <div className="space-y-3 text-sm">
                                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                        <span className="text-gray-500 dark:text-gray-400">Preparation:</span>
                                        <span className="font-medium text-gray-900 dark:text-gray-100 ml-2 block mt-1">{rec.preparation}</span>
                                      </div>
                                      <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                          <span className="text-gray-500 dark:text-gray-400">Frequency:</span>
                                          <span className="font-medium text-blue-600 dark:text-blue-400 ml-2 block mt-1">{rec.frequency}</span>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                          <span className="text-gray-500 dark:text-gray-400">Effectiveness:</span>
                                          <span className="font-medium text-green-600 dark:text-green-400 ml-2">{rec.effectiveness}%</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </TabsContent>
                        </Tabs>
                      </div>

                      {/* Economic Impact */}
                      <div className="bg-purple-50 dark:bg-purple-950/20 rounded-xl p-8 border border-purple-200 dark:border-purple-700">
                        <h4 className="font-semibold text-purple-800 dark:text-purple-400 mb-6 flex items-center gap-2 text-xl">
                          💰 Economic Impact Analysis
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border">
                            <div className="text-xl font-bold text-red-600 dark:text-red-400 mb-1">25-40%</div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Potential Loss</p>
                          </div>
                          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border">
                            <div className="text-xl font-bold text-orange-600 dark:text-orange-400 mb-1">₹1,800-2,500</div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Treatment Cost</p>
                          </div>
                          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border">
                            <div className="text-xl font-bold text-green-600 dark:text-green-400 mb-1">₹8,000-15,000</div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Expected Savings</p>
                          </div>
                          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border">
                            <div className="text-xl font-bold text-purple-600 dark:text-purple-400 mb-1">{analysisResult.economicImpact.roi}</div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">ROI</p>
                          </div>
                        </div>
                      </div>

                      {/* Alternative Detections */}
                      {analysisResult.alternativeDetections && (
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2 text-lg">
                            <BarChart3 className="h-5 w-5 text-blue-500" />
                            Other Possible Diseases (अन्य संभावित रोग)
                          </h4>
                          <div className="space-y-3">
                            {analysisResult.alternativeDetections.map((detection, index) => (
                              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-400 font-bold">
                                    {index + 2}
                                  </div>
                                  <div>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">{detection.diseaseName}</span>
                                    <div className="flex items-center gap-3 mt-2">
                                      <Badge variant="outline" className="text-xs">
                                        {detection.confidence}% confidence
                                      </Badge>
                                      <Badge variant="outline" className="text-xs">
                                        {detection.severity} severity
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                                  View Details
                                  <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Environmental Conditions */}
                <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-base text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <Thermometer className="h-4 w-4 text-green-600 dark:text-green-400" />
                      Environmental Conditions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                        <Thermometer className="h-5 w-5 mx-auto text-blue-500 mb-1" />
                        <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{weatherFactors.temperature}°C</div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Temperature</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                        <Droplets className="h-5 w-5 mx-auto text-green-500 mb-1" />
                        <div className="text-lg font-bold text-green-600 dark:text-green-400">{weatherFactors.humidity}%</div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Humidity</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Recent Rainfall:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{weatherFactors.rainfall}mm</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Wind Speed:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{weatherFactors.windSpeed} km/h</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Disease Risk:</span>
                        <Badge className={`${
                          weatherFactors.diseaseRisk === 'High' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' :
                          weatherFactors.diseaseRisk === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' :
                          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                        }`}>
                          {weatherFactors.diseaseRisk}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Photography Tips */}
                <Card className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20 border-blue-200 dark:border-blue-700">
                  <CardHeader>
                    <CardTitle className="text-base text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-green-600 dark:text-green-400" />
                      Photography Tips (फोटो लेने के टिप्स)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-gray-700 dark:text-gray-300"><strong>Clear focus:</strong> Take close-up photos of affected leaves, stems, or fruits</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-gray-700 dark:text-gray-300"><strong>Good lighting:</strong> Use natural sunlight, avoid shadows and dark areas</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-gray-700 dark:text-gray-300"><strong>Multiple angles:</strong> Include both close-up and wider shots</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-gray-700 dark:text-gray-300"><strong>Clean background:</strong> Remove debris and focus on diseased area</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-gray-100">Recent Disease Analyses in Punjab</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentAnalyses.map((analysis) => (
                        <div key={analysis.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-4">
                            <div className="text-3xl">{analysis.thumbnail}</div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{analysis.diseaseName}</h3>
                                <Badge className={getSeverityColor(analysis.severity)}>
                                  {analysis.severity}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{analysis.cropType} • {analysis.date}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className={`font-bold ${getConfidenceColor(analysis.confidence)}`}>
                                {analysis.confidence}%
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Confidence</p>
                            </div>
                            <Badge className={getStatusColor(analysis.status)}>
                              {analysis.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border-green-200 dark:border-green-700">
                  <CardContent className="p-4 text-center">
                    <BarChart3 className="h-8 w-8 mx-auto text-green-600 dark:text-green-400 mb-2" />
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">93.8%</div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Punjab Accuracy</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-700">
                  <CardContent className="p-4 text-center">
                    <Target className="h-8 w-8 mx-auto text-purple-600 dark:text-purple-400 mb-2" />
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">127</div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Diseases This Month</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Disease Database Tab */}
          <TabsContent value="database" className="space-y-6">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Common Crop Diseases in Punjab (पंजाब में आम फसल रोग)
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Learn about the most prevalent diseases affecting crops in Punjab agriculture
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {commonDiseases.map((disease, index) => (
                <Card key={index} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="text-3xl">{disease.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{disease.name}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 italic">({disease.localName})</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={getSeverityColor(disease.severity)}>
                            {disease.severity}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {disease.prevalence}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Season: </span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{disease.season}</span>
                      </div>
                      
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Affects: </span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {disease.cropTypes.join(', ')}
                        </span>
                      </div>
                      
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Symptoms: </span>
                        <p className="text-gray-700 dark:text-gray-300 mt-1 text-xs leading-relaxed">
                          {disease.symptoms}
                        </p>
                      </div>
                    </div>

                    <Button variant="outline" className="w-full mt-4" size="sm">
                      <Info className="h-4 w-4 mr-2" />
                      Learn More
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DiseaseDetection;
