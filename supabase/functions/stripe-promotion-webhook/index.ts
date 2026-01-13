import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-PROMOTION-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
  
  // If no Stripe key, return early with a message
  if (!stripeSecretKey) {
    logStep("Stripe key not configured - webhook disabled");
    return new Response(
      JSON.stringify({ message: "Stripe not configured" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2025-08-27.basil",
  });

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    
    // For now, process without signature verification
    // TODO: Add webhook secret for production
    const event = JSON.parse(body);
    
    logStep("Received event", { type: event.type });

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const metadata = session.metadata;

      if (metadata?.property_id && metadata?.promotion_type) {
        logStep("Processing promotion payment", { 
          propertyId: metadata.property_id,
          promotionType: metadata.promotion_type 
        });

        const days = parseInt(metadata.days) || 7;
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + days);

        // Create the promotion record
        const { error: insertError } = await supabaseAdmin
          .from('property_promotions')
          .insert({
            property_id: metadata.property_id,
            owner_id: metadata.user_id,
            promotion_type: metadata.promotion_type,
            amount_paid: session.amount_total / 100,
            end_date: endDate.toISOString(),
            is_active: true,
            video_url: metadata.video_url || null,
            banner_image_url: metadata.banner_image_url || null,
          });

        if (insertError) {
          logStep("Error creating promotion", { error: insertError.message });
          throw insertError;
        }

        // If it's a featured promotion, also update the property
        if (metadata.promotion_type === 'featured') {
          await supabaseAdmin
            .from('properties')
            .update({ featured: true })
            .eq('id', metadata.property_id);
        }

        // Create notification for the user
        await supabaseAdmin
          .from('notifications')
          .insert({
            user_id: metadata.user_id,
            title: 'تم تفعيل الإعلان',
            message: `تم تفعيل إعلانك بنجاح وسيستمر لمدة ${days} يوم`,
            type: 'payment',
            link: '/my-properties',
          });

        logStep("Promotion created successfully");
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
