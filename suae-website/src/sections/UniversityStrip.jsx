import { usePreviewData } from "../context/PreviewContext";

export function UniversityStrip({ universityStrip: publishedUniversityStrip }) {
  const universityStrip = usePreviewData("universityStrip", publishedUniversityStrip);

  return (
    <section id="universitystrip" className="relative z-20 bg-white pb-8 pt-4 sm:pb-10 sm:pt-5 lg:pb-12 lg:pt-8">
      <div className="section-shell">
        <div className="border border-night/10 bg-white shadow-[0_18px_60px_rgba(7,18,23,0.12)] lg:grid lg:grid-cols-[260px_1fr] lg:items-stretch">
          <div className="flex items-center border-b border-night/10 px-5 py-5 lg:border-b-0 lg:border-r lg:px-8">
            <div>
              <p 
                className="text-xs font-extrabold uppercase tracking-[0.22em] text-lagoon"
                style={universityStrip.eyebrowColor ? { color: universityStrip.eyebrowColor } : {}}
              >
                {universityStrip.eyebrow}
              </p>
              <p 
                className="mt-2 max-w-[180px] text-sm leading-6 text-tide/70"
                style={universityStrip.copyColor ? { color: universityStrip.copyColor } : {}}
              >
                {universityStrip.copy}
              </p>
            </div>
          </div>
          <div className="grid gap-px bg-night/10 sm:grid-cols-2 xl:grid-cols-5">
            {universityStrip.items?.map((item) => (
              <div key={item} className="flex min-h-[88px] items-center bg-pearl px-5 py-5 text-sm font-bold leading-6 text-tide transition hover:bg-white">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
