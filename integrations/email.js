import nodemailer from "nodemailer";

let cachedTransporterPromise;

async function getTransporter() {
  if (cachedTransporterPromise) return cachedTransporterPromise;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  console.log("📧 Email transporter check:");
  console.log("  SMTP_HOST:", host ? "✅ Set" : "❌ Missing");
  console.log("  SMTP_PORT:", port);
  console.log("  SMTP_USER:", user ? "✅ Set" : "❌ Missing");
  console.log("  SMTP_PASS:", pass ? "✅ Set (hidden)" : "❌ Missing");

  if (host && user && pass) {
    console.log("✅ Using SMTP transport:", host, "port:", port);
    
    // Try to verify connection first
    const transport = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      connectionTimeout: 15000, // 15 seconds
      greetingTimeout: 10000, // 10 seconds
      socketTimeout: 15000, // 15 seconds
      pool: true,
      maxConnections: 1,
      maxMessages: 3,
    });
    
    try {
      // Verify connection before caching
      await transport.verify();
      console.log("✅ SMTP connection verified successfully");
      cachedTransporterPromise = Promise.resolve(transport);
      return cachedTransporterPromise;
    } catch (err) {
      console.error("❌ SMTP connection failed:", err.message);
      console.log("💡 Tip: Railway may block SMTP ports. Try port 2525 or use SendGrid API instead.");
      throw err; // Let it fail so fallback can work
    }
  }

  console.log("⚠️  SMTP credentials incomplete, checking fallbacks...");

  // Fallback 1: Ethereal (great for development/testing)
  // Note: Railway blocks SMTP ports, so Ethereal won't work in production
  // Use JSON transport instead or configure real SMTP credentials
  if ((process.env.USE_ETHEREAL ?? "true").toLowerCase() !== "false") {
    try {
      const account = await nodemailer.createTestAccount();
      console.log("Using Ethereal test SMTP:", account.user);
      
      // Test connection first - if it fails, use JSON transport
      const testTransport = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: { user: account.user, pass: account.pass },
        connectionTimeout: 5000, // 5 seconds
        greetingTimeout: 3000, // 3 seconds
      });
      
      // Verify connection works
      await testTransport.verify();
      console.log("✅ Ethereal connection verified");
      
      cachedTransporterPromise = Promise.resolve(testTransport);
      return cachedTransporterPromise;
    } catch (err) {
      console.warn("⚠️  Ethereal SMTP unavailable:", err.message);
      console.log("📝 Railway likely blocks SMTP ports. Using JSON transport (emails will be logged only).");
      console.log("💡 Tip: Set USE_ETHEREAL=false and configure real SMTP credentials for production.");
      // Fall through to JSON transport
    }
  }

  // Fallback 2: JSON transport (logs the message instead of sending)
  console.log("SMTP not configured. Using JSON transport to log emails.");
  cachedTransporterPromise = Promise.resolve(
    nodemailer.createTransport({ jsonTransport: true })
  );
  return cachedTransporterPromise;
}

export const sendEmail = async ({ config, payload }) => {
  const transporter = await getTransporter();

  // Worker already resolves placeholders in config
  const to = config.to || (payload?.user?.email ?? "");
  const subject = config.subject || "";
  const bodyText = config.body || config.text || "";

  try {
    const info = await transporter.sendMail({
      from: '"Mini Zapier" <no-reply@example.com>',
      to,
      subject,
      text: bodyText,
      html: config.html || undefined,
    });

    // Log preview URL when using Ethereal
    const preview = nodemailer.getTestMessageUrl?.(info) || null;
    if (preview) {
      console.log("📧 Email preview:", preview);
    } else if (transporter.transporter.name === 'JSONTransport') {
      console.log("📧 Email (JSON transport):", JSON.stringify(info, null, 2));
    }

    return { to, subject, previewUrl: preview };
  } catch (error) {
    console.error("❌ Email send error:", error.message);
    throw new Error(`Email send failed: ${error.message}`);
  }
};
