import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { FaUserCircle, FaSignOutAlt, FaCog, FaChevronDown } from 'react-icons/fa';
import { useTheme } from './ThemeContext';
import { FaMoon, FaSun } from 'react-icons/fa';

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [profileImage, setProfileImage] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileRef = useRef(null);
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    if (currentUser) {
      setProfileImage(
        currentUser.photoURL ||
        `https://ui-avatars.com/api/?name=${currentUser.email.charAt(0).toUpperCase()}&background=6366f1&color=fff&size=40`
      );
    }
  }, [currentUser]);
  
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && 
          !event.target.closest('button[aria-label="Toggle menu"]')) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsProfileMenuOpen(false);
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <nav className={`${isDarkMode ? 'bg-gray-900' : 'bg-white'} shadow-lg border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} sticky top-0 z-50 transition-colors duration-300`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src="/Logo.png" 
                alt="Fun2gether Logo" 
                className="h-10 w-10 object-contain transition-transform duration-300 hover:scale-110" 
              />
              <span className={`font-bold text-xl md:text-2xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent`}>
                Fun2gether
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          {/* <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-indigo-600'} font-medium transition-colors duration-200`}>
              Home
            </Link>
            <Link to="/events" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-indigo-600'} font-medium transition-colors duration-200`}>
              Events
            </Link>
            <Link to="/discover" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-indigo-600'} font-medium transition-colors duration-200`}>
              Discover
            </Link>
          </div> */}

          {/* Right Side Controls */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme} 
              className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} transition-colors duration-300`}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <FaSun className="text-lg" /> : <FaMoon className="text-lg" />}
            </button>

            {/* User Profile */}
            {currentUser ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={toggleProfileMenu}
                  className={`flex items-center space-x-2 ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} rounded-full py-1 px-2 transition-colors duration-200`}
                  aria-label="Open profile menu"
                >
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-8 h-8 rounded-full border-2 border-indigo-500 object-cover"
                  />
                  <span className={`hidden md:block ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {currentUser.email.split('@')[0]}
                  </span>
                  <FaChevronDown className={`w-3 h-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isProfileMenuOpen && (
                  <div className={`absolute right-0 mt-2 w-56 rounded-md shadow-lg py-1 z-20 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                    <div className={`px-4 py-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-700'} font-medium border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className="truncate">{currentUser.email}</div>
                    </div>
                    
                    <Link to="/profile" className={`flex items-center px-4 py-2 ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'} transition-colors duration-200`}>
                      <FaUserCircle className="mr-3" />
                      My Profile
                    </Link>
                    
                    <Link to="/settings" className={`flex items-center px-4 py-2 ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'} transition-colors duration-200`}>
                      <FaCog className="mr-3" />
                      Settings
                    </Link>
                    
                    <button
                      onClick={handleLogout}
                      className={`flex items-center w-full text-left px-4 py-2 ${isDarkMode ? 'text-red-400 hover:bg-gray-700' : 'text-red-600 hover:bg-gray-100'} transition-colors duration-200`}
                    >
                      <FaSignOutAlt className="mr-3" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className={`hidden md:block py-2 px-4 rounded-md ${isDarkMode ? 'text-white hover:bg-gray-800' : 'text-indigo-600 hover:bg-gray-100'} transition-colors duration-200`}
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="py-2 px-4 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all duration-300"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button 
              onClick={toggleMenu} 
              className={`md:hidden p-2 rounded-md ${isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'} focus:outline-none transition-colors duration-200`}
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div 
            ref={mobileMenuRef}
            className={`md:hidden py-4 space-y-3 ${isDarkMode ? 'border-t border-gray-800' : 'border-t border-gray-200'}`}
          >
            <Link 
              to="/" 
              className={`block py-2 px-4 rounded-md ${isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'} transition-colors duration-200`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/events" 
              className={`block py-2 px-4 rounded-md ${isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'} transition-colors duration-200`}
              onClick={() => setIsMenuOpen(false)}
            >
              Events
            </Link>
            <Link 
              to="/discover" 
              className={`block py-2 px-4 rounded-md ${isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'} transition-colors duration-200`}
              onClick={() => setIsMenuOpen(false)}
            >
              Discover
            </Link>
            
            {!currentUser && (
              <Link
                to="/login"
                className={`block py-2 px-4 rounded-md ${isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'} transition-colors duration-200`}
                onClick={() => setIsMenuOpen(false)}
              >
                Log In
              </Link>
            )}
            
            {currentUser && (
              <>
                <div className={`px-4 py-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Signed in as <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{currentUser.email.split('@')[0]}</span>
                </div>
                <Link 
                  to="/profile" 
                  className={`flex items-center py-2 px-4 rounded-md ${isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'} transition-colors duration-200`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaUserCircle className="mr-3" />
                  My Profile
                </Link>
                <Link 
                  to="/settings" 
                  className={`flex items-center py-2 px-4 rounded-md ${isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'} transition-colors duration-200`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaCog className="mr-3" />
                  Settings
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className={`flex items-center w-full text-left py-2 px-4 rounded-md ${isDarkMode ? 'text-red-400 hover:bg-gray-800' : 'text-red-600 hover:bg-gray-100'} transition-colors duration-200`}
                >
                  <FaSignOutAlt className="mr-3" />
                  Logout
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}