import React from 'react';
import GuestDashboard from './GuestDashboard';

function SignedInDashboard({ name = 'Friend', onSignOut }) {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2 text-xl font-bold">
          <img src="/logo.png" alt="Logo" className="h-8 w-8" />
          GraceGuide
        </div>
        <div className="flex items-center gap-4">
          <button title="Notifications">🔔</button>
          <button title="Saved">💾</button>
          <button title="Settings">⚙️</button>
          <img src="/avatar.png" alt="Avatar" className="h-8 w-8 rounded-full" />
          {onSignOut && (
            <button className="text-sm underline" onClick={onSignOut}>
              Sign Out
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 p-4 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-semibold">Good morning, {name}</h1>
          <div className="flex flex-wrap gap-2">
            <button className="bg-brand text-white px-4 py-2 rounded">Ask New Question</button>
            <button className="bg-brand text-white px-4 py-2 rounded">Daily Gospel</button>
            <button className="bg-brand text-white px-4 py-2 rounded">Catechism Explorer</button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <section className="lg:col-span-2 space-y-2">
            <h2 className="font-semibold">My Recent Questions</h2>
            <ul className="space-y-1">
              <li className="border p-2 rounded">Recent question 1</li>
              <li className="border p-2 rounded">Recent question 2</li>
              <li className="border p-2 rounded">Recent question 3</li>
            </ul>
          </section>
          <section className="space-y-2">
            <h2 className="font-semibold">Saved Answers</h2>
            <div className="flex gap-2 overflow-x-auto">
              <div className="border p-4 rounded min-w-[200px]">Answer 1</div>
              <div className="border p-4 rounded min-w-[200px]">Answer 2</div>
              <div className="border p-4 rounded min-w-[200px]">Answer 3</div>
            </div>
          </section>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="border p-4 rounded">Verse of the Day</div>
          <div className="border p-4 rounded">Prayer of the Day</div>
          <div className="border p-4 rounded">Upcoming Feast</div>
        </div>
      </main>

      <div className="bg-yellow-100 text-center py-2">Upgrade to Premium</div>
      <GuestDashboard.Footer />
    </div>
  );
}

export default SignedInDashboard;
