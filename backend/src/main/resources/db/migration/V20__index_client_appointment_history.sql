CREATE INDEX idx_appointment_client_history
    ON appointment (client_id, appointment_date DESC, start_time DESC, id DESC);
