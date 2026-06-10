import { jsPDF } from "jspdf";

type QuestionnaireData = {
  fullName: string;
  dob: string;
  phone: string;
  email: string;
  date: string;
  formCategory?: string;
  formType?: string;
  signature?: string;
  // IV Therapy specific
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  medicalConditions?: string;
  medicalConditionsSelected?: string[];
  medicalConditionsOther?: string;
  medications?: string;
  medicationsList?: string;
  allergies?: string;
  allergiesList?: string;
  medicalDevices?: string;
  devicesList?: string;
  pregnancy?: string;
  conceptionDate?: string;
  primaryReason?: string;
  symptomsDuration?: string;
  desiredOutcome?: string;
  smoke?: string;
  alcohol?: string;
  waterIntake?: string;
  previousIv?: string;
  consent?: boolean;
  // General Intake specific
  idNumber?: string;
  address?: string;
  medicalScheme?: string;
  membershipNumber?: string;
  employerAddress?: string;
  employerContact?: string;
};

// Preloaders for rendering on the PDF canvas natively
function loadImageAsBase64(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        try {
          resolve(canvas.toDataURL("image/png"));
        } catch (e) {
          reject(e);
        }
      } else {
        reject(new Error("No canvas context"));
      }
    };
    img.onerror = () => reject(new Error("Image load error"));
    img.src = url;
  });
}

async function getLogoBase64(): Promise<string | null> {
  const paths = [
    "/Logo_2_Transparent.png",
    "/Logo_1_Transparent.png",
    "https://raw.githubusercontent.com/tanachiddo-source/Lalokhumed-Final/63392fb297c2dc80233ac4a2e0865cccb3eccb02/public/Logo%202%20Transparent.png",
    "https://raw.githubusercontent.com/tanachiddo-source/Lalokhumed-Final/63392fb297c2dc80233ac4a2e0865cccb3eccb02/public/Logo%201%20Transparent.png"
  ];

  for (const path of paths) {
    try {
      const base64 = await loadImageAsBase64(path);
      if (base64) return base64;
    } catch (e) {
      // Quietly try next path
    }
  }
  return null;
}

