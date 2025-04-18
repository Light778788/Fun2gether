import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FcGoogle } from "react-icons/fc";

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError('Failed to log in: ' + err.message);
    }
    setLoading(false);
  };
  
  return (
    <div className="flex flex-col-reverse md:flex-row max-w-4xl mx-auto bg-white rounded-lg shadow-md mt-10 overflow-hidden">
      {/* Login Form - Now on the left on medium screens and up */}
      <div className="w-full md:w-1/2 p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">Log In</h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <button
            disabled={loading}
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded"
          >
            {loading ? 'Logging In...' : 'Log In'}
          </button>
          <div className="flex items-center my-4">
            <hr className="flex-grow border-t border-gray-300" />
            <span className="mx-2 text-gray-500">or</span>
            <hr className="flex-grow border-t border-gray-300" />
          </div>
          <button
            onClick={async () => {
              setError('');
              setLoading(true);
              try {
                await loginWithGoogle();
                navigate('/');
              } catch (err) {
                setError('Google sign-in failed: ' + err.message);
              }
              setLoading(false);
            }}
            className="flex items-center justify-center w-full border py-2 mt-2 rounded hover:bg-gray-100"
          >
            <FcGoogle className="mr-2 text-xl" />
            Continue with Google
          </button>
        </form>
        <div className="mt-4 text-center">
          <p>
            Need an account?{' '}
            <Link to="/signup" className="text-blue-500 hover:text-blue-700">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
      
      {/* Right Side Image */}
      <div className="w-full md:w-1/2 bg-gray-50 flex items-center justify-center p-6">
          <img 
            src="login2.svg" 
            alt="Signup Illustration" 
            className="max-w-full h-auto max-h-80 md:max-h-full"
          />
      </div>
    </div>
  );
}