import React, { useState, useEffect } from 'react';

const NotificationBanner = ({ notifications, onDismiss }) => {
  const [visible, setVisible] = useState([]);

  useEffect(() => {
    setVisible(notifications);
  }, [notifications]);

  useEffect(() => {
    if (visible.length > 0) {
      const timer = setTimeout(() => {
        setVisible((prev) => prev.slice(1));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (visible.length === 0) return null;

  const notification = visible[0];

  const bgColor = {
    success: 'bg-green-100 border-green-400 text-green-800',
    error: 'bg-red-100 border-red-400 text-red-800',
    info: 'bg-blue-100 border-blue-400 text-blue-800',
    warning: 'bg-yellow-100 border-yellow-400 text-yellow-800',
  };

  return (
    <div className={`fixed top-20 right-4 max-w-md p-4 rounded-lg border-l-4 shadow-lg ${bgColor[notification.type]}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="font-semibold">{notification.title}</p>
          <p className="text-sm mt-1">{notification.message}</p>
        </div>
        <button
          onClick={() => {
            setVisible((prev) => prev.slice(1));
            onDismiss?.(notification.id);
          }}
          className="text-xl font-bold opacity-70 hover:opacity-100"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default NotificationBanner;
