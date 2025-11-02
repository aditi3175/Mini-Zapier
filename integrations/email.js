import nodemailer from "nodemailer";

let cachedTransporterPromise;

async function getTransporter() {
  if (cachedTransporterPromise) return cachedTransporterPromise;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    cachedTransporterPromise = Promise.resolve(
      nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
        connectionTimeout: 10000, // 10 seconds
        greetingTimeout: 5000, // 5 seconds
      })
    );
    return cachedTransporterPromise;
  }

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
