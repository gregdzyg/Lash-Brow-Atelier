ALTER TABLE qualification
    ADD COLUMN certificate_object_key varchar(512),
    ADD CONSTRAINT uk_qualification_certificate_object_key UNIQUE (certificate_object_key);
