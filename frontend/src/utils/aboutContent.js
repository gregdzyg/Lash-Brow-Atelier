export const DEFAULT_HOME_INTRODUCTION = `W Lash&Brow Atelier wierzymy, że piękno tkwi w detalach – w subtelnym spojrzeniu, delikatnym łuku brwi, naturalnym podkreśleniu kobiecego uroku.

Moją misją jest wydobycie Twojego wewnętrznego piękna w sposób, który daje pewność siebie – każdego dnia.`;

export const DEFAULT_ABOUT_BIOGRAPHY = `Nazywam się Paulina Tarnowska, z pasją tworzę piękne i naturalne stylizacje rzęs oraz brwi. Każda klientka jest dla mnie wyjątkowa, dlatego każdy zabieg wykonuję z pełnym zaangażowaniem, dbając o najmniejszy detal.

Moim celem jest podkreślenie naturalnego piękna w sposób subtelny i elegancki, tak aby każda kobieta czuła się pewna siebie każdego dnia. Stale poszerzam swoje umiejętności, uczestnicząc w szkoleniach i śledząc najnowsze trendy w branży beauty.

W moim atelier stawiam na indywidualne podejście i komfort każdej klientki. Wierzę, że wizyta u stylistki rzęs i brwi to nie tylko zabieg, ale także chwila relaksu i czasu dla siebie.`;

export const splitIntoParagraphs = (text) =>
  text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
