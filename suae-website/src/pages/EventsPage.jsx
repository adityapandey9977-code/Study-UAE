import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, MapPin, Laptop, Video, Award, Users } from "lucide-react";
import { usePreviewData } from "../context/PreviewContext";

const fallbackEvents = [
  {
    id: 1,
    title: "Dubai Higher Education Fair 2026",
    type: "Physical Fair",
    date: "July 15, 2026",
    time: "4:00 PM - 8:00 PM (GST)",
    location: "Dubai World Trade Centre, Hall 3",
    description: "Meet admission directors from over 25 top UAE campuses. Learn about merit-based scholarships, course offerings, and submit applications on the spot.",
    organizer: "Study in UAE Scholarship Platform",
    badge: "JUL 15"
  },
  {
    id: 2,
    title: "Webinar: Navigating Scholarships & Fee Waivers in UAE",
    type: "Live Webinar",
    date: "July 22, 2026",
    time: "3:00 PM - 4:15 PM (GST)",
    location: "Online via Zoom Meeting",
    description: "Our senior counselors break down the scholarship criteria for various universities. We will cover academic waivers, sports grants, and early bird discounts.",
    organizer: "SIS Admissions Team",
    badge: "JUL 22",
    isOnline: true
  },
  {
    id: 3,
    title: "Abu Dhabi University Open Day & Campus Tour",
    type: "Open Day",
    date: "August 05, 2026",
    time: "10:00 AM - 3:00 PM (GST)",
    location: "Khalifa City Campus, Abu Dhabi",
    description: "Explore state-of-the-art labs, classrooms, student housing, and sports complexes. Current international students will share their lifestyle experiences.",
    organizer: "Abu Dhabi Campus Coalition",
    badge: "AUG 05"
  },
  {
    id: 4,
    title: "Webinar: UAE Student Visa & Health Insurance Process",
    type: "Live Webinar",
    date: "August 12, 2026",
    time: "4:30 PM - 5:30 PM (GST)",
    location: "Online via Zoom Webinar",
    description: "A step-by-step guide on obtaining your student residence visa, completing medical fitness tests, and selecting approved health insurance packages.",
    organizer: "Student Visa Support Cell",
    badge: "AUG 12",
    isOnline: true
  },
  {
    id: 5,
    title: "Global MBA & Business Executive Admissions Seminar",
    type: "Seminar",
    date: "August 25, 2026",
    time: "6:00 PM - 8:00 PM (GST)",
    location: "Sheraton Mall of the Emirates, Dubai",
    description: "Tailored for working professionals. Compare part-time, executive, and global MBA programs from leading British, American, and local business schools.",
    organizer: "UAE Business Schools Association",
    badge: "AUG 25"
  }
];

export function EventsPage({ content }) {
  const eventsData = usePreviewData("events", content?.events || fallbackEvents);
  const [registeredEventId, setRegisteredEventId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [rsvpName, setRsvpName] = useState("");
  const [rsvpEmail, setRsvpEmail] = useState("");

  const handleRsvpSubmit = (e) => {
    e.preventDefault();
    setRegisteredEventId(showModal);
    setShowModal(false);
    setRsvpName("");
    setRsvpEmail("");
  };

  return (
    <div className="min-h-screen bg-pearl pt-28 pb-20">
      <div className="section-shell">
        
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-tide/70 transition hover:text-night mb-8 group"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
          Back to Home
        </Link>

        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-lagoon/10 px-3 py-1 text-xs font-semibold text-lagoon uppercase tracking-wider">
            Events Calendar
          </span>
          <h1 className="mt-4 font-heading text-4xl font-extrabold text-night sm:text-5xl">
            Admissions Events & Webinars
          </h1>
          <p className="mt-4 text-base text-tide/75 leading-relaxed">
            Join our upcoming virtual webinars and in-person university fairs to interact directly with university staff, explore campuses, and fast-track your applications.
          </p>
        </div>

        {/* Events List */}
        <div className="space-y-6">
          {eventsData.map((event) => {
            const isRegistered = registeredEventId === event.id;
            return (
              <div
                key={event.id}
                className="flex flex-col sm:flex-row gap-6 p-6 rounded-2xl border border-night/5 bg-white shadow-sm transition hover:shadow-md"
              >
                {/* Date Badge */}
                <div className="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 flex-col items-center justify-center rounded-xl bg-night text-white text-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white">{event.badge.split(" ")[0]}</span>
                  <span className="text-xl sm:text-2xl font-extrabold leading-none mt-1">{event.badge.split(" ")[1]}</span>
                </div>

                {/* Details */}
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        event.isOnline 
                          ? "bg-lagoon/10 text-lagoon border border-lagoon/10" 
                          : "bg-amber-50 text-amber-700 border border-amber-100"
                      }`}>
                        {event.isOnline ? <Laptop size={10} /> : <Users size={10} />}
                        {event.type}
                      </span>
                      <span className="text-xs text-tide/50">• Organized by {event.organizer}</span>
                    </div>

                    <h3 className="mt-2 font-heading text-lg font-bold text-night leading-snug">
                      {event.title}
                    </h3>
                    <p className="mt-2.5 text-xs leading-relaxed text-tide/75">
                      {event.description}
                    </p>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid gap-3 sm:grid-cols-2 text-xs text-tide/80 pt-2 border-t border-night/5">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-tide/50 shrink-0" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {event.isOnline ? <Video size={14} className="text-tide/50 shrink-0" /> : <MapPin size={14} className="text-tide/50 shrink-0" />}
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>
                </div>

                {/* RSVP Action */}
                <div className="flex sm:flex-col items-stretch justify-center shrink-0 border-t sm:border-t-0 sm:border-l border-night/5 pt-4 sm:pt-0 sm:pl-6 gap-3">
                  {isRegistered ? (
                    <span className="flex items-center justify-center gap-1.5 rounded-lg bg-lagoon/10 px-4 py-2.5 text-xs font-bold text-lagoon border border-lagoon/10 sm:w-32 text-center">
                      ✓ Registered
                    </span>
                  ) : (
                    <button
                      onClick={() => setShowModal(event.id)}
                      className="btn-yellow w-full sm:w-32 px-4 py-2.5 text-xs rounded-lg"
                    >
                      RSVP Now
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal RSVP Form */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-night/50 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-night/5">
              <h4 className="font-heading text-lg font-bold text-night mb-2">Register for Event</h4>
              <p className="text-xs text-tide/60 mb-6">Confirm your attendance to receive access links or entry passes.</p>
              
              <form onSubmit={handleRsvpSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-tide/70 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={rsvpName}
                    onChange={(e) => setRsvpName(e.target.value)}
                    className="w-full rounded-lg border border-night/10 px-3 py-2 text-sm outline-none transition focus:border-lagoon"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-tide/70 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    value={rsvpEmail}
                    onChange={(e) => setRsvpEmail(e.target.value)}
                    className="w-full rounded-lg border border-night/10 px-3 py-2 text-sm outline-none transition focus:border-lagoon"
                    placeholder="john@example.com"
                  />
                </div>
                <div className="flex gap-3 pt-4 border-t border-night/5">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 rounded-lg border border-night/10 py-2.5 text-xs font-bold text-tide hover:bg-night/5 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-yellow flex-1 py-2.5 text-xs rounded-lg"
                  >
                    Confirm RSVP
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
