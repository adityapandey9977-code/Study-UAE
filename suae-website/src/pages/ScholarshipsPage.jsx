import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Award, FileText, Calendar, CheckCircle } from "lucide-react";
import { usePreviewData } from "../context/PreviewContext";

const fallbackScholarships = {
  title: "Scholarships & Financial Aid",
  tagline: "Explore available fee waivers, merit awards, and financial grants to fund your education in the UAE.",
  items: [
    {
      name: "Academic Merit Scholarship",
      provider: "University-specific",
      waiver: "10% - 50% Tuition Waiver",
      eligibility: "High School Grade 12 score of 85%+ or Bachelor GPA of 3.6+",
      deadline: "Varies by intake (usually 4 weeks before semester starts)"
    },
    {
      name: "Corporate & Partner Grants",
      provider: "Industry Partners",
      waiver: "15% - 30% Tuition Waiver",
      eligibility: "Students whose parents work with corporate partners of the university",
      deadline: "Prior to semester registration"
    },
    {
      name: "Sports & Creative Excellence Award",
      provider: "University-specific",
      waiver: "Up to 30% Tuition Waiver",
      eligibility: "National or state-level sports representation or outstanding portfolio in design/media",
      deadline: "July 15 (Fall intake)"
    },
    {
      name: "Early Bird Discount",
      provider: "All Universities",
      waiver: "5% - 10% Tuition Waiver",
      eligibility: "Completed admission application and paid initial deposit early",
      deadline: "June 15 (Fall intake)"
    },
    {
      name: "Sibling & Alumni Grant",
      provider: "University-specific",
      waiver: "10% - 15% Tuition Waiver",
      eligibility: "Having a sibling currently enrolled or a parent who is an alumnus",
      deadline: "Ongoing"
    }
  ]
};

export function ScholarshipsPage({ content }) {
  const scholarshipsData = usePreviewData("scholarships", content?.scholarships || fallbackScholarships);

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
            Funding Opportunities
          </span>
          <h1 className="mt-4 font-heading text-4xl font-extrabold text-night sm:text-5xl">
            {scholarshipsData.title}
          </h1>
          <p className="mt-4 text-base text-black leading-relaxed">
            {scholarshipsData.tagline}
          </p>
        </div>

        {/* Scholarships Table Card */}
        <div className="overflow-hidden rounded-2xl border border-night/5 bg-white shadow-sm">
          <div className="p-6 border-b border-night/5 bg-pearl/30">
            <h3 className="font-heading text-lg font-bold text-night flex items-center gap-2">
              <Award size={20} className="text-lagoon" />
              Available Scholarship Programs
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-night/5 bg-pearl/10 text-[10px] font-extrabold uppercase tracking-wider text-tide/60">
                  <th className="p-4 pl-6">Scholarship Name</th>
                  <th className="p-4">Waiver Percentage</th>
                  <th className="p-4">Eligibility Criteria</th>
                  <th className="p-4 pr-6">Deadline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-night/5 text-xs sm:text-sm text-black">
                {scholarshipsData.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-pearl/10 transition">
                    <td className="p-4 pl-6 font-semibold text-night">
                      {item.name}
                      <span className="block text-[10px] font-normal text-black/60 mt-0.5">Provided by {item.provider}</span>
                    </td>
                    <td className="p-4 font-bold text-lagoon">
                      {item.waiver}
                    </td>
                    <td className="p-4 max-w-xs sm:max-w-md leading-relaxed">
                      {item.eligibility}
                    </td>
                    <td className="p-4 pr-6 font-medium text-night/80">
                      {item.deadline}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* General Application Tips */}
        <div className="mt-12 rounded-2xl border border-night/5 bg-white p-6 sm:p-8 shadow-sm">
          <h3 className="font-heading text-lg font-bold text-night mb-6 flex items-center gap-2">
            <FileText size={20} className="text-lagoon" />
            How to Apply for Scholarships
          </h3>
          <ul className="grid gap-4 sm:grid-cols-2">
            <li className="flex items-start gap-3">
              <CheckCircle size={18} className="text-lagoon shrink-0 mt-0.5" />
              <span className="text-xs sm:text-sm text-black">
                Apply early to secure early-bird and merit quotas before funding caps are reached.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle size={18} className="text-lagoon shrink-0 mt-0.5" />
              <span className="text-xs sm:text-sm text-black">
                Submit certified transcripts and English proficiency certificates (IELTS/TOEFL) during application.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle size={18} className="text-lagoon shrink-0 mt-0.5" />
              <span className="text-xs sm:text-sm text-black">
                Prepare a strong personal statement or portfolio if applying for sports or creative waivers.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle size={18} className="text-lagoon shrink-0 mt-0.5" />
              <span className="text-xs sm:text-sm text-black">
                Maintain the required minimum GPA (typically 3.0+) to renew your scholarship every academic year.
              </span>
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
}
