CREATE TABLE news_post (
    id bigserial PRIMARY KEY,
    title varchar(255) NOT NULL,
    content text NOT NULL,
    category varchar(50) NOT NULL,
    image_object_key varchar(512),
    image_alt_text varchar(500),
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp,
    updated_at timestamp,
    CONSTRAINT uk_news_post_image_object_key UNIQUE (image_object_key),
    CONSTRAINT chk_news_post_category
        CHECK (category IN ('NEWS', 'EVENT', 'PROMOTION'))
);
