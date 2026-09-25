import { SectionHeading } from "../common/SectionHeading";

export function ComparisonSection({ section }) {
  return (
    <section className="section-shell py-20 sm:py-24">
      <div className="rounded-[2rem] bg-gradient-to-br from-[#f3e7cc] via-white to-[#dff2ea] p-8 shadow-soft sm:p-10 lg:p-12">
        <SectionHeading eyebrow={section.eyebrow} title={section.title} copy={section.copy} />

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {section.columns.map((column) => (
            <article key={column.title} className="rounded-[2rem] bg-white/85 p-6 shadow-sm">
              <h3 className="font-heading text-2xl font-semibold text-night">{column.title}</h3>
              <ul className="mt-5 space-y-3">
                {column.points.map((point) => (
                  <li key={point} className="flex gap-3 text-sm leading-7 text-tide/80">
                    <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-lagoon" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
