import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CHECK-EXPIRING-PROMOTIONS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get promotions expiring in the next 3 days
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    const oneDayFromNow = new Date();
    oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);

    logStep("Checking for expiring promotions", { 
      threeDaysFromNow: threeDaysFromNow.toISOString(),
      oneDayFromNow: oneDayFromNow.toISOString()
    });

    // Get active promotions expiring within 3 days
    const { data: expiringPromotions, error: promotionsError } = await supabase
      .from("property_promotions")
      .select(`
        id,
        property_id,
        owner_id,
        promotion_type,
        end_date
      `)
      .eq("is_active", true)
      .lte("end_date", threeDaysFromNow.toISOString())
      .gte("end_date", new Date().toISOString());

    if (promotionsError) {
      logStep("Error fetching promotions", { error: promotionsError.message });
      throw promotionsError;
    }

    logStep("Found expiring promotions", { count: expiringPromotions?.length || 0 });

    const notificationsSent: string[] = [];

    for (const promo of expiringPromotions || []) {
      const endDate = new Date(promo.end_date);
      const now = new Date();
      const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      // Fetch property title
      const { data: propertyData } = await supabase
        .from("properties")
        .select("title")
        .eq("id", promo.property_id)
        .single();
      
      // Check if notification already sent for this promotion today
      const today = new Date().toISOString().split('T')[0];
      const { data: existingNotification } = await supabase
        .from("notifications")
        .select("id")
        .eq("user_id", promo.owner_id)
        .like("message", `%${promo.id}%`)
        .gte("created_at", today)
        .single();

      if (existingNotification) {
        logStep("Notification already sent today for promotion", { promotionId: promo.id });
        continue;
      }

      const propertyTitle = propertyData?.title || "العقار";
      const promotionTypes: Record<string, { ar: string; en: string; fr: string }> = {
        featured: { ar: "مميز", en: "Featured", fr: "En vedette" },
        video_ad: { ar: "إعلان فيديو", en: "Video Ad", fr: "Pub Vidéo" },
        banner: { ar: "بانر", en: "Banner", fr: "Bannière" },
        homepage: { ar: "الصفحة الرئيسية", en: "Homepage", fr: "Page d'accueil" },
      };

      const promoType = promotionTypes[promo.promotion_type] || { ar: promo.promotion_type, en: promo.promotion_type, fr: promo.promotion_type };

      let title: string;
      let message: string;

      if (daysRemaining <= 1) {
        title = `⚠️ إعلانك ينتهي غداً`;
        message = `إعلان "${promoType.ar}" للعقار "${propertyTitle}" سينتهي غداً. قم بتجديده للحفاظ على ظهور عقارك. [${promo.id}]`;
      } else {
        title = `🔔 تنبيه انتهاء الإعلان`;
        message = `إعلان "${promoType.ar}" للعقار "${propertyTitle}" سينتهي خلال ${daysRemaining} أيام. [${promo.id}]`;
      }

      // Create notification
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert({
          user_id: promo.owner_id,
          title,
          message,
          type: "promotion_expiring",
          link: `/my-properties`,
        });

      if (notificationError) {
        logStep("Error creating notification", { error: notificationError.message, promotionId: promo.id });
      } else {
        logStep("Notification sent", { promotionId: promo.id, ownerId: promo.owner_id, daysRemaining });
        notificationsSent.push(promo.id);
      }
    }

    logStep("Function completed", { notificationsSent: notificationsSent.length });

    return new Response(
      JSON.stringify({
        success: true,
        promotionsChecked: expiringPromotions?.length || 0,
        notificationsSent: notificationsSent.length,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    logStep("Error in function", { error: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
