import React, { useState } from "react";

function Registration() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    college: "",
    category: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: "", email: "", phone: "", college: "", category: "" });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="bg-black text-white min-h-screen py-20">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-cyan-400 mb-4 text-center">Register for Adzap</h1>
        <p className="text-gray-300 text-center mb-10">Fill the form below to register for the event</p>

        {submitted && (
          <div className="bg-green-600 text-white p-4 rounded mb-6 text-center">
            ✅ Registration successful! Thank you for registering.
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-gray-900 p-8 rounded-lg border border-cyan-500/30">
          <div className="mb-6">
            <label className="block text-cyan-400 font-semibold mb-2">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-3 bg-black border border-cyan-400/30 rounded text-white"
              placeholder="Enter your name"
            />
          </div>

          <div className="mb-6">
            <label className="block text-cyan-400 font-semibold mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-3 bg-black border border-cyan-400/30 rounded text-white"
              placeholder="Enter your email"
            />
          </div>

          <div className="mb-6">
            <label className="block text-cyan-400 font-semibold mb-2">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full p-3 bg-black border border-cyan-400/30 rounded text-white"
              placeholder="Enter your phone number"
            />
          </div>

          <div className="mb-6">
            <label className="block text-cyan-400 font-semibold mb-2">College/University</label>
            <input
              type="text"
              name="college"
              value={formData.college}
              onChange={handleChange}
              required
              className="w-full p-3 bg-black border border-cyan-400/30 rounded text-white"
              placeholder="Enter your college/university"
            />
          </div>

          <div className="mb-6">
            <label className="block text-cyan-400 font-semibold mb-2">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full p-3 bg-black border border-cyan-400/30 rounded text-white"
            >
              <option value="">Select a category</option>
              <option value="web-dev">Web Development</option>
              <option value="app-dev">App Development</option>
              <option value="design">UI/UX Design</option>
              <option value="other">Other</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-cyan-500 text-white py-3 rounded font-semibold hover:bg-cyan-600"
          >
            Register Now
          </button>
        </form>
      </div>
    </div>
  );
}

export default Registration;
