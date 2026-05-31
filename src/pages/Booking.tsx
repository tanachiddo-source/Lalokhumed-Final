import { useState, useEffect } from "react";
import { ShieldCheck, Calendar, Clock, MapPin, Loader2, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { db, handleFirestoreError, OperationType } from "@/src/lib/firebase";
import { collection, doc, setDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { cn } from "@/src/lib/utils";

type BookingData = {
  fullName: string;
  phone: string;
  email: string;
  service: string;
  preferredTime: string;
  preferredDate: string;
};

const TIME_SLOTS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", 
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", 
  "16:00", "16:30"
];

export default function Booking() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [serviceCategory, setServiceCategory] = useState<'medical' | 'wellness'>('medical');

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

  useEffect(() => {
    let active = true;
    if (selectedDate) {
      setLoadingAvailability(true);
      setBookedSlots([]); // Flush stale slots right away

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

            // Safe reset: if currently selected time is now booked on this new date, deselect it
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

  const onSubmit = async (data: BookingData) => {
    if (bookedSlots.includes(data.preferredTime)) {
      setSubmitError("Sorry, this time slot was just taken. Please choose another.");
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const bookingRef = doc(collection(db, "bookings"));
      const bookingData = {
        ...data,
        status: 'pending',
        createdAt: serverTimestamp(),
      };
      await setDoc(bookingRef, bookingData);

      // Send email alert asynchronously in the background so it never delays the submission screen
      fetch("/api/send-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "booking", data })
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
    } catch (error) {
      setSubmitError("Failed to request appointment. Please try again or call us.");
      handleFirestoreError(error, OperationType.WRITE, "bookings");
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
        preferredTime: "Preferred Time Slot"
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
      <div className="pt-20 min-h-screen flex items-center justify-center bg-brand-grey/30">
        <div className="max-w-xl w-full px-4 text-center">
          <div className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-serif mb-6">Booking Request Received</h1>
          <p className="text-gray-500 text-lg mb-8 leading-relaxed">
            Thank you for choosing LALOKHUMED. A medical professional will contact you shortly to confirm your appointment and review your intake details.
          </p>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-8">
            <p className="text-sm font-bold text-brand-red uppercase tracking-widest mb-4">Important Next Step</p>
            <p className="text-brand-text mb-6">All consultations and treatments require a completed Patient Questionnaire before the appointment.</p>
            <a href="/questionnaire" className="inline-block bg-brand-red text-white py-4 px-10 rounded-full font-bold hover:bg-brand-red-dark transition-all">
              Complete Questionnaire Now
            </a>
          </div>
          <a href="/" className="text-gray-400 hover:text-brand-text transition-colors">Return to Homepage</a>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-brand-grey/30 pb-20">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          <div>
            <h1 className="text-5xl md:text-7xl font-serif text-brand-text mb-8 leading-tight">
              Book Your <span className="text-brand-red italic">Appointment</span>.
            </h1>
            <p className="text-xl text-gray-500 mb-12 leading-relaxed">
              Select your preferred general medical consultation or wellness therapy and schedule a slot. All services are led or supervised by qualified medical practitioners.
            </p>

            <div className="space-y-8">
               <div className="flex gap-6">
                 <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-brand-red shadow-sm shrink-0"><Calendar /></div>
                 <div>
                   <p className="font-bold text-brand-text">Flexible Scheduling</p>
                   <p className="text-gray-500 text-sm">We offer morning and afternoon slots throughout the week.</p>
                 </div>
               </div>
               <div className="flex gap-6">
                 <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-brand-red shadow-sm shrink-0"><MapPin /></div>
                 <div>
                   <p className="font-bold text-brand-text">Central Location</p>
                   <p className="text-gray-500 text-sm">273 Bryanston Drive, Sandton. Secure parking available.</p>
                 </div>
               </div>
               <div className="flex gap-6">
                 <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-brand-red shadow-sm shrink-0"><ShieldCheck /></div>
                 <div>
                   <p className="font-bold text-brand-text">Doctor Supervised</p>
                   <p className="text-gray-500 text-sm">Safe, professional, and clinical environment for all clinical procedures.</p>
                 </div>
               </div>
            </div>
          </div>

          <div className="bg-white p-10 md:p-12 rounded-[3.5rem] shadow-2xl border border-gray-100">
            <h2 className="text-3xl font-serif mb-8">Appointment Details</h2>
            
            {submitError && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3 mb-8 border border-red-100">
                <AlertCircle className="w-5 h-5" />
                <p className="text-sm font-bold">{submitError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Full Name</label>
                  <input {...register("fullName", { required: true })} className={`w-full bg-brand-grey border-none rounded-2xl p-4 focus:ring-2 focus:ring-brand-red outline-none transition-all ${errors.fullName ? 'ring-2 ring-red-200' : ''}`} placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Phone Number</label>
                  <input {...register("phone", { required: true })} className={`w-full bg-brand-grey border-none rounded-2xl p-4 focus:ring-2 focus:ring-brand-red outline-none transition-all ${errors.phone ? 'ring-2 ring-red-200' : ''}`} placeholder="+27 00 000 0000" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
                <input {...register("email", { required: true })} className={`w-full bg-brand-grey border-none rounded-2xl p-4 focus:ring-2 focus:ring-brand-red outline-none transition-all ${errors.email ? 'ring-2 ring-red-200' : ''}`} placeholder="john@example.com" />
              </div>

              <div className="space-y-4">
                <label className="text-sm font-bold text-gray-700 ml-1">Appointment Category</label>
                <div className="grid grid-cols-2 p-1 bg-brand-grey rounded-2xl border border-gray-100/50">
                  <button
                    type="button"
                    onClick={() => {
                      setServiceCategory('medical');
                      setValue("service", "", { shouldValidate: false });
                    }}
                    className={cn(
                      "py-3 text-xs md:text-sm font-bold tracking-wide rounded-xl transition-all duration-300",
                      serviceCategory === 'medical' 
                        ? "bg-white text-brand-text shadow-sm" 
                        : "text-gray-400 hover:text-gray-600"
                    )}
                  >
                    Primary Medical Care
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setServiceCategory('wellness');
                      setValue("service", "", { shouldValidate: false });
                    }}
                    className={cn(
                      "py-3 text-xs md:text-sm font-bold tracking-wide rounded-xl transition-all duration-300",
                      serviceCategory === 'wellness' 
                        ? "bg-white text-brand-text shadow-sm" 
                        : "text-gray-400 hover:text-gray-600"
                    )}
                  >
                    Wellness & IVs
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
                    <option value="">Select {serviceCategory === 'medical' ? 'a medical care service' : 'a wellness or IV treatment'}...</option>
                    {(serviceCategory === 'medical' ? medicalServices : wellnessServices).map(s => (
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
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {TIME_SLOTS.map((time) => {
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
                {/* Hidden input for react-hook-form to register against the custom buttons */}
                <input type="hidden" {...register("preferredTime", { required: true })} />
              </div>

              <div className="p-4 bg-yellow-50 rounded-2xl border border-yellow-100 flex gap-4 mt-8">
                <ShieldCheck className="w-6 h-6 text-yellow-600 shrink-0" />
                <p className="text-xs text-yellow-800 leading-relaxed font-medium">
                  NOTICE: All treatments are subject to medical review. You will be asked to complete a health questionnaire before your appointment.
                </p>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-brand-red text-white py-5 rounded-[2rem] font-bold text-lg shadow-xl hover:bg-brand-red-dark transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : "Request Appointment"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
