import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
    const { email, secret_key } = await req.json();

    // Simple secret key check
    if (secret_key !== "admin_setup_2024_secure") {
      return new Response(JSON.stringify({ error: "Invalid secret key" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    // Find user by email
    const { data: users, error: userError } = await supabaseClient.auth.admin.listUsers();
    
    if (userError) throw userError;

    const targetUser = users.users.find(u => u.email === email);
    
    if (!targetUser) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    // Update user role to admin
    const { error: updateError } = await supabaseClient
      .from('user_roles')
      .update({ role: 'admin' })
      .eq('user_id', targetUser.id);

    if (updateError) {
      // If no row exists, insert one
      const { error: insertError } = await supabaseClient
        .from('user_roles')
        .insert({ user_id: targetUser.id, role: 'admin' });
      
      if (insertError) throw insertError;
    }

    console.log(`User ${email} has been made admin`);

    return new Response(JSON.stringify({ success: true, message: `User ${email} is now admin` }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});