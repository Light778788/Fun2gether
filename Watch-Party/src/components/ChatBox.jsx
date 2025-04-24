import { useEffect, useState, useRef } from 'react';
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';

export default function ChatBox({ roomId, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const getPhotoURL = (user) => {
    if (user?.photoURL) {
      return user.photoURL;
    }
    return `https://ui-avatars.com/api/?name=${user?.email?.[0] || 'U'}`;
  };

  useEffect(() => {
    if (!roomId) return;

    const messagesRef = collection(db, `rooms/${roomId}/chat`);
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        photoURL: doc.data().photoURL || getPhotoURL({ email: doc.data().uid }),
      }));
      setMessages(msgs);
    });

    return unsubscribe;
  }, [roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !roomId || !currentUser) return;

    const photoURL = currentUser.photoURL || 
      `https://ui-avatars.com/api/?name=${currentUser.email?.[0] || 'U'}`;

    await addDoc(collection(db, `rooms/${roomId}/chat`), {
      uid: currentUser.uid,
      message: newMessage,
      displayName: currentUser.displayName || currentUser.email,
      photoURL: photoURL,
      timestamp: serverTimestamp(),
    });

    setNewMessage('');
  };

  return (
    <div className="border rounded p-4 shadow-md bg-white dark:bg-gray-800 flex flex-col h-[500px]">
      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
        {messages.map((msg) => {
          const isCurrentUser = msg.uid === currentUser?.uid;
          const displayName = msg.displayName || msg.email || 'User';
          const avatarName = displayName[0].toUpperCase();

          return (
            <div
              key={msg.id}
              className={`flex items-end ${
                isCurrentUser ? 'justify-end' : 'justify-start'
              }`}
            >
              {!isCurrentUser && (
                <img
                  src={msg.photoURL || `https://ui-avatars.com/api/?name=${avatarName}`}
                  alt={displayName}
                  className="w-8 h-8 rounded-full mr-2 object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${avatarName}`;
                  }}
                />
              )}
              <div
                className={`max-w-xs break-words px-4 py-2 rounded-lg shadow text-sm ${
                  isCurrentUser
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
                }`}
              >
                {!isCurrentUser && (
                  <div className="font-semibold text-xs mb-1">
                    {displayName}
                  </div>
                )}
                {msg.message}
              </div>
              {isCurrentUser && (
                <img
                  src={msg.photoURL || `https://ui-avatars.com/api/?name=${avatarName}`}
                  alt={displayName}
                  className="w-8 h-8 rounded-full ml-2 object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${avatarName}`;
                  }}
                />
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="mt-4 flex items-center space-x-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring focus:border-blue-400 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:focus:ring-blue-500"
          placeholder="Type a message..."
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
        >
          Send
        </button>
      </form>
    </div>
  );
}