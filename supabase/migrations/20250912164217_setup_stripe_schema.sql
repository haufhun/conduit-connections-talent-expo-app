

create extension if not exists wrappers with schema extensions;


create foreign data wrapper stripe_wrapper
    handler stripe_fdw_handler
    validator stripe_fdw_validator;


-- First, we need to create the server with a placeholder, then update it with the actual vault ID
do $$
declare
    vault_id uuid;
begin
    -- Get the vault secret ID
    select id into vault_id from vault.secrets where name = 'stripe_secret_key';
    
    -- Create the server with the vault ID
    execute format('
        create server stripe_server
            foreign data wrapper stripe_wrapper
            options (
                api_key_id %L
            )', vault_id::text);
end $$;


create schema if not exists stripe;

import foreign schema stripe from server stripe_server into stripe;

