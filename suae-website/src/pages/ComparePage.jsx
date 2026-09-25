import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, X, ArrowUpRight, ShieldCheck } from "lucide-react";
import { OptimizedImage } from "../components/common/OptimizedImage";

export function ComparePage({ compared = [], onToggle, onClear }) {
  return (
    <div className="min-h-screen bg-pearl pt-28 pb-20">
      <div className="section-shell">
        
        {/* Back Link */}
        <Link
          to="/universities"
          className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-tide/70 transition hover:text-night mb-8 group"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
          Back to Directory
        </Link>

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-lagoon/10 px-3 py-1 text-xs font-semibold text-lagoon uppercase tracking-wider">
            Comparison
          </span>
          <h1 className="mt-4 font-heading text-4xl font-extrabold text-night sm:text-5xl">
            Compare Universities
          </h1>
          <p className="mt-4 text-base text-tide/75 leading-relaxed">
            Analyze admission guidelines, intake timelines, and financial aid structures side-by-side to make your decision.
          </p>
        </div>

        {compared.length > 0 ? (
          <div className="bg-white rounded-2xl border border-night/5 shadow-sm overflow-hidden">
            {/* Header row with cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 border-b border-night/5">
              <div className="p-6 bg-pearl/20 flex flex-col justify-between border-r border-night/5">
                <div>
                  <h3 className="font-heading text-lg font-bold text-night">Comparing</h3>
                  <p className="mt-1 text-xs text-tide/60">{compared.length} of 3 campuses selected</p>
                </div>
                {onClear && (
                  <button
                    onClick={onClear}
                    className="mt-6 self-start text-xs font-bold uppercase tracking-wider text-lagoon hover:text-[#123b72]"
                  >
                    Clear all selection
                  </button>
                )}
              </div>

              {/* Mapped columns */}
              {Array.from({ length: 3 }).map((_, idx) => {
                const uni = compared[idx];
                return (
                  <div
                    key={idx}
                    className={`p-6 relative flex flex-col justify-between border-r border-night/5 last:border-r-0 ${
                      !uni ? "bg-pearl/5 flex items-center justify-center min-h-[220px]" : "bg-white"
                    }`}
                  >
                    {uni ? (
                      <>
                        <button
                          type="button"
                          onClick={() => onToggle(uni)}
                          className="absolute top-4 right-4 h-7 w-7 rounded-full bg-pearl hover:bg-lagoon/10 text-tide hover:text-lagoon transition flex items-center justify-center"
                          aria-label={`Remove ${uni.name} from comparison`}
                        >
                          <X size={14} />
                        </button>
                        <div>
                          <div className="aspect-[16/9] w-full overflow-hidden rounded-xl bg-night/5 mb-4">
                            <OptimizedImage
                              src={uni.image}
                              alt={uni.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <h4 className="font-heading text-base font-bold text-night leading-snug line-clamp-2">
                            {uni.name}
                          </h4>
                          <span className="mt-2 inline-flex rounded bg-lagoon/10 px-2 py-0.5 text-[9px] font-bold text-lagoon uppercase tracking-wide border border-lagoon/10">
                            {uni.city}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-4">
                        <p className="text-xs text-tide/50 italic">Slot Empty</p>
                        <Link
                          to="/universities"
                          className="mt-2 inline-block text-xs font-bold text-lagoon hover:underline"
                        >
                          + Add campus
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Comparison Rows */}
            <div className="divide-y divide-night/5">
              {/* City Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 items-center">
                <div className="p-4 md:p-6 bg-pearl/20 md:border-r border-night/5 text-xs font-bold uppercase tracking-wider text-tide/60">
                  Location / Emirate
                </div>
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="p-4 md:p-6 md:border-r border-night/5 last:border-r-0 text-sm font-semibold text-night">
                    {compared[idx]?.city || "-"}
                  </div>
                ))}
              </div>

              {/* Type Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 items-center">
                <div className="p-4 md:p-6 bg-pearl/20 md:border-r border-night/5 text-xs font-bold uppercase tracking-wider text-tide/60">
                  Institution Type
                </div>
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="p-4 md:p-6 md:border-r border-night/5 last:border-r-0 text-sm font-semibold text-night">
                    {compared[idx]?.type || "-"}
                  </div>
                ))}
              </div>

              {/* Intake Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 items-center">
                <div className="p-4 md:p-6 bg-pearl/20 md:border-r border-night/5 text-xs font-bold uppercase tracking-wider text-tide/60">
                  Intake Period
                </div>
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="p-4 md:p-6 md:border-r border-night/5 last:border-r-0 text-sm font-semibold text-night">
                    {compared[idx]?.intake || "-"}
                  </div>
                ))}
              </div>

              {/* Scholarship Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 items-center">
                <div className="p-4 md:p-6 bg-pearl/20 md:border-r border-night/5 text-xs font-bold uppercase tracking-wider text-tide/60">
                  Financial Aid / Scholarship
                </div>
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="p-4 md:p-6 md:border-r border-night/5 last:border-r-0 text-sm font-semibold text-night">
                    {compared[idx]?.scholarship || "-"}
                  </div>
                ))}
              </div>

              {/* Programs Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 items-center">
                <div className="p-4 md:p-6 bg-pearl/20 md:border-r border-night/5 text-xs font-bold uppercase tracking-wider text-tide/60">
                  Major Programs Offered
                </div>
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="p-4 md:p-6 md:border-r border-night/5 last:border-r-0 text-sm text-tide">
                    {compared[idx]?.programs || "-"}
                  </div>
                ))}
              </div>

              {/* Note / Description Row */}
              <div className="grid grid-cols-1 md:grid-cols-4">
                <div className="p-4 md:p-6 bg-pearl/20 md:border-r border-night/5 text-xs font-bold uppercase tracking-wider text-tide/60">
                  Campus Overview
                </div>
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="p-4 md:p-6 md:border-r border-night/5 last:border-r-0 text-xs md:text-sm leading-relaxed text-tide">
                    {compared[idx]?.note || "-"}
                  </div>
                ))}
              </div>

              {/* Action Button Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 items-center">
                <div className="p-4 md:p-6 bg-pearl/20 md:border-r border-night/5 text-xs font-bold uppercase tracking-wider text-tide/60">
                  Explore Profile
                </div>
                {Array.from({ length: 3 }).map((_, idx) => {
                  const uni = compared[idx];
                  return (
                    <div key={idx} className="p-4 md:p-6 md:border-r border-night/5 last:border-r-0">
                      {uni ? (
                        <Link
                          to={`/university/${encodeURIComponent(uni.name)}`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-lagoon hover:text-night transition-colors"
                        >
                          View Full Details
                          <ArrowUpRight size={14} />
                        </Link>
                      ) : (
                        "-"
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-night/5 max-w-xl mx-auto shadow-sm">
            <ShieldCheck size={48} className="mx-auto text-tide/30 mb-4" />
            <h3 className="font-heading text-lg font-bold text-night">No Campuses Selected</h3>
            <p className="mt-2 text-sm text-tide/60 px-6 leading-relaxed">
              Add up to 3 universities to compare their fees structure, study cities, intake guidelines, and courses side-by-side.
            </p>
            <Link
              to="/universities"
              className="btn-yellow mt-6 px-6 py-3 text-xs rounded-lg"
            >
              Go to Universities Directory
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
