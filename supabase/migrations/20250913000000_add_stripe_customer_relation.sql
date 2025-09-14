-- Add stripe_customer_id to users table to link with Stripe customers
ALTER TABLE public.users 
ADD COLUMN stripe_customer_id TEXT;

-- Add index for better query performance
CREATE INDEX idx_users_stripe_customer_id ON public.users(stripe_customer_id);

-- Add foreign key constraint to stripe.customers (optional, but recommended)
-- Note: This assumes your Stripe data is properly synced
-- ALTER TABLE public.users 
-- ADD CONSTRAINT fk_users_stripe_customer 
-- FOREIGN KEY (stripe_customer_id) REFERENCES stripe.customers(id);
