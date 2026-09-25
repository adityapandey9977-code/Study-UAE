import { useState } from "react";
import { X, Send, CheckCircle2 } from "lucide-react";
import { submitConsultationForm } from "../services/formApi";

export function ConsultationModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    city: "Dubai",
    program_level: "Undergraduate",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.mobile) {
      setError("Please fill in your name and mobile number.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      await submitConsultationForm(formData);
      setSubmitted(true);
    } catch (err) {
      setError(err?.message || "Failed to submit request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="consultation">
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#0d1f39]/65 px-4 py-4 backdrop-blur-[2px]">
        <div className="relative my-auto w-full max-w-[620px] overflow-hidden rounded-[1.375rem] border border-[#d8e3ef] bg-white p-8 text-night shadow-[0_24px_80px_rgba(5,21,44,0.24)]">
          <button
            className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-[#d7e2ee] bg-white text-night transition hover:border-[#FACC15] hover:text-[#EAB308]"
            type="button"
            onClick={onClose}
            aria-label="Close consultation form"
          >
            <X size={18} />
          </button>

          {submitted ? (
            <div className="py-10 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4">
                <CheckCircle2 size={36} />
              </div>
              <h3 className="text-2xl font-bold text-night">Consultation Request Sent!</h3>
              <p className="mt-2 text-sm text-[#61769a]">
                Thank you, <strong className="text-night">{formData.name}</strong>. An admissions advisor will contact you shortly on{" "}
                <strong className="text-night">{formData.mobile}</strong>.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-6 inline-flex items-center justify-center rounded-full bg-[#174a8b] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#133c70]"
              >
                Done
              </button>
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#174a8b]">Direct Admissions Assistance</span>
                <h3 className="mt-1 text-2xl font-bold tracking-tight text-night">Book Free 1-on-1 Consultation</h3>
                <p className="mt-1 text-sm text-[#61769a]">
                  Speak with our certified higher education advisors regarding university admissions, scholarships, and visas across the UAE.
                </p>
              </div>

              {error && (
                <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-600 border border-red-200">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#61769a] mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="e.g. John Doe"
                      className="w-full rounded-lg border border-[#d8e3ef] px-3.5 py-2.5 text-sm outline-none transition focus:border-[#174a8b]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#61769a] mb-1">
                      Mobile / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      required
                      placeholder="e.g. +971 50 123 4567"
                      className="w-full rounded-lg border border-[#d8e3ef] px-3.5 py-2.5 text-sm outline-none transition focus:border-[#174a8b]"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#61769a] mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. student@example.com"
                      className="w-full rounded-lg border border-[#d8e3ef] px-3.5 py-2.5 text-sm outline-none transition focus:border-[#174a8b]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#61769a] mb-1">
                      Preferred Degree Level
                    </label>
                    <select
                      name="program_level"
                      value={formData.program_level}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-[#d8e3ef] px-3.5 py-2.5 text-sm outline-none transition focus:border-[#174a8b] bg-white"
                    >
                      <option value="Undergraduate">Undergraduate (Bachelor's)</option>
                      <option value="Postgraduate">Postgraduate (Master's)</option>
                      <option value="Diploma">Diploma / Foundation</option>
                      <option value="Doctorate">Doctorate (PhD)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#61769a] mb-1">
                    Questions or Specific University Interests
                  </label>
                  <textarea
                    name="message"
                    rows="3"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us about the courses or universities you are interested in..."
                    className="w-full rounded-lg border border-[#d8e3ef] px-3.5 py-2.5 text-sm outline-none transition focus:border-[#174a8b]"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#174a8b] px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-[#133c70] disabled:opacity-50"
                >
                  {loading ? (
                    "Submitting..."
                  ) : (
                    <>
                      <span>Submit Consultation Request</span>
                      <Send size={16} />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
