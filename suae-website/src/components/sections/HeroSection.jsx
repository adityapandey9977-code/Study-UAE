export function HeroSection({ hero, navigation }) {
  return (
    <header
      className="relative isolate min-h-[100svh] overflow-hidden bg-night bg-cover bg-center text-white"
      style={{ backgroundImage: `url(${hero.background})` }}
    >
      <div
        className="absolute inset-0 z-10"
        style={{
          background:
            "linear-gradient(90deg, rgba(7, 18, 23, 0.82) 0%, rgba(7, 18, 23, 0.58) 40%, rgba(7, 18, 23, 0.28) 100%), linear-gradient(180deg, rgba(7, 18, 23, 0.16), rgba(7, 18, 23, 0.62))"
        }}
      />

      <div className="section-shell relative z-20 flex min-h-[100svh] flex-col py-24 sm:py-28 lg:py-32">
        <nav className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/5 px-5 py-4 backdrop-blur xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gold text-sm font-extrabold text-night">
              SU
            </div>
            <div>
              <p className="font-heading text-lg font-semibold">Study in UAE Scholarship</p>
              <p className="text-sm text-white/60">Launch landing page concept</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-white/75">
            {navigation.map((item) => (
              <a key={item.href} href={item.href} className="rounded-full px-3 py-2 transition hover:bg-white/10 hover:text-white">
                {item.label}
              </a>
            ))}
            <a href={hero.primaryCta.href} className="cta-primary">
              {hero.primaryCta.label}
            </a>
          </div>
        </nav>

        <div className="flex flex-1 flex-col pt-8 sm:pt-12 lg:pt-16">
          <div className="max-w-4xl">
            <h1 className="font-heading text-5xl font-semibold leading-[1.02] text-white sm:text-6xl lg:text-8xl">
              {hero.title}
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-white/82 sm:text-xl">
              {hero.copy}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href={hero.primaryCta.href} className="cta-primary">
                {hero.primaryCta.label}
              </a>
              <a href={hero.secondaryCta.href} className="cta-secondary">
                {hero.secondaryCta.label}
              </a>
            </div>
          </div>

          <div className="mt-auto pb-8 sm:pb-10 lg:pb-12">
            <div className="grid w-full max-w-[1360px] border border-white/20 bg-white text-night shadow-2xl lg:grid-cols-[1fr_auto]">
              <div className="grid gap-px bg-night/10 sm:grid-cols-3">
                {hero.search.fields.map((field) => (
                  <label key={field.label} className="grid gap-2 bg-white px-5 py-5">
                    <span className="text-xs font-extrabold uppercase tracking-[0.16em] text-lagoon">{field.label}</span>
                    <span className="flex items-center justify-between gap-4 font-heading text-xl font-semibold">
                      {field.value}
                      <span className="shrink-0 text-gold">+</span>
                    </span>
                  </label>
                ))}
              </div>
              <button className="flex min-h-20 items-center justify-center gap-3 bg-gold px-7 text-sm font-extrabold uppercase tracking-[0.12em] text-night transition hover:bg-[#c99e51]">
                {hero.search.button}
              </button>
            </div>

            <div className="mt-5 grid w-full max-w-[860px] grid-cols-3 border border-white/15 bg-night/45 backdrop-blur">
              {hero.stats.map((stat) => (
                <div key={stat.label} className="border-r border-white/15 px-4 py-4 last:border-r-0">
                  <p className="font-heading text-2xl font-semibold text-sand sm:text-3xl">{stat.value}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.12em] text-white/60">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
