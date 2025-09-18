// src/components/layout/Sidebar.jsx - BEAUTIFUL & IMPROVED
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Wheat, 
  TrendingUp, 
  Cloud, 
  Users, 
  MessageCircle, 
  Award, 
  Settings,
  BarChart3,
  ShoppingCart,
  Camera,
  FileText,
  HelpCircle,
  LogOut,
  ChevronDown,
  ChevronRight,
  Bell,
  User,
  Shield,
  Zap,
  Calendar,
  PieChart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';

const Sidebar = ({ isOpen, onClose }) => {
  const [expandedSections, setExpandedSections] = useState(['main', 'farming']);
  const { user, logout } = useAuth();
  const { currentLanguage, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  // Get role-based navigation items
  const getNavigationItems = () => {
    const mainSection = {
      section: 'main',
      title: currentLanguage === 'hi' ? 'मुख्य' : 'Main',
      icon: Home,
      items: [
        {
          icon: Home,
          label: currentLanguage === 'hi' ? 'डैशबोर्ड' : 'Dashboard',
          href: user ? (user.role === 'farmer' ? '/dashboard/farmer' : '/dashboard') : '/',
          badge: null
        }
      ]
    };

    if (user?.role === 'farmer') {
      return [
        mainSection,
        {
          section: 'farming',
          title: currentLanguage === 'hi' ? 'खेती बाड़ी' : 'Smart Farming',
          icon: Wheat,
          items: [
            {
              icon: Wheat,
              label: currentLanguage === 'hi' ? 'फसल प्रबंधन' : 'Crop Management',
              href: '/crops',
              badge: null
            },
            {
              icon: Camera,
              label: currentLanguage === 'hi' ? 'रोग पहचान' : 'Disease Detection',
              href: '/disease-detection',
              badge: 'AI'
            },
            {
              icon: TrendingUp,
              label: currentLanguage === 'hi' ? 'बाजार भाव' : 'Market Prices',
              href: '/market-prices',
              badge: 'Live'
            },
            {
              icon: Cloud,
              label: currentLanguage === 'hi' ? 'मौसम पूर्वानुमान' : 'Weather Forecast',
              href: '/weather',
              badge: null
            },
            {
              icon: Award,
              label: currentLanguage === 'hi' ? 'सरकारी योजनाएं' : 'Govt Schemes',
              href: '/schemes',
              badge: 'New'
            }
          ]
        },
        {
          section: 'tools',
          title: currentLanguage === 'hi' ? 'AI उपकरण' : 'AI Tools',
          icon: Zap,
          items: [
            {
              icon: MessageCircle,
              label: currentLanguage === 'hi' ? 'AI सहायक' : 'AI Assistant',
              href: '/ai-chat',
              badge: '24/7'
            },
            {
              icon: BarChart3,
              label: currentLanguage === 'hi' ? 'उत्पादन विश्लेषण' : 'Yield Analytics',
              href: '/analytics',
              badge: null
            },
            {
              icon: PieChart,
              label: currentLanguage === 'hi' ? 'फसल रिपोर्ट' : 'Crop Reports',
              href: '/reports',
              badge: null
            },
            {
              icon: Calendar,
              label: currentLanguage === 'hi' ? 'कृषि कैलेंडर' : 'Farm Calendar',
              href: '/calendar',
              badge: null
            }
          ]
        }
      ];
    }

    if (user?.role === 'buyer') {
      return [
        mainSection,
        {
          section: 'marketplace',
          title: currentLanguage === 'hi' ? 'बाज़ार' : 'Marketplace',
          icon: ShoppingCart,
          items: [
            {
              icon: ShoppingCart,
              label: currentLanguage === 'hi' ? 'फसल खरीदें' : 'Buy Crops',
              href: '/browse',
              badge: null
            },
            {
              icon: Users,
              label: currentLanguage === 'hi' ? 'किसान नेटवर्क' : 'Farmer Network',
              href: '/farmers',
              badge: null
            },
            {
              icon: TrendingUp,
              label: currentLanguage === 'hi' ? 'मार्केट ट्रेंड' : 'Market Trends',
              href: '/market-trends',
              badge: null
            },
            {
              icon: FileText,
              label: currentLanguage === 'hi' ? 'मेरे ऑर्डर' : 'My Orders',
              href: '/orders',
              badge: '3'
            }
          ]
        }
      ];
    }

    // Public navigation for non-authenticated users
    return [
      {
        section: 'explore',
        title: currentLanguage === 'hi' ? 'एक्सप्लोर करें' : 'Explore',
        icon: Wheat,
        items: [
          {
            icon: Home,
            label: currentLanguage === 'hi' ? 'होम' : 'Home',
            href: '/',
            badge: null
          },
          {
            icon: Wheat,
            label: currentLanguage === 'hi' ? 'फसल जानकारी' : 'Crop Info',
            href: '/crops',
            badge: null
          },
          {
            icon: TrendingUp,
            label: currentLanguage === 'hi' ? 'बाजार भाव' : 'Market Prices',
            href: '/market-prices',
            badge: null
          },
          {
            icon: Cloud,
            label: currentLanguage === 'hi' ? 'मौसम' : 'Weather',
            href: '/weather',
            badge: null
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

  const handleNavigation = (href) => {
    navigate(href);
    if (onClose) onClose();
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
    if (onClose) onClose();
  };

  const navigationItems = getNavigationItems();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300" 
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-72 bg-gradient-to-b from-green-50 to-emerald-50 dark:from-gray-900 dark:to-green-950/20 border-r border-green-200 dark:border-gray-700 transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto shadow-2xl lg:shadow-none",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-green-200 dark:border-gray-700 bg-gradient-to-r from-green-600 to-emerald-600 lg:hidden">
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

        {/* User Profile Section */}
        {user && (
          <div className="p-4 border-b border-green-200 dark:border-gray-700 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30">
            <div className="flex items-center gap-3 p-3 bg-white/70 dark:bg-gray-800/70 rounded-xl backdrop-blur-sm border border-white/50 dark:border-gray-700/50">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center text-white font-semibold shadow-lg">
                {user.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-lg">{user.name?.charAt(0)?.toUpperCase()}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {user.name}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 font-medium capitalize">
                  {user.role === 'farmer' ? (currentLanguage === 'hi' ? 'किसान' : 'Farmer') : user.role}
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

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigationItems.map((section) => (
            <div key={section.section} className="space-y-1">
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.section)}
                className="flex items-center justify-between w-full px-3 py-2 text-sm font-semibold text-green-700 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg transition-all duration-200 group"
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
                    const isActive = location.pathname === item.href;
                    const Icon = item.icon;

                    return (
                      <button
                        key={item.href}
                        onClick={() => handleNavigation(item.href)}
                        className={cn(
                          "flex items-center gap-3 w-full px-3 py-2.5 text-sm rounded-lg transition-all duration-200 group relative overflow-hidden",
                          isActive
                            ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/25 border-l-4 border-white/30"
                            : "hover:bg-green-100 dark:hover:bg-green-900/20 text-gray-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400 hover:shadow-md"
                        )}
                      >
                        <Icon className={cn(
                          "h-4 w-4 flex-shrink-0 transition-all duration-200",
                          isActive ? "text-white" : "group-hover:scale-110"
                        )} />
                        <span className="flex-1 text-left font-medium">{item.label}</span>
                        {item.badge && (
                          <Badge 
                            variant={
                              item.badge === 'New' || item.badge === 'AI' ? 'success' : 
                              item.badge === 'Live' || item.badge === '24/7' ? 'destructive' : 
                              'secondary'
                            }
                            className={cn(
                              "text-xs font-semibold px-2 py-1 animate-pulse",
                              isActive && "bg-white/20 text-white"
                            )}
                          >
                            {item.badge}
                          </Badge>
                        )}
                        {/* Active indicator */}
                        {isActive && (
                          <div className="absolute left-0 top-0 w-1 h-full bg-yellow-400 rounded-r-full"></div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-green-200 dark:border-gray-700 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-green-900/10 space-y-2">
          {/* Settings */}
          <Button
            variant="ghost"
            className="w-full justify-start hover:bg-green-100 dark:hover:bg-green-900/20 text-gray-700 dark:text-gray-300 hover:text-green-700 group"
            onClick={() => handleNavigation('/settings')}
          >
            <Settings className="h-4 w-4 mr-3 group-hover:rotate-45 transition-transform duration-200" />
            {currentLanguage === 'hi' ? 'सेटिंग्स' : 'Settings'}
          </Button>
          
          {/* Help */}
          <Button
            variant="ghost"
            className="w-full justify-start hover:bg-blue-100 dark:hover:bg-blue-900/20 text-gray-700 dark:text-gray-300 hover:text-blue-700 group"
            onClick={() => handleNavigation('/help')}
          >
            <HelpCircle className="h-4 w-4 mr-3 group-hover:scale-110 transition-transform duration-200" />
            {currentLanguage === 'hi' ? 'सहायता' : 'Help Center'}
          </Button>

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

          {/* Made in India */}
          <div className="mt-4 pt-4 border-t border-green-200 dark:border-gray-700">
            <div className="text-center p-2 bg-gradient-to-r from-orange-100 via-white to-green-100 dark:from-orange-900/20 dark:via-gray-800 dark:to-green-900/20 rounded-lg border">
              <div className="flex items-center justify-center gap-1 text-xs font-semibold">
                <span>🇮🇳</span>
                <span className="text-orange-600 dark:text-orange-400">Made</span>
                <span className="text-gray-600 dark:text-gray-400">in</span>
                <span className="text-green-600 dark:text-green-400">India</span>
                <span>🌾</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
