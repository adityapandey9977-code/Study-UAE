import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, CheckCircle2, Calendar, FileText, Compass } from "lucide-react";
import { usePreviewData } from "../context/PreviewContext";
import { getPageSettingsForPath } from "../utils/pageSeo";

export function AboutPage({ content }) {
  const location = useLocation();
  const aboutData = usePreviewData("about", content?.about);
  const pageSettings = usePreviewData("pageSettings", content?.pageSettings);
  const activePageSettings = getPageSettingsForPath(location.pathname, pageSettings);
  const layout = activePageSettings?.layout || "full-width";
  const sidebarPosition = activePageSettings?.sidebarPosition || "right";

  if (!aboutData) return null;

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
        <div className="relative overflow-hidden rounded-3xl bg-[#10233f] text-white p-8 md:p-16 mb-16 shadow-xl border border-white/10">
          {/* Ambient Glows */}
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#174a8b]/20 blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-[#7fb2e5]/10 blur-[80px] pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#174a8b]/40 px-3 py-1 text-xs font-semibold text-[#7fb2e5] uppercase tracking-wider border border-[#174a8b]/60">
              Overview
            </span>
            <h1 className="mt-4 font-heading text-4xl font-extrabold text-white sm:text-5xl leading-tight">
              {aboutData.heroTitle}
            </h1>
            <p className="mt-6 text-base md:text-lg text-white/80 leading-relaxed font-body">
              {aboutData.heroSubtitle}
            </p>
          </div>

          {aboutData.heroImage && (
            <div className="absolute right-0 bottom-0 top-0 w-1/3 hidden lg:block opacity-80">
              <img
                src={aboutData.heroImage}
                alt="About UAE"
                className="w-full h-full object-cover rounded-l-3xl border-l border-white/10"
              />
            </div>
          )}
        </div>

        {/* Intro Grid */}
        <div className={`grid gap-12 mb-16 items-start ${layout === "sidebar" ? "lg:grid-cols-[1.4fr_0.6fr]" : "lg:grid-cols-3"}`}>
          <div className={`${sidebarPosition === "left" ? "lg:order-2" : "lg:col-span-2"}`}>
            <h2 className="font-heading text-3xl font-extrabold text-night leading-tight mb-6">
              {aboutData.introTitle}
            </h2>
            <p className="text-base text-tide leading-relaxed font-body whitespace-pre-line">
              {aboutData.introText}
            </p>
          </div>

          {/* Highlights Sidebar */}
          <div className={`bg-white rounded-2xl border border-night/5 p-8 shadow-sm space-y-6 ${sidebarPosition === "left" ? "lg:order-1" : ""}`}>
            <h3 className="font-heading text-lg font-bold text-night flex items-center gap-2 pb-4 border-b border-night/5">
              <Compass size={18} className="text-lagoon" />
              Key Pillars
            </h3>
            <div className="space-y-5">
              {aboutData.highlights?.map((highlight, idx) => (
                <div key={idx} className="flex gap-3">
                  <CheckCircle2 size={18} className="text-lagoon shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-night">{highlight.title}</h4>
                    <p className="text-xs text-tide/80 mt-1 leading-relaxed">{highlight.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Intake & Visa Cards */}
        <div className="grid gap-8 md:grid-cols-2">
          {aboutData.sections?.map((section, idx) => (
            <article
              key={idx}
              className="rounded-2xl border border-night/5 bg-white p-8 shadow-sm hover:shadow-md transition"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-lagoon/5 text-lagoon mb-6">
                {idx === 0 ? <Calendar size={22} /> : <FileText size={22} />}
              </div>
              <h3 className="font-heading text-xl font-bold text-night mb-4">
                {section.title}
              </h3>
              <p className="text-sm leading-relaxed text-tide/85 font-body">
                {section.content}
              </p>
            </article>
          ))}
        </div>

      </div>
    </div>
  );
}
