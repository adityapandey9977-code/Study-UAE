import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Home, Compass, Search } from "lucide-react";

export function ThankYouPage() {
  return (
    <div className="min-h-screen bg-pearl pt-14 pb-20 flex items-center">
      <div className="section-shell max-w-4xl mx-auto w-full">
        <div className="relative overflow-hidden rounded-3xl bg-[#10233f] text-white p-8 md:p-16 shadow-2xl border border-white/10 text-center">
          {/* Ambient Glows */}
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#174a8b]/35 blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-[#7fb2e5]/15 blur-[80px] pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
            {/* Animated Success Ring */}
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-[#174a8b]/30 text-lagoon border border-white/20 shadow-lg mb-8 animate-pulse">
              <CheckCircle2 size={48} className="text-[#facc15] stroke-[2]" />
            </div>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#174a8b]/40 px-3 py-1 text-xs font-semibold text-[#7fb2e5] uppercase tracking-wider border border-[#174a8b]/60 mb-4">
              Submission Successful
            </span>
            
            <h1 className="font-heading text-4xl font-extrabold text-white sm:text-5xl leading-tight mb-4">
              Thank You!
            </h1>
            
            <p className="text-base text-white/80 leading-relaxed font-body mb-10">
              Your inquiry has been successfully received. One of our educational advisors will review your academic profile and get back to you shortly.
            </p>

            {/* Next Steps Guide */}
            <div className="w-full bg-[#0a172c]/50 rounded-2xl p-6 border border-white/5 mb-10 text-left">
              <h3 className="font-heading text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Compass size={20} className="text-[#facc15]" /> What Happens Next?
              </h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="relative pl-8">
                  <div className="absolute left-0 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-[#174a8b]/50 text-xs font-bold text-[#7fb2e5] border border-white/10">1</div>
                  <h4 className="text-sm font-bold text-white mb-1">Application Review</h4>
                  <p className="text-xs text-white/60">We review your academic details and eligibility guidelines.</p>
                </div>
                <div className="relative pl-8">
                  <div className="absolute left-0 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-[#174a8b]/50 text-xs font-bold text-[#7fb2e5] border border-white/10">2</div>
                  <h4 className="text-sm font-bold text-white mb-1">Custom Matching</h4>
                  <p className="text-xs text-white/60">We map your choices to verified UAE programs & scholarships.</p>
                </div>
                <div className="relative pl-8">
                  <div className="absolute left-0 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-[#174a8b]/50 text-xs font-bold text-[#7fb2e5] border border-white/10">3</div>
                  <h4 className="text-sm font-bold text-white mb-1">Advisor Contact</h4>
                  <p className="text-xs text-white/60">You will receive a call or email from an advisor shortly.</p>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#facc15] px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-night transition hover:bg-[#eab308] shadow-[0_3px_14px_rgba(250,204,21,0.3)]"
              >
                <Home size={16} /> Return Home
              </Link>
              <Link
                to="/universities"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 border border-white/20 px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-white/25"
              >
                <Search size={16} /> Explore Universities <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
