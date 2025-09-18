// src/pages/features/GovernmentSchemes.jsx
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
  BookmarkCheck
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, SearchInput } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import VoiceButton from '@/components/common/VoiceButton';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { useDebounce } from '@/hooks/useDebounce';
import { governmentService } from '@/services/governmentService';
import { farmerService } from '@/services/farmerService';
import { dateHelpers, numberHelpers } from '@/utils/helpers';

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
  
  const debouncedSearch = useDebounce(searchQuery, 500);
  const { t } = useLanguage();
  const { user } = useAuth();

  useEffect(() => {
    loadSchemes();
    loadUserApplications();
    loadApplicationStats();
  }, []);

  useEffect(() => {
    filterSchemes();
  }, [debouncedSearch, selectedCategory, selectedState, statusFilter, schemes]);

  const loadSchemes = async () => {
    setIsLoading(true);
    
    try {
      const response = await governmentService.getAvailableSchemes({
        userLocation: user?.location,
        userRole: user?.role,
        includeEligibility: true
      });
      
      if (response.success) {
        setSchemes(response.data.schemes || []);
        setBookmarkedSchemes(response.data.bookmarkedSchemes || []);
      }
    } catch (error) {
      console.error('Failed to load schemes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserApplications = async () => {
    try {
      const response = await governmentService.getUserApplications({
        userId: user?.id
      });
      
      if (response.success) {
        setAppliedSchemes(response.data.applications || []);
      }
    } catch (error) {
      console.error('Failed to load user applications:', error);
    }
  };

  const loadApplicationStats = async () => {
    try {
      const response = await governmentService.getApplicationStats({
        userId: user?.id
      });
      
      if (response.success) {
        setApplicationStats(response.data.stats || {});
      }
    } catch (error) {
      console.error('Failed to load application stats:', error);
    }
  };

  const filterSchemes = () => {
    let filtered = [...schemes];

    // Search filter
    if (debouncedSearch) {
      filtered = filtered.filter(scheme => 
        scheme.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        scheme.description.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        scheme.department.toLowerCase().includes(debouncedSearch.toLowerCase())
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
            return daysSinceLaunch <= 30;
          default:
            return true;
        }
      });
    }

    setFilteredSchemes(filtered);
  };

  const handleVoiceSearch = (transcript) => {
    setSearchQuery(transcript);
  };

  const handleBookmark = async (schemeId) => {
    try {
      const isBookmarked = bookmarkedSchemes.includes(schemeId);
      const response = await governmentService.toggleBookmark({
        schemeId,
        userId: user?.id,
        action: isBookmarked ? 'remove' : 'add'
      });
      
      if (response.success) {
        if (isBookmarked) {
          setBookmarkedSchemes(prev => prev.filter(id => id !== schemeId));
        } else {
          setBookmarkedSchemes(prev => [...prev, schemeId]);
        }
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    }
  };

  const handleApplyScheme = async (schemeId) => {
    try {
      const response = await governmentService.startApplication({
        schemeId,
        userId: user?.id
      });
      
      if (response.success) {
        // Navigate to application form or external portal
        if (response.data.applicationUrl) {
          window.open(response.data.applicationUrl, '_blank');
        }
      }
    } catch (error) {
      console.error('Failed to start application:', error);
    }
  };

  const getEligibilityStatus = (scheme) => {
    const eligibility = scheme.userEligibility;
    if (eligibility?.isEligible) return { status: 'eligible', text: t('schemes.eligible'), color: 'success' };
    if (eligibility?.partialMatch) return { status: 'partial', text: t('schemes.partiallyEligible'), color: 'warning' };
    return { status: 'not_eligible', text: t('schemes.notEligible'), color: 'destructive' };
  };

  const getStatusBadge = (scheme) => {
    const now = new Date();
    const deadline = new Date(scheme.applicationDeadline);
    const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
    
    if (daysLeft <= 0) {
      return <Badge variant="destructive">{t('schemes.closed')}</Badge>;
    } else if (daysLeft <= 7) {
      return <Badge variant="destructive">{t('schemes.closingSoon')} ({daysLeft} days)</Badge>;
    } else if (daysLeft <= 30) {
      return <Badge variant="warning">{t('schemes.closing')} ({daysLeft} days)</Badge>;
    } else {
      return <Badge variant="success">{t('schemes.active')}</Badge>;
    }
  };

  const categories = [
    { value: 'all', label: t('schemes.allCategories') },
    { value: 'subsidy', label: t('schemes.subsidies') },
    { value: 'loan', label: t('schemes.loans') },
    { value: 'insurance', label: t('schemes.insurance') },
    { value: 'training', label: t('schemes.training') },
    { value: 'equipment', label: t('schemes.equipment') },
    { value: 'marketing', label: t('schemes.marketing') }
  ];

  const states = [
    { value: 'all', label: t('common.allStates') },
    { value: 'Punjab', label: 'Punjab' },
    { value: 'Haryana', label: 'Haryana' },  
    { value: 'Uttar Pradesh', label: 'Uttar Pradesh' },
    { value: 'Maharashtra', label: 'Maharashtra' },
    { value: 'Karnataka', label: 'Karnataka' }
  ];

  const statusFilters = [
    { value: 'all', label: t('schemes.allSchemes') },
    { value: 'active', label: t('schemes.activeSchemes') },
    { value: 'closing_soon', label: t('schemes.closingSoon') },
    { value: 'new', label: t('schemes.newSchemes') }
  ];

  if (isLoading) {
    return (
      <div className="p-6">
        <LoadingSpinner fullScreen text={t('schemes.loadingSchemes')} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            🏛️ {t('schemes.title')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('schemes.subtitle')}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <VoiceButton
            mode="listen"
            onTranscript={handleVoiceSearch}
            className="bg-gradient-ag text-white hover:shadow-lg"
          />
          <Badge variant="outline" className="px-3 py-1">
            {filteredSchemes.length} {t('schemes.available')}
          </Badge>
        </div>
      </div>

      {/* Application Stats */}
      {Object.keys(applicationStats).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400">{t('schemes.totalApplications')}</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{applicationStats.totalApplications || 0}</p>
                </div>
                <FileText className="h-6 w-6 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400">{t('schemes.approved')}</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">{applicationStats.approvedApplications || 0}</p>
                </div>
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">{t('schemes.pending')}</p>
                  <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{applicationStats.pendingApplications || 0}</p>
                </div>
                <Clock className="h-6 w-6 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 dark:text-purple-400">{t('schemes.totalBenefits')}</p>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                    {numberHelpers.formatCurrency(applicationStats.totalBenefitsReceived || 0)}
                  </p>
                </div>
                <Award className="h-6 w-6 text-purple-500" />
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
            {t('schemes.searchAndFilter')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <SearchInput
                placeholder={t('schemes.searchSchemes')}
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
                <SelectValue placeholder={t('schemes.category')} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger>
                <SelectValue placeholder={t('schemes.state')} />
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
              <SelectTrigger>
                <SelectValue placeholder={t('schemes.status')} />
              </SelectTrigger>
              <SelectContent>
                {statusFilters.map((filter) => (
                  <SelectItem key={filter.value} value={filter.value}>
                    {filter.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              {t('schemes.moreFilters')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="browse" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse">{t('schemes.browseSchemes')}</TabsTrigger>
          <TabsTrigger value="applied">{t('schemes.myApplications')}</TabsTrigger>
          <TabsTrigger value="bookmarked">{t('schemes.bookmarked')}</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredSchemes.map((scheme, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg leading-tight mb-2">{scheme.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{scheme.department}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(scheme)}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleBookmark(scheme.id)}
                        className="p-1"
                      >
                        {bookmarkedSchemes.includes(scheme.id) ? (
                          <BookmarkCheck className="h-4 w-4 text-primary" />
                        ) : (
                          <Bookmark className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm leading-relaxed line-clamp-3">{scheme.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="space-y-2">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-green-500" />
                        <span className="text-muted-foreground">{t('schemes.benefit')}:</span>
                      </div>
                      <p className="font-medium text-green-600">
                        {scheme.benefitType === 'amount' 
                          ? numberHelpers.formatCurrency(scheme.benefitAmount)
                          : scheme.benefitDescription
                        }
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-blue-500" />
                        <span className="text-muted-foreground">{t('schemes.deadline')}:</span>
                      </div>
                      <p className="font-medium text-blue-600">
                        {dateHelpers.formatDate(scheme.applicationDeadline, 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-purple-500" />
                      <span className="text-muted-foreground">{t('schemes.applicableIn')}:</span>
                      <span className="font-medium">{scheme.applicableStates.slice(0, 2).join(', ')}</span>
                      {scheme.applicableStates.length > 2 && (
                        <span className="text-muted-foreground">+{scheme.applicableStates.length - 2} more</span>
                      )}
                    </div>
                  </div>

                  {/* Eligibility Status */}
                  <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{t('schemes.eligibility')}:</span>
                      <Badge variant={getEligibilityStatus(scheme).color}>
                        {getEligibilityStatus(scheme).text}
                      </Badge>
                    </div>
                    {scheme.userEligibility?.matchingCriteria && (
                      <span className="text-xs text-muted-foreground">
                        {scheme.userEligibility.matchingCriteria}/{scheme.totalCriteria} {t('schemes.criteria')}
                      </span>
                    )}
                  </div>

                  {/* Quick Info */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {scheme.applicationsReceived || 0} {t('schemes.applied')}
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {scheme.successRate || 0}% {t('schemes.successRate')}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleApplyScheme(scheme.id)}
                      disabled={!getEligibilityStatus(scheme).status === 'eligible'}
                    >
                      {t('schemes.applyNow')}
                    </Button>
                    <Button size="sm" variant="outline">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      {t('schemes.details')}
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-3 w-3 mr-1" />
                      {t('schemes.brochure')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredSchemes.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {t('schemes.noSchemesFound')}
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="applied" className="space-y-6">
          <div className="space-y-4">
            {appliedSchemes.map((application, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-lg">{application.schemeName}</h4>
                      <p className="text-sm text-muted-foreground">{application.department}</p>
                    </div>
                    <Badge variant={
                      application.status === 'approved' ? 'success' :
                      application.status === 'rejected' ? 'destructive' :
                      application.status === 'under_review' ? 'warning' : 'secondary'
                    }>
                      {application.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">{t('schemes.applicationDate')}</p>
                      <p className="font-medium">{dateHelpers.formatDate(application.appliedDate)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t('schemes.applicationId')}</p>
                      <p className="font-medium font-mono">{application.applicationId}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t('schemes.expectedBenefit')}</p>
                      <p className="font-medium text-green-600">{numberHelpers.formatCurrency(application.expectedBenefit)}</p>
                    </div>
                  </div>

                  {application.status === 'under_review' && application.progress && (
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span>{t('schemes.applicationProgress')}</span>
                        <span>{application.progress}%</span>
                      </div>
                      <Progress value={application.progress} />
                    </div>
                  )}

                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      {t('schemes.trackStatus')}
                    </Button>
                    {application.documents && (
                      <Button size="sm" variant="outline">
                        <Download className="h-3 w-3 mr-1" />
                        {t('schemes.downloadDocuments')}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="bookmarked" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {schemes.filter(scheme => bookmarkedSchemes.includes(scheme.id)).map((scheme, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                {/* Similar structure to browse tab but for bookmarked schemes */}
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-lg">{scheme.name}</h4>
                      <p className="text-sm text-muted-foreground">{scheme.department}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleBookmark(scheme.id)}
                      className="p-1"
                    >
                      <BookmarkCheck className="h-4 w-4 text-primary" />
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

export default GovernmentSchemes;
