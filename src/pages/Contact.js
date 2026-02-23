import React, { useState } from "react";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Contact form submitted:", formData);
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: "", email: "", subject: "", message: "" });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="bg-black text-white min-h-screen py-20">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-cyan-400 mb-4 text-center">Contact Us</h1>
        <p className="text-gray-300 text-center mb-10">Have any questions? Get in touch with us!</p>

        {submitted && (
          <div className="bg-green-600 text-white p-4 rounded mb-6 text-center">
            ✅ Message sent successfully! We'll get back to you soon.
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-gray-900 p-8 rounded-lg border border-cyan-500/30">
          <div className="mb-6">
            <label className="block text-cyan-400 font-semibold mb-2">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-3 bg-black border border-cyan-400/30 rounded text-white"
              placeholder="Your name"
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
              placeholder="Your email"
            />
          </div>

          <div className="mb-6">
            <label className="block text-cyan-400 font-semibold mb-2">Subject</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              className="w-full p-3 bg-black border border-cyan-400/30 rounded text-white"
              placeholder="Message subject"
            />
          </div>

          <div className="mb-6">
            <label className="block text-cyan-400 font-semibold mb-2">Message</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows="6"
              className="w-full p-3 bg-black border border-cyan-400/30 rounded text-white"
              placeholder="Your message"
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full bg-cyan-500 text-white py-3 rounded font-semibold hover:bg-cyan-600"
          >
            Send Message
          </button>
        </form>

        <div className="mt-12 text-center">
          <h3 className="text-2xl font-bold text-cyan-400 mb-6">Other Ways to Reach Us</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-900 p-6 rounded border border-cyan-500/30">
              <p className="text-gray-300">📧 Email</p>
              <p className="text-cyan-400 font-semibold">info@adzap.com</p>
            </div>
            <div className="bg-gray-900 p-6 rounded border border-cyan-500/30">
              <p className="text-gray-300">📱 Phone</p>
              <p className="text-cyan-400 font-semibold">+91 98765 43210</p>
            </div>
            <div className="bg-gray-900 p-6 rounded border border-cyan-500/30">
              <p className="text-gray-300">📍 Location</p>
              <p className="text-cyan-400 font-semibold">College Campus</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
