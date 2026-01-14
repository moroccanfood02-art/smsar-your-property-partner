import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyOTPRequest {
  email: string;
  code: string;
  purpose: "registration" | "password_reset";
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, code, purpose }: VerifyOTPRequest = await req.json();

    if (!email || !code || !purpose) {
      return new Response(
        JSON.stringify({ error: "Email, code, and purpose are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find the OTP code
    const { data: otpRecord, error: fetchError } = await supabase
      .from("otp_codes")
      .select("*")
      .eq("email", email)
      .eq("code", code)
      .eq("purpose", purpose)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching OTP:", fetchError);
      return new Response(
        JSON.stringify({ error: "Verification failed" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!otpRecord) {
      return new Response(
        JSON.stringify({ valid: false, error: "Invalid or expired code" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Mark OTP as used
    await supabase
      .from("otp_codes")
      .update({ used: true })
      .eq("id", otpRecord.id);

    // For password reset, generate a temporary token
    if (purpose === "password_reset") {
      // Generate a password reset link using Supabase Admin API
      const { data: resetData, error: resetError } = await supabase.auth.admin.generateLink({
        type: "recovery",
        email: email,
      });

      if (resetError) {
        console.error("Error generating reset link:", resetError);
        return new Response(
          JSON.stringify({ valid: true, error: "Failed to generate reset token" }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Extract the token from the action link
      const actionLink = resetData?.properties?.action_link;
      let token = null;
      
      if (actionLink) {
        const url = new URL(actionLink);
        token = url.searchParams.get("token") || url.hash?.match(/access_token=([^&]+)/)?.[1];
      }

      return new Response(
        JSON.stringify({ 
          valid: true, 
          purpose: "password_reset",
          resetToken: token,
          actionLink: actionLink
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({ valid: true, purpose }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in verify-otp function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);