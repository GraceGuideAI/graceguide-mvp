import React, { useState } from 'react';
import GuestDashboard from './components/GuestDashboard.jsx';
import SignedInDashboard from './components/SignedInDashboard.jsx';

export default function App() {
  const [signedIn, setSignedIn] = useState(false);

  return signedIn ? (
    <SignedInDashboard onSignOut={() => setSignedIn(false)} />
  ) : (
    <GuestDashboard onSignIn={() => setSignedIn(true)} />
  );
}

