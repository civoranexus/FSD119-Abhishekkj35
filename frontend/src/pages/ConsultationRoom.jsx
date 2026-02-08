import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { consultationService, appointmentService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const ConsultationRoom = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');

  useEffect(() => {
    initializeSession();
  }, [appointmentId]);

  const initializeSession = async () => {
    try {
      const response = await consultationService.initiateSession(appointmentId);
      setSession(response.data);
    } catch (err) {
      setError('Failed to initialize consultation');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: messageInput,
          sender: 'user',
          timestamp: new Date(),
        },
      ]);
      setMessageInput('');
    }
  };

  const handleEndConsultation = async () => {
    try {
      await consultationService.endSession(session.sessionId);
      navigate('/patient/my-appointments');
    } catch (err) {
      setError('Failed to end consultation');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow p-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Consultation Room</h1>
          <p className="text-sm text-gray-600">Session ID: {session?.sessionId}</p>
        </div>
        <button
          onClick={handleEndConsultation}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          End Consultation
        </button>
      </div>

      {error && (
        <div className="m-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="flex flex-1 gap-4 p-4">
        {/* Video/Audio Area */}
        <div className="flex-1 bg-gray-900 rounded-lg flex items-center justify-center">
          <div className="text-center text-white">
            <div className="text-6xl mb-4">🎥</div>
            <p className="text-xl">
              {session?.consultationType === 'video' ? 'Video Consultation' : 'Audio Consultation'}
            </p>
            <p className="text-gray-400 mt-2">Simulated consultation interface</p>
          </div>
        </div>

        {/* Chat Sidebar */}
        <div className="w-80 bg-white rounded-lg shadow flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b">
            <h2 className="font-semibold text-gray-800">Chat</h2>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <p className="text-center text-gray-500 text-sm">No messages yet</p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSendMessage}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationRoom;
