import { Building2, ArrowUpRight } from "lucide-react";
import { OptimizedImage } from "../components/common/OptimizedImage";
import { usePreviewData } from "../context/PreviewContext";

export function FeaturedCampus({ featured: publishedFeatured, onOpenConsultation }) {
  const featured = usePreviewData("featured", publishedFeatured);

  return (
    <section id="featuredcampus" className="section-defer bg-white py-20 sm:py-24">
      <div className="section-shell">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="border-t-4 border-[#174a8b] pt-6 text-center lg:text-left">
            <p className="eyebrow text-black">{featured.eyebrow}</p>
            <h2
              className="mt-4 section-title"
              style={featured.titleColor ? { color: featured.titleColor } : {}}
            >
              {featured.title}
            </h2>
            <p
              className="mx-auto mt-6 section-copy lg:mx-0"
              style={featured.copyColor ? { color: featured.copyColor } : {}}
            >
              {featured.copy}
            </p>
            <button
              type="button"
              onClick={onOpenConsultation}
              className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#FACC15] px-6 py-3 text-sm font-extrabold uppercase tracking-[0.08em] text-night transition duration-300 hover:bg-[#EAB308] shadow-[0_4px_14px_rgba(250,204,21,0.30)]"
            >
              {featured.cta?.label}
              <ArrowUpRight size={18} />
            </button>
          </div>
          <OptimizedImage src={featured.image} alt="Featured UAE campus" className="h-80 w-full lg:h-[420px]" />
        </div>
        <ul className="mt-8 grid gap-px bg-[#d8e4ec] sm:grid-cols-2 lg:grid-cols-4">
          {featured.highlights?.map((item) => (
            <li key={item} className="grid grid-cols-[22px_1fr] gap-3 bg-white px-5 py-5 text-sm font-semibold leading-7 text-tide">
              <Building2 size={18} className="mt-1 shrink-0 text-[#174a8b]" />
              <span className="min-w-0">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
