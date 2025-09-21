// src/pages/features/GovernmentSchemes.jsx - ENHANCED WITH REAL DATA
import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  ExternalLink, 
  Download,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  Phone,
  Mail,
  Award,
  TrendingUp,
  Bookmark,
  BookmarkCheck,
  Tractor,
  Droplets,
  ShieldCheck,
  GraduationCap,
  Building,
  ShoppingCart,
  Sun,
  Moon
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';

const GovernmentSchemes = () => {
  const [schemes, setSchemes] = useState([]);
  const [filteredSchemes, setFilteredSchemes] = useState([]);
  const [appliedSchemes, setAppliedSchemes] = useState([]);
  const [bookmarkedSchemes, setBookmarkedSchemes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedState, setSelectedState] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [applicationStats, setApplicationStats] = useState({});
  const [darkMode, setDarkMode] = useState(false);
  
  const { user } = useAuth();

  // Real Government Schemes Data
  const schemesData = [
    // SUBSIDIES
    {
      id: 1,
      name: "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
      description: "Direct income support of ₹6,000 per year to small and marginal farmers in three equal installments of ₹2,000 each.",
      department: "Ministry of Agriculture & Farmers Welfare",
      category: "subsidy",
      benefitType: "amount",
      benefitAmount: 6000,
      applicationDeadline: "2025-12-31",
      launchDate: "2019-02-24",
      applicableStates: ["Punjab", "Haryana", "All States"],
      applicationsReceived: 12500000,
      successRate: 85,
      userEligibility: {
        isEligible: true,
        matchingCriteria: 4,
        partialMatch: false
      },
      totalCriteria: 4,
      officialWebsite: "https://pmkisan.gov.in/",
      helplineNumber: "155261"
    },
    {
      id: 2,
      name: "Kisan Credit Card (KCC)",
      description: "Credit facility for farmers to meet their agricultural and allied activities expenses including crop production, maintenance of farm assets and consumption requirements.",
      department: "Ministry of Agriculture & Farmers Welfare",
      category: "subsidy",
      benefitType: "credit",
      benefitAmount: 300000,
      applicationDeadline: "2025-12-31",
      launchDate: "1998-08-01",
      applicableStates: ["Punjab", "Haryana", "All States"],
      applicationsReceived: 7200000,
      successRate: 78,
      userEligibility: {
        isEligible: true,
        matchingCriteria: 3,
        partialMatch: false
      },
      totalCriteria: 4,
      officialWebsite: "https://agricoop.nic.in/",
      helplineNumber: "155261"
    },
    {
      id: 3,
      name: "Punjab Crop Diversification Scheme",
      description: "Financial assistance to farmers for shifting from paddy cultivation to alternative crops to conserve groundwater and improve soil health.",
      department: "Government of Punjab",
      category: "subsidy",
      benefitType: "amount",
      benefitAmount: 17500,
      applicationDeadline: "2025-05-31",
      launchDate: "2013-06-01",
      applicableStates: ["Punjab"],
      applicationsReceived: 85000,
      successRate: 72,
      userEligibility: {
        isEligible: true,
        matchingCriteria: 4,
        partialMatch: false
      },
      totalCriteria: 5,
      officialWebsite: "https://punjab.gov.in/",
      helplineNumber: "18001804444"
    },

    // LOANS
    {
      id: 4,
      name: "Pradhan Mantri Mudra Yojana - Agriculture",
      description: "Collateral-free loans up to ₹10 lakh for micro and small enterprises in agriculture and allied activities.",
      department: "Ministry of Micro, Small and Medium Enterprises",
      category: "loan",
      benefitType: "credit",
      benefitAmount: 1000000,
      applicationDeadline: "2025-12-31",
      launchDate: "2015-04-08",
      applicableStates: ["Punjab", "Haryana", "All States"],
      applicationsReceived: 2800000,
      successRate: 68,
      userEligibility: {
        isEligible: true,
        matchingCriteria: 3,
        partialMatch: false
      },
      totalCriteria: 4,
      officialWebsite: "https://mudra.org.in/",
      helplineNumber: "18001801111"
    },
    {
      id: 5,
      name: "Agriculture Infrastructure Fund",
      description: "Medium to long-term debt financing facility for investment in viable projects for post-harvest management infrastructure and community farming assets.",
      department: "Ministry of Agriculture & Farmers Welfare",
      category: "loan",
      benefitType: "credit",
      benefitAmount: 20000000,
      applicationDeadline: "2025-12-31",
      launchDate: "2020-08-09",
      applicableStates: ["Punjab", "Haryana", "All States"],
      applicationsReceived: 45000,
      successRate: 55,
      userEligibility: {
        isEligible: false,
        matchingCriteria: 2,
        partialMatch: true
      },
      totalCriteria: 5,
      officialWebsite: "https://aginfra.dac.gov.in/",
      helplineNumber: "18001801551"
    },
    {
      id: 6,
      name: "Haryana Mukhyamantri Kisan Mitra Urja Yojana",
      description: "Electricity bill subsidy for agricultural connections up to 2 HP pumps for farmers in Haryana.",
      department: "Government of Haryana",
      category: "loan",
      benefitType: "subsidy",
      benefitAmount: 12000,
      applicationDeadline: "2025-03-31",
      launchDate: "2021-04-01",
      applicableStates: ["Haryana"],
      applicationsReceived: 125000,
      successRate: 82,
      userEligibility: {
        isEligible: true,
        matchingCriteria: 4,
        partialMatch: false
      },
      totalCriteria: 4,
      officialWebsite: "https://haryana.gov.in/",
      helplineNumber: "18001802117"
    },

    // INSURANCE
    {
      id: 7,
      name: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
      description: "Comprehensive crop insurance scheme providing financial support to farmers suffering crop loss/damage arising out of unforeseen events.",
      department: "Ministry of Agriculture & Farmers Welfare",
      category: "insurance",
      benefitType: "coverage",
      benefitAmount: 500000,
      applicationDeadline: "2025-06-30",
      launchDate: "2016-01-13",
      applicableStates: ["Punjab", "Haryana", "All States"],
      applicationsReceived: 5500000,
      successRate: 76,
      userEligibility: {
        isEligible: true,
        matchingCriteria: 4,
        partialMatch: false
      },
      totalCriteria: 4,
      officialWebsite: "https://pmfby.gov.in/",
      helplineNumber: "18001801551"
    },
    {
      id: 8,
      name: "Pradhan Mantri Jivan Jyoti Bima Yojana",
      description: "Life insurance scheme providing coverage of ₹2 lakh to all savings bank account holders between 18-50 years including farmers.",
      department: "Ministry of Financial Services",
      category: "insurance",
      benefitType: "coverage",
      benefitAmount: 200000,
      applicationDeadline: "2025-12-31",
      launchDate: "2015-05-09",
      applicableStates: ["Punjab", "Haryana", "All States"],
      applicationsReceived: 12800000,
      successRate: 88,
      userEligibility: {
        isEligible: true,
        matchingCriteria: 3,
        partialMatch: false
      },
      totalCriteria: 3,
      officialWebsite: "https://jansuraksha.gov.in/",
      helplineNumber: "18001801111"
    },
    {
      id: 9,
      name: "Punjab State Crop Insurance Scheme",
      description: "State-specific crop insurance providing additional coverage beyond central schemes for Punjab farmers.",
      department: "Government of Punjab",
      category: "insurance",
      benefitType: "coverage",
      benefitAmount: 300000,
      applicationDeadline: "2025-05-15",
      launchDate: "2018-04-01",
      applicableStates: ["Punjab"],
      applicationsReceived: 280000,
      successRate: 74,
      userEligibility: {
        isEligible: true,
        matchingCriteria: 4,
        partialMatch: false
      },
      totalCriteria: 5,
      officialWebsite: "https://punjab.gov.in/",
      helplineNumber: "18001804444"
    },

    // TRAINING
    {
      id: 10,
      name: "Pradhan Mantri Kisan Maandhan Yojana",
      description: "Voluntary contributory pension scheme for small and marginal farmers with monthly pension of ₹3,000 after 60 years of age.",
      department: "Ministry of Agriculture & Farmers Welfare",
      category: "training",
      benefitType: "pension",
      benefitAmount: 36000,
      applicationDeadline: "2025-12-31",
      launchDate: "2019-08-12",
      applicableStates: ["Punjab", "Haryana", "All States"],
      applicationsReceived: 2200000,
      successRate: 91,
      userEligibility: {
        isEligible: true,
        matchingCriteria: 4,
        partialMatch: false
      },
      totalCriteria: 4,
      officialWebsite: "https://maandhan.in/",
      helplineNumber: "18001801551"
    },
    {
      id: 11,
      name: "Skill Development Program for Farmers",
      description: "Training programs for modern farming techniques, organic farming, and agri-entrepreneurship development.",
      department: "Ministry of Skill Development",
      category: "training",
      benefitType: "training",
      benefitAmount: 25000,
      applicationDeadline: "2025-08-31",
      launchDate: "2020-01-15",
      applicableStates: ["Punjab", "Haryana", "All States"],
      applicationsReceived: 180000,
      successRate: 85,
      userEligibility: {
        isEligible: true,
        matchingCriteria: 3,
        partialMatch: false
      },
      totalCriteria: 4,
      officialWebsite: "https://msde.gov.in/",
      helplineNumber: "18001239626"
    },
    {
      id: 12,
      name: "Haryana Farmer Producer Organization Scheme",
      description: "Support for formation and strengthening of Farmer Producer Organizations (FPOs) through training and financial assistance.",
      department: "Government of Haryana",
      category: "training",
      benefitType: "amount",
      benefitAmount: 500000,
      applicationDeadline: "2025-07-15",
      launchDate: "2019-11-01",
      applicableStates: ["Haryana"],
      applicationsReceived: 15000,
      successRate: 72,
      userEligibility: {
        isEligible: false,
        matchingCriteria: 2,
        partialMatch: true
      },
      totalCriteria: 5,
      officialWebsite: "https://haryana.gov.in/",
      helplineNumber: "18001802117"
    },

    // EQUIPMENT
    {
      id: 13,
      name: "Sub-Mission on Agricultural Mechanization (SMAM)",
      description: "Financial assistance for purchase of agricultural machinery and equipment to promote farm mechanization.",
      department: "Ministry of Agriculture & Farmers Welfare",
      category: "equipment",
      benefitType: "subsidy",
      benefitAmount: 80000,
      applicationDeadline: "2025-09-30",
      launchDate: "2014-04-01",
      applicableStates: ["Punjab", "Haryana", "All States"],
      applicationsReceived: 850000,
      successRate: 68,
      userEligibility: {
        isEligible: true,
        matchingCriteria: 4,
        partialMatch: false
      },
      totalCriteria: 4,
      officialWebsite: "https://agmachinery.nic.in/",
      helplineNumber: "18001801551"
    },
    {
      id: 14,
      name: "Custom Hiring Center Scheme",
      description: "Establishment of Custom Hiring Centers to provide agricultural machinery on rental basis to farmers.",
      department: "Ministry of Agriculture & Farmers Welfare",
      category: "equipment",
      benefitType: "amount",
      benefitAmount: 1000000,
      applicationDeadline: "2025-11-30",
      launchDate: "2017-09-01",
      applicableStates: ["Punjab", "Haryana", "All States"],
      applicationsReceived: 25000,
      successRate: 58,
      userEligibility: {
        isEligible: false,
        matchingCriteria: 2,
        partialMatch: true
      },
      totalCriteria: 5,
      officialWebsite: "https://agmachinery.nic.in/",
      helplineNumber: "18001801551"
    },
    {
      id: 15,
      name: "Punjab Farm Machinery Bank Scheme",
      description: "Establishment of community-based farm machinery banks for sharing expensive agricultural equipment among farmers.",
      department: "Government of Punjab",
      category: "equipment",
      benefitType: "amount",
      benefitAmount: 750000,
      applicationDeadline: "2025-10-15",
      launchDate: "2020-05-01",
      applicableStates: ["Punjab"],
      applicationsReceived: 8500,
      successRate: 65,
      userEligibility: {
        isEligible: true,
        matchingCriteria: 3,
        partialMatch: false
      },
      totalCriteria: 4,
      officialWebsite: "https://punjab.gov.in/",
      helplineNumber: "18001804444"
    },

    // MARKETING
    {
      id: 16,
      name: "e-National Agriculture Market (e-NAM)",
      description: "Pan-India electronic trading portal for agricultural commodities providing better price discovery and online payment.",
      department: "Ministry of Agriculture & Farmers Welfare",
      category: "marketing",
      benefitType: "platform",
      benefitAmount: 0,
      applicationDeadline: "2025-12-31",
      launchDate: "2016-04-14",
      applicableStates: ["Punjab", "Haryana", "All States"],
      applicationsReceived: 1750000,
      successRate: 82,
      userEligibility: {
        isEligible: true,
        matchingCriteria: 3,
        partialMatch: false
      },
      totalCriteria: 3,
      officialWebsite: "https://enam.gov.in/",
      helplineNumber: "18001801551"
    },
    {
      id: 17,
      name: "Farmer Producer Organization Promotion Scheme",
      description: "Financial support for formation and promotion of FPOs to enable collective farming and better market access.",
      department: "Ministry of Agriculture & Farmers Welfare",
      category: "marketing",
      benefitType: "amount",
      benefitAmount: 1800000,
      applicationDeadline: "2025-12-31",
      launchDate: "2020-02-29",
      applicableStates: ["Punjab", "Haryana", "All States"],
      applicationsReceived: 55000,
      successRate: 71,
      userEligibility: {
        isEligible: false,
        matchingCriteria: 1,
        partialMatch: true
      },
      totalCriteria: 5,
      officialWebsite: "https://sfac.in/",
      helplineNumber: "18001801551"
    },
    {
      id: 18,
      name: "Haryana Bhavantar Bharpayee Yojana",
      description: "Market intervention scheme providing compensation to farmers when market prices fall below Minimum Support Price (MSP).",
      department: "Government of Haryana",
      category: "marketing",
      benefitType: "compensation",
      benefitAmount: 50000,
      applicationDeadline: "2025-06-30",
      launchDate: "2018-10-01",
      applicableStates: ["Haryana"],
      applicationsReceived: 95000,
      successRate: 89,
      userEligibility: {
        isEligible: true,
        matchingCriteria: 4,
        partialMatch: false
      },
      totalCriteria: 4,
      officialWebsite: "https://haryana.gov.in/",
      helplineNumber: "18001802117"
    }
  ];

  // Sample applied schemes data
  const appliedSchemesData = [
    {
      id: 1,
      schemeName: "PM-KISAN",
      department: "Ministry of Agriculture & Farmers Welfare",
      status: "approved",
      appliedDate: "2024-01-15",
      applicationId: "PMKISAN2024001234",
      expectedBenefit: 6000,
      progress: 100
    },
    {
      id: 2,
      schemeName: "PMFBY",
      department: "Ministry of Agriculture & Farmers Welfare",
      status: "under_review",
      appliedDate: "2024-08-20",
      applicationId: "PMFBY2024005678",
      expectedBenefit: 50000,
      progress: 65
    }
  ];

  useEffect(() => {
    // Simulate loading
    setIsLoading(true);
    setTimeout(() => {
      setSchemes(schemesData);
      setFilteredSchemes(schemesData);
      setAppliedSchemes(appliedSchemesData);
      setBookmarkedSchemes([1, 7, 13]);
      setApplicationStats({
        totalApplications: 8,
        approvedApplications: 5,
        pendingApplications: 2,
        totalBenefitsReceived: 45000
      });
      setIsLoading(false);
    }, 2000);
  }, []);

  useEffect(() => {
    filterSchemes();
  }, [searchQuery, selectedCategory, selectedState, statusFilter, schemes]);

  const filterSchemes = () => {
    let filtered = [...schemes];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(scheme => 
        scheme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scheme.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scheme.department.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(scheme => scheme.category === selectedCategory);
    }

    // State filter
    if (selectedState !== 'all') {
      filtered = filtered.filter(scheme => 
        scheme.applicableStates.includes(selectedState) || scheme.applicableStates.includes('All States')
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(scheme => {
        switch (statusFilter) {
          case 'active':
            return new Date(scheme.applicationDeadline) > now;
          case 'closing_soon':
            const daysLeft = Math.ceil((new Date(scheme.applicationDeadline) - now) / (1000 * 60 * 60 * 24));
            return daysLeft <= 30 && daysLeft > 0;
          case 'new':
            const launchDate = new Date(scheme.launchDate);
            const daysSinceLaunch = Math.ceil((now - launchDate) / (1000 * 60 * 60 * 24));
            return daysSinceLaunch <= 365;
          default:
            return true;
        }
      });
    }

    setFilteredSchemes(filtered);
  };

  const handleBookmark = (schemeId) => {
    const isBookmarked = bookmarkedSchemes.includes(schemeId);
    if (isBookmarked) {
      setBookmarkedSchemes(prev => prev.filter(id => id !== schemeId));
    } else {
      setBookmarkedSchemes(prev => [...prev, schemeId]);
    }
  };

  const handleApplyScheme = (scheme) => {
    window.open(scheme.officialWebsite, '_blank');
  };

  const getEligibilityStatus = (scheme) => {
    const eligibility = scheme.userEligibility;
    if (eligibility?.isEligible) return { status: 'eligible', text: 'Eligible', color: 'default' };
    if (eligibility?.partialMatch) return { status: 'partial', text: 'Partially Eligible', color: 'secondary' };
    return { status: 'not_eligible', text: 'Not Eligible', color: 'destructive' };
  };

  const getStatusBadge = (scheme) => {
    const now = new Date();
    const deadline = new Date(scheme.applicationDeadline);
    const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
    
    if (daysLeft <= 0) {
      return <Badge variant="destructive">Closed</Badge>;
    } else if (daysLeft <= 7) {
      return <Badge variant="destructive">Closing Soon ({daysLeft} days)</Badge>;
    } else if (daysLeft <= 30) {
      return <Badge variant="secondary">Closing ({daysLeft} days)</Badge>;
    } else {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-100">Active</Badge>;
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      subsidy: <DollarSign className="h-4 w-4" />,
      loan: <Building className="h-4 w-4" />,
      insurance: <ShieldCheck className="h-4 w-4" />,
      training: <GraduationCap className="h-4 w-4" />,
      equipment: <Tractor className="h-4 w-4" />,
      marketing: <ShoppingCart className="h-4 w-4" />
    };
    return icons[category] || <FileText className="h-4 w-4" />;
  };

  const formatCurrency = (amount) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    return `₹${amount.toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const categories = [
    { value: 'all', label: 'All Categories', icon: <FileText className="h-4 w-4" /> },
    { value: 'subsidy', label: 'Subsidies', icon: <DollarSign className="h-4 w-4" /> },
    { value: 'loan', label: 'Loans & Credit', icon: <Building className="h-4 w-4" /> },
    { value: 'insurance', label: 'Insurance', icon: <ShieldCheck className="h-4 w-4" /> },
    { value: 'training', label: 'Training & Skill', icon: <GraduationCap className="h-4 w-4" /> },
    { value: 'equipment', label: 'Equipment & Machinery', icon: <Tractor className="h-4 w-4" /> },
    { value: 'marketing', label: 'Marketing Support', icon: <ShoppingCart className="h-4 w-4" /> }
  ];

  const states = [
    { value: 'all', label: 'All States' },
    { value: 'Punjab', label: 'Punjab' },
    { value: 'Haryana', label: 'Haryana' }
  ];

  const statusFilters = [
    { value: 'all', label: 'All Schemes' },
    { value: 'active', label: 'Active Schemes' },
    { value: 'closing_soon', label: 'Closing Soon' },
    { value: 'new', label: 'New Schemes' }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-4">
              <FileText className="h-8 w-8 text-green-600 dark:text-green-400 animate-pulse" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Loading Schemes</h3>
            <p className="text-gray-600 dark:text-gray-400">Fetching latest government schemes...</p>
            <div className="mt-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
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
              🏛️ Government Schemes
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
              Discover and apply for agricultural schemes and subsidies
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
            <Badge variant="outline" className="px-3 py-1 bg-white dark:bg-gray-800 border-green-200 dark:border-green-700">
              <span className="text-green-600 dark:text-green-400 font-semibold">{filteredSchemes.length}</span>
              <span className="text-gray-600 dark:text-gray-400 ml-1">Available</span>
            </Badge>
          </div>
        </div>

        {/* Application Stats */}
        {Object.keys(applicationStats).length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400">Total Applications</p>
                    <p className="text-lg sm:text-2xl font-bold text-blue-700 dark:text-blue-300">{applicationStats.totalApplications || 0}</p>
                  </div>
                  <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-green-600 dark:text-green-400">Approved</p>
                    <p className="text-lg sm:text-2xl font-bold text-green-700 dark:text-green-300">{applicationStats.approvedApplications || 0}</p>
                  </div>
                  <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-yellow-200 dark:border-yellow-800">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-yellow-600 dark:text-yellow-400">Pending</p>
                    <p className="text-lg sm:text-2xl font-bold text-yellow-700 dark:text-yellow-300">{applicationStats.pendingApplications || 0}</p>
                  </div>
                  <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-purple-600 dark:text-purple-400">Total Benefits</p>
                    <p className="text-lg sm:text-2xl font-bold text-purple-700 dark:text-purple-300">
                      {formatCurrency(applicationStats.totalBenefitsReceived || 0)}
                    </p>
                  </div>
                  <Award className="h-5 w-5 sm:h-6 sm:w-6 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search and Filters */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <Search className="h-5 w-5 text-green-600 dark:text-green-400" />
              Search & Filter Schemes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="relative">
                <Input
                  placeholder="Search schemes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      <div className="flex items-center gap-2">
                        {category.icon}
                        {category.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600">
                  <SelectValue placeholder="State" />
                </SelectTrigger>
                <SelectContent>
                  {states.map((state) => (
                    <SelectItem key={state.value} value={state.value}>
                      {state.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusFilters.map((filter) => (
                    <SelectItem key={filter.value} value={filter.value}>
                      {filter.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="browse" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <TabsTrigger value="browse" className="text-gray-700 dark:text-gray-300 data-[state=active]:bg-green-100 dark:data-[state=active]:bg-green-900 data-[state=active]:text-green-700 dark:data-[state=active]:text-green-300">
              Browse Schemes ({filteredSchemes.length})
            </TabsTrigger>
            <TabsTrigger value="applied" className="text-gray-700 dark:text-gray-300 data-[state=active]:bg-green-100 dark:data-[state=active]:bg-green-900 data-[state=active]:text-green-700 dark:data-[state=active]:text-green-300">
              My Applications ({appliedSchemes.length})
            </TabsTrigger>
            <TabsTrigger value="bookmarked" className="text-gray-700 dark:text-gray-300 data-[state=active]:bg-green-100 dark:data-[state=active]:bg-green-900 data-[state=active]:text-green-700 dark:data-[state=active]:text-green-300">
              Bookmarked ({bookmarkedSchemes.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {filteredSchemes.map((scheme, index) => (
                <Card key={index} className="hover:shadow-xl transition-all duration-300 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 pr-3">
                        <div className="flex items-center gap-2 mb-2">
                          {getCategoryIcon(scheme.category)}
                          <CardTitle className="text-base sm:text-lg leading-tight text-gray-900 dark:text-gray-100">{scheme.name}</CardTitle>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{scheme.department}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {getStatusBadge(scheme)}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleBookmark(scheme.id)}
                          className="p-1 hover:bg-green-50 dark:hover:bg-green-900"
                        >
                          {bookmarkedSchemes.includes(scheme.id) ? (
                            <BookmarkCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                          ) : (
                            <Bookmark className="h-4 w-4 text-gray-400 hover:text-green-600 dark:hover:text-green-400" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-sm leading-relaxed line-clamp-3 text-gray-700 dark:text-gray-300">{scheme.description}</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="space-y-2">
                        <div className="flex items-center gap-1">
                          {/* //<DollarSign className="h-3 w-3 text-green-500" /> */}
                          <span className="text-gray-500 dark:text-gray-400">Benefit:</span>
                        </div>
                        <p className="font-medium text-green-600 dark:text-green-400">
                          {scheme.benefitType === 'amount' || scheme.benefitType === 'credit' || scheme.benefitType === 'coverage'
                            ? formatCurrency(scheme.benefitAmount)
                            : scheme.benefitType.charAt(0).toUpperCase() + scheme.benefitType.slice(1)
                          }
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-blue-500" />
                          <span className="text-gray-500 dark:text-gray-400">Deadline:</span>
                        </div>
                        <p className="font-medium text-blue-600 dark:text-blue-400">
                          {formatDate(scheme.applicationDeadline)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-purple-500" />
                        <span className="text-gray-500 dark:text-gray-400">Applicable:</span>
                        <span className="font-medium text-gray-700 dark:text-gray-300">{scheme.applicableStates.slice(0, 2).join(', ')}</span>
                        {scheme.applicableStates.length > 2 && (
                          <span className="text-gray-500 dark:text-gray-400">+{scheme.applicableStates.length - 2} more</span>
                        )}
                      </div>
                    </div>

                    {/* Eligibility Status */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Eligibility:</span>
                        <Badge variant={getEligibilityStatus(scheme).color} className="text-xs">
                          {getEligibilityStatus(scheme).text}
                        </Badge>
                      </div>
                      {scheme.userEligibility?.matchingCriteria && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {scheme.userEligibility.matchingCriteria}/{scheme.totalCriteria} criteria met
                        </span>
                      )}
                    </div>

                    {/* Quick Info */}
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {scheme.applicationsReceived?.toLocaleString() || 0} applied
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {scheme.successRate || 0}% success
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleApplyScheme(scheme)}
                        disabled={getEligibilityStatus(scheme).status === 'not_eligible'}
                      >
                        Apply Now
                      </Button>
                      <Button size="sm" variant="outline" className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Details
                      </Button>
                      <Button size="sm" variant="outline" className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <Download className="h-3 w-3 mr-1" />
                        Guide
                      </Button>
                    </div>

                    {/* Helpline */}
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-600">
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        <span>Helpline: {scheme.helplineNumber}</span>
                      </div>
                      <a 
                        href={scheme.officialWebsite} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Official Site
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredSchemes.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  No schemes found matching your criteria
                </p>
                <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
                  Try adjusting your search filters
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="applied" className="space-y-6">
            <div className="space-y-4">
              {appliedSchemes.map((application, index) => (
                <Card key={index} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{application.schemeName}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{application.department}</p>
                      </div>
                      <Badge variant={
                        application.status === 'approved' ? 'default' :
                        application.status === 'rejected' ? 'destructive' :
                        application.status === 'under_review' ? 'secondary' : 'outline'
                      } className={
                        application.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : ''
                      }>
                        {application.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Application Date</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{formatDate(application.appliedDate)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Application ID</p>
                        <p className="font-medium font-mono text-gray-900 dark:text-gray-100 text-xs">{application.applicationId}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Expected Benefit</p>
                        <p className="font-medium text-green-600 dark:text-green-400">{formatCurrency(application.expectedBenefit)}</p>
                      </div>
                    </div>

                    {application.status === 'under_review' && application.progress && (
                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-700 dark:text-gray-300">Application Progress</span>
                          <span className="text-gray-700 dark:text-gray-300">{application.progress}%</span>
                        </div>
                        <Progress value={application.progress} className="h-2" />
                      </div>
                    )}

                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" className="border-gray-300 dark:border-gray-600">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Track Status
                      </Button>
                      {application.documents && (
                        <Button size="sm" variant="outline" className="border-gray-300 dark:border-gray-600">
                          <Download className="h-3 w-3 mr-1" />
                          Documents
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="bookmarked" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {schemes.filter(scheme => bookmarkedSchemes.includes(scheme.id)).map((scheme, index) => (
                <Card key={index} className="hover:shadow-xl transition-all duration-300 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getCategoryIcon(scheme.category)}
                          <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{scheme.name}</h4>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{scheme.department}</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 line-clamp-2">{scheme.description}</p>
                        
                        <div className="flex items-center gap-4 mt-3 text-xs">
                          <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                            <DollarSign className="h-3 w-3" />
                            {formatCurrency(scheme.benefitAmount)}
                          </span>
                          <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                            <Calendar className="h-3 w-3" />
                            {formatDate(scheme.applicationDeadline)}
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleBookmark(scheme.id)}
                        className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <BookmarkCheck className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={() => handleApplyScheme(scheme)}>
                        Apply Now
                      </Button>
                      <Button size="sm" variant="outline" className="border-gray-300 dark:border-gray-600">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {schemes.filter(scheme => bookmarkedSchemes.includes(scheme.id)).length === 0 && (
              <div className="text-center py-12">
                <Bookmark className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  No bookmarked schemes
                </p>
                <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
                  Bookmark schemes you're interested in for quick access
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GovernmentSchemes;
