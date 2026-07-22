

const Regulamin = () => {
  return (
    <section className="mx-auto w-full max-w-5xl px-5 py-14 text-white sm:px-8 sm:py-20 lg:px-12 lg:py-24">
      <div className="mb-12 flex items-center justify-center gap-3 sm:mb-16">
        <span className="h-px w-10 bg-[var(--gold)]/70" />
        <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Regulamin
        </h1>
        <span className="h-px w-10 bg-[var(--gold)]/70" />
      </div>

      <div className="rounded-[2rem] border border-[var(--gold)]/20 bg-white/[0.025] p-6 text-sm leading-7 text-white/70 shadow-[0_24px_70px_rgba(0,0,0,0.16)] sm:p-10 sm:text-base sm:leading-8 lg:p-14">
        <p>
          Niniejszy regulamin określa zasady korzystania z usług salonu{" "}
          <span className="font-semibold text-[var(--gold)]">
            Lash&amp;Brow Atelier by Paulina Tarnowska
          </span>{" "}
          oraz ze strony internetowej dostępnej pod adresem
          {" "}
          <span className="italic text-white/85">www.atelierbypaula.pl</span>.
        </p>

        <ul className="mt-8 space-y-0 border-t border-[var(--gold)]/20">
          <li className="border-b border-[var(--gold)]/15 py-5">Proszę o zarezerwowanie sobie 2 - 2.5 godziny, w zależności od ilości naturalnych rzęs i wykonywanej stylizacji.</li>
          <li className="border-b border-[var(--gold)]/15 py-5">Na uzupełnienie zapraszam nie więcej niż 3.5 tygodnia. Po tym czasie zabieg będzie traktowany jako nowa usługa.</li>
          <li className="border-b border-[var(--gold)]/15 py-5">Do zapisów zapraszam w wiadomości prywatnej, formularz kontaktowy, lub nr. telefonu.</li>
          <li className="border-b border-[var(--gold)]/15 py-5">Proszę o punktualność. Akceptuję spóźnienie do 15 min. Po tym czasie zastrzegam sobie prawo do niewykonania aplikacji lub nie wyklejenie 100% rzęs.</li>
          <li className="border-b border-[var(--gold)]/15 py-5">W przypadku braku obecności na wizycie oraz braku jej odwołania na 24h przed wizytą zostawiam sobie prawo do niezapisania na kolejną wizytę lub pobrania zadatku w wysokości 50 zł.</li>
          <li className="border-b border-[var(--gold)]/15 py-5">Reklamacja przyjmowana jest na trwałość aplikacji, pod warunkiem zastosowania się do zaleceń pozabiegowych. Długość rzęs, modelowanie, objętość będzie dobierana w dniu wizyty i nie podlega reklamacji. Reklamacja przyjmowania jest maksymalnie do 4 dni po ostatniej wizycie. W przypadku uznania reklamacji zapraszam na korektę w ciągu 48 godzin.</li>
          <li className="border-b border-[var(--gold)]/15 py-5">Zapraszam na zabieg bez osób towarzyszących oraz bez zwierząt.</li>
          <li className="border-b border-[var(--gold)]/15 py-5">Proszę o wyłączenie dziwięków w telefonie oraz nieodbieranie go podczas zabiegu.</li>
          <li className="border-b border-[var(--gold)]/15 py-5">Zastrzegam sobie prawo do odmówienia zabiegu, gdy oczekiwania klientki są niezgodne ze sztuką lub moim poczuciem estetyki.</li>
          <li className="border-b border-[var(--gold)]/15 py-5">Korzystanie z usług oznacza akceptację regulaminu.</li>
        </ul>
      </div>
    </section>
  );
};

export default Regulamin;
