import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { Resend } from "resend";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

import https from "https";

async function downloadAsset(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308) {
        if (res.headers.location) {
          downloadAsset(res.headers.location, dest).then(resolve).catch(reject);
          return;
        }
      }
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: status ${res.statusCode}`));
        return;
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on("finish", () => {
        file.close();
        resolve();
      });
    });

    request.on("error", (err) => {
      reject(err);
    });

    request.setTimeout(6000, () => {
      request.destroy();
      reject(new Error(`Download timeout for ${url}`));
    });
  });
}

async function ensureAssets() {
  const publicDir = path.join(process.cwd(), "public");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const assetsToDownload = [
    {
      url: "https://raw.githubusercontent.com/tanachiddo-source/Lalokhumed-Final/63392fb297c2dc80233ac4a2e0865cccb3eccb02/public/Logo%202%20Transparent.png",
      dest: path.join(publicDir, "Logo_2_Transparent.png")
    },
    {
      url: "https://raw.githubusercontent.com/tanachiddo-source/Lalokhumed-Final/63392fb297c2dc80233ac4a2e0865cccb3eccb02/public/Logo%201%20Transparent.png",
      dest: path.join(publicDir, "Logo_1_Transparent.png")
    },
    {
      url: "https://raw.githubusercontent.com/tanachiddo-source/Lalokhumed-Final/63392fb297c2dc80233ac4a2e0865cccb3eccb02/public/Logo%201%20Transparent.png",
      dest: path.join(publicDir, "favicon.png")
    },
    {
      url: "https://raw.githubusercontent.com/tanachiddo-source/Lalokhumed-Final/63392fb297c2dc80233ac4a2e0865cccb3eccb02/public/Home%20Slide%201.png",
      dest: path.join(publicDir, "Home_Slide_1.png")
    },
    {
      url: "https://raw.githubusercontent.com/tanachiddo-source/Lalokhumed-Final/63392fb297c2dc80233ac4a2e0865cccb3eccb02/public/Home%20slide%202.png",
      dest: path.join(publicDir, "Home_slide_2.png")
    },
    {
      url: "https://raw.githubusercontent.com/tanachiddo-source/Lalokhumed-Final/63392fb297c2dc80233ac4a2e0865cccb3eccb02/public/Home%20Slide%203.png",
      dest: path.join(publicDir, "Home_Slide_3.png")
    },
    {
      url: "https://raw.githubusercontent.com/tanachiddo-source/Lalokhumed-Final/63392fb297c2dc80233ac4a2e0865cccb3eccb02/public/Home%20Slide%204.png",
      dest: path.join(publicDir, "Home_Slide_4.png")
    },
    {
      url: "https://raw.githubusercontent.com/tanachiddo-source/Lalokhumed-Final/63392fb297c2dc80233ac4a2e0865cccb3eccb02/public/Home%20Section%201.png",
      dest: path.join(publicDir, "Home_Section_1.png")
    },
    {
      url: "https://raw.githubusercontent.com/tanachiddo-source/Lalokhumed-Final/63392fb297c2dc80233ac4a2e0865cccb3eccb02/public/About%20IV.png",
      dest: path.join(publicDir, "About_IV.png")
    }
  ];

  console.log("[LALOKHUMED] Starting asset pre-verification & download...");
  for (const asset of assetsToDownload) {
    try {
      // Use properly URL encoded string for request
      const encodedUrl = asset.url.replace(/ /g, "%20");
      await downloadAsset(encodedUrl, asset.dest);
      console.log(`[LALOKHUMED] Downloaded successfully to ${path.basename(asset.dest)}`);
    } catch (e: any) {
      console.error(`[LALOKHUMED] Failed to download ${asset.url}:`, e.message || e);
    }
  }
}

async function startServer() {
  ensureAssets().catch(err => {
    console.error("[LALOKHUMED] Background ensureAssets failed:", err);
  });
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for sending email alerts
  app.post("/api/send-alert", async (req, res) => {
    try {
      const { type, data } = req.body;
      const adminEmail = process.env.ADMIN_EMAIL || "admin@lalokhumed.co.za";
      const infoEmail = process.env.INFO_EMAIL || "info@lalokhumed.co.za";
      const resendApiKey = process.env.RESEND_API_KEY;

      if (!resendApiKey) {
        console.warn("RESEND_API_KEY is missing. Skipping email.");
        return res.status(200).json({ status: "skipped", message: "API key missing" });
      }

      const resend = new Resend(resendApiKey);

      let subject = "";
      let html = "";

      if (type === "booking") {
        subject = `New Booking: ${data.fullName}`;
        html = `
          <h1>New Booking Notification</h1>
          <p><strong>Name:</strong> ${data.fullName}</p>
          <p><strong>Service:</strong> ${data.service}</p>
          <p><strong>Date:</strong> ${data.preferredDate}</p>
          <p><strong>Time:</strong> ${data.preferredTime}</p>
          <p><strong>Phone:</strong> ${data.phone}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <br/>
          <p><a href="https://${req.get('host')}/admin">View in Admin Portal</a></p>
        `;
      } else if (type === "questionnaire") {
        subject = `New Questionnaire: ${data.fullName} (${data.formCategory})`;
        html = `
          <h1>New Questionnaire Submission</h1>
          <p><strong>Name:</strong> ${data.fullName}</p>
          <p><strong>Form Type:</strong> ${data.formCategory}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Phone:</strong> ${data.phone}</p>
          <br/>
          <p>Check the admin portal for full details.</p>
          <p><a href="https://${req.get('host')}/admin">View in Admin Portal</a></p>
        `;
      } else if (type === "faq_inquiry") {
        subject = `Other Question: Inquiry from ${data.email}`;
        html = `
          <h1>New FAQ / Other Question Inquiry</h1>
          <p>A user has submitted a custom question that wasn't answered on the FAQ page.</p>
          <p><strong>Sender's Email Address:</strong> ${data.email}</p>
          <p><strong>Question Details:</strong></p>
          <div style="background-color: #f9f9f9; border-left: 4px solid #DF2127; padding: 16px; margin: 16px 0; border-radius: 4px; font-style: italic;">
            ${data.question}
          </div>
          <br/>
          <p>You can reply directly to the patient at: <a href="mailto:${data.email}">${data.email}</a></p>
        `;
      } else if (type === "faq_response") {
        subject = `Response to your Lalokhumed Clinical Inquiry`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eeeeee; border-radius: 12px; color: #333333;">
            <h2 style="color: #DF2127; margin-bottom: 24px;">Lalokhumed Medical Practice Support</h2>
            <p>Dear Patient,</p>
            <p>Thank you for reaching out to us with your question. Our clinical team has responded to your inquiry:</p>
            
            <div style="background-color: #f9f9f9; border-left: 4px solid #cccccc; padding: 16px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; font-weight: bold; font-size: 12px; color: #666666; text-transform: uppercase; letter-spacing: 0.5px;">Your Question:</p>
              <p style="margin: 8px 0 0 0; font-style: italic; color: #555555;">${data.question}</p>
            </div>

            <div style="background-color: #fdf2f2; border-left: 4px solid #DF2127; padding: 16px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; font-weight: bold; font-size: 12px; color: #DF2127; text-transform: uppercase; letter-spacing: 0.5px;">Clinical Response:</p>
              <p style="margin: 8px 0 0 0; line-height: 1.6; color: #222222; font-size: 15px; white-space: pre-wrap;">${data.response}</p>
            </div>

            <p style="margin-top: 30px; font-size: 12px; color: #999999; border-top: 1px solid #eeeeee; padding-top: 16px;">
              If you have any additional concerns or would like to schedule a clinical visit, please don't hesitate to visit our portal.
              <br/><br/>
              Best regards,<br/>
              <strong>Lalokhumed Practice Support Team</strong>
            </p>
          </div>
        `;
      }

      const senderEmail = process.env.SENDER_EMAIL || "Lalokhumed Alerts <alerts@lalokhumed.co.za>";
      const recipientEmail = 
        type === "faq_response" 
          ? data.email 
          : type === "faq_inquiry" 
            ? infoEmail 
            : adminEmail;

      console.log(`[LALOKHUMED EMAIL] Attempting to send. Type=${type}, From=${senderEmail}, To=${recipientEmail}`);

      const { data: resendData, error: resendError } = await resend.emails.send({
        from: senderEmail,
        to: recipientEmail,
        subject: subject,
        html: html,
      });

      if (resendError) {
        console.error("[LALOKHUMED EMAIL] Resend error:", resendError);
        if (senderEmail.includes("onboarding@resend.dev")) {
          console.warn("[LALOKHUMED EMAIL] WARNING: You are using Resend's default 'onboarding@resend.dev' sender address. Resend constraints prevent sending to custom email addresses like 'admin@lalokhumed.co.za' unless you either register your Resend account with that email, verify the 'lalokhumed.co.za' domain in your Resend dashboard, or configure a verified SENDER_EMAIL.");
        }
        return res.status(400).json({ success: false, error: resendError });
      }

      console.log("[LALOKHUMED EMAIL] Email sent successfully:", resendData);
      res.json({ success: true, info: resendData });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ error: "Failed to send email" });
    }
  });

  // Vite middleware for development
  // Self-healing: if the compiled production "dist" directory doesn't exist, we must run in dev mode
  const distExists = fs.existsSync(path.join(process.cwd(), "dist"));
  const isDev = process.env.NODE_ENV !== "production" || 
                process.env.DISABLE_HMR === "true" || 
                !distExists;

  console.log(`[LALOKHUMED] Starting server. isDev=${isDev}, NODE_ENV=${process.env.NODE_ENV}, distExists=${distExists}`);

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
