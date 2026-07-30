import { Link } from "react-router-dom";
import heroImage from "../assets/images/hero.jpg";
import eyeTop from "../assets/images/eyeTop.jpg";
import eyeBottom from "../assets/images/eyeBottom.jpg";
import ReviewsSection from "../components/public/ReviewsSection";
import PublicOfferCards from "../components/public/PublicOfferCards";

const Home = () => {
  return (
    <section className="mx-auto w-full max-w-7xl px-5 pb-8 pt-6 text-white sm:px-8 sm:pt-10 lg:px-12">
      {/* Hero Image */}
      <div className="relative min-h-[34rem] overflow-hidden rounded-[2rem] sm:min-h-[38rem] lg:min-h-[42rem]">
        <img
          src={heroImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-transparent to-transparent" />

        {/* Tekst + CTA pod zdjęciem */}
        <div className="relative z-10 flex min-h-[34rem] items-end p-6 sm:min-h-[38rem] sm:p-10 lg:min-h-[42rem] lg:p-14">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Zadbam o <span className="text-[var(--gold)]">PIĘKNO</span> Twojego
              spojrzenia w atmosferze <span className="text-[var(--rose)]">LUKSUSU</span>
            </h1>
            <Link
              to="/contact"
              className="
                mt-8 inline-flex rounded-full border-2 border-[var(--gold)]
                bg-[var(--gold)] px-6 py-3 font-semibold text-black
                transition duration-300 hover:bg-transparent hover:text-[var(--gold)]
                focus-visible:outline-none focus-visible:ring-2
                focus-visible:ring-[var(--gold)] focus-visible:ring-offset-4
                focus-visible:ring-offset-black
                active:bg-[var(--gold)] active:text-black
              "
            >
              Umów się na wizytę
            </Link>
          </div>
        </div>
      </div>

      <div className="py-16 sm:py-20 lg:py-24">
        <h2 className="text-center text-3xl font-semibold text-[var(--gold)] sm:text-4xl">
          Nasze usługi
        </h2>

        <div className="mx-auto mt-10 max-w-6xl">
          <PublicOfferCards limit={6} compact />
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/offer"
            className="
              inline-flex rounded-full border border-[var(--gold)]/70 px-6 py-3
              font-medium text-[var(--gold)] transition duration-300
              hover:border-[var(--gold)] hover:bg-[var(--gold)] hover:text-black
              focus-visible:outline-none focus-visible:ring-2
              focus-visible:ring-[var(--gold)] focus-visible:ring-offset-4
              focus-visible:ring-offset-[var(--background)]
            "
          >
            Zobacz pełną ofertę
          </Link>
        </div>
      </div>

      <section className="relative my-4 overflow-hidden rounded-[2rem] bg-[var(--rose)] px-6 py-16 text-black sm:px-12 lg:py-24">
        {/* Dekoracyjne zdjęcia */}
        <img
          src={eyeTop}
          alt="Dekoracyjne rzęsy góra"
          className="absolute right-0 top-0 h-36 w-36 rounded-bl-[2rem] object-cover opacity-25 sm:h-52 sm:w-52"
        />
        <img
          src={eyeBottom}
          alt="Dekoracyjne rzęsy dół"
          className="absolute bottom-0 left-0 h-36 w-36 rounded-tr-[2rem] object-cover opacity-25 sm:h-52 sm:w-52"
        />

        {/* Tekst sekcji */}
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-semibold sm:text-4xl">Kilka słów o Atelier</h2>
          <p className="mt-7 text-base leading-7 sm:text-lg">
            W Lash&Brow Atelier wierzymy, że piękno tkwi w detalach – w subtelnym spojrzeniu, delikatnym łuku brwi,
            naturalnym podkreśleniu kobiecego uroku.
          </p>
          <p className="mt-4 text-base leading-7 sm:text-lg">
            Moją misją jest wydobycie Twojego wewnętrznego piękna w sposób, który daje pewność siebie – każdego dnia.
          </p>
          <Link
            to="/about"
            className="
              mt-8 inline-flex rounded-full border-2 border-black px-6 py-3
              font-medium text-black transition duration-300
              hover:bg-black hover:text-white
              focus-visible:outline-none focus-visible:ring-2
              focus-visible:ring-black focus-visible:ring-offset-4
              focus-visible:ring-offset-[var(--rose)]
              active:bg-black active:text-white
            "
          >
            Dowiedz się więcej
          </Link>
        </div>
      </section>

      <ReviewsSection />

      <div className="pb-10 text-center sm:pb-14">
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

export default Home;
