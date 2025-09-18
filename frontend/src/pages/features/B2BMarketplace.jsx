// src/pages/features/B2BMarketplace.jsx
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
  Calendar
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, SearchInput } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import VoiceButton from '@/components/common/VoiceButton';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { useDebounce } from '@/hooks/useDebounce';
import { marketplaceService } from '@/services/marketplaceService';
import { farmerService } from '@/services/farmerService';
import { numberHelpers, dateHelpers } from '@/utils/helpers';

const B2BMarketplace = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [isLoading, setIsLoading] = useState(true);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [marketStats, setMarketStats] = useState({});
  
  const debouncedSearch = useDebounce(searchQuery, 500);
  const { t } = useLanguage();
  const { user } = useAuth();

  useEffect(() => {
    loadMarketplaceData();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [debouncedSearch, selectedCategory, locationFilter, priceRange, sortBy, products]);

  const loadMarketplaceData = async () => {
    setIsLoading(true);
    
    try {
      // Load available products
      const productsResponse = await marketplaceService.getProducts({
        includeVerified: true,
        includeFeatured: true
      });
      
      if (productsResponse.success) {
        setProducts(productsResponse.data.products || []);
        setFeaturedProducts(productsResponse.data.featured || []);
      }

      // Load top sellers
      const sellersResponse = await marketplaceService.getTopSellers({
        limit: 10
      });
      
      if (sellersResponse.success) {
        setSellers(sellersResponse.data.sellers || []);
      }

      // Load marketplace statistics
      const statsResponse = await marketplaceService.getMarketStats();
      if (statsResponse.success) {
        setMarketStats(statsResponse.data.stats || {});
      }

    } catch (error) {
      console.error('Failed to load marketplace data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    // Search filter
    if (debouncedSearch) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        product.description.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        product.sellerName.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Location filter
    if (locationFilter !== 'all') {
      filtered = filtered.filter(product => product.location.state === locationFilter);
    }

    // Price range filter
    if (priceRange !== 'all') {
      const [min, max] = priceRange.split('-').map(Number);
      filtered = filtered.filter(product => {
        const price = product.pricePerUnit;
        return max ? (price >= min && price <= max) : price >= min;
      });
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price_low':
          return a.pricePerUnit - b.pricePerUnit;
        case 'price_high':
          return b.pricePerUnit - a.pricePerUnit;
        case 'rating':
          return b.sellerRating - a.sellerRating;
        case 'quantity':
          return b.quantity - a.quantity;
        case 'newest':
          return new Date(b.listedDate) - new Date(a.listedDate);
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  };

  const handleVoiceSearch = (transcript) => {
    setSearchQuery(transcript);
  };

  const handleContactSeller = (sellerId) => {
    // Navigate to seller profile or open contact modal
    console.log('Contact seller:', sellerId);
  };

  const handleAddToWishlist = async (productId) => {
    try {
      await marketplaceService.addToWishlist({
        productId,
        userId: user?.id
      });
    } catch (error) {
      console.error('Failed to add to wishlist:', error);
    }
  };

  const categories = [
    { value: 'all', label: t('marketplace.allCategories') },
    { value: 'cereals', label: t('crops.cereals') },
    { value: 'pulses', label: t('crops.pulses') },
    { value: 'vegetables', label: t('crops.vegetables') },
    { value: 'fruits', label: t('crops.fruits') },
    { value: 'spices', label: t('crops.spices') },
    { value: 'equipment', label: t('marketplace.equipment') }
  ];

  const locations = [
    { value: 'all', label: t('common.allStates') },
    { value: 'Punjab', label: 'Punjab' },
    { value: 'Haryana', label: 'Haryana' },
    { value: 'Uttar Pradesh', label: 'Uttar Pradesh' },
    { value: 'Maharashtra', label: 'Maharashtra' }
  ];

  const priceRanges = [
    { value: 'all', label: t('marketplace.allPrices') },
    { value: '0-1000', label: '₹0 - ₹1,000' },
    { value: '1000-5000', label: '₹1,000 - ₹5,000' },
    { value: '5000-10000', label: '₹5,000 - ₹10,000' },
    { value: '10000', label: '₹10,000+' }
  ];

  const sortOptions = [
    { value: 'newest', label: t('marketplace.newest') },
    { value: 'price_low', label: t('marketplace.priceLowToHigh') },
    { value: 'price_high', label: t('marketplace.priceHighToLow') },
    { value: 'rating', label: t('marketplace.topRated') },
    { value: 'quantity', label: t('marketplace.highestQuantity') }
  ];

  if (isLoading) {
    return (
      <div className="p-6">
        <LoadingSpinner fullScreen text={t('marketplace.loading')} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            🛒 {t('marketplace.title')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('marketplace.subtitle')}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <VoiceButton
            mode="listen"
            onTranscript={handleVoiceSearch}
            className="bg-gradient-ag text-white hover:shadow-lg"
          />
          <Badge variant="outline" className="px-3 py-1">
            {filteredProducts.length} {t('marketplace.products')}
          </Badge>
        </div>
      </div>

      {/* Marketplace Stats */}
      {Object.keys(marketStats).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400">{t('marketplace.totalProducts')}</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{numberHelpers.formatNumber(marketStats.totalProducts || 0)}</p>
                </div>
                <Package className="h-6 w-6 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400">{t('marketplace.activeSellers')}</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">{numberHelpers.formatNumber(marketStats.activeSellers || 0)}</p>
                </div>
                <Users className="h-6 w-6 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 dark:text-purple-400">{t('marketplace.totalTransactions')}</p>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                    {numberHelpers.formatCurrency(marketStats.totalTransactions || 0)}
                  </p>
                </div>
                <TrendingUp className="h-6 w-6 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 dark:text-orange-400">{t('marketplace.avgRating')}</p>
                  <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                    {marketStats.averageRating || 0}/5 ⭐
                  </p>
                </div>
                <Star className="h-6 w-6 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            {t('marketplace.searchAndFilter')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="relative md:col-span-2">
              <SearchInput
                placeholder={t('marketplace.searchProducts')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-12"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <VoiceButton
                  mode="listen"
                  onTranscript={handleVoiceSearch}
                  size="sm"
                  variant="ghost"
                />
              </div>
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder={t('marketplace.category')} />
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
              <SelectTrigger>
                <SelectValue placeholder={t('marketplace.location')} />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location.value} value={location.value}>
                    {location.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger>
                <SelectValue placeholder={t('marketplace.priceRange')} />
              </SelectTrigger>
              <SelectContent>
                {priceRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder={t('marketplace.sortBy')} />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="products" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="products">{t('marketplace.allProducts')}</TabsTrigger>
          <TabsTrigger value="featured">{t('marketplace.featured')}</TabsTrigger>
          <TabsTrigger value="sellers">{t('marketplace.topSellers')}</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 group">
                <CardContent className="p-0">
                  {/* Product Image */}
                  <div className="relative h-48 bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 rounded-t-lg overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                      <img 
                        src={product.images[0]} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl">
                        {product.category === 'cereals' ? '🌾' :
                         product.category === 'vegetables' ? '🥬' :
                         product.category === 'fruits' ? '🍎' : '🌱'}
                      </div>
                    )}
                    
                    {/* Badges */}
                    <div className="absolute top-2 left-2">
                      {product.isVerified && (
                        <Badge variant="success" className="text-xs">
                          <Shield className="w-3 h-3 mr-1" />
                          {t('marketplace.verified')}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="w-8 h-8 p-0 bg-white/80 hover:bg-white"
                        onClick={() => handleAddToWishlist(product.id)}
                      >
                        <Heart className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="w-8 h-8 p-0 bg-white/80 hover:bg-white"
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-primary">
                          {numberHelpers.formatCurrency(product.pricePerUnit)}
                        </span>
                        <span className="text-sm text-muted-foreground">/{product.unit}</span>
                      </div>
                      <Badge variant="outline">
                        {numberHelpers.formatNumber(product.quantity)} {product.unit}
                      </Badge>
                    </div>

                    {/* Seller Info */}
                    <div className="flex items-center justify-between py-2 border-t border-border/50">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-ag rounded-full flex items-center justify-center text-white text-xs font-medium">
                          {product.sellerName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{product.sellerName}</p>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                            <span className="text-xs text-muted-foreground">{product.sellerRating}/5</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3 inline mr-1" />
                        {product.location.district}
                      </div>
                    </div>

                    {/* Product Features */}
                    <div className="flex flex-wrap gap-1">
                      {product.features?.slice(0, 3).map((feature, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" className="flex-1">
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        {t('marketplace.buyNow')}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleContactSeller(product.sellerId)}
                      >
                        <MessageCircle className="w-4 h-4 mr-1" />
                        {t('marketplace.contact')}
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Additional Info */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/30">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {t('marketplace.listed')} {dateHelpers.formatRelativeTime(product.listedDate)}
                      </span>
                      {product.deliveryAvailable && (
                        <span className="flex items-center gap-1 text-green-600">
                          <Truck className="w-3 h-3" />
                          {t('marketplace.delivery')}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {t('marketplace.noProductsFound')}
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="featured">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product, index) => (
              <Card key={index} className="border-primary/20 bg-primary/5">
                {/* Similar structure to products tab but with featured styling */}
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <Badge variant="default">{t('marketplace.featured')}</Badge>
                  </div>
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-primary font-bold">
                    {numberHelpers.formatCurrency(product.pricePerUnit)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sellers">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sellers.map((seller, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-ag rounded-full flex items-center justify-center text-white text-xl font-bold">
                      {seller.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{seller.name}</h3>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="font-medium">{seller.rating}/5</span>
                        <span className="text-sm text-muted-foreground">({seller.reviewCount} reviews)</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>{t('marketplace.totalProducts')}:</span>
                      <span className="font-medium">{seller.totalProducts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('marketplace.successfulDeals')}:</span>
                      <span className="font-medium">{seller.successfulDeals}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('marketplace.location')}:</span>
                      <span className="font-medium">{seller.location}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button size="sm" className="flex-1">
                      <Eye className="w-4 h-4 mr-1" />
                      {t('marketplace.viewProfile')}
                    </Button>
                    <Button size="sm" variant="outline">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      {t('marketplace.contact')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default B2BMarketplace;
