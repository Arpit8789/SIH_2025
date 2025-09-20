// src/components/layout/Header.jsx - FIXED LANGUAGE DROPDOWN VISIBILITY
import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { 
  Menu, 
  X, 
  User, 
  Search, 
  Globe, 
  Moon, 
  Sun, 
  LogOut,
  Settings,
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { cn } from '@/lib/utils'

const Header = ({ onMenuClick, isMobileMenuOpen }) => {
  const [searchQuery, setSearchQuery] = useState('')
  
  const { user, isAuthenticated, logout } = useAuth()
  const { currentLanguage, changeLanguage } = useLanguage()
  const { toggleTheme, isDark } = useTheme()
  
  const navigate = useNavigate()
  const location = useLocation()

  // Check if we're on auth pages
  const isAuthPage = location.pathname.includes('/login') || 
                     location.pathname.includes('/register') || 
                     location.pathname.includes('/verify-otp') ||
                     location.pathname.includes('/forgot-password')

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      console.log('🔍 Searching for:', searchQuery)
      // Add your search logic here
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return currentLanguage === 'hi' ? 'सुप्रभात' : 'Good Morning'
    if (hour < 17) return currentLanguage === 'hi' ? 'नमस्कार' : 'Good Afternoon'
    return currentLanguage === 'hi' ? 'शुभ संध्या' : 'Good Evening'
  }

  return (
    <header className={cn(
      "w-full border-b bg-white/95 dark:bg-gray-900/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-gray-900/80 shadow-sm transition-all duration-300",
      // ✅ FIXED: Higher z-index for header to ensure proper stacking
      "sticky top-0 z-[100]",
      // Different styling for auth pages vs landing/dashboard
      isAuthPage 
        ? "border-gray-200 dark:border-gray-700" 
        : "border-green-100 dark:border-green-900/50 shadow-green-100/50 dark:shadow-green-900/20"
    )}>
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* LEFT SECTION - ENHANCED LOGO */}
          <div className="flex items-center gap-3">
            {isAuthenticated && !isAuthPage && (
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden hover:bg-green-100 dark:hover:bg-green-900/20 transition-colors"
                onClick={onMenuClick}
                aria-label="Menu"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            )}

            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-green-600 via-emerald-600 to-green-500 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <span className="text-white font-bold text-lg">🌾</span>
                  {/* Add sparkle effect */}
                  <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
              
              <div className="hidden sm:block">
                <h1 className="font-bold text-xl bg-gradient-to-r from-green-700 via-emerald-600 to-green-500 bg-clip-text text-transparent">
                  कृषि सहायक
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium tracking-wide">
                  {currentLanguage === 'hi' ? 'स्मार्ट खेती' : 'Smart Farming'}
                </p>
              </div>
            </Link>
          </div>

          {/* CENTER SECTION - ENHANCED SEARCH (Only for authenticated users) */}
          {isAuthenticated && !isAuthPage && (
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <form onSubmit={handleSearch} className="relative w-full group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                </div>
                <Input
                  type="text"
                  placeholder={currentLanguage === 'hi' ? 'फसल, मौसम, भाव खोजें...' : 'Search crops, weather, prices...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 w-full border-green-200 dark:border-green-800 focus:border-green-400 dark:focus:border-green-600 focus:ring-green-500/20 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm transition-all duration-200"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </form>
            </div>
          )}

          {/* RIGHT SECTION - ENHANCED CONTROLS */}
          <div className="flex items-center gap-2">
            
            {/* ✅ FIXED: LANGUAGE SELECTOR - Proper z-index and portal rendering */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="hover:bg-green-100 dark:hover:bg-green-900/20 transition-colors relative"
                >
                  <Globe className="h-4 w-4" />
                  {/* Language indicator */}
                  <span className="absolute -bottom-1 -right-1 text-[10px] font-bold text-green-600 dark:text-green-400">
                    {currentLanguage.toUpperCase()}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              {/* ✅ CRITICAL FIX: Very high z-index and proper positioning */}
              <DropdownMenuContent 
                align="end" 
                className="w-48 mt-2 border-green-200 dark:border-green-800"
                style={{ zIndex: 9999 }}
                container={document.body}
                sideOffset={4}
                avoidCollisions={true}
                collisionPadding={10}
              >
                <DropdownMenuLabel className="text-green-700 dark:text-green-300">
                  {currentLanguage === 'hi' ? 'भाषा चुनें' : 'Choose Language'}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => changeLanguage('hi')}
                  className="focus:bg-green-50 dark:focus:bg-green-900/20"
                >
                  🇮🇳 हिंदी {currentLanguage === 'hi' && '✓'}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => changeLanguage('en')}
                  className="focus:bg-green-50 dark:focus:bg-green-900/20"
                >
                  🇬🇧 English {currentLanguage === 'en' && '✓'}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => changeLanguage('pa')}
                  className="focus:bg-green-50 dark:focus:bg-green-900/20"
                >
                  🇮🇳 ਪੰਜਾਬੀ {currentLanguage === 'pa' && '✓'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* ENHANCED THEME TOGGLE - Works on ALL pages */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className={cn(
                "transition-all duration-300 relative group",
                isDark 
                  ? "hover:bg-yellow-100/20 dark:hover:bg-yellow-900/20" 
                  : "hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              <div className="relative">
                {isDark ? (
                  <Sun className="h-4 w-4 text-yellow-500 group-hover:text-yellow-400 transition-colors group-hover:rotate-12 transform duration-300" />
                ) : (
                  <Moon className="h-4 w-4 text-slate-600 group-hover:text-slate-800 transition-colors group-hover:-rotate-12 transform duration-300" />
                )}
                {/* Subtle glow effect */}
                <div className={cn(
                  "absolute inset-0 rounded-full blur-sm opacity-0 group-hover:opacity-20 transition-opacity duration-300",
                  isDark ? "bg-yellow-400" : "bg-slate-400"
                )} />
              </div>
            </Button>

            {/* USER SECTION - Enhanced */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 ring-2 ring-transparent hover:ring-green-200 dark:hover:ring-green-800 transition-all duration-200">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center text-white text-sm font-semibold shadow-lg">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    {/* Online indicator */}
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
                  </Button>
                </DropdownMenuTrigger>
                {/* ✅ FIXED: Proper z-index for user dropdown too */}
                <DropdownMenuContent 
                  className="w-56 mt-2" 
                  align="end" 
                  sideOffset={8}
                  style={{ zIndex: 9999 }}
                  container={document.body}
                  avoidCollisions={true}
                >
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <p className="text-sm font-medium text-green-700 dark:text-green-300">{getGreeting()}</p>
                      <p className="text-sm font-semibold">{user?.name || 'User'}</p>
                      <p className="text-xs text-muted-foreground">{user?.email || 'user@example.com'}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')} className="focus:bg-green-50 dark:focus:bg-green-900/20">
                    <User className="mr-2 h-4 w-4" /> {currentLanguage === 'hi' ? 'प्रोफाइल' : 'Profile'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings')} className="focus:bg-green-50 dark:focus:bg-green-900/20">
                    <Settings className="mr-2 h-4 w-4" /> {currentLanguage === 'hi' ? 'सेटिंग्स' : 'Settings'}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="focus:bg-red-50 dark:focus:bg-red-900/20 text-red-600 dark:text-red-400">
                    <LogOut className="mr-2 h-4 w-4" /> {currentLanguage === 'hi' ? 'लॉग आउट' : 'Logout'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              /* ENHANCED AUTH BUTTONS */
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/login')}
                  className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900/20 transition-all duration-200 font-medium"
                >
                  {currentLanguage === 'hi' ? 'लॉगिन' : 'Login'}
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate('/register')}
                  className="hidden sm:inline-flex bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-200 font-medium transform hover:scale-105"
                >
                  {currentLanguage === 'hi' ? 'रजिस्टर' : 'Register'}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* MOBILE SEARCH - Enhanced */}
        {isAuthenticated && !isAuthPage && (
          <div className="md:hidden border-t border-green-100 dark:border-green-900/50 px-0 py-3 bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20">
            <form onSubmit={handleSearch} className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400 group-focus-within:text-green-500 transition-colors" />
              </div>
              <Input
                type="text"
                placeholder={currentLanguage === 'hi' ? 'फसल, मौसम, भाव खोजें...' : 'Search crops, weather, prices...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 w-full border-green-200 focus:border-green-400 dark:border-green-800 dark:focus:border-green-600 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm"
              />
            </form>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
