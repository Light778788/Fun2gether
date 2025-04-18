import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { FaUserCircle } from 'react-icons/fa';

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const [profileImage, setProfileImage] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    if (currentUser) {
      setProfileImage(
        currentUser.photoURL ||
        `https://ui-avatars.com/api/?name=${currentUser.email.charAt(0).toUpperCase()}&size=40`
      );
    }
  }, [currentUser]);
  

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
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

  return (
    <nav className="bg-indigo-800 p-4 shadow-lg">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <img src="/Logo.png" alt="Fun2gether Logo" className="h-10 w-10 md:h-12 md:w-12 object-contain" />
            <Link to="/" className="text-white font-bold text-lg md:text-2xl">Fun2gether</Link>
          </div>

          {/* Mobile menu toggle */}
          <div className="md:hidden">
            <button onClick={toggleMenu} className="text-white focus:outline-none">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center">
            {currentUser ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={toggleProfileMenu}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-9 h-9 rounded-full border-2 border-white"
                  />
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 z-20">
                    <div className="px-4 py-2 text-gray-700 font-semibold">
                      Hi, {currentUser.email.split('@')[0]}
                    </div>
                    <div className="border-t border-gray-200 my-1"></div>
                    <button
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center text-white hover:text-indigo-200 px-4 py-2 transition"
              >
                <FaUserCircle className="text-2xl" />
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Nav Items */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-indigo-700">
            {currentUser ? (
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <img src={profileImage} alt="Profile" className="w-8 h-8 rounded-full border-2 border-white" />
                  <span className="text-white font-medium">{currentUser.email.split('@')[0]}</span>
                </div>
                <button
                  onClick={logout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-2">
                <Link
                  to="/login"
                  className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded text-center"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded text-center"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
