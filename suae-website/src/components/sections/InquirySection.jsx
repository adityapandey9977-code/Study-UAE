import { SectionHeading } from "../common/SectionHeading";

export function InquirySection({ section }) {
  return (
    <section id="inquiry" className="pb-20 sm:pb-24">
      <div className="section-shell">
        <div className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-lagoon via-tide to-night text-white shadow-glow">
          <div className="grid gap-10 p-8 sm:p-10 lg:grid-cols-[0.95fr_1.05fr] lg:p-12">
            <div>
              <SectionHeading eyebrow={section.eyebrow} title={section.title} copy={section.copy} dark />

              <div className="mt-10 grid gap-3 sm:grid-cols-2">
                {section.fields.map((field) => (
                  <div key={field} className="rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/75">
                    {field}
                  </div>
                ))}
              </div>
            </div>

            <form className="rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur">
              <div className="grid gap-4">
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-white/80">Full name</span>
                  <input className="rounded-2xl border border-white/10 bg-white/90 px-4 py-3 text-night outline-none ring-0 placeholder:text-tide/35" placeholder="Enter student name" />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-white/80">Email address</span>
                  <input className="rounded-2xl border border-white/10 bg-white/90 px-4 py-3 text-night outline-none ring-0 placeholder:text-tide/35" placeholder="name@example.com" />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-white/80">Phone / WhatsApp</span>
                  <input className="rounded-2xl border border-white/10 bg-white/90 px-4 py-3 text-night outline-none ring-0 placeholder:text-tide/35" placeholder="+91 / +971" />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="text-sm font-semibold text-white/80">Study level</span>
                    <select className="rounded-2xl border border-white/10 bg-white/90 px-4 py-3 text-night outline-none">
                      <option>Undergraduate</option>
                      <option>Postgraduate</option>
                    </select>
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm font-semibold text-white/80">Preferred city</span>
                    <select className="rounded-2xl border border-white/10 bg-white/90 px-4 py-3 text-night outline-none">
                      <option>Dubai</option>
                      <option>Abu Dhabi</option>
                      <option>Sharjah</option>
                      <option>Ras Al Khaimah</option>
                    </select>
                  </label>
                </div>
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-white/80">Interested discipline</span>
                  <select className="rounded-2xl border border-white/10 bg-white/90 px-4 py-3 text-night outline-none">
                    <option>Business</option>
                    <option>Engineering</option>
                    <option>Computing</option>
                    <option>Design</option>
                    <option>Media</option>
                  </select>
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-white/80">Tell us what the student is aiming for</span>
                  <textarea
                    rows="4"
                    className="rounded-2xl border border-white/10 bg-white/90 px-4 py-3 text-night outline-none placeholder:text-tide/35"
                    placeholder="Scholarship goals, preferred universities, intake timeline, budget, or relocation plans..."
                  />
                </label>
                <button type="button" className="mt-2 inline-flex items-center justify-center rounded-full bg-gold px-6 py-3 text-sm font-bold text-night transition hover:-translate-y-0.5 hover:bg-[#c69a4c]">
                  Submit Inquiry
                </button>
                <p className="text-xs leading-6 text-white/55">
                  Static form for the first release. Later this block can be replaced with your generated widget script or CMS-driven form schema.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
