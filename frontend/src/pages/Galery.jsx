import { Link } from "react-router-dom";

const images = import.meta.glob("../assets/images/gallery/*.{jpg,jpeg,png,JPG}", {
  eager: true,
});

const galleryImages = Object.entries(images)
  .sort(([firstPath], [secondPath]) => firstPath.localeCompare(secondPath))
  .map(([, module]) => module.default);

const Gallery = () => {
  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-14 text-white sm:px-8 sm:py-20 lg:px-12 lg:py-24">
      <div className="mb-12 flex items-center justify-center gap-3 sm:mb-16">
        <span className="h-px w-10 bg-[var(--gold)]/70" />
        <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Galeria
        </h1>
        <span className="h-px w-10 bg-[var(--gold)]/70" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 lg:gap-6">
        {galleryImages.map((src, index) => (
          <div
            key={index}
            className="
              group relative aspect-[4/5] overflow-hidden rounded-3xl
              border border-[var(--gold)]/20 bg-white/[0.03]
              shadow-[0_18px_45px_rgba(0,0,0,0.18)]
              sm:even:translate-y-6
            "
          >
            <img
              src={src}
              alt={`Stylizacja rzęs i brwi – realizacja ${index + 1}`}
              loading="lazy"
              decoding="async"
              className="
                h-full w-full object-cover transition duration-500 ease-out
                group-hover:scale-105 group-hover:brightness-110
              "
            />
            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/5" />
          </div>
        ))}
      </div>

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
