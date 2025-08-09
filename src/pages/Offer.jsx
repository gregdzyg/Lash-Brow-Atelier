import { Link } from "react-router-dom";

const services = [
  {
    id: 1,
    name: "Przedłużanie rzęs 1:1",
    description: "Naturalny efekt, idealny do codziennego noszenia.",
    price: "150 zł"
  },
  {
    id: 2,
    name: "Przedłużanie rzęs 2D–3D",
    description: "Efekt wyraźniejszy, z zachowaniem subtelnej elegancji.",
    price: "180 zł"
  },
  {
    id: 3,
    name: "Laminacja brwi",
    description: "Podkreślenie kształtu brwi, bez konieczności makijażu.",
    price: "120 zł"
  },
  {
    id: 4,
    name: "Stylizacja rzęs – lifting",
    description: "Naturalne podkręcenie i odżywienie rzęs.",
    price: "130 zł"
  },
  {
    id: 5,
    name: "Pakiet ślubny",
    description: "Specjalny zestaw stylizacji dla Panny Młodej.",
    price: "300 zł"
  },
  {
    id: 6,
    name: "Demakijaż i pielęgnacja rzęs",
    description: "Profesjonalne oczyszczenie i regeneracja rzęs.",
    price: "50 zł"
  },
  {
    id: 7,
    name: "Henna pudrowa brwi",
    description: "Trwałe podkreślenie koloru i kształtu brwi.",
    price: "100 zł"
  },
  {
    id: 8,
    name: "Regulacja brwi woskiem",
    description: "Szybkie i precyzyjne nadanie kształtu brwiom.",
    price: "40 zł"
  },
  {
    id: 9,
    name: "Konsultacja stylizacji",
    description: "Indywidualne doradztwo w doborze stylizacji rzęs i brwi.",
    price: "0 zł"
  }
];

const Offer = () => {
  return (
    <section className="text-white w-4/5 mx-auto py-12">
      <h1 className="text-3xl md:text-5xl font-bold text-[var(--gold)] text-center mb-10">
        Oferta
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {services.map((service) => (
          <div
            key={service.id}
            className="bg-[var(--background)] border border-[var(--gold)] p-6 rounded-4xl"
          >
            <h3 className="text-xl flex justify-center text-center font-semibold text-[var(--gold)]/90 mb-2">
              {service.name}
            </h3>
            <p className="text-sm flex justify-center text-center text-white/70 mb-4">
              {service.description}
            </p>
            <p className="text-lg flex justify-center text-center font-bold text-[var(--gold)]">
              {service.price}
            </p>
          </div>
        ))}
      </div>
       <div className="text-center py-6 max-w-4xl mx-auto">
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

export default Offer;