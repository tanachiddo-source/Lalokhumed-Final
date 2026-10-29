export type SurgicalHistoryRow = {
  procedure: string;
  year: string;
  reason: string;
};

export type MedicalIntakeData = {
  // Identification
  fullName: string;
  dob: string;
  phone: string;
  email: string;
  
  // Section 1: Reason for Visit & Current Symptoms
  primaryComplaint: string;
  activeSymptoms: string[];
  severePainLocation?: string;

  // Section 2: Past Medical History (PMH)
  pmhCardiovascular: string[];
  pmhRespiratory: string[];
  pmhEndocrine: string[];
  pmhGastrointestinal: string[];
  pmhKidney: string[];
  pmhNeuroPsych: string[];
  pmhOther: string[];
  cancerType?: string;

  // Section 3: Past Surgical History (PSH)
  hasSurgeries: "Yes" | "No";
  surgeries: SurgicalHistoryRow[];

  // Section 4: Medications & Allergies
  hasAllergies: "Yes" | "No";
  allergyDetails?: string;
  currentMedications: string;

  // Section 5: Acknowledgment & Signature
  certificationAgreed: boolean;
  signature: string; // Base64 data URL
  date: string;

  // Meta
  formCategory?: string;
  formType?: string;
};
