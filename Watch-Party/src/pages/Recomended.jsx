import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase/config';

const videos = {
    Movie: [
        {
          title: 'Phir Hera Pheri (Full Movie )',
          videoId: 'Us6pVG4NK8Q',
          emoji: '😂'
        },
        {
          title: 'Madam Geeta Rani',
          videoId: 'krCpn6RrNX8',
          emoji: '👑'
        },
        {
          title: 'Hungama | Hindi Full Movie',
          videoId: '55sUfITkuVY',
          emoji: '🎭'
        },
        {
          title: 'Aparichit (Anniyan) Vikram',
          videoId: 'WTGnTI3-lGQ',
          emoji: '🔥'
        },
        {
          title: 'Sooryavansham',
          videoId: 'vB2m1uRF30c',
          emoji: '✨'
        },
        {
          title: 'Shaadi Mein Zaroor Aana',
          videoId: 'gyOFdkWx7j0',
          emoji: '💍'
        },
        {
          title: 'Khatta Meetha',
          videoId: 'My5L3qLhewg',
          emoji: '🍬'
        },
        {
          title: 'Bahubali 2 || The Conclusion',
          videoId: 'DbPrQ_w6Zos',
          emoji: '⚔️'
        },
        {
          title: 'The Return Of Rebel',
          videoId: 'e3lm0bTGZfI',
          emoji: '👊'
        },
        {
          title: 'AIRLIFT (Full Movie)',
          videoId: 'mwVKwP0V7Q4',
          emoji: '✈️'
        },
        {
          title: 'Main Hoon Lucky The Racer',
          videoId: '87Ai7pdYegY',
          emoji: '🏎️'
        },
        {
          title: '96 (2019)',
          videoId: '63F9Pv4k4wk',
          emoji: '💔'
        },
        {
          title: 'Theri (4K)',
          videoId: '9rq87EQAPt0',
          emoji: '👮'
        },
        {
          title: 'Ghajini Full Movie',
          videoId: 'lWI6d-8JJd8',
          emoji: '🧠'
        },
        {
          title: 'Holiday - A Soldier is Never Off Duty',
          videoId: 'PPc2Y6UZx-g',
          emoji: '🪖'
        },
        {
          title: 'Chup Chup Ke',
          videoId: 'SaEV_DMPogk',
          emoji: '🤫'
        }
      ],
      'Study Music': [
        {
          title: 'lofi hip hop radio - beats to relax/study to',
          videoId: 'jfKfPfyJRdk',
          emoji: '📚'
        },
        {
          title: 'Chillhop Radio - jazzy & lofi hip hop beats 🐾',
          videoId: '5yx6BWlEVcY',
          emoji: '🎧'
        },
        {
          title: 'Relaxing Jazz Piano Radio - Slow Jazz Music',
          videoId: 'Dx5qFachd3A',
          emoji: '🎹'
        },
        {
          title: 'Coding Music | Chill Step Mix',
          videoId: 'FjHGZj2IjBk',
          emoji: '💻'
        },
        {
          title: 'A playlist for night studies',
          videoId: 'k5rEQ2wFPUw',
          emoji: '🌙'
        },
        {
          title: '4 Hours of Ambient Study Music To Concentrate',
          videoId: 'WPni755-Krg',
          emoji: '🧠'
        },
        {
          title: '3 Hours of Chill Study Music — Instrumental, Lofi',
          videoId: 'mPZkdNFkNps',
          emoji: '📝'
        },
        {
          title: 'Instrumental Music for Studying, Concentration',
          videoId: '6-qcm7QmneQ',
          emoji: '🎵'
        },
        {
          title: 'Coding Music – Chillstep & Future Garage Mix',
          videoId: 'Eqa2nAAhHN0',
          emoji: '👨‍💻'
        },
        {
          title: 'lofi hip hop radio – beats to sleep/chill to',
          videoId: 'DWcJFNfaw9c',
          emoji: '😴'
        },
        {
          title: 'Focus Music for Work and Studying | Brain Music',
          videoId: 'WPni755-Krg',
          emoji: '🧠'
        },
        {
          title: 'Calm Piano Music 24/7: Study Music, Focus',
          videoId: 'eP03zaw425o',
          emoji: '🎼'
        },
        {
          title: 'Music For Concentration',
          videoId: 'LsOPhIEFTbo',
          emoji: '🔍'
        },
        {
          title: 'Deep Focus Music - Improve Concentration',
          videoId: 'eKFTSSKCzWA',
          emoji: '🎯'
        },
        {
          title: 'Lo-Fi Chill & Study Music Compilation',
          videoId: 'n61ULEU7CO0',
          emoji: '📖'
        },
        {
          title: 'Calmness with Study Music',
          videoId: 'xRcWlA1I9z0',
          emoji: '🧘‍♀️'
        }
      ]
};

