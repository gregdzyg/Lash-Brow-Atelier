import { Link } from "react-router-dom";
import services from "../data/services";


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
            className="bg-[var(--background)] border border-[var(--gold)] p-6 rounded-4xl flex flex-col justify-center text-center"
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
          hover:bg-[var(--gold)] hover:text-black active:bg-[var(--gold)] active:text-black"
        >
          Umów się na wizytę
        </Link>
       </div>
    </section>
  );
};

export default Offer;