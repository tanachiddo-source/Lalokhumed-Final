import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Calendar, ClipboardList, Heart, Check, ArrowRight, ExternalLink } from "lucide-react";

export default function Welcome() {
  // Prevent indexing for this QR-exclusive landing page
  useEffect(() => {
    // Dynamically insert robots meta tag
    const metaRobots = document.createElement("meta");
    metaRobots.name = "robots";
    metaRobots.content = "noindex, nofollow, noarchive";
    document.head.appendChild(metaRobots);

    // Set high-end personalized page description/title
    const prevTitle = document.title;
    document.title = "Welcome to LALOKHUMED | Exclusive Guest Portal";

    return () => {
      // Clean up metadata when leaving the route
      document.head.removeChild(metaRobots);
      document.title = prevTitle;
    };
  }, []);

  const actionItems = [
    {
      title: "Book an Appointment",
      description: "Schedule a medical consultation, preventative wellness check, or custom IV therapy session with our clinic.",
      href: "/booking",
      icon: <Calendar className="w-5 h-5 text-brand-red" />,
      cta: "Book Appointment online"
    },
    {
      title: "Complete Questionnaire",
      description: "Save time at the practice by securely completing your patient registration form before your visit.",
      href: "/questionnaire",
      icon: <ClipboardList className="w-5 h-5 text-brand-red" />,
      cta: "Start digital intake"
    },
    {
      title: "Explore Our Services",
      description: "Learn more about our comprehensive clinical treatments, wellness programs, and vitamin infusions.",
      href: "/services",
      icon: <Heart className="w-5 h-5 text-brand-red" />,
      cta: "View medical offering"
    }
  ];

  const valueProps = [
    "Professional medical care tailored to your needs",
    "Convenient online booking and patient registration",
    "Wellness and preventative healthcare solutions",
    "Evidence-based treatments delivered in a clinical setting"
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-neutral-800 flex flex-col font-sans antialiased selection:bg-brand-red/10 selection:text-brand-red">
      
      {/* =========================================================================
          SECTION 1: HERO WELCOME (Deep Luxurious Dark Red / Elegant Medical Prestige)
          ========================================================================= */}
      <section className="relative overflow-hidden pt-12 pb-20 md:py-24 border-b border-rose-950/20 bg-[#4C0A0C] text-white">
        {/* Subtle decorative glow */}
        <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-white/[0.03] blur-[100px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-6 md:px-8 relative z-10">
          {/* Header Area */}
          <div className="flex justify-center mb-16 md:mb-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="h-14 md:h-16"
            >
              <img
                src="/Logo_2_Transparent.png"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "https://raw.githubusercontent.com/tanachiddo-source/Lalokhumed-Final/63392fb297c2dc80233ac4a2e0865cccb3eccb02/public/Logo%202%20Transparent.png".replace(/ /g, "%20");
                }}
                alt="LALOKHUMED Logo"
                className="h-full w-auto object-contain brightness-0 invert opacity-95"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </div>

          {/* Welcome Headline Area with strict font harmony */}
          <div className="text-center space-y-6 max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <span className="inline-block text-[10px] uppercase tracking-[0.25em] font-bold text-rose-200 bg-white/10 px-4 py-2 rounded-full border border-white/15">
                Exclusive Visitor QR Portal
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
              className="text-4xl md:text-5xl lg:text-6xl font-serif text-white tracking-tight leading-[1.1]"
              id="welcome-title"
            >
              Welcome to <span className="text-rose-100 italic font-medium">LALOKHUMED</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
              className="text-base md:text-lg text-rose-100/90 font-light leading-relaxed max-w-lg mx-auto"
              id="welcome-subtitle"
            >
              Thank you for scanning. You're one step closer to trusted, professional healthcare.
            </motion.p>
          </div>
        </div>
      </section>


      {/* =========================================================================
          SECTION 2: OPTIONS GATEWAY (Clean pristine White / High spacing / Crisp Cards)
          ========================================================================= */}
      <section className="bg-white py-20 md:py-28 border-b border-neutral-100 relative">
        <div className="max-w-5xl mx-auto px-6 md:px-8">
          
          {/* Intro paragraph with refined, simple elegant spacing */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-center max-w-3xl mx-auto mb-16 md:mb-20"
          >
            <p className="text-neutral-500 font-normal leading-relaxed text-base md:text-lg lg:text-xl px-4">
              Whether you're looking for medical care, wellness support, IV therapy, or simply want to learn more about our practice, we've made it easy to access everything you need from one place.
            </p>
          </motion.div>

          {/* Action options Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 w-full mb-6">
            {actionItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="bg-[#FCFCFB] rounded-[2rem] border border-neutral-200/60 p-8 md:p-9 shadow-[0_12px_30px_rgba(0,0,0,0.01)] hover:shadow-[0_20px_50px_rgba(181,30,34,0.04)] hover:border-brand-red/15 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="mb-6 bg-brand-red/[0.03] p-4 rounded-2xl w-fit group-hover:bg-brand-red/5 transition-colors">
                    {item.icon}
                  </div>

                  <h3 className="text-xl font-serif text-brand-text mb-3 leading-tight group-hover:text-brand-red transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-neutral-500 text-sm leading-relaxed mb-8">
                    {item.description}
                  </p>
                </div>

                <Link
                  to={item.href}
                  className="w-full inline-flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-brand-text group-hover:text-brand-red pt-5 border-t border-neutral-100 transition-colors"
                  id={`btn-welcome-action-${index}`}
                >
                  <span>{item.cta}</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform" />
                </Link>
              </motion.div>
            ))}
          </div>

        </div>
      </section>


      {/* =========================================================================
          SECTION 3: WHY LALOKHUMED & CORE CALL TO ACTION (Elegant Charcoal Deep luxury)
          ========================================================================= */}
      <section className="bg-[#121213] text-white py-20 md:py-28 relative overflow-hidden">
        {/* Absolute design accents */}
        <div className="absolute right-[-10%] bottom-[-10%] w-[450px] h-[450px] bg-brand-red/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-[1px] bg-brand-red/40" />

        <div className="max-w-4xl mx-auto px-6 md:px-8">
          
          {/* Title Area */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[9px] uppercase font-bold tracking-[0.2em] text-brand-red bg-brand-red/10 px-4 py-2 rounded-full inline-block mb-3 border border-brand-red/10">
              Our Clinical Pillars
            </span>
            <h2 className="text-3xl md:text-4xl font-serif text-white tracking-tight">
              Why LALOKHUMED?
            </h2>
          </div>

          {/* Pillars Checklist Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-10 mb-16 max-w-3xl mx-auto">
            {valueProps.map((prop, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex gap-4 items-start"
              >
                <div className="bg-brand-red/10 border border-brand-red/20 text-brand-red p-1 rounded-full mt-0.5 shrink-0">
                  <Check className="w-4 h-4" />
                </div>
                <p className="text-neutral-300 text-sm md:text-base leading-relaxed">
                  {prop}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Philosophy Statement Quote */}
          <div className="text-center max-w-xl mx-auto border-t border-neutral-800/80 pt-10 mb-20">
            <p className="text-neutral-400 text-base md:text-lg italic font-serif leading-relaxed">
              "Your health journey begins with a single step. We're honoured to be part of it."
            </p>
          </div>

          {/* HIGH CONTRAST STANDOUT CALL TO ACTION: ENTER FULL WEBSITE */}
          <div className="text-center max-w-2xl mx-auto border-t border-neutral-800/80 pt-12">
            <p className="text-neutral-400 text-[10px] uppercase tracking-[0.2em] mb-6 font-semibold">
              Want to see our full credentials & updates?
            </p>
            
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-block"
            >
              <Link
                to="/"
                className="group inline-flex items-center gap-4 bg-brand-red text-white hover:bg-[#99171B] px-10 py-5 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-300 hover:shadow-[0_10px_35px_rgba(181,30,34,0.35)] hover:-translate-y-0.5 active:translate-y-0"
                id="btn-enter-website"
              >
                <span>Enter Full Website</span>
                <ExternalLink className="w-4 h-4 transform group-hover:scale-110 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </motion.div>
          </div>

        </div>
      </section>

      {/* Modern, Clean Minimalist Footer */}
      <footer className="w-full bg-[#FAF7F2] py-14 border-t border-neutral-200/50 mt-auto">
        <div className="max-w-5xl mx-auto px-6 md:px-8 text-center text-neutral-400 text-[10px] space-y-3">
          <p className="uppercase tracking-[0.25em] font-bold text-neutral-500">LALOKHUMED MEDICAL PRACTICE</p>
          <p className="font-normal text-neutral-400/90">© {new Date().getFullYear()} LALOKHUMED PTY LTD. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
