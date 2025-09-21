// src/pages/features/SaveYourHarvest.jsx - FOOD DONATION TO NGOs
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Heart, 
  Thermometer, 
  Calendar, 
  IndianRupee,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  FileText,
  Camera,
  Calculator,
  TrendingUp,
  Users,
  Building,
  Warehouse,
  Leaf,
  CloudRain,
  Sun,
  Zap,
  Star,
  ArrowRight,
  Download,
  Upload,
  Eye,
  Plus,
  ExternalLink,
  Award,
  Handshake,
  Mail,
  Globe,
  HeartHandshake,
  Truck,
  Package,
  Scale,
  Gift,
  UserCheck,
  MapPinIcon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/context/ThemeContext';

const SaveYourHarvest = () => {
  const [activeTab, setActiveTab] = useState('insurance');
  const [selectedCrop, setSelectedCrop] = useState('wheat');
  const [insuranceCompanies, setInsuranceCompanies] = useState([]);
  const [storageOptions, setStorageOptions] = useState([]);
  const [mohaliNGOs, setMohaliNGOs] = useState([]);
  const [donationRequest, setDonationRequest] = useState({
    cropType: '',
    quantity: '',
    location: '',
    contactNumber: ''
  });
  const { currentLanguage } = useLanguage();
  const { user } = useAuth();
  const { isDark } = useTheme();

  useEffect(() => {
    loadInsuranceCompanies();
    loadStorageOptions();
    loadMohaliNGOs();
  }, [selectedCrop]);

  // ✅ REAL INSURANCE COMPANIES (SAME AS BEFORE)
  const loadInsuranceCompanies = () => {
    const companies = [
      {
        id: 1,
        name: 'ICICI Lombard Crop Insurance',
        type: 'Private',
        logo: '🏢',
        website: 'https://www.icicilombard.com/rural-insurance',
        rating: 4.8,
        premiumRate: '2.5%',
        coverage: '100%',
        claimTime: '7 दिन',
        color: 'blue',
        features: [
          currentLanguage === 'hi' ? 'प्राकृतिक आपदा कवर' : 'Natural Disaster Cover',
          currentLanguage === 'hi' ? 'कीट-रोग सुरक्षा' : 'Pest & Disease Protection',
          currentLanguage === 'hi' ? 'मोबाइल ऐप सुविधा' : 'Mobile App Support',
          currentLanguage === 'hi' ? '24/7 हेल्पलाइन' : '24/7 Helpline'
        ]
      },
      {
        id: 2,
        name: 'HDFC ERGO Crop Shield',
        type: 'Private',
        logo: '🏦',
        website: 'https://www.hdfcergo.com/rural-insurance/crop-insurance',
        rating: 4.7,
        premiumRate: '2.8%',
        coverage: '100%',
        claimTime: '5 दिन',
        color: 'green',
        features: [
          currentLanguage === 'hi' ? 'AI-आधारित क्लेम' : 'AI-Based Claims',
          currentLanguage === 'hi' ? 'ड्रोन सर्वे सुविधा' : 'Drone Survey Service',
          currentLanguage === 'hi' ? 'ऑनलाइन पॉलिसी' : 'Online Policy Purchase',
          currentLanguage === 'hi' ? 'तुरंत अप्रूवल' : 'Instant Approval'
        ]
      },
      {
        id: 3,
        name: 'Bajaj Allianz Fasal Bima',
        type: 'Private',
        logo: '🚗',
        website: 'https://www.bajajallianz.com/crop-insurance.html',
        rating: 4.6,
        premiumRate: '3.0%',
        coverage: '100%',
        claimTime: '10 दिन',
        color: 'purple',
        features: [
          currentLanguage === 'hi' ? 'व्यापक कवरेज' : 'Comprehensive Coverage',
          currentLanguage === 'hi' ? 'कम प्रीमियम दर' : 'Low Premium Rate',
          currentLanguage === 'hi' ? 'आसान दस्तावेज़' : 'Easy Documentation',
          currentLanguage === 'hi' ? 'गांव-स्तर सेवा' : 'Village-Level Service'
        ]
      },
      {
        id: 4,
        name: 'प्रधानमंत्री फसल बीमा योजना (PMFBY)',
        type: 'Government',
        logo: '🇮🇳',
        website: 'https://pmfby.gov.in/',
        rating: 4.9,
        premiumRate: '1.5%',
        coverage: '100%',
        claimTime: '15 दिन',
        color: 'orange',
        features: [
          currentLanguage === 'hi' ? 'सबसे कम प्रीमियम' : 'Lowest Premium Rate',
          currentLanguage === 'hi' ? 'सरकारी गारंटी' : 'Government Guarantee',
          currentLanguage === 'hi' ? 'सभी फसलों के लिए' : 'All Crops Covered',
          currentLanguage === 'hi' ? 'किसान अनुकूल' : 'Farmer Friendly'
        ]
      }
    ];
    setInsuranceCompanies(companies);
  };

  const loadStorageOptions = () => {
    const options = [
      {
        id: 1,
        name: currentLanguage === 'hi' ? 'वेयरहाउस स्टोरेज' : 'Warehouse Storage',
        type: 'warehouse',
        capacity: '100 टन',
        temperature: '15-20°C',
        humidity: '60-65%',
        cost: '₹50/क्विंटल/माह',
        location: 'लुधियाना, पंजाब',
        rating: 4.8,
        features: ['Climate Controlled', 'Pest Protection', 'Insurance Coverage', '24/7 Monitoring']
      },
      {
        id: 2,
        name: currentLanguage === 'hi' ? 'कोल्ड स्टोरेज' : 'Cold Storage',
        type: 'cold',
        capacity: '50 टन',
        temperature: '2-4°C',
        humidity: '85-90%',
        cost: '₹80/क्विंटल/माह',
        location: 'अमृतसर, पंजाب',
        rating: 4.9,
        features: ['Ultra Fresh', 'Extended Shelf Life', 'Quality Preservation', 'Export Ready']
      },
      {
        id: 3,
        name: currentLanguage === 'hi' ? 'साइलो स्टोरेज' : 'Silo Storage',
        type: 'silo',
        capacity: '200 टन',
        temperature: 'Ambient',
        humidity: '12-14%',
        cost: '₹35/क्विंटल/माह',
        location: 'जालंधर, पंजाब',
        rating: 4.7,
        features: ['Bulk Storage', 'Automated Handling', 'Quality Testing', 'Direct Loading']
      }
    ];
    setStorageOptions(options);
  };

  // ✅ MOHALI NGOs FOR FOOD DONATION
  const loadMohaliNGOs = () => {
    const ngos = [
      {
        id: 1,
        name: 'Feeding India - Mohali Chapter',
        type: 'Food Distribution NGO',
        location: 'Sector 70, Mohali',
        distance: '2.3 km',
        phone: '+91-98765-12345',
        email: 'mohali@feedingindia.org',
        website: 'https://www.feedingindia.org',
        acceptedItems: [
          currentLanguage === 'hi' ? 'ताजी सब्जियां' : 'Fresh Vegetables',
          currentLanguage === 'hi' ? 'अनाज व दालें' : 'Grains & Pulses',
          currentLanguage === 'hi' ? 'फल व फ्रूट्स' : 'Fresh Fruits',
          currentLanguage === 'hi' ? 'डेयरी उत्पाद' : 'Dairy Products'
        ],
        beneficiaries: '500+ दैनिक',
        workingHours: '24/7 Collection',
        rating: 4.9,
        color: 'green',
        icon: '🍽️',
        speciality: currentLanguage === 'hi' ? 'भूखे लोगों को खाना' : 'Feed the Hungry',
        pickupService: true
      },
      {
        id: 2,
        name: 'Khalsa Aid Punjab',
        type: 'Community Service NGO',
        location: 'Phase 8, Mohali',
        distance: '4.1 km',
        phone: '+91-98765-12346',
        email: 'punjab@khalsaaid.org',
        website: 'https://www.khalsaaid.org',
        acceptedItems: [
          currentLanguage === 'hi' ? 'गेहूं व चावल' : 'Wheat & Rice',
          currentLanguage === 'hi' ? 'सब्जियां' : 'Vegetables',
          currentLanguage === 'hi' ? 'दाल व मसाले' : 'Pulses & Spices',
          currentLanguage === 'hi' ? 'आटा व बेसन' : 'Flour & Gram Flour'
        ],
        beneficiaries: '1000+ दैनिक',
        workingHours: '6 AM - 10 PM',
        rating: 4.8,
        color: 'blue',
        icon: '🤲',
        speciality: currentLanguage === 'hi' ? 'गुरुद्वारा लंगर सेवा' : 'Gurudwara Langar Service',
        pickupService: true
      },
      {
        id: 3,
        name: 'Akshaya Patra Foundation - Chandigarh',
        type: 'Food Security NGO',
        location: 'Sector 65, Mohali',
        distance: '6.8 km',
        phone: '+91-98765-12347',
        email: 'chandigarh@akshayapatra.org',
        website: 'https://www.akshayapatra.org',
        acceptedItems: [
          currentLanguage === 'hi' ? 'चावल व दाल' : 'Rice & Dal',
          currentLanguage === 'hi' ? 'सब्जियां व फल' : 'Vegetables & Fruits',
          currentLanguage === 'hi' ? 'खाना पकाने का तेल' : 'Cooking Oil',
          currentLanguage === 'hi' ? 'मसाले व नमक' : 'Spices & Salt'
        ],
        beneficiaries: '2000+ बच्चे दैनिक',
        workingHours: '8 AM - 6 PM',
        rating: 4.9,
        color: 'orange',
        icon: '🎒',
        speciality: currentLanguage === 'hi' ? 'स्कूली बच्चों को भोजन' : 'School Children Meals',
        pickupService: false
      },
      {
        id: 4,
        name: 'Sarbat Da Bhala Trust',
        type: 'Social Welfare NGO',
        location: 'Sector 71, Mohali',
        distance: '3.5 km',
        phone: '+91-98765-12348',
        email: 'info@sarbatdabhala.org',
        website: 'https://www.sarbatdabhala.org',
        acceptedItems: [
          currentLanguage === 'hi' ? 'सभी प्रकार के अनाज' : 'All Types of Grains',
          currentLanguage === 'hi' ? 'ताजी सब्जियां' : 'Fresh Vegetables',
          currentLanguage === 'hi' ? 'फल व सूखे मेवे' : 'Fruits & Dry Fruits',
          currentLanguage === 'hi' ? 'पैकेज्ड फूड' : 'Packaged Food Items'
        ],
        beneficiaries: '300+ परिवार',
        workingHours: '9 AM - 8 PM',
        rating: 4.7,
        color: 'purple',
        icon: '🏠',
        speciality: currentLanguage === 'hi' ? 'जरूरतमंद परिवारों की सहायता' : 'Support Needy Families',
        pickupService: true
      },
      {
        id: 5,
        name: 'Robin Hood Army - Tricity',
        type: 'Zero Waste NGO',
        location: 'Sector 69, Mohali',
        distance: '5.2 km',
        phone: '+91-98765-12349',
        email: 'tricity@robinhoodarmy.com',
        website: 'https://www.robinhoodarmy.com',
        acceptedItems: [
          currentLanguage === 'hi' ? 'सरप्लस फूड' : 'Surplus Food',
          currentLanguage === 'hi' ? 'बल्क वेजिटेबल्स' : 'Bulk Vegetables',
          currentLanguage === 'hi' ? 'अनाज व दाल' : 'Grains & Dal',
          currentLanguage === 'hi' ? 'पैकेज्ड आइटम्स' : 'Packaged Items'
        ],
        beneficiaries: '800+ दैनिक',
        workingHours: '24/7 Emergency',
        rating: 4.8,
        color: 'red',
        icon: '🏹',
        speciality: currentLanguage === 'hi' ? 'खाना बर्बाद न होने देना' : 'Zero Food Wastage',
        pickupService: true
      }
    ];
    setMohaliNGOs(ngos);
  };

  // ✅ DOWNLOAD POLICY FUNCTION (EMPTY FILE)
  const downloadPolicy = (companyName) => {
    const element = document.createElement('a');
    const file = new Blob([`
${companyName} - Crop Insurance Policy

Policy Details:
- Company: ${companyName}
- Crop Type: ${selectedCrop}
- Coverage: 100%
- Premium Rate: As per company terms
- Generated Date: ${new Date().toLocaleDateString()}

Note: This is a sample policy document for demonstration purposes only.
Please visit the company website for actual policy details and terms.

Thank you for choosing ${companyName}!
    `], { type: 'text/plain' });
    
    element.href = URL.createObjectURL(file);
    element.download = `${companyName}-Policy-${selectedCrop}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // ✅ SUBMIT DONATION REQUEST
  const submitDonationRequest = (ngoId) => {
    const ngo = mohaliNGOs.find(n => n.id === ngoId);
    if (!ngo) return;
    
    const message = `
नमस्ते ${ngo.name},

मैं ${user?.name || 'एक किसान'} हूं और मेरे पास अतिरिक्त फसल है जो मैं दान करना चाहता हूं:

🌾 फसल का प्रकार: ${selectedCrop}
📦 मात्रा: ${donationRequest.quantity} क्विंटल
📍 स्थान: ${donationRequest.location}
📱 संपर्क: ${donationRequest.contactNumber}

कृपया मुझसे संपर्क करें ताकि हम इसे जरूरतमंद लोगों तक पहुंचा सकें।

धन्यवाद!
    `;
    
    // Open WhatsApp or email
    if (ngo.phone) {
      const whatsappUrl = `https://wa.me/${ngo.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const tabs = [
    {
      id: 'insurance',
      label: currentLanguage === 'hi' ? '🛡️ फसल बीमा' : '🛡️ Crop Insurance',
      icon: Shield
    },
    {
      id: 'storage',
      label: currentLanguage === 'hi' ? '🏢 स्टोरेज सोल्यूशन' : '🏢 Storage Solutions',
      icon: Warehouse
    },
    {
      id: 'donation',
      label: currentLanguage === 'hi' ? '🤝 फूड डोनेशन' : '🤝 Food Donation',
      icon: Heart
    }
  ];

  const cropOptions = [
    { value: 'wheat', label: currentLanguage === 'hi' ? 'गेहूं' : 'Wheat', season: 'Rabi' },
    { value: 'rice', label: currentLanguage === 'hi' ? 'धान' : 'Rice', season: 'Kharif' },
    { value: 'corn', label: currentLanguage === 'hi' ? 'मक्का' : 'Corn', season: 'Kharif' },
    { value: 'potato', label: currentLanguage === 'hi' ? 'आलू' : 'Potato', season: 'Rabi' },
    { value: 'tomato', label: currentLanguage === 'hi' ? 'टमाटर' : 'Tomato', season: 'Both' },
    { value: 'onion', label: currentLanguage === 'hi' ? 'प्याज' : 'Onion', season: 'Both' }
  ];

  const rotPreventionTips = [
    {
      icon: Thermometer,
      title: currentLanguage === 'hi' ? 'तापमान नियंत्रण' : 'Temperature Control',
      desc: currentLanguage === 'hi' ? '15-20°C बनाए रखें' : 'Maintain 15-20°C',
      color: 'blue'
    },
    {
      icon: CloudRain,
      title: currentLanguage === 'hi' ? 'नमी प्रबंधन' : 'Moisture Management',
      desc: currentLanguage === 'hi' ? '60-65% आर्द्रता' : '60-65% Humidity',
      color: 'cyan'
    },
    {
      icon: Leaf,
      title: currentLanguage === 'hi' ? 'वेंटिलेशन' : 'Ventilation',
      desc: currentLanguage === 'hi' ? 'उचित हवा प्रवाह' : 'Proper Air Flow',
      color: 'green'
    },
    {
      icon: Zap,
      title: currentLanguage === 'hi' ? 'कीट नियंत्रण' : 'Pest Control',
      desc: currentLanguage === 'hi' ? 'नियमित निरीक्षण' : 'Regular Inspection',
      color: 'orange'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50/50 to-blue-50/30 dark:from-gray-900 dark:via-green-950/20 dark:to-blue-950/10 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ✅ HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-green-700 via-emerald-600 to-blue-600 bg-clip-text text-transparent">
              {currentLanguage === 'hi' ? 'अपनी फसल बचाएं' : 'Save Your Harvest'}
            </h1>
          </div>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {currentLanguage === 'hi' 
              ? 'फसल बीमा, स्टोरेज और अतिरिक्त फसल को जरूरतमंदों तक पहुंचाने में सहायता'
              : 'Crop insurance, storage solutions, and help donate excess produce to those in need'
            }
          </p>
        </motion.div>

        {/* ✅ CROP SELECTOR */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center gap-4">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {currentLanguage === 'hi' ? 'फसल चुनें:' : 'Select Crop:'}
                </label>
                <div className="flex flex-wrap gap-2">
                  {cropOptions.map((crop) => (
                    <Button
                      key={crop.value}
                      variant={selectedCrop === crop.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCrop(crop.value)}
                      className={`${selectedCrop === crop.value 
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white' 
                        : 'border-green-300 text-green-700 hover:bg-green-50 dark:border-green-600 dark:text-green-400'
                      }`}
                    >
                      {crop.label}
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {crop.season}
                      </Badge>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ✅ TABS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[200px] h-14 text-sm sm:text-base font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg hover:shadow-xl'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-gray-700'
                }`}
              >
                <tab.icon className="w-5 h-5 mr-2" />
                {tab.label}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* ✅ INSURANCE SECTION (SAME AS BEFORE) */}
        {activeTab === 'insurance' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {insuranceCompanies.map((company, index) => (
                <motion.div
                  key={company.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                >
                  <Card className={`h-full border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br ${
                    company.type === 'Government' 
                      ? 'from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20'
                      : 'from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20'
                  }`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-${company.color}-500 to-${company.color}-600 flex items-center justify-center text-2xl shadow-lg`}>
                            {company.logo}
                          </div>
                          <div>
                            <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">
                              {company.name}
                            </CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge 
                                variant={company.type === 'Government' ? 'default' : 'secondary'}
                                className={company.type === 'Government' ? 'bg-orange-600 text-white' : 'bg-blue-600 text-white'}
                              >
                                {company.type === 'Government' ? '🏛️ सरकारी' : '🏢 प्राइवेट'}
                              </Badge>
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                  {company.rating}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div className="text-center p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                          <div className="font-semibold text-gray-900 dark:text-gray-100">
                            {company.premiumRate}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {currentLanguage === 'hi' ? 'प्रीमियम दर' : 'Premium Rate'}
                          </div>
                        </div>
                        <div className="text-center p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                          <div className="font-semibold text-gray-900 dark:text-gray-100">
                            {company.coverage}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {currentLanguage === 'hi' ? 'कवरेज' : 'Coverage'}
                          </div>
                        </div>
                        <div className="text-center p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                          <div className="font-semibold text-gray-900 dark:text-gray-100">
                            {company.claimTime}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {currentLanguage === 'hi' ? 'क्लेम समय' : 'Claim Time'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                          {currentLanguage === 'hi' ? 'मुख्य विशेषताएं:' : 'Key Features:'}
                        </h4>
                        <div className="space-y-1">
                          {company.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              <CheckCircle className={`w-4 h-4 text-${company.color}-600`} />
                              <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <Button 
                          size="sm" 
                          className={`flex-1 bg-gradient-to-r from-${company.color}-600 to-${company.color}-700 hover:from-${company.color}-700 hover:to-${company.color}-800`}
                          onClick={() => window.open(company.website, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          {currentLanguage === 'hi' ? 'अप्लाई करें' : 'Apply Now'}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => downloadPolicy(company.name)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Phone className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ✅ STORAGE SECTION (SAME AS BEFORE - ABBREVIATED) */}
        {activeTab === 'storage' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Rot Prevention Tips */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-orange-700 dark:text-orange-400">
                  <AlertTriangle className="w-6 h-6" />
                  {currentLanguage === 'hi' ? 'फसल सड़न रोकथाम तकनीक' : 'Crop Rot Prevention Techniques'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {rotPreventionTips.map((tip, index) => (
                    <div key={index} className="bg-white/60 dark:bg-gray-800/60 rounded-xl p-4 text-center">
                      <div className={`w-12 h-12 bg-gradient-to-br from-${tip.color}-500 to-${tip.color}-600 rounded-full flex items-center justify-center mx-auto mb-3`}>
                        <tip.icon className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        {tip.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {tip.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Storage Options */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {storageOptions.map((option, index) => (
                <motion.div
                  key={option.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            {option.name}
                          </CardTitle>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            📍 {option.location}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded-full">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-400">
                            {option.rating}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Warehouse className="w-4 h-4 text-blue-600" />
                          <span className="text-gray-600 dark:text-gray-300">
                            {option.capacity}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <IndianRupee className="w-4 h-4 text-green-600" />
                          <span className="font-semibold text-green-700 dark:text-green-400">
                            {option.cost}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" className="flex-1">
                          <Plus className="w-4 h-4 mr-1" />
                          {currentLanguage === 'hi' ? 'बुक करें' : 'Book Now'}
                        </Button>
                        <Button variant="outline" size="sm">
                          <Phone className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ✅ FOOD DONATION SECTION */}
        {activeTab === 'donation' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Food Donation Header */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-green-700 dark:text-green-400">
                  <Heart className="w-6 h-6" />
                  {currentLanguage === 'hi' ? 'अतिरिक्त फसल दान करें - खाना बर्बाद न करें!' : 'Donate Excess Produce - Don\'t Waste Food!'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Package className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      {currentLanguage === 'hi' ? 'अतिरिक्त फसल?' : 'Excess Produce?'}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {currentLanguage === 'hi' ? 'फसल की अधिक मात्रा को बर्बाद न करें' : 'Don\'t let surplus crops go to waste'}
                    </p>
                  </div>
                  
                  <div className="text-center p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <HeartHandshake className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      {currentLanguage === 'hi' ? 'जरूरतमंदों की सहायता' : 'Help Those in Need'}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {currentLanguage === 'hi' ? 'आपकी फसल से भूखे लोगों का पेट भर सकता है' : 'Your crops can feed hungry people'}
                    </p>
                  </div>
                  
                  <div className="text-center p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Gift className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      {currentLanguage === 'hi' ? 'पुण्य कमाएं' : 'Earn Blessings'}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {currentLanguage === 'hi' ? 'दान में दिया गया अन्न कभी व्यर्थ नहीं जाता' : 'Food given in charity never goes in vain'}
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-950/30 dark:to-red-950/30 p-4 rounded-xl border border-orange-200 dark:border-orange-800/50">
                  <p className="text-center text-gray-700 dark:text-gray-300 font-medium">
                    <span className="text-2xl mr-2">🍽️</span>
                    {currentLanguage === 'hi' 
                      ? 'हर दिन हजारों लोग भूखे सोते हैं। आपकी अतिरिक्त फसल उनके लिए आशा की किरण बन सकती है।'
                      : 'Thousands of people sleep hungry every day. Your excess produce can be a ray of hope for them.'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Donation Form */}
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Scale className="w-5 h-5 text-blue-600" />
                  {currentLanguage === 'hi' ? 'दान की जानकारी' : 'Donation Details'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {currentLanguage === 'hi' ? 'मात्रा (क्विंटल में)' : 'Quantity (in Quintals)'}
                    </label>
                    <input 
                      type="number" 
                      placeholder="10"
                      value={donationRequest.quantity}
                      onChange={(e) => setDonationRequest({...donationRequest, quantity: e.target.value})}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {currentLanguage === 'hi' ? 'आपका स्थान' : 'Your Location'}
                    </label>
                    <input 
                      type="text" 
                      placeholder="गांव/शहर का नाम"
                      value={donationRequest.location}
                      onChange={(e) => setDonationRequest({...donationRequest, location: e.target.value})}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {currentLanguage === 'hi' ? 'संपर्क नंबर' : 'Contact Number'}
                    </label>
                    <input 
                      type="tel" 
                      placeholder="+91-XXXXX-XXXXX"
                      value={donationRequest.contactNumber}
                      onChange={(e) => setDonationRequest({...donationRequest, contactNumber: e.target.value})}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mohali NGOs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {mohaliNGOs.map((ngo, index) => (
                <motion.div
                  key={ngo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                >
                  <Card className="h-full border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-${ngo.color}-500 to-${ngo.color}-600 flex items-center justify-center shadow-lg text-2xl`}>
                            {ngo.icon}
                          </div>
                          <div>
                            <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">
                              {ngo.name}
                            </CardTitle>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              📍 {ngo.location} • {ngo.distance}
                            </p>
                            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                              {ngo.speciality}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded-full">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-400">
                              {ngo.rating}
                            </span>
                          </div>
                          {ngo.pickupService && (
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                              <Truck className="w-3 h-3 mr-1" />
                              Pickup Available
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Key Stats */}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <Users className="w-4 h-4 text-blue-600" />
                          <span className="text-gray-700 dark:text-gray-300">
                            {ngo.beneficiaries}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <Clock className="w-4 h-4 text-green-600" />
                          <span className="text-gray-700 dark:text-gray-300">
                            {ngo.workingHours}
                          </span>
                        </div>
                      </div>
                      
                      {/* Accepted Items */}
                      <div className="space-y-2">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm flex items-center gap-2">
                          <Package className="w-4 h-4 text-orange-600" />
                          {currentLanguage === 'hi' ? 'स्वीकार करते हैं:' : 'Accepts:'}
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {ngo.acceptedItems.map((item, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      {/* Contact Info */}
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <Phone className="w-4 h-4 text-green-600" />
                          <a href={`tel:${ngo.phone}`} className="text-green-700 dark:text-green-400 hover:underline">
                            {ngo.phone}
                          </a>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Button 
                          size="sm" 
                          className={`flex-1 bg-gradient-to-r from-${ngo.color}-600 to-${ngo.color}-700`}
                          onClick={() => submitDonationRequest(ngo.id)}
                          disabled={!donationRequest.quantity || !donationRequest.location || !donationRequest.contactNumber}
                        >
                          <Heart className="w-4 h-4 mr-1" />
                          {currentLanguage === 'hi' ? 'दान करें' : 'Donate Now'}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(`tel:${ngo.phone}`)}
                        >
                          <Phone className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(ngo.website, '_blank')}
                        >
                          <Globe className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Impact Statistics */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-purple-700 dark:text-purple-400">
                  <TrendingUp className="w-6 h-6" />
                  {currentLanguage === 'hi' ? 'आपके दान का प्रभाव' : 'Impact of Your Donation'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    {
                      number: '1 क्विंटल',
                      description: currentLanguage === 'hi' ? '= 50 लोगों का एक दिन का भोजन' : '= One day meal for 50 people'
                    },
                    {
                      number: '5 क्विंटल',
                      description: currentLanguage === 'hi' ? '= 250 लोगों का एक दिन का भोजन' : '= One day meal for 250 people'
                    },
                    {
                      number: '10 क्विंटल',
                      description: currentLanguage === 'hi' ? '= 500 लोगों का एक दिन का भोजन' : '= One day meal for 500 people'
                    },
                    {
                      number: '20 क्विंटल',
                      description: currentLanguage === 'hi' ? '= 1000 लोगों का एक दिन का भोजन' : '= One day meal for 1000 people'
                    }
                  ].map((impact, index) => (
                    <div key={index} className="text-center p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl">
                      <div className="text-2xl font-bold text-purple-700 dark:text-purple-400 mb-2">
                        {impact.number}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {impact.description}
                      </p>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 text-center p-6 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-950/30 dark:to-pink-950/30 rounded-xl">
                  <h4 className="text-xl font-bold text-purple-800 dark:text-purple-300 mb-2">
                    {currentLanguage === 'hi' ? '🙏 "अन्नदान महादान"' : '🙏 "Food Donation is the Greatest Donation"'}
                  </h4>
                  <p className="text-purple-700 dark:text-purple-400">
                    {currentLanguage === 'hi' 
                      ? 'आपका छोटा सा योगदान किसी के जीवन में बड़ा बदलाव ला सकता है'
                      : 'Your small contribution can bring a big change in someone\'s life'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ✅ BOTTOM CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 text-white">
            <CardContent className="p-8">
              <h3 className="text-2xl sm:text-3xl font-bold mb-4">
                {currentLanguage === 'hi' 
                  ? '🌾 फसल बचाएं, भूख मिटाएं!'
                  : '🌾 Save Crops, End Hunger!'
                }
              </h3>
              <p className="text-lg mb-6 opacity-90">
                {currentLanguage === 'hi'
                  ? 'आज ही शुरू करें - अपनी फसल को सुरक्षित रखें और जरूरतमंदों की मदद करें'
                  : 'Start today - protect your harvest and help those in need'
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                <Button size="lg" className="bg-white text-green-700 hover:bg-gray-100">
                  <Shield className="w-5 h-5 mr-2" />
                  {currentLanguage === 'hi' ? 'अभी शुरू करें' : 'Start Now'}
                </Button>
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                  <Heart className="w-5 h-5 mr-2" />
                  {currentLanguage === 'hi' ? 'दान करें' : 'Donate Food'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default SaveYourHarvest;
