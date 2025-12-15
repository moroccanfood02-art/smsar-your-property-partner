import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Commission rates in USD
const COMMISSION_RATES = {
  daily_rent: 3,      // $3 per daily rent
  monthly_rent: 5,    // $5 per monthly rent
  permanent_rent: 10, // $10 per permanent rent
  sale: {             // Based on property area
    min: 50,          // $50 minimum for small properties
    max: 100,         // $100 for large properties (>200m²)
    threshold: 200    // Area threshold in m²
  }
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-TRANSACTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw userError;
    
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    // Check if user is admin
    const { data: roleData } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!roleData || roleData.role !== 'admin') {
      throw new Error("Only admins can create transactions");
    }

    const { property_id, transaction_type, transaction_amount } = await req.json();

    if (!property_id || !transaction_type || !transaction_amount) {
      throw new Error("Missing required fields");
    }

    // Get property details
    const { data: property, error: propertyError } = await supabaseClient
      .from('properties')
      .select('owner_id, area, title')
      .eq('id', property_id)
      .single();

    if (propertyError || !property) {
      throw new Error("Property not found");
    }

    // Calculate commission
    let commission_amount = 0;
    if (transaction_type === 'sale') {
      const area = property.area || 100;
      commission_amount = area > COMMISSION_RATES.sale.threshold 
        ? COMMISSION_RATES.sale.max 
        : COMMISSION_RATES.sale.min;
    } else {
      commission_amount = COMMISSION_RATES[transaction_type as keyof typeof COMMISSION_RATES] as number || 0;
    }

    logStep("Calculated commission", { transaction_type, commission_amount });

    // Create transaction
    const { data: transaction, error: txError } = await supabaseClient
      .from('transactions')
      .insert({
        property_id,
        owner_id: property.owner_id,
        transaction_type,
        transaction_amount,
        commission_amount,
        property_area: property.area,
        commission_paid: false
      })
      .select()
      .single();

    if (txError) throw txError;

    // Create notification for owner
    const { error: notifError } = await supabaseClient
      .from('notifications')
      .insert({
        user_id: property.owner_id,
        title: 'معاملة جديدة',
        message: `تم تسجيل معاملة جديدة لعقارك "${property.title}". العمولة المستحقة: $${commission_amount}`,
        type: 'transaction',
        link: '/owner-dashboard'
      });

    if (notifError) {
      logStep("Notification error", notifError);
    }

    logStep("Transaction created successfully", { transaction_id: transaction.id });

    return new Response(JSON.stringify({ 
      success: true, 
      transaction,
      commission_amount 
    }), {
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