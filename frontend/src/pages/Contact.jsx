import emailjs from "@emailjs/browser";
import { Link } from "react-router-dom";
import { useState } from "react";
import BooksySection from "../components/public/BooksySection";

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
      setFormData({name: "", phone: "", email: "", message: "", privacyConsent: false, regConsent: false,});
    } catch (err) {

      console.error("Błąd wysylki: ", err);
      alert("Ups! Nie udało sie wysłać wiadomości. Spróbuj ponownie.");

    }
  };

  const fieldClassName = `
    w-full rounded-2xl border border-[var(--gold)]/35 bg-white/[0.05]
    px-4 py-3.5 text-white outline-none transition duration-300
    placeholder:text-white/30 hover:border-[var(--gold)]/60
    focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20
  `;

  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-14 text-white sm:px-8 sm:py-20 lg:px-12 lg:py-24">
      {/* Nagłówek */}
      <div className="mb-12 flex items-center justify-center gap-3 sm:mb-16">
        <span className="h-px w-10 bg-[var(--gold)]/70" />
        <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Kontakt
        </h1>
        <span className="h-px w-10 bg-[var(--gold)]/70" />
      </div>

      {/* Sekcja górna: dane kontaktowe + mapa */}
      <div className="mb-12 grid overflow-hidden rounded-[2rem] border border-[var(--gold)]/25 bg-white/[0.025] md:grid-cols-2">
        {/* Dane kontaktowe */}
        <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">
          <h2 className="mb-6 text-2xl font-semibold text-[var(--gold)] sm:text-3xl">
            Dane kontaktowe
          </h2>
          <div className="space-y-4 text-sm leading-6 text-white/65 sm:text-base">
            <p>📍 ul. Kościelna 26 - 1 piętro,
             21-200 Parczew</p>
            <p>📞 +48 534 345 432</p>
            <p>📧 kontakt@atelierbypaula.pl</p>
          </div>
        </div>

        {/* Mapa */}
        <div className="min-h-80 overflow-hidden border-t border-[var(--gold)]/20 md:border-l md:border-t-0">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2461.2928733624517!2d22.90202597675496!3d51.63579887184077!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4721bc15ce7fdd8d%3A0x1a9d3eec4b4634c!2sKo%C5%9Bcielna%2026%2C%2021-200%20Parczew!5e0!3m2!1spl!2spl!4v1726500000000!5m2!1spl!2spl"
            width="100%"
            height="100%"
            style={{ minHeight: "320px", border: 0 }}
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </div>
      </div>

      <BooksySection />

      {/* Formularz */}
      <div className="mx-auto max-w-4xl rounded-[2rem] border border-[var(--gold)]/25 bg-gradient-to-br from-white/[0.07] to-white/[0.025] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.2)] backdrop-blur-xl sm:p-10 lg:p-12">
        <h2 className="mb-8 text-2xl font-semibold text-[var(--gold)] sm:text-3xl">
          Napisz do nas
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <input
                type="text"
                placeholder="Imię"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className={fieldClassName}
              />
              {errors.name && (
                <p className="mt-2 text-sm text-red-300">{errors.name}</p>
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
                className={fieldClassName}
              />
              {errors.phone && (
                <p className="mt-2 text-sm text-red-300">{errors.phone}</p>
              )}
            </div>
          </div>
          <div>
            <input
              type="email"
              placeholder="E-mail"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className={fieldClassName}
            />
            {errors.email && (
              <p className="mt-2 text-sm text-red-300">{errors.email}</p>
            )}
          </div>
          <div>
            <textarea
              placeholder="Wiadomość"
              rows="5"
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              className={`${fieldClassName} resize-y`}
            ></textarea>
            {errors.message && (
              <p className="mt-2 text-sm text-red-300">{errors.message}</p>
            )}
          </div>
          <div className="border-t border-[var(--gold)]/15 pt-6">
            <label className="flex items-start gap-3 text-sm leading-6 text-white/65">
              <input
                type="checkbox"
                name="privacyConsent"
                checked={formData.privacyConsent}
                onChange={(e) =>
                  setFormData({ ...formData, privacyConsent: e.target.checked })
                }
                required
                className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-[var(--gold)]"
              />
              <span>
                Wyrażam zgodę na przetwarzanie moich danych osobowych w celu kontaktu.
                Szczegóły znajdziesz w
                <Link to="/polityka-prywatnosci" className="ml-1 text-[var(--gold)] underline decoration-[var(--gold)]/40 underline-offset-4 transition-colors hover:text-white">
                  Polityce prywatności
                </Link>.
              </span>
            </label>
            {errors.privacyConsent && (
              <p className="mt-2 text-sm text-red-300">{errors.privacyConsent}</p>
            )}
          </div>
          <div>
            <label className="flex items-start gap-3 text-sm leading-6 text-white/65">
              <input
                type="checkbox"
                name="regConsent"
                checked={formData.regConsent}
                onChange={(e) =>
                  setFormData({ ...formData, regConsent: e.target.checked })
                }
                required
                className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-[var(--gold)]"
              />
              <span>
                Zapoznałam się oraz akceptuję
                <Link to="/regulamin" className="ml-1 text-[var(--gold)] underline decoration-[var(--gold)]/40 underline-offset-4 transition-colors hover:text-white">
                  Regulamin
                </Link>.
              </span>
            </label>
            {errors.regConsent && (
              <p className="mt-2 text-sm text-red-300">{errors.regConsent}</p>
            )}
          </div>
          <button
            type="submit"
            className="
              w-full cursor-pointer rounded-full border-2 border-[var(--gold)]
              bg-[var(--gold)] px-6 py-3.5 font-semibold text-black
              transition duration-300 hover:bg-transparent hover:text-[var(--gold)]
              focus-visible:outline-none focus-visible:ring-2
              focus-visible:ring-[var(--gold)] focus-visible:ring-offset-4
              focus-visible:ring-offset-[var(--background)]
              active:bg-[var(--gold)] active:text-black
            "
          >
            Wyślij wiadomość
          </button>
        </form>
      </div>
    </section>
  );
};

export default Contact;
