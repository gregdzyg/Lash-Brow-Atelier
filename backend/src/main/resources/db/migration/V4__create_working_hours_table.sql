create table working_hours (
    id bigserial primary key,
    day_of_week varchar(10) not null,
    start_time time,
    end_time time,
    is_working_day boolean not null,
    is_active boolean not null default true,
    created_at timestamp,
    updated_at timestamp,

    constraint chk_working_hours_time_consistency check (
        (
            is_working_day = true
            and start_time is not null
            and end_time is not null
            and start_time < end_time
        )
        or
        (
            is_working_day = false
            and start_time is null
            and end_time is null
        )
    )

);

create unique index uk_working_hours_day_of_week_active
on working_hours (day_of_week)
where (is_active = true);



