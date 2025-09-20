// src/components/layout/MainLayout.jsx - WITH CHATBOT INTEGRATION
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import ChatBot from '../chatbot/ChatBot'; // ✅ NEW - Import ChatBot
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const MainLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar - Fixed position, only for authenticated users */}
      {isAuthenticated && (
        <Sidebar 
          isOpen={isMobileMenuOpen}
          onClose={closeMobileMenu}
        />
      )}

      {/* Main Content Wrapper */}
      <div 
        className={cn(
          "min-h-screen flex flex-col transition-all duration-300",
          isAuthenticated ? "lg:ml-72" : "" // Add left margin when authenticated
        )}
      >
        {/* Header */}
        <Header 
          onMenuClick={handleMobileMenuToggle}
          isMobileMenuOpen={isMobileMenuOpen}
        />

        {/* Main Content */}
        <main className="flex-1">
          <Outlet />
        </main>

        {/* Footer */}
        <Footer />
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* ✅ CHATBOT INTEGRATION - Always Available */}
      <ChatBot />
    </div>
  );
};

export default MainLayout;