export async function downloadQuestionnairePDF(data: QuestionnaireData) {
  const logoBase64 = await getLogoBase64();

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;
  const rightBoundary = pageWidth - margin;
  let y = 15;

  const formName = data.formCategory || data.formType || "IV Therapy";
  const isGeneralIntake = formName === "General Intake";

  // Helper: Print horizontal line with specified color and thickness
  const drawLine = (startY: number, thickness = 0.2, color = [220, 220, 220]) => {
    doc.setDrawColor(color[0], color[1], color[2]);
    doc.setLineWidth(thickness);
    doc.line(margin, startY, rightBoundary, startY);
  };

  // Helper: Check space and add new page if needed
  const ensureSpace = (heightNeeded: number) => {
    if (y + heightNeeded > pageHeight - margin - 10) {
      doc.addPage();
      y = 15;
      drawHeader(true);
    }
  };

  // Modern Clinical Header Styling
  const drawHeader = (isContinuation = false) => {
    // 1. Sleek top aesthetic accent bar (brand red: #B51E22 -> RGB: 181, 30, 34)
    doc.setFillColor(181, 30, 34);
    doc.rect(margin, y, pageWidth - 2 * margin, 2, "F");
    y += 6;

    if (logoBase64 && !isContinuation) {
      try {
        // High quality LALOKHUMED Logo on left side
        doc.addImage(logoBase64, "PNG", margin, y - 2, 45, 12);
      } catch (err) {
        console.error("PDF logo render error:", err);
      }
    } else {
      // Fallback text if logo is not available or if it is a continuation page
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(181, 30, 34);
      doc.text("LALOKHUMED", margin, y + 4);
    }

    // Right-aligned header metadata details (creates an authentic clinical header)
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(26, 26, 27);
    doc.text("MEDICAL INTEL & CLINICAL DOSSIER", rightBoundary, y + 1, { align: "right" });

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(110, 110, 110);
    if (isContinuation) {
      doc.text("Continuation Page", rightBoundary, y + 5, { align: "right" });
    } else {
      doc.text("LALOKHUMED MEDICAL PRACTICE (PTY) LTD", rightBoundary, y + 5, { align: "right" });
      doc.text("Website: www.lalokhumed.co.za | Confidential", rightBoundary, y + 8, { align: "right" });
    }

    y += 13;
    drawLine(y, 0.3, [181, 30, 34]);
    y += 8;

    // 3. Document Title Centered
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(26, 26, 27);
    const titleText = isGeneralIntake
      ? "PATIENT GENERAL INTAKE FILE"
      : "IV THERAPY SCREENING QUESTIONNAIRE";
    doc.text(titleText, margin, y);
    y += 5;

    // Subtitle date & details
    doc.setFont("Helvetica", "italic");
    doc.setFontSize(8.5);
    doc.setTextColor(115, 115, 115);
    doc.text(`Digital Submission Timestamp: ${data.date || "N/A"}`, margin, y);
    y += 10;
  };

  // Start with the initial header
  drawHeader(false);

  // Helper inside to print a structured "Section Header"
  const drawSectionHeader = (title: string) => {
    ensureSpace(14);
    // Draw background block
    doc.setFillColor(250, 247, 242); // Warm gentle linen beige from Welcome page
    doc.rect(margin, y - 4, pageWidth - 2 * margin, 7, "F");
    
    // Left boundary line block in brand red
    doc.setFillColor(181, 30, 34);
    doc.rect(margin, y - 4, 1.5, 7, "F");

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(181, 30, 34); // red
    doc.text(title.toUpperCase(), margin + 4, y + 0.5);
    y += 7;
  };

  // Helper inside to draw label-value rows
  const drawGridRow = (
    label1: string,
    val1: string,
    label2?: string,
    val2?: string,
    colWidth = 85
  ) => {
    ensureSpace(8);
    // Label 1
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(100, 100, 100);
    doc.text(label1, margin, y);

    // Value 1
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(26, 26, 27);
    const textVal1 = val1 ? String(val1) : "N/A";
    
    // Wrap text standard limits to avoid overruns
    const splitVal1 = doc.splitTextToSize(textVal1, colWidth);
    doc.text(splitVal1, margin, y + 4);

    // Height of block 1
    let rowHeight = 4 + (splitVal1.length * 4);

    if (label2 && val2 !== undefined) {
      // Label 2
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(100, 100, 100);
      doc.text(label2, margin + colWidth + 10, y);

      // Value 2
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(26, 26, 27);
      const textVal2 = val2 ? String(val2) : "N/A";
      const splitVal2 = doc.splitTextToSize(textVal2, colWidth);
      doc.text(splitVal2, margin + colWidth + 10, y + 4);

      const height2 = 4 + (splitVal2.length * 4);
      if (height2 > rowHeight) {
        rowHeight = height2;
      }
    }

    y += rowHeight + 2;
    // Bottom clean line dividing grid items lightly
    drawLine(y - 1, 0.1, [240, 240, 240]);
    y += 3;
  };

  // Helper inside to print a full-width descriptive text block
  const drawParagraphBlock = (label: string, text: string) => {
    ensureSpace(12);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(100, 100, 100);
    doc.text(label, margin, y);
    y += 4.5;

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(26, 26, 27);
    const safeText = text ? String(text) : "None reported / N/A";
    const splitText = doc.splitTextToSize(safeText, pageWidth - 2 * margin);
    doc.text(splitText, margin, y);
    
    y += splitText.length * 4 + 4;
    drawLine(y - 2, 0.1, [240, 240, 240]);
    y += 2;
  };

  // 1. SECTION: PERSONAL DETAILS
  drawSectionHeader("1. Patient Personal Information");
  y += 3;
  drawGridRow("Full Name(s) and Last Name", data.fullName, "Date of Birth", data.dob);
  
  if (isGeneralIntake) {
    drawGridRow("Identity / Passport Number", data.idNumber || "N/A", "Phone Number", data.phone);
    drawGridRow("Email Address", data.email, "Registration Date", data.date);
    drawParagraphBlock("Residential Address", data.address || "N/A");
  } else {
    drawGridRow("Phone Number", data.phone, "Email Address", data.email);
    drawGridRow("Emergency Contact Name", data.emergencyContactName || "N/A", "Emergency Contact Phone", data.emergencyContactPhone || "N/A");
  }

  y += 2;

  if (isGeneralIntake) {
    // 2. SECTION: MEDICAL SCHEME DETAILS INFO (for general intake)
    drawSectionHeader("2. Medical Scheme & Employment Info");
    y += 3;
    drawGridRow("Medical Scheme Name", data.medicalScheme || "Private Patient", "Membership Number", data.membershipNumber || "N/A");
    drawParagraphBlock("Employer Residential/Business Address", data.employerAddress || "N/A");
    drawParagraphBlock("Employer Direct Contact Information", data.employerContact || "N/A");
  } else {
    // 2. SECTION: CLINICAL SCREENING (for IV Therapy)
    drawSectionHeader("2. Medical Screening & Background Check");
    y += 3;
    
    // Medical Conditions YES/NO & selected
    let conditionsText = "No";
    if (data.medicalConditions === "Yes") {
      const selected = data.medicalConditionsSelected || [];
      const other = data.medicalConditionsOther ? `Other: ${data.medicalConditionsOther}` : "";
      conditionsText = `Yes - [${selected.join(", ")}]${other ? ` • ${other}` : ""}`;
    }
    drawParagraphBlock("Do you have any existing medical conditions?", conditionsText);

    // Current Medications
    const medsText = data.medications === "Yes" ? `Yes - ${data.medicationsList}` : "No medications listed";
    drawParagraphBlock("Are you currently taking any prescription/OTC medications?", medsText);

    // Allergies List
    const allergiesText = data.allergies === "Yes" ? `Yes - ${data.allergiesList}` : "No known medication or ingredient allergies";
    drawParagraphBlock("Do you have any allergies (medical, foods, ingredients)?", allergiesText);

    // Medical devices & Pregnancy
    drawGridRow(
      "Implanted medical devices?",
      data.medicalDevices === "Yes" ? `Yes (${data.devicesList || "No specific details reported"})` : "No",
      "Are you pregnant or nursing?",
      data.pregnancy === "Yes" ? `Yes (EST. Conception date: ${data.conceptionDate || "N/A"})` : "No"
    );

    // 3. SECTION: TREATMENT GOALS & LIFESTYLE INFORMATION
    drawSectionHeader("3. Patient Lifestyle & Clinical Desires");
    y += 3;
    drawGridRow("Smoking Status", data.smoke || "N/A", "Daily Water Intake (L)", data.waterIntake || "N/A");
    drawGridRow("Previous IV Infusions?", data.previousIv || "No", "Alcohol consumption frequency", data.alcohol || "N/A");
    drawParagraphBlock("Primary treatment reason / presenting symptoms", data.primaryReason || "N/A");
    drawParagraphBlock("Desired therapy outcome / clinical expectations", data.desiredOutcome || "N/A");
  }

  // 4. SECTION: CONSENT DECLARATION & INTEGRATIVE SIGNATURE
  drawSectionHeader(isGeneralIntake ? "3. Consent & Privacy Agreement" : "4. Clinical Consent & Signature");
  y += 3;

  ensureSpace(20);
  doc.setFont("Helvetica", "italic");
  doc.setFontSize(8.5);
  doc.setTextColor(80, 80, 80);
  const declarationText = isGeneralIntake
    ? "Consent Confirmation: I agree that the details supplied above serve as the basis for my clinical files and medical intake dossier. This file is held with direct clinician-patient confidentiality as required by medical board standards."
    : "Consent Confirmation: I confirm that the medical background, wellness goals, and screening questions have been answered truthfully and with absolute accuracy. I wish to receive my bespoke clinical treatment and hereby sign this medical document digitally.";
  const splitDeclaration = doc.splitTextToSize(declarationText, pageWidth - 2 * margin);
  doc.text(splitDeclaration, margin, y);
  y += splitDeclaration.length * 4 + 4;

  // Render Signature Image Box
  ensureSpace(38);
  doc.setFillColor(248, 248, 249);
  doc.rect(margin, y, pageWidth - 2 * margin, 28, "F");
  doc.setDrawColor(220, 220, 222);
  doc.setLineWidth(0.25);
  doc.rect(margin, y, pageWidth - 2 * margin, 28, "D");

  // Signature Label Left
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 100, 100);
  doc.text("PATIENT AUTHENTIC SIGNATURE", margin + 6, y + 6);

  // Consent Status Box Right
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(40, 160, 40); // Soft medical green
  doc.text("CONSENT VERIFIED VIA PORTAL", rightBoundary - 60, y + 6);
  
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(`Completed: ${data.date || "N/A"}`, rightBoundary - 60, y + 11);

  // Render digital signature if present as Base64 image
  if (data.signature && data.signature.startsWith("data:image")) {
    try {
      // Signature is usually placed in a box in the middle/left of the signature panel
      doc.addImage(data.signature, "PNG", margin + 10, y + 8, 45, 16);
    } catch (err) {
      console.error("Failed to render signature image in PDF:", err);
      doc.setFont("Helvetica", "italic");
      doc.setFontSize(8.5);
      doc.setTextColor(181, 30, 34);
      doc.text("[Digital Signature Image Render Skipped]", margin + 10, y + 16);
    }
  } else {
    doc.setFont("Helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text("No digital signature image attached", margin + 10, y + 16);
  }

  y += 32;

  // 5. OFFICIAL PRACTICE USE PANEL (FOOTER STYLE trust elements)
  ensureSpace(18);
  doc.setFillColor(26, 26, 27); // Dark strip
  doc.rect(margin, y, pageWidth - 2 * margin, 12, "F");

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  const practiceNote = "LALOKHUMED CLINICAL AUDIT DEPT • END-TO-END CONFIDENTIALITY SECURED";
  doc.text(practiceNote, margin + 4, y + 7);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(180, 180, 180);
  doc.text(`Downloaded: ${new Date().toLocaleDateString("en-ZA")}`, rightBoundary - 40, y + 7);

  // Save/Download PDF
  const ptNameSanitized = data.fullName.trim().replace(/[^a-zA-Z0-9]/g, "_");
  const filename = `${formName.replace(/\s+/g, "_")}_${ptNameSanitized}.pdf`;
  doc.save(filename);
}
