import { Handler } from "@netlify/functions";
import { Resend } from "resend";

const handler: Handler = async (event, context) => {
  // Only allow POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

    const resendApiKey = process.env.RESEND_API_KEY;
    const adminEmail = process.env.ADMIN_EMAIL || "tanachiddo@gmail.com";

    if (!resendApiKey) {
      console.error("RESEND_API_KEY environment variable is missing.");
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Server Configuration Error: API Key missing" }),
      };
    }

    console.log(`Resend configuration: Using onboarding@resend.dev. Ensure ${adminEmail} is the email address used to sign up for Resend.`);
    
    const resend = new Resend(resendApiKey);

  try {
    const { type, data } = JSON.parse(event.body || "{}");

    if (!type || !data) {
      return { statusCode: 400, body: "Bad Request: Missing type or data" };
    }

    let subject = "";
    let html = "";

    const host = event.headers.host || "lalokhumed.co.za";

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
        <p><a href="https://${host}/admin">View in Admin Portal</a></p>
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
        <p><a href="https://${host}/admin">View in Admin Portal</a></p>
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

    const senderEmail = process.env.SENDER_EMAIL || "Lalokhumed Alerts <onboarding@resend.dev>";
    const recipientEmail = type === "faq_response" ? data.email : adminEmail;
    console.log(`Email details: Type=${type}, From=${senderEmail}, To=${recipientEmail}`);
    
    const { data: resendData, error: resendError } = await resend.emails.send({
      from: senderEmail,
      to: recipientEmail,
      subject: subject,
      html: html,
    });

    if (resendError) {
      console.error("Resend API Error:", resendError);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: resendError.message, details: resendError }),
      };
    }

    console.log("Email sent successfully:", resendData);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, id: resendData?.id }),
    };
  } catch (error) {
    console.error("Function Execution Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error", message: error instanceof Error ? error.message : String(error) }),
    };
  }
};

export { handler };
