const Privacy = () => {
  return (
    <section className="mx-auto w-full max-w-5xl px-5 py-14 text-white sm:px-8 sm:py-20 lg:px-12 lg:py-24">
      <div className="mb-12 flex items-center justify-center gap-3 sm:mb-16">
        <span className="h-px w-6 bg-[var(--gold)]/70 sm:w-10" />
        <h1 className="text-center text-3xl font-semibold tracking-tight text-white sm:text-5xl">
          Polityka prywatności
        </h1>
        <span className="h-px w-6 bg-[var(--gold)]/70 sm:w-10" />
      </div>

      <div className="rounded-[2rem] border border-[var(--gold)]/20 bg-white/[0.025] p-6 text-sm leading-7 text-white/70 shadow-[0_24px_70px_rgba(0,0,0,0.16)] sm:p-10 sm:text-base sm:leading-8 lg:p-14">
        <div className="space-y-6">
        <p>
          Administratorem danych osobowych jest{" "}
          <strong className="font-semibold text-white">Lash&Brow Atelier by Paulina Tarnowska</strong>.
        </p>

        <p>
          Strona nie posiada formularza kontaktowego. Kontakt z Atelier odbywa się
          telefonicznie, za pośrednictwem poczty elektronicznej lub mediów społecznościowych.
          Dane przekazane dobrowolnie podczas kontaktu są przetwarzane wyłącznie w celu
          udzielenia odpowiedzi i obsługi zapytania.
        </p>

        <p>
          Strona wykorzystuje usługę zewnętrznego dostawcy:
          <ul className="mt-3 list-inside list-disc space-y-2 border-l border-[var(--gold)]/20 pl-4 text-white/60">
            <li>
              Google LLC – prezentacja lokalizacji salonu za pomocą Google Maps.
            </li>
          </ul>
        </p>

        <p>
          Strona korzysta z plików cookies w celu zapewnienia prawidłowego
          funkcjonowania oraz prezentacji treści zewnętrznych, takich jak mapa Google.
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
          adresem e-mail: <strong className="font-semibold text-[var(--gold)]">kontakt@atelierbypaula.pl</strong>.
        </p>
        </div>
      </div>
    </section>
  );
};

export default Privacy;
