import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  appInfo: {
    name: "Threadline Supply",
    version: "1.0.0",
  },
});
