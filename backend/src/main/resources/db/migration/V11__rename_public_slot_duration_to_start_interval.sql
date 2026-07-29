alter table working_hours
    rename column public_slot_duration_minutes
        to public_start_interval_minutes;

alter table working_hours
    drop constraint chk_working_hours_public_slot_duration;

alter table working_hours
    alter column public_start_interval_minutes set default 60;

update working_hours
set public_start_interval_minutes = 60;

alter table working_hours
    add constraint chk_working_hours_public_start_interval
        check (
            public_start_interval_minutes between 15 and 480
        );
