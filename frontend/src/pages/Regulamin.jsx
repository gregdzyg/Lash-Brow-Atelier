

const Regulamin = () => {
  return (
    <section className="text-white w-4/5 mx-auto py-12 mt-4">
      <h1 className="text-3xl md:text-5xl font-bold text-[var(--gold)] text-center mb-10">
        Regulamin
      </h1>

      <div className="bg-[var(--background)] p-6 rounded-4xl border border-[var(--gold)]/70 space-y-6 leading-relaxed">
        <p>
          Niniejszy regulamin określa zasady korzystania z usług salonu{" "}
          <span className="text-[var(--gold)] font-semibold">
            Lash&amp;Brow Atelier by Paulina Tarnowska
          </span>{" "}
          oraz ze strony internetowej dostępnej pod adresem
          {" "}
          <span className="italic">www.atelierbypaula.pl</span>.
        </p>

        <ul className="list-disc list-inside space-y-2">
          <li>Proszę o zarezerwowanie sobie 2 - 2.5 godziny, w zależności od ilości naturalnych rzęs i wykonywanej stylizacji.</li>
          <li>Na uzupełnienie zapraszam nie więcej niż 3.5 tygodnia. Po tym czasie zabieg będzie traktowany jako nowa usługa.</li>
          <li>Do zapisów zapraszam w wiadomości prywatnej, formularz kontaktowy, lub nr. telefonu.</li>
          <li>Proszę o punktualność. Akceptuję spóźnienie do 15 min. Po tym czasie zastrzegam sobie prawo do niewykonania aplikacji lub nie wyklejenie 100% rzęs.</li>
          <li>W przypadku braku obecności na wizycie oraz braku jej odwołania na 24h przed wizytą zostawiam sobie prawo do niezapisania na kolejną wizytę lub pobrania zadatku w wysokości 50 zł.</li>
          <li>Reklamacja przyjmowana jest na trwałość aplikacji, pod warunkiem zastosowania się do zaleceń pozabiegowych. Długość rzęs, modelowanie, objętość będzie dobierana w dniu wizyty i nie podlega reklamacji. Reklamacja przyjmowania jest maksymalnie do 4 dni po ostatniej wizycie. W przypadku uznania reklamacji zapraszam na korektę w ciągu 48 godzin.</li>
          <li>Zapraszam na zabieg bez osób towarzyszących oraz bez zwierząt.</li>
          <li>Proszę o wyłączenie dziwięków w telefonie oraz nieodbieranie go podczas zabiegu.</li>
          <li>Zastrzegam sobie prawo do odmówienia zabiegu, gdy oczekiwania klientki są niezgodne ze sztuką lub moim poczuciem estetyki.</li>
          <li>Korzystanie z usług oznacza akceptację regulaminu.</li>
        </ul>
      </div>
    </section>
  );
};

export default Regulamin;