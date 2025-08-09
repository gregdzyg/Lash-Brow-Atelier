

import { useState } from "react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    let newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Podaj swoje imię";
    if (!/^\d{9}$/.test(formData.phone)) { newErrors.phone = "Podaj poprawny numer telefonu (9 cyfr)";} 
    if (!formData.email.includes("@")) newErrors.email = "Podaj poprawny e-mail";
    if (!formData.message.trim()) newErrors.message = "Wpisz wiadomość";
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    console.log("Formularz wysłany:", formData);
    alert("Dziękujemy za wiadomość! Skontaktujemy się wkrótce.");
    // TODO: Integracja z backendem/email API
  };

  return (
    <section className="text-white w-4/5 mx-auto py-12 mt-4">
      {/* Nagłówek */}
      <h1 className="text-3xl md:text-5xl font-bold text-[var(--gold)] text-center mb-10">
        Kontakt
      </h1>

      {/* Sekcja górna: dane kontaktowe + mapa */}
      <div className="grid md:grid-cols-2 gap-10 mb-12">
        {/* Dane kontaktowe */}
        <div className="bg-[var(--background)] p-6 rounded-4xl border border-[var(--gold)]/70">
          <h2 className="text-2xl font-semibold text-[var(--gold)] mb-4">
            Dane kontaktowe
          </h2>
          <p className="text-white/80 mb-2">📍 ul. Sezamkowa 8, 20-200 Parczew</p>
          <p className="text-white/80 mb-2">📞 +48 000 000 000</p>
          <p className="text-white/80 mb-6">📧 kontakt@atelier.pl</p>
          <a
            href="https://booksy.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 border-2 border-[var(--gold)] text-[var(--gold)] rounded-full hover:bg-[var(--gold)] hover:text-black transition"
          >
            Umów się przez Booksy
          </a>
        </div>

        {/* Mapa */}
        <div className="rounded-4xl overflow-hidden border border-[var(--gold)]/70">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d19530.7841978406!2d19.
            9485!3d50.0619!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTAu
            MDYxOTAyLCAxOS45NDg1MDA!5e0!3m2!1spl!2spl!4v1691234567890"
            width="100%"
            height="100%"
            style={{ minHeight: "300px", border: 0 }}
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </div>
      </div>

      {/* Formularz */}
      <div className="bg-[var(--background)] p-6 rounded-4xl border border-[var(--gold)]/70">
        <h2 className="text-2xl font-semibold text-[var(--gold)] mb-4">
          Napisz do nas
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Imię"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full p-3 rounded-lg bg-white/10 border border-[var(--gold)] text-white"
            />
            {errors.name && (
              <p className="text-red-400 text-sm mt-1">{errors.name}</p>
            )}
          </div>
           <div>
            <input
              type="tel"
              placeholder="Telefon"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="w-full p-3 rounded-lg bg-white/10 border border-[var(--gold)] text-white"
            />
            {errors.phone && (
              <p className="text-red-400 text-sm mt-1">{errors.phone}</p>
            )}
          </div>
          <div>
            <input
              type="email"
              placeholder="E-mail"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full p-3 rounded-lg bg-white/10 border border-[var(--gold)] text-white"
            />
            {errors.email && (
              <p className="text-red-400 text-sm mt-1">{errors.email}</p>
            )}
          </div>
          <div>
            <textarea
              placeholder="Wiadomość"
              rows="4"
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              className="w-full p-3 rounded-lg bg-white/10 border border-[var(--gold)] text-white"
            ></textarea>
            {errors.message && (
              <p className="text-red-400 text-sm mt-1">{errors.message}</p>
            )}
          </div>
          <button
            type="submit"
            className="w-full px-6 py-3 bg-[var(--background)] text-[var(--gold)] border border-[var(--gold)]
            hover:bg-[var(--gold)] hover:text-black rounded-full "
          >
            Wyślij wiadomość
          </button>
        </form>
      </div>
    </section>
  );
};

export default Contact;