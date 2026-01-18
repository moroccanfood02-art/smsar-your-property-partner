import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[AUTO-RENEW] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting auto-renewal check");
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get current date
    const now = new Date();
    const today = now.toISOString();

    // Find promotions that ended today or yesterday and are marked for auto-renewal
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    // Get expired promotions that were active
    const { data: expiredPromotions, error: fetchError } = await supabase
      .from("property_promotions")
      .select(`
        *,
        properties:property_id (
          title,
          owner_id
        )
      `)
      .eq("is_active", true)
      .lt("end_date", today);

    if (fetchError) {
      logStep("Error fetching promotions", fetchError);
      throw fetchError;
    }

    logStep("Found expired promotions", { count: expiredPromotions?.length || 0 });

    let renewedCount = 0;
    let notificationsCount = 0;

    for (const promo of expiredPromotions || []) {
      // Calculate original duration
      const startDate = new Date(promo.start_date);
      const endDate = new Date(promo.end_date);
      const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));

      // Check if this promotion should be auto-renewed based on owner preferences
      // For now, we'll send a notification asking the owner if they want to renew
      
      // Mark promotion as inactive
      await supabase
        .from("property_promotions")
        .update({ is_active: false })
        .eq("id", promo.id);

      // Send notification to owner about expired promotion with renewal option
      const propertyTitle = (promo.properties as any)?.title || "عقار غير معروف";
      const ownerId = promo.owner_id;

      // Check if we already sent a renewal notification today
      const { data: existingNotification } = await supabase
        .from("notifications")
        .select("id")
        .eq("user_id", ownerId)
        .eq("type", "promotion_renewal")
        .gte("created_at", yesterday.toISOString())
        .ilike("message", `%${promo.id}%`)
        .maybeSingle();

      if (!existingNotification) {
        await supabase.from("notifications").insert({
          user_id: ownerId,
          title: "انتهى إعلانك - هل تريد التجديد؟",
          message: `انتهى إعلان عقارك "${propertyTitle}". كان لمدة ${durationDays} يوم بقيمة ${promo.amount_paid}$. يمكنك تجديده من لوحة التحكم.`,
          type: "promotion_renewal",
          link: `/my-properties`,
        });
        notificationsCount++;
      }

      logStep("Processed expired promotion", { 
        promoId: promo.id, 
        propertyTitle,
        durationDays,
        amount: promo.amount_paid 
      });
    }

    logStep("Auto-renewal check completed", { 
      expiredPromotions: expiredPromotions?.length || 0,
      renewedCount,
      notificationsCount 
    });

    return new Response(
      JSON.stringify({
        success: true,
        expiredPromotions: expiredPromotions?.length || 0,
        renewedCount,
        notificationsCount,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    logStep("Error in auto-renew function", { error: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
