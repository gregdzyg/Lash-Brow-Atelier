create table client (
    id bigserial primary key,
    first_name varchar(255) not null,
    last_name varchar(255) not null,
    phone_number varchar(30) unique not null ,
    email varchar(255),
    instagram_username varchar(255),
    notes text,
    is_active boolean not null default true,
    created_at timestamp,
    updated_at timestamp

)