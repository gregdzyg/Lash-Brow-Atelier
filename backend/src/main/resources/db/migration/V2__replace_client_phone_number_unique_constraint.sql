alter table client
drop constraint client_phone_number_key;

create unique index uk_client_phone_number_active
on client (phone_number)
where is_active = true;

