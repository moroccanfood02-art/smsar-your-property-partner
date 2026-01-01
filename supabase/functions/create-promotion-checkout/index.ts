import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Promotion types with their Stripe price IDs
const PROMOTION_PRICES = {
  featured_7: {
    price_id: "price_1SktMLJApEwoLmdCxhdcxzuw",
    product_id: "prod_TiK0sN3616wGRP",
    amount: 99,
    days: 7,
    type: "featured"
  },
  video_14: {
    price_id: "price_1SktMhJApEwoLmdC51TjwFzo",
    product_id: "prod_TiK029mgWldGyj",
    amount: 199,
    days: 14,
    type: "video"
  },
  banner_30: {
    price_id: "price_1SktMzJApEwoLmdCij60FlJ9",
    product_id: "prod_TiK19Xk08KbRqo",
    amount: 499,
    days: 30,
    type: "banner"
  }
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-PROMOTION-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    const { promotionType, propertyId, videoUrl, bannerImageUrl } = await req.json();
    
    if (!promotionType || !propertyId) {
      throw new Error("Promotion type and property ID are required");
    }
    
    const promotion = PROMOTION_PRICES[promotionType as keyof typeof PROMOTION_PRICES];
    if (!promotion) {
      throw new Error("Invalid promotion type");
    }
    
    logStep("Promotion request received", { promotionType, propertyId });

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { email: user.email });

    // Verify the user owns this property
    const { data: property, error: propertyError } = await supabaseClient
      .from('properties')
      .select('id, owner_id, title')
      .eq('id', propertyId)
      .single();
    
    if (propertyError || !property) {
      throw new Error("Property not found");
    }
    
    if (property.owner_id !== user.id) {
      throw new Error("You can only promote your own properties");
    }
    
    logStep("Property verified", { propertyId, title: property.title });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: promotion.price_id,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/my-properties?promotion=success`,
      cancel_url: `${req.headers.get("origin")}/my-properties?promotion=cancelled`,
      metadata: {
        user_id: user.id,
        property_id: propertyId,
        promotion_type: promotion.type,
        days: String(promotion.days),
        video_url: videoUrl || "",
        banner_image_url: bannerImageUrl || ""
      },
    });

    logStep("Checkout session created", { sessionId: session.id });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
