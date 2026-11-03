import aboutImage from "../assets/head-images/about.jpg";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  getPublicAboutContent,
  getPublicAboutPortrait,
} from "../api/apiPublicContent";
import {
  DEFAULT_ABOUT_BIOGRAPHY,
  splitIntoParagraphs,
} from "../utils/aboutContent";

const qualifications = [
  {
    title: "Certyfikat Stylizacji Rzęs 1:1",
    description: "Podstawowe techniki przedłużania rzęs metodą klasyczną.",
  },
  {
    title: "Szkolenie Laminacji Brwi",
    description: "Modelowanie kształtu brwi i nadawanie im perfekcyjnego wyglądu.",
  },
  {
    title: "Kurs Stylizacji Rzęs 2D–6D",
    description: "Zaawansowane techniki objętościowe dopasowane do urody klientki.",
  },
  {
    title: "Szkolenie Liftingu i Botoksu Rzęs",
    description: "Naturalne podkręcenie i nadanie zdrowego połysku.",
  },
  {
    title: "Geometria brwi wraz z farbą lub henną",
    description: "Modelowanie brwi nadające im idealny kształt i kolor.",
  },
  {
    title: "Szkolenie z efektów niestandardowych rzęs",
    description: "Tworzenie efektów whispy, wet look, e-liner oraz Kim Kardashian.",
  },
];

const About = () => {
  const [portraitUrl, setPortraitUrl] = useState(aboutImage);
  const [aboutBiography, setAboutBiography] = useState(
    DEFAULT_ABOUT_BIOGRAPHY,
  );

  useEffect(() => {
    let isMounted = true;

    const fetchAboutPortrait = async () => {
      try {
        const portrait = await getPublicAboutPortrait();

        if (isMounted && portrait?.imageUrl) {
          setPortraitUrl(portrait.imageUrl);
        }
      } catch {
        // The bundled portrait remains a safe fallback when the API is unavailable.
      }
    };

    fetchAboutPortrait();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchAboutContent = async () => {
      try {
        const content = await getPublicAboutContent();

        if (isMounted && content?.aboutBiography) {
          setAboutBiography(content.aboutBiography);
        }
      } catch {
        // The original biography remains visible when the API is unavailable.
      }
    };

    fetchAboutContent();

    return () => {
      isMounted = false;
    };
  }, []);

  const renderBiography = (paragraph) => {
    const highlightedName = "Paulina Tarnowska";
    const [beforeName, afterName] = paragraph.split(highlightedName);

    if (afterName === undefined) {
      return paragraph;
    }

    return (
      <>
        {beforeName}
        <span className="font-semibold text-[var(--gold)]">
          {highlightedName}
        </span>
        {afterName}
      </>
    );
  };

  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-14 text-white sm:px-8 sm:py-20 lg:px-12 lg:py-24">
      {/* Nagłówek */}
      <div className="mb-12 sm:mb-16">
        <div className="mb-4 flex items-center justify-center gap-3">
          <span className="h-px w-10 bg-[var(--gold)]/70" />
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
            O mnie
          </h1>
          <span className="h-px w-10 bg-[var(--gold)]/70" />
        </div>
      </div>

      {/* Sekcja zdjęcia i opisu */}
      <div className="grid items-center gap-10 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
        {/* Zdjęcie */}
        <div className="relative">
          <div className="absolute -inset-3 rounded-[2.25rem] border border-[var(--gold)]/20" />
          <img
            src={portraitUrl}
            alt="O mnie"
            className="relative max-h-[42rem] w-full rounded-[2rem] object-cover shadow-[0_30px_80px_rgba(0,0,0,0.35)]"
          />
        </div>

        {/* Tekst */}
        <div className="space-y-5 text-base leading-8 text-white/65 sm:text-lg">
          {splitIntoParagraphs(aboutBiography).map((paragraph, index) => (
            <p key={`${index}-${paragraph.slice(0, 32)}`}>
              {renderBiography(paragraph)}
            </p>
          ))}
        </div>
      </div>

      {/* Sekcja kwalifikacji */}
      <section className="relative my-16 overflow-hidden rounded-[2.5rem] border border-white/35 bg-[radial-gradient(circle_at_top_right,rgba(255,247,226,0.58),transparent_38%),linear-gradient(135deg,#f5e4db_0%,#e4b9b1_52%,#c98d89_100%)] px-6 py-10 text-[#241d1e] shadow-[0_28px_80px_rgba(0,0,0,0.22)] sm:px-10 sm:py-14 lg:my-24 lg:px-16 lg:py-18">
        <div
          aria-hidden="true"
          className="absolute -left-24 -top-28 h-80 w-80 rounded-full border border-white/30"
        />
        <div
          aria-hidden="true"
          className="absolute -left-8 -top-12 h-48 w-48 rounded-full border border-[#241d1e]/10"
        />

        <div className="relative grid gap-10 lg:grid-cols-[minmax(16rem,0.7fr)_minmax(0,1.3fr)] lg:gap-16">
          <div className="lg:pt-2">
            <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-[#78652c]">
              <span className="h-px w-10 bg-[#78652c]/70" />
              Rozwój i doświadczenie
            </p>
            <h2 className="mt-6 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Moje kwalifikacje
            </h2>
            <p className="mt-6 max-w-md text-base leading-8 text-[#241d1e]/70">
              Regularnie rozwijam warsztat, aby każda stylizacja łączyła bezpieczną technikę, trwałość i naturalny efekt.
            </p>
            <p className="mt-8 text-6xl font-semibold tracking-tight text-[#241d1e]/10 sm:text-7xl">
              {String(qualifications.length).padStart(2, '0')}
            </p>
          </div>

          <ol className="border-y border-[#241d1e]/20">
            {qualifications.map((qualification, index) => (
              <li
                key={qualification.title}
                className="group grid gap-3 border-b border-[#241d1e]/15 py-6 last:border-b-0 sm:grid-cols-[3rem_minmax(0,1fr)] sm:gap-5"
              >
                <span className="text-sm font-semibold tracking-[0.16em] text-[#78652c]">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="text-lg font-semibold leading-7 transition-transform duration-300 group-hover:translate-x-1 sm:text-xl">
                    {qualification.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-6 text-[#241d1e]/65 sm:text-base">
                    {qualification.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <div className="text-center">
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

export default About;
