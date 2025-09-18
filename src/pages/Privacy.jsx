const Privacy = () => {
  return (
    <section className="text-white w-4/5 mx-auto py-12 mt-4">
      <h1 className="text-3xl md:text-5xl font-bold text-[var(--gold)] text-center mb-10">
        Polityka prywatności
      </h1>
      <div className="bg-[var(--background)] p-6 rounded-4xl border border-[var(--gold)]/70 space-y-4">
        <p>
          Administratorem danych osobowych jest <strong>Lash&Brow Atelier by Paulina Tarnowska</strong>.
        </p>
        <p>
          Dane podane w formularzu kontaktowym (imię, e-mail, telefon, treść wiadomości) są przetwarzane wyłącznie w celu kontaktu zwrotnego.
        </p>
        <p>
          Podanie danych jest dobrowolne, ale niezbędne do udzielenia odpowiedzi.
        </p>
        <p>
          Odbiorcami danych mogą być dostawcy usług poczty e-mail oraz serwis <strong>EmailJS</strong>, który obsługuje formularz kontaktowy.
        </p>
        <p>
          Dane przechowujemy przez czas potrzebny do obsługi zapytania, a następnie są usuwane.
        </p>
        <p>
          Masz prawo do: dostępu do danych, sprostowania, usunięcia, ograniczenia przetwarzania, sprzeciwu oraz wniesienia skargi do UODO.
        </p>
        <p>
          Kontakt w sprawie danych osobowych: <strong>kontakt@lash-brow-atelier.pl</strong>.
        </p>
      </div>
    </section>
  );
};

export default Privacy;