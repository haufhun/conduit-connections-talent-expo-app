-- Create views in public schema to expose Stripe subscription data

-- View for current user subscription status
CREATE OR REPLACE VIEW public.user_subscriptions AS
SELECT 
  u.id as user_id,
  u.email,
  u.stripe_customer_id,
  s.id as subscription_id,
  s.status as subscription_status,
  s.current_period_start,
  s.current_period_end,
  s.cancel_at_period_end,
  s.canceled_at,
  s.trial_start,
  s.trial_end,
  s.created,
  p.id as plan_id,
  p.nickname as plan_name,
  p.amount as plan_amount,
  p.currency as plan_currency,
  p.interval as plan_interval,
  pr.id as product_id,
  pr.name as product_name,
  pr.description as product_description,
  -- Helper fields for easier querying
  CASE 
    WHEN s.status IN ('active', 'trialing') AND s.current_period_end > EXTRACT(EPOCH FROM NOW()) THEN true
    ELSE false
  END as is_active_subscription,
  CASE 
    WHEN s.status = 'trialing' THEN true
    ELSE false
  END as is_trial,
  CASE 
    WHEN s.current_period_end <= EXTRACT(EPOCH FROM NOW()) AND s.status != 'canceled' THEN true
    ELSE false
  END as is_past_due
FROM public.users u
LEFT JOIN stripe.customers c ON u.stripe_customer_id = c.id
LEFT JOIN stripe.subscriptions s ON c.id = s.customer
LEFT JOIN stripe.plans p ON s.plan = p.id
LEFT JOIN stripe.products pr ON p.product = pr.id
WHERE u.stripe_customer_id IS NOT NULL;

-- View for available subscription products and prices
CREATE OR REPLACE VIEW public.subscription_products AS
SELECT 
  pr.id as product_id,
  pr.name as product_name,
  pr.description as product_description,
  pr.active as product_active,
  pr.images,
  pr.metadata as product_metadata,
  p.id as price_id,
  p.nickname as price_nickname,
  p.unit_amount,
  p.currency,
  p.type as pricing_type,
  p.recurring,
  p.active as price_active,
  p.metadata as price_metadata,
  -- Extract billing interval from recurring jsonb
  CASE 
    WHEN p.recurring IS NOT NULL THEN p.recurring->>'interval'
    ELSE null
  END as billing_interval,
  CASE 
    WHEN p.recurring IS NOT NULL THEN (p.recurring->>'interval_count')::integer
    ELSE null
  END as billing_interval_count
FROM stripe.products pr
JOIN stripe.prices p ON pr.id = p.product
WHERE pr.active = true 
  AND p.active = true
  AND p.type = 'recurring'  -- Only show recurring prices for subscriptions
ORDER BY pr.name, p.unit_amount;

-- View for user's current subscription details with product info
CREATE OR REPLACE VIEW public.user_subscription_details AS
SELECT 
  us.*,
  -- Additional subscription item details from the items jsonb field
  CASE 
    WHEN s.items IS NOT NULL THEN s.items
    ELSE '[]'::jsonb
  END as subscription_items,
  -- Payment method info
  pm.id as payment_method_id,
  pm.type as payment_method_type,
  pm.card as payment_method_card_details
FROM public.user_subscriptions us
LEFT JOIN stripe.subscriptions s ON us.subscription_id = s.id
LEFT JOIN stripe.payment_methods pm ON s.default_payment_method = pm.id;

-- View for user's subscription invoices (last 12 months)
CREATE OR REPLACE VIEW public.user_subscription_invoices AS
SELECT 
  u.id as user_id,
  i.id as invoice_id,
  i.status as invoice_status,
  i.amount_due,
  i.amount_paid,
  i.currency,
  i.created,
  i.due_date,
  i.hosted_invoice_url,
  i.invoice_pdf,
  i.paid,
  i.period_start,
  i.period_end,
  i.subscription as subscription_id,
  i.total
FROM public.users u
JOIN stripe.customers c ON u.stripe_customer_id = c.id
JOIN stripe.invoices i ON c.id = i.customer
WHERE i.created > EXTRACT(EPOCH FROM (NOW() - INTERVAL '12 months'))
ORDER BY i.created DESC;

-- Set up Row Level Security for the Stripe tables
-- Views will inherit security through the underlying table policies

-- Enable RLS on Stripe tables that contain sensitive data
ALTER TABLE stripe.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe.payment_methods ENABLE ROW LEVEL SECURITY;

-- RLS Policy for stripe.customers - users can only see their own customer record
CREATE POLICY "Users can view their own stripe customer" ON stripe.customers
FOR SELECT TO authenticated
USING (
  id IN (
    SELECT stripe_customer_id 
    FROM public.users 
    WHERE id = auth.uid() AND stripe_customer_id IS NOT NULL
  )
);

-- RLS Policy for stripe.subscriptions - users can only see their own subscriptions
CREATE POLICY "Users can view their own stripe subscriptions" ON stripe.subscriptions
FOR SELECT TO authenticated
USING (
  customer IN (
    SELECT stripe_customer_id 
    FROM public.users 
    WHERE id = auth.uid() AND stripe_customer_id IS NOT NULL
  )
);

-- RLS Policy for stripe.invoices - users can only see their own invoices
CREATE POLICY "Users can view their own stripe invoices" ON stripe.invoices
FOR SELECT TO authenticated
USING (
  customer IN (
    SELECT stripe_customer_id 
    FROM public.users 
    WHERE id = auth.uid() AND stripe_customer_id IS NOT NULL
  )
);

-- RLS Policy for stripe.payment_methods - users can only see their own payment methods
CREATE POLICY "Users can view their own stripe payment methods" ON stripe.payment_methods
FOR SELECT TO authenticated
USING (
  customer IN (
    SELECT stripe_customer_id 
    FROM public.users 
    WHERE id = auth.uid() AND stripe_customer_id IS NOT NULL
  )
);

-- RLS Policies for stripe.products and stripe.prices - all authenticated users can view
-- These are public product catalog data
ALTER TABLE stripe.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe.prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe.plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view stripe products" ON stripe.products
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Authenticated users can view stripe prices" ON stripe.prices
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Authenticated users can view stripe plans" ON stripe.plans
FOR SELECT TO authenticated
USING (true);
