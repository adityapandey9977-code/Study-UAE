import { OptimizedImage } from "../components/common/OptimizedImage";
import { usePreviewData } from "../context/PreviewContext";
import { homepageContent } from "../content/homepage";

export function CityLifeSection({ cityLife: publishedCityLife }) {
  const defaultCityLife = publishedCityLife || homepageContent?.cityLife || {};
  const cityLife = usePreviewData("cityLife", defaultCityLife) || {};

  if (!cityLife.eyebrow) {
    return null;
  }

  return (
    <section id="city-life" className="section-defer bg-pearl py-20 sm:py-24">
      <div className="section-shell">
        <div className="mx-auto max-w-5xl text-center">
          <p className="eyebrow text-black">Hello {cityLife.eyebrow}</p>
          <div className="mt-4 grid gap-6">
            <h2
              className="section-title"
              style={cityLife.titleColor ? { color: cityLife.titleColor } : {}}
            >
              {cityLife.title}
            </h2>
            <p
              className="mx-auto section-copy text-black"
              style={cityLife.copyColor && cityLife.copyColor !== '#871717' ? { color: cityLife.copyColor } : { color: '#000000' }}
            >
              {cityLife.copy}
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <OptimizedImage src={cityLife.image} alt="Dubai student lifestyle" className="h-80 w-full lg:h-full" />
          <div className="grid gap-px bg-night/10 md:grid-cols-2">
            {cityLife.blocks?.map((block, index) => (
              <article key={block.title} className="bg-white p-6">
                <span className="font-heading text-4xl font-semibold text-[#174a8b]">0{index + 1}</span>
                <h3 className="mt-4 font-heading text-2xl font-semibold text-night">{block.title}</h3>
                <p className="mt-3 text-sm leading-7 text-black">{block.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
