// src/components/layout/Header.jsx - FIXED WITH LANGUAGE/THEME IN DESKTOP
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
  Settings
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

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      console.log('🔍 Searching for:', searchQuery)
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
      "sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm",
      isAuthenticated && "lg:ml-72"
    )}>
      <div className="w-full px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        
        {/* LEFT SECTION - MENU + LOGO */}
        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden hover:bg-green-100 dark:hover:bg-green-900/20 z-50"
              onClick={onMenuClick}
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          )}

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

        {/* CENTER SECTION - SEARCH */}
        {isAuthenticated && (
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={currentLanguage === 'hi' ? 'फसल, मौसम, भाव खोजें...' : 'Search crops, weather, prices...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 w-full border-green-200 focus:border-green-400 dark:border-green-800 dark:focus:border-green-600"
              />
            </form>
          </div>
        )}

        {/* RIGHT SECTION - ACTIONS */}
        <div className="flex items-center gap-2">
          
          {/* ✅ LANGUAGE SELECTOR - ALWAYS VISIBLE ON DESKTOP */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-green-100 dark:hover:bg-green-900/20">
                <Globe className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 mt-2">
              <DropdownMenuLabel>
                {currentLanguage === 'hi' ? 'भाषा चुनें' : 'Choose Language'}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => changeLanguage('hi')}>
                🇮🇳 हिंदी
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeLanguage('en')}>
                🇬🇧 English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeLanguage('pa')}>
                🇮🇳 ਪੰਜਾਬੀ
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* ✅ THEME TOGGLE - ALWAYS VISIBLE */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="hover:bg-yellow-100 dark:hover:bg-yellow-900/20"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="h-4 w-4 text-yellow-600" /> : <Moon className="h-4 w-4 text-slate-600" />}
          </Button>

          {/* USER SECTION */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                  <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center text-white text-sm font-semibold shadow-md">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mt-2" align="end" sideOffset={8}>
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <p className="text-sm font-medium">{getGreeting()}</p>
                    <p className="text-sm font-semibold">{user?.name || 'User'}</p>
                    <p className="text-xs text-muted-foreground">{user?.email || 'user@example.com'}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" /> {currentLanguage === 'hi' ? 'प्रोफाइल' : 'Profile'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="mr-2 h-4 w-4" /> {currentLanguage === 'hi' ? 'सेटिंग्स' : 'Settings'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" /> {currentLanguage === 'hi' ? 'लॉग आउट' : 'Logout'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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

      {/* MOBILE SEARCH */}
      {isAuthenticated && (
        <div className="md:hidden border-t px-4 py-3 bg-green-50/50 dark:bg-green-950/20">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={currentLanguage === 'hi' ? 'फसल, मौसम, भाव खोजें...' : 'Search crops, weather, prices...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 w-full border-green-200 focus:border-green-400"
            />
          </form>
        </div>
      )}
    </header>
  )
}

export default Header
