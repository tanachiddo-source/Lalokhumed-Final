import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { 
  ShieldCheck, 
  Calendar, 
  Clock, 
  MapPin, 
  Loader2, 
  AlertCircle, 
  Heart, 
  Stethoscope, 
  Zap, 
  CheckCircle2, 
  FileText, 
  Download, 
  ArrowLeft,
  ChevronRight,
  ShieldAlert
} from "lucide-react";
import { useForm } from "react-hook-form";
import { db, handleFirestoreError, OperationType } from "@/src/lib/firebase";
import { collection, doc, setDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { cn } from "@/src/lib/utils";
import { sanitizeForFirestore } from "@/src/lib/firestoreUtils";
import MedicalIntakeForm from "@/src/components/MedicalIntakeForm";
import { MedicalIntakeData } from "@/src/types/medicalIntake";
import { downloadQuestionnairePDF } from "@/src/utils/pdfGenerator";

type BookingData = {
  fullName: string;
  phone: string;
  email: string;
  service: string;
  preferredTime: string;
  preferredDate: string;
  address?: string;
};

const IN_PRACTICE_TIME_SLOTS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", 
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", 
  "16:00", "16:30"
];

const CONCIERGE_DAYTIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"
];

const CONCIERGE_AFTER_HOURS_SLOTS = [
  "17:00", "18:00", "19:00"
];

const CONCIERGE_NIGHT_SLOTS = [
  "20:00", "21:00"
];

