import { SectionHeading } from "../common/SectionHeading";

export function WhyUAESection({ section }) {
  return (
    <section id="why-uae" className="relative overflow-hidden bg-night py-20 text-white sm:py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(191,231,214,0.12),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(234,216,184,0.18),transparent_28%)]" />
      <div className="section-shell relative">
        <SectionHeading eyebrow={section.eyebrow} title={section.title} copy={section.copy} dark />

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="grid gap-5 md:grid-cols-2">
            {section.reasons.map((reason) => (
              <article key={reason.title} className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
                <h3 className="font-heading text-2xl font-semibold text-white">{reason.title}</h3>
                <p className="mt-4 text-sm leading-7 text-white/68">{reason.copy}</p>
              </article>
            ))}
          </div>

          <aside className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-sand">City-led discovery</p>
            <div className="mt-6 space-y-4">
              {section.destinations.map((destination, index) => (
                <div key={destination.city} className="rounded-[1.5rem] border border-white/10 bg-night/25 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-heading text-2xl font-semibold">{destination.city}</p>
                      <p className="mt-2 text-sm leading-7 text-white/62">{destination.note}</p>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-[0.16em] text-mint">
                      0{index + 1}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
