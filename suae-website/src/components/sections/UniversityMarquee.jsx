export function UniversityMarquee({ section }) {
  return (
    <section className="border-y border-night/6 bg-white/70 py-5">
      <div className="section-shell">
        <div className="grid gap-3 md:grid-cols-[auto_1fr] md:items-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-lagoon/70">
            Inspired by top UAE university showcases
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {section.items.map((item) => (
              <div
                key={item}
                className="rounded-full border border-night/6 bg-pearl px-4 py-3 text-center text-sm font-semibold text-tide shadow-sm"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
