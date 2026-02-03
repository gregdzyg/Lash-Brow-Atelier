const Privacy = () => {
  return (
    <section className="text-white w-4/5 mx-auto py-12 mt-4">
      <h1 className="text-3xl md:text-5xl font-bold text-[var(--gold)] text-center mb-10">
        Polityka prywatności
      </h1>

      <div className="bg-[var(--background)] p-6 rounded-4xl border border-[var(--gold)]/70 space-y-4">
        <p>
          Administratorem danych osobowych jest{" "}
          <strong>Lash&Brow Atelier by Paulina Tarnowska</strong>.
        </p>

        <p>
          Dane podane w formularzu kontaktowym (imię, adres e-mail, numer telefonu,
          treść wiadomości) są przetwarzane wyłącznie w celu udzielenia odpowiedzi
          na przesłane zapytanie.
        </p>

        <p>
          Podanie danych jest dobrowolne, jednak niezbędne do nawiązania kontaktu.
        </p>

        <p>
          Odbiorcami danych mogą być zewnętrzni dostawcy usług technicznych,
          w szczególności:
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>EmailJS – obsługa formularza kontaktowego,</li>
            <li>
              Booksy International sp. z o.o. – obsługa rezerwacji wizyt online,
            </li>
            <li>
              Google LLC – prezentacja lokalizacji salonu za pomocą Google Maps.
            </li>
          </ul>
        </p>

        <p>
          Rezerwacja wizyty online odbywa się za pośrednictwem zewnętrznego serwisu
          Booksy. Dane przekazywane w trakcie rezerwacji są przetwarzane zgodnie z
          polityką prywatności tego serwisu.
        </p>

        <p>
          Strona korzysta z plików cookies w celu zapewnienia prawidłowego
          funkcjonowania, obsługi rezerwacji online oraz prezentacji treści
          zewnętrznych (np. map).
        </p>

        <p>
          Pliki cookies mogą być zapisywane na urządzeniu użytkownika zgodnie z
          ustawieniami przeglądarki internetowej. Użytkownik może w każdej chwili
          zmienić ustawienia dotyczące cookies.
        </p>

        <p>
          Dane osobowe są przechowywane wyłącznie przez okres niezbędny do realizacji
          celu, w jakim zostały zebrane, a następnie usuwane.
        </p>

        <p>
          Każdej osobie przysługuje prawo do:
          dostępu do danych, ich sprostowania, usunięcia, ograniczenia przetwarzania,
          wniesienia sprzeciwu oraz złożenia skargi do Prezesa Urzędu Ochrony Danych
          Osobowych (UODO).
        </p>

        <p>
          W sprawach związanych z ochroną danych osobowych można skontaktować się pod
          adresem e-mail: <strong>kontakt@lash-brow-atelier.pl</strong>.
        </p>
      </div>
    </section>
  );
};

export default Privacy;