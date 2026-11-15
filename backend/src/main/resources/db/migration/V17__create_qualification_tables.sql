CREATE TABLE qualification_section (
    id bigint PRIMARY KEY DEFAULT 1,
    eyebrow varchar(100) NOT NULL,
    title varchar(255) NOT NULL,
    description varchar(1000) NOT NULL,
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL,
    CONSTRAINT chk_qualification_section_singleton CHECK (id = 1)
);

CREATE TABLE qualification (
    id bigserial PRIMARY KEY,
    title varchar(255) NOT NULL,
    description varchar(1000) NOT NULL,
    sort_order integer NOT NULL DEFAULT 0,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL,
    CONSTRAINT chk_qualification_sort_order_non_negative
        CHECK (sort_order >= 0)
);

INSERT INTO qualification_section (
    id,
    eyebrow,
    title,
    description,
    created_at,
    updated_at
) VALUES (
    1,
    'Rozwój i doświadczenie',
    'Moje kwalifikacje',
    'Regularnie rozwijam warsztat, aby każda stylizacja łączyła bezpieczną technikę, trwałość i naturalny efekt.',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

INSERT INTO qualification (
    title,
    description,
    sort_order,
    is_active,
    created_at,
    updated_at
) VALUES
    (
        'Certyfikat Stylizacji Rzęs 1:1',
        'Podstawowe techniki przedłużania rzęs metodą klasyczną.',
        0,
        true,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'Szkolenie Laminacji Brwi',
        'Modelowanie kształtu brwi i nadawanie im perfekcyjnego wyglądu.',
        1,
        true,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'Kurs Stylizacji Rzęs 2D–6D',
        'Zaawansowane techniki objętościowe dopasowane do urody klientki.',
        2,
        true,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'Szkolenie Liftingu i Botoksu Rzęs',
        'Naturalne podkręcenie i nadanie zdrowego połysku.',
        3,
        true,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'Geometria brwi wraz z farbą lub henną',
        'Modelowanie brwi nadające im idealny kształt i kolor.',
        4,
        true,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'Szkolenie z efektów niestandardowych rzęs',
        'Tworzenie efektów whispy, wet look, e-liner oraz Kim Kardashian.',
        5,
        true,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    );
