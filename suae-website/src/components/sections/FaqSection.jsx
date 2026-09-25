import { SectionHeading } from "../common/SectionHeading";

export function FaqSection({ section }) {
  return (
    <section id="faq" className="section-shell py-20 sm:py-24">
      <SectionHeading eyebrow={section.eyebrow} title={section.title} align="center" />

      <div className="mx-auto mt-12 grid max-w-4xl gap-4">
        {section.items.map((item) => (
          <article key={item.question} className="rounded-[1.75rem] bg-white p-6 shadow-soft">
            <h3 className="font-heading text-2xl font-semibold text-night">{item.question}</h3>
            <p className="mt-4 text-sm leading-7 text-tide/80">{item.answer}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
