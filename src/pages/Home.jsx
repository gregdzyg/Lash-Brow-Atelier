import { Link } from "react-router-dom";
import galeria9 from "../assets/images/galeria9.JPG";
import eyeTop from "../assets/images/eyeTop.jpg";    // np. plik z prawego górnego rogu
import eyeBottom from "../assets/images/eyeBottom.jpg";

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
          Poczuj piękno w każdym spojrzeniu
        </h1>
        <Link
          to="/contact"
          className="inline-block mt-4 px-6 py-3 border-2 border-[var(--gold)] text-[var(--gold)] rounded-full 
          hover:bg-[var(--gold)] hover:text-black transition"
        >
          Umów się na wizytę
        </Link>
      </div>
      <div className="py-6 bg-[var(--background)]">
        <h2 className="text-center text-2xl md:text-3xl font-bold text-[var(--gold)] mb-10">
          Nasze usługi
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4 text-center">
          {/* Usługa 1 */}
          <div className="bg-[var(--background)] p-6 rounded-4xl border border-[var(--gold)]/70 ">
            <h3 className="text-xl font-semibold text-[var(--gold)]/90 mb-2">Przedłużanie rzęs</h3>
            <p className="text-sm text-white/80">
              Różne metody (1:1, 2D, 3D i więcej), dopasowane do Twojej urody i preferencji.
            </p>
          </div>

          {/* Usługa 2 */}
          <div className="bg-[var(--background)] p-6 rounded-4xl border border-[var(--gold)]/70 ">
            <h3 className="text-xl font-semibold text-[var(--gold)]/90 mb-2">Laminacja brwi</h3>
            <p className="text-sm text-white/80">
              Zabieg modelujący kształt brwi i nadający im perfekcyjny wygląd bez makijażu.
            </p>
          </div>

          {/* Usługa 3 */}
          <div className="bg-[var(--background)] p-6 rounded-4xl border border-[var(--gold)]/70 ">
            <h3 className="text-xl font-semibold text-[var(--gold)]/90 mb-2">Stylizacja rzęs</h3>
            <p className="text-sm text-white/80">
              Profesjonalna stylizacja i lifting naturalnych rzęs, bez sztucznych dodatków.
            </p>
          </div>

          {/* Usługa 4 */}
          <div className="bg-[var(--background)] p-6 rounded-4xl border border-[var(--gold)]/70 ">
            <h3 className="text-xl font-semibold text-[var(--gold)]/90 mb-2">Regulacja i henna brwi</h3>
            <p className="text-sm text-white/80">
              Precyzyjne dopasowanie kształtu brwi oraz podkreślenie ich koloru, dla harmonii rysów twarzy.
            </p>
          </div>

          {/* Usługa 5 */}
          <div className="bg-[var(--background)] p-6 rounded-4xl border border-[var(--gold)]/70 ">
            <h3 className="text-xl font-semibold text-[var(--gold)]/90 mb-2">Pakiet ślubny</h3>
            <p className="text-sm text-white/80">
              Kompleksowa stylizacja rzęs i brwi w dniu ślubu, abyś wyglądała olśniewająco w każdej chwili.
            </p>
          </div>

          {/* Usługa 6 */}
          <div className="bg-[var(--background)] p-6 rounded-4xl border border-[var(--gold)]/70 ">
            <h3 className="text-xl font-semibold text-[var(--gold)]/90 mb-2">Zabieg odżywczy na rzęsy</h3>
            <p className="text-sm text-white/80">
              Intensywna kuracja wzmacniająca i regenerująca rzęsy, przywracająca im zdrowy blask.
            </p>
          </div>
          
        </div>
      </div>
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
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Kilka słów o nas</h2>
        <p className="text-md md:text-lg mb-4">
          W Lash&Brow Atelier wierzymy, że piękno tkwi w detalach – w subtelnym spojrzeniu, delikatnym łuku brwi,
          naturalnym podkreśleniu kobiecego uroku.
        </p>
        <p className="text-md md:text-lg mb-6">
          Naszą misją jest wydobycie Twojego wewnętrznego piękna w sposób, który daje pewność siebie – każdego dnia.
        </p>
        <Link
          to="/about"
          className="inline-block px-6 py-3 mt-4 border-2 border-black text-black rounded-full
           hover:bg-black hover:text-white transition"
        >
          Dowiedz się więcej
        </Link>
      </div>
      </section>
    </section>
  );
};

export default Home;