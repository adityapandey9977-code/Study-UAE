import { Send } from "lucide-react";
import { usePreviewData } from "../context/PreviewContext";

export function AdvisorForm({ advisors: publishedAdvisors }) {
  const advisors = usePreviewData("advisors", publishedAdvisors);

  return (
    <section id="advisors" className="section-defer bg-lagoon py-20 text-white sm:py-24">
      <div className="section-shell grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="text-center lg:text-left">
          <p className="eyebrow text-sand">{advisors.eyebrow}</p>
          <h2
            className="mt-4 section-title text-white"
            style={advisors.titleColor ? { color: advisors.titleColor } : {}}
          >
            {advisors.title}
          </h2>
          <p className="mx-auto mt-6 section-copy text-white/75 lg:mx-0">{advisors.copy}</p>

          <div className="mt-10 border border-white/20 p-6">
            <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-sand">{advisors.communicationTitle}</p>
            <div className="mt-5 grid grid-cols-2 gap-px bg-white/20">
              <button className="bg-white px-4 py-4 text-sm font-bold text-night">{advisors.communications?.[0]}</button>
              <button className="bg-[#FACC15] px-4 py-4 text-sm font-bold text-night hover:bg-[#EAB308] transition">{advisors.communications?.[1]}</button>
            </div>
          </div>
        </div>

        <form className="grid gap-px bg-white/20">
          {advisors.form?.fields?.map((field) => (
            <label key={field} className="grid gap-2 bg-white px-5 py-4 text-night">
              <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-lagoon">{field}</span>
              <input className="border-0 bg-transparent py-2 font-heading text-xl font-semibold outline-none placeholder:text-tide/35" placeholder={`Enter ${field.toLowerCase()}`} />
            </label>
          ))}
          <label className="grid gap-2 bg-white px-5 py-4 text-night">
            <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-lagoon">{advisors.form?.messageLabel}</span>
            <textarea rows="4" className="border-0 bg-transparent py-2 font-heading text-xl font-semibold outline-none placeholder:text-tide/35" placeholder={advisors.form?.messagePlaceholder} />
          </label>
          <button
            type="button"
            className="flex min-h-16 items-center justify-center gap-3 bg-[#0a1822] px-6 py-4 text-sm font-extrabold uppercase tracking-[0.12em] text-white transition hover:bg-black"
          >
            <Send size={18} />
            {advisors.form?.submitButton}
          </button>
        </form>
      </div>
    </section>
  );
}
