import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import heroImage from "../assets/images/hero.jpg";
import ReviewsSection from "../components/public/ReviewsSection";
import PublicOfferCards from "../components/public/PublicOfferCards";
import { getPublicAboutContent } from "../api/apiPublicContent";
import {
  DEFAULT_HOME_INTRODUCTION,
  splitIntoParagraphs,
} from "../utils/aboutContent";

const Home = () => {
  const [homeIntroduction, setHomeIntroduction] = useState(
    DEFAULT_HOME_INTRODUCTION,
  );

  useEffect(() => {
    let isMounted = true;

    const fetchAboutContent = async () => {
      try {
        const content = await getPublicAboutContent();

        if (isMounted && content?.homeIntroduction) {
          setHomeIntroduction(content.homeIntroduction);
        }
      } catch {
        // The original text remains visible when the API is unavailable.
      }
    };

    fetchAboutContent();

    return () => {
      isMounted = false;
    };
  }, []);

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
          <PublicOfferCards limit={6} />
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

      <section className="relative my-4 overflow-hidden rounded-[2.5rem] border border-white/35 bg-[radial-gradient(circle_at_top_right,rgba(255,247,226,0.58),transparent_38%),linear-gradient(135deg,#f5e4db_0%,#e4b9b1_52%,#c98d89_100%)] px-6 py-10 text-[#241d1e] shadow-[0_28px_80px_rgba(0,0,0,0.22)] sm:px-10 sm:py-14 lg:px-16 lg:py-18">
        <div
          aria-hidden="true"
          className="absolute -right-20 -top-24 h-72 w-72 rounded-full border border-white/30"
        />
        <div
          aria-hidden="true"
          className="absolute -right-6 -top-10 h-44 w-44 rounded-full border border-[#241d1e]/10"
        />

        <div className="relative grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-end lg:gap-16">
          <div>
            <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-[#78652c]">
              <span className="h-px w-10 bg-[#78652c]/70" />
              Lash&amp;Brow Atelier
            </p>
            <h2 className="mt-6 max-w-lg text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              Kilka słów o Atelier
            </h2>
          </div>

          <div className="border-t border-[#241d1e]/20 pt-7 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
            {splitIntoParagraphs(homeIntroduction).map((paragraph, index) => (
              <p
                key={`${index}-${paragraph.slice(0, 32)}`}
                className={`${index > 0 ? "mt-4 " : ""}text-base leading-8 text-[#241d1e]/75 sm:text-lg`}
              >
                {paragraph}
              </p>
            ))}

            <Link
              to="/about"
              className="mt-8 inline-flex rounded-full border border-[#241d1e] bg-[#241d1e] px-6 py-3 font-medium text-white transition duration-300 hover:bg-transparent hover:text-[#241d1e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#241d1e] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--rose)]"
            >
              Dowiedz się więcej
            </Link>
          </div>
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
