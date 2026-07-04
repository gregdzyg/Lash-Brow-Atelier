create table availability_exception (
    id bigserial primary key,
    date date not null ,
    start_time time,
    end_time time,
    type varchar(50) not null ,
    note varchar(500),
    is_active boolean not null default true,
    created_at timestamp,
    updated_at timestamp,

    constraint chk_availability_exception_consistency check (

        (
            type = 'CLOSED_DAY'
            and start_time is null
            and end_time is null
        )
        or

        (
            (type = 'BLOCKED' or type = 'EXTRA_OPEN')
            and start_time is not null
            and end_time is not null
            and start_time < end_time
        )
    )
);