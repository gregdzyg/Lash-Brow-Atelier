CREATE TABLE app_user (
                          id BIGSERIAL PRIMARY KEY,
                          username VARCHAR(100) NOT NULL,
                          password VARCHAR(255) NOT NULL,
                          role VARCHAR(50) NOT NULL,
                          is_active BOOLEAN NOT NULL DEFAULT TRUE,
                          created_at TIMESTAMP,
                          updated_at TIMESTAMP,

                          CONSTRAINT uk_app_user_username UNIQUE (username),
                          CONSTRAINT chk_app_user_role
                              CHECK (role IN ('ADMIN'))
);