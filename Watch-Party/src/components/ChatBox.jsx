import { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy,query, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export default function ChatBox({ roomId, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (!roomId) return;

    const messagesRef = collection(db, `rooms/${roomId}/chat`);
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(msgs);
    });

    return unsubscribe;
  }, [roomId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !roomId || !currentUser) return;

    await addDoc(collection(db, `rooms/${roomId}/chat`), {
      uid: currentUser.uid,
      message: newMessage,
      timestamp: Date.now()
    });

    setNewMessage('');
  };

  return (
    <div className="border rounded p-4">
      <div className="h-64 overflow-y-auto mb-4">
        {messages.map(msg => (
          <div key={msg.id} className="mb-2">
            <strong>{msg.uid === currentUser?.uid ? 'You' : 'User'}:</strong> {msg.message}
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="flex">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 border rounded p-2"
          placeholder="Type a message..."
        />
        <button type="submit" className="ml-2 bg-blue-500 text-white p-2 rounded">
          Send
        </button>
      </form>
    </div>
  );
}