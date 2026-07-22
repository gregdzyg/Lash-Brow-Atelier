import aboutImage from "../assets/head-images/about.jpg";
import eyeTop from "../assets/images/eyeTop.jpg";
import eyeBottom from "../assets/images/eyeBottom.jpg";
import { Link } from "react-router-dom";

const About = () => {
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
            src={aboutImage}
            alt="O mnie"
            className="relative max-h-[42rem] w-full rounded-[2rem] object-cover shadow-[0_30px_80px_rgba(0,0,0,0.35)]"
          />
        </div>

        {/* Tekst */}
        <div className="space-y-5 text-base leading-8 text-white/65 sm:text-lg">
          <p>
            Nazywam się <span className="font-semibold text-[var(--gold)]">Paulina Tarnowska</span>, z pasją tworzę
            piękne i naturalne stylizacje rzęs oraz brwi.
            Każda klientka jest dla mnie wyjątkowa, dlatego każdy zabieg wykonuję z
            pełnym zaangażowaniem, dbając o najmniejszy detal.
          </p>
          <p>
            Moim celem jest podkreślenie naturalnego piękna w sposób subtelny i elegancki,
            tak aby każda kobieta czuła się pewna siebie każdego dnia. Stale poszerzam swoje
            umiejętności, uczestnicząc w szkoleniach i śledząc najnowsze trendy w branży beauty.
          </p>
          <p>
            W moim atelier stawiam na indywidualne podejście i komfort każdej klientki.
            Wierzę, że wizyta u stylistki rzęs i brwi to nie tylko zabieg, ale także chwila
            relaksu i czasu dla siebie.
          </p>
        </div>
      </div>

      {/* Sekcja kwalifikacji */}
      <section className="relative my-16 overflow-hidden rounded-[2rem] bg-[var(--rose)] px-6 py-16 text-black sm:px-12 lg:my-24 lg:py-20">
        {/* Dekoracyjne zdjęcia */}
        <img
          src={eyeTop}
          alt="Dekoracyjne rzęsy góra"
          className="absolute right-0 top-0 h-36 w-36 rounded-bl-[2rem] object-cover opacity-20 sm:h-52 sm:w-52"
        />
        <img
          src={eyeBottom}
          alt="Dekoracyjne rzęsy dół"
          className="absolute bottom-0 left-0 h-36 w-36 rounded-tr-[2rem] object-cover opacity-20 sm:h-52 sm:w-52"
        />

        {/* Tekst sekcji */}
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <h2 className="mb-8 text-3xl font-semibold sm:text-4xl">Moje kwalifikacje</h2>
          <div className="divide-y divide-black/10 border-y border-black/10">
            <p className="py-4 text-base leading-7 sm:text-lg">
              Certyfikat Stylizacji Rzęs 1:1 – Podstawowe techniki przedłużania rzęs metodą klasyczną.
            </p>
            <p className="py-4 text-base leading-7 sm:text-lg">
              Szkolenie Laminacji Brwi – Modelowanie kształtu brwi i nadawanie im perfekcyjnego wyglądu.
            </p>
            <p className="py-4 text-base leading-7 sm:text-lg">
              Kurs Stylizacji Rzęs 2D–6D – Zaawansowane techniki objętościowe, dopasowane do urody klientki.
            </p>
            <p className="py-4 text-base leading-7 sm:text-lg">
              Szkolenie Liftingu i Botoksu Rzęs – Naturalne podkręcenie i nadanie zdrowego połysku.
            </p>
            <p className="py-4 text-base leading-7 sm:text-lg">
              Geometria brwi wraz z farbą/henna – Modelowanie brwi z wykorzystaniem farby/henny nadające im idealny kształt i kolor.
            </p>
            <p className="py-4 text-base leading-7 sm:text-lg">
              Szkolenie z efektów niestandardowych rzęs – Tworzenie whispy, mokrego efektu, e-liner'a, Kim Kardashian.
            </p>
          </div>
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
