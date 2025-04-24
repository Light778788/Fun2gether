import { useEffect, useRef, useState } from "react";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  onSnapshot,
  addDoc,
  getDocs,
  query,
  where
} from "firebase/firestore";
import { db } from "../firebase/config";

export default function VoiceChat({ roomId, currentUser }) {
  const localStream = useRef(null);
  const remoteAudio = useRef(null);
  const pc = useRef(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [activeSpeaker, setActiveSpeaker] = useState(null);
  const audioContext = useRef(null);
  const analyser = useRef(null);
  const dataArray = useRef(null);
  const animationFrame = useRef(null);

  // Get optimized photo URL with better fallbacks
  const getPhotoURL = (user) => {
    if (user?.photoURL) return user.photoURL;
    const name = user?.displayName || user?.email || 'U';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
  };

  // Get initials for avatar fallback
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Separate effect for handling mute state changes
  useEffect(() => {
    if (!localStream.current) return;
    
    // Apply mute state to all audio tracks
    const audioTracks = localStream.current.getAudioTracks();
    audioTracks.forEach(track => {
      track.enabled = !isMuted;
    });
    
    // Update mute status in database
    const updateMuteStatus = async () => {
      const roomRef = doc(db, "rooms", roomId);
      const participantsRef = collection(roomRef, "voiceParticipants");
      const participantRef = doc(participantsRef, currentUser.uid);
      await setDoc(participantRef, { muted: isMuted }, { merge: true });
    };
    
    updateMuteStatus();
  }, [isMuted, roomId, currentUser]);

  useEffect(() => {
    const roomRef = doc(db, "rooms", roomId);
    const offerRef = doc(collection(roomRef, "offers"), "current");
    const answerRef = doc(collection(roomRef, "answers"), "current");
    const callerCandidatesCollection = collection(roomRef, "callerCandidates");
    const calleeCandidatesCollection = collection(roomRef, "calleeCandidates");
    const participantsRef = collection(roomRef, "voiceParticipants");

    // Function to get user details from participants data
    const getParticipantDetails = (participantData) => {
      return {
        userId: participantData.userId,
        displayName: participantData.displayName || `User-${participantData.userId.substring(0, 4)}`,
        photoURL: participantData.photoURL || getPhotoURL({
          displayName: participantData.displayName,
          email: participantData.email
        }),
        email: participantData.email,
        muted: participantData.muted || false
      };
    };

    // Track participants
    const unsubscribeParticipants = onSnapshot(participantsRef, (snapshot) => {
      const activeParticipants = [];
      
      snapshot.forEach((doc) => {
        const participantData = doc.data();
        if (participantData.active && Date.now() - participantData.lastPing < 10000) {
          activeParticipants.push(getParticipantDetails(participantData));
        }
      });
      
      setParticipants(activeParticipants);
    });

    // Update user's participant status
    const updateParticipantStatus = async () => {
      const participantRef = doc(participantsRef, currentUser.uid);
      
      await setDoc(participantRef, {
        userId: currentUser.uid,
        displayName: currentUser.displayName || `User-${currentUser.uid.substring(0, 4)}`,
        photoURL: currentUser.photoURL || getPhotoURL(currentUser),
        email: currentUser.email,
        active: true,
        lastPing: Date.now(),
        muted: isMuted
      }, { merge: true });
    };

    // Ping interval to show we're still connected
    const pingInterval = setInterval(updateParticipantStatus, 5000);
    updateParticipantStatus(); // Initial update

    async function start() {
      try {
        // Initialize PeerConnection
        pc.current = new RTCPeerConnection({
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" }
          ]
        });

        // Get user media
        localStream.current = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false
        });
        
        // Apply initial mute state if necessary
        if (isMuted) {
          localStream.current.getAudioTracks().forEach(track => {
            track.enabled = false;
          });
        }

        // Set up audio analysis for voice visualization
        audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
        analyser.current = audioContext.current.createAnalyser();
        analyser.current.fftSize = 256;
        
        const source = audioContext.current.createMediaStreamSource(localStream.current);
        source.connect(analyser.current);
        
        const bufferLength = analyser.current.frequencyBinCount;
        dataArray.current = new Uint8Array(bufferLength);
        
        const checkAudioLevel = () => {
          if (analyser.current) {
            analyser.current.getByteFrequencyData(dataArray.current);
            const average = dataArray.current.reduce((acc, val) => acc + val, 0) / dataArray.current.length;
            
            if (average > 10 && !isMuted) {
              setActiveSpeaker(currentUser.uid);
            } else if (activeSpeaker === currentUser.uid) {
              setActiveSpeaker(null);
            }
          }
          animationFrame.current = requestAnimationFrame(checkAudioLevel);
        };
        
        animationFrame.current = requestAnimationFrame(checkAudioLevel);

        // Add local stream tracks
        localStream.current.getTracks().forEach(track => {
          pc.current.addTrack(track, localStream.current);
        });

        // Handle remote stream
        pc.current.ontrack = event => {
          const [stream] = event.streams;
          remoteAudio.current.srcObject = stream;
          setIsConnected(true);
          
          // Set up remote audio analysis
          const remoteAnalyser = audioContext.current.createAnalyser();
          remoteAnalyser.fftSize = 256;
          
          const remoteSource = audioContext.current.createMediaStreamSource(stream);
          remoteSource.connect(remoteAnalyser);
          
          const remoteBufferLength = remoteAnalyser.frequencyBinCount;
          const remoteDataArray = new Uint8Array(remoteBufferLength);
          
          const checkRemoteAudioLevel = () => {
            remoteAnalyser.getByteFrequencyData(remoteDataArray);
            const average = remoteDataArray.reduce((acc, val) => acc + val, 0) / remoteDataArray.length;
            
            if (average > 10) {
              // Find who is connected remotely
              participants.forEach(p => {
                if (p.userId !== currentUser.uid && !p.muted) {
                  setActiveSpeaker(p.userId);
                }
              });
            } else if (activeSpeaker !== currentUser.uid) {
              setActiveSpeaker(null);
            }
            
            requestAnimationFrame(checkRemoteAudioLevel);
          };
          
          requestAnimationFrame(checkRemoteAudioLevel);
        };

        // Connection state changes
        pc.current.onconnectionstatechange = () => {
          if (pc.current.connectionState === 'connected') {
            setIsConnected(true);
          } else if (pc.current.connectionState === 'disconnected' || 
                    pc.current.connectionState === 'failed') {
            setIsConnected(false);
          }
        };

        // ICE Candidate handling
        const unsubscribeCaller = onSnapshot(callerCandidatesCollection, snapshot => {
          snapshot.docChanges().forEach(change => {
            if (change.type === "added" && pc.current.remoteDescription) {
              pc.current.addIceCandidate(new RTCIceCandidate(change.doc.data()))
                .catch(err => console.log("Error adding ICE candidate:", err));
            }
          });
        });

        const unsubscribeCallee = onSnapshot(calleeCandidatesCollection, snapshot => {
          snapshot.docChanges().forEach(change => {
            if (change.type === "added" && pc.current.remoteDescription) {
              pc.current.addIceCandidate(new RTCIceCandidate(change.doc.data()))
                .catch(err => console.log("Error adding ICE candidate:", err));
            }
          });
        });

        pc.current.onicecandidate = async event => {
          if (event.candidate) {
            try {
              const isOfferer = !(await getDoc(offerRef)).exists();
              const target = isOfferer ? callerCandidatesCollection : calleeCandidatesCollection;
              await addDoc(target, event.candidate.toJSON());
            } catch (error) {
              console.error("Error handling ICE candidate:", error);
            }
          }
        };

        // Offer/Answer logic with more robust error handling
        try {
          const offerSnapshot = await getDoc(offerRef);
          const isOfferer = !offerSnapshot.exists();

          if (isOfferer) {
            // We're the offerer - create and set the offer
            const offer = await pc.current.createOffer();
            await pc.current.setLocalDescription(offer);
            await setDoc(offerRef, {
              type: offer.type,
              sdp: offer.sdp,
              userId: currentUser.uid,
              createdAt: new Date()
            });

            // Listen for answers
            const unsubscribeAnswer = onSnapshot(answerRef, async snapshot => {
              const data = snapshot.data();
              if (data?.type === "answer" && pc.current.signalingState === "have-local-offer") {
                try {
                  await pc.current.setRemoteDescription(new RTCSessionDescription(data));
                } catch (error) {
                  console.error("Error setting remote description from answer:", error);
                }
              }
            });

            return () => unsubscribeAnswer();
          } else {
            // We're the answerer - process the existing offer
            const offerData = offerSnapshot.data();
            
            // Only set remote description if we're in stable state
            if (pc.current.signalingState === "stable") {
              await pc.current.setRemoteDescription(new RTCSessionDescription(offerData));
              
              // Create and set answer
              const answer = await pc.current.createAnswer();
              await pc.current.setLocalDescription(answer);
              await setDoc(answerRef, {
                type: answer.type,
                sdp: answer.sdp,
                userId: currentUser.uid,
                createdAt: new Date()
              });
            }
          }
        } catch (error) {
          console.error("Error in signaling process:", error);
        }

        return () => {
          unsubscribeCaller();
          unsubscribeCallee();
        };
      } catch (error) {
        console.error("VoiceChat error:", error);
      }
    }

    start();

    return () => {
      clearInterval(pingInterval);
      unsubscribeParticipants();
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
      if (audioContext.current) {
        audioContext.current.close();
      }
      localStream.current?.getTracks().forEach(track => track.stop());
      pc.current?.close();
      
      // Update participant status to inactive
      const participantRef = doc(participantsRef, currentUser.uid);
      setDoc(participantRef, { active: false }, { merge: true });
    };
  }, [roomId, currentUser]); // Removed isMuted from dependencies

  const toggleMute = () => {
    if (localStream.current) {
      setIsMuted(!isMuted);
    }
  };

  // Find current user from participants
  const currentUserData = participants.find(p => p.userId === currentUser?.uid) || {
    displayName: "You",
    photoURL: currentUser?.photoURL || getPhotoURL(currentUser),
    muted: isMuted
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
      <audio ref={remoteAudio} autoPlay controls={false} hidden />
      
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800  dark:text-gray-200">Voice Chat</h3>
        <div className="flex items-center">
          <span className={`inline-flex h-2 w-2 mr-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
          <span className="text-sm text-gray-600 dark:text-gray-400">{isConnected ? 'Connected' : 'Connecting...'}</span>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-3 mb-4">
        {/* Current user avatar */}
        <div className="relative">
          <div className={`w-12 h-12 overflow-hidden relative rounded-full 
              ${activeSpeaker === currentUser?.uid ? 'ring-2 ring-indigo-300 ring-offset-2 animate-pulse' : ''}`}>
            {currentUserData.photoURL ? (
              <img 
                src={currentUserData.photoURL} 
                alt={currentUserData.displayName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${getInitials(currentUserData.displayName)}`;
                }}
              />
            ) : (
              <div className={`w-full h-full flex items-center justify-center text-white font-semibold ${isMuted ? 'bg-gray-400' : 'bg-indigo-600'}`}>
                {getInitials(currentUserData.displayName)}
              </div>
            )}
            {isMuted && (
              <div className="absolute -top-1 -right-1 bg-white p-0.5 rounded-full shadow-sm dark:bg-gray-800">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L10 8.94l3.47-3.47a.75.75 0 111.06 1.06L11.06 10l3.47 3.47a.75.75 0 01-1.06 1.06L10 11.06l-3.47 3.47a.75.75 0 01-1.06-1.06L8.94 10 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
          <span className="block text-xs text-center mt-1 text-gray-600 font-medium dark:text-gray-400">
            You
          </span>
        </div>
        
        {/* Other participants */}
        {participants.filter(p => p.userId !== currentUser?.uid).map((participant) => (
          <div key={participant.userId} className="relative">
            <div className={`w-12 h-12 overflow-hidden relative rounded-full 
                ${activeSpeaker === participant.userId ? 'ring-2 ring-blue-300 ring-offset-2 animate-pulse' : ''}`}>
              {participant.photoURL ? (
                <img 
                  src={participant.photoURL} 
                  alt={participant.displayName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${getInitials(participant.displayName)}`;
                  }}
                />
              ) : (
                <div className={`w-full h-full flex items-center justify-center text-white font-semibold ${participant.muted ? 'bg-gray-400' : 'bg-blue-500'}`}>
                  {getInitials(participant.displayName)}
                </div>
              )}
              {participant.muted && (
                <div className="absolute -top-1 -right-1 bg-white p-0.5 rounded-full shadow-sm dark:bg-gray-800">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L10 8.94l3.47-3.47a.75.75 0 111.06 1.06L11.06 10l3.47 3.47a.75.75 0 01-1.06 1.06L10 11.06l-3.47 3.47a.75.75 0 01-1.06-1.06L8.94 10 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            <span className="block text-xs text-center mt-1 text-gray-600 font-medium max-w-16 truncate dark:text-gray-400">
              {participant.displayName.split(' ')[0]}
            </span>
          </div>
        ))}
      </div>
      
      <div className="flex justify-center">
        <button 
          onClick={toggleMute}
          className={`flex items-center justify-center px-4 py-2 rounded-full transition-all duration-300 
            ${isMuted 
              ? 'bg-red-100 text-red-600 hover:bg-red-200' 
              : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'} 
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
        >
          {isMuted ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L10 8.94l3.47-3.47a.75.75 0 111.06 1.06L11.06 10l3.47 3.47a.75.75 0 01-1.06 1.06L10 11.06l-3.47 3.47a.75.75 0 01-1.06-1.06L8.94 10 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
              Unmute
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
              Mute
            </>
          )}
        </button>
      </div>
    </div>
  );
}