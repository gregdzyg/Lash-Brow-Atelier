const PrivacySection = ({ title, children }) => (
  <section>
    <h2 className="mb-3 text-lg font-semibold text-white sm:text-xl">{title}</h2>
    <div className="space-y-3">{children}</div>
  </section>
);

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
        <div className="space-y-8">
          <p className="text-white/80">
            Niniejsza polityka wyjaśnia zasady przetwarzania danych osobowych
            w związku z korzystaniem ze strony internetowej oraz obsługą wizyt
            w Lash &amp; Brow Atelier.
          </p>

          <PrivacySection title="1. Administrator danych">
            <p>
              Administratorem danych osobowych jest{" "}
              <strong className="font-semibold text-white">
                Lash &amp; Brow Atelier Paulina Tarnowska
              </strong>
              , ul. Kościelna 26, 21-200 Parczew, NIP: 5391477096.
            </p>
            <p>
              W sprawach związanych z ochroną danych można skontaktować się pod
              adresem:{" "}
              <strong className="font-semibold text-[var(--gold)]">
                kontakt@atelierbypaula.pl
              </strong>
              .
            </p>
          </PrivacySection>

          <PrivacySection title="2. Jakie dane są przetwarzane">
            <p>
              W elektronicznym systemie obsługi wizyt mogą być przechowywane:
              imię i nazwisko, numer telefonu, adres e-mail, nazwa użytkownika
              w serwisie Instagram, informacje o wybranej usłudze i terminach
              wizyt oraz zwykłe notatki organizacyjne związane z ich obsługą.
            </p>
            <p>
              System elektroniczny nie jest przeznaczony do przechowywania
              informacji o stanie zdrowia, przeciwwskazaniach, alergiach ani
              innych danych szczególnych kategorii. Takich informacji nie
              należy umieszczać w notatkach systemu.
            </p>
            <p>
              Ewentualna dokumentacja papierowa dotycząca zabiegu, w tym
              dokumentacja osób niepełnoletnich, jest prowadzona odrębnie
              poza stroną i elektronicznym systemem wizyt, na zasadach
              wskazanych w informacji dołączonej do tej dokumentacji.
            </p>
          </PrivacySection>

          <PrivacySection title="3. Cele i podstawy przetwarzania">
            <ul className="list-outside list-disc space-y-2 pl-5">
              <li>
                kontakt, umawianie i obsługa wizyt oraz wykonanie usługi –
                podjęcie działań na żądanie klienta i wykonanie umowy
                (art. 6 ust. 1 lit. b RODO);
              </li>
              <li>
                realizacja obowiązków wynikających z przepisów prawa, jeżeli
                mają zastosowanie (art. 6 ust. 1 lit. c RODO);
              </li>
              <li>
                zapewnienie bezpieczeństwa systemu oraz ustalenie, dochodzenie
                lub obrona przed roszczeniami – prawnie uzasadniony interes
                administratora (art. 6 ust. 1 lit. f RODO);
              </li>
              <li>
                załadowanie interaktywnej mapy Google – zgoda użytkownika
                strony (art. 6 ust. 1 lit. a RODO).
              </li>
            </ul>
          </PrivacySection>

          <PrivacySection title="4. Kontakt z Atelier">
            <p>
              Strona nie posiada publicznego formularza rezerwacji ani
              formularza kontaktowego. Kontakt odbywa się telefonicznie,
              pocztą elektroniczną lub za pośrednictwem mediów
              społecznościowych. Dane przekazane podczas kontaktu są
              wykorzystywane do udzielenia odpowiedzi, umówienia wizyty lub
              realizacji usługi.
            </p>
          </PrivacySection>

          <PrivacySection title="5. Odbiorcy danych">
            <p>
              Dane mogą być powierzane dostawcom usług niezbędnych do
              utrzymania systemu, w szczególności dostawcom hostingu aplikacji
              i bazy danych (Render i Neon), poczty elektronicznej oraz
              wsparcia technicznego. Dane mogą być również udostępnione
              uprawnionym organom, jeżeli obowiązek taki wynika z przepisów
              prawa.
            </p>
            <p>
              Niektórzy dostawcy mogą przetwarzać dane poza Europejskim
              Obszarem Gospodarczym. W takim przypadku przekazanie odbywa się
              z zastosowaniem mechanizmów dopuszczonych przez RODO, takich
              jak decyzja stwierdzająca odpowiedni stopień ochrony lub
              standardowe klauzule umowne.
            </p>
          </PrivacySection>

          <PrivacySection title="6. Google Maps i ustawienia prywatności">
            <p>
              Interaktywna mapa Google nie jest ładowana przed wyrażeniem
              zgody. Po jej zaakceptowaniu przeglądarka nawiązuje połączenie
              z Google, które może przetwarzać dane techniczne, w tym adres
              IP, oraz korzystać z własnych plików cookie i podobnych
              technologii.
            </p>
            <p>
              Decyzja dotycząca mapy jest zapisywana lokalnie w przeglądarce.
              Zgodę można w każdej chwili wycofać za pomocą odnośnika
              „Ustawienia prywatności” w stopce strony. Wycofanie zgody nie
              wpływa na zgodność z prawem wcześniejszego przetwarzania.
            </p>
          </PrivacySection>

          <PrivacySection title="7. Okres przechowywania">
            <p>
              Dane związane z kontaktem i obsługą wizyt są przechowywane przez
              czas niezbędny do realizacji tych celów, a następnie przez okres
              wymagany przepisami prawa lub potrzebny do ustalenia,
              dochodzenia albo obrony przed roszczeniami. Dane przetwarzane
              na podstawie zgody są przechowywane do jej wycofania lub do
              ustania celu przetwarzania.
            </p>
          </PrivacySection>

          <PrivacySection title="8. Prawa osób">
            <p>
              W zależności od podstawy i okoliczności przetwarzania osobie,
              której dane dotyczą, może przysługiwać prawo dostępu do danych,
              ich sprostowania, usunięcia, ograniczenia przetwarzania,
              przenoszenia danych, wniesienia sprzeciwu oraz wycofania zgody
              w dowolnym momencie.
            </p>
            <p>
              Każda osoba ma również prawo złożyć skargę do Prezesa Urzędu
              Ochrony Danych Osobowych.
            </p>
          </PrivacySection>

          <PrivacySection title="9. Dobrowolność podania danych">
            <p>
              Podanie danych kontaktowych jest dobrowolne, ale może być
              konieczne do umówienia i prawidłowej obsługi wizyty. Niepodanie
              danych wymaganych do kontaktu może uniemożliwić dokonanie
              rezerwacji. Podanie adresu e-mail, nazwy użytkownika Instagram
              i dodatkowych notatek jest opcjonalne.
            </p>
          </PrivacySection>

          <PrivacySection title="10. Zautomatyzowane decyzje">
            <p>
              Dane nie są wykorzystywane do zautomatyzowanego podejmowania
              decyzji ani profilowania wywołującego skutki prawne lub w
              podobny sposób istotnie wpływającego na klienta.
            </p>
          </PrivacySection>

          <p className="border-t border-[var(--gold)]/20 pt-6 text-sm text-white/50">
            Ostatnia aktualizacja: 30 lipca 2026 r.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Privacy;
