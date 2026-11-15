CREATE TABLE about_portrait (
    id bigint PRIMARY KEY DEFAULT 1,
    object_key varchar(512) NOT NULL,
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL,
    CONSTRAINT uk_about_portrait_object_key UNIQUE (object_key),
    CONSTRAINT chk_about_portrait_singleton CHECK (id = 1)
);
