ALTER TABLE appointment
DROP CONSTRAINT chk_appointment_status;

ALTER TABLE appointment
ADD CONSTRAINT chk_appointment_status
CHECK (status IN ('SCHEDULED', 'CANCELLED', 'NO_SHOW'));