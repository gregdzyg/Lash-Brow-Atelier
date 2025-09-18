import emailjs from "@emailjs/browser";
import { Link } from "react-router-dom";
import { useState } from "react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
    privacyConsent: false,
    regConsent:  false,
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
          reply_to: formData.email,
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );

      console.log("Formularz wysłany:", formData);
      alert("Dziękujemy za wiadomość! Skontaktujemy się wkrótce. Sprawdź folder spam w skrzynace mailowej.");
      setFormData({name: "", phone: "", email: "", message: "", consent: false});
    } catch (err) {
     
      console.error("Błąd wysylki: ", err);
      alert("Ups! Nie udało sie wysłać wiadomości. Spróbuj ponownie.");
      
    }
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
          <p className="text-white/80 mb-2">📍 ul. Kościelna 26 - 1 piętro,
           21-200 Parczew</p>
          <p className="text-white/80 mb-2">📞 +48 534 345 432</p>
          <p className="text-white/80 mb-6">📧 kontakt@atelier.pl</p>
          
        </div>

        {/* Mapa */}
        <div className="rounded-4xl overflow-hidden border border-[var(--gold)]/70">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2461.2928733624517!2d22.90202597675496!3d51.63579887184077!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4721bc15ce7fdd8d%3A0x1a9d3eec4b4634c!2sKo%C5%9Bcielna%2026%2C%2021-200%20Parczew!5e0!3m2!1spl!2spl!4v1726500000000!5m2!1spl!2spl"
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
          <div>
            <label className="flex items-start gap-3 text-sm text-white/80">
             <input
               type="checkbox"
               name="privacyConsent"
                checked={formData.privacyConsent}
               onChange={(e) =>
                  setFormData({ ...formData, privacyConsent: e.target.checked })
                }
                required
                className="mt-1"
              />
              <span>
               Wyrażam zgodę na przetwarzanie moich danych osobowych w celu kontaktu. 
                Szczegóły znajdziesz w 
                <Link to="/polityka-prywatnosci" className="underline ml-1">
                  Polityce prywatności
                </Link>.
              </span>
            </label>
            {errors.privacyConsent && (
              <p className="text-red-400 text-sm mt-1">{errors.privacyConsent}</p>
            )}
          </div>
             <div>
            <label className="flex items-start gap-3 text-sm text-white/80">
             <input
               type="checkbox"
               name="regConsent"
                checked={formData.regConsent}
               onChange={(e) =>
                  setFormData({ ...formData, regConsent: e.target.checked })
                }
                required
                className="mt-1"
              />
              <span>
               Zapoznałam się oraz akceptuję
                <Link to="/regulamin" className="underline ml-1">
                  Regulamin
                </Link>.
              </span>
            </label>
            {errors.regConsent && (
              <p className="text-red-400 text-sm mt-1">{errors.regConsent}</p>
            )}
          </div>
          <button
            type="submit"
            className="w-full px-6 py-3 bg-[var(--background)] text-[var(--gold)] border border-[var(--gold)]
            hover:bg-[var(--gold)] hover:text-black rounded-full active:bg-[var(--gold)] active:text-black hover: cursor-pointer"
          >
            Wyślij wiadomość
          </button>
        </form>
      </div>
    </section>
  );
};

export default Contact;