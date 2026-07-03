insert into working_hours (
    day_of_week,
    start_time,
    end_time,
    is_working_day
)
values
    ('MONDAY',    '08:00', '17:00', true),
    ('TUESDAY',   '08:00', '17:00', true),
    ('WEDNESDAY', '08:00', '17:00', true),
    ('THURSDAY',  '08:00', '17:00', true),
    ('FRIDAY',    '08:00', '17:00', true),
    ('SATURDAY',  null,    null,    false),
    ('SUNDAY',    null,    null,    false);