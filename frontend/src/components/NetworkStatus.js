import React, { useState, useEffect } from 'react';
import './NetworkStatus.css';

const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) {
    return (
      <div className="network-status online">
        <span className="status-dot"></span>
        <span className="status-text">Online</span>
      </div>
    );
  }

  return (
    <div className="network-status offline">
      <span className="status-dot"></span>
      <span className="status-text">Offline - Using Cached Data</span>
    </div>
  );
};

export default NetworkStatus;
