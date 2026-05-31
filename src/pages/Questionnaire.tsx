import { useForm, Controller } from "react-hook-form";
import { ShieldCheck, HeartPulse, Stethoscope, User, AlertCircle, CheckCircle2, Loader2, ClipboardList, Briefcase, Activity, Calendar, Eraser, PenTool } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import SignaturePad from "signature_pad";
import { cn } from "@/src/lib/utils";
import { db, handleFirestoreError, OperationType } from "@/src/lib/firebase";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";

type IVQuestionnaireData = {
  fullName: string;
  dob: string;
  phone: string;
  email: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  medicalConditions: string;
  medicalConditionsSelected?: string[];
  medicalConditionsOther?: string;
  medications: string;
  medicationsList?: string;
  allergies: string;
  allergiesList?: string;
  adverseReactions: string;
  reactionsList?: string;
  medicalDevices: string;
  devicesList?: string;
  pregnancy: string;
  conceptionDate?: string;
  primaryReason: string;
  symptomsDuration: string;
  desiredOutcome: string;
  smoke: string;
  smokeAmount?: string;
  alcohol: string;
  waterIntake: string;
  previousIv: string;
  consent: boolean;
  signature: string; // Base64 string from canvas
  date: string;
  formType: "IV Therapy";
};

type GeneralIntakeData = {
  fullName: string;
  dob: string;
  idNumber: string;
  medicalScheme: string;
  membershipNumber: string;
  email: string;
  address: string;
  phone: string;
  employerAddress: string;
  employerContact: string;
  consent: boolean;
  signature: string;
  date: string;
  formType: "General Intake";
};

type FormState = 'selection' | 'iv' | 'general';

const MEDICAL_CONDITIONS_OPTIONS = [
  "Asthma",
  "Kidney disease",
  "Congestive heart failure",
  "Hypertension",
  "Diabetes",
  "Cancer",
  "G6PD deficiency"
];

