import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, onSnapshot, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import Player from '../components/Player';
import ChatBox from '../components/ChatBox';
import VoiceChat from '../components/VoiceChat';
import ErrorBoundary from '../components/ErrorBoundary';

export default function WatchParty() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [videoId, setVideoId] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [roomIdCopied, setRoomIdCopied] = useState(false);
  const [showVoiceChat, setShowVoiceChat] = useState(false);

  useEffect(() => {
    if (!roomId) {
      setError("Room ID is missing");
      setLoading(false);
      return;
    }

    const roomRef = doc(db, 'rooms', roomId);
    const unsubscribe = onSnapshot(roomRef, async (docSnap) => {
      setLoading(false);

      if (!docSnap.exists()) {
        setError("Room has ended or no longer exists.");
        return;
      }

      const data = docSnap.data();
      setVideoId(data.videoId || '');
      setIsHost(data.hostId === currentUser?.uid);
      setRoomData(data);
    }, (err) => {
      console.error("Error fetching room:", err);
      setError("Could not load the watch party room");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [roomId, currentUser]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (roomId && currentUser) {
        updateDoc(doc(db, 'rooms', roomId), {
          lastActive: new Date()
        }).catch(err => console.error("Activity update error", err));
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [roomId, currentUser]);

  const copyRoomLink = () => {
    const roomUrl = `${window.location.origin}/party/${roomId}`;
    navigator.clipboard.writeText(roomUrl)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 3000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId)
      .then(() => {
        setRoomIdCopied(true);
        setTimeout(() => setRoomIdCopied(false), 3000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  const endParty = async () => {
    const confirm = window.confirm("Are you sure you want to end this watch party for all participants?");
    if (confirm) {
      try {
        await deleteDoc(doc(db, 'rooms', roomId));
        navigate('/');
      } catch (err) {
        console.error("Failed to delete room:", err);
        alert("Failed to end the party. Please try again.");
      }
    }
  };

  const exitParty = () => {
    const confirm = window.confirm("Are you sure you want to leave this watch party?");
    if (confirm) {
      navigate('/');
    }
  };

  const toggleVoiceChat = () => {
    setShowVoiceChat(!showVoiceChat);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading your watch party...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-screen">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="mb-6 flex justify-center">
            <img 
              src="/notfound.svg" 
              alt="Not Found Illustration" 
              className="max-w-full h-auto max-h-60"
              onError={(e) => {
                e.target.style.display = 'none';
              }} 
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Oops! {error}</h2>
          <p className="text-gray-600 mb-6">
            The room you're trying to access may not exist anymore or has been closed by the host.
          </p>
          <Link 
            to="/" 
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded-lg transition duration-200"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2">
          <h1 className="text-2xl font-bold text-indigo-900">Fun2gether Watch Party</h1>
          <div className="flex items-center mt-2 md:mt-0 space-x-2">
            {isHost && (
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                Host Mode
              </span>
            )}
            <button 
              onClick={copyRoomId}
              className={`flex items-center text-sm ${roomIdCopied ? 'bg-green-100 text-green-800' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} px-3 py-1 rounded transition duration-200`}
            >
              {roomIdCopied ? '✓ Copied!' : 'Copy Room ID'}
            </button>
            <button 
              onClick={copyRoomLink}
              className={`flex items-center text-sm ${copySuccess ? 'bg-green-100 text-green-800' : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700'} px-3 py-1 rounded transition duration-200`}
            >
              {copySuccess ? '✓ Copied!' : 'Invite Friends'}
            </button>
          </div>
        </div>
        <div className="flex items-center text-gray-600 text-sm">
          Room ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded ml-1 mr-2">{roomId}</span>
          {/* <button 
            onClick={toggleVoiceChat}
            className={`text-sm ${showVoiceChat ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'} px-3 py-1 rounded transition`}
          >
            {showVoiceChat ? 'Hide Voice Chat' : 'Show Voice Chat'}
          </button> */}
        </div>
      </div>

   
        <ErrorBoundary>
          <VoiceChat roomId={roomId} currentUser={currentUser} />
        </ErrorBoundary>
    

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {videoId ? (
            <div className="bg-black rounded-lg overflow-hidden shadow-lg aspect-video w-full">
              <Player videoId={videoId} isHost={isHost} roomId={roomId} />
              <div className="bg-gray-900 text-white p-3 text-sm">
                {isHost ? (
                  <p className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    You're the host - your playback controls will sync for everyone
                  </p>
                ) : (
                  <p className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Synchronized mode - playback is controlled by the host
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gray-100 rounded-lg p-12 flex items-center justify-center h-64">
              <p className="text-gray-500">No video selected</p>
            </div>
          )}

          <div className="mt-4 flex gap-4">
            {isHost ? (
              <button 
                onClick={endParty} 
                className="flex items-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition"
              >
                End Party for Everyone
              </button>
            ) : (
              <button 
                onClick={exitParty} 
                className="flex items-center bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded transition"
              >
                Leave Party
              </button>
            )}
          </div>
        </div>

        <div className="h-full">
          <div className="bg-white rounded-lg shadow-sm h-full flex flex-col">
            <div className="bg-indigo-700 text-white py-2 px-4 rounded-t-lg">
              <h2 className="font-semibold">Live Chat</h2>
            </div>
            <div className="flex-grow overflow-hidden">
              <ChatBox roomId={roomId} currentUser={currentUser} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <Link to="/" className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center justify-center">
          Back to Home
        </Link>
      </div>
    </div>
  );
}