CREATE TABLE offer_item (
                            id bigserial PRIMARY KEY,
                            name varchar(255) NOT NULL,
                            category varchar(50) NOT NULL,
                            description text,
                            duration_minutes integer NOT NULL,
                            base_price numeric(10, 2) NOT NULL,
                            is_active boolean NOT NULL DEFAULT true,
                            created_at timestamp,
                            updated_at timestamp
);

CREATE UNIQUE INDEX uk_offer_item_name_active
    ON offer_item (name)
    WHERE is_active = true;

ALTER TABLE offer_item
    ADD CONSTRAINT chk_offer_item_duration_positive
        CHECK (duration_minutes > 0);

ALTER TABLE offer_item
    ADD CONSTRAINT chk_offer_item_base_price_non_negative
        CHECK (base_price >= 0);