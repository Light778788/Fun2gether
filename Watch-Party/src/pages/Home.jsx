import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase/config';
import Recommended from './Recomended';

export default function Home() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [videoUrl, setVideoUrl] = useState('');
  const [roomId, setRoomId] = useState('');

  const createRoom = async () => {
    if (!currentUser) return alert('Please login first');
    if (!videoUrl) return alert('Please enter a YouTube URL');

    const videoId = getYouTubeVideoId(videoUrl);
    if (!videoId) return alert('Invalid YouTube URL');

    try {
      const docRef = await addDoc(collection(db, 'rooms'), {
        videoId,
        hostId: currentUser.uid,
        status: 'pause',
        timestamp: 0,
        lastUpdated: Date.now(),
      });
      navigate(`/party/${docRef.id}`);
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Failed to create room');
    }
  };

  const joinRoom = () => {
    if (!roomId) return alert('Please enter a room ID');
    navigate(`/party/${roomId}`);
  };

  const getYouTubeVideoId = (url) => {
    const regExp = /^.*(?:youtu\.be\/|v=|\/videos\/)([^\/\?&]+)/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 dark:text-white transition-colors duration-300">
      <div className="container mx-auto p-4 md:py-16">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center text-indigo-900 dark:text-indigo-300">
          Fun2gether <span className="text-purple-600 dark:text-purple-400">Watch Party</span>
        </h1>

        <div className="flex flex-col lg:flex-row items-center gap-8 mt-10">
          {/* Left side - Forms */}
          <div className="w-full lg:w-1/2 space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-indigo-800 dark:text-indigo-300 flex items-center">
                <span className="bg-indigo-100 dark:bg-indigo-700 text-indigo-800 dark:text-indigo-200 p-2 rounded-full mr-2 text-sm">
                  1
                </span>
                Create a New Room
              </h2>
              <div className="mb-4">
                <label
                  htmlFor="videoUrl"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  YouTube Video URL
                </label>
                <input
                  id="videoUrl"
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                />
              </div>
              <button
                onClick={createRoom}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-md transition duration-300 font-medium"
              >
                Create & Start Watching
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-purple-800 dark:text-purple-300 flex items-center">
                <span className="bg-purple-100 dark:bg-purple-700 text-purple-800 dark:text-purple-200 p-2 rounded-full mr-2 text-sm">
                  2
                </span>
                Join an Existing Room
              </h2>
              <div className="mb-4">
                <label
                  htmlFor="roomId"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Room ID
                </label>
                <input
                  id="roomId"
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  placeholder="Enter the room ID you received"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:focus:ring-purple-400 dark:focus:border-purple-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                />
              </div>
              <button
                onClick={joinRoom}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-md transition duration-300 font-medium"
              >
                Join Room
              </button>
            </div>
          </div>

          {/* Right side - Image */}
          <div className="w-full lg:w-1/2 flex justify-center items-center">
            <div className="relative h-full">
              <img
                src="/Home.svg"
                className="max-w-full h-auto max-h-96 object-contain"
                alt="Watch videos together with friends"
              />
              <div className="mt-4 text-center">
                <p className="text-gray-600 dark:text-gray-400 italic">
                  Watch YouTube videos in perfect sync with friends and family!
                </p>
              </div>
            </div>
          </div>
        </div>
        <Recommended />

        {/* Features Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="text-indigo-600 dark:text-indigo-300 text-xl mb-2">🎬</div>
            <h3 className="font-semibold text-lg mb-2">Perfect Synchronization</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Everyone sees the same thing at the same time, no matter where they are.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="text-indigo-600 dark:text-indigo-300 text-xl mb-2">🔒</div>
            <h3 className="font-semibold text-lg mb-2">Private Rooms</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Share the room ID only with people you want to invite.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="text-indigo-600 dark:text-indigo-300 text-xl mb-2">🚀</div>
            <h3 className="font-semibold text-lg mb-2">Easy to Use</h3>
            <p className="text-gray-600 dark:text-gray-400">
              No downloads required. Works in your browser instantly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}