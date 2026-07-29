alter table working_hours
    add column public_slot_duration_minutes integer not null default 120;

alter table working_hours
    add constraint chk_working_hours_public_slot_duration
        check (
            public_slot_duration_minutes between 15 and 480
        );
