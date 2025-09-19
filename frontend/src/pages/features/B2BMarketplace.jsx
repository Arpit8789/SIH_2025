// src/pages/features/B2BMarketplace.jsx - FIXED WITHOUT WHATSAPP & AVATAR ERRORS
import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  MapPin, 
  Phone,
  Star,
  Eye,
  TrendingUp,
  Package,
  Users,
  MessageCircle,
  Heart,
  Share2,
  Truck,
  Shield,
  Calendar,
  Verified,
  Clock,
  IndianRupee,
  Award,
  Leaf,
  Building,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

// ✅ SIMPLE AVATAR COMPONENT (No external dependency)
const Avatar = ({ className, children, ...props }) => (
  <div className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)} {...props}>
    {children}
  </div>
);

const AvatarFallback = ({ className, children, ...props }) => (
  <div className={cn("flex h-full w-full items-center justify-center rounded-full bg-muted", className)} {...props}>
    {children}
  </div>
);

const B2BMarketplace = () => {
  const [activeTab, setActiveTab] = useState('buyers');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  
  const { currentLanguage } = useLanguage();
  const { user } = useAuth();

  // ✅ MOCK DATA FOR BUYERS OFFERING RATES
  const mockBuyers = [
    {
      id: 1,
      name: "Rajesh Agro Industries",
      type: "Processor",
      location: { city: "Ludhiana", state: "Punjab" },
      rating: 4.8,
      reviewCount: 245,
      verified: true,
      premium: true,
      phone: "+91 98765 43210",
      whatsapp: "+91 98765 43210",
      avatar: null,
      offerings: [
        {
          crop: "Wheat",
          rate: 2200,
          unit: "quintal",
          minQuantity: 100,
          maxQuantity: 1000,
          quality: "Grade A",
          validTill: "2025-09-25",
          paymentTerms: "Immediate",
          features: ["Direct pickup", "Quality testing", "Fair price"]
        },
        {
          crop: "Rice",
          rate: 2800,
          unit: "quintal", 
          minQuantity: 50,
          maxQuantity: 500,
          quality: "Grade A",
          validTill: "2025-09-30",
          paymentTerms: "7 days",
          features: ["Basmati accepted", "Premium rates", "Bulk orders"]
        }
      ],
      specialization: ["Cereals", "Pulses"],
      establishedYear: 2010,
      description: "Leading grain processor in North India with modern facilities and fair pricing.",
      badges: ["Verified Buyer", "Premium Partner", "Fast Payment"]
    },
    {
      id: 2,
      name: "Punjab Grain Merchants",
      type: "Trader",
      location: { city: "Amritsar", state: "Punjab" },
      rating: 4.6,
      reviewCount: 180,
      verified: true,
      premium: false,
      phone: "+91 98876 54321",
      whatsapp: "+91 98876 54321",
      avatar: null,
      offerings: [
        {
          crop: "Potato",
          rate: 1500,
          unit: "quintal",
          minQuantity: 200,
          maxQuantity: 2000,
          quality: "A Grade",
          validTill: "2025-09-22",
          paymentTerms: "Cash on delivery",
          features: ["Cold storage", "Sorting facility", "Transport included"]
        }
      ],
      specialization: ["Vegetables", "Fruits"],
      establishedYear: 2015,
      description: "Trusted vegetable trader with cold storage facilities and quick payments.",
      badges: ["Verified Buyer", "Quick Payment", "Storage Facility"]
    },
    {
      id: 3,
      name: "Haryana Food Processing Co.",
      type: "Food Processor",
      location: { city: "Karnal", state: "Haryana" },
      rating: 4.9,
      reviewCount: 320,
      verified: true,
      premium: true,
      phone: "+91 99887 76543",
      whatsapp: "+91 99887 76543",
      avatar: null,
      offerings: [
        {
          crop: "Mustard",
          rate: 4500,
          unit: "quintal",
          minQuantity: 50,
          maxQuantity: 300,
          quality: "Premium",
          validTill: "2025-10-01",
          paymentTerms: "Advance 50%",
          features: ["Oil extraction", "Premium rates", "Contract farming"]
        },
        {
          crop: "Sunflower",
          rate: 5200,
          unit: "quintal",
          minQuantity: 25,
          maxQuantity: 200,
          quality: "Grade 1",
          validTill: "2025-09-28",
          paymentTerms: "Net 15 days",
          features: ["High oil content", "Export quality", "Bonus for quality"]
        }
      ],
      specialization: ["Oilseeds", "Spices"],
      establishedYear: 2008,
      description: "Modern food processing unit specializing in oil extraction with export facilities.",
      badges: ["Premium Partner", "Export Quality", "Contract Farming"]
    }
  ];

  // ✅ MOCK DATA FOR B2B SERVICES
  const mockServices = [
    {
      id: 1,
      name: "Green Valley Seeds Co.",
      type: "Seed Supplier",
      location: { city: "Bathinda", state: "Punjab" },
      rating: 4.7,
      reviewCount: 156,
      verified: true,
      premium: true,
      phone: "+91 98765 11111",
      whatsapp: "+91 98765 11111",
      services: [
        {
          name: "Hybrid Wheat Seeds",
          price: 85,
          unit: "kg",
          minOrder: 100,
          description: "High yielding hybrid wheat seeds with disease resistance",
          features: ["95% germination", "Disease resistant", "High yield"],
          category: "Seeds"
        },
        {
          name: "Certified Rice Seeds",
          price: 120,
          unit: "kg", 
          minOrder: 50,
          description: "Premium certified rice seeds for Punjab climate",
          features: ["Certified seeds", "Basmati variety", "Export quality"],
          category: "Seeds"
        }
      ],
      specialization: ["Seeds", "Fertilizers"],
      establishedYear: 2012,
      description: "Leading seed supplier with certified varieties and high germination rates.",
      badges: ["Certified Dealer", "Premium Seeds", "Technical Support"]
    },
    {
      id: 2,
      name: "Punjab Transport Services",
      type: "Logistics",
      location: { city: "Chandigarh", state: "Punjab" },
      rating: 4.5,
      reviewCount: 89,
      verified: true,
      premium: false,
      phone: "+91 98765 22222", 
      whatsapp: "+91 98765 22222",
      services: [
        {
          name: "Bulk Grain Transportation",
          price: 12,
          unit: "quintal/km",
          minOrder: 100,
          description: "Specialized vehicles for grain transportation with GPS tracking",
          features: ["GPS tracking", "Insurance covered", "24/7 support"],
          category: "Transportation"
        },
        {
          name: "Cold Chain Transport",
          price: 18,
          unit: "quintal/km",
          minOrder: 50,
          description: "Temperature controlled transport for fruits and vegetables",
          features: ["Temperature control", "Quick delivery", "Minimal wastage"],
          category: "Transportation"
        }
      ],
      specialization: ["Transportation", "Logistics"],
      establishedYear: 2018,
      description: "Professional transportation services with modern fleet and tracking systems.",
      badges: ["GPS Enabled", "Insured Transport", "24/7 Service"]
    },
    {
      id: 3,
      name: "AgriTech Equipment Rental",
      type: "Equipment Rental",
      location: { city: "Hisar", state: "Haryana" },
      rating: 4.4,
      reviewCount: 95,
      verified: true,
      premium: true,
      phone: "+91 98765 33333",
      whatsapp: "+91 98765 33333",
      services: [
        {
          name: "Combine Harvester Rental",
          price: 2500,
          unit: "day",
          minOrder: 1,
          description: "Modern combine harvesters with operator and fuel included",
          features: ["Operator included", "Fuel included", "Maintenance covered"],
          category: "Equipment"
        },
        {
          name: "Tractor with Implements",
          price: 1800,
          unit: "day",
          minOrder: 1,
          description: "Tractors with various implements for farming operations",
          features: ["Multiple implements", "Experienced operator", "Insurance covered"],
          category: "Equipment"
        }
      ],
      specialization: ["Equipment Rental", "Farm Machinery"],
      establishedYear: 2016,
      description: "Complete farm equipment rental services with trained operators and maintenance.",
      badges: ["Modern Equipment", "Trained Operators", "Full Service"]
    }
  ];

  const categories = [
    { value: 'all', label: currentLanguage === 'hi' ? 'सभी श्रेणियां' : 'All Categories' },
    { value: 'cereals', label: currentLanguage === 'hi' ? 'अनाज' : 'Cereals' },
    { value: 'vegetables', label: currentLanguage === 'hi' ? 'सब्जियां' : 'Vegetables' },
    { value: 'oilseeds', label: currentLanguage === 'hi' ? 'तिलहन' : 'Oilseeds' },
    { value: 'seeds', label: currentLanguage === 'hi' ? 'बीज' : 'Seeds' },
    { value: 'transport', label: currentLanguage === 'hi' ? 'परिवहन' : 'Transportation' },
    { value: 'equipment', label: currentLanguage === 'hi' ? 'उपकरण' : 'Equipment' }
  ];

  const locations = [
    { value: 'all', label: currentLanguage === 'hi' ? 'सभी स्थान' : 'All Locations' },
    { value: 'punjab', label: 'Punjab' },
    { value: 'haryana', label: 'Haryana' },
    { value: 'uttar-pradesh', label: 'Uttar Pradesh' }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('hi-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleWhatsAppContact = (phone, name, itemName) => {
    const message = encodeURIComponent(
      `Hello ${name}, I'm interested in your ${itemName}. Please share more details.`
    );
    window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-green-900/20">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        
        {/* ✅ HERO HEADER */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full mb-4 shadow-lg">
            <ShoppingCart className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent mb-2">
            {currentLanguage === 'hi' ? 'B2B मार्केटप्लेस' : 'B2B Marketplace'}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {currentLanguage === 'hi' 
              ? 'खरीदारों से जुड़ें और बल्क सेवाओं का लाभ उठाएं'
              : 'Connect with buyers and access bulk agricultural services'
            }
          </p>
        </div>

        {/* ✅ SEARCH AND FILTERS */}
        <Card className="mb-8 shadow-lg border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={currentLanguage === 'hi' ? 'खोजें...' : 'Search...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-green-200 focus:border-green-400 dark:border-green-700"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="border-green-200 dark:border-green-700">
                  <SelectValue placeholder={currentLanguage === 'hi' ? 'श्रेणी' : 'Category'} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="border-green-200 dark:border-green-700">
                  <SelectValue placeholder={currentLanguage === 'hi' ? 'स्थान' : 'Location'} />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location.value} value={location.value}>
                      {location.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                <Filter className="h-4 w-4 mr-2" />
                {currentLanguage === 'hi' ? 'फिल्टर करें' : 'Apply Filters'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ✅ MAIN TABS */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto bg-green-100 dark:bg-green-900/30">
            <TabsTrigger 
              value="buyers" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              {currentLanguage === 'hi' ? 'खरीदार दरें' : 'Buyer Rates'}
            </TabsTrigger>
            <TabsTrigger 
              value="services" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white"
            >
              <Package className="h-4 w-4 mr-2" />
              {currentLanguage === 'hi' ? 'B2B सेवाएं' : 'B2B Services'}
            </TabsTrigger>
          </TabsList>

          {/* ✅ BUYERS TAB */}
          <TabsContent value="buyers" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {mockBuyers.map((buyer) => (
                <Card key={buyer.id} className="group hover:shadow-xl transition-all duration-300 border-green-200 dark:border-green-800 bg-gradient-to-br from-white to-green-50/30 dark:from-gray-800 dark:to-green-900/10">
                  <CardContent className="p-6">
                    {/* Buyer Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-14 w-14 border-2 border-green-300">
                          <AvatarFallback className="bg-gradient-to-br from-green-600 to-emerald-600 text-white font-bold text-lg">
                            {buyer.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-lg text-foreground">{buyer.name}</h3>
                            {buyer.verified && (
                              <CheckCircle className="h-5 w-5 text-blue-600" />
                            )}
                            {buyer.premium && (
                              <Award className="h-5 w-5 text-yellow-600" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{buyer.type}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <MapPin className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-green-700 dark:text-green-400">
                              {buyer.location.city}, {buyer.location.state}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center gap-1 mb-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="font-semibold">{buyer.rating}</span>
                          <span className="text-sm text-muted-foreground">({buyer.reviewCount})</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Est. {buyer.establishedYear}
                        </Badge>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {buyer.description}
                    </p>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {buyer.badges.map((badge, idx) => (
                        <Badge key={idx} variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          {badge}
                        </Badge>
                      ))}
                    </div>

                    {/* Offerings */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-foreground flex items-center gap-2">
                        <IndianRupee className="h-4 w-4 text-green-600" />
                        {currentLanguage === 'hi' ? 'खरीदारी दरें' : 'Buying Rates'}
                      </h4>
                      
                      {buyer.offerings.map((offer, idx) => (
                        <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-800 shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="text-2xl">
                                {offer.crop === 'Wheat' ? '🌾' :
                                 offer.crop === 'Rice' ? '🍚' :
                                 offer.crop === 'Potato' ? '🥔' :
                                 offer.crop === 'Mustard' ? '🌻' :
                                 offer.crop === 'Sunflower' ? '🌻' : '🌱'}
                              </div>
                              <div>
                                <h5 className="font-semibold text-foreground">{offer.crop}</h5>
                                <p className="text-xs text-muted-foreground">{offer.quality}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-green-600">
                                {formatCurrency(offer.rate)}
                              </div>
                              <div className="text-xs text-muted-foreground">per {offer.unit}</div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-3">
                            <div>
                              <span className="font-medium">Min Qty:</span> {offer.minQuantity} {offer.unit}
                            </div>
                            <div>
                              <span className="font-medium">Max Qty:</span> {offer.maxQuantity} {offer.unit}
                            </div>
                            <div>
                              <span className="font-medium">Payment:</span> {offer.paymentTerms}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>Valid till {new Date(offer.validTill).toLocaleDateString()}</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-3">
                            {offer.features.map((feature, fidx) => (
                              <Badge key={fidx} variant="outline" className="text-xs border-green-300 text-green-700 dark:border-green-600 dark:text-green-400">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                {feature}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                              onClick={() => handleWhatsAppContact(buyer.whatsapp, buyer.name, offer.crop)}
                            >
                              <MessageCircle className="h-4 w-4 mr-1" />
                              {currentLanguage === 'hi' ? 'संपर्क करें' : 'Contact'}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-600 dark:text-green-400"
                              onClick={() => window.open(`tel:${buyer.phone}`, '_self')}
                            >
                              <Phone className="h-4 w-4 mr-1" />
                              {currentLanguage === 'hi' ? 'कॉल' : 'Call'}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-600 dark:text-green-400"
                              onClick={() => handleWhatsAppContact(buyer.whatsapp, buyer.name, offer.crop)}
                            >
                              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.786"/>
                              </svg>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ✅ SERVICES TAB */}
          <TabsContent value="services" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {mockServices.map((service) => (
                <Card key={service.id} className="group hover:shadow-xl transition-all duration-300 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800 dark:to-blue-900/10">
                  <CardContent className="p-6">
                    {/* Service Provider Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-14 w-14 border-2 border-blue-300">
                          <AvatarFallback className="bg-gradient-to-br from-blue-600 to-cyan-600 text-white font-bold text-lg">
                            {service.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-lg text-foreground">{service.name}</h3>
                            {service.verified && (
                              <CheckCircle className="h-5 w-5 text-blue-600" />
                            )}
                            {service.premium && (
                              <Award className="h-5 w-5 text-yellow-600" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{service.type}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <MapPin className="h-4 w-4 text-blue-600" />
                            <span className="text-sm text-blue-700 dark:text-blue-400">
                              {service.location.city}, {service.location.state}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center gap-1 mb-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="font-semibold">{service.rating}</span>
                          <span className="text-sm text-muted-foreground">({service.reviewCount})</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Est. {service.establishedYear}
                        </Badge>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {service.description}
                    </p>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {service.badges.map((badge, idx) => (
                        <Badge key={idx} variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                          {badge}
                        </Badge>
                      ))}
                    </div>

                    {/* Services */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-foreground flex items-center gap-2">
                        <Package className="h-4 w-4 text-blue-600" />
                        {currentLanguage === 'hi' ? 'सेवाएं' : 'Services'}
                      </h4>
                      
                      {service.services.map((item, idx) => (
                        <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-800 shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="text-2xl">
                                {item.category === 'Seeds' ? '🌱' :
                                 item.category === 'Transportation' ? '🚛' :
                                 item.category === 'Equipment' ? '🚜' : '📦'}
                              </div>
                              <div>
                                <h5 className="font-semibold text-foreground">{item.name}</h5>
                                <p className="text-xs text-muted-foreground">{item.category}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-blue-600">
                                {formatCurrency(item.price)}
                              </div>
                              <div className="text-xs text-muted-foreground">per {item.unit}</div>
                            </div>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-3">
                            {item.description}
                          </p>

                          <div className="mb-3">
                            <span className="text-sm font-medium text-muted-foreground">
                              Min Order: {item.minOrder} {item.unit}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-3">
                            {item.features.map((feature, fidx) => (
                              <Badge key={fidx} variant="outline" className="text-xs border-blue-300 text-blue-700 dark:border-blue-600 dark:text-blue-400">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                {feature}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                              onClick={() => handleWhatsAppContact(service.whatsapp, service.name, item.name)}
                            >
                              <MessageCircle className="h-4 w-4 mr-1" />
                              {currentLanguage === 'hi' ? 'संपर्क करें' : 'Contact'}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-400"
                              onClick={() => window.open(`tel:${service.phone}`, '_self')}
                            >
                              <Phone className="h-4 w-4 mr-1" />
                              {currentLanguage === 'hi' ? 'कॉल' : 'Call'}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-400"
                              onClick={() => handleWhatsAppContact(service.whatsapp, service.name, item.name)}
                            >
                              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.786"/>
                              </svg>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* ✅ CALL TO ACTION */}
        <Card className="mt-8 bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0">
          <CardContent className="p-8 text-center">
            <Building className="h-12 w-12 mx-auto mb-4 opacity-90" />
            <h3 className="text-2xl font-bold mb-2">
              {currentLanguage === 'hi' ? 'अपना व्यापार बढ़ाएं' : 'Grow Your Business'}
            </h3>
            <p className="text-green-100 mb-6 max-w-2xl mx-auto">
              {currentLanguage === 'hi' 
                ? 'हमारे प्लेटफॉर्म पर अपनी सेवाएं सूचीबद्ध करें और हजारों किसानों से जुड़ें'
                : 'List your services on our platform and connect with thousands of farmers'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="bg-white text-green-600 hover:bg-green-50">
                <ExternalLink className="h-5 w-5 mr-2" />
                {currentLanguage === 'hi' ? 'खरीदार बनें' : 'Become a Buyer'}
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Package className="h-5 w-5 mr-2" />
                {currentLanguage === 'hi' ? 'सेवा प्रदाता बनें' : 'Become a Service Provider'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default B2BMarketplace;
