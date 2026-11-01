import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPublicGalleryImages } from "../api/apiPublicContent";

const Gallery = () => {
  const [galleryImages, setGalleryImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchGalleryImages = async () => {
      try {
        const response = await getPublicGalleryImages();

        if (isMounted) {
          setGalleryImages(Array.isArray(response) ? response : []);
          setHasError(false);
        }
      } catch {
        if (isMounted) {
          setHasError(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchGalleryImages();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-14 text-white sm:px-8 sm:py-20 lg:px-12 lg:py-24">
      <div className="mb-12 flex items-center justify-center gap-3 sm:mb-16">
        <span className="h-px w-10 bg-[var(--gold)]/70" />
        <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Galeria
        </h1>
        <span className="h-px w-10 bg-[var(--gold)]/70" />
      </div>

      {isLoading && (
        <p className="text-center text-white/55" aria-live="polite">
          Ładowanie galerii…
        </p>
      )}

      {!isLoading && hasError && (
        <p className="text-center text-white/65" role="alert">
          Nie udało się pobrać galerii. Spróbuj ponownie później.
        </p>
      )}

      {!isLoading && !hasError && galleryImages.length === 0 && (
        <p className="text-center text-white/55">
          Galeria zostanie wkrótce uzupełniona.
        </p>
      )}

      {!isLoading && !hasError && galleryImages.length > 0 && (
        <div className="grid items-start grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 lg:gap-6">
          {galleryImages.map((image, index) => (
            <figure
              key={image.id}
              className="
                group overflow-hidden rounded-3xl
                border border-[var(--gold)]/20 bg-white/[0.03]
                shadow-[0_18px_45px_rgba(0,0,0,0.18)]
                sm:even:translate-y-6
              "
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <img
                  src={image.imageUrl}
                  alt={image.altText || image.title || `Stylizacja rzęs i brwi – realizacja ${index + 1}`}
                  loading="lazy"
                  decoding="async"
                  className="
                    h-full w-full object-cover transition duration-500 ease-out
                    group-hover:scale-105 group-hover:brightness-110
                  "
                />
                <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/5" />
              </div>
              {image.title && (
                <figcaption className="px-4 py-3 text-center text-xs font-medium tracking-wide text-white/65 sm:text-sm">
                  {image.title}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      )}

      <div className="mt-16 flex justify-center sm:mt-24">
        <Link
          to="/contact"
          className="
            inline-flex rounded-full border-2 border-[var(--gold)]
            bg-[var(--gold)] px-6 py-3 font-semibold text-black
            transition duration-300 hover:bg-transparent hover:text-[var(--gold)]
            focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-[var(--gold)] focus-visible:ring-offset-4
            focus-visible:ring-offset-[var(--background)]
            active:bg-[var(--gold)] active:text-black
          "
        >
          Umów się na wizytę
        </Link>
      </div>
    </section>
  );
};

export default Gallery;
