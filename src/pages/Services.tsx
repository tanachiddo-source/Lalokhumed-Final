import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  ArrowLeft,
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  Info, 
  Stethoscope, 
  Activity, 
  Heart, 
  User, 
  FileText,
  MapPin
} from "lucide-react";
import { SEO } from "../components/Layout";

export default function Services() {
  const generalServices = [
    {
      name: "General Consultations",
      description: "Comprehensive medical consultations for everyday health concerns, check-ups, primary diagnostics, and overall health evaluations.",
      icon: Stethoscope
    },
    {
      name: "Acute Illness Care",
      description: "Prompt, professional clinical care and management for sudden-onset sickness, infections, active allergies, flu, and mild acute cases.",
      icon: Activity
    },
    {
      name: "Chronic Disease Management",
      description: "Ongoing clinical coordination, prescription monitoring, and supportive healthcare oversight for conditions like hypertension, diabetes, and asthma.",
      icon: Heart
    },
    {
      name: "Preventative Health & Wellness Checks",
      description: "Biometric health screenings, routine vital evaluations, risk assessments, and proactive guidance to detect potential issues and support longevity.",
      icon: ShieldCheck
    },
    {
      name: "Women’s & Men’s Health",
      description: "Dedicated primary healthcare addressing routine physical exams, family planning guidance, cancer screenings, and hormonal wellness.",
      icon: User
    },
    {
      name: "Minor Procedures & Wound Care",
      description: "In-clinic performance of superficial operations, sterile dressing applications, suture options/removal, and meticulous wound care management.",
      icon: CheckCircle2
    },
    {
      name: "Medical Certificates & Referrals",
      description: "Comprehensive clinical diagnostic assessments, sick-leave certifications where indicated, and referrals to trusted medical specialist networks.",
      icon: FileText
    }
  ];

  const services = [
    {
      name: "Vitamin & Mineral Booster",
      price: "R940",
      description: "Supports muscle and bone development through high-concentration vitamins and minerals.",
      features: ["Muscle development", "Bone support", "Essential nutrients"]
    },
    {
      name: "Detox",
      price: "R1,300",
      description: "A comprehensive detox drip that supports your liver and provides powerful antioxidant support.",
      features: ["Detoxifies liver", "Reduces heavy metals", "Restores cell membranes"]
    },
    {
      name: "Immune Booster",
      price: "R1,300",
      description: "High-dose Vitamin C to strengthen your immune system and energy levels.",
      features: ["High-dose Vitamin C", "Strengthens immunity", "Energy support"]
    },
    {
      name: "Anti-Ageing",
      price: "R1,300",
      description: "Enhances your natural glow by supporting collagen production and skin health.",
      features: ["Increases collagen", "Improves elasticity", "Brightens skin"]
    },
    {
      name: "Gut Health",
      price: "R1,450",
      description: "Focused on digestive wellness, reducing inflammation and supporting gut restoration.",
      features: ["Supports digestion", "Inflammation control", "Gut restoration"]
    },
    {
      name: "Weight Loss",
      price: "R1,200",
      description: "Boosts metabolism using a blend of vitamins, antioxidants, and amino acids.",
      features: ["Boosts metabolism", "Antioxidant blend", "Amino acid support"]
    },
    {
      name: "Mood & Brain Booster",
      price: "R1,300",
      description: "Clears brain fog and enhances cognitive function for better mental clarity.",
      features: ["Cognitive support", "Reduces brain fog", "Improves focus"]
    },
    {
      name: "Fertility",
      price: "R980",
      description: "Specific nutrients designed to support reproductive health and egg/sperm quality.",
      features: ["Reproductive health", "Egg/Sperm quality", "Targeted nutrients"]
    },
    {
      name: "NAD Therapy",
      price: "R2,000",
      duration: "3 hours",
      description: "Premium cellular recovery therapy that supports energy, brain function, and anti-ageing.",
      features: ["Cellular recovery", "Energy support", "Brain function"]
    },
  ];

  const [selectedService, setSelectedService] = useState<'none' | 'general' | 'concierge' | 'iv'>('none');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [selectedService]);

  return (
    <div className="pt-20">
      <SEO 
        title="Personalised Wellness & Medical Care | LALOKHUMED Sandton" 
        description="Comprehensive healthcare by LALOKHUMED. General practitioner consultations, chronic health management, and custom clinical wellness programs in Bryanston, Sandton."
      />

      {/* Header */}
      <section className="pt-20 pb-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
           <div className="max-w-4xl">
             <div className="text-brand-red text-xs font-bold uppercase tracking-widest mb-4">LALOKHUMED Medical Practice</div>
             <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-brand-text mb-4 leading-tight tracking-tight">
               Evidence-Based Clinical <br />
               <span className="text-brand-red italic">
                 {selectedService === 'none' && "Care & Wellness"}
                 {selectedService === 'general' && "Primary Care"}
                 {selectedService === 'concierge' && "Medical Concierge"}
                 {selectedService === 'iv' && "IV Infusion Therapy"}
               </span>.
             </h1>

             {selectedService !== 'none' && (
               <div className="mt-8 animate-fade-in">
                 <button
                   onClick={() => setSelectedService('none')}
                   className="inline-flex items-center gap-2.5 text-brand-text/70 hover:text-brand-red transition-all group font-bold text-sm bg-neutral-100 hover:bg-neutral-200/60 px-6 py-3.5 rounded-full cursor-pointer border border-neutral-200/50"
                 >
                   <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                   Back to All Services
                 </button>
               </div>
             )}
           </div>
        </div>
      </section>

      {/* Category Navigation Side-by-Side */}
      {selectedService === 'none' && (
        <section className="pb-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* General Medical */}
              <div 
                onClick={() => setSelectedService('general')}
                className="bg-[#FAF7F2] rounded-[2.5rem] p-8 border border-neutral-200/40 hover:border-brand-red/10 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  <div className="p-3.5 bg-brand-red/5 text-brand-red rounded-2xl w-fit mb-6 group-hover:bg-brand-red group-hover:text-white transition-colors duration-300">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-serif text-brand-text mb-3 leading-tight">General Primary Care</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-6">
                    Comprehensive medical consultations, prescription monitoring, health screenings, and preventative healthcare under expert practitioner guidance.
                  </p>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-full border border-neutral-200/50 text-[10px] uppercase font-bold tracking-wider text-brand-text mb-6">
                    In-Practice • From R800
                  </div>
                </div>
                <button 
                  className="w-full bg-white text-brand-text border border-neutral-200 hover:border-brand-red hover:bg-brand-red hover:text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 text-sm cursor-pointer"
                >
                  Explore GP Services <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Concierge Service */}
              <div 
                onClick={() => setSelectedService('concierge')}
                className="bg-[#4C0A0C] rounded-[2.5rem] p-8 border border-rose-950/20 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group text-white relative overflow-hidden cursor-pointer"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] rounded-full blur-xl pointer-events-none" />
                <div>
                  <div className="p-3.5 bg-white/10 text-rose-300 rounded-2xl w-fit mb-6">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-serif text-white mb-3 leading-tight font-medium">Medical Concierge</h3>
                  <p className="text-rose-100/80 text-sm leading-relaxed mb-6">
                    Premium home, office, and executive-suite clinician call-outs. Bringing fully equipped diagnostic exams and treatment directly to you.
                  </p>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full border border-white/5 text-[10px] uppercase font-bold tracking-wider text-rose-200 mb-6">
                    Bryanston Only • From R1,500
                  </div>
                </div>
                <button 
                  className="w-full bg-white text-neutral-800 hover:bg-rose-100 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 text-sm cursor-pointer"
                >
                  View Concierge Rates <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* IV Therapy */}
              <div 
                onClick={() => setSelectedService('iv')}
                className="bg-[#FAF7F2] rounded-[2.5rem] p-8 border border-neutral-200/40 hover:border-brand-red/10 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  <div className="p-3.5 bg-brand-red/5 text-brand-red rounded-2xl w-fit mb-6 group-hover:bg-brand-red group-hover:text-white transition-colors duration-300">
                    <Heart className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-serif text-brand-text mb-3 leading-tight">IV Infusion Therapy</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-6">
                    Scientifically backed cellular hydration, recovery, NAD, anti-ageing, and clinical-grade vitamins to boost systemic wellness and vitality.
                  </p>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-full border border-neutral-200/50 text-[10px] uppercase font-bold tracking-wider text-brand-text mb-6">
                    Wellness Drips • From R940
                  </div>
                </div>
                <button 
                  className="w-full bg-white text-brand-text border border-neutral-200 hover:border-brand-red hover:bg-brand-red hover:text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 text-sm cursor-pointer"
                >
                  Explore IV Therapies <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Category 1: General Medical Services */}
      {selectedService === 'general' && (
        <section id="general-medical" className="py-24 bg-brand-grey border-t border-b border-gray-150/80 scroll-mt-24 animate-fade-in">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
            <div className="max-w-3xl mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-red/5 rounded-full text-brand-red text-xs font-bold uppercase tracking-widest mb-6">
                Primary Medical Care
              </div>
              <h2 className="text-4xl md:text-5xl font-serif text-brand-text mb-6">General Medical Services</h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                LALOKHUMED provides general practitioner care for everyday health concerns, preventative wellness, and ongoing health management in a professional clinical setting.
              </p>

              {/* Pricing Note */}
              <div className="bg-white border border-brand-red/10 rounded-[2rem] p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center shadow-sm">
                <div className="p-3 bg-brand-red/10 text-brand-red rounded-xl shrink-0">
                  <Info className="w-5 h-5 animate-pulse" />
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  <span className="font-bold text-brand-text text-base block sm:inline mr-2">Fee Information:</span>
                  General consultation fee from R800. Pricing may vary depending on medical aid availability, consultation requirements, and annual fee adjustments.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {generalServices.map((service, idx) => {
                const ServiceIcon = service.icon;
                return (
                  <div 
                    key={idx} 
                    className="bg-white rounded-[2rem] p-8 border border-gray-100 flex flex-col hover:shadow-xl hover:border-brand-red/10 transition-all duration-300 group"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="p-4 bg-brand-red/5 text-brand-red rounded-full group-hover:bg-brand-red group-hover:text-white transition-colors duration-300">
                        <ServiceIcon className="w-6 h-6" />
                      </div>
                    </div>

                    <h3 className="text-2xl font-serif mb-4 text-brand-text leading-tight group-hover:text-brand-red transition-colors duration-300">{service.name}</h3>

                    <p className="text-gray-500 text-sm mb-8 leading-relaxed flex-grow">
                      {service.description}
                    </p>

                    <Link
                      to="/booking?category=medical"
                      className="w-full bg-brand-grey text-brand-text py-4 rounded-xl font-bold flex items-center justify-center gap-2 group-hover:bg-brand-red group-hover:text-white transition-all transform active:scale-95"
                    >
                      Book Consultation <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Spotlight: Exclusive Bryanston Concierge Service */}
      {selectedService === 'concierge' && (
        <div className="bg-[#FAF7F5] animate-fade-in">
          {/* Section 1: Intro / Detailed Services */}
          <section id="medical-concierge" className="py-20 border-b border-neutral-200/50">
            <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                
                {/* Left Column: Premium Title & Story */}
                <div className="lg:col-span-7 space-y-8">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#4C0A0C]/5 rounded-full text-[#4C0A0C] text-xs font-bold uppercase tracking-widest border border-[#4C0A0C]/10">
                    <MapPin className="w-4 h-4 text-brand-red" />
                    Bryanston Exclusive Coverage
                  </div>
                  
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-brand-text leading-tight tracking-tight">
                    Premium Clinical Care <br />
                    <span className="text-brand-red italic font-medium">At Your Doorstep</span>
                  </h2>
                  
                  <p className="text-gray-600 text-base md:text-lg leading-relaxed font-light max-w-3xl">
                    Bring the exceptional, trusted clinical care of LALOKHUMED directly to your private residence, corporate office, or executive suite. Available exclusively within the Bryanston area, our dedicated medical professionals deliver premium clinical consultations, diagnostic checks, acute medical assistance, and customized IV therapy sessions with maximum convenience, comfort, and absolute discretion.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                    <div className="bg-white p-6 rounded-3xl border border-neutral-200/50 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="p-3 bg-[#4C0A0C]/5 text-[#4C0A0C] rounded-2xl w-fit mb-4">
                        <Stethoscope className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-base text-brand-text mb-2">Comprehensive Consultations</h4>
                      <p className="text-xs text-gray-500 leading-relaxed">Receive personalized clinical assessments, diagnostic check-ups, and targeted acute medical plans on your schedule.</p>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-neutral-200/50 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="p-3 bg-[#4C0A0C]/5 text-[#4C0A0C] rounded-2xl w-fit mb-4">
                        <Heart className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-base text-brand-text mb-2">At-Home IV Therapy</h4>
                      <p className="text-xs text-gray-500 leading-relaxed">Select any of our custom, scientific vitamin infusions and have them prepared and administered in total comfort.</p>
                    </div>
                  </div>
                </div>

                {/* Right Column: Premium Value Box */}
                <div className="lg:col-span-5 bg-[#4C0A0C] text-white p-8 md:p-10 rounded-[2.5rem] border border-rose-950/20 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-white/[0.02] rounded-full blur-2xl pointer-events-none" />
                  
                  <h3 className="text-2xl font-serif mb-4 text-white">Why Select Concierge?</h3>
                  <p className="text-sm text-rose-100/80 leading-relaxed mb-6 font-light">
                    Skip travel times, traffic delays, waiting rooms, and public exposure. Our clinical team arrives fully mobilized with diagnostic gear to manage your wellness seamlessly.
                  </p>

                  <ul className="space-y-4 border-t border-white/10 pt-6">
                    <li className="flex items-center gap-3 text-sm text-rose-100/90">
                      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5 text-rose-300" />
                      </div>
                      <span>Fully equipped mobile diagnostic kits</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-rose-100/90">
                      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5 text-rose-300" />
                      </div>
                      <span>Absolute discretion and confidentiality</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-rose-100/90">
                      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5 text-rose-300" />
                      </div>
                      <span>Prescriptions and clinical care plans provided</span>
                    </li>
                  </ul>
                </div>

              </div>
            </div>
          </section>

          {/* Section 2: Pricing Structure */}
          <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
              <div className="max-w-3xl mx-auto text-center mb-16">
                <span className="text-brand-red text-xs font-bold uppercase tracking-widest block mb-3">Fee Structure</span>
                <h3 className="text-3xl md:text-4xl font-serif text-brand-text mb-4">Concierge Rates By Time Slot</h3>
                <p className="text-gray-500 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
                  Our tiered call-out fees are structured based on the time of day. Call-out fees cover clinical mobilization, travel, and the baseline check-up. They exclude additional medications, lab work, or IV drip consumables.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Daytime Card */}
                <div className="bg-[#FAF7F2] rounded-[2.5rem] p-8 border border-neutral-200/40 hover:border-brand-red/10 hover:shadow-xl hover:bg-white transition-all duration-300 flex flex-col justify-between group relative">
                  <div>
                    <div className="flex justify-between items-start mb-8">
                      <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-800 flex items-center justify-center font-mono font-bold text-base border border-neutral-200/60 shadow-sm">
                        8-5
                      </div>
                      <span className="bg-neutral-100/80 text-neutral-700 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-neutral-200/50">
                        Daytime
                      </span>
                    </div>

                    <h4 className="text-2xl font-serif text-brand-text mb-3">Daytime Call-Out</h4>
                    <p className="text-gray-500 text-sm leading-relaxed mb-8">
                      Best suited for standard home clinical examinations, office wellness consultations, prescription updates, and standard health tracking check-ins.
                    </p>
                  </div>

                  <div>
                    <div className="border-t border-neutral-200/50 pt-6">
                      <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold mb-1">Standard Rate</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-serif font-bold text-brand-text">R1,500</span>
                        <span className="text-xs text-neutral-400">/ visit</span>
                      </div>
                      <p className="text-[10px] text-neutral-400 mt-2">Available 08:00 to 17:00</p>
                    </div>
                  </div>
                </div>

                {/* After-Hours Card */}
                <div className="bg-[#FAF7F2] rounded-[2.5rem] p-8 border border-neutral-200/40 hover:border-brand-red/10 hover:shadow-xl hover:bg-white transition-all duration-300 flex flex-col justify-between group relative">
                  <div>
                    <div className="flex justify-between items-start mb-8">
                      <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-800 flex items-center justify-center font-mono font-bold text-base border border-neutral-200/60 shadow-sm">
                        5-8
                      </div>
                      <span className="bg-neutral-100/80 text-neutral-700 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-neutral-200/50">
                        After-Hours
                      </span>
                    </div>

                    <h4 className="text-2xl font-serif text-brand-text mb-3">After-Hours Call-Out</h4>
                    <p className="text-gray-500 text-sm leading-relaxed mb-8">
                      Perfect for late afternoon and early evening home visits, accommodating busy working executives, corporate schedules, or urgent after-school pediatric care.
                    </p>
                  </div>

                  <div>
                    <div className="border-t border-neutral-200/50 pt-6">
                      <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold mb-1">Twilight Rate</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-serif font-bold text-brand-text">R2,500</span>
                        <span className="text-xs text-neutral-400">/ visit</span>
                      </div>
                      <p className="text-[10px] text-neutral-400 mt-2">Available 17:00 to 20:00</p>
                    </div>
                  </div>
                </div>

                {/* Night Card */}
                <div className="bg-[#FAF7F2] rounded-[2.5rem] p-8 border border-neutral-200/40 hover:border-brand-red/10 hover:shadow-xl hover:bg-white transition-all duration-300 flex flex-col justify-between group relative">
                  <div>
                    <div className="flex justify-between items-start mb-8">
                      <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-800 flex items-center justify-center font-mono font-bold text-base border border-neutral-200/60 shadow-sm">
                        8-10
                      </div>
                      <span className="bg-neutral-100/80 text-neutral-700 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-neutral-200/50">
                        Night Call
                      </span>
                    </div>

                    <h4 className="text-2xl font-serif text-brand-text mb-3">Night Call-Out</h4>
                    <p className="text-gray-500 text-sm leading-relaxed mb-8">
                      Provides premium night clinical coverage directly in your private space, supporting late-night medical check-ups and peace of mind.
                    </p>
                  </div>

                  <div>
                    <div className="border-t border-neutral-200/50 pt-6">
                      <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold mb-1">Night Rate</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-serif font-bold text-brand-text">R3,500</span>
                        <span className="text-xs text-neutral-400">/ visit</span>
                      </div>
                      <p className="text-[10px] text-neutral-400 mt-2">Available 20:00 to 22:00</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Call-to-action bar */}
              <div className="mt-16 bg-[#4C0A0C] text-white rounded-[2.5rem] p-8 md:p-12 flex flex-col lg:flex-row justify-between items-center gap-8 relative overflow-hidden shadow-xl border border-rose-950/20">
                <div className="absolute top-0 left-0 w-64 h-64 bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 max-w-2xl text-center lg:text-left">
                  <h4 className="text-2xl md:text-3xl font-serif mb-2">Request A Concierge Visit</h4>
                  <p className="text-xs md:text-sm text-rose-100/80 leading-relaxed font-light">
                    Our medical practitioner will arrive fully equipped. Book your preferred time slot online, and we will contact you to verify coordinates and clinical requests.
                  </p>
                </div>
                <div className="relative z-10 shrink-0 w-full lg:w-auto">
                  <Link
                    to="/booking?category=concierge"
                    className="w-full lg:w-auto bg-white text-[#4C0A0C] hover:bg-rose-50 px-8 py-5 rounded-xl font-bold flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-95 text-base cursor-pointer"
                  >
                    Schedule Concierge Visit <ArrowRight className="w-5 h-5 text-brand-red animate-pulse" />
                  </Link>
                </div>
              </div>

            </div>
          </section>
        </div>
      )}

      {/* Category 2: IV Therapy Services */}
      {selectedService === 'iv' && (
        <section id="iv-therapy" className="py-24 bg-white scroll-mt-24 animate-fade-in">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
            <div className="max-w-3xl mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-red/5 rounded-full text-brand-red text-xs font-bold uppercase tracking-widest mb-6">
                Active Revitalisation
              </div>
              <h2 className="text-4xl md:text-5xl font-serif text-brand-text mb-6">IV Therapy Services</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Our IV therapy treatments are designed to support specific wellness goals and are provided in a clinical setting following medical screening and review.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, idx) => (
                <div 
                  key={idx} 
                  className="bg-brand-grey/40 rounded-[2rem] p-8 border border-gray-100/60 flex flex-col hover:bg-white hover:shadow-xl hover:border-brand-red/10 transition-all duration-300 group"
                >
                  <div className="flex justify-between items-start mb-6">
                     <div>
                       <h3 className="text-2xl font-serif mb-2">{service.name}</h3>
                       {service.duration && (
                         <div className="flex items-center gap-1.5 text-brand-red text-xs font-bold uppercase tracking-widest">
                           <Clock className="w-3.5 h-3.5" />
                           {service.duration}
                         </div>
                       )}
                     </div>
                     <div className="text-2xl font-serif text-gray-900">{service.price}</div>
                  </div>

                  <p className="text-gray-500 text-sm mb-8 leading-relaxed flex-grow">
                    {service.description}
                  </p>

                  <div className="space-y-3 mb-8">
                     {service.features.map((f, i) => (
                       <div key={i} className="flex items-center gap-3 text-sm text-gray-600">
                         <CheckCircle2 className="w-4 h-4 text-green-500" />
                         {f}
                       </div>
                     ))}
                  </div>

                  <Link
                    to="/booking?category=wellness"
                    className="w-full bg-brand-grey text-brand-text py-4 rounded-xl font-bold flex items-center justify-center gap-2 group-hover:bg-brand-red group-hover:text-white transition-all transform active:scale-95"
                  >
                    Book Treatment <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trust Quote */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 text-center italic">
          <div className="w-12 h-12 bg-brand-red/10 rounded-full flex items-center justify-center text-brand-red mx-auto mb-8">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <p className="text-2xl md:text-3xl font-serif text-gray-700 leading-relaxed mb-8">
            "Every care plan and clinical service is prepared using premium medical-grade solutions. We ensure that your treatment is perfectly balanced for your individual health profile."
          </p>
          <div className="h-px w-20 bg-brand-red mx-auto" />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-brand-text text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
           <div className="bg-brand-red/5 rounded-[3rem] p-12 lg:p-20 border border-white/5 text-center">
             <h2 className="text-3xl md:text-5xl font-serif mb-8 text-white">Not sure which treatment is right for you?</h2>
             <p className="text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
               All treatments are subject to a medical review. We suggest beginning with a consultation or completing our digital patient questionnaire for a professional recommendation.
             </p>
             <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link 
                  to="/booking?category=medical" 
                  className="bg-brand-red text-white px-10 py-5 rounded-full font-bold shadow-2xl hover:bg-brand-red-dark transition-all"
              >
                Book Consultation
              </Link>
              <Link 
                  to="/questionnaire" 
                  className="bg-white text-brand-text px-10 py-5 rounded-full font-bold hover:bg-brand-grey transition-all"
              >
                Complete Questionnaire
              </Link>
            </div>
           </div>
        </div>
      </section>
    </div>
  );
}
