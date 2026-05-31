import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import { CheckCircle2, ArrowRight, ShieldCheck, Zap, HeartPulse, Brain, UserCheck, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { SEO } from "../components/Layout";

const heroImages = [
  "https://raw.githubusercontent.com/tanachiddo-source/Lalokhumed-Site/1ac8e0e4e7f134818ec974e0a9c02b23fb2ff104/public/Home%20Slide%201.png",
  "https://raw.githubusercontent.com/tanachiddo-source/Lalokhumed-Site/1ac8e0e4e7f134818ec974e0a9c02b23fb2ff104/public/Home%20slide%202.png",
  "https://raw.githubusercontent.com/tanachiddo-source/Lalokhumed-Site/1ac8e0e4e7f134818ec974e0a9c02b23fb2ff104/public/Home%20Slide%203.png",
  "https://raw.githubusercontent.com/tanachiddo-source/Lalokhumed-Site/1ac8e0e4e7f134818ec974e0a9c02b23fb2ff104/public/Home%20Slide%204.png"
];

const homeImages = {
  "whyTrust": "https://raw.githubusercontent.com/tanachiddo-source/Lalokhumed-Site/1ac8e0e4e7f134818ec974e0a9c02b23fb2ff104/public/Home%20Section%201.png"
};

export default function Home() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const servicesPreview = [
    { name: "Immune Booster", icon: <Zap className="w-6 h-6" />, desc: "Strengthens immune system and helps fight infection.", href: "/services" },
    { name: "Detox Therapy", icon: <ShieldCheck className="w-6 h-6" />, desc: "Detoxifies liver and provides antioxidant support.", href: "/services" },
    { name: "Anti-Ageing", icon: <HeartPulse className="w-6 h-6" />, desc: "Increases collagen and improves skin elasticity.", href: "/services" },
    { name: "Mood & Brain", icon: <Brain className="w-6 h-6" />, desc: "Supports cognitive function and reduces brain fog.", href: "/services" },
  ];

  return (
    <div>
      <SEO 
        title="LALOKHUMED | Personalised Wellness & Medical Care Sandton" 
        description="Doctor-led medical & wellness practice in Bryanston. Boost immunity, manage fatigue, and restore vitality with our curated clinical healthcare."
      />
      {/* Hero Section */}
      <section className="relative min-h-[95vh] flex items-center bg-white overflow-hidden pt-32">
        {/* Animated Background Slideshow */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.img 
              key={heroImages[currentImageIndex]}
              src={heroImages[currentImageIndex]} 
              alt="Clinic Background" 
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 0.2, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 2, ease: "easeInOut" }}
              className="w-full h-full object-cover grayscale brightness-110"
              referrerPolicy="no-referrer"
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white/80" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 relative z-10 w-full">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <div className="flex justify-center mb-10">
                <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-gray-100 shadow-sm text-gray-400 font-medium text-[9px] tracking-[0.3em] uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-red/40 animate-pulse" />
                  Bryanston Medical Practice
                </span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-brand-text mb-10 leading-[1.1] tracking-tight">
                Personalised <br />
                Wellness & <span className="text-brand-red italic px-2">Medical Care.</span>
              </h1>
              
              <p className="text-base md:text-lg text-gray-500 mb-12 max-w-xl mx-auto leading-relaxed">
                Doctor-led wellness programs and medical services tailored to restore your lifestyle, energy, and vitality in a serene environment.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  to="/booking"
                  className="w-full sm:w-auto bg-brand-red text-white px-12 py-4.5 rounded-full font-medium shadow-xl shadow-brand-red/10 hover:bg-brand-red-dark transition-all hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2"
                >
                  Book Appointment <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/questionnaire"
                  className="w-full sm:w-auto text-gray-600 bg-white border border-gray-100 px-12 py-4.5 rounded-full font-medium hover:bg-brand-grey transition-all text-center shadow-sm"
                >
                  Consultation Form
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="mt-20 flex flex-wrap justify-center items-center gap-x-12 gap-y-6 opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-700">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-brand-red" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-900">Doctor Supervised</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-900">Medical Grade</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-900">Sandton, JHB</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Section Snapshot */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-serif mb-8 leading-tight">
              A Patient-Focused Wellness Practice
            </h2>
            <p className="text-lg text-gray-500 mb-10 leading-relaxed italic">
              "LALOKHUMED is a patient-focused practice providing comprehensive medical care and personalised wellness therapies in a safe, clinical environment."
            </p>
            <Link to="/about" className="text-brand-red font-medium border-b border-brand-red/20 pb-1 hover:border-brand-red transition-all">
              Learn More about our approach
            </Link>
          </div>
        </div>
      </section>

      {/* Key Services Section */}
      <section className="py-24 bg-brand-grey/50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-16">
            <div className="max-w-xl">
              <h2 className="text-3xl md:text-5xl font-serif mb-6">Designed for Results</h2>
              <p className="text-gray-500 leading-relaxed">
                Explore our scientifically formulated medical care and premium wellness treatments tailored to your lifestyle.
              </p>
            </div>
            <Link to="/services" className="hidden md:flex items-center gap-2 text-brand-red font-medium">
              View All Services <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {servicesPreview.map((service, idx) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-[2rem] shadow-sm hover:shadow-xl transition-all group border border-transparent hover:border-brand-red/20"
              >
                <div className="w-14 h-14 rounded-2xl bg-brand-red/5 flex items-center justify-center text-brand-red mb-6 group-hover:scale-110 transition-transform">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{service.name}</h3>
                <p className="text-gray-500 text-sm mb-6 leading-relaxed">{service.desc}</p>
                <Link to={service.href} className="text-sm font-bold text-gray-900 flex items-center gap-1">
                  Details <ArrowRight className="w-3 h-3" />
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 md:hidden">
            <Link to="/services" className="w-full bg-white text-center py-4 rounded-full text-brand-red font-medium border border-brand-red/20 flex items-center justify-center gap-2">
              View All Services <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-serif mb-6">Your Journey to Vitality</h2>
            <p className="text-gray-500">A clear, safe, and professional process for every patient.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 cursor-default">
            {[
              { step: "01", title: "Book Appointment", desc: "Select your service and choose a convenient time online." },
              { step: "02", title: "Complete Questionnaire", desc: "Detailed medical screening to ensure your safety." },
              { step: "03", title: "Doctor Review", desc: "Our medical professional reviews your history and goals." },
              { step: "04", title: "Receive Treatment", desc: "Your personalised wellness or medical plan administered in our clinic." },
            ].map((item, idx) => (
              <div key={item.step} className="relative group">
                <div className="text-8xl font-serif text-brand-red/5 absolute -top-10 -left-4 group-hover:text-brand-red/10 transition-colors">{item.step}</div>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                  <p className="text-gray-500 leading-relaxed text-sm">{item.desc}</p>
                </div>
                {idx < 3 && (
                  <div className="hidden lg:block absolute top-8 -right-4 w-8 border-t border-dashed border-gray-200" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-brand-text text-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
               <h2 className="text-3xl md:text-5xl font-serif mb-8 leading-tight text-white">Why Patients Trust <span className="text-brand-red">LALOKHUMED</span></h2>
               <div className="space-y-8">
                 {[
                   { icon: <UserCheck />, title: "Doctor-Supervised Treatments", desc: "Safety is our priority. Every treatment is overseen by medical professionals." },
                   { icon: <ShieldCheck />, title: "Personalised Care Plans", desc: "We don't do one-size-fits-all. Your healthcare path is tailored to your unique biology." },
                   { icon: <ShieldCheck />, title: "Safe & Professional Environment", desc: "A clinical setting that prioritises hygiene, comfort, and patient privacy." },
                   { icon: <CheckCircle2 />, title: "Medical-Grade Formulations", desc: "We use only the highest quality nutrients and sterile clinical equipment." },
                 ].map((item, idx) => (
                   <div key={idx} className="flex gap-6">
                     <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-brand-red shrink-0">
                       {item.icon}
                     </div>
                     <div>
                       <h4 className="text-lg font-bold mb-2">{item.title}</h4>
                       <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-[3rem] overflow-hidden border-8 border-white/5">
                <img 
                  src={homeImages.whyTrust} 
                  alt="Professional Healthcare" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-brand-red text-white">
        <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-serif mb-8 leading-tight">Ready to prioritise your health?</h2>
          <p className="text-xl text-white/80 mb-12">
            Stay ahead of burnout and fatigue. Begin your journey toward optimal wellness today.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link 
               to="/booking" 
               className="bg-white text-brand-red px-10 py-5 rounded-full font-bold shadow-2xl hover:scale-105 transition-all active:scale-95"
            >
              Book Now
            </Link>
            <Link 
               to="/questionnaire" 
               className="bg-brand-red-dark/30 text-white border border-white/20 px-10 py-5 rounded-full font-bold hover:bg-brand-red-dark/50 transition-all"
            >
              Start Questionnaire
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
