CREATE TABLE about_content (
    id bigint PRIMARY KEY DEFAULT 1,
    home_introduction text NOT NULL,
    about_biography text NOT NULL,
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL,
    CONSTRAINT chk_about_content_singleton CHECK (id = 1),
    CONSTRAINT chk_about_content_home_length
        CHECK (char_length(home_introduction) <= 5000),
    CONSTRAINT chk_about_content_biography_length
        CHECK (char_length(about_biography) <= 5000)
);

INSERT INTO about_content (
    id,
    home_introduction,
    about_biography,
    created_at,
    updated_at
) VALUES (
    1,
    E'W Lash&Brow Atelier wierzymy, że piękno tkwi w detalach – w subtelnym spojrzeniu, delikatnym łuku brwi, naturalnym podkreśleniu kobiecego uroku.\n\nMoją misją jest wydobycie Twojego wewnętrznego piękna w sposób, który daje pewność siebie – każdego dnia.',
    E'Nazywam się Paulina Tarnowska, z pasją tworzę piękne i naturalne stylizacje rzęs oraz brwi. Każda klientka jest dla mnie wyjątkowa, dlatego każdy zabieg wykonuję z pełnym zaangażowaniem, dbając o najmniejszy detal.\n\nMoim celem jest podkreślenie naturalnego piękna w sposób subtelny i elegancki, tak aby każda kobieta czuła się pewna siebie każdego dnia. Stale poszerzam swoje umiejętności, uczestnicząc w szkoleniach i śledząc najnowsze trendy w branży beauty.\n\nW moim atelier stawiam na indywidualne podejście i komfort każdej klientki. Wierzę, że wizyta u stylistki rzęs i brwi to nie tylko zabieg, ale także chwila relaksu i czasu dla siebie.',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);
