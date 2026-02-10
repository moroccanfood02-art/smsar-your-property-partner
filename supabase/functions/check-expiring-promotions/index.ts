import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  console.log(`[CHECK-EXPIRING-PROMOTIONS] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const { data: expiringPromotions, error: promotionsError } = await supabase
      .from("property_promotions")
      .select("id, property_id, owner_id, promotion_type, end_date")
      .eq("is_active", true)
      .lte("end_date", threeDaysFromNow.toISOString())
      .gte("end_date", new Date().toISOString());

    if (promotionsError) throw promotionsError;

    logStep("Found expiring promotions", { count: expiringPromotions?.length || 0 });

    const notificationsSent: string[] = [];

    for (const promo of expiringPromotions || []) {
      const endDate = new Date(promo.end_date);
      const daysRemaining = Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

      const { data: propertyData } = await supabase
        .from("properties")
        .select("title")
        .eq("id", promo.property_id)
        .single();

      // Check if notification already sent today
      const today = new Date().toISOString().split('T')[0];
      const { data: existing } = await supabase
        .from("notifications")
        .select("id")
        .eq("user_id", promo.owner_id)
        .like("message", `%${promo.id}%`)
        .gte("created_at", today)
        .single();

      if (existing) continue;

      const propertyTitle = propertyData?.title || "العقار";
      const promotionTypes: Record<string, string> = {
        featured: "مميز", video_ad: "إعلان فيديو", banner: "بانر", homepage: "الصفحة الرئيسية",
      };
      const promoType = promotionTypes[promo.promotion_type] || promo.promotion_type;

      const title = daysRemaining <= 1 ? `⚠️ إعلانك ينتهي غداً` : `🔔 تنبيه انتهاء الإعلان`;
      const message = daysRemaining <= 1
        ? `إعلان "${promoType}" للعقار "${propertyTitle}" سينتهي غداً. قم بتجديده للحفاظ على ظهور عقارك. [${promo.id}]`
        : `إعلان "${promoType}" للعقار "${propertyTitle}" سينتهي خلال ${daysRemaining} أيام. [${promo.id}]`;

      // Create in-app notification
      await supabase.from("notifications").insert({
        user_id: promo.owner_id,
        title,
        message,
        type: "promotion_expiring",
        link: `/my-properties`,
      });

      // Send email notification
      if (resendApiKey) {
        try {
          const { data: userData } = await supabase.auth.admin.getUserById(promo.owner_id);
          if (userData?.user?.email) {
            const resend = new Resend(resendApiKey);
            await resend.emails.send({
              from: "SMSAR <onboarding@resend.dev>",
              to: [userData.user.email],
              subject: title,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <div style="text-align: center; margin-bottom: 24px;">
                    <div style="display: inline-block; background: linear-gradient(135deg, #f59e0b, #eab308); color: white; font-size: 24px; font-weight: bold; padding: 12px 24px; border-radius: 12px;">SMSAR</div>
                  </div>
                  <h2 style="color: #f59e0b; text-align: center;">${title}</h2>
                  <p style="font-size: 16px; text-align: center; direction: rtl;">${message.replace(`[${promo.id}]`, '')}</p>
                  <div style="text-align: center; margin-top: 24px;">
                    <a href="https://my-property-match.lovable.app/my-properties" style="background: linear-gradient(135deg, #f59e0b, #eab308); color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">تجديد الإعلان</a>
                  </div>
                  <p style="font-size: 12px; color: #999; text-align: center; margin-top: 24px;">© 2024 SMSAR</p>
                </div>
              `,
            });
            logStep("Email sent", { email: userData.user.email, promoId: promo.id });
          }
        } catch (emailErr: any) {
          logStep("Email error", { error: emailErr.message });
        }
      }

      notificationsSent.push(promo.id);
    }

    logStep("Function completed", { notificationsSent: notificationsSent.length });

    return new Response(
      JSON.stringify({ success: true, promotionsChecked: expiringPromotions?.length || 0, notificationsSent: notificationsSent.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: any) {
    logStep("Error", { error: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
