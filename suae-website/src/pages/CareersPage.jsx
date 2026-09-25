import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Briefcase, GraduationCap, ShieldCheck, TrendingUp, Building } from "lucide-react";
import { usePreviewData } from "../context/PreviewContext";

const fallbackCareers = {
  title: "Student Careers & Internships",
  tagline: "Build global work experience alongside your degree in the region's leading economic hub.",
  permitInfo: "Under current MOHRE regulations, international students in the UAE can legally take part-time jobs both on and off campus. This requires a student work permit and a No Objection Certificate (NOC) from your university. Students can work up to 4 hours a day (or 20 hours a week) during semesters, and full-time during academic breaks.",
  sectors: [
    {
      title: "Technology & Software",
      desc: "Internship roles in AI, cloud computing, cybersecurity, and web development in Dubai Internet City and Silicon Oasis.",
      growth: "Very High"
    },
    {
      title: "Finance & Fintech",
      desc: "Positions in multinational banks, investment firms, and digital payment startups in DIFC (Dubai International Financial Centre).",
      growth: "High"
    },
    {
      title: "Marketing & Creative Media",
      desc: "Opportunities in digital marketing, PR agencies, film production, and graphic design based in Dubai Media City.",
      growth: "High"
    },
    {
      title: "Hospitality & Event Management",
      desc: "Real-world experience in global hotel chains, exhibition hubs, and event management groups across the Emirates.",
      growth: "Very High"
    }
  ]
};

export function CareersPage({ content }) {
  const careersData = usePreviewData("careers", content?.careers || fallbackCareers);

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
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-lagoon/10 px-3 py-1 text-xs font-semibold text-lagoon uppercase tracking-wider">
            Career Pathways
          </span>
          <h1 className="mt-4 font-heading text-4xl font-extrabold text-night sm:text-5xl">
            {careersData.title}
          </h1>
          <p className="mt-4 text-base text-black leading-relaxed">
            {careersData.tagline}
          </p>
        </div>

        {/* Work Permit Regulations Card */}
        <div className="rounded-2xl border border-night/5 bg-white p-6 sm:p-8 shadow-sm mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-lagoon/10 text-lagoon">
              <ShieldCheck size={22} />
            </div>
            <h3 className="font-heading text-xl font-bold text-night">
              Part-Time Work Regulations
            </h3>
          </div>
          <p className="text-sm sm:text-base leading-relaxed text-black">
            {careersData.permitInfo}
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3 text-center">
            <div className="rounded-xl bg-pearl/40 p-4 border border-night/5">
              <span className="block text-xl font-extrabold text-lagoon">20 Hours</span>
              <span className="mt-1 block text-[10px] font-bold uppercase tracking-wider text-tide/60">Weekly Limit</span>
            </div>
            <div className="rounded-xl bg-pearl/40 p-4 border border-night/5">
              <span className="block text-xl font-extrabold text-lagoon">MOHRE</span>
              <span className="mt-1 block text-[10px] font-bold uppercase tracking-wider text-tide/60">Approved Permits</span>
            </div>
            <div className="rounded-xl bg-pearl/40 p-4 border border-night/5">
              <span className="block text-xl font-extrabold text-lagoon">Full-Time</span>
              <span className="mt-1 block text-[10px] font-bold uppercase tracking-wider text-tide/60">During Holidays</span>
            </div>
          </div>
        </div>

        {/* Top Internship Sectors */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-lagoon/10 text-lagoon">
              <Building size={20} />
            </div>
            <h3 className="font-heading text-xl font-bold text-night">
              Top Internship Sectors in UAE
            </h3>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {careersData.sectors.map((sector, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-night/5 bg-white p-6 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-bold text-night">{sector.title}</span>
                    <span className="inline-flex items-center gap-1 rounded bg-lagoon/10 px-2 py-0.5 text-[10px] font-bold text-lagoon border border-lagoon/10">
                      <TrendingUp size={10} />
                      {sector.growth} Demand
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed text-black">
                    {sector.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
