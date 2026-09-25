import { useState } from "react";

export function OptimizedImage({
  src,
  alt,
  className = "",
  imgClassName = "",
  priority = false,
  skeletonClassName = "",
  onLoad,
  fallbackSrc = "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=900&q=80"
}) {
  const [loaded, setLoaded] = useState(false);

  const hasCustomPositionClass =
    /\b(absolute|relative|fixed|sticky)\b/.test(
      className
    );

  return (
    <div
      className={`${
        hasCustomPositionClass ? "" : "relative"
      } overflow-hidden bg-night/5 ${className}`}
    >
      {!loaded ? (
        <div
          aria-hidden="true"
          className={`absolute inset-0 animate-pulse bg-gradient-to-br from-[#e8dfd1] via-[#f7f4ee] to-[#dde6e9] ${skeletonClassName}`}
        />
      ) : null}

      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchpriority={
          priority ? "high" : "auto"
        }
        onLoad={(event) => {
          setLoaded(true);
          onLoad?.(event);
        }}
        onError={(event) => {
          setLoaded(true);

          if (
            fallbackSrc &&
            event.currentTarget.src !==
              fallbackSrc
          ) {
            event.currentTarget.src =
              fallbackSrc;
          }
        }}
        className={`relative z-10 h-full w-full object-cover transition duration-500 ${
          loaded
            ? "opacity-100"
            : "opacity-0"
        } ${imgClassName}`}
      />
    </div>
  );
}