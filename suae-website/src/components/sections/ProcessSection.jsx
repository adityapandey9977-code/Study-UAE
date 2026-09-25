import { SectionHeading } from "../common/SectionHeading";

export function ProcessSection({ section }) {
  return (
    <section id="process" className="bg-white py-20 sm:py-24">
      <div className="section-shell">
        <SectionHeading eyebrow={section.eyebrow} title={section.title} copy={section.copy} />

        <div className="mt-12 grid gap-5 lg:grid-cols-4">
          {section.steps.map((step, index) => (
            <article key={step.title} className="rounded-[2rem] border border-night/8 bg-pearl p-6">
              <div className="flex items-center justify-between">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-night text-sm font-bold text-sand">
                  0{index + 1}
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-night/15 to-transparent" />
              </div>
              <h3 className="mt-6 font-heading text-2xl font-semibold text-night">{step.title}</h3>
              <p className="mt-4 text-sm leading-7 text-tide/80">{step.copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