export default function Booking() {
  const [searchParams] = useSearchParams();
  
  // Workflow Step: 'intake' (screening) or 'schedule' (slot & service selection)
  const [currentStep, setCurrentStep] = useState<'intake' | 'schedule'>('intake');
  const [isEmergencyBooking, setIsEmergencyBooking] = useState(false);
  const [intakeSkipped, setIntakeSkipped] = useState(false);
  const [intakeData, setIntakeData] = useState<MedicalIntakeData | null>(null);

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  
  const [serviceCategory, setServiceCategory] = useState<'medical' | 'wellness' | 'concierge'>('medical');

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat === 'medical' || cat === 'wellness' || cat === 'concierge') {
      setServiceCategory(cat);
    }
    const emergencyParam = searchParams.get("emergency");
    if (emergencyParam === "true" || searchParams.get("skip") === "emergency") {
      setIsEmergencyBooking(true);
      setIntakeSkipped(true);
      setCurrentStep("schedule");
    }
  }, [searchParams]);

  const { register, handleSubmit, watch, setValue, getValues, formState: { errors } } = useForm<BookingData>();
  
  // Clear submit error when any field changes
  useEffect(() => {
    const subscription = watch(() => {
      if (submitError) setSubmitError(null);
    });
    return () => subscription.unsubscribe();
  }, [watch, submitError]);

  const selectedDate = watch("preferredDate");
  const selectedTime = watch("preferredTime");

  const medicalServices = [
    "General Consultations (From R800)",
    "Acute Illness Care",
    "Chronic Disease Management",
    "Preventative Health & Wellness Checks",
    "Women’s & Men’s Health",
    "Minor Procedures & Wound Care",
    "Medical Certificates & Referrals"
  ];

  const wellnessServices = [
    "Vitamin & Mineral Booster IV (R940)",
    "Detox IV Drip (R1,300)",
    "Immune Booster IV Drip (R1,300)",
    "Anti-Ageing IV Drip (R1,300)",
    "Gut Health IV Drip (R1,450)",
    "Weight Loss IV Drip (R1,200)",
    "Mood & Brain Booster IV Drip (R1,300)",
    "Fertility IV Drip (R980)",
    "NAD Therapy IV Drip (R2,000)"
  ];

  const conciergeServices = [
    "Daytime Concierge Call-Out (R1,500)",
    "After-Hours Concierge Call-Out (R2,500)",
    "Night Concierge Call-Out (R3,500)"
  ];

  const selectedService = watch("service");

  const getAvailableSlotsForSelection = () => {
    if (serviceCategory !== 'concierge') {
      return IN_PRACTICE_TIME_SLOTS;
    }
    if (!selectedService) return [];
    if (selectedService.includes("Daytime")) {
      return CONCIERGE_DAYTIME_SLOTS;
    }
    if (selectedService.includes("After-Hours")) {
      return CONCIERGE_AFTER_HOURS_SLOTS;
    }
    if (selectedService.includes("Night")) {
      return CONCIERGE_NIGHT_SLOTS;
    }
    return [];
  };

  const availableSlots = getAvailableSlotsForSelection();

  useEffect(() => {
    let active = true;
    if (selectedDate) {
      setLoadingAvailability(true);
      setBookedSlots([]);

      const fetchAvailability = async () => {
        try {
          const q = query(
            collection(db, "availability"), 
            where("date", "==", selectedDate)
          );
          const querySnapshot = await getDocs(q);
          if (active) {
            const booked = querySnapshot.docs.map(doc => doc.data().time);
            setBookedSlots(booked);

            const currentSelectedTime = getValues("preferredTime");
            if (currentSelectedTime && booked.includes(currentSelectedTime)) {
              setValue("preferredTime", "", { shouldValidate: false });
            }
          }
        } catch (error) {
          console.error("Error checking availability:", error);
        } finally {
          if (active) {
            setLoadingAvailability(false);
          }
        }
      };

      fetchAvailability();
    } else {
      setBookedSlots([]);
    }

    return () => {
      active = false;
    };
  }, [selectedDate, setValue, getValues]);

  // Handle Intake Completed
  const handleIntakeComplete = (data: MedicalIntakeData) => {
    setIntakeData(data);
    setIntakeSkipped(false);
    setIsEmergencyBooking(false);

    // Auto-fill booking form with intake details
    setValue("fullName", data.fullName);
    setValue("phone", data.phone);
    setValue("email", data.email);

    // Transition to scheduling step
    setCurrentStep("schedule");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle Emergency Skip
  const handleSkipEmergency = () => {
    setIsEmergencyBooking(true);
    setIntakeSkipped(true);
    setCurrentStep("schedule");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onSubmit = async (data: BookingData) => {
    if (bookedSlots.includes(data.preferredTime)) {
      setSubmitError("Sorry, this time slot was just taken. Please choose another.");
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const bookingRef = doc(collection(db, "bookings"));
      
      const bookingRecord: Record<string, any> = {
        fullName: (data.fullName || "").trim(),
        phone: (data.phone || "").trim(),
        email: (data.email || "").trim(),
        service: data.service || "",
        preferredDate: data.preferredDate || "",
        preferredTime: data.preferredTime || "",
        status: 'pending',
        isEmergencyBooking: Boolean(isEmergencyBooking),
        intakeSkipped: Boolean(intakeSkipped),
        createdAt: serverTimestamp(),
      };

      if (data.address && data.address.trim()) {
        bookingRecord.address = data.address.trim();
      }

      if (intakeData) {
        bookingRecord.intakeData = intakeData;
      }

      const cleanRecord = sanitizeForFirestore(bookingRecord);
      await setDoc(bookingRef, cleanRecord);

      // If intake was completed, also save to questionnaires collection for archive
      if (intakeData) {
        try {
          const qRef = doc(collection(db, "questionnaires"));
          const cleanIntake = sanitizeForFirestore({
            ...intakeData,
            bookingId: bookingRef.id,
            formCategory: "Patient Medical Intake Form",
            createdAt: serverTimestamp(),
          });
          await setDoc(qRef, cleanIntake);
        } catch (qErr) {
          console.warn("Intake questionnaire archival notice:", qErr);
        }
      }

      // Send email alert asynchronously in the background
      fetch("/api/send-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          type: "booking", 
          data: {
            ...cleanRecord,
            createdAt: new Date().toISOString(),
            isEmergency: isEmergencyBooking,
            intakeSkipped: intakeSkipped,
            hasIntake: !!intakeData,
          } 
        })
      }).then(async (response) => {
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Booking email notification returned an error status:", response.status, errorText);
        } else {
          const result = await response.json();
          console.log("Booking email notification sent successfully:", result);
        }
      }).catch((err) => {
        console.error("Notification failed", err);
      });

      setSubmitted(true);
      window.scrollTo(0, 0);
    } catch (error: any) {
      console.error("Appointment submission error:", error);
      const isPermission = error?.code === "permission-denied" || (error?.message && error.message.includes("permission"));
      const isOffline = error?.message && error.message.includes("offline");
      setSubmitError(
        isPermission
          ? "Submission permission error. Please verify your details or contact us directly."
          : isOffline
          ? "Network connection issue. Please check your internet connection."
          : (error?.message && !error.message.includes("FirebaseError") ? error.message : "Failed to request appointment. Please try again or call us.")
      );
      try {
        handleFirestoreError(error, OperationType.WRITE, "bookings");
      } catch (e) {
        // Logged for observability
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const onInvalid = (errors: any) => {
    const firstErrorKey = Object.keys(errors)[0];
    if (firstErrorKey) {
      const fieldLabels: Record<string, string> = {
        fullName: "Full Name",
        phone: "Phone Number",
        email: "Email Address",
        service: "Select Service",
        preferredDate: "Preferred Date",
        preferredTime: "Preferred Time Slot",
        address: "Physical Address"
      };
      const label = fieldLabels[firstErrorKey as keyof typeof fieldLabels] || firstErrorKey;
      setSubmitError(`Missing required field: ${label}. Please complete all marked fields.`);
      
      const element = document.getElementsByName(firstErrorKey)[0];
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      setSubmitError("Please fill in all required fields marked with * before submitting.");
    }
  };

  if (submitted) {
    return (
      <div className="pt-28 min-h-screen flex items-center justify-center bg-brand-grey/30 pb-20">
        <div className="max-w-2xl w-full px-4 text-center">
          <div className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl",
            isEmergencyBooking ? "bg-amber-500 text-white" : "bg-green-500 text-white"
          )}>
            {isEmergencyBooking ? <ShieldAlert className="w-10 h-10" /> : <ShieldCheck className="w-10 h-10" />}
          </div>
          
          <h1 className="text-4xl md:text-5xl font-serif mb-4 text-brand-text">
            {isEmergencyBooking ? "Emergency Booking Request Received" : "Appointment & Intake Confirmed"}
          </h1>
          
          <p className="text-gray-600 text-lg mb-8 leading-relaxed max-w-xl mx-auto">
            {isEmergencyBooking
              ? "Your emergency booking request has been flagged for priority triage. A medical practitioner will contact you immediately to assess your symptoms and confirm the visit."
              : "Thank you for choosing LALOKHUMED. Your screening file and appointment request have been logged. A medical professional will review your dossier and contact you shortly."}
          </p>

          <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-sm border border-gray-100 mb-8 text-left space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Booking Status</span>
              <span className={cn(
                "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                isEmergencyBooking ? "bg-red-50 text-red-600 border border-red-100" : "bg-green-50 text-green-700 border border-green-100"
              )}>
                {isEmergencyBooking ? "🚨 Emergency Priority" : "✓ Intake Dossier Attached"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase">Patient</p>
                <p className="font-semibold text-gray-900">{getValues("fullName")}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase">Contact</p>
                <p className="font-semibold text-gray-900">{getValues("phone")}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase">Requested Service</p>
                <p className="font-semibold text-gray-900">{getValues("service")}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase">Preferred Slot</p>
                <p className="font-semibold text-gray-900">{getValues("preferredDate")} ({getValues("preferredTime")})</p>
              </div>
            </div>

            {intakeData && (
              <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                  <span className="text-xs text-gray-600 font-medium">Digital Medical Intake Form signed & filed</span>
                </div>
                <button
                  onClick={() => downloadQuestionnairePDF(intakeData)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-brand-red text-white text-xs font-bold hover:bg-brand-red-dark transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <Download className="w-4 h-4" /> Download Intake PDF
                </button>
              </div>
            )}

            {isEmergencyBooking && (
              <div className="pt-4 border-t border-gray-100 bg-red-50/50 p-4 rounded-2xl border border-red-100">
                <p className="text-xs text-red-800 leading-relaxed font-medium">
                  <strong>Notice:</strong> Because you selected Emergency Fast-Track, your medical screening will be conducted verbally on-site or via direct phone triage.
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href="/" 
              className="text-gray-400 hover:text-brand-text transition-colors text-sm font-semibold"
            >
              Return to Homepage
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen bg-brand-grey/30 pb-28">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        {/* Stepper Header */}
        <div className="max-w-4xl mx-auto mb-10">
          <div className="flex items-center justify-between p-2 bg-white rounded-3xl shadow-sm border border-gray-100">
            {/* Step 1 Tab */}
            <button
              type="button"
              onClick={() => setCurrentStep('intake')}
              className={cn(
                "flex-1 py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 text-xs md:text-sm font-bold transition-all",
                currentStep === 'intake'
                  ? "bg-brand-red text-white shadow-md shadow-brand-red/20"
                  : "text-gray-500 hover:text-brand-text"
              )}
            >
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs",
                currentStep === 'intake' ? "bg-white text-brand-red" : "bg-gray-100 text-gray-500"
              )}>
                1
              </div>
              <span className="truncate">Patient Medical Intake</span>
              {intakeData && <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />}
            </button>

            <ChevronRight className="w-5 h-5 text-gray-300 mx-2 shrink-0" />

            {/* Step 2 Tab */}
            <button
              type="button"
              onClick={() => setCurrentStep('schedule')}
              className={cn(
                "flex-1 py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 text-xs md:text-sm font-bold transition-all",
                currentStep === 'schedule'
                  ? "bg-brand-red text-white shadow-md shadow-brand-red/20"
                  : "text-gray-500 hover:text-brand-text"
              )}
            >
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs",
                currentStep === 'schedule' ? "bg-white text-brand-red" : "bg-gray-100 text-gray-500"
              )}>
                2
              </div>
              <span className="truncate">Schedule Appointment</span>
              {isEmergencyBooking && (
                <span className="px-1.5 py-0.5 rounded text-[9px] bg-red-100 text-red-700 font-bold shrink-0">
                  Fast-Track
                </span>
              )}
            </button>
          </div>
        </div>

        {/* STEP 1: PATIENT MEDICAL INTAKE FORM */}
        {currentStep === 'intake' && (
          <div className="max-w-4xl mx-auto animate-in fade-in duration-300">
            <MedicalIntakeForm
              onComplete={handleIntakeComplete}
              onSkipEmergency={handleSkipEmergency}
              initialData={intakeData || undefined}
              isPreBooking={true}
            />
          </div>
        )}

        {/* STEP 2: APPOINTMENT SCHEDULING FORM */}
        {currentStep === 'schedule' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <button
                type="button"
                onClick={() => setCurrentStep('intake')}
                className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-brand-red transition-colors mb-6 group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span>Review / Edit Medical Intake Form</span>
              </button>

              <h1 className="text-4xl md:text-6xl font-serif text-brand-text mb-6 leading-tight">
                Select Your <span className="text-brand-red italic">
                  {serviceCategory === 'concierge' ? 'Concierge Slot' : 'Consultation Slot'}
                </span>.
              </h1>
              
              <p className="text-lg text-gray-500 mb-8 leading-relaxed">
                {serviceCategory === 'concierge' 
                  ? "Our clinical doctor team brings world-class medical consultations and tailored IV therapy directly to your Bryanston residence or office."
                  : "Choose your preferred primary medical care consultation or wellness therapy slot at our 273 Bryanston Drive practice."}
              </p>

              {/* Status Callout Card */}
              <div className="mb-10">
                {intakeData ? (
                  <div className="bg-green-50/70 border border-green-200 rounded-3xl p-6 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-green-600 text-white flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-green-900">Medical Intake Completed</h4>
                      <p className="text-xs text-green-700 mt-1 leading-relaxed">
                        Patient: <strong>{intakeData.fullName}</strong>. Primary complaint and medical history are attached to this booking request.
                      </p>
                      <button
                        type="button"
                        onClick={() => setCurrentStep('intake')}
                        className="text-xs font-bold text-green-800 underline mt-2 hover:text-green-900"
                      >
                        Click to review or modify intake answers
                      </button>
                    </div>
                  </div>
                ) : isEmergencyBooking ? (
                  <div className="bg-red-50/80 border-2 border-red-200 rounded-3xl p-6 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 animate-pulse">
                      <Zap className="w-5 h-5 fill-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-600 text-white">
                          Emergency Bypass
                        </span>
                        <h4 className="text-sm font-bold text-red-950">Intake Form Skipped for Urgent Triage</h4>
                      </div>
                      <p className="text-xs text-red-800 mt-1.5 leading-relaxed">
                        You chose to fast-track your booking. Our clinical team will prioritize your triage verbally upon confirmation.
                      </p>
                      <button
                        type="button"
                        onClick={() => setCurrentStep('intake')}
                        className="text-xs font-bold text-brand-red underline mt-2 hover:text-brand-red-dark block"
                      >
                        Have time now? Complete the Medical Intake Form
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="space-y-6">
                <div className="flex gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-brand-red shadow-sm shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-brand-text text-sm">Flexible Scheduling</p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {serviceCategory === 'concierge'
                        ? "Morning, twilight, or night clinical call-outs throughout Bryanston."
                        : "Morning and afternoon clinical slots throughout the week."}
                    </p>
                  </div>
                </div>

                <div className="flex gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-brand-red shadow-sm shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-brand-text text-sm">
                      {serviceCategory === 'concierge' ? "Bryanston Coverage" : "Central Practice Location"}
                    </p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {serviceCategory === 'concierge'
                        ? "Exclusive mobile doctor service dedicated to Bryanston residences and offices."
                        : "273 Bryanston Drive, Sandton. Secure parking available."}
                    </p>
                  </div>
                </div>

                <div className="flex gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-brand-red shadow-sm shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-brand-text text-sm">Doctor Supervised</p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      Every consultation and clinical procedure is managed by registered medical doctors.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Form Card */}
            <div className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-2xl border border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-serif">Appointment Details</h2>
                {isEmergencyBooking && (
                  <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full border border-red-200">
                    Emergency Priority
                  </span>
                )}
              </div>
              
              {submitError && (
                <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3 mb-8 border border-red-100">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p className="text-sm font-bold">{submitError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Full Name</label>
                    <input 
                      {...register("fullName", { required: true })} 
                      className={`w-full bg-brand-grey border-none rounded-2xl p-4 focus:ring-2 focus:ring-brand-red outline-none transition-all ${errors.fullName ? 'ring-2 ring-red-200' : ''}`} 
                      placeholder="John Doe" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Phone Number</label>
                    <input 
                      {...register("phone", { required: true })} 
                      className={`w-full bg-brand-grey border-none rounded-2xl p-4 focus:ring-2 focus:ring-brand-red outline-none transition-all ${errors.phone ? 'ring-2 ring-red-200' : ''}`} 
                      placeholder="e.g. 082 123 4567" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
                  <input 
                    {...register("email", { required: true })} 
                    className={`w-full bg-brand-grey border-none rounded-2xl p-4 focus:ring-2 focus:ring-brand-red outline-none transition-all ${errors.email ? 'ring-2 ring-red-200' : ''}`} 
                    placeholder="john@example.com" 
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-bold text-gray-700 ml-1">Appointment Category</label>
                  <div className="grid grid-cols-3 p-1 bg-brand-grey rounded-2xl border border-gray-100/50">
                    <button
                      type="button"
                      onClick={() => {
                        setServiceCategory('medical');
                        setValue("service", "", { shouldValidate: false });
                      }}
                      className={cn(
                        "py-3 text-[10px] sm:text-xs md:text-sm font-bold tracking-wide rounded-xl transition-all duration-300",
                        serviceCategory === 'medical' 
                          ? "bg-white text-brand-text shadow-sm" 
                          : "text-gray-400 hover:text-gray-600"
                      )}
                    >
                      Primary Care
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setServiceCategory('wellness');
                        setValue("service", "", { shouldValidate: false });
                      }}
                      className={cn(
                        "py-3 text-[10px] sm:text-xs md:text-sm font-bold tracking-wide rounded-xl transition-all duration-300",
                        serviceCategory === 'wellness' 
                          ? "bg-white text-brand-text shadow-sm" 
                          : "text-gray-400 hover:text-gray-600"
                      )}
                    >
                      Wellness & IVs
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setServiceCategory('concierge');
                        setValue("service", "", { shouldValidate: false });
                      }}
                      className={cn(
                        "py-3 text-[10px] sm:text-xs md:text-sm font-bold tracking-wide rounded-xl transition-all duration-300",
                        serviceCategory === 'concierge' 
                          ? "bg-white text-brand-text shadow-sm" 
                          : "text-gray-400 hover:text-gray-600"
                      )}
                    >
                      Concierge
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Select Service</label>
                  <div className="relative">
                    <select 
                      {...register("service", { required: true })} 
                      className={`w-full bg-brand-grey border-none rounded-2xl p-4 pr-10 focus:ring-2 focus:ring-brand-red outline-none transition-all appearance-none ${errors.service ? 'ring-2 ring-red-200' : ''}`}
                    >
                      <option value="">Select {serviceCategory === 'medical' ? 'a medical care service' : serviceCategory === 'wellness' ? 'a wellness or IV treatment' : 'a concierge rate slot'}...</option>
                      {(serviceCategory === 'medical' ? medicalServices : serviceCategory === 'wellness' ? wellnessServices : conciergeServices).map(s => (
                        <option key={s} value={s} className="font-sans font-normal text-gray-700 py-1">
                          {s}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                      </svg>
                    </div>
                  </div>
                </div>

                {serviceCategory === 'concierge' && (
                  <div className="space-y-2 animate-fade-in">
                    <label className="text-sm font-bold text-gray-700 ml-1">Physical Address (Bryanston Only) <span className="text-brand-red">*</span></label>
                    <textarea 
                      {...register("address", { required: serviceCategory === 'concierge' })} 
                      className={`w-full bg-brand-grey border-none rounded-2xl p-4 focus:ring-2 focus:ring-brand-red outline-none transition-all ${errors.address ? 'ring-2 ring-red-200' : ''}`} 
                      placeholder="e.g. 15 St James Crescent, Bryanston, Sandton"
                      rows={2}
                    />
                    {errors.address && <p className="text-xs text-red-500 ml-1">Physical address is required for concierge visits.</p>}
                    <p className="text-xs text-gray-400 ml-1 italic">Note: Concierge services are strictly limited to the Bryanston area.</p>
                  </div>
                )}

                <div className="space-y-4">
                  <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2 italic">
                    <Calendar className="w-3 h-3" /> Preferred Date
                  </label>
                  <input 
                    type="date" 
                    min={new Date().toISOString().split('T')[0]}
                    {...register("preferredDate", { required: true })} 
                    className={`w-full bg-brand-grey border-none rounded-2xl p-4 focus:ring-2 focus:ring-brand-red outline-none transition-all ${errors.preferredDate ? 'ring-2 ring-red-200' : ''}`} 
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2 italic">
                    <Clock className="w-3 h-3" /> Preferred Time Slot
                  </label>
                  
                  {!selectedDate ? (
                    <div className="p-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center text-sm text-gray-400">
                      Please select a date first to see available times.
                    </div>
                  ) : loadingAvailability ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="w-6 h-6 text-brand-red animate-spin" />
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <div className="p-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center text-sm text-gray-400">
                      {serviceCategory === 'concierge' 
                        ? "Please select a concierge rate slot first to see available times."
                        : "Please select a service first to see available times."}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                      {availableSlots.map((time) => {
                        const isBooked = bookedSlots.includes(time);
                        const isSelected = selectedTime === time;
                        
                        return (
                          <button
                            key={time}
                            type="button"
                            disabled={isBooked}
                            onClick={() => setValue("preferredTime", time, { shouldValidate: true })}
                            className={cn(
                              "py-3 px-2 rounded-xl text-sm font-bold transition-all border",
                              isBooked 
                                ? "bg-gray-100 text-gray-300 border-gray-100 cursor-not-allowed line-through" 
                                : isSelected
                                  ? "bg-brand-red text-white border-brand-red shadow-lg shadow-brand-red/20 scale-[1.02]"
                                  : "bg-brand-grey border-transparent text-gray-600 hover:border-brand-red/30"
                            )}
                          >
                            {time}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {errors.preferredTime && <p className="text-xs text-red-500 ml-1">Please select a time slot.</p>}
                  <input type="hidden" {...register("preferredTime", { required: true })} />
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-brand-red text-white py-5 rounded-[2rem] font-bold text-lg shadow-xl hover:bg-brand-red-dark transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing Request...
                    </>
                  ) : (
                    <span>{isEmergencyBooking ? "Request Urgent Appointment" : "Confirm Appointment Request"}</span>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
