import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendOTPRequest {
  email: string;
  purpose: "registration" | "password_reset";
  language?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, purpose, language = "ar" }: SendOTPRequest = await req.json();

    if (!email || !purpose) {
      return new Response(
        JSON.stringify({ error: "Email and purpose are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Clean up old OTP codes for this email and purpose
    await supabase
      .from("otp_codes")
      .delete()
      .eq("email", email)
      .eq("purpose", purpose);

    // Insert new OTP code (expires in 10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    
    const { error: insertError } = await supabase
      .from("otp_codes")
      .insert({
        email,
        code: otpCode,
        purpose,
        expires_at: expiresAt,
      });

    if (insertError) {
      console.error("Error inserting OTP:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to generate OTP" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Email content based on language and purpose
    const emailContent = {
      ar: {
        registration: {
          subject: "رمز التحقق - SMSAR",
          html: `
            <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #f59e0b; text-align: center;">مرحباً بك في SMSAR</h1>
              <p style="font-size: 16px; text-align: center;">رمز التحقق الخاص بك هو:</p>
              <div style="background: linear-gradient(135deg, #f59e0b, #eab308); color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; border-radius: 10px; letter-spacing: 8px; margin: 20px 0;">
                ${otpCode}
              </div>
              <p style="font-size: 14px; color: #666; text-align: center;">هذا الرمز صالح لمدة 10 دقائق</p>
              <p style="font-size: 12px; color: #999; text-align: center;">إذا لم تطلب هذا الرمز، يرجى تجاهل هذه الرسالة</p>
            </div>
          `,
        },
        password_reset: {
          subject: "استعادة كلمة السر - SMSAR",
          html: `
            <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #f59e0b; text-align: center;">استعادة كلمة السر</h1>
              <p style="font-size: 16px; text-align: center;">رمز استعادة كلمة السر الخاص بك:</p>
              <div style="background: linear-gradient(135deg, #f59e0b, #eab308); color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; border-radius: 10px; letter-spacing: 8px; margin: 20px 0;">
                ${otpCode}
              </div>
              <p style="font-size: 14px; color: #666; text-align: center;">هذا الرمز صالح لمدة 10 دقائق</p>
              <p style="font-size: 12px; color: #999; text-align: center;">إذا لم تطلب هذا الرمز، يرجى تجاهل هذه الرسالة</p>
            </div>
          `,
        },
      },
      en: {
        registration: {
          subject: "Verification Code - SMSAR",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #f59e0b; text-align: center;">Welcome to SMSAR</h1>
              <p style="font-size: 16px; text-align: center;">Your verification code is:</p>
              <div style="background: linear-gradient(135deg, #f59e0b, #eab308); color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; border-radius: 10px; letter-spacing: 8px; margin: 20px 0;">
                ${otpCode}
              </div>
              <p style="font-size: 14px; color: #666; text-align: center;">This code is valid for 10 minutes</p>
              <p style="font-size: 12px; color: #999; text-align: center;">If you didn't request this code, please ignore this email</p>
            </div>
          `,
        },
        password_reset: {
          subject: "Password Reset Code - SMSAR",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #f59e0b; text-align: center;">Password Reset</h1>
              <p style="font-size: 16px; text-align: center;">Your password reset code is:</p>
              <div style="background: linear-gradient(135deg, #f59e0b, #eab308); color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; border-radius: 10px; letter-spacing: 8px; margin: 20px 0;">
                ${otpCode}
              </div>
              <p style="font-size: 14px; color: #666; text-align: center;">This code is valid for 10 minutes</p>
              <p style="font-size: 12px; color: #999; text-align: center;">If you didn't request this code, please ignore this email</p>
            </div>
          `,
        },
      },
      fr: {
        registration: {
          subject: "Code de Vérification - SMSAR",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #f59e0b; text-align: center;">Bienvenue sur SMSAR</h1>
              <p style="font-size: 16px; text-align: center;">Votre code de vérification est:</p>
              <div style="background: linear-gradient(135deg, #f59e0b, #eab308); color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; border-radius: 10px; letter-spacing: 8px; margin: 20px 0;">
                ${otpCode}
              </div>
              <p style="font-size: 14px; color: #666; text-align: center;">Ce code est valide pendant 10 minutes</p>
              <p style="font-size: 12px; color: #999; text-align: center;">Si vous n'avez pas demandé ce code, veuillez ignorer cet email</p>
            </div>
          `,
        },
        password_reset: {
          subject: "Code de Réinitialisation - SMSAR",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #f59e0b; text-align: center;">Réinitialisation du Mot de Passe</h1>
              <p style="font-size: 16px; text-align: center;">Votre code de réinitialisation est:</p>
              <div style="background: linear-gradient(135deg, #f59e0b, #eab308); color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; border-radius: 10px; letter-spacing: 8px; margin: 20px 0;">
                ${otpCode}
              </div>
              <p style="font-size: 14px; color: #666; text-align: center;">Ce code est valide pendant 10 minutes</p>
              <p style="font-size: 12px; color: #999; text-align: center;">Si vous n'avez pas demandé ce code, veuillez ignorer cet email</p>
            </div>
          `,
        },
      },
    };

    const lang = (language in emailContent ? language : "ar") as keyof typeof emailContent;
    const content = emailContent[lang][purpose];

    // Check if RESEND_API_KEY is configured
    if (!resendApiKey) {
      console.log("RESEND_API_KEY not configured, OTP generated but email not sent");
      console.log("OTP Code for testing:", otpCode);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "OTP generated (email sending requires RESEND_API_KEY)",
          // In production, remove this line - only for testing without email
          testCode: otpCode 
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Send email via Resend
    const resend = new Resend(resendApiKey);
    
    const emailResponse = await resend.emails.send({
      from: "SMSAR <onboarding@resend.dev>",
      to: [email],
      subject: content.subject,
      html: content.html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, message: "OTP sent successfully" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-otp function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);