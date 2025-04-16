import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const [profileImage, setProfileImage] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    // Generate a random profile image using a placeholder service
    if (currentUser) {
      // Using a seed based on user email to get consistent image for the same user
      const seed = currentUser.email.replace(/[^a-zA-Z0-9]/g, '');
      setProfileImage(`https://ui-avatars.com/api/?name=${currentUser.email.charAt(0).toUpperCase()}&size=40`);

    }
  }, [currentUser]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-indigo-800 p-4 shadow-lg">
      <div className="container mx-auto">
        {/* Desktop Navigation */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <img 
              src="/Logo.png" 
              alt="Fun2gether Logo" 
              className="h-10 w-10 md:h-16 md:w-16 object-contain"
            />
            <Link to="/" className="text-white font-bold text-lg md:text-2xl">Fun2gether</Link>
          </div>
          
          {/* Hamburger Menu for Mobile */}
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
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {currentUser ? (
              <>
                <div className="flex items-center space-x-2">
                  <img 
                    src={profileImage} 
                    alt="Profile" 
                    className="w-8 h-8 rounded-full border-2 border-white"
                  />
                  <span className="text-white">Hi, {currentUser.email.split('@')[0]}</span>
                </div>
                <button
                  onClick={logout}
                  className=" text-white px-4 py-2 rounded transition duration-300"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded transition duration-300"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded transition duration-300"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-indigo-700">
            {currentUser ? (
              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-2">
                  <img 
                    src={profileImage} 
                    alt="Profile" 
                    className="w-8 h-8 rounded-full border-2 border-white"
                  />
                  <span className="text-white">Hi, {currentUser.email.split('@')[0]}</span>
                </div>
                <button
                  onClick={logout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition duration-300 w-full"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-2">
                <Link
                  to="/login"
                  className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded transition duration-300 w-full text-center"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded transition duration-300 w-full text-center"
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