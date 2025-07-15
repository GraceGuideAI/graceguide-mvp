import React, { useState, useEffect } from 'react';
import GuestDashboard from './components/GuestDashboard.jsx';
import SignedInDashboard from './components/SignedInDashboard.jsx';

export default function App() {
  const [signedIn, setSignedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is already signed in
    const token = localStorage.getItem('authToken');
    const email = localStorage.getItem('userEmail');
    if (token && email) {
      setSignedIn(true);
      setUser({ email });
    }
  }, []);

  const handleSignIn = (userData) => {
    setSignedIn(true);
    setUser(userData);
  };

  const handleSignOut = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    setSignedIn(false);
    setUser(null);
  };

  return signedIn ? (
    <SignedInDashboard 
      user={user}
      onSignOut={handleSignOut} 
    />
  ) : (
    <GuestDashboard onSignIn={handleSignIn} />
  );
}

