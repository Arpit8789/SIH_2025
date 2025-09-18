// src/components/layout/Header.jsx - BEAUTIFUL & RESPONSIVE
import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { 
  Menu, 
  X, 
  Bell, 
  User, 
  Search, 
  Globe, 
  Moon, 
  Sun, 
  ChevronDown,
  Settings,
  LogOut,
  Home,
  BarChart3,
  Cloud,
  MessageCircle,
  Camera,
  HelpCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/hooks/useLanguage'
import { useTheme } from '@/context/ThemeContext'
import { useWeather } from '@/hooks/useWeather'
import { useDebounce } from '@/hooks/useDebounce'
import { cn } from '@/lib/utils'

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [weatherData, setWeatherData] = useState(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const debouncedSearch = useDebounce(searchQuery, 300)

  const { user, isAuthenticated, logout } = useAuth()
  const { currentLanguage, changeLanguage, availableLanguages, t } = useLanguage()
  const { toggleTheme, isDark } = useTheme()
  const { getCurrentWeather } = useWeather()
  
  const navigate = useNavigate()
  const location = useLocation()

  // Get weather data for header widget
  useEffect(() => {
    if (isAuthenticated && user?.role === 'farmer') {
      getCurrentWeather().then(data => {
        if (data) {
          setWeatherData(data)
        }
      }).catch(() => {
        // Silently handle weather error
      })
    }
  }, [isAuthenticated, user, getCurrentWeather])

  // Handle search
  useEffect(() => {
    if (debouncedSearch) {
      navigate(`/search?q=${encodeURIComponent(debouncedSearch)}`)
    }
  }, [debouncedSearch, navigate])

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  const handleLogout = async () => {
    await logout()
    navigate('/')
    setIsMobileMenuOpen(false)
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return currentLanguage === 'hi' ? 'सुप्रभात' : 'Good Morning'
    if (hour < 17) return currentLanguage === 'hi' ? 'नमस्कार' : 'Good Afternoon'
    return currentLanguage === 'hi' ? 'शुभ संध्या' : 'Good Evening'
  }

  const getWeatherIcon = (condition) => {
    const conditionMap = {
      'clear': '☀️',
      'clouds': '☁️',
      'rain': '🌧️',
      'thunderstorm': '⛈️',
      'snow': '❄️',
      'mist': '🌫️',
    }
    return conditionMap[condition?.toLowerCase()] || '🌤️'
  }

  // Navigation items for mobile menu
  const navigationItems = [
    {
      label: currentLanguage === 'hi' ? 'होम' : 'Home',
      href: '/',
      icon: Home
    },
    {
      label: currentLanguage === 'hi' ? 'डैशबोर्ड' : 'Dashboard',
      href: '/dashboard',
      icon: BarChart3,
      authRequired: true
    },
    {
      label: currentLanguage === 'hi' ? 'बाजार भाव' : 'Market Prices',
      href: '/market-prices',
      icon: BarChart3
    },
    {
      label: currentLanguage === 'hi' ? 'मौसम' : 'Weather',
      href: '/weather',
      icon: Cloud
    },
    {
      label: currentLanguage === 'hi' ? 'AI सहायक' : 'AI Assistant',
      href: '/ai-chat',
      icon: MessageCircle
    },
    {
      label: currentLanguage === 'hi' ? 'फसल जांच' : 'Crop Check',
      href: '/disease-detection',
      icon: Camera,
      authRequired: true
    },
    {
      label: currentLanguage === 'hi' ? 'सहायता' : 'Help',
      href: '/help',
      icon: HelpCircle
    }
  ]

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          {/* Mobile Menu Button & Logo */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden hover:bg-green-100 dark:hover:bg-green-900/20"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-200">
                <span className="text-white font-bold text-lg">🌾</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="font-bold text-xl bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
                  कृषि सहायक
                </h1>
                <p className="text-xs text-muted-foreground font-medium">
                  {currentLanguage === 'hi' ? 'स्मार्ट खेती' : 'Smart Farming'}
                </p>
              </div>
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={currentLanguage === 'hi' ? 'फसल, मौसम, भाव खोजें...' : 'Search crops, weather, prices...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 w-full border-green-200 focus:border-green-400 dark:border-green-800 dark:focus:border-green-600"
              />
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2">
            {/* Weather Widget - For Farmers */}
            {user?.role === 'farmer' && weatherData && (
              <div className="hidden lg:flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-lg border border-blue-200 dark:border-blue-800 shadow-sm">
                <span className="text-lg">
                  {getWeatherIcon(weatherData.current?.condition?.main)}
                </span>
                <div className="text-sm">
                  <div className="font-semibold text-blue-700 dark:text-blue-400">
                    {Math.round(weatherData.current?.temperature || 28)}°C
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-500">
                    {weatherData.location?.name || 'Punjab'}
                  </div>
                </div>
              </div>
            )}

            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-green-100 dark:hover:bg-green-900/20">
                  <Globe className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>
                  {currentLanguage === 'hi' ? 'भाषा चुनें' : 'Choose Language'}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => changeLanguage('hi')}>
                  <span className="mr-2">🇮🇳</span>
                  हिंदी
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage('en')}>
                  <span className="mr-2">🇬🇧</span>
                  English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage('pa')}>
                  <span className="mr-2">🇮🇳</span>
                  ਪੰਜਾਬੀ
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="hover:bg-yellow-100 dark:hover:bg-yellow-900/20"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="h-4 w-4 text-yellow-600" /> : <Moon className="h-4 w-4 text-slate-600" />}
            </Button>

            {/* Notifications - Only for authenticated users */}
            {isAuthenticated && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/notifications')}
                className="relative hover:bg-red-100 dark:hover:bg-red-900/20"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs animate-pulse"
                >
                  3
                </Badge>
              </Button>
            )}

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="hidden lg:flex flex-col text-right text-sm">
                  <span className="font-semibold text-green-700 dark:text-green-400">
                    {getGreeting()}, {user?.name?.split(' ')[0]}! 👋
                  </span>
                  <span className="text-xs text-muted-foreground capitalize">
                    {user?.role === 'farmer' ? (currentLanguage === 'hi' ? 'किसान' : 'Farmer') : user?.role}
                  </span>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      {user?.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt={user.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center text-white text-sm font-semibold shadow-lg">
                          {user?.name?.charAt(0)?.toUpperCase()}
                        </div>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>{currentLanguage === 'hi' ? 'प्रोफाइल' : 'Profile'}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/settings')}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>{currentLanguage === 'hi' ? 'सेटिंग्स' : 'Settings'}</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>{currentLanguage === 'hi' ? 'लॉग आउट' : 'Logout'}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/login')}
                  className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900/20"
                >
                  {currentLanguage === 'hi' ? 'लॉगिन' : 'Login'}
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate('/register')}
                  className="hidden sm:inline-flex bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {currentLanguage === 'hi' ? 'रजिस्टर' : 'Register'}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden border-t px-4 py-3 bg-green-50/50 dark:bg-green-950/20">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={currentLanguage === 'hi' ? 'फसल, मौसम, भाव खोजें...' : 'Search crops, weather, prices...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 w-full border-green-200 focus:border-green-400"
            />
          </div>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-40 md:hidden">
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="relative bg-background border-r shadow-2xl w-80 h-full overflow-y-auto">
            <div className="p-6">
              {/* User Info Section */}
              {isAuthenticated && (
                <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center text-white text-lg font-semibold shadow-lg">
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-green-700 dark:text-green-400">
                        {getGreeting()}!
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-500">
                        {user?.name}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {user?.role === 'farmer' ? (currentLanguage === 'hi' ? 'किसान' : 'Farmer') : user?.role}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Weather Widget for Mobile */}
              {user?.role === 'farmer' && weatherData && (
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {getWeatherIcon(weatherData.current?.condition?.main)}
                    </span>
                    <div>
                      <p className="font-semibold text-blue-700 dark:text-blue-400">
                        {Math.round(weatherData.current?.temperature || 28)}°C
                      </p>
                      <p className="text-sm text-blue-600 dark:text-blue-500">
                        {weatherData.location?.name || 'Punjab'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Items */}
              <nav className="space-y-2">
                {navigationItems.map((item, index) => {
                  if (item.authRequired && !isAuthenticated) return null
                  
                  return (
                    <Link
                      key={index}
                      to={item.href}
                      className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/20 transition-colors group"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <item.icon className="h-5 w-5 text-green-600 group-hover:text-green-700" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  )
                })}
              </nav>

              {/* Mobile-only Actions */}
              <div className="mt-6 pt-6 border-t space-y-2">
                {isAuthenticated && (
                  <>
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <User className="h-5 w-5" />
                      <span>{currentLanguage === 'hi' ? 'प्रोफाइल' : 'Profile'}</span>
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Settings className="h-5 w-5" />
                      <span>{currentLanguage === 'hi' ? 'सेटिंग्स' : 'Settings'}</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors text-red-600 w-full text-left"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>{currentLanguage === 'hi' ? 'लॉग आउट' : 'Logout'}</span>
                    </button>
                  </>
                )}
                
                {!isAuthenticated && (
                  <div className="space-y-2">
                    <Button
                      onClick={() => {
                        navigate('/login')
                        setIsMobileMenuOpen(false)
                      }}
                      variant="outline"
                      className="w-full border-green-300 text-green-700 hover:bg-green-50"
                    >
                      {currentLanguage === 'hi' ? 'लॉगिन' : 'Login'}
                    </Button>
                    <Button
                      onClick={() => {
                        navigate('/register')
                        setIsMobileMenuOpen(false)
                      }}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    >
                      {currentLanguage === 'hi' ? 'रजिस्टर करें' : 'Register'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Header
