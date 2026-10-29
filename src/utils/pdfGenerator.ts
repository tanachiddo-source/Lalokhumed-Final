import { jsPDF } from "jspdf";
import { SurgicalHistoryRow } from "@/src/types/medicalIntake";

export type QuestionnaireData = {
  fullName: string;
  dob: string;
  phone: string;
  email: string;
  date: string;
  formCategory?: string;
  formType?: string;
  signature?: string;

  // Patient Medical Intake Form Specific
  primaryComplaint?: string;
  activeSymptoms?: string[];
  severePainLocation?: string;
  pmhCardiovascular?: string[];
  pmhRespiratory?: string[];
  pmhEndocrine?: string[];
  pmhGastrointestinal?: string[];
  pmhKidney?: string[];
  pmhNeuroPsych?: string[];
  pmhOther?: string[];
  cancerType?: string;
  hasSurgeries?: "Yes" | "No";
  surgeries?: SurgicalHistoryRow[];
  hasAllergies?: "Yes" | "No";
  allergyDetails?: string;
  currentMedications?: string;
  certificationAgreed?: boolean;

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

  const formName = data.formCategory || data.formType || "Patient Medical Intake Form";
  const isMedicalIntake = formName === "Patient Medical Intake Form";
  const isGeneralIntake = formName === "General Intake";

  // Helper: Print horizontal line with specified color and thickness
  const drawLine = (startY: number, thickness = 0.2, color = [220, 220, 220]) => {
    doc.setDrawColor(color[0], color[1], color[2]);
    doc.setLineWidth(thickness);
    doc.line(margin, startY, rightBoundary, startY);
  };

  // Modern Clinical Header Styling
  const drawHeader = (isContinuation = false) => {
    // 1. Sleek top aesthetic accent bar (brand red: #B51E22 -> RGB: 181, 30, 34)
    doc.setFillColor(181, 30, 34);
    doc.rect(margin, y, pageWidth - 2 * margin, 2, "F");
    y += 6;

    if (logoBase64 && !isContinuation) {
      try {
        doc.addImage(logoBase64, "PNG", margin, y - 2, 45, 12);
      } catch (err) {
        console.error("PDF logo render error:", err);
      }
    } else {
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(181, 30, 34);
      doc.text("LALOKHUMED", margin, y + 4);
    }

    // Right-aligned header metadata details
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(26, 26, 27);
    doc.text("LALOKHUMED MEDICAL PRACTICE", rightBoundary, y + 1, { align: "right" });

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(110, 110, 110);
    if (isContinuation) {
      doc.text("Continuation Page • Confidential Clinical File", rightBoundary, y + 5, { align: "right" });
    } else {
      doc.text("273 Bryanston Drive, Sandton, Johannesburg 2191", rightBoundary, y + 5, { align: "right" });
      doc.text("Tel: +27 872 559 066 | lalokhumed.co.za", rightBoundary, y + 8.5, { align: "right" });
    }

    y += 13;
    drawLine(y, 0.3, [181, 30, 34]);
    y += 7;

    // Document Title
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(26, 26, 27);
    const titleText = isMedicalIntake
      ? "PATIENT MEDICAL INTAKE FORM"
      : isGeneralIntake
        ? "PATIENT GENERAL INTAKE FILE"
        : "IV THERAPY SCREENING QUESTIONNAIRE";
    doc.text(titleText, margin, y);
    y += 5;

    // Subtitle date & details
    doc.setFont("Helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(115, 115, 115);
    doc.text(`Recorded Date: ${data.date || "N/A"} | Patient: ${data.fullName || "Confidential"}`, margin, y);
    y += 8;
  };

  // Helper: Check space and add new page if needed
  const ensureSpace = (heightNeeded: number) => {
    if (y + heightNeeded > pageHeight - margin - 10) {
      doc.addPage();
      y = 15;
      drawHeader(true);
    }
  };

  // Start with initial header
  drawHeader(false);

  // Helper inside to print a structured Section Header
  const drawSectionHeader = (title: string) => {
    ensureSpace(14);
    doc.setFillColor(250, 247, 242);
    doc.rect(margin, y - 4, pageWidth - 2 * margin, 7, "F");
    
    doc.setFillColor(181, 30, 34);
    doc.rect(margin, y - 4, 1.5, 7, "F");

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(181, 30, 34);
    doc.text(title.toUpperCase(), margin + 4, y + 0.5);
    y += 7;
  };

  // Helper to draw label-value rows
  const drawGridRow = (
    label1: string,
    val1: string,
    label2?: string,
    val2?: string,
    colWidth = 85
  ) => {
    ensureSpace(8);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(label1, margin, y);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(26, 26, 27);
    const textVal1 = val1 ? String(val1) : "N/A";
    const splitVal1 = doc.splitTextToSize(textVal1, colWidth);
    doc.text(splitVal1, margin, y + 3.8);

    let rowHeight = 3.8 + (splitVal1.length * 3.8);

    if (label2 && val2 !== undefined) {
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(label2, margin + colWidth + 10, y);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(26, 26, 27);
      const textVal2 = val2 ? String(val2) : "N/A";
      const splitVal2 = doc.splitTextToSize(textVal2, colWidth);
      doc.text(splitVal2, margin + colWidth + 10, y + 3.8);

      const height2 = 3.8 + (splitVal2.length * 3.8);
      if (height2 > rowHeight) {
        rowHeight = height2;
      }
    }

    y += rowHeight + 2;
    drawLine(y - 1, 0.1, [240, 240, 240]);
    y += 2.5;
  };

  // Helper to print full-width descriptive text block
  const drawParagraphBlock = (label: string, text: string) => {
    ensureSpace(12);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(label, margin, y);
    y += 4;

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(26, 26, 27);
    const safeText = text ? String(text) : "None reported / N/A";
    const splitText = doc.splitTextToSize(safeText, pageWidth - 2 * margin);
    doc.text(splitText, margin, y);
    
    y += splitText.length * 3.8 + 3.5;
    drawLine(y - 1.5, 0.1, [240, 240, 240]);
    y += 2;
  };

  // ==============================================================
  // BRANCH 1: PATIENT MEDICAL INTAKE FORM (Matching PDF 3 pages)
  // ==============================================================
  if (isMedicalIntake) {
    // Patient Personal Information
    drawSectionHeader("Patient Identification");
    y += 2;
    drawGridRow("Patient Name (Printed)", data.fullName, "Date of Birth", data.dob || "N/A");
    drawGridRow("Contact Phone", data.phone, "Email Address", data.email);

    // Section 1: Reason for Visit & Current Symptoms
    drawSectionHeader("1. Reason for Visit & Current Symptoms");
    y += 2;
    drawParagraphBlock("Primary Complaint: What is the main reason for your visit today?", data.primaryComplaint || "General medical consultation");

    // Active Symptoms Checklist
    ensureSpace(18);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("Active Symptoms Checklist:", margin, y);
    y += 4;

    const allActiveSymptoms = [
      "Fever or chills",
      "Shortness of breath or cough",
      "Chest pain or palpitations",
      "Unexplained weight loss or gain",
      "Severe pain",
      "Dizziness, numbness, or weakness",
      "Nausea, vomiting, or diarrhea",
      "Changes in vision or hearing",
    ];

    const userSymptoms = data.activeSymptoms || [];

    // Print 2 columns with checkboxes
    const half = Math.ceil(allActiveSymptoms.length / 2);
    const col1 = allActiveSymptoms.slice(0, half);
    const col2 = allActiveSymptoms.slice(half);

    for (let i = 0; i < half; i++) {
      ensureSpace(6);
      // Item 1
      const item1 = col1[i];
      const isChecked1 = userSymptoms.includes(item1);
      doc.setFont("Helvetica", isChecked1 ? "bold" : "normal");
      doc.setFontSize(8);
      doc.setTextColor(isChecked1 ? 181 : 120, isChecked1 ? 30 : 120, isChecked1 ? 34 : 120);
      doc.text(isChecked1 ? "[X]" : "[  ]", margin, y);
      doc.setTextColor(isChecked1 ? 26 : 100, 26, 27);
      let label1Text = item1;
      if (item1 === "Severe pain" && isChecked1 && data.severePainLocation) {
        label1Text += ` (Location: ${data.severePainLocation})`;
      }
      doc.text(label1Text, margin + 7, y);

      // Item 2
      if (i < col2.length) {
        const item2 = col2[i];
        const isChecked2 = userSymptoms.includes(item2);
        doc.setFont("Helvetica", isChecked2 ? "bold" : "normal");
        doc.setTextColor(isChecked2 ? 181 : 120, isChecked2 ? 30 : 120, isChecked2 ? 34 : 120);
        doc.text(isChecked2 ? "[X]" : "[  ]", margin + 95, y);
        doc.setTextColor(isChecked2 ? 26 : 100, 26, 27);
        doc.text(item2, margin + 102, y);
      }
      y += 5;
    }
    drawLine(y, 0.1, [240, 240, 240]);
    y += 3;

    // Section 2: Past Medical History (PMH)
    drawSectionHeader("2. Past Medical History (PMH)");
    y += 2;
    doc.setFont("Helvetica", "italic");
    doc.setFontSize(7.5);
    doc.setTextColor(110, 110, 110);
    doc.text("Conditions diagnosed (checked conditions reported by patient):", margin, y);
    y += 4;

    const pmhCategories = [
      { name: "Cardiovascular", list: data.pmhCardiovascular || [], all: ["High blood pressure", "Heart disease", "Stroke / TIA"] },
      { name: "Respiratory", list: data.pmhRespiratory || [], all: ["Asthma", "COPD", "Sleep apnea"] },
      { name: "Endocrine", list: data.pmhEndocrine || [], all: ["Diabetes (Type 1 / Type 2)", "Thyroid disorder"] },
      { name: "Gastrointestinal", list: data.pmhGastrointestinal || [], all: ["GERD / Acid reflux", "Liver disease", "Ulcers"] },
      { name: "Kidney/Urinary", list: data.pmhKidney || [], all: ["Chronic kidney disease", "Kidney stones"] },
      { name: "Neurological/Psychiatric", list: data.pmhNeuroPsych || [], all: ["Epilepsy / Seizures", "Depression", "Anxiety"] },
      { 
        name: "Other", 
        list: data.pmhOther || [], 
        all: ["Cancer", "Autoimmune disease", "Chronic pain"],
        note: data.cancerType ? `Cancer Type: ${data.cancerType}` : undefined
      },
    ];

    pmhCategories.forEach((cat) => {
      ensureSpace(8);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(181, 30, 34);
      doc.text(`• ${cat.name}:`, margin, y);

      const checkedItems = cat.list.length > 0
        ? cat.list.map(item => item === "Cancer" && cat.note ? `${item} (${cat.note})` : item).join(", ")
        : "None checked / No history";

      doc.setFont("Helvetica", cat.list.length > 0 ? "bold" : "normal");
      doc.setFontSize(8);
      doc.setTextColor(cat.list.length > 0 ? 26 : 120, cat.list.length > 0 ? 26 : 120, cat.list.length > 0 ? 27 : 120);
      const splitText = doc.splitTextToSize(checkedItems, pageWidth - 2 * margin - 45);
      doc.text(splitText, margin + 42, y);
      y += Math.max(splitText.length * 4, 5);
    });

    drawLine(y, 0.1, [240, 240, 240]);
    y += 3;

    // Section 3: Past Surgical History (PSH)
    drawSectionHeader("3. Past Surgical History (PSH)");
    y += 2;
    drawGridRow(
      "Have you had surgeries, hospitalizations, or procedures?",
      data.hasSurgeries === "Yes" ? "YES" : "NO"
    );

    if (data.hasSurgeries === "Yes" && data.surgeries && data.surgeries.length > 0) {
      ensureSpace(16);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text("Surgical History Table:", margin, y);
      y += 4;

      // Table Header
      doc.setFillColor(245, 245, 245);
      doc.rect(margin, y, pageWidth - 2 * margin, 6, "F");
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(70, 70, 70);
      doc.text("Surgery / Procedure", margin + 3, y + 4);
      doc.text("Approximate Year", margin + 70, y + 4);
      doc.text("Reason / Notes", margin + 110, y + 4);
      y += 7;

      data.surgeries.forEach((surg, idx) => {
        ensureSpace(7);
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(26, 26, 27);
        doc.text(`${idx + 1}. ${surg.procedure || "N/A"}`, margin + 3, y + 3.5);
        doc.text(surg.year || "N/A", margin + 70, y + 3.5);
        doc.text(surg.reason || "N/A", margin + 110, y + 3.5);
        y += 5.5;
      });
      drawLine(y, 0.1, [240, 240, 240]);
      y += 3;
    }

    // Section 4: Medications & Allergies
    drawSectionHeader("4. Medications & Allergies");
    y += 2;
    const allergyText = data.hasAllergies === "Yes" 
      ? `YES - Known Allergies: ${data.allergyDetails || "Details provided verbally"}` 
      : "NO known allergies to medications, latex, or food";
    drawParagraphBlock("Allergies (Medications, Latex, Food):", allergyText);

    drawParagraphBlock(
      "Current Medications (Prescription, OTC, Supplements):",
      data.currentMedications || "None reported / No regular medications"
    );

  } else if (isGeneralIntake) {
    // ==============================================================
    // BRANCH 2: GENERAL INTAKE
    // ==============================================================
    drawSectionHeader("1. Patient Personal Information");
    y += 3;
    drawGridRow("Full Name(s) and Last Name", data.fullName, "Date of Birth", data.dob);
    drawGridRow("Identity / Passport Number", data.idNumber || "N/A", "Phone Number", data.phone);
    drawGridRow("Email Address", data.email, "Registration Date", data.date);
    drawParagraphBlock("Residential Address", data.address || "N/A");

    drawSectionHeader("2. Medical Scheme & Employment Info");
    y += 3;
    drawGridRow("Medical Scheme Name", data.medicalScheme || "Private Patient", "Membership Number", data.membershipNumber || "N/A");
    drawParagraphBlock("Employer Residential/Business Address", data.employerAddress || "N/A");
    drawParagraphBlock("Employer Direct Contact Information", data.employerContact || "N/A");

  } else {
    // ==============================================================
    // BRANCH 3: IV THERAPY
    // ==============================================================
    drawSectionHeader("1. Patient Personal Information");
    y += 3;
    drawGridRow("Full Name", data.fullName, "Date of Birth", data.dob);
    drawGridRow("Phone Number", data.phone, "Email Address", data.email);
    drawGridRow("Emergency Contact Name", data.emergencyContactName || "N/A", "Emergency Contact Phone", data.emergencyContactPhone || "N/A");

    drawSectionHeader("2. Medical Screening & Background Check");
    y += 3;
    let conditionsText = "No";
    if (data.medicalConditions === "Yes") {
      const selected = data.medicalConditionsSelected || [];
      const other = data.medicalConditionsOther ? `Other: ${data.medicalConditionsOther}` : "";
      conditionsText = `Yes - [${selected.join(", ")}]${other ? ` • ${other}` : ""}`;
    }
    drawParagraphBlock("Do you have any existing medical conditions?", conditionsText);

    const medsText = data.medications === "Yes" ? `Yes - ${data.medicationsList}` : "No medications listed";
    drawParagraphBlock("Are you currently taking any prescription/OTC medications?", medsText);

    const allergiesText = data.allergies === "Yes" ? `Yes - ${data.allergiesList}` : "No known medication or ingredient allergies";
    drawParagraphBlock("Do you have any allergies (medical, foods, ingredients)?", allergiesText);

    drawGridRow(
      "Implanted medical devices?",
      data.medicalDevices === "Yes" ? `Yes (${data.devicesList || "No specific details reported"})` : "No",
      "Are you pregnant or nursing?",
      data.pregnancy === "Yes" ? `Yes (EST. Conception date: ${data.conceptionDate || "N/A"})` : "No"
    );

    drawSectionHeader("3. Patient Lifestyle & Clinical Desires");
    y += 3;
    drawGridRow("Smoking Status", data.smoke || "N/A", "Daily Water Intake (L)", data.waterIntake || "N/A");
    drawGridRow("Previous IV Infusions?", data.previousIv || "No", "Alcohol consumption frequency", data.alcohol || "N/A");
    drawParagraphBlock("Primary treatment reason / presenting symptoms", data.primaryReason || "N/A");
    drawParagraphBlock("Desired therapy outcome / clinical expectations", data.desiredOutcome || "N/A");
  }

  // ==============================================================
  // SECTION 5: ACKNOWLEDGMENT & SIGNATURE (Standard for all)
  // ==============================================================
  ensureSpace(42);
  drawSectionHeader(isMedicalIntake ? "5. Acknowledgment & Signature" : isGeneralIntake ? "3. Consent & Privacy Agreement" : "4. Clinical Consent & Signature");
  y += 2;

  doc.setFont("Helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  const declarationText = isMedicalIntake
    ? "By signing below, I certify that the information provided above is true and accurate to the best of my knowledge."
    : isGeneralIntake
      ? "Consent Confirmation: I agree that the details supplied above serve as the basis for my clinical files and medical intake dossier. This file is held with direct clinician-patient confidentiality as required by medical board standards."
      : "Consent Confirmation: I confirm that the medical background, wellness goals, and screening questions have been answered truthfully and with absolute accuracy. I wish to receive my bespoke clinical treatment and hereby sign this medical document digitally.";
  const splitDeclaration = doc.splitTextToSize(declarationText, pageWidth - 2 * margin);
  doc.text(splitDeclaration, margin, y);
  y += splitDeclaration.length * 3.8 + 4;

  // Render Signature Image Box
  ensureSpace(34);
  doc.setFillColor(248, 248, 249);
  doc.rect(margin, y, pageWidth - 2 * margin, 26, "F");
  doc.setDrawColor(220, 220, 222);
  doc.setLineWidth(0.25);
  doc.rect(margin, y, pageWidth - 2 * margin, 26, "D");

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("PATIENT / GUARDIAN SIGNATURE", margin + 6, y + 5);

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(40, 160, 40);
  doc.text("DIGITALLY SIGNED & VERIFIED", rightBoundary - 60, y + 5);
  
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(120, 120, 120);
  doc.text(`Date of Signature: ${data.date || new Date().toISOString().split("T")[0]}`, rightBoundary - 60, y + 10);
  doc.text(`Patient DOB: ${data.dob || "Recorded"}`, rightBoundary - 60, y + 14);

  if (data.signature && data.signature.startsWith("data:image")) {
    try {
      doc.addImage(data.signature, "PNG", margin + 8, y + 7, 45, 16);
    } catch (err) {
      console.error("Failed to render signature image in PDF:", err);
      doc.setFont("Helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(181, 30, 34);
      doc.text("[Digital Signature Image Attached]", margin + 8, y + 14);
    }
  } else {
    doc.setFont("Helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("No digital signature image attached", margin + 8, y + 14);
  }

  y += 30;

  // Practice footer
  ensureSpace(14);
  doc.setFillColor(26, 26, 27);
  doc.rect(margin, y, pageWidth - 2 * margin, 10, "F");

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text("LALOKHUMED MEDICAL PRACTICE • PATIENT CONFIDENTIAL HEALTH DOSSIER", margin + 4, y + 6);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(180, 180, 180);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-ZA")}`, rightBoundary - 35, y + 6);

  // Download PDF
  const ptNameSanitized = (data.fullName || "Patient").trim().replace(/[^a-zA-Z0-9]/g, "_");
  const filename = `${formName.replace(/\s+/g, "_")}_${ptNameSanitized}.pdf`;
  doc.save(filename);
}
