import { useEffect, useRef, useState } from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export default function Player({ videoId, isHost, roomId }) {
  const playerRef = useRef(null);
  const player = useRef(null);
  const [playerReady, setPlayerReady] = useState(false);
  const syncing = useRef(false);

  // Initialize YouTube player when the API is loaded
  const loadYTPlayer = () => {
    player.current = new window.YT.Player(playerRef.current, {
      height: '100%',
      width: '100%',
      videoId,
      playerVars: {
        // Disable controls for non-host users
        controls: isHost ? 1 : 0,
        disablekb: isHost ? 0 : 1, // Disable keyboard controls for non-hosts
        modestbranding: 1,
      },
      events: {
        onReady: () => setPlayerReady(true),
        onStateChange: (event) => {
          if (!isHost || syncing.current) return;
          handleHostStateChange(event);
        },
      },
    });
  };

  useEffect(() => {
    // Dynamically load YouTube Iframe API
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
      window.onYouTubeIframeAPIReady = loadYTPlayer;
    } else {
      loadYTPlayer();
    }

    return () => {
      if (player.current) {
        player.current.destroy();
      }
    };
  }, [videoId, isHost]); // Added isHost to dependencies to recreate player when host status changes

  const handleHostStateChange = async (event) => {
    const roomRef = doc(db, 'rooms', roomId);
    const currentTime = player.current.getCurrentTime();

    if (event.data === window.YT.PlayerState.PLAYING) {
      await updateDoc(roomRef, {
        status: 'play',
        timestamp: currentTime,
        lastUpdated: Date.now(),
      });
    }

    if (event.data === window.YT.PlayerState.PAUSED) {
      await updateDoc(roomRef, {
        status: 'pause',
        timestamp: currentTime,
        lastUpdated: Date.now(),
      });
    }
  };

  // Listen to Firestore updates for synced video control
  useEffect(() => {
    if (!roomId || !playerReady) return;

    const roomRef = doc(db, 'rooms', roomId);

    const unsub = onSnapshot(roomRef, (docSnap) => {
      const data = docSnap.data();
      if (!data || !player.current) return;

      const { status, timestamp, lastUpdated } = data;

      // Skip updates for host, as they control the state
      if (isHost) return;

      const delay = (Date.now() - lastUpdated) / 1000; // Time delay in seconds
      const syncedTime = timestamp + delay;

      syncing.current = true;

      // Sync playback state based on the host's status
      if (status === 'play') {
        player.current.seekTo(syncedTime, true);
        player.current.playVideo();
      }

      if (status === 'pause') {
        player.current.seekTo(timestamp, true);
        player.current.pauseVideo();
      }

      // Reset syncing state after a short delay to avoid triggering multiple updates
      setTimeout(() => {
        syncing.current = false;
      }, 500);
    });

    return () => unsub();
  }, [roomId, playerReady, isHost]);

  return (
    <div className="w-full h-full">
      <div ref={playerRef} className="w-full h-full"></div>
    </div>
  );
}