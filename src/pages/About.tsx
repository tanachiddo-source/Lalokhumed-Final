import { motion } from "motion/react";
import { ShieldCheck, Heart, UserCheck, Award, MapPin, Phone, Mail, Brain } from "lucide-react";
import { SEO } from "../components/Layout";

export default function About() {
  return (
    <div className="pt-20">
      <SEO 
        title="About LALOKHUMED | Doctor-Led Wellness in Bryanston" 
        description="Learn about our patient-focused medical practice. LALOKHUMED provides personalised healthcare and wellness programs with medical integrity in Sandton."
      />
      {/* Header */}
      <section className="py-24 bg-brand-grey/50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-3xl">
             <span className="text-brand-red font-bold text-xs uppercase tracking-widest mb-4 block">Our Story</span>
             <h1 className="text-5xl md:text-7xl font-serif text-brand-text mb-8 leading-tight">
               Excellence in <span className="text-brand-red italic">Patient-Focused</span> Medical Care.
             </h1>
             <p className="text-xl text-gray-500 leading-relaxed">
               LALOKHUMED was founded on the principle that medical wellness should be personalised, safe, and professional. Located in Bryanston, Sandton, we bridge the gap between clinical excellence and luxury comfort.
             </p>
          </div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="relative">
              <div className="aspect-[4/3] rounded-[3rem] overflow-hidden shadow-2xl">
                <img 
                  src="https://raw.githubusercontent.com/tanachiddo-source/Lalokhumed-Site/1ac8e0e4e7f134818ec974e0a9c02b23fb2ff104/public/About%20IV.png" 
                  alt="Medical Professional" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-10 -right-10 bg-brand-red text-white p-12 rounded-[3rem] hidden md:block">
                 <p className="text-4xl font-serif mb-2">100%</p>
                 <p className="text-xs uppercase tracking-widest font-bold opacity-80">Doctor Led Care</p>
              </div>
            </div>
            <div>
              <h2 className="text-3xl md:text-5xl font-serif mb-8">Why we exist</h2>
              <div className="space-y-6 text-gray-500 leading-relaxed">
                <p>
                  In a fast-paced world where fatigue and burnout are increasingly common, we saw a need for a clinical solution that supports the body's natural recovery processes at a cellular level.
                </p>
                <p>
                  LALOKHUMED delivers balanced health solutions grounded in medical integrity. We ensure every patient is thoroughly screened, every treatment plan is medically approved, and every session is conducted in a safe, professional environment.
                </p>
                <p className="font-bold text-brand-text italic">
                  "Our mission is to empower individuals to achieve optimal physical and mental vitality through evidence-based wellness and professional medical care."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Approach (Process Flow) */}
      <section className="py-24 bg-brand-grey/30">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-serif mb-6">Our Approach</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">A structured step-by-step approach to patient care that emphasises safety and personalisation.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             {[
               { icon: <Brain />, title: "Understand Needs", desc: "First, we listen. We identify your health goals, whether it's recovery, energy, or longevity." },
               { icon: <ShieldCheck />, title: "Review History", desc: "Our doctor reviews your medical history and current medications to ensure total compliance." },
               { icon: <Award />, title: "Recommend Service", desc: "We suggest the most suitable treatments from our range of medically approved health and wellness plans." },
               { icon: <Heart />, title: "Monitor Progress", desc: "We provide professional aftercare and monitor your journey toward your wellness goals." }
             ].map((item, idx) => (
               <div key={idx} className="bg-white p-10 rounded-[2.5rem] border border-gray-100 flex flex-col items-center text-center shadow-sm hover:shadow-lg transition-all duration-500">
                 <div className="w-16 h-16 rounded-full bg-brand-grey flex items-center justify-center text-brand-red mb-6">
                   {item.icon}
                 </div>
                 <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                 <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
             {[
               { title: "Safety First", desc: "Clinical excellence and patient safety are built into every protocol we follow." },
               { title: "Personalised Care", desc: "We treat individuals, not symptoms. Your care is as unique as your DNA." },
               { title: "Professional Integrity", desc: "Honest, transparent medical advice that puts the patient's well-being above all else." },
               { title: "Patient Trust", desc: "Building long-term relationships through consistent, high-quality medical service." }
             ].map((v, i) => (
               <div key={i}>
                 <div className="w-10 h-1 bg-brand-red mb-6" />
                 <h4 className="text-xl font-serif mb-4">{v.title}</h4>
                 <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
               </div>
             ))}
           </div>
        </div>
      </section>

      {/* Location/Contact */}
      <section className="py-24 bg-brand-text text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
             <div>
               <h2 className="text-3xl md:text-5xl font-serif mb-8 text-white">Visit our <span className="text-brand-red">Bryanston</span> Clinic</h2>
               <p className="text-gray-400 mb-12 leading-relaxed max-w-lg">
                 Our practice provides a professional and comfortable environment designed to make your treatment session as relaxing as it is effective.
               </p>
               <div className="space-y-8">
                 <div className="flex gap-6 group">
                   <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-brand-red shrink-0 group-hover:bg-brand-red group-hover:text-white transition-all"><MapPin /></div>
                   <div>
                     <p className="font-bold text-gray-200">Location</p>
                     <a 
                       href="https://www.google.com/maps/dir/?api=1&destination=273+Bryanston+Drive,+Bryanston,+Sandton,+Johannesburg,+2191" 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="text-gray-400 text-sm hover:text-brand-red transition-colors"
                     >
                       273 Bryanston Drive, Bryanston, Sandton, Johannesburg
                     </a>
                   </div>
                 </div>
                 <div className="flex gap-6 group">
                   <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-brand-red shrink-0 group-hover:bg-brand-red group-hover:text-white transition-all"><Phone /></div>
                   <div>
                     <p className="font-bold text-gray-200">Contact</p>
                     <div className="text-gray-400 text-sm">
                       
                       
                       <a href="tel:+27678853687" className="hover:text-brand-red transition-colors">+27 678 853 687</a>
                     </div>
                   </div>
                 </div>
                 <div className="flex gap-6 group">
                   <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-brand-red shrink-0 group-hover:bg-brand-red group-hover:text-white transition-all"><Mail /></div>
                   <div>
                     <p className="font-bold text-gray-200">Email</p>
                     <a href="mailto:lalokhumed@gmail.com" className="text-gray-400 text-sm hover:text-brand-red transition-colors">
                       lalokhumed@gmail.com
                     </a>
                   </div>
                 </div>
               </div>
             </div>
             <div className="h-[500px] bg-gray-900 rounded-[3rem] overflow-hidden grayscale contrast-125 border border-white/5 shadow-2xl">
               <img 
                 src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1000" 
                 alt="Modern Clinic" 
                 className="w-full h-full object-cover opacity-60"
               />
             </div>
           </div>
        </div>
      </section>
    </div>
  );
}
