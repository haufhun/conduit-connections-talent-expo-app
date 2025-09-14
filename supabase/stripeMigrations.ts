// This is a script to run the Stripe migrations using the stripe-sync-engine package.
// You can run this script with `ts-node supabase/stripeMigrations.ts`
// Make sure to have your DATABASE_URL set in the environment variables.
// There is no need to run this right now, as the Stripe migrations have been created
// Should only need to run this if the Stripe migrations are updated.

import { runMigrations } from "@supabase/stripe-sync-engine";

const doTheThing = async () => {
  await runMigrations({
    databaseUrl: "postgresql://postgres:postgres@127.0.0.1:54322/postgres", // your connection string
    schema: "stripe", // optional, defaults to 'stripe'
    logger: console, // optional, logs migration output
  });
};

doTheThing()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => {
    console.log("done");
    process.exit(0);
  });