// Quotes for each category
const quotes = {
  Movie: [
    "Movies are better when watched together! 🍿",
    "Share the laughter, tears, and thrills with friends. 🎬",
    "Great movies create unforgettable memories. 🌟",
    "Movie night is always a good idea. 🎞️"
  ],
  'Study Music': [
    "Study better together, even from miles apart. 📚",
    "Focus better with friends and the right beats. 🎧",
    "Great minds study alike. 🧠",
    "Find your flow with the perfect study soundtrack. 🎵"
  ]
};

export default function Recommended() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('Movie');
  const [showAll, setShowAll] = useState(false);
  const [displayedVideos, setDisplayedVideos] = useState([]);
  const INITIAL_DISPLAY_COUNT = 8;
  
  useEffect(() => {
    // Reset show all when category changes
    setShowAll(false);
    
    // Set initial videos to display
    const initialVideos = videos[selectedCategory].slice(0, INITIAL_DISPLAY_COUNT);
    setDisplayedVideos(initialVideos);
  }, [selectedCategory]);

  const handleShowMore = () => {
    setShowAll(true);
    setDisplayedVideos(videos[selectedCategory]);
  };
  
  // Get a random quote for the selected category
  const getRandomQuote = () => {
    const categoryQuotes = quotes[selectedCategory];
    return categoryQuotes[Math.floor(Math.random() * categoryQuotes.length)];
  };

  const handleClick = async (videoId, title) => {
    if (!currentUser) {
      return alert('Please login first to create a watch party! 🔒');
    }

    try {
      const docRef = await addDoc(collection(db, 'rooms'), {
        videoId,
        videoTitle: title,
        hostId: currentUser.uid,
        hostName: currentUser.displayName || 'Anonymous',
        status: 'pause',
        timestamp: 0,
        createdAt: Date.now(),
        lastUpdated: Date.now()
      });
      navigate(`/party/${docRef.id}`);
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Failed to start the room 😕');
    }
  };

  // Icons as SVG components with enhanced styling
  const MovieIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline-block mr-2 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h18M3 16h18" />
    </svg>
  );

  const MusicIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline-block mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
    </svg>
  );

  const PeopleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );

  const PlayIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
    </svg>
  );

  const ShowMoreIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );

  const WatchTogetherVector = () => (
    <svg className="w-20 h-20 md:w-32 md:h-32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="40" r="15" fill="#a855f7" />
      <circle cx="70" cy="40" r="15" fill="#6366f1" />
      <path d="M50 60C50 60 30 75 20 85C40 90 60 90 80 85C70 75 50 60 50 60Z" fill="#d8b4fe" />
      <circle cx="30" cy="40" r="5" fill="white" />
      <circle cx="70" cy="40" r="5" fill="white" />
      <rect x="40" y="70" width="20" height="10" rx="5" fill="#f0abfc" />
    </svg>
  );

  const StudyTogetherVector = () => (
    <svg className="w-20 h-20 md:w-32 md:h-32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="15" y="25" width="70" height="50" rx="5" fill="#6366f1" />
      <rect x="25" y="35" width="50" height="30" rx="2" fill="white" />
      <circle cx="30" cy="20" r="10" fill="#a855f7" />
      <circle cx="70" cy="20" r="10" fill="#a855f7" />
      <path d="M30 65C30 65 38 75 50 75C62 75 70 65 70 65" stroke="#d8b4fe" strokeWidth="3" />
      <rect x="45" y="25" width="10" height="5" fill="#d8b4fe" />
    </svg>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Hero banner with vector graphic */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-xl shadow-lg mb-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl font-bold mb-2">
              {selectedCategory === 'Movie' ? '🍿 Watch Together' : '🎧 Study Together'}
            </h1>
            <p className="text-lg opacity-90">
              <PeopleIcon /> {getRandomQuote()}
            </p>
            <p className="text-sm mt-2 opacity-75">
              {selectedCategory === 'Movie' 
                ? "Create a virtual movie party and enjoy synchronized viewing with friends!" 
                : "Study more effectively with perfectly synced music for your study groups!"}
            </p>
          </div>
          
          <div className="flex-shrink-0">
            {selectedCategory === 'Movie' ? <WatchTogetherVector /> : <StudyTogetherVector />}
          </div>
        </div>

        {/* Category selector */}
        <div className="mt-6 bg-white bg-opacity-20 p-3 rounded-lg backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <span className="text-sm font-medium">Choose Your Experience:</span>
            <div className="flex space-x-2 w-full sm:w-auto">
              <button 
                onClick={() => setSelectedCategory('Movie')}
                className={`flex-1 sm:flex-initial px-4 py-2 rounded-md flex items-center justify-center transition-all ${
                  selectedCategory === 'Movie' 
                  ? 'bg-white text-purple-700 font-bold shadow-md' 
                  : 'bg-purple-700 bg-opacity-30 hover:bg-opacity-40 text-white'
                }`}
              >
                🎬 Movies
              </button>
              <button 
                onClick={() => setSelectedCategory('Study Music')}
                className={`flex-1 sm:flex-initial px-4 py-2 rounded-md flex items-center justify-center transition-all ${
                  selectedCategory === 'Study Music' 
                  ? 'bg-white text-indigo-700 font-bold shadow-md' 
                  : 'bg-indigo-700 bg-opacity-30 hover:bg-opacity-40 text-white'
                }`}
              >
                🎵 Study Music
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Category header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center">
          {selectedCategory === 'Movie' ? <MovieIcon /> : <MusicIcon />}
          {selectedCategory === 'Movie' ? 'Movie Watch Parties' : 'Study Music Sessions'}
        </h2>
        <p className="text-gray-600 mt-2">
          Select a {selectedCategory.toLowerCase()} to start watching with friends. 
          {!currentUser && <span className="text-red-500 font-medium"> (Login required to start a room 🔒)</span>}
        </p>
      </div>

      {/* Video grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {displayedVideos.map((video, index) => (
          <div
            key={index}
            className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition duration-300 border border-gray-200 relative"
          >
            <div className="absolute top-2 left-2 z-10 bg-white bg-opacity-90 rounded-full h-8 w-8 flex items-center justify-center text-lg">
              {video.emoji}
            </div>
            
            <div className="relative">
              <img
                src={`https://img.youtube.com/vi/${video.videoId}/0.jpg`}
                alt={video.title}
                className="w-full h-48 object-cover"
                loading="lazy"
              />
              <div 
                className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                onClick={() => handleClick(video.videoId, video.title)}
              >
                <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full flex items-center shadow-lg transform group-hover:scale-105 transition-transform">
                  <PlayIcon /> <span className="ml-1">Start a Room</span>
                </button>
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent h-16 opacity-70"></div>
              
              {currentUser && (
                <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full flex items-center shadow-sm">
                  <PeopleIcon /> Watch Together
                </div>
              )}
            </div>
            
            <div className="p-4">
              <h3 className="font-medium text-gray-900 mb-1 line-clamp-2" title={video.title}>
                {video.title}
              </h3>
              <div className="flex justify-between items-center mt-2">
                <a
                  href={`https://www.youtube.com/watch?v=${video.videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="#ff0000">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  YouTube
                </a>
                <button 
                  className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                  onClick={() => handleClick(video.videoId, video.title)}
                >
                  Start Room →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Show More Button */}
      {!showAll && videos[selectedCategory].length > INITIAL_DISPLAY_COUNT && (
        <div className="flex justify-center mt-8">
          <button 
            onClick={handleShowMore}
            className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white px-6 py-3 rounded-full flex items-center font-medium shadow-md hover:shadow-lg transition-all"
          >
            <ShowMoreIcon /> Show More {selectedCategory === 'Movie' ? 'Movies' : 'Music'} 
            <span className="ml-1">({videos[selectedCategory].length - INITIAL_DISPLAY_COUNT} more)</span>
          </button>
        </div>
      )}

      {/* Footer banner */}
      <div className="mt-12 bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg border border-indigo-100 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-bold text-indigo-800">✨ Experience Together, Even When Apart</h3>
            <p className="text-indigo-600">
              Perfectly synchronized videos for you and your friends. {selectedCategory === 'Movie' ? '🎬 Watch movies' : '🎵 Study'} together!
            </p>
          </div>
          {!currentUser && (
            <button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg shadow transition-all transform hover:scale-105">
              🔑 Login to Start
            </button>
          )}
        </div>
      </div>
    </div>
  );
}