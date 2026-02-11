import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  console.log(`[SEND-OTP] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);
};

interface SendOTPRequest {
  email: string;
  purpose: "registration" | "password_reset";
  language?: string;
}

const generateOTP = (): string => {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return String(100000 + (array[0] % 900000));
};

const getEmailTemplate = (otpCode: string, purpose: string, lang: string) => {
  const templates: Record<string, Record<string, { subject: string; title: string; subtitle: string; footer: string; ignore: string }>> = {
    ar: {
      registration: {
        subject: "رمز التحقق - SMSAR",
        title: "مرحباً بك في SMSAR",
        subtitle: "رمز التحقق الخاص بك هو:",
        footer: "هذا الرمز صالح لمدة 10 دقائق",
        ignore: "إذا لم تطلب هذا الرمز، يرجى تجاهل هذه الرسالة",
      },
      password_reset: {
        subject: "استعادة كلمة السر - SMSAR",
        title: "استعادة كلمة السر",
        subtitle: "رمز استعادة كلمة السر الخاص بك:",
        footer: "هذا الرمز صالح لمدة 10 دقائق",
        ignore: "إذا لم تطلب هذا الرمز، يرجى تجاهل هذه الرسالة",
      },
    },
    en: {
      registration: {
        subject: "Verification Code - SMSAR",
        title: "Welcome to SMSAR",
        subtitle: "Your verification code is:",
        footer: "This code is valid for 10 minutes",
        ignore: "If you didn't request this code, please ignore this email",
      },
      password_reset: {
        subject: "Password Reset Code - SMSAR",
        title: "Password Reset",
        subtitle: "Your password reset code is:",
        footer: "This code is valid for 10 minutes",
        ignore: "If you didn't request this code, please ignore this email",
      },
    },
    fr: {
      registration: {
        subject: "Code de Vérification - SMSAR",
        title: "Bienvenue sur SMSAR",
        subtitle: "Votre code de vérification est:",
        footer: "Ce code est valide pendant 10 minutes",
        ignore: "Si vous n'avez pas demandé ce code, veuillez ignorer cet email",
      },
      password_reset: {
        subject: "Code de Réinitialisation - SMSAR",
        title: "Réinitialisation du Mot de Passe",
        subtitle: "Votre code de réinitialisation est:",
        footer: "Ce code est valide pendant 10 minutes",
        ignore: "Si vous n'avez pas demandé ce code, veuillez ignorer cet email",
      },
    },
    es: {
      registration: {
        subject: "Código de Verificación - SMSAR",
        title: "Bienvenido a SMSAR",
        subtitle: "Tu código de verificación es:",
        footer: "Este código es válido por 10 minutos",
        ignore: "Si no solicitaste este código, ignora este correo",
      },
      password_reset: {
        subject: "Código de Recuperación - SMSAR",
        title: "Recuperar Contraseña",
        subtitle: "Tu código de recuperación es:",
        footer: "Este código es válido por 10 minutos",
        ignore: "Si no solicitaste este código, ignora este correo",
      },
    },
  };

  const t = templates[lang]?.[purpose] || templates.ar[purpose];
  const isRtl = lang === "ar";

  return {
    subject: t.subject,
    html: `
      <div ${isRtl ? 'dir="rtl"' : ""} style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
        <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 32px 24px; text-align: center;">
          <div style="display: inline-block; background: white; border-radius: 16px; padding: 12px 28px; margin-bottom: 16px;">
            <span style="font-size: 28px; font-weight: 800; color: #d97706; letter-spacing: 2px;">SMSAR</span>
          </div>
          <h1 style="color: white; font-size: 22px; margin: 0; font-weight: 600;">${t.title}</h1>
        </div>
        <div style="padding: 40px 32px; text-align: center;">
          <p style="font-size: 16px; color: #374151; margin-bottom: 24px;">${t.subtitle}</p>
          <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); border: 2px solid #f59e0b; border-radius: 16px; padding: 24px; margin: 0 auto 24px; max-width: 280px;">
            <span style="font-size: 40px; font-weight: 800; color: #92400e; letter-spacing: 12px; font-family: 'Courier New', monospace;">${otpCode}</span>
          </div>
          <p style="font-size: 14px; color: #6b7280; margin-bottom: 8px;">⏱️ ${t.footer}</p>
          <p style="font-size: 12px; color: #9ca3af;">${t.ignore}</p>
        </div>
        <div style="background: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 12px; color: #9ca3af; margin: 0;">© ${new Date().getFullYear()} SMSAR. All rights reserved.</p>
        </div>
      </div>
    `,
  };
};

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, purpose, language = "ar" }: SendOTPRequest = await req.json();
    logStep("Request received", { email, purpose, language });

    if (!email || !purpose) {
      return new Response(
        JSON.stringify({ error: "Email and purpose are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      logStep("ERROR: RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate secure 6-digit OTP
    const otpCode = generateOTP();
    logStep("OTP generated", { codeLength: otpCode.length });

    // Clean up old OTP codes for this email and purpose
    const { error: deleteError } = await supabase
      .from("otp_codes")
      .delete()
      .eq("email", email)
      .eq("purpose", purpose);
    
    if (deleteError) {
      logStep("Warning: cleanup failed", { error: deleteError.message });
    }

    // Insert new OTP code (expires in 10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const { error: insertError } = await supabase
      .from("otp_codes")
      .insert({
        email,
        code: otpCode,
        purpose,
        expires_at: expiresAt,
        used: false,
      });

    if (insertError) {
      logStep("ERROR inserting OTP", { error: insertError.message });
      return new Response(
        JSON.stringify({ error: "Failed to generate OTP" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    logStep("OTP saved to database");

    // Build email content
    const lang = ["ar", "en", "fr", "es"].includes(language) ? language : "ar";
    const emailContent = getEmailTemplate(otpCode, purpose, lang);

    // Send email via Resend
    const resend = new Resend(resendApiKey);

    logStep("Sending email via Resend", { to: email, subject: emailContent.subject });

    const emailResponse = await resend.emails.send({
      from: "SMSAR <onboarding@resend.dev>",
      to: [email],
      subject: emailContent.subject,
      html: emailContent.html,
    });

    logStep("Resend response", emailResponse);

    if (emailResponse.error) {
      logStep("ERROR from Resend", { error: emailResponse.error });
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: emailResponse.error }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    logStep("Email sent successfully", { id: emailResponse.data?.id });

    return new Response(
      JSON.stringify({ success: true, message: "OTP sent successfully" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    logStep("FATAL ERROR", { error: error.message, stack: error.stack });
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
