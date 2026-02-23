import React from "react";

function Admin() {
  const registrations = [
    { id: 1, name: "John Doe", email: "john@example.com", college: "MIT", category: "Web Development" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", college: "Stanford", category: "AI/ML" },
  ];
  const stats = {
    totalRegistrations: 2,
    totalCategories: 4,
    eventDate: "March 15, 2026",
  };

  return (
    <div className="bg-black text-white min-h-screen py-20">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-cyan-400 mb-8 text-center">Admin Dashboard</h1>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gray-900 p-6 rounded border border-cyan-500/30">
            <p className="text-gray-300 mb-2">Total Registrations</p>
            <p className="text-3xl font-bold text-cyan-400">{stats.totalRegistrations}</p>
          </div>
          <div className="bg-gray-900 p-6 rounded border border-cyan-500/30">
            <p className="text-gray-300 mb-2">Total Categories</p>
            <p className="text-3xl font-bold text-cyan-400">{stats.totalCategories}</p>
          </div>
          <div className="bg-gray-900 p-6 rounded border border-cyan-500/30">
            <p className="text-gray-300 mb-2">Event Date</p>
            <p className="text-cyan-400 font-semibold">{stats.eventDate}</p>
          </div>
        </div>

        {/* Registrations Table */}
        <div className="bg-gray-900 rounded border border-cyan-500/30 overflow-hidden">
          <h2 className="text-2xl font-bold text-cyan-400 p-6 border-b border-cyan-500/30">Recent Registrations</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="text-left p-4 text-cyan-400">ID</th>
                  <th className="text-left p-4 text-cyan-400">Name</th>
                  <th className="text-left p-4 text-cyan-400">Email</th>
                  <th className="text-left p-4 text-cyan-400">College</th>
                  <th className="text-left p-4 text-cyan-400">Category</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((reg) => (
                  <tr key={reg.id} className="border-t border-cyan-500/30 hover:bg-gray-800">
                    <td className="p-4">{reg.id}</td>
                    <td className="p-4">{reg.name}</td>
                    <td className="p-4">{reg.email}</td>
                    <td className="p-4">{reg.college}</td>
                    <td className="p-4">{reg.category}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-cyan-400 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-cyan-500 text-white px-6 py-3 rounded font-semibold hover:bg-cyan-600">
              Export Registrations
            </button>
            <button className="bg-cyan-500 text-white px-6 py-3 rounded font-semibold hover:bg-cyan-600">
              Send Notifications
            </button>
            <button className="bg-cyan-500 text-white px-6 py-3 rounded font-semibold hover:bg-cyan-600">
              View Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;
