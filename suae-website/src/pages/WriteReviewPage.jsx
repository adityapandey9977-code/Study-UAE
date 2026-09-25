import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Send, CheckCircle2, Star } from "lucide-react";
import { fetchFromNode } from "../utils/nodeApi";

export function WriteReviewPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    university_id: "",
    course_name: "",
    rating: 0,
    title: "",
    review_text: ""
  });
  
  const [universities, setUniversities] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    alert("Please login to write a review");
    window.location.href = import.meta.env.VITE_STUDENT_LOGIN_URL || "/student-login";
  }, []);

  useEffect(() => {
    // Fetch active universities list for the dropdown
    fetchFromNode("/public/reviews/universities")
      .then((res) => res.json())
      .then((payload) => {
        if (payload && payload.data) {
          setUniversities(payload.data);
        }
      })
      .catch((err) => {
        console.error("Failed to load universities:", err);
      });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.rating === 0) {
      setErrorMsg("Please select a rating of at least 1 star.");
      return;
    }
    setErrorMsg("");
    setIsSubmitting(true);

    fetchFromNode("/public/reviews", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...formData,
        university_id: formData.university_id ? parseInt(formData.university_id, 10) : null
      })
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to submit review.");
        }
        return res.json();
      })
      .then(() => {
        setIsSent(true);
        setIsSubmitting(false);
        setFormData({
          name: "",
          email: "",
          university_id: "",
          course_name: "",
          rating: 0,
          title: "",
          review_text: ""
        });
      })
      .catch((err) => {
        setIsSubmitting(false);
        setErrorMsg(err.message || "An error occurred while submitting your review. Please try again.");
      });
  };

  return (
    <div className="min-h-screen bg-pearl pt-28 pb-20">
      <div className="section-shell">
        
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-tide/70 transition hover:text-night mb-8 group"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
          Back to Home
        </Link>

        {/* Hero Section Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-[#10233f] text-white p-8 md:p-12 mb-10 shadow-xl border border-white/10">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#174a8b]/20 blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-[#7fb2e5]/10 blur-[60px] pointer-events-none" />

          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-white/10 text-[#7fb2e5] border border-white/10">
              Share Your Story
            </span>
            <h1 className="mt-4 font-heading text-3xl font-extrabold text-white sm:text-4xl leading-tight">
              Write a Review
            </h1>
            <p className="mt-4 text-sm md:text-base text-white/80 leading-relaxed font-body">
              Your feedback helps future students find the right pathway and get inspired. Tell us about your academic environment, professors, campus life, or admission process.
            </p>
          </div>
        </div>

        {isSent ? (
          <div className="bg-white rounded-2xl border border-night/5 p-12 text-center shadow-lg max-w-xl mx-auto">
            <div className="flex justify-center mb-6">
              <CheckCircle2 size={64} className="text-emerald-500 animate-bounce" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-[#10233f] mb-3">Review Submitted!</h2>
            <p className="text-gray-600 mb-8 text-sm md:text-base leading-relaxed">
              Thank you for sharing your experience. Your review has been sent to our moderators and will be published on the platform shortly once approved.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setIsSent(false)}
                className="px-6 py-3 rounded-xl border border-night/10 text-night hover:bg-night/5 font-semibold text-sm transition-all duration-300"
              >
                Submit Another Review
              </button>
              <Link
                to="/"
                className="px-6 py-3 rounded-xl bg-[#FACC15] text-[#10233f] hover:bg-[#EAB308] font-bold text-sm transition-all duration-300 shadow-md"
              >
                Go to Homepage
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-night/5 p-6 md:p-10 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                  {errorMsg}
                </div>
              )}

              {/* Personal Info Grid */}
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-tide uppercase tracking-wider mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-pearl/30 border border-night/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#7fb2e5] outline-none font-semibold text-night"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-tide uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-pearl/30 border border-night/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#7fb2e5] outline-none font-semibold text-night"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              {/* Course & University selector */}
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-tide uppercase tracking-wider mb-2">
                    University / College
                  </label>
                  <select
                    value={formData.university_id}
                    onChange={(e) => setFormData({ ...formData, university_id: e.target.value })}
                    className="w-full bg-pearl/30 border border-night/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#7fb2e5] outline-none font-semibold text-night"
                  >
                    <option value="">Select a University (Optional)</option>
                    {universities.map((uni) => (
                      <option key={uni.id} value={uni.id}>
                        {uni.name} ({uni.city})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-tide uppercase tracking-wider mb-2">
                    Course / Program Name
                  </label>
                  <input
                    type="text"
                    value={formData.course_name}
                    onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
                    className="w-full bg-pearl/30 border border-night/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#7fb2e5] outline-none font-semibold text-night"
                    placeholder="e.g. MBA, B.Tech CSE"
                  />
                </div>
              </div>

              {/* Rating Star Selection */}
              <div>
                <label className="block text-xs font-bold text-tide uppercase tracking-wider mb-2">
                  Overall Rating
                </label>
                <div className="flex items-center gap-2 py-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        size={32}
                        className={`${
                          star <= (hoverRating || formData.rating)
                            ? "fill-[#FACC15] text-[#FACC15]"
                            : "text-gray-300"
                        } transition-colors duration-200`}
                      />
                    </button>
                  ))}
                  {formData.rating > 0 && (
                    <span className="text-sm font-bold text-night ml-2 bg-pearl px-2.5 py-1 rounded-lg">
                      {formData.rating} / 5
                    </span>
                  )}
                </div>
              </div>

              {/* Title of Review */}
              <div>
                <label className="block text-xs font-bold text-tide uppercase tracking-wider mb-2">
                  Review Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-pearl/30 border border-night/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#7fb2e5] outline-none font-semibold text-night"
                  placeholder="Summarize your experience (e.g. Amazing campus life!)"
                />
              </div>

              {/* Review Comments */}
              <div>
                <label className="block text-xs font-bold text-tide uppercase tracking-wider mb-2">
                  Detailed Review / Experience
                </label>
                <textarea
                  required
                  rows={5}
                  value={formData.review_text}
                  onChange={(e) => setFormData({ ...formData, review_text: e.target.value })}
                  className="w-full bg-pearl/30 border border-night/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#7fb2e5] outline-none font-semibold text-night"
                  placeholder="Share details about professors, facilities, placement support, admissions, etc."
                />
              </div>

              <div className="pt-4 border-t border-pearl flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FACC15] px-8 py-3.5 text-sm font-bold text-[#10233f] hover:bg-[#EAB308] transition-all duration-300 shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#10233f] border-t-transparent" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Submit Review
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        )}

      </div>
    </div>
  );
}
