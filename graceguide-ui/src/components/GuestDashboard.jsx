import React from 'react';

function Footer() {
  return (
    <footer className="text-center text-xs text-gray-500 py-4 border-t">
      <a href="#" className="mx-2 hover:underline">About</a>
      <span>&bull;</span>
      <a href="#" className="mx-2 hover:underline">Privacy</a>
      <span>&bull;</span>
      <a href="#" className="mx-2 hover:underline">Terms</a>
      <span>&bull;</span>
      <a href="#" className="mx-2 hover:underline">Contact</a>
    </footer>
  );
}

function GuestDashboard({ onSignIn }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center p-4 shadow bg-white">
        <div className="flex items-center gap-2 text-brand font-semibold">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M10 2v6H4v8h6v6h4v-6h6V8h-6V2z" />
          </svg>
          GraceGuideAI
        </div>
        <div className="space-x-2">
          <button
            className="text-brand font-medium"
            onClick={() => onSignIn && onSignIn()}
          >
            Sign In
          </button>
          <button className="bg-brand text-white px-3 py-1 rounded-md">Sign Up</button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col items-center gap-8">
        <div className="w-full max-w-xl text-center space-y-2">
          <textarea
            className="w-full border rounded-md p-3" rows="4"
            placeholder="Ask anything about the Catholic faith…"
          />
          <button className="bg-brand text-white px-4 py-2 rounded-md">Submit</button>
          <p className="text-xs text-gray-500">Free, no account needed.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          <section>
            <h2 className="text-lg font-semibold mb-2">Popular Questions</h2>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>What is the Holy Trinity?</li>
              <li>Why do Catholics confess to a priest?</li>
              <li>How do I pray the Rosary?</li>
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-semibold mb-2">Verse of the Day</h2>
            <blockquote className="italic">"I can do all things through Christ who strengthens me." (Philippians 4:13)</blockquote>
          </section>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

GuestDashboard.Footer = Footer;
export default GuestDashboard;
