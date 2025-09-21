// src/components/layout/Sidebar.jsx - SIMPLE SMART SENSORS TOOLTIP
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Wheat, 
  TrendingUp, 
  Cloud, 
  MessageCircle, 
  Award, 
  ShoppingCart,
  Camera,
  HelpCircle,
  LogOut,
  ChevronDown,
  ChevronRight,
  Calculator,
  Building,
  Microscope,
  Users,
  MessageSquare,
  Phone,
  BarChart3,
  FileText,
  Bell,
  Shield,
  Wifi // ✅ SMART SENSORS ICON
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';

const Sidebar = ({ isOpen, onClose, onOpenChatbot }) => {
  const [expandedSections, setExpandedSections] = useState(['explore']);
  const [sensorTooltipPosition, setSensorTooltipPosition] = useState({ x: 0, y: 0 });
  const [showSensorTooltip, setShowSensorTooltip] = useState(false);
  const { user, logout } = useAuth();
  const { currentLanguage } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ CLOSE ON ROUTE CHANGE (MOBILE)
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [location.pathname]);

  const getNavigationItems = () => {
    return [
      {
        section: 'explore',
        title: currentLanguage === 'hi' ? 'मुख्य सुविधाएं' : 'Main Features',
        icon: Wheat,
        items: [
          {
            icon: Home,
            label: currentLanguage === 'hi' ? 'डैशबोर्ड' : 'Dashboard',
            href: user ? '/dashboard/farmer' : '/',
            badge: null,
            requiresLogin: false
          },
          {
            icon: Wheat,
            label: currentLanguage === 'hi' ? 'फसल सुझाव' : 'Crop Recommendations',
            href: '/crop-recommendations',
            badge: 'GPS',
            requiresLogin: true
          },
          {
            icon: Camera,
            label: currentLanguage === 'hi' ? 'रोग पहचान' : 'Disease Detection',
            href: '/disease-detection',
            badge: 'AI',
            requiresLogin: true
          },
          {
            icon: TrendingUp,
            label: currentLanguage === 'hi' ? 'बाजार भाव' : 'Market Prices',
            href: '/market',
            badge: 'Live',
            requiresLogin: false
          },
          {
            icon: Cloud,
            label: currentLanguage === 'hi' ? 'मौसम अलर्ट' : 'Weather Alerts',
            href: '/weather-alerts',
            badge: '7-Day',
            requiresLogin: false
          },
          {
            icon: Calculator,
            label: currentLanguage === 'hi' ? 'मिट्टी स्वास्थ्य' : 'Soil Health',
            href: '/soil-health',
            badge: 'NPK',
            requiresLogin: true
          },
          {
            icon: Shield,
            label: currentLanguage === 'hi' ? 'अपनी फसल बचाएं' : 'Save Your Harvest',
            href: '/save-harvest',
            badge: 'New',
            requiresLogin: true
          },
          {
            icon: ShoppingCart,
            label: currentLanguage === 'hi' ? 'B2B मार्केट' : 'B2B Marketplace',
            href: '/marketplace',
            badge: 'B2B',
            requiresLogin: true
          },
          {
            icon: Building,
            label: currentLanguage === 'hi' ? 'सरकारी योजनाएं' : 'Government Schemes',
            href: '/schemes',
            badge: '2025',
            requiresLogin: true
          },
          // ✅ NEW: SMART SENSORS - AFTER GOVERNMENT SCHEMES
          {
            icon: Wifi,
            label: currentLanguage === 'hi' ? 'स्मार्ट सेंसर कनेक्ट' : 'Connect Sensors',
            href: 'sensors',
            badge: 'IoT',
            requiresLogin: true,
            isComingSoon: true
          }
        ]
      }
    ];
  };

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => 
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  // ✅ HANDLE SENSOR HOVER
  const handleSensorHover = (event, show) => {
    if (show) {
      const rect = event.currentTarget.getBoundingClientRect();
      setSensorTooltipPosition({
        x: rect.right + 10,
        y: rect.top
      });
      setShowSensorTooltip(true);
    } else {
      setShowSensorTooltip(false);
    }
  };

  // ✅ MODIFIED NAVIGATION HANDLER
  const handleNavigation = (item) => {
    // ✅ CHECK IF IT'S COMING SOON FEATURE
    if (item.isComingSoon) {
      // Just show the tooltip, don't navigate
      return;
    }

    // ✅ CHECK IF IT'S THE CHATBOT
    if (item.isChatbot) {
      if (!user) {
        navigate('/login');
        return;
      }
      
      console.log('🤖 Opening chatbot from sidebar');
      
      // ✅ OPEN CHATBOT INSTEAD OF NAVIGATING
      if (onOpenChatbot && typeof onOpenChatbot === 'function') {
        onOpenChatbot();
      } else {
        console.warn('onOpenChatbot function not provided to Sidebar');
      }
      
      // ✅ CLOSE SIDEBAR ON MOBILE
      if (onClose && window.innerWidth < 1024) {
        onClose();
      }
      return;
    }

    // ✅ NORMAL NAVIGATION FOR OTHER ITEMS
    if (item.requiresLogin && !user) {
      navigate('/login');
      return;
    }
    
    navigate(item.href);
    
    // ✅ AUTO-CLOSE ON MOBILE
    if (onClose && window.innerWidth < 1024) {
      onClose();
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
    if (onClose) onClose();
  };

  const navigationItems = getNavigationItems();

  return (
    <>
      {/* ✅ MOBILE OVERLAY WITH HIGHER Z-INDEX */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300" 
          onClick={onClose}
          style={{ touchAction: 'none' }}
        />
      )}

      {/* ✅ SIMPLE SENSOR TOOLTIP */}
      {showSensorTooltip && (
        <div 
          className="fixed z-[70] pointer-events-none"
          style={{
            left: `${sensorTooltipPosition.x}px`,
            top: `${sensorTooltipPosition.y}px`,
            transform: 'translateY(-50%)'
          }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 max-w-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Wifi className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                  {currentLanguage === 'hi' ? 'स्मार्ट फार्म सेंसर' : 'Smart Farm Sensors'}
                </h4>
                <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                  {currentLanguage === 'hi' ? 'जल्द आ रहा है!' : 'Coming Soon!'}
                </p>
              </div>
            </div>
            
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
              {currentLanguage === 'hi' 
                ? 'खेत में रियल-टाइम डेटा पाएं: मिट्टी की नमी, pH, NPK। मोबाइल पर तुरंत अलर्ट।'
                : 'Get real-time farm data: Soil moisture, pH, NPK. Instant mobile alerts.'
              }
            </p>
            
            <div className="space-y-1 text-xs">
              {[
                currentLanguage === 'hi' ? '📡 रियल-टाइम मॉनिटरिंग' : '📡 Real-time Monitoring',
                currentLanguage === 'hi' ? '💧 स्मार्ट सिंचाई अलर्ट' : '💧 Smart Irrigation Alerts',
                currentLanguage === 'hi' ? '🧪 मिट्टी विश्लेषण' : '🧪 Soil Analysis',
                currentLanguage === 'hi' ? '☀️ सोलर पावर्ड' : '☀️ Solar Powered'
              ].map((feature, idx) => (
                <div key={idx} className="text-gray-700 dark:text-gray-300">
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ✅ SIDEBAR WITH PROPER Z-INDEX AND SCROLL */}
      <div 
        className={cn(
          "fixed top-0 left-0 z-50 w-72 bg-gradient-to-b from-green-50 to-emerald-50 dark:from-gray-900 dark:to-green-950/20 border-r border-green-200 dark:border-gray-700 transform transition-all duration-300 ease-in-out lg:translate-x-0 shadow-2xl lg:shadow-none lg:z-30",
          "h-screen flex flex-col overflow-hidden",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* ✅ HEADER - FIXED */}
        <div className="p-6 border-b border-green-200 dark:border-gray-700 bg-gradient-to-r from-green-600 to-emerald-600 lg:hidden flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-xl backdrop-blur-sm">
              <span className="text-white font-bold text-xl">🌾</span>
            </div>
            <div>
              <h2 className="font-bold text-xl text-white">कृषि सहायक</h2>
              <p className="text-xs text-green-100 font-medium">
                {currentLanguage === 'hi' ? 'स्मार्ट खेती प्लेटफॉर्म' : 'Smart Farming Platform'}
              </p>
            </div>
          </div>
        </div>

        {/* ✅ USER PROFILE - FIXED */}
        {user && (
          <div className="p-4 border-b border-green-200 dark:border-gray-700 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 flex-shrink-0">
            <div className="flex items-center gap-3 p-3 bg-white/70 dark:bg-gray-800/70 rounded-xl backdrop-blur-sm border border-white/50 dark:border-gray-700/50">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center text-white font-semibold shadow-lg">
                <span className="text-lg">{user.name?.charAt(0)?.toUpperCase() || 'F'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {user.name || 'Farmer'}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 font-medium capitalize">
                  {currentLanguage === 'hi' ? 'किसान' : 'Farmer'}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600 dark:text-green-400">
                    {currentLanguage === 'hi' ? 'ऑनलाइन' : 'Online'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ✅ LOGIN MESSAGE - FIXED */}
        {!user && (
          <div className="p-4 border-b border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50 flex-shrink-0">
            <div className="text-center p-4 bg-white/70 rounded-xl border border-orange-200">
              <Users className="h-8 w-8 mx-auto text-orange-600 mb-2" />
              <h3 className="font-semibold text-orange-800 mb-1 text-sm">
                {currentLanguage === 'hi' ? 'लॉगिन करें' : 'Login Required'}
              </h3>
              <p className="text-xs text-orange-600 mb-3">
                {currentLanguage === 'hi' ? 'सुविधाएं देखने के लिए' : 'To access features'}
              </p>
              <Button 
                size="sm" 
                className="bg-orange-600 hover:bg-orange-700 text-white text-xs"
                onClick={() => {
                  navigate('/login');
                  if (onClose) onClose();
                }}
              >
                {currentLanguage === 'hi' ? 'लॉगिन' : 'Login'}
              </Button>
            </div>
          </div>
        )}

        {/* ✅ NAVIGATION - SCROLLABLE WITH PROPER TOUCH */}
        <div 
          className="flex-1 overflow-y-auto overflow-x-hidden"
          style={{
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgb(34 197 94) transparent'
          }}
        >
          <nav className="p-4 space-y-2 pb-8">
            {navigationItems.map((section) => (
              <div key={section.section} className="space-y-1">
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.section)}
                  className="flex items-center justify-between w-full px-3 py-2 text-sm font-semibold text-green-700 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg transition-all duration-200 group"
                  style={{ touchAction: 'manipulation' }}
                >
                  <div className="flex items-center gap-2">
                    <section.icon className="h-4 w-4" />
                    {section.title}
                  </div>
                  {expandedSections.includes(section.section) ? (
                    <ChevronDown className="h-3 w-3 group-hover:scale-110 transition-transform" />
                  ) : (
                    <ChevronRight className="h-3 w-3 group-hover:scale-110 transition-transform" />
                  )}
                </button>

                {/* Section Items */}
                {expandedSections.includes(section.section) && (
                  <div className="space-y-1 ml-4 pl-2 border-l-2 border-green-200 dark:border-green-800">
                    {section.items.map((item) => {
                      const isActive = !item.isChatbot && !item.isComingSoon && location.pathname === item.href;
                      const Icon = item.icon;
                      const needsLogin = item.requiresLogin && !user;

                      return (
                        <button
                          key={item.href}
                          onClick={() => handleNavigation(item)}
                          onMouseEnter={(e) => item.isComingSoon && handleSensorHover(e, true)}
                          onMouseLeave={(e) => item.isComingSoon && handleSensorHover(e, false)}
                          className={cn(
                            "flex items-center gap-3 w-full px-3 py-2.5 text-sm rounded-lg transition-all duration-200 group relative overflow-hidden",
                            isActive
                              ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/25 border-l-4 border-white/30"
                              : needsLogin
                              ? "hover:bg-orange-100 dark:hover:bg-orange-900/20 text-gray-500 dark:text-gray-400 hover:text-orange-700 dark:hover:text-orange-400"
                              : item.isChatbot
                              ? "hover:bg-blue-100 dark:hover:bg-blue-900/20 text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-400 hover:shadow-md"
                              : item.isComingSoon
                              ? "hover:bg-purple-100 dark:hover:bg-purple-900/20 text-gray-700 dark:text-gray-300 hover:text-purple-700 dark:hover:text-purple-400 hover:shadow-md cursor-pointer"
                              : "hover:bg-green-100 dark:hover:bg-green-900/20 text-gray-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400 hover:shadow-md"
                          )}
                          style={{ touchAction: 'manipulation' }}
                        >
                          <Icon className={cn(
                            "h-4 w-4 flex-shrink-0 transition-all duration-200",
                            isActive 
                              ? "text-white" 
                              : needsLogin 
                              ? "text-gray-400" 
                              : item.isComingSoon
                              ? "text-purple-600 dark:text-purple-400"
                              : "group-hover:scale-110"
                          )} />
                          <span className="flex-1 text-left font-medium">{item.label}</span>
                          
                          {/* Login Required Badge */}
                          {needsLogin && (
                            <Badge 
                              variant="outline" 
                              className="text-xs text-orange-600 border-orange-300 bg-orange-50"
                            >
                              🔒
                            </Badge>
                          )}
                          
                          {/* Feature Badge */}
                          {item.badge && !needsLogin && (
                            <Badge 
                              variant="secondary"
                              className={cn(
                                "text-xs font-semibold px-2 py-1",
                                isActive && "bg-white/20 text-white",
                                item.isChatbot && "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
                                item.isComingSoon && "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100 animate-pulse",
                                item.href === '/save-harvest' && "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100"
                              )}
                            >
                              {item.badge}
                            </Badge>
                          )}
                          
                          {/* Active indicator */}
                          {isActive && (
                            <div className="absolute left-0 top-0 w-1 h-full bg-yellow-400 rounded-r-full"></div>
                          )}

                          {/* ✅ SENSOR INDICATOR */}
                          {item.isComingSoon && (
                            <div className="absolute right-1 top-1 w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                          )}

                          {/* ✅ SAVE YOUR HARVEST INDICATOR */}
                          {item.href === '/save-harvest' && (
                            <div className="absolute right-1 top-1 w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* ✅ FOOTER - FIXED */}
        <div className="p-4 border-t border-green-200 dark:border-gray-700 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-green-900/10 space-y-2 flex-shrink-0">
          {/* Logout */}
          {user && (
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20 group"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-3 group-hover:-translate-x-1 transition-transform duration-200" />
              {currentLanguage === 'hi' ? 'लॉग आउट' : 'Logout'}
            </Button>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
