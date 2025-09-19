import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { useNotification } from '@/context/NotificationContext'

// ✅ IMPORT LANGUAGE SWITCHER
import LanguageSwitcher from '@/components/layout/LanguageSwitcher'
import { useLanguageContext } from '@/context/LanguageContext'

// Icons
import { 
  Sun, 
  Moon, 
  Bell, 
  User, 
  Menu, 
  X,
  LogOut,
  Settings,
  UserCircle,
  Home,
  BarChart3,
  MessageCircle
} from 'lucide-react'

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { notifications, markAsRead } = useNotification()
  const { currentLanguage, isTranslating } = useLanguageContext() // ✅ GET TRANSLATION STATE
  
  const navigate = useNavigate()
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const unreadCount = notifications.filter(n => !n.read).length

  const handleLogout = async () => {
    await logout()
    navigate('/')
    setIsProfileOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl font-bold">🌾</span>
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Krishi Sahayak
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              to="/home" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === '/home' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/market" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === '/market' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Market
            </Link>
            <Link 
              to="/weather-alerts" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === '/weather-alerts' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Weather
            </Link>
            {isAuthenticated && (
              <Link 
                to="/ai-chat" 
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === '/ai-chat' ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                AI Chat
              </Link>
            )}
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* ✅ LANGUAGE SWITCHER - Added to notification area */}
            <div className="hidden md:block">
              <LanguageSwitcher className="mr-2" />
            </div>

            {/* Translation Status Indicator */}
            {isTranslating && (
              <div className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span>Translating...</span>
              </div>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>

            {/* Notifications */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10 relative"
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs font-medium text-white flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {isNotificationOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-popover rounded-md border shadow-lg py-1 z-50">
                    <div className="px-3 py-2 border-b">
                      <h3 className="font-semibold text-sm">Notifications</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                          No notifications
                        </div>
                      ) : (
                        notifications.slice(0, 5).map((notification) => (
                          <div
                            key={notification.id}
                            className={`px-3 py-2 text-sm border-b last:border-b-0 cursor-pointer hover:bg-muted/50 ${
                              !notification.read ? 'bg-muted/30' : ''
                            }`}
                            onClick={() => markAsRead(notification.id)}
                          >
                            <div className="font-medium">{notification.title}</div>
                            <div className="text-muted-foreground text-xs">
                              {notification.message}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {new Date(notification.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    {/* ✅ LANGUAGE OPTION IN NOTIFICATION DROPDOWN */}
                    <div className="border-t px-3 py-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground font-medium">Language</span>
                        <LanguageSwitcher className="scale-90" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10"
                >
                  <User className="h-4 w-4" />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-popover rounded-md border shadow-lg py-1 z-50">
                    <div className="px-3 py-2 border-b">
                      <div className="font-medium text-sm">{user?.name}</div>
                      <div className="text-xs text-muted-foreground">{user?.email}</div>
                    </div>
                    <Link
                      to="/profile"
                      className="flex items-center px-3 py-2 text-sm hover:bg-muted/50"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <UserCircle className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center px-3 py-2 text-sm hover:bg-muted/50"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-3 py-2 text-sm hover:bg-muted/50 text-red-600"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10 md:hidden"
            >
              {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t py-4 space-y-2">
            <Link
              to="/home"
              className="block px-2 py-1 text-sm font-medium hover:bg-muted rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              <Home className="inline mr-2 h-4 w-4" />
              Home
            </Link>
            <Link
              to="/market"
              className="block px-2 py-1 text-sm font-medium hover:bg-muted rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              <BarChart3 className="inline mr-2 h-4 w-4" />
              Market
            </Link>
            <Link
              to="/weather-alerts"
              className="block px-2 py-1 text-sm font-medium hover:bg-muted rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Weather
            </Link>
            {isAuthenticated && (
              <Link
                to="/ai-chat"
                className="block px-2 py-1 text-sm font-medium hover:bg-muted rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                <MessageCircle className="inline mr-2 h-4 w-4" />
                AI Chat
              </Link>
            )}
            
            {/* ✅ MOBILE LANGUAGE SWITCHER */}
            <div className="px-2 py-1 border-t pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Language</span>
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
