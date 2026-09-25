import { SectionHeading } from "../common/SectionHeading";

export function ProgramSpotlightSection({ section }) {
  return (
    <section id="programs" className="section-shell py-20 sm:py-24">
      <SectionHeading eyebrow={section.eyebrow} title={section.title} copy={section.copy} />

      <div className="mt-12 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[2rem] bg-white p-6 shadow-soft">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-lagoon">Future filter logic</p>
          <div className="mt-6 space-y-4">
            {section.categories.map((item) => (
              <article key={item.level} className="rounded-[1.5rem] border border-night/8 bg-pearl px-5 py-5">
                <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-gold">{item.level}</p>
                <h3 className="mt-3 font-heading text-2xl font-semibold text-night">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-tide/80">{item.copy}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          {section.spotlightCards.map((card) => (
            <article
              key={card.title}
              className="relative overflow-hidden rounded-[2rem] bg-gradient-to-b from-lagoon to-tide p-6 text-white shadow-soft"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sand via-gold to-mint" />
              <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-sand">
                {card.badge}
              </span>
              <h3 className="mt-6 font-heading text-3xl font-semibold leading-tight">{card.title}</h3>
              <p className="mt-4 text-sm leading-7 text-white/72">{card.copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
