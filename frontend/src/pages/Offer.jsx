import { Link } from "react-router-dom";
import PublicOfferCards from "../components/public/PublicOfferCards";

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

      <div className="mx-auto max-w-6xl">
        <PublicOfferCards />
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
