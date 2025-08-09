import aboutImage from "../assets/images/about-placeholder.png"; // Wstaw swoją ścieżkę do wygenerowanego zdjęcia
import eyeTop from "../assets/images/eyeTop.jpg";    // np. plik z prawego górnego rogu
import eyeBottom from "../assets/images/eyeBottom.jpg";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <section className="text-white w-4/5 mx-auto py-12">
      {/* Nagłówek */}
      <h1 className="text-3xl md:text-5xl font-bold text-[var(--gold)] text-center mb-10">
        O mnie
      </h1>

      {/* Sekcja zdjęcia i opisu */}
      <div className="grid md:grid-cols-2 gap-10 items-center">
        {/* Zdjęcie */}
        <div>
          <img
            src={aboutImage}
            alt="O mnie"
            className="rounded-4xl w-full object-cover shadow-lg"
          />
        </div>

        {/* Tekst */}
        <div className="text-gray-300 leading-relaxed space-y-4">
          <p>
            Nazywam się <span className="text-[var(--gold)] font-semibold">Paulina Tarnowska</span> i od kilku lat z pasją tworzę 
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
     <section className="relative bg-[var(--rose)] text-black py-16 px-6 md:px-12 rounded-4xl my-12 overflow-hidden">
      {/* Dekoracyjne zdjęcia */}
      <img
        src={eyeTop}
        alt="Dekoracyjne rzęsy góra"
        className="absolute top-0 right-0 w-32 md:w-40 opacity-30 rounded-bl-[2rem]"
      />
      <img
        src={eyeBottom}
        alt="Dekoracyjne rzęsy dół"
        className="absolute bottom-0 left-0 w-32 md:w-40 opacity-30 rounded-tr-[2rem]"
      />

      {/* Tekst sekcji */}
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Moje kwalifikacje</h2>
        <p className="text-md md:text-lg mb-4">
         Certyfikat Stylizacji Rzęs 1:1 – Podstawowe techniki przedłużania rzęs metodą klasyczną.
        </p>
        <p className="text-md md:text-lg mb-4">
        Szkolenie Laminacji Brwi – Modelowanie kształtu brwi i nadawanie im perfekcyjnego wyglądu.
        </p>
        <p className="text-md md:text-lg mb-4">
         Kurs Stylizacji Rzęs 2D–6D – Zaawansowane techniki objętościowe, dopasowane do urody klientki.
        </p>
        <p className="text-md md:text-lg mb-4">
        Szkolenie Liftingu i Botoksu Rzęs – Naturalne podkręcenie i odżywienie rzęs.
        </p>
        <p className="text-md md:text-lg mb-4">
        Kurs Makijażu Okolicznościowego – Stylizacje na śluby, sesje zdjęciowe i inne wyjątkowe okazje.
        </p>
        <p className="text-md md:text-lg mb-4">
        Warsztaty z Higieny i Bezpieczeństwa w Kosmetologii – Zasady sterylności i bezpieczeństwa pracy z klientem.
        </p>
      </div>
      </section>
      <div className="text-center px-4 mb-8 max-w-4xl mx-auto">
      <Link
          to="/contact"
          className="inline-block mt-4 px-6 py-3 border-2 border-[var(--gold)] text-[var(--gold)] rounded-full 
          hover:bg-[var(--gold)] hover:text-black transition"
        >
          Umów się na wizytę
        </Link>
       </div>
    </section>
  );
};

export default About;