import { Link } from "react-router-dom";
import services from "../data/services";

const Offer = () => {
  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-14 text-white sm:px-8 sm:py-20 lg:px-12 lg:py-24">
      <div className="mb-12 flex items-center justify-center gap-3 sm:mb-16">
        <span className="h-px w-10 bg-[var(--gold)]/70" />
        <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Oferta
        </h1>
        <span className="h-px w-10 bg-[var(--gold)]/70" />
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {services.map((service) => (
          <article
            key={service.id}
            className="
              group flex min-h-72 flex-col rounded-3xl
              border border-[var(--gold)]/25
              bg-gradient-to-br from-white/[0.075] to-white/[0.02]
              p-7 backdrop-blur-xl transition duration-300
              hover:-translate-y-1 hover:border-[var(--gold)]/50
              hover:bg-white/[0.08] hover:shadow-xl hover:shadow-black/20
            "
          >
            <h2 className="text-xl font-semibold leading-snug text-[var(--gold)] transition-colors group-hover:text-[#c8ad55]">
              {service.name}
            </h2>
            <p className="mt-4 flex-1 text-sm leading-6 text-white/60">
              {service.description}
            </p>
            <div className="mt-6 border-t border-[var(--gold)]/15 pt-5">
              <p className="text-lg font-semibold text-white">
                {service.price}
              </p>
            </div>
          </article>
        ))}
      </div>

      <div className="pt-12 text-center sm:pt-16">
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

export default Offer;
