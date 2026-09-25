export function SectionHeading({ eyebrow, title, copy, align = "center", dark = false }) {
  const alignClass = align === "center" ? "items-center text-center mx-auto" : "items-start text-left";
  const titleColor = dark ? "text-white" : "text-night";
  const copyColor = dark ? "text-white/70" : "text-tide/80";
  const eyebrowStyle = dark
    ? "inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-sand"
    : "eyebrow";

  return (
    <div className={`flex max-w-3xl flex-col gap-5 ${alignClass}`}>
      {eyebrow ? <span className={eyebrowStyle}>{eyebrow}</span> : null}
      {title ? <h2 className={`section-title ${titleColor}`}>{title}</h2> : null}
      {copy ? <p className={`section-copy ${copyColor}`}>{copy}</p> : null}
    </div>
  );
}
