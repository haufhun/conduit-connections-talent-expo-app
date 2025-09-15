create extension if not exists wrappers with schema extensions;


create foreign data wrapper stripe_wrapper
    handler stripe_fdw_handler
    validator stripe_fdw_validator;


-- Save your Stripe API key in Vault and retrieve the `key_id`
-- insert into vault.secrets (name, secret)
-- values (
--     'stripe',
--     ''
-- )
-- returning key_id;


-- create server stripe_server
--     foreign data wrapper stripe_wrapper
--     options (
--         api_key_id key_id -- The Key ID from above.
--     );


create server stripe_server
  foreign data wrapper stripe_wrapper
  options (
    api_key ''
    -- api_url 'https://api.stripe.com/v1/',  -- Stripe API base URL, optional. Default is 'https://api.stripe.com/v1/'
    -- api_version '2024-06-20'  -- Stripe API version, optional. Default is your Stripe account’s default API version.
  );

create schema if not exists stripe;

import foreign schema stripe from server stripe_server into stripe;

