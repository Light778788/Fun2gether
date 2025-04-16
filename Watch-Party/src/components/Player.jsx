import { useEffect, useRef, useState } from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export default function Player({ videoId, isHost, roomId }) {
  const playerRef = useRef(null);
  const player = useRef(null);
  const [playerReady, setPlayerReady] = useState(false);
  const syncing = useRef(false);

  const loadYTPlayer = () => {
    player.current = new window.YT.Player(playerRef.current, {
        height: '100%',
        width: '100%',
      videoId,
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
  }, [videoId]);

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

  // Listen to Firestore as guest (or host if needed)
  useEffect(() => {
    if (!roomId || !playerReady) return;

    const roomRef = doc(db, 'rooms', roomId);

    const unsub = onSnapshot(roomRef, (docSnap) => {
      const data = docSnap.data();
      if (!data || !player.current) return;

      const { status, timestamp, lastUpdated } = data;

      // Skip if host (they trigger updates themselves)
      if (isHost) return;

      // Calculate how much time passed since update
      const delay = (Date.now() - lastUpdated) / 1000;
      const syncedTime = timestamp + delay;

      syncing.current = true;

      if (status === 'play') {
        player.current.seekTo(syncedTime, true);
        player.current.playVideo();
      }

      if (status === 'pause') {
        player.current.seekTo(timestamp, true);
        player.current.pauseVideo();
      }

      setTimeout(() => {
        syncing.current = false;
      }, 500); // prevent loop triggers
    });

    return () => unsub();
  }, [roomId, playerReady]);

  return <div className="w-full h-full">
  <div 
    ref={playerRef} 
    className="w-full h-full"
  />
</div>;
}
