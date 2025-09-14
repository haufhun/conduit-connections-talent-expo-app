set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  new.updated_at = now();
  return NEW;
end;
$function$
;


create schema if not exists "stripe";

create type "stripe"."invoice_status" as enum ('draft', 'open', 'paid', 'uncollectible', 'void', 'deleted');

create type "stripe"."pricing_tiers" as enum ('graduated', 'volume');

create type "stripe"."pricing_type" as enum ('one_time', 'recurring');

create type "stripe"."subscription_schedule_status" as enum ('not_started', 'active', 'completed', 'released', 'canceled');

create type "stripe"."subscription_status" as enum ('trialing', 'active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'unpaid');

create table "stripe"."charges" (
    "id" text not null,
    "object" text,
    "paid" boolean,
    "order" text,
    "amount" bigint,
    "review" text,
    "source" jsonb,
    "status" text,
    "created" integer,
    "dispute" text,
    "invoice" text,
    "outcome" jsonb,
    "refunds" jsonb,
    "updated" integer,
    "captured" boolean,
    "currency" text,
    "customer" text,
    "livemode" boolean,
    "metadata" jsonb,
    "refunded" boolean,
    "shipping" jsonb,
    "application" text,
    "description" text,
    "destination" text,
    "failure_code" text,
    "on_behalf_of" text,
    "fraud_details" jsonb,
    "receipt_email" text,
    "payment_intent" text,
    "receipt_number" text,
    "transfer_group" text,
    "amount_refunded" bigint,
    "application_fee" text,
    "failure_message" text,
    "source_transfer" text,
    "balance_transaction" text,
    "statement_descriptor" text,
    "payment_method_details" jsonb,
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "last_synced_at" timestamp with time zone
);


create table "stripe"."coupons" (
    "id" text not null,
    "object" text,
    "name" text,
    "valid" boolean,
    "created" integer,
    "updated" integer,
    "currency" text,
    "duration" text,
    "livemode" boolean,
    "metadata" jsonb,
    "redeem_by" integer,
    "amount_off" bigint,
    "percent_off" double precision,
    "times_redeemed" bigint,
    "max_redemptions" bigint,
    "duration_in_months" bigint,
    "percent_off_precise" double precision,
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "last_synced_at" timestamp with time zone
);


create table "stripe"."credit_notes" (
    "id" text not null,
    "object" text,
    "amount" integer,
    "amount_shipping" integer,
    "created" integer,
    "currency" text,
    "customer" text,
    "customer_balance_transaction" text,
    "discount_amount" integer,
    "discount_amounts" jsonb,
    "invoice" text,
    "lines" jsonb,
    "livemode" boolean,
    "memo" text,
    "metadata" jsonb,
    "number" text,
    "out_of_band_amount" integer,
    "pdf" text,
    "reason" text,
    "refund" text,
    "shipping_cost" jsonb,
    "status" text,
    "subtotal" integer,
    "subtotal_excluding_tax" integer,
    "tax_amounts" jsonb,
    "total" integer,
    "total_excluding_tax" integer,
    "type" text,
    "voided_at" text,
    "last_synced_at" timestamp with time zone
);


create table "stripe"."customers" (
    "id" text not null,
    "object" text,
    "address" jsonb,
    "description" text,
    "email" text,
    "metadata" jsonb,
    "name" text,
    "phone" text,
    "shipping" jsonb,
    "balance" integer,
    "created" integer,
    "currency" text,
    "default_source" text,
    "delinquent" boolean,
    "discount" jsonb,
    "invoice_prefix" text,
    "invoice_settings" jsonb,
    "livemode" boolean,
    "next_invoice_sequence" integer,
    "preferred_locales" jsonb,
    "tax_exempt" text,
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "deleted" boolean not null default false,
    "last_synced_at" timestamp with time zone
);


create table "stripe"."disputes" (
    "id" text not null,
    "object" text,
    "amount" bigint,
    "charge" text,
    "reason" text,
    "status" text,
    "created" integer,
    "updated" integer,
    "currency" text,
    "evidence" jsonb,
    "livemode" boolean,
    "metadata" jsonb,
    "evidence_details" jsonb,
    "balance_transactions" jsonb,
    "is_charge_refundable" boolean,
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "payment_intent" text,
    "last_synced_at" timestamp with time zone
);


create table "stripe"."early_fraud_warnings" (
    "id" text not null,
    "object" text,
    "actionable" boolean,
    "charge" text,
    "created" integer,
    "fraud_type" text,
    "livemode" boolean,
    "payment_intent" text,
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "last_synced_at" timestamp with time zone
);


create table "stripe"."events" (
    "id" text not null,
    "object" text,
    "data" jsonb,
    "type" text,
    "created" integer,
    "request" text,
    "updated" integer,
    "livemode" boolean,
    "api_version" text,
    "pending_webhooks" bigint,
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "last_synced_at" timestamp with time zone
);


create table "stripe"."invoices" (
    "id" text not null,
    "object" text,
    "auto_advance" boolean,
    "collection_method" text,
    "currency" text,
    "description" text,
    "hosted_invoice_url" text,
    "lines" jsonb,
    "metadata" jsonb,
    "period_end" integer,
    "period_start" integer,
    "status" stripe.invoice_status,
    "total" bigint,
    "account_country" text,
    "account_name" text,
    "account_tax_ids" jsonb,
    "amount_due" bigint,
    "amount_paid" bigint,
    "amount_remaining" bigint,
    "application_fee_amount" bigint,
    "attempt_count" integer,
    "attempted" boolean,
    "billing_reason" text,
    "created" integer,
    "custom_fields" jsonb,
    "customer_address" jsonb,
    "customer_email" text,
    "customer_name" text,
    "customer_phone" text,
    "customer_shipping" jsonb,
    "customer_tax_exempt" text,
    "customer_tax_ids" jsonb,
    "default_tax_rates" jsonb,
    "discount" jsonb,
    "discounts" jsonb,
    "due_date" integer,
    "ending_balance" integer,
    "footer" text,
    "invoice_pdf" text,
    "last_finalization_error" jsonb,
    "livemode" boolean,
    "next_payment_attempt" integer,
    "number" text,
    "paid" boolean,
    "payment_settings" jsonb,
    "post_payment_credit_notes_amount" integer,
    "pre_payment_credit_notes_amount" integer,
    "receipt_number" text,
    "starting_balance" integer,
    "statement_descriptor" text,
    "status_transitions" jsonb,
    "subtotal" integer,
    "tax" integer,
    "total_discount_amounts" jsonb,
    "total_tax_amounts" jsonb,
    "transfer_data" jsonb,
    "webhooks_delivered_at" integer,
    "customer" text,
    "subscription" text,
    "payment_intent" text,
    "default_payment_method" text,
    "default_source" text,
    "on_behalf_of" text,
    "charge" text,
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "last_synced_at" timestamp with time zone
);


create table "stripe"."migrations" (
    "id" integer not null,
    "name" character varying(100) not null,
    "hash" character varying(40) not null,
    "executed_at" timestamp without time zone default CURRENT_TIMESTAMP
);


create table "stripe"."payment_intents" (
    "id" text not null,
    "object" text,
    "amount" integer,
    "amount_capturable" integer,
    "amount_details" jsonb,
    "amount_received" integer,
    "application" text,
    "application_fee_amount" integer,
    "automatic_payment_methods" text,
    "canceled_at" integer,
    "cancellation_reason" text,
    "capture_method" text,
    "client_secret" text,
    "confirmation_method" text,
    "created" integer,
    "currency" text,
    "customer" text,
    "description" text,
    "invoice" text,
    "last_payment_error" text,
    "livemode" boolean,
    "metadata" jsonb,
    "next_action" text,
    "on_behalf_of" text,
    "payment_method" text,
    "payment_method_options" jsonb,
    "payment_method_types" jsonb,
    "processing" text,
    "receipt_email" text,
    "review" text,
    "setup_future_usage" text,
    "shipping" jsonb,
    "statement_descriptor" text,
    "statement_descriptor_suffix" text,
    "status" text,
    "transfer_data" jsonb,
    "transfer_group" text,
    "last_synced_at" timestamp with time zone
);


create table "stripe"."payment_methods" (
    "id" text not null,
    "object" text,
    "created" integer,
    "customer" text,
    "type" text,
    "billing_details" jsonb,
    "metadata" jsonb,
    "card" jsonb,
    "last_synced_at" timestamp with time zone
);


create table "stripe"."payouts" (
    "id" text not null,
    "object" text,
    "date" text,
    "type" text,
    "amount" bigint,
    "method" text,
    "status" text,
    "created" integer,
    "updated" integer,
    "currency" text,
    "livemode" boolean,
    "metadata" jsonb,
    "automatic" boolean,
    "recipient" text,
    "description" text,
    "destination" text,
    "source_type" text,
    "arrival_date" text,
    "bank_account" jsonb,
    "failure_code" text,
    "transfer_group" text,
    "amount_reversed" bigint,
    "failure_message" text,
    "source_transaction" text,
    "balance_transaction" text,
    "statement_descriptor" text,
    "statement_description" text,
    "failure_balance_transaction" text,
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "last_synced_at" timestamp with time zone
);


create table "stripe"."plans" (
    "id" text not null,
    "object" text,
    "active" boolean,
    "amount" bigint,
    "created" integer,
    "product" text,
    "currency" text,
    "interval" text,
    "livemode" boolean,
    "metadata" jsonb,
    "nickname" text,
    "tiers_mode" text,
    "usage_type" text,
    "billing_scheme" text,
    "interval_count" bigint,
    "aggregate_usage" text,
    "transform_usage" text,
    "trial_period_days" bigint,
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "last_synced_at" timestamp with time zone
);


create table "stripe"."prices" (
    "id" text not null,
    "object" text,
    "active" boolean,
    "currency" text,
    "metadata" jsonb,
    "nickname" text,
    "recurring" jsonb,
    "type" stripe.pricing_type,
    "unit_amount" integer,
    "billing_scheme" text,
    "created" integer,
    "livemode" boolean,
    "lookup_key" text,
    "tiers_mode" stripe.pricing_tiers,
    "transform_quantity" jsonb,
    "unit_amount_decimal" text,
    "product" text,
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "last_synced_at" timestamp with time zone
);


create table "stripe"."products" (
    "id" text not null,
    "object" text,
    "active" boolean,
    "description" text,
    "metadata" jsonb,
    "name" text,
    "created" integer,
    "images" jsonb,
    "livemode" boolean,
    "package_dimensions" jsonb,
    "shippable" boolean,
    "statement_descriptor" text,
    "unit_label" text,
    "updated" integer,
    "url" text,
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "marketing_features" jsonb,
    "default_price" text,
    "last_synced_at" timestamp with time zone
);


create table "stripe"."refunds" (
    "id" text not null,
    "object" text,
    "amount" integer,
    "balance_transaction" text,
    "charge" text,
    "created" integer,
    "currency" text,
    "destination_details" jsonb,
    "metadata" jsonb,
    "payment_intent" text,
    "reason" text,
    "receipt_number" text,
    "source_transfer_reversal" text,
    "status" text,
    "transfer_reversal" text,
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "last_synced_at" timestamp with time zone
);


create table "stripe"."reviews" (
    "id" text not null,
    "object" text,
    "billing_zip" text,
    "charge" text,
    "created" integer,
    "closed_reason" text,
    "livemode" boolean,
    "ip_address" text,
    "ip_address_location" jsonb,
    "open" boolean,
    "opened_reason" text,
    "payment_intent" text,
    "reason" text,
    "session" text,
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "last_synced_at" timestamp with time zone
);


create table "stripe"."setup_intents" (
    "id" text not null,
    "object" text,
    "created" integer,
    "customer" text,
    "description" text,
    "payment_method" text,
    "status" text,
    "usage" text,
    "cancellation_reason" text,
    "latest_attempt" text,
    "mandate" text,
    "single_use_mandate" text,
    "on_behalf_of" text,
    "last_synced_at" timestamp with time zone
);


create table "stripe"."subscription_items" (
    "id" text not null,
    "object" text,
    "billing_thresholds" jsonb,
    "created" integer,
    "deleted" boolean,
    "metadata" jsonb,
    "quantity" integer,
    "price" text,
    "subscription" text,
    "tax_rates" jsonb,
    "current_period_end" integer,
    "current_period_start" integer,
    "last_synced_at" timestamp with time zone
);


create table "stripe"."subscription_schedules" (
    "id" text not null,
    "object" text,
    "application" text,
    "canceled_at" integer,
    "completed_at" integer,
    "created" integer not null,
    "current_phase" jsonb,
    "customer" text not null,
    "default_settings" jsonb,
    "end_behavior" text,
    "livemode" boolean not null,
    "metadata" jsonb not null,
    "phases" jsonb not null,
    "released_at" integer,
    "released_subscription" text,
    "status" stripe.subscription_schedule_status not null,
    "subscription" text,
    "test_clock" text,
    "last_synced_at" timestamp with time zone
);


create table "stripe"."subscriptions" (
    "id" text not null,
    "object" text,
    "cancel_at_period_end" boolean,
    "current_period_end" integer,
    "current_period_start" integer,
    "default_payment_method" text,
    "items" jsonb,
    "metadata" jsonb,
    "pending_setup_intent" text,
    "pending_update" jsonb,
    "status" stripe.subscription_status,
    "application_fee_percent" double precision,
    "billing_cycle_anchor" integer,
    "billing_thresholds" jsonb,
    "cancel_at" integer,
    "canceled_at" integer,
    "collection_method" text,
    "created" integer,
    "days_until_due" integer,
    "default_source" text,
    "default_tax_rates" jsonb,
    "discount" jsonb,
    "ended_at" integer,
    "livemode" boolean,
    "next_pending_invoice_item_invoice" integer,
    "pause_collection" jsonb,
    "pending_invoice_item_interval" jsonb,
    "start_date" integer,
    "transfer_data" jsonb,
    "trial_end" jsonb,
    "trial_start" jsonb,
    "schedule" text,
    "customer" text,
    "latest_invoice" text,
    "plan" text,
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "last_synced_at" timestamp with time zone
);


create table "stripe"."tax_ids" (
    "id" text not null,
    "object" text,
    "country" text,
    "customer" text,
    "type" text,
    "value" text,
    "created" integer not null,
    "livemode" boolean,
    "owner" jsonb,
    "last_synced_at" timestamp with time zone
);


CREATE UNIQUE INDEX charges_pkey ON stripe.charges USING btree (id);

CREATE UNIQUE INDEX coupons_pkey ON stripe.coupons USING btree (id);

CREATE UNIQUE INDEX credit_notes_pkey ON stripe.credit_notes USING btree (id);

CREATE UNIQUE INDEX customers_pkey ON stripe.customers USING btree (id);

CREATE UNIQUE INDEX disputes_pkey ON stripe.disputes USING btree (id);

CREATE UNIQUE INDEX early_fraud_warnings_pkey ON stripe.early_fraud_warnings USING btree (id);

CREATE UNIQUE INDEX events_pkey ON stripe.events USING btree (id);

CREATE UNIQUE INDEX invoices_pkey ON stripe.invoices USING btree (id);

CREATE UNIQUE INDEX migrations_name_key ON stripe.migrations USING btree (name);

CREATE UNIQUE INDEX migrations_pkey ON stripe.migrations USING btree (id);

CREATE UNIQUE INDEX payment_intents_pkey ON stripe.payment_intents USING btree (id);

CREATE UNIQUE INDEX payment_methods_pkey ON stripe.payment_methods USING btree (id);

CREATE UNIQUE INDEX payouts_pkey ON stripe.payouts USING btree (id);

CREATE UNIQUE INDEX plans_pkey ON stripe.plans USING btree (id);

CREATE UNIQUE INDEX prices_pkey ON stripe.prices USING btree (id);

CREATE UNIQUE INDEX products_pkey ON stripe.products USING btree (id);

CREATE UNIQUE INDEX refunds_pkey ON stripe.refunds USING btree (id);

CREATE UNIQUE INDEX reviews_pkey ON stripe.reviews USING btree (id);

CREATE UNIQUE INDEX setup_intents_pkey ON stripe.setup_intents USING btree (id);

CREATE INDEX stripe_credit_notes_customer_idx ON stripe.credit_notes USING btree (customer);

CREATE INDEX stripe_credit_notes_invoice_idx ON stripe.credit_notes USING btree (invoice);

CREATE INDEX stripe_dispute_created_idx ON stripe.disputes USING btree (created);

CREATE INDEX stripe_early_fraud_warnings_charge_idx ON stripe.early_fraud_warnings USING btree (charge);

CREATE INDEX stripe_early_fraud_warnings_payment_intent_idx ON stripe.early_fraud_warnings USING btree (payment_intent);

CREATE INDEX stripe_invoices_customer_idx ON stripe.invoices USING btree (customer);

CREATE INDEX stripe_invoices_subscription_idx ON stripe.invoices USING btree (subscription);

CREATE INDEX stripe_payment_intents_customer_idx ON stripe.payment_intents USING btree (customer);

CREATE INDEX stripe_payment_intents_invoice_idx ON stripe.payment_intents USING btree (invoice);

CREATE INDEX stripe_payment_methods_customer_idx ON stripe.payment_methods USING btree (customer);

CREATE INDEX stripe_refunds_charge_idx ON stripe.refunds USING btree (charge);

CREATE INDEX stripe_refunds_payment_intent_idx ON stripe.refunds USING btree (payment_intent);

CREATE INDEX stripe_reviews_charge_idx ON stripe.reviews USING btree (charge);

CREATE INDEX stripe_reviews_payment_intent_idx ON stripe.reviews USING btree (payment_intent);

CREATE INDEX stripe_setup_intents_customer_idx ON stripe.setup_intents USING btree (customer);

CREATE INDEX stripe_tax_ids_customer_idx ON stripe.tax_ids USING btree (customer);

CREATE UNIQUE INDEX subscription_items_pkey ON stripe.subscription_items USING btree (id);

CREATE UNIQUE INDEX subscription_schedules_pkey ON stripe.subscription_schedules USING btree (id);

CREATE UNIQUE INDEX subscriptions_pkey ON stripe.subscriptions USING btree (id);

CREATE UNIQUE INDEX tax_ids_pkey ON stripe.tax_ids USING btree (id);

alter table "stripe"."charges" add constraint "charges_pkey" PRIMARY KEY using index "charges_pkey";

alter table "stripe"."coupons" add constraint "coupons_pkey" PRIMARY KEY using index "coupons_pkey";

alter table "stripe"."credit_notes" add constraint "credit_notes_pkey" PRIMARY KEY using index "credit_notes_pkey";

alter table "stripe"."customers" add constraint "customers_pkey" PRIMARY KEY using index "customers_pkey";

alter table "stripe"."disputes" add constraint "disputes_pkey" PRIMARY KEY using index "disputes_pkey";

alter table "stripe"."early_fraud_warnings" add constraint "early_fraud_warnings_pkey" PRIMARY KEY using index "early_fraud_warnings_pkey";

alter table "stripe"."events" add constraint "events_pkey" PRIMARY KEY using index "events_pkey";

alter table "stripe"."invoices" add constraint "invoices_pkey" PRIMARY KEY using index "invoices_pkey";

alter table "stripe"."migrations" add constraint "migrations_pkey" PRIMARY KEY using index "migrations_pkey";

alter table "stripe"."payment_intents" add constraint "payment_intents_pkey" PRIMARY KEY using index "payment_intents_pkey";

alter table "stripe"."payment_methods" add constraint "payment_methods_pkey" PRIMARY KEY using index "payment_methods_pkey";

alter table "stripe"."payouts" add constraint "payouts_pkey" PRIMARY KEY using index "payouts_pkey";

alter table "stripe"."plans" add constraint "plans_pkey" PRIMARY KEY using index "plans_pkey";

alter table "stripe"."prices" add constraint "prices_pkey" PRIMARY KEY using index "prices_pkey";

alter table "stripe"."products" add constraint "products_pkey" PRIMARY KEY using index "products_pkey";

alter table "stripe"."refunds" add constraint "refunds_pkey" PRIMARY KEY using index "refunds_pkey";

alter table "stripe"."reviews" add constraint "reviews_pkey" PRIMARY KEY using index "reviews_pkey";

alter table "stripe"."setup_intents" add constraint "setup_intents_pkey" PRIMARY KEY using index "setup_intents_pkey";

alter table "stripe"."subscription_items" add constraint "subscription_items_pkey" PRIMARY KEY using index "subscription_items_pkey";

alter table "stripe"."subscription_schedules" add constraint "subscription_schedules_pkey" PRIMARY KEY using index "subscription_schedules_pkey";

alter table "stripe"."subscriptions" add constraint "subscriptions_pkey" PRIMARY KEY using index "subscriptions_pkey";

alter table "stripe"."tax_ids" add constraint "tax_ids_pkey" PRIMARY KEY using index "tax_ids_pkey";

alter table "stripe"."migrations" add constraint "migrations_name_key" UNIQUE using index "migrations_name_key";

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON stripe.charges FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON stripe.coupons FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON stripe.customers FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON stripe.disputes FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON stripe.early_fraud_warnings FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON stripe.events FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON stripe.invoices FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON stripe.payouts FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON stripe.plans FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON stripe.prices FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON stripe.products FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON stripe.refunds FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON stripe.reviews FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON stripe.subscriptions FOR EACH ROW EXECUTE FUNCTION set_updated_at();