export default function Questionnaire() {
  const [formType, setFormType] = useState<FormState>('selection');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const ivCanvasRef = useRef<HTMLCanvasElement>(null);
  const generalCanvasRef = useRef<HTMLCanvasElement>(null);
  const ivSignatureRef = useRef<SignaturePad | null>(null);
  const generalSignatureRef = useRef<SignaturePad | null>(null);

  const ivForm = useForm<IVQuestionnaireData>({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      formType: "IV Therapy",
      medicalConditionsSelected: []
    }
  });

  const generalForm = useForm<GeneralIntakeData>({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      formType: "General Intake"
    }
  });

  // Clear submit error when any field changes
  useEffect(() => {
    const ivory = ivForm.watch(() => {
      if (submitError) setSubmitError(null);
    });
    const general = generalForm.watch(() => {
      if (submitError) setSubmitError(null);
    });
    return () => {
      ivory.unsubscribe();
      general.unsubscribe();
    };
  }, [ivForm, generalForm, submitError]);

  const watchIV = {
    medicalConditions: ivForm.watch("medicalConditions"),
    medications: ivForm.watch("medications"),
    allergies: ivForm.watch("allergies"),
    adverseReactions: ivForm.watch("adverseReactions"),
    medicalDevices: ivForm.watch("medicalDevices"),
    pregnancy: ivForm.watch("pregnancy"),
    smoke: ivForm.watch("smoke"),
    previousIv: ivForm.watch("previousIv")
  };

  // Initialize signature pads
  useEffect(() => {
    const resizeCanvas = (canvas: HTMLCanvasElement, padRef: React.MutableRefObject<SignaturePad | null>) => {
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      
      // Only resize if dimensions actually changed to avoid unnecessary clears
      if (canvas.width !== width * ratio || canvas.height !== height * ratio) {
        canvas.width = width * ratio;
        canvas.height = height * ratio;
        canvas.getContext("2d")?.scale(ratio, ratio);
        padRef.current?.clear(); // Resizing clears the canvas, so we clear the pad state too
      }
    };

    const initPad = () => {
      if (formType === 'iv' && ivCanvasRef.current) {
        if (!ivSignatureRef.current) {
          ivSignatureRef.current = new SignaturePad(ivCanvasRef.current, {
            penColor: "#8B0000"
          });
          ivSignatureRef.current.addEventListener("endStroke", () => {
            handleEndSignature('iv');
          });
        }
        resizeCanvas(ivCanvasRef.current, ivSignatureRef);
      } else if (formType === 'general' && generalCanvasRef.current) {
        if (!generalSignatureRef.current) {
          generalSignatureRef.current = new SignaturePad(generalCanvasRef.current, {
            penColor: "#8B0000"
          });
          generalSignatureRef.current.addEventListener("endStroke", () => {
            handleEndSignature('general');
          });
        }
        resizeCanvas(generalCanvasRef.current, generalSignatureRef);
      }
    };

    // Small timeout to ensure layout has settled
    const timer = setTimeout(initPad, 100);
    window.addEventListener("resize", initPad);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", initPad);
      if (ivSignatureRef.current) {
        ivSignatureRef.current.off();
        ivSignatureRef.current = null;
      }
      if (generalSignatureRef.current) {
        generalSignatureRef.current.off();
        generalSignatureRef.current = null;
      }
    };
  }, [formType]);

  const handleClearSignature = (type: 'iv' | 'general') => {
    if (type === 'iv' && ivSignatureRef.current) {
      ivSignatureRef.current.clear();
      ivForm.setValue('signature', '', { shouldValidate: true });
    } else if (type === 'general' && generalSignatureRef.current) {
      generalSignatureRef.current.clear();
      generalForm.setValue('signature', '', { shouldValidate: true });
    }
    setSubmitError(null);
  };

  const handleEndSignature = (type: 'iv' | 'general') => {
    if (type === 'iv' && ivSignatureRef.current) {
      if (!ivSignatureRef.current.isEmpty()) {
        ivForm.setValue('signature', ivSignatureRef.current.toDataURL(), { shouldValidate: true });
      }
    } else if (type === 'general' && generalSignatureRef.current) {
      if (!generalSignatureRef.current.isEmpty()) {
        generalForm.setValue('signature', generalSignatureRef.current.toDataURL(), { shouldValidate: true });
      }
    }
    if (submitError) setSubmitError(null);
  };

  const onSubmit = async (data: IVQuestionnaireData | GeneralIntakeData) => {
    setSubmitError(null);
    if (!data.signature) {
      setSubmitError("Please provide a digital signature.");
      const signatureEl = document.querySelector('.signature-pad-container');
      signatureEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Custom validation for medical conditions if "Yes" is selected
    if (formType === 'iv') {
      const ivData = data as IVQuestionnaireData;
      if (ivData.medicalConditions === 'Yes') {
        const hasSelection = ivData.medicalConditionsSelected && ivData.medicalConditionsSelected.length > 0;
        const hasOther = ivData.medicalConditionsOther && ivData.medicalConditionsOther.trim().length > 0;
        
        if (!hasSelection && !hasOther) {
          setSubmitError("Please select at least one medical condition or describe your condition in the 'Other' field.");
          const medicalEl = document.getElementsByName('medicalConditions')[0];
          medicalEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }
      }
    }

    setIsSubmitting(true);
    
    try {
      const questionnaireRef = doc(collection(db, "questionnaires"));
      const questionnaireData = {
        ...data,
        createdAt: serverTimestamp(),
        formCategory: formType === 'iv' ? 'IV Therapy' : 'General Intake'
      };
      await setDoc(questionnaireRef, questionnaireData);

      // Send email alert asynchronously in the background to avoid blocking submission
      const emailData = {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        formCategory: questionnaireData.formCategory
      };

      fetch("/api/send-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "questionnaire", data: emailData })
      }).then(async (response) => {
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Questionnaire email notification returned an error status:", response.status, errorText);
        } else {
          const result = await response.json();
          console.log("Questionnaire email notification sent successfully:", result);
        }
      }).catch((err) => {
        console.error("Notification failed", err);
      });
      
      setSubmitted(true);
      window.scrollTo(0, 0);
    } catch (error) {
      setSubmitError("There was an error saving your questionnaire. Please try again or contact us directly.");
      handleFirestoreError(error, OperationType.WRITE, "questionnaires");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onInvalid = (errors: any) => {
    const firstError = Object.keys(errors)[0];
    
    if (firstError) {
      const fieldLabels: Record<string, string> = {
        fullName: "Full Name",
        dob: "Date of Birth",
        phone: "Phone Number",
        email: "Email Address",
        emergencyContactName: "Emergency Contact Name",
        emergencyContactPhone: "Emergency Contact Phone",
        medicalConditions: "Medical Conditions",
        medications: "Medications",
        allergies: "Allergies",
        adverseReactions: "Adverse Reactions",
        medicalDevices: "Medical Devices",
        pregnancy: "Pregnancy",
        primaryReason: "Primary Reason",
        symptomsDuration: "Duration of Symptoms",
        desiredOutcome: "Desired Outcome",
        smoke: "Smoking Status",
        alcohol: "Alcohol Consumption",
        waterIntake: "Daily Water Intake",
        previousIv: "Previous IV Therapy",
        consent: "Consent Checkbox",
        signature: "Signature",
        date: "Date",
        idNumber: "Identity/Passport Number",
        address: "Home Address"
      };
      
      const label = fieldLabels[firstError as keyof typeof fieldLabels] || firstError;
      setSubmitError(`Missing required field: ${label}. Please complete all marked fields.`);
      
      const element = document.getElementsByName(firstError)[0] || document.querySelector(`[name="${firstError}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      setSubmitError("Please complete all required fields marked with * and provide a signature before submitting.");
      window.scrollTo({ top: 100, behavior: 'smooth' });
    }
  };

  if (submitted) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center bg-brand-grey/30">
        <div className="max-w-xl w-full px-4 text-center">
          <div className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-serif mb-6">Form Submitted Successfully</h1>
          <p className="text-gray-500 text-lg mb-8 leading-relaxed">
            Your clinical information has been received. Our team will review your details to ensure the best possible care for your visit.
          </p>
          <div className="flex flex-col gap-4">
              <a href="/booking" className="inline-block bg-brand-red text-white py-4 px-10 rounded-full font-bold hover:shadow-xl transition-all">
                Proceed to Booking
              </a>
              <a href="/" className="text-gray-400 hover:text-brand-text transition-colors">Return to Home</a>
          </div>
        </div>
      </div>
    );
  }

  if (formType === 'selection') {
    return (
      <div className="pt-32 bg-brand-grey/20 min-h-screen">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16 px-4">
            <ClipboardList className="w-16 h-16 text-brand-red mx-auto mb-6" />
            <h1 className="text-5xl font-serif text-brand-text mb-6">Patient Forms</h1>
            <p className="text-gray-500 text-xl leading-relaxed italic max-w-2xl mx-auto">
              Please select the form most relevant to your visit today. This information ensures your safety and helps us tailor our clinical services to your needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20 px-4">
            <button 
              onClick={() => setFormType('general')}
              className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100 text-left hover:scale-[1.02] transition-all group"
            >
              <div className="w-14 h-14 bg-brand-red/5 text-brand-red rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand-red group-hover:text-white transition-all">
                 <User className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-serif mb-4">General Client Intake</h3>
              <p className="text-gray-500 mb-8 leading-relaxed">Required for all new patients seeking general wellness consultations, checkups, or non-IV related therapies.</p>
              <span className="text-brand-red font-bold flex items-center gap-2">Start Form <ShieldCheck className="w-4 h-4" /></span>
            </button>

            <button 
              onClick={() => setFormType('iv')}
              className="bg-white p-10 rounded-[3rem] shadow-xl border-2 border-brand-red/10 text-left hover:scale-[1.02] transition-all group"
            >
              <div className="w-14 h-14 bg-brand-red/5 text-brand-red rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand-red group-hover:text-white transition-all">
                 <HeartPulse className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-serif mb-4">IV Therapy Questionnaire</h3>
              <p className="text-gray-500 mb-8 leading-relaxed">Specific medical screening for patients seeking Intravenous Vitamin or Mineral therapy to ensure safety and eligibility.</p>
              <span className="text-brand-red font-bold flex items-center gap-2">Start Form <ShieldCheck className="w-4 h-4" /></span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 bg-brand-grey/20 pb-40">
      {/* Header */}
      <section className="py-20 bg-white border-b border-gray-100 mb-12">
        <div className="max-w-4xl mx-auto px-4">
           <button 
             onClick={() => setFormType('selection')}
             className="text-gray-400 hover:text-brand-red mb-8 flex items-center gap-2 font-medium transition-all"
           >
             ← Back to selection
           </button>
           <div className="text-center">
             <ShieldCheck className="w-12 h-12 text-brand-red mx-auto mb-6" />
             <h1 className="text-4xl md:text-6xl font-serif text-brand-text mb-6">
               {formType === 'iv' ? 'IV Therapy Questionnaire' : 'General Client Intake'}
             </h1>
             <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed italic">
               "Confidentiality Notice: The information provided below will be used to ensure your safety and manage your clinical records securely."
             </p>
           </div>
        </div>
      </section>

      {formType === 'iv' ? (
        <form onSubmit={ivForm.handleSubmit(onSubmit, onInvalid)} className="max-w-4xl mx-auto px-4 space-y-12">
          {/* IV FORM CONTENT */}
          <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-10 h-10 rounded-full bg-brand-red/5 flex items-center justify-center text-brand-red"><User className="w-5 h-5"/></div>
              <h2 className="text-2xl font-serif">1. Personal Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField label="Full Name *" register={ivForm.register("fullName", { required: true })} error={ivForm.formState.errors.fullName} />
              <FormField label="Date of Birth *" type="date" register={ivForm.register("dob", { required: true })} error={ivForm.formState.errors.dob} />
              <FormField label="Phone *" register={ivForm.register("phone", { required: true })} error={ivForm.formState.errors.phone} />
              <FormField label="Email *" type="email" register={ivForm.register("email", { required: true })} error={ivForm.formState.errors.email} />
              <FormField label="Emergency Contact Name *" register={ivForm.register("emergencyContactName", { required: true })} error={ivForm.formState.errors.emergencyContactName} />
              <FormField label="Emergency Contact Phone *" register={ivForm.register("emergencyContactPhone", { required: true })} error={ivForm.formState.errors.emergencyContactPhone} />
            </div>
          </div>

          <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-10 h-10 rounded-full bg-brand-red/5 flex items-center justify-center text-brand-red"><HeartPulse className="w-5 h-5"/></div>
              <h2 className="text-2xl font-serif">2. Medical History & Screening</h2>
            </div>
            <div className="space-y-12">
              <RadioGroup label="Do you have any existing medical conditions? *" name="medicalConditions" register={ivForm.register("medicalConditions", { required: true })} watchValue={watchIV.medicalConditions} error={ivForm.formState.errors.medicalConditions} />
              {watchIV.medicalConditions === "Yes" && (
                <div className="space-y-6 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-4 duration-500">
                  <p className="text-sm font-bold text-gray-700">Please select applicable conditions:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {MEDICAL_CONDITIONS_OPTIONS.map(condition => (
                      <label key={condition} className="flex items-center gap-3 p-4 bg-brand-grey/50 rounded-2xl cursor-pointer hover:bg-brand-grey transition-colors">
                        <input 
                          type="checkbox" 
                          value={condition}
                          {...ivForm.register("medicalConditionsSelected")}
                          className="w-5 h-5 rounded border-gray-300 text-brand-red focus:ring-brand-red"
                        />
                        <span className="text-gray-700 font-medium">{condition}</span>
                      </label>
                    ))}
                  </div>
                  <TextAreaField label="Other existing condition(s) not listed above" register={ivForm.register("medicalConditionsOther")} />
                </div>
              )}
              <RadioGroup label="Are you currently taking any medications? *" name="medications" register={ivForm.register("medications", { required: true })} watchValue={watchIV.medications} error={ivForm.formState.errors.medications} />
              {watchIV.medications === "Yes" && <TextAreaField label="Please list medications" register={ivForm.register("medicationsList")} />}
              <RadioGroup label="Do you have any allergies? *" name="allergies" register={ivForm.register("allergies", { required: true })} watchValue={watchIV.allergies} error={ivForm.formState.errors.allergies} />
              {watchIV.allergies === "Yes" && <TextAreaField label="Please list allergies" register={ivForm.register("allergiesList")} />}
            </div>
          </div>

          <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-10 h-10 rounded-full bg-brand-red/5 flex items-center justify-center text-brand-red"><HeartPulse className="w-5 h-5"/></div>
              <h2 className="text-2xl font-serif">3. Medical Devices & Pregnancy</h2>
            </div>
            <div className="space-y-12">
              <RadioGroup label="Are you implanted with any medical devices? *" name="medicalDevices" register={ivForm.register("medicalDevices", { required: true })} watchValue={watchIV.medicalDevices} error={ivForm.formState.errors.medicalDevices} />
              {watchIV.medicalDevices === "Yes" && <TextAreaField label="Please list devices" register={ivForm.register("devicesList")} />}
              <RadioGroup label="Are you pregnant or attempting to conceive? *" name="pregnancy" register={ivForm.register("pregnancy", { required: true })} watchValue={watchIV.pregnancy} error={ivForm.formState.errors.pregnancy} />
              {watchIV.pregnancy === "Yes" && <FormField label="Conception Date" type="date" register={ivForm.register("conceptionDate")} />}
            </div>
          </div>

          <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-10 h-10 rounded-full bg-brand-red/5 flex items-center justify-center text-brand-red"><Stethoscope className="w-5 h-5"/></div>
              <h2 className="text-2xl font-serif">4. Treatment Goals</h2>
            </div>
            <div className="space-y-8">
              <TextAreaField label="Primary reason for seeking IV therapy? *" register={ivForm.register("primaryReason", { required: true })} />
              <TextAreaField label="How long have you experiencing these symptoms? *" register={ivForm.register("symptomsDuration", { required: true })} />
              <TextAreaField label="Desired outcomes? *" register={ivForm.register("desiredOutcome", { required: true })} />
            </div>
          </div>

          <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-sm border border-gray-100">
             <div className="flex items-center gap-4 mb-10">
              <div className="w-10 h-10 rounded-full bg-brand-red/5 flex items-center justify-center text-brand-red"><User className="w-5 h-5"/></div>
              <h2 className="text-2xl font-serif">5. Lifestyle</h2>
            </div>
            <div className="space-y-8">
              <RadioGroup label="Do you smoke? *" name="smoke" register={ivForm.register("smoke", { required: true })} watchValue={watchIV.smoke} error={ivForm.formState.errors.smoke} />
              <TextAreaField label="Alcohol consumption frequency? *" register={ivForm.register("alcohol", { required: true })} />
              <TextAreaField label="Daily water intake (Litres)? *" register={ivForm.register("waterIntake", { required: true })} />
              <RadioGroup label="Previous IV therapy? *" name="previousIv" register={ivForm.register("previousIv", { required: true })} watchValue={watchIV.previousIv} error={ivForm.formState.errors.previousIv} />
            </div>
          </div>

          {/* Consent */}
          <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-lg border-2 border-brand-red/10">
            <div className="flex items-start gap-4 mb-8">
               <AlertCircle className="w-6 h-6 text-brand-red shrink-0 mt-1" />
               <p className="text-sm text-gray-700 italic border-l-2 border-brand-red pl-4">
                I confirm that the information provided above is accurate. I wish to sign digitally.
               </p>
            </div>
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <input type="checkbox" {...ivForm.register("consent", { required: true })} className="w-6 h-6 rounded border-gray-300 text-brand-red focus:ring-brand-red" />
                <label className="text-sm font-bold text-gray-900">I Consent and Agree</label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                <div className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-sm font-bold text-gray-700">Digital Signature *</label>
                    <button 
                      type="button" 
                      onClick={() => handleClearSignature('iv')}
                      className="text-xs text-gray-400 hover:text-brand-red flex items-center gap-1 transition-colors"
                    >
                      <Eraser className="w-3 h-3" /> Clear
                    </button>
                  </div>
                  <div className="bg-brand-grey rounded-3xl border-2 border-dashed border-gray-200 overflow-hidden relative group signature-pad-container">
                    <canvas 
                      ref={ivCanvasRef}
                      className="w-full h-40 cursor-crosshair bg-brand-grey"
                      style={{ touchAction: 'none' }}
                    />
                    {!ivForm.watch('signature') && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:opacity-0 transition-opacity">
                        <p className="text-gray-400 text-sm flex items-center gap-2">
                          <PenTool className="w-4 h-4" /> Sign Here
                        </p>
                      </div>
                    )}
                  </div>
                  <input type="hidden" {...ivForm.register("signature", { required: true })} />
                </div>
                <FormField label="Date *" type="date" register={ivForm.register("date", { required: true })} />
              </div>
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full bg-brand-red text-white py-6 rounded-[2.5rem] font-bold text-xl shadow-2xl hover:bg-brand-red-dark transition-all transform hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70">
            {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "Submit Medical Questionnaire"}
          </button>
        </form>
      ) : (
        <form onSubmit={generalForm.handleSubmit(onSubmit, onInvalid)} className="max-w-4xl mx-auto px-4 space-y-12">
          {/* GENERAL CLINIC INTAKE FORM */}
          <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-10 h-10 rounded-full bg-brand-red/5 flex items-center justify-center text-brand-red"><User className="w-5 h-5"/></div>
              <h2 className="text-2xl font-serif">1. Personal Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField label="Full Name(s) and Last Name(s) *" register={generalForm.register("fullName", { required: true })} error={generalForm.formState.errors.fullName} />
              <FormField label="What is your date of birth? *" type="date" register={generalForm.register("dob", { required: true })} error={generalForm.formState.errors.dob} />
              <FormField label="IDENTITY/PASSPORT NUMBER *" register={generalForm.register("idNumber", { required: true })} error={generalForm.formState.errors.idNumber} />
              <FormField label="Email address *" type="email" register={generalForm.register("email", { required: true })} error={generalForm.formState.errors.email} />
              <FormField label="Contact number *" register={generalForm.register("phone", { required: true })} error={generalForm.formState.errors.phone} />
              <div className="md:col-span-2">
                <TextAreaField label="Home address *" register={generalForm.register("address", { required: true })} error={generalForm.formState.errors.address} />
              </div>
            </div>
          </div>

          <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-10 h-10 rounded-full bg-brand-red/5 flex items-center justify-center text-brand-red"><ShieldCheck className="w-5 h-5"/></div>
              <h2 className="text-2xl font-serif">2. Medical Scheme & Employment</h2>
            </div>
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField label="Medical Scheme Name" register={generalForm.register("medicalScheme")} />
                <FormField label="Membership Number" register={generalForm.register("membershipNumber")} />
              </div>
              <TextAreaField label="Employer Address" register={generalForm.register("employerAddress")} />
              <TextAreaField label="Employer Contact Details" register={generalForm.register("employerContact")} />
            </div>
          </div>

          <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-lg border-2 border-brand-red/10">
            <div className="flex items-start gap-4 mb-8">
               <AlertCircle className="w-6 h-6 text-brand-red shrink-0 mt-1" />
               <p className="text-sm text-gray-700 italic border-l-2 border-brand-red pl-4">
                I understand that this form serves as a basis for my clinical records and that the information is held in strict confidence.
               </p>
            </div>
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <input type="checkbox" {...generalForm.register("consent", { required: true })} className="w-6 h-6 rounded border-gray-300 text-brand-red focus:ring-brand-red" />
                <label className="text-sm font-bold text-gray-900">I Agree to the Clinical Privacy Policy</label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                <div className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-sm font-bold text-gray-700">Digital Signature *</label>
                    <button 
                      type="button" 
                      onClick={() => handleClearSignature('general')}
                      className="text-xs text-gray-400 hover:text-brand-red flex items-center gap-1 transition-colors"
                    >
                      <Eraser className="w-3 h-3" /> Clear
                    </button>
                  </div>
                  <div className="bg-brand-grey rounded-3xl border-2 border-dashed border-gray-200 overflow-hidden relative group signature-pad-container">
                    <canvas 
                      ref={generalCanvasRef}
                      className="w-full h-40 cursor-crosshair bg-brand-grey"
                      style={{ touchAction: 'none' }}
                    />
                    {!generalForm.watch('signature') && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:opacity-0 transition-opacity">
                        <p className="text-gray-400 text-sm flex items-center gap-2">
                          <PenTool className="w-4 h-4" /> Sign Here
                        </p>
                      </div>
                    )}
                  </div>
                  <input type="hidden" {...generalForm.register("signature", { required: true })} />
                </div>
                <FormField label="Date *" type="date" register={generalForm.register("date", { required: true })} />
              </div>
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full bg-brand-red text-white py-6 rounded-[2.5rem] font-bold text-xl shadow-2xl hover:bg-brand-red-dark transition-all transform hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70">
            {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "Complete Intake Form"}
          </button>
        </form>
      )}

      {submitError && (
        <div className="max-w-4xl mx-auto px-4 mt-8">
           <div className="bg-red-50 text-red-600 p-6 rounded-3xl border border-red-100 flex items-center gap-4">
            <AlertCircle className="w-6 h-6 shrink-0" />
            <p className="font-bold">{submitError}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function FormField({ label, type = "text", register, error }: any) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-gray-700 ml-1">{label}</label>
      <input 
        type={type} 
        {...register} 
        className={cn(
          "w-full bg-brand-grey border-none rounded-2xl p-4 focus:ring-2 focus:ring-brand-red outline-none transition-all",
          error ? "ring-2 ring-red-200" : ""
        )}
      />
    </div>
  );
}

function TextAreaField({ label, register, error }: any) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-gray-700 ml-1">{label}</label>
      <textarea 
        {...register} 
        rows={3}
        className={cn(
          "w-full bg-brand-grey border-none rounded-2xl p-4 focus:ring-2 focus:ring-brand-red outline-none transition-all resize-none",
          error ? "ring-2 ring-red-200" : ""
        )}
      />
    </div>
  );
}

function RadioGroup({ label, name, register, watchValue, error }: any) {
  return (
    <div className="space-y-4">
      <label className="text-sm font-bold text-gray-700 ml-1 block leading-relaxed">{label}</label>
      <div className="flex gap-6">
        {["No", "Yes"].map((option) => (
          <label key={option} className="flex items-center gap-3 cursor-pointer group">
            <input 
              type="radio" 
              name={name}
              value={option}
              {...register}
              className="hidden"
            />
            <div className={cn(
              "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
              watchValue === option ? "border-brand-red bg-brand-red text-white" : "border-gray-200 group-hover:border-brand-red",
              error ? "border-red-300 ring-2 ring-red-100" : ""
            )}>
              {watchValue === option && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
            <span className={cn(
              "font-medium",
              watchValue === option ? "text-brand-red" : "text-gray-500"
            )}>{option}</span>
          </label>
        ))}
      </div>
      {error && <p className="text-xs text-red-500 ml-1 font-bold">This field is required</p>}
    </div>
  );
}
