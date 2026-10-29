import { useState, useRef, useEffect } from "react";
import SignaturePad from "signature_pad";
import { 
  AlertCircle, 
  CheckCircle2, 
  Eraser, 
  PenTool, 
  ShieldAlert, 
  Plus, 
  Trash2, 
  FileText, 
  HeartPulse, 
  Activity, 
  Pill, 
  Sparkles, 
  ArrowRight,
  User,
  Zap
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { MedicalIntakeData, SurgicalHistoryRow } from "@/src/types/medicalIntake";

interface MedicalIntakeFormProps {
  onComplete: (data: MedicalIntakeData) => void;
  onSkipEmergency?: () => void;
  initialData?: Partial<MedicalIntakeData>;
  isPreBooking?: boolean;
}

const ACTIVE_SYMPTOMS_OPTIONS = [
  "Fever or chills",
  "Shortness of breath or cough",
  "Chest pain or palpitations",
  "Unexplained weight loss or gain",
  "Severe pain",
  "Dizziness, numbness, or weakness",
  "Nausea, vomiting, or diarrhea",
  "Changes in vision or hearing",
];

const PMH_CARDIO = ["High blood pressure", "Heart disease", "Stroke / TIA"];
const PMH_RESPIRATORY = ["Asthma", "COPD", "Sleep apnea"];
const PMH_ENDOCRINE = ["Diabetes (Type 1 / Type 2)", "Thyroid disorder"];
const PMH_GI = ["GERD / Acid reflux", "Liver disease", "Ulcers"];
const PMH_KIDNEY = ["Chronic kidney disease", "Kidney stones"];
const PMH_NEURO = ["Epilepsy / Seizures", "Depression", "Anxiety"];
const PMH_OTHER = ["Cancer", "Autoimmune disease", "Chronic pain"];

export default function MedicalIntakeForm({
  onComplete,
  onSkipEmergency,
  initialData,
  isPreBooking = true,
}: MedicalIntakeFormProps) {
  // Identification
  const [fullName, setFullName] = useState(initialData?.fullName || "");
  const [dob, setDob] = useState(initialData?.dob || "");
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [email, setEmail] = useState(initialData?.email || "");

  // Section 1
  const [primaryComplaint, setPrimaryComplaint] = useState(initialData?.primaryComplaint || "");
  const [activeSymptoms, setActiveSymptoms] = useState<string[]>(initialData?.activeSymptoms || []);
  const [severePainLocation, setSeverePainLocation] = useState(initialData?.severePainLocation || "");

  // Section 2: PMH
  const [pmhCardiovascular, setPmhCardiovascular] = useState<string[]>(initialData?.pmhCardiovascular || []);
  const [pmhRespiratory, setPmhRespiratory] = useState<string[]>(initialData?.pmhRespiratory || []);
  const [pmhEndocrine, setPmhEndocrine] = useState<string[]>(initialData?.pmhEndocrine || []);
  const [pmhGastrointestinal, setPmhGastrointestinal] = useState<string[]>(initialData?.pmhGastrointestinal || []);
  const [pmhKidney, setPmhKidney] = useState<string[]>(initialData?.pmhKidney || []);
  const [pmhNeuroPsych, setPmhNeuroPsych] = useState<string[]>(initialData?.pmhNeuroPsych || []);
  const [pmhOther, setPmhOther] = useState<string[]>(initialData?.pmhOther || []);
  const [cancerType, setCancerType] = useState(initialData?.cancerType || "");

  // Section 3: PSH
  const [hasSurgeries, setHasSurgeries] = useState<"Yes" | "No">(initialData?.hasSurgeries || "No");
  const [surgeries, setSurgeries] = useState<SurgicalHistoryRow[]>(
    initialData?.surgeries && initialData.surgeries.length > 0
      ? initialData.surgeries
      : [
          { procedure: "", year: "", reason: "" },
          { procedure: "", year: "", reason: "" },
          { procedure: "", year: "", reason: "" }
        ]
  );

  // Section 4: Medications & Allergies
  const [hasAllergies, setHasAllergies] = useState<"Yes" | "No">(initialData?.hasAllergies || "No");
  const [allergyDetails, setAllergyDetails] = useState(initialData?.allergyDetails || "");
  const [currentMedications, setCurrentMedications] = useState(initialData?.currentMedications || "");

  // Section 5: Acknowledgment & Signature
  const [certificationAgreed, setCertificationAgreed] = useState(initialData?.certificationAgreed ?? true);
  const [signatureData, setSignatureData] = useState(initialData?.signature || "");
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split("T")[0]);

  const [formError, setFormError] = useState<string | null>(null);

  // Canvas & Signature Pad
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sigPadRef = useRef<SignaturePad | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const pad = new SignaturePad(canvas, {
      penColor: "#8B0000",
      backgroundColor: "rgba(0,0,0,0)",
    });
    sigPadRef.current = pad;

    const resizeCanvas = () => {
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      if (width > 0 && height > 0) {
        canvas.width = width * ratio;
        canvas.height = height * ratio;
        canvas.getContext("2d")?.scale(ratio, ratio);
        pad.clear();
        if (signatureData) {
          pad.fromDataURL(signatureData);
        }
      }
    };

    const timer = setTimeout(resizeCanvas, 100);
    window.addEventListener("resize", resizeCanvas);

    pad.addEventListener("endStroke", () => {
      if (!pad.isEmpty()) {
        setSignatureData(pad.toDataURL());
        setFormError(null);
      }
    });

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", resizeCanvas);
      pad.off();
      sigPadRef.current = null;
    };
  }, []);

  const handleClearSignature = () => {
    if (sigPadRef.current) {
      sigPadRef.current.clear();
    }
    setSignatureData("");
  };

  const toggleArrayItem = (list: string[], setList: (v: string[]) => void, item: string) => {
    if (list.includes(item)) {
      setList(list.filter((x) => x !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleAddSurgeryRow = () => {
    setSurgeries([...surgeries, { procedure: "", year: "", reason: "" }]);
  };

  const handleRemoveSurgeryRow = (index: number) => {
    setSurgeries(surgeries.filter((_, i) => i !== index));
  };

  const handleSurgeryChange = (index: number, field: keyof SurgicalHistoryRow, value: string) => {
    const updated = [...surgeries];
    updated[index][field] = value;
    setSurgeries(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Basic Validation
    if (!fullName.trim()) {
      setFormError("Please enter the patient's full name.");
      scrollToTop();
      return;
    }
    if (!dob) {
      setFormError("Please provide the patient's date of birth.");
      scrollToTop();
      return;
    }
    if (!phone.trim()) {
      setFormError("Please enter a valid phone number.");
      scrollToTop();
      return;
    }
    if (!email.trim()) {
      setFormError("Please enter a valid email address.");
      scrollToTop();
      return;
    }
    if (!primaryComplaint.trim()) {
      setFormError("Please describe the primary complaint / reason for visit (Section 1).");
      const el = document.getElementById("primary-complaint-section");
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    if (activeSymptoms.includes("Severe pain") && !severePainLocation.trim()) {
      setFormError("Please specify the severe pain location.");
      const el = document.getElementById("active-symptoms-section");
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    if (pmhOther.includes("Cancer") && !cancerType.trim()) {
      setFormError("Please specify the type of cancer diagnosed.");
      const el = document.getElementById("pmh-section");
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    if (hasAllergies === "Yes" && !allergyDetails.trim()) {
      setFormError("Please list your known allergies and reactions (Section 4).");
      const el = document.getElementById("allergies-section");
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    if (!certificationAgreed) {
      setFormError("Please check the certification acknowledgment box in Section 5.");
      const el = document.getElementById("signature-section");
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    if (!signatureData) {
      setFormError("Please provide a digital signature in Section 5.");
      const el = document.getElementById("signature-section");
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    // Filter out completely empty surgery rows if Yes
    const cleanedSurgeries = hasSurgeries === "Yes"
      ? surgeries.filter((s) => s.procedure.trim() || s.year.trim() || s.reason.trim())
      : [];

    const intakePayload: MedicalIntakeData = {
      fullName: fullName.trim(),
      dob,
      phone: phone.trim(),
      email: email.trim(),
      primaryComplaint: primaryComplaint.trim(),
      activeSymptoms,
      severePainLocation: severePainLocation.trim() || "",
      pmhCardiovascular,
      pmhRespiratory,
      pmhEndocrine,
      pmhGastrointestinal,
      pmhKidney,
      pmhNeuroPsych,
      pmhOther,
      cancerType: cancerType.trim() || "",
      hasSurgeries,
      surgeries: cleanedSurgeries,
      hasAllergies,
      allergyDetails: allergyDetails.trim() || "",
      currentMedications: currentMedications.trim(),
      certificationAgreed,
      signature: signatureData,
      date,
      formCategory: "Patient Medical Intake Form",
      formType: "Patient Medical Intake Form",
    };

    onComplete(intakePayload);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 100, behavior: "smooth" });
  };

  return (
    <div className="space-y-10">
      {/* Emergency Fast-Track Skip Banner */}
      {isPreBooking && onSkipEmergency && (
        <div className="bg-gradient-to-r from-red-500/10 via-amber-500/10 to-red-500/10 border-2 border-red-200/80 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-red-600/20">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-600 text-white">
                    Emergency Triage
                  </span>
                  <h3 className="text-xl font-serif text-brand-text font-bold">
                    Urgent or Emergency Booking?
                  </h3>
                </div>
                <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                  If you need immediate clinical care or an urgent call-out and cannot take the time to complete this intake form right now, you can skip directly to booking your appointment. Our medical team will perform initial clinical screening verbally upon arrival.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onSkipEmergency}
              className="w-full sm:w-auto px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-red-600/25 transition-all flex items-center justify-center gap-2 shrink-0 active:scale-95"
            >
              <Zap className="w-4 h-4 fill-white" />
              Skip for Emergency Booking
            </button>
          </div>
        </div>
      )}

      {/* Main Intake Form Container */}
      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Form Header Info Box */}
        <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-sm border border-gray-100 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-brand-red via-red-600 to-brand-red" />
          <div className="w-16 h-16 rounded-2xl bg-brand-red/5 text-brand-red flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8" />
          </div>
          <h2 className="text-3xl md:text-4xl font-serif text-brand-text mb-2">
            Patient Medical Intake Form
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            Please complete this clinical screening prior to your consultation. Your medical history helps our practitioners provide accurate, safe, and tailored clinical care.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-400 font-medium">
            <span>273 Bryanston Drive, Sandton</span>
            <span>•</span>
            <span>Tel: +27 872 559 066</span>
            <span>•</span>
            <span>Strict Medical Confidentiality</span>
          </div>
        </div>

        {/* Patient Personal Details */}
        <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-brand-red/5 flex items-center justify-center text-brand-red">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-serif font-bold text-brand-text">Patient Information</h3>
              <p className="text-xs text-gray-400">Identifies your electronic medical health record</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">
                Full Name (Printed) <span className="text-brand-red">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Sarah Jenkins"
                className="w-full bg-brand-grey border border-transparent rounded-2xl p-4 focus:ring-2 focus:ring-brand-red focus:bg-white outline-none transition-all text-sm font-medium"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">
                Date of Birth (DOB) <span className="text-brand-red">*</span>
              </label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full bg-brand-grey border border-transparent rounded-2xl p-4 focus:ring-2 focus:ring-brand-red focus:bg-white outline-none transition-all text-sm font-medium"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">
                Contact Phone Number <span className="text-brand-red">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 082 123 4567"
                className="w-full bg-brand-grey border border-transparent rounded-2xl p-4 focus:ring-2 focus:ring-brand-red focus:bg-white outline-none transition-all text-sm font-medium"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">
                Email Address <span className="text-brand-red">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. sarah@example.com"
                className="w-full bg-brand-grey border border-transparent rounded-2xl p-4 focus:ring-2 focus:ring-brand-red focus:bg-white outline-none transition-all text-sm font-medium"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 1: Reason for Visit & Current Symptoms */}
        <div id="primary-complaint-section" className="bg-white p-8 md:p-10 rounded-[3rem] shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-brand-red/5 flex items-center justify-center text-brand-red font-bold">
              1
            </div>
            <div>
              <h3 className="text-xl font-serif font-bold text-brand-text">
                Reason for Visit & Current Symptoms
              </h3>
              <p className="text-xs text-gray-400">Describe what brings you in today</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">
                Primary Complaint: What is the main reason for your visit today? <span className="text-brand-red">*</span>
              </label>
              <textarea
                value={primaryComplaint}
                onChange={(e) => setPrimaryComplaint(e.target.value)}
                rows={3}
                placeholder="Please describe your current symptoms, discomfort, onset, or reason for requesting care..."
                className="w-full bg-brand-grey border border-transparent rounded-2xl p-4 focus:ring-2 focus:ring-brand-red focus:bg-white outline-none transition-all text-sm leading-relaxed"
                required
              />
            </div>

            <div id="active-symptoms-section" className="space-y-4 pt-4 border-t border-gray-100">
              <div>
                <label className="text-sm font-bold text-gray-700 ml-1">
                  Active Symptoms: Are you currently experiencing any of the following? (Check all that apply)
                </label>
                <p className="text-xs text-gray-400 ml-1">Select all symptoms present in the last 48-72 hours</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ACTIVE_SYMPTOMS_OPTIONS.map((sym) => {
                  const checked = activeSymptoms.includes(sym);
                  return (
                    <label
                      key={sym}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all border",
                        checked
                          ? "bg-red-50/60 border-brand-red/30 text-brand-text"
                          : "bg-brand-grey/40 border-transparent hover:bg-brand-grey text-gray-700"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleArrayItem(activeSymptoms, setActiveSymptoms, sym)}
                        className="w-5 h-5 rounded border-gray-300 text-brand-red focus:ring-brand-red"
                      />
                      <span className="text-sm font-medium">{sym}</span>
                    </label>
                  );
                })}
              </div>

              {activeSymptoms.includes("Severe pain") && (
                <div className="bg-red-50/50 p-4 rounded-2xl border border-red-100 animate-in fade-in duration-300">
                  <label className="text-xs font-bold text-red-900 block mb-1">
                    Please specify Severe Pain Location <span className="text-brand-red">*</span>
                  </label>
                  <input
                    type="text"
                    value={severePainLocation}
                    onChange={(e) => setSeverePainLocation(e.target.value)}
                    placeholder="e.g. Lower right abdomen, left lower back, sharp chest pressure..."
                    className="w-full bg-white border border-red-200 rounded-xl p-3 focus:ring-2 focus:ring-brand-red outline-none text-sm"
                    required
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Past Medical History (PMH) */}
        <div id="pmh-section" className="bg-white p-8 md:p-10 rounded-[3rem] shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-brand-red/5 flex items-center justify-center text-brand-red font-bold">
              2
            </div>
            <div>
              <h3 className="text-xl font-serif font-bold text-brand-text">
                Past Medical History (PMH)
              </h3>
              <p className="text-xs text-gray-400">
                Have you ever been diagnosed with any of the following conditions? (Check all that apply)
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Category: Cardiovascular */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-brand-red flex items-center gap-2 uppercase tracking-wide text-[11px]">
                <HeartPulse className="w-4 h-4" /> Cardiovascular
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {PMH_CARDIO.map((c) => {
                  const checked = pmhCardiovascular.includes(c);
                  return (
                    <label
                      key={c}
                      className={cn(
                        "flex items-center gap-3 p-3.5 rounded-2xl cursor-pointer transition-all border text-sm",
                        checked
                          ? "bg-red-50/60 border-brand-red/30 font-semibold text-brand-text"
                          : "bg-brand-grey/40 border-transparent hover:bg-brand-grey text-gray-600"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleArrayItem(pmhCardiovascular, setPmhCardiovascular, c)}
                        className="w-4 h-4 rounded border-gray-300 text-brand-red focus:ring-brand-red"
                      />
                      <span>{c}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Category: Respiratory */}
            <div className="space-y-3 pt-3 border-t border-gray-100">
              <h4 className="text-sm font-bold text-brand-red flex items-center gap-2 uppercase tracking-wide text-[11px]">
                <Activity className="w-4 h-4" /> Respiratory
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {PMH_RESPIRATORY.map((c) => {
                  const checked = pmhRespiratory.includes(c);
                  return (
                    <label
                      key={c}
                      className={cn(
                        "flex items-center gap-3 p-3.5 rounded-2xl cursor-pointer transition-all border text-sm",
                        checked
                          ? "bg-red-50/60 border-brand-red/30 font-semibold text-brand-text"
                          : "bg-brand-grey/40 border-transparent hover:bg-brand-grey text-gray-600"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleArrayItem(pmhRespiratory, setPmhRespiratory, c)}
                        className="w-4 h-4 rounded border-gray-300 text-brand-red focus:ring-brand-red"
                      />
                      <span>{c}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Category: Endocrine */}
            <div className="space-y-3 pt-3 border-t border-gray-100">
              <h4 className="text-sm font-bold text-brand-red flex items-center gap-2 uppercase tracking-wide text-[11px]">
                <Sparkles className="w-4 h-4" /> Endocrine
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PMH_ENDOCRINE.map((c) => {
                  const checked = pmhEndocrine.includes(c);
                  return (
                    <label
                      key={c}
                      className={cn(
                        "flex items-center gap-3 p-3.5 rounded-2xl cursor-pointer transition-all border text-sm",
                        checked
                          ? "bg-red-50/60 border-brand-red/30 font-semibold text-brand-text"
                          : "bg-brand-grey/40 border-transparent hover:bg-brand-grey text-gray-600"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleArrayItem(pmhEndocrine, setPmhEndocrine, c)}
                        className="w-4 h-4 rounded border-gray-300 text-brand-red focus:ring-brand-red"
                      />
                      <span>{c}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Category: Gastrointestinal */}
            <div className="space-y-3 pt-3 border-t border-gray-100">
              <h4 className="text-sm font-bold text-brand-red flex items-center gap-2 uppercase tracking-wide text-[11px]">
                <Activity className="w-4 h-4" /> Gastrointestinal
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {PMH_GI.map((c) => {
                  const checked = pmhGastrointestinal.includes(c);
                  return (
                    <label
                      key={c}
                      className={cn(
                        "flex items-center gap-3 p-3.5 rounded-2xl cursor-pointer transition-all border text-sm",
                        checked
                          ? "bg-red-50/60 border-brand-red/30 font-semibold text-brand-text"
                          : "bg-brand-grey/40 border-transparent hover:bg-brand-grey text-gray-600"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleArrayItem(pmhGastrointestinal, setPmhGastrointestinal, c)}
                        className="w-4 h-4 rounded border-gray-300 text-brand-red focus:ring-brand-red"
                      />
                      <span>{c}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Category: Kidney/Urinary */}
            <div className="space-y-3 pt-3 border-t border-gray-100">
              <h4 className="text-sm font-bold text-brand-red flex items-center gap-2 uppercase tracking-wide text-[11px]">
                <Activity className="w-4 h-4" /> Kidney / Urinary
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PMH_KIDNEY.map((c) => {
                  const checked = pmhKidney.includes(c);
                  return (
                    <label
                      key={c}
                      className={cn(
                        "flex items-center gap-3 p-3.5 rounded-2xl cursor-pointer transition-all border text-sm",
                        checked
                          ? "bg-red-50/60 border-brand-red/30 font-semibold text-brand-text"
                          : "bg-brand-grey/40 border-transparent hover:bg-brand-grey text-gray-600"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleArrayItem(pmhKidney, setPmhKidney, c)}
                        className="w-4 h-4 rounded border-gray-300 text-brand-red focus:ring-brand-red"
                      />
                      <span>{c}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Category: Neurological/Psychiatric */}
            <div className="space-y-3 pt-3 border-t border-gray-100">
              <h4 className="text-sm font-bold text-brand-red flex items-center gap-2 uppercase tracking-wide text-[11px]">
                <Activity className="w-4 h-4" /> Neurological / Psychiatric
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {PMH_NEURO.map((c) => {
                  const checked = pmhNeuroPsych.includes(c);
                  return (
                    <label
                      key={c}
                      className={cn(
                        "flex items-center gap-3 p-3.5 rounded-2xl cursor-pointer transition-all border text-sm",
                        checked
                          ? "bg-red-50/60 border-brand-red/30 font-semibold text-brand-text"
                          : "bg-brand-grey/40 border-transparent hover:bg-brand-grey text-gray-600"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleArrayItem(pmhNeuroPsych, setPmhNeuroPsych, c)}
                        className="w-4 h-4 rounded border-gray-300 text-brand-red focus:ring-brand-red"
                      />
                      <span>{c}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Category: Other */}
            <div className="space-y-3 pt-3 border-t border-gray-100">
              <h4 className="text-sm font-bold text-brand-red flex items-center gap-2 uppercase tracking-wide text-[11px]">
                <Activity className="w-4 h-4" /> Other Conditions
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {PMH_OTHER.map((c) => {
                  const checked = pmhOther.includes(c);
                  return (
                    <label
                      key={c}
                      className={cn(
                        "flex items-center gap-3 p-3.5 rounded-2xl cursor-pointer transition-all border text-sm",
                        checked
                          ? "bg-red-50/60 border-brand-red/30 font-semibold text-brand-text"
                          : "bg-brand-grey/40 border-transparent hover:bg-brand-grey text-gray-600"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleArrayItem(pmhOther, setPmhOther, c)}
                        className="w-4 h-4 rounded border-gray-300 text-brand-red focus:ring-brand-red"
                      />
                      <span>{c}</span>
                    </label>
                  );
                })}
              </div>

              {pmhOther.includes("Cancer") && (
                <div className="bg-red-50/50 p-4 rounded-2xl border border-red-100 animate-in fade-in duration-300">
                  <label className="text-xs font-bold text-red-900 block mb-1">
                    Please specify Cancer Type <span className="text-brand-red">*</span>
                  </label>
                  <input
                    type="text"
                    value={cancerType}
                    onChange={(e) => setCancerType(e.target.value)}
                    placeholder="e.g. Breast, Melanoma, Colorectal, Lymphoma..."
                    className="w-full bg-white border border-red-200 rounded-xl p-3 focus:ring-2 focus:ring-brand-red outline-none text-sm"
                    required
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Past Surgical History (PSH) */}
        <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-brand-red/5 flex items-center justify-center text-brand-red font-bold">
              3
            </div>
            <div>
              <h3 className="text-xl font-serif font-bold text-brand-text">
                Past Surgical History (PSH)
              </h3>
              <p className="text-xs text-gray-400">Hospitalizations and previous procedures</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-700 ml-1 block">
                Have you ever had any surgeries, hospitalizations, or major medical procedures? <span className="text-brand-red">*</span>
              </label>
              <div className="flex gap-4">
                {(["No", "Yes"] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setHasSurgeries(opt)}
                    className={cn(
                      "px-8 py-3 rounded-2xl text-sm font-bold border transition-all",
                      hasSurgeries === opt
                        ? "bg-brand-red text-white border-brand-red shadow-md shadow-brand-red/20"
                        : "bg-brand-grey border-transparent text-gray-600 hover:border-gray-200"
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {hasSurgeries === "Yes" && (
              <div className="space-y-4 pt-4 border-t border-gray-100 animate-in fade-in duration-300">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  List of Surgeries / Hospitalizations:
                </p>

                <div className="space-y-3">
                  {surgeries.map((row, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 bg-brand-grey/50 rounded-2xl border border-gray-100 relative group"
                    >
                      <div className="md:col-span-1 flex items-center justify-center font-bold text-gray-400 text-sm">
                        #{idx + 1}
                      </div>
                      <div className="md:col-span-5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                          Surgery / Procedure
                        </label>
                        <input
                          type="text"
                          value={row.procedure}
                          onChange={(e) => handleSurgeryChange(idx, "procedure", e.target.value)}
                          placeholder="e.g. Appendectomy, Knee Arthroscopy"
                          className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:border-brand-red"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                          Approx. Year
                        </label>
                        <input
                          type="text"
                          value={row.year}
                          onChange={(e) => handleSurgeryChange(idx, "year", e.target.value)}
                          placeholder="e.g. 2018"
                          className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:border-brand-red"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                          Reason / Notes
                        </label>
                        <input
                          type="text"
                          value={row.reason}
                          onChange={(e) => handleSurgeryChange(idx, "reason", e.target.value)}
                          placeholder="e.g. Acute appendicitis, full recovery"
                          className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:border-brand-red"
                        />
                      </div>
                      <div className="md:col-span-1 flex items-end justify-center pb-1">
                        {surgeries.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSurgeryRow(idx)}
                            className="text-gray-400 hover:text-red-500 p-2 transition-colors"
                            title="Remove row"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleAddSurgeryRow}
                  className="px-4 py-2.5 rounded-xl border border-dashed border-gray-300 text-xs font-bold text-gray-600 hover:text-brand-red hover:border-brand-red transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Another Procedure
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Section 4: Medications & Allergies */}
        <div id="allergies-section" className="bg-white p-8 md:p-10 rounded-[3rem] shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-brand-red/5 flex items-center justify-center text-brand-red font-bold">
              4
            </div>
            <div>
              <h3 className="text-xl font-serif font-bold text-brand-text">
                Medications & Allergies
              </h3>
              <p className="text-xs text-gray-400">Allergen safety and current drug regimen</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Allergies Toggle */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-700 ml-1 block">
                Allergies: Do you have any allergies to medications, latex, or food? <span className="text-brand-red">*</span>
              </label>
              <div className="flex gap-4">
                {(["No", "Yes"] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setHasAllergies(opt)}
                    className={cn(
                      "px-8 py-3 rounded-2xl text-sm font-bold border transition-all",
                      hasAllergies === opt
                        ? "bg-brand-red text-white border-brand-red shadow-md shadow-brand-red/20"
                        : "bg-brand-grey border-transparent text-gray-600 hover:border-gray-200"
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {hasAllergies === "Yes" && (
              <div className="space-y-2 pt-2 animate-in fade-in duration-300">
                <label className="text-sm font-bold text-gray-700 ml-1">
                  Please list allergy and reaction: <span className="text-brand-red">*</span>
                </label>
                <textarea
                  value={allergyDetails}
                  onChange={(e) => setAllergyDetails(e.target.value)}
                  rows={2}
                  placeholder="e.g. Penicillin (anaphylaxis/hives), Latex (rash), Peanuts (throat swelling)..."
                  className="w-full bg-brand-grey border border-transparent rounded-2xl p-4 focus:ring-2 focus:ring-brand-red focus:bg-white outline-none transition-all text-sm leading-relaxed"
                  required
                />
              </div>
            )}

            {/* Current Medications */}
            <div className="space-y-2 pt-4 border-t border-gray-100">
              <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                <Pill className="w-4 h-4 text-brand-red" />
                Current Medications: Please list any prescription drugs, over-the-counter medications, or supplements you take regularly:
              </label>
              <textarea
                value={currentMedications}
                onChange={(e) => setCurrentMedications(e.target.value)}
                rows={3}
                placeholder="e.g. Metformin 500mg daily, Amlodipine 5mg once daily, Vitamin D3, Omega 3 fish oil (or enter 'None')..."
                className="w-full bg-brand-grey border border-transparent rounded-2xl p-4 focus:ring-2 focus:ring-brand-red focus:bg-white outline-none transition-all text-sm leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Acknowledgment & Signature */}
        <div id="signature-section" className="bg-white p-8 md:p-10 rounded-[3rem] shadow-lg border-2 border-brand-red/10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-brand-red/5 flex items-center justify-center text-brand-red font-bold">
              5
            </div>
            <div>
              <h3 className="text-xl font-serif font-bold text-brand-text">
                Acknowledgment & Signature
              </h3>
              <p className="text-xs text-gray-400">Patient or Guardian legal medical attestation</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Certification Statement */}
            <div className="bg-brand-grey/50 p-5 rounded-2xl border border-gray-100">
              <p className="text-sm text-gray-700 italic leading-relaxed">
                "By signing below, I certify that the information provided above is true and accurate to the best of my knowledge."
              </p>
              <label className="flex items-center gap-3 mt-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={certificationAgreed}
                  onChange={(e) => setCertificationAgreed(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-brand-red focus:ring-brand-red"
                  required
                />
                <span className="text-sm font-bold text-gray-900">
                  I agree and certify that this clinical information is accurate.
                </span>
              </label>
            </div>

            {/* Signature Pad */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-sm font-bold text-gray-700">
                    Patient / Guardian Signature <span className="text-brand-red">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleClearSignature}
                    className="text-xs text-gray-400 hover:text-brand-red flex items-center gap-1 transition-colors"
                  >
                    <Eraser className="w-3.5 h-3.5" /> Clear Signature
                  </button>
                </div>

                <div className="bg-brand-grey rounded-3xl border-2 border-dashed border-gray-200 overflow-hidden relative group">
                  <canvas
                    ref={canvasRef}
                    className="w-full h-40 cursor-crosshair bg-brand-grey"
                    style={{ touchAction: "none" }}
                  />
                  {!signatureData && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:opacity-0 transition-opacity">
                      <p className="text-gray-400 text-xs md:text-sm flex items-center gap-2">
                        <PenTool className="w-4 h-4" /> Please draw your signature here
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">
                    Signature Date <span className="text-brand-red">*</span>
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-brand-grey border border-transparent rounded-2xl p-4 focus:ring-2 focus:ring-brand-red focus:bg-white outline-none transition-all text-sm font-medium"
                    required
                  />
                </div>
                <div className="p-4 bg-green-50 rounded-2xl border border-green-100 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                  <p className="text-xs text-green-800 font-medium">
                    Digital medical record will be encrypted and submitted directly to your supervising physician.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Error Banner */}
        {formError && (
          <div className="bg-red-50 text-red-600 p-6 rounded-3xl border border-red-100 flex items-center gap-4">
            <AlertCircle className="w-6 h-6 shrink-0" />
            <p className="font-bold text-sm">{formError}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
          <button
            type="submit"
            className="w-full sm:flex-1 bg-brand-red text-white py-5 px-8 rounded-full font-bold text-lg shadow-xl hover:bg-brand-red-dark transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-3"
          >
            <span>{isPreBooking ? "Save Intake & Schedule Appointment" : "Submit Medical Intake Form"}</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          {isPreBooking && onSkipEmergency && (
            <button
              type="button"
              onClick={onSkipEmergency}
              className="w-full sm:w-auto px-8 py-5 rounded-full font-bold text-sm text-red-600 bg-red-50 hover:bg-red-100 transition-all flex items-center justify-center gap-2 border border-red-200"
            >
              <Zap className="w-4 h-4 fill-red-600" />
              Emergency? Skip to Schedule
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
