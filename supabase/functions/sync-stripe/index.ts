import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { StripeSync } from "npm:@supabase/stripe-sync-engine@0.39.0";

// Load secrets from environment variables
const databaseUrl = Deno.env.get("DATABASE_URL")!;
const stripeWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY")!;

// Initialize StripeSync
const stripeSync = new StripeSync({
  databaseUrl,
  stripeWebhookSecret,
  stripeSecretKey,
  backfillRelatedEntities: false,
  autoExpandLists: true,
  stripeApiVersion: "2025-08-27.basil",
});

console.log("StripeSync initialized.");

Deno.serve(async (req) => {
  // Extract raw body as Uint8Array (buffer)
  console.log("Received request:", req.method, req.url);
  const rawBody = new Uint8Array(await req.arrayBuffer());

  console.log("Raw body length:", rawBody.length);
  const stripeSignature = req.headers.get("stripe-signature");

  console.log("Stripe signature:", stripeSignature);
  await stripeSync.processWebhook(rawBody, stripeSignature);

  console.log("Webhook processed successfully.");
  return new Response(null, {
    status: 202,
    headers: { "Content-Type": "application/json" },
  });
});
