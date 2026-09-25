export function FooterSection({ footer, navigation }) {
  return (
    <footer className="bg-night text-white">
      <div className="section-shell py-14">
        <div className="grid gap-8 rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.26em] text-sand">Next-ready foundation</p>
            <h2 className="mt-4 font-heading text-3xl font-semibold leading-tight sm:text-4xl">
              {footer.callout}
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/68">{footer.summary}</p>
          </div>

          <div className="flex flex-col gap-4 lg:items-end">
            <a href={footer.cta.href} className="cta-primary">
              {footer.cta.label}
            </a>
            <div className="flex flex-wrap gap-3 text-sm text-white/60">
              {navigation.map((item) => (
                <a key={item.href} href={item.href} className="transition hover:text-white">
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>Study in UAE Scholarship landing page concept</p>
          <div className="flex flex-wrap gap-4">
            {footer.links.map((link) => (
              <a key={link.href} href={link.href} className="transition hover:text-white">
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
