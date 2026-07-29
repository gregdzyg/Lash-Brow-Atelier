alter table working_hours
    alter column public_start_interval_minutes set default 120;

update working_hours
set public_start_interval_minutes = 120
where public_start_interval_minutes = 60;
