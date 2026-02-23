import React from "react";

function Home() {
  return (
    <div className="bg-black text-white min-h-screen">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold text-cyan-400 mb-4">Welcome to Adzap</h1>
        <p className="text-xl text-gray-300 mb-8">
          Join us for an amazing college event filled with competitions, networking, and fun!
        </p>
        <a href="/registration" className="bg-cyan-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-cyan-600">
          Register Now
        </a>
      </section>

      {/* Event Details */}
      <section className="max-w-6xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-gray-800 p-6 rounded-lg border border-cyan-500/30">
          <h3 className="text-2xl font-bold text-cyan-400 mb-2">🎯 Competitions</h3>
          <p className="text-gray-300">Multiple exciting competitions across various categories</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg border border-cyan-500/30">
          <h3 className="text-2xl font-bold text-cyan-400 mb-2">🤝 Networking</h3>
          <p className="text-gray-300">Connect with students and professionals from various fields</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg border border-cyan-500/30">
          <h3 className="text-2xl font-bold text-cyan-400 mb-2">🏆 Prizes</h3>
          <p className="text-gray-300">Win exciting prizes and recognition for your achievements</p>
        </div>
      </section>

      {/* Event Info */}
      <section className="bg-gray-900 py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-cyan-400 mb-8">Event Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-gray-300 mb-4"><strong>Date:</strong> March 15, 2026</p>
              <p className="text-gray-300 mb-4"><strong>Location:</strong> College Main Auditorium</p>
            </div>
            <div>
              <p className="text-gray-300 mb-4"><strong>Time:</strong> 9:00 AM - 5:00 PM</p>
              <p className="text-gray-300 mb-4"><strong>Registration:</strong> Open for 200 participants</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
