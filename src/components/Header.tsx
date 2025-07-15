import React, { useState } from 'react';
import { PenSquare, User, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SignInModal } from './SignInModal';
import { Link, useLocation } from 'react-router-dom';

export const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const [showSignIn, setShowSignIn] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <PenSquare className="h-8 w-8 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900">BlogHub</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                to="/"
                className={`text-gray-700 hover:text-blue-600 transition-colors ${
                  location.pathname === '/' ? 'text-blue-600 font-medium' : ''
                }`}
              >
                Home
              </Link>
              {user && (
                <Link
                  to="/admin"
                  className={`text-gray-700 hover:text-blue-600 transition-colors ${
                    location.pathname === '/admin' ? 'text-blue-600 font-medium' : ''
                  }`}
                >
                  Admin
                </Link>
              )}
            </nav>

            {/* Desktop Auth */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <User className="h-5 w-5" />
                    <span className="text-sm">{user.email}</span>
                  </button>
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                      <button
                        onClick={handleSignOut}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowSignIn(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Sign In
                </button>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === '/'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                Home
              </Link>
              {user && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === '/admin'
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  Admin
                </Link>
              )}
            </div>
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="px-2 space-y-1">
                {user ? (
                  <div className="space-y-1">
                    <div className="px-3 py-2 text-sm text-gray-500">{user.email}</div>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                    >
                      Sign out
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setShowSignIn(true);
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {showSignIn && <SignInModal onClose={() => setShowSignIn(false)} />}
    </>
  );
};