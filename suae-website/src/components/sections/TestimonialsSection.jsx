import { SectionHeading } from "../common/SectionHeading";

export function TestimonialsSection({ section }) {
  return (
    <section className="bg-night py-20 text-white sm:py-24">
      <div className="section-shell">
        <SectionHeading eyebrow={section.eyebrow} title={section.title} copy={section.copy} dark />

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {section.testimonials.map((testimonial) => (
            <article key={testimonial.name} className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
              <p className="text-lg leading-8 text-white/80">"{testimonial.quote}"</p>
              <div className="mt-8 border-t border-white/10 pt-5">
                <p className="font-heading text-xl font-semibold">{testimonial.name}</p>
                <p className="mt-1 text-sm text-white/55">{testimonial.role}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
