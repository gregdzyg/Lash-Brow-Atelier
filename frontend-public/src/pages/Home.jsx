import { Link } from "react-router-dom";
import galeria9 from "../assets/images/galeria9.JPG";
import eyeTop from "../assets/images/eyeTop.jpg";    // np. plik z prawego górnego rogu
import eyeBottom from "../assets/images/eyeBottom.jpg";
import services from "../data/services";
import ReviewsSection from "../components/ReviewsSection";

const Home = () => {
  return (
    <section className="text-white w-4/5 flex flex-col mx-auto pt-4">
      {/* Hero Image */}
      <div
        className="h-60 sm:h-80 bg-cover bg-center rounded-4xl"
        style={{ backgroundImage: `url(${galeria9})` }}
      />

      {/* Tekst + CTA pod zdjęciem */}
      <div className="text-center px-4 py-10 max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-bold text-[var(--gold)] mb-4">
          Zadbam o PIĘKNO Twojego spojrzenia w atmosferze LUKSUSU
        </h1>
        <Link
          to="/contact"
          className="inline-block mt-4 px-6 py-3 border-2 border-[var(--gold)] text-[var(--gold)] rounded-full 
          hover:bg-[var(--gold)] hover:text-black transition active:bg-[var(--gold)] active:text-black"
        >
          Umów się na wizytę
        </Link>
      </div>
      <div className="py-6 bg-[var(--background)]">
        <h2 className="text-center text-2xl md:text-3xl font-bold text-[var(--gold)] mb-10">
          Nasze usługi
        </h2>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4 text-center">
  {services.slice(0, 6).map((service) => (
    <div
      key={service.id}
      className="bg-[var(--background)] p-6 rounded-4xl border border-[var(--gold)]/70 flex flex-col justify-center text-center"
    >
      <h3 className="text-xl font-semibold text-[var(--gold)]/90 mb-2">
        {service.name}
      </h3>
      <p className="text-sm text-white/80">{service.description}</p>
    </div>
  ))}
</div>

<div className="text-center mt-6">
  <Link
    to="/offer"
    className="inline-block px-6 py-3 border-2 border-[var(--gold)] text-[var(--gold)] rounded-full 
    hover:bg-[var(--gold)] hover:text-black active:bg-[var(--gold)] active:text-black"
  >
    Zobacz pełną ofertę
  </Link>
</div>

      </div>
      <section className="relative bg-[var(--rose)] text-black py-16 px-6 md:px-12 rounded-4xl my-12 overflow-hidden">
      {/* Dekoracyjne zdjęcia */}
      <img
        src={eyeTop}
        alt="Dekoracyjne rzęsy góra"
        className="absolute top-0 right-0 w-28 md:w-40 opacity-30 rounded-bl-[2rem]"
      />
      <img
        src={eyeBottom}
        alt="Dekoracyjne rzęsy dół"
        className="absolute bottom-0 left-0 w-28 md:w-40 opacity-30 rounded-tr-[2rem]"
      />

      {/* Tekst sekcji */}
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Kilka słów o Atelier</h2>
        <p className="text-md md:text-lg mb-4">
          W Lash&Brow Atelier wierzymy, że piękno tkwi w detalach – w subtelnym spojrzeniu, delikatnym łuku brwi,
          naturalnym podkreśleniu kobiecego uroku.
        </p>
        <p className="text-md md:text-lg mb-6">
          Moją misją jest wydobycie Twojego wewnętrznego piękna w sposób, który daje pewność siebie – każdego dnia.
        </p>
        <Link
          to="/about"
          className="inline-block px-6 py-3 mt-4 border-2 border-black text-black rounded-full
           hover:bg-black hover:text-white transition :bg-black active:text-white"
        >
          Dowiedz się więcej
        </Link>
      </div>
      </section>
      <ReviewsSection />
      <div className="text-center px-4 py-10 max-w-4xl mx-auto">
       <Link
          to="/contact"
          className="inline-block mt-4 px-6 py-3 border-2 border-[var(--gold)] text-[var(--gold)] rounded-full 
          hover:bg-[var(--gold)] hover:text-black transition active:bg-[var(--gold)] active:text-black"
        >
          Umów się na wizytę
        </Link>
        </div>
    </section>
  );
};

export default Home;