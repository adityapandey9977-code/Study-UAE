import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, Mail, Phone, MapPin, Clock, Send, CheckCircle2 } from "lucide-react";
import { usePreviewData } from "../context/PreviewContext";
import { getPageSettingsForPath } from "../utils/pageSeo";

export function ContactPage({ content }) {
  const location = useLocation();
  const contactData = usePreviewData("contact", content?.contact);
  const pageSettings = usePreviewData("pageSettings", content?.pageSettings);
  const activePageSettings = getPageSettingsForPath(location.pathname, pageSettings);
  const layout = activePageSettings?.layout || "full-width";

  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [sidebarLocked, setSidebarLocked] = useState(false);

  if (!contactData) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSent(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 1200);
  };

  function hexToRgba(hex, alpha) {
    if (!hex) return `rgba(16,35,63,${alpha})`;
    const clean = hex.replace('#', '');
    const normalized = clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean;
    const bigint = parseInt(normalized, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r},${g},${b},${alpha})`;
  }

  const alignment = contactData.alignment || 'left';
  const accent = contactData.accentColor || '#7fb2e5';
  const baseBg = contactData.backgroundColor || '#10233f';
  const overlayOpacity = (contactData.overlayOpacity || 60) / 100;
  const alignmentClass = alignment === 'center' ? 'text-center mx-auto' : alignment === 'right' ? 'text-right ml-auto' : 'text-left';

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

        <div
          className="relative overflow-hidden rounded-3xl text-white p-8 md:p-16 mb-16 shadow-xl border border-white/10"
          style={contactData.heroImage ? { backgroundImage: `url(${contactData.heroImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { backgroundColor: baseBg }}
        >
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#174a8b]/20 blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-[#7fb2e5]/10 blur-[80px] pointer-events-none" />

          <div className="absolute inset-0" style={{ backgroundColor: hexToRgba(baseBg, overlayOpacity) }} />

          <div className={`relative z-10 max-w-3xl ${alignmentClass}`}>
            {contactData.badge && (
              <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider" style={{ backgroundColor: hexToRgba(accent, 0.12), color: accent, border: `1px solid ${hexToRgba(accent, 0.25)}` }}>
                {contactData.badge}
              </span>
            )}

            <h1 className="mt-4 font-heading text-4xl font-extrabold text-white sm:text-5xl leading-tight">
              {contactData.heroTitle}
            </h1>
            <p className="mt-6 text-base md:text-lg text-white/80 leading-relaxed font-body">
              {contactData.heroSubtitle}
            </p>
          </div>
        </div>
        <div className={`grid gap-8 items-stretch ${layout === 'sidebar' ? 'lg:grid-cols-[0.8fr_1.2fr]' : 'lg:grid-cols-5'}`}>

          <div className="lg:col-span-2 flex flex-col">
            <div className="bg-white rounded-2xl border border-night/5 p-8 shadow-sm space-y-6 flex-1">
              <h2 className="font-heading text-xl font-bold text-[#182b67] mb-6">Contact Information</h2>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lagoon/5 text-lagoon">
                    <Mail size={18} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-tide uppercase tracking-wider">Email Address</h3>
                    <p className="text-sm font-semibold text-night mt-1">{contactData.email}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lagoon/5 text-lagoon">
                    <Phone size={18} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-tide uppercase tracking-wider">Phone Helpline</h3>
                    <p className="text-sm font-semibold text-night mt-1">{contactData.phone}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lagoon/5 text-lagoon">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-tide uppercase tracking-wider">Our Office Address</h3>
                    <p className="text-sm font-semibold text-night mt-1 leading-relaxed">{contactData.address}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lagoon/5 text-lagoon">
                    <Clock size={18} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-tide uppercase tracking-wider">Working Hours</h3>
                    <p className="text-sm font-semibold text-night mt-1">{contactData.workingHours}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-night/5 p-8 shadow-sm">
              <h2 className="font-heading text-xl font-bold text-[#182b67] mb-6">Send an Inquiry</h2>

              {isSent ? (
                <div className="text-center py-12 px-6 bg-lagoon/5 rounded-2xl border border-lagoon/10">
                  <CheckCircle2 size={48} className="text-lagoon mx-auto mb-4 animate-bounce" />
                  <h3 className="font-heading text-lg font-bold text-night">Inquiry Submitted Successfully</h3>
                  <p className="text-sm text-tide mt-2 max-w-sm mx-auto">Thank you for reaching out! One of our educational advisors will review your inquiry and get back to you shortly.</p>
                  <button onClick={() => setIsSent(false)} className="mt-6 px-5 py-2.5 rounded-full bg-[#10233f] text-white font-bold text-xs hover:bg-night transition uppercase tracking-wider">Send another message</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-tide mb-2">Full Name</label>
                      <input type="text" required className="w-full px-4 py-3 rounded-xl border border-night/10 text-night placeholder-tide/50 text-sm focus:outline-none focus:border-lagoon transition" placeholder="John Doe" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-tide mb-2">Email Address</label>
                      <input type="email" required className="w-full px-4 py-3 rounded-xl border border-night/10 text-night placeholder-tide/50 text-sm focus:outline-none focus:border-lagoon transition" placeholder="johndoe@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-tide mb-2">Subject</label>
                    <input type="text" required className="w-full px-4 py-3 rounded-xl border border-night/10 text-night placeholder-tide/50 text-sm focus:outline-none focus:border-lagoon transition" placeholder="Admission query / intake schedule" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-tide mb-2">Your Message</label>
                    <textarea rows={5} required className="w-full px-4 py-3 rounded-xl border border-night/10 text-night placeholder-tide/50 text-sm focus:outline-none focus:border-lagoon transition" placeholder="Please specify which university or course you are interested in..." value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} />
                  </div>

                  <button type="submit" disabled={isSubmitting} className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#10233f] px-8 py-4 text-sm font-bold uppercase tracking-wider text-white hover:bg-night transition disabled:opacity-50">{isSubmitting ? "Sending..." : "Submit Inquiry"} <Send size={16} /></button>
                </form>
              )}
            </div>
          </div>

        </div>

        {layout === 'sidebar' && contactData.sidebar && (
          <aside
            className={`mt-8 space-y-6 lg:mt-0 ${sidebarLocked ? 'sidebar-locked' : ''}`}
            onMouseEnter={() => { if (contactData.sidebar.lockOnHover) setSidebarLocked(true); }}
            onMouseLeave={() => { if (contactData.sidebar.lockOnHover) setSidebarLocked(false); }}
            style={sidebarLocked ? { position: 'sticky', top: '120px' } : {}}
          >
            <div className="rounded-2xl border border-night/5 bg-white p-6 shadow-sm">
              <h3 className="font-heading text-xl font-bold text-night">{contactData.sidebar.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-tide/80">{contactData.sidebar.copy}</p>
              {contactData.sidebar.highlights && (
                <ul className="mt-4 space-y-2">
                  {contactData.sidebar.highlights.map((h, i) => (
                    <li key={i} className="text-sm text-tide/90">• {h}</li>
                  ))}
                </ul>
              )}
              {contactData.sidebar.ctaLabel && (
                <a href={contactData.sidebar.ctaHref || '#'} className="mt-4 inline-block text-sm font-bold text-lagoon hover:underline">{contactData.sidebar.ctaLabel}</a>
              )}
            </div>
            {sidebarLocked && (
              <div className="rounded-2xl border border-night/5 bg-lagoon/5 p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-lagoon">Sidebar Locked</p>
                <p className="mt-2 text-sm text-tide/80">Hovering locks the sidebar position for focused interaction.</p>
              </div>
            )}
          </aside>
        )}

      </div>
    </div>
  );
}
