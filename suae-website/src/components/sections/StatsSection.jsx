import { SectionHeading } from "../common/SectionHeading";

export function StatsSection({ section }) {
  return (
    <section className="section-shell py-20 sm:py-24">
      <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <SectionHeading eyebrow={section.eyebrow} title={section.title} copy={section.copy} />
        <div className="grid gap-5 sm:grid-cols-3">
          {section.cards.map((card) => (
            <article key={card.title} className="rounded-[2rem] bg-white p-6 shadow-soft">
              <div className="inline-flex rounded-full bg-lagoon/8 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-lagoon">
                {card.value}
              </div>
              <h3 className="mt-5 font-heading text-2xl font-semibold text-night">{card.title}</h3>
              <p className="mt-4 text-sm leading-7 text-tide/80">{card.copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
