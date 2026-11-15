CREATE TABLE review_image (
    id bigserial PRIMARY KEY,
    object_key varchar(512) NOT NULL,
    alt_text varchar(500),
    sort_order integer NOT NULL DEFAULT 0,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp,
    updated_at timestamp,
    CONSTRAINT uk_review_image_object_key UNIQUE (object_key),
    CONSTRAINT chk_review_image_sort_order_non_negative
        CHECK (sort_order >= 0)
);
