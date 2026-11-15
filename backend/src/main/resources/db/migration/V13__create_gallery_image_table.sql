CREATE TABLE gallery_image (
    id bigserial PRIMARY KEY,
    object_key varchar(512) NOT NULL,
    title varchar(255),
    alt_text varchar(500),
    sort_order integer NOT NULL DEFAULT 0,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp,
    updated_at timestamp,
    CONSTRAINT uk_gallery_image_object_key UNIQUE (object_key),
    CONSTRAINT chk_gallery_image_sort_order_non_negative CHECK (sort_order >= 0)
);
