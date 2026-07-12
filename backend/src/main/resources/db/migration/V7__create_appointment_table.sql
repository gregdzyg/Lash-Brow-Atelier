create table Appointment
(
    id               bigserial primary key,
    client_id        bigint         not null,
    offer_item_id    bigint         not null,
    appointment_date date           not null,
    start_time       time           not null,
    duration_minutes integer        not null,
    price            numeric(10, 2) not null,
    status           varchar(20)    not null,
    note             varchar(1000),
    is_active        boolean        not null default true,
    created_at       timestamp,
    updated_at       timestamp,

    constraint fk_appointment_client foreign key (client_id) references client (id),

    constraint fk_appointment_offer_item foreign key (offer_item_id) references offer_item (id),

    constraint chk_appointment_duration_positive check ( duration_minutes > 0 ),

    constraint chk_appointment_price_not_negative check ( price >= 0 ),

    constraint chk_appointment_status check ( status in ('SCHEDULED', 'CANCELED', 'NO_SHOW') )

);