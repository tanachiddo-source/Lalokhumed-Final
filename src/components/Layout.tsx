import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, Phone, Mail, ShieldCheck, ChevronRight, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/src/lib/utils";
import { auth, db } from "@/src/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  type?: 'website' | 'article' | 'business';
}

export function SEO({ 
  title = "LALOKHUMED | Personalised Wellness & Medical Care", 
  description = "Premium doctor-led wellness & medical practice in Bryanston, Sandton. Personalised clinical treatments curated to restore your health and vitality in a serene environment.",
  canonical,
  type = 'website'
}: SEOProps) {
  const location = useLocation();
  const url = canonical || `https://lalokhumed.co.za${location.pathname}`;
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    "name": "LALOKHUMED",
    "image": "https://lalokhumed.co.za/favicon.png",
    "@id": "https://lalokhumed.co.za",
    "url": "https://lalokhumed.co.za",
    "telephone": "+27678853687",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "273 Bryanston Drive, Bryanston",
      "addressLocality": "Sandton, Johannesburg",
      "postalCode": "2191",
      "addressCountry": "ZA"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": -26.0594,
      "longitude": 28.0244
    },
    "openingHoursSpecification": [
      {
         "@type": "OpeningHoursSpecification",
         "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
         "opens": "08:00",
         "closes": "17:00"
      },
      {
         "@type": "OpeningHoursSpecification",
         "dayOfWeek": "Saturday",
         "opens": "09:00",
         "closes": "13:00"
      }
    ],
    "sameAs": []
  };

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type === 'article' ? 'article' : 'website'} />
      <meta property="og:site_name" content="LALOKHUMED" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />

      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </>
  );
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (user.email === 'admin@lalokhumed.co.za') {
          setIsAdmin(true);
          return;
        }
        setIsAdmin(false);
      } else {
        setIsAdmin(false);
      }
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      unsubscribe();
    };
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Services", href: "/services" },
    { name: "FAQ", href: "/faq" },
    { name: "Questionnaire", href: "/questionnaire" },
  ];

  return (
    <nav 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "bg-white border-b border-gray-100 py-3 shadow-sm" : "bg-transparent py-5"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center group">
            <div className="h-12 md:h-16 group-hover:scale-105 transition-transform duration-300">
              <img 
                src="/Logo_2_Transparent.png" 
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "https://raw.githubusercontent.com/tanachiddo-source/Lalokhumed-Final/63392fb297c2dc80233ac4a2e0865cccb3eccb02/public/Logo%202%20Transparent.png".replace(/ /g, "%20");
                }}
                alt="Lalokhumed Logo" 
                className="h-full w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-brand-red",
                  location.pathname === link.href ? "text-brand-red" : "text-gray-600"
                )}
              >
                {link.name}
              </Link>
            ))}
            
            {isAdmin && (
              <Link
                to="/admin"
                className={cn(
                  "text-sm font-bold flex items-center gap-1.5 transition-colors hover:text-brand-red px-3 py-1 bg-brand-red/5 rounded-full border border-brand-red/10",
                  location.pathname === "/admin" ? "text-brand-red" : "text-gray-600"
                )}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Admin
              </Link>
            )}

            <Link 
              to="/booking" 
              className="bg-brand-red text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-brand-red-dark transition-all shadow-md active:scale-95"
            >
              Book Now
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden text-gray-700" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <motion.div
        initial={false}
        animate={isOpen ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
        className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
      >
        <div className="flex flex-col p-4 gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "text-lg font-medium py-2 px-4 rounded-lg",
                location.pathname === link.href ? "bg-brand-grey text-brand-red" : "text-gray-600"
              )}
            >
              {link.name}
            </Link>
          ))}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setIsOpen(false)}
              className={cn(
                "text-lg font-bold py-2 px-4 rounded-lg flex items-center gap-2",
                location.pathname === "/admin" ? "bg-brand-red/10 text-brand-red" : "text-gray-600"
              )}
            >
              <ShieldCheck className="w-5 h-5" />
              Admin Portal
            </Link>
          )}
          <Link 
            to="/booking"
            onClick={() => setIsOpen(false)}
            className="bg-brand-red text-white text-center py-4 rounded-xl font-medium shadow-lg"
          >
            Book Appointment
          </Link>
        </div>
      </motion.div>
    </nav>
  );
}

export function Footer() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (user.email === 'admin@lalokhumed.co.za') {
          setIsAdmin(true);
          return;
        }
        setIsAdmin(false);
      } else {
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <footer className="bg-white border-t border-gray-100 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
             <Link to="/" className="flex items-center group mb-6">
                <div className="h-16 group-hover:scale-105 transition-transform duration-300">
                  <img 
                    src="/Logo_2_Transparent.png" 
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "https://raw.githubusercontent.com/tanachiddo-source/Lalokhumed-Final/63392fb297c2dc80233ac4a2e0865cccb3eccb02/public/Logo%202%20Transparent.png".replace(/ /g, "%20");
                    }}
                    alt="Lalokhumed Logo" 
                    className="h-full w-auto object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
             </Link>
             <p className="text-gray-500 text-sm leading-relaxed mb-6">
               Premium, doctor-led wellness & medical practice in the heart of Sandton. Dedicated to your long-term health, wellness and vitality.
             </p>
             <div className="flex gap-4">
             </div>
             {isAdmin && (
               <motion.div 
                 initial={{ opacity: 0, x: -10 }}
                 animate={{ opacity: 1, x: 0 }}
                 className="mt-8"
               >
                 <Link 
                   to="/admin" 
                   className="inline-flex items-center gap-2 text-xs font-bold text-brand-red bg-brand-red/5 px-4 py-2 rounded-lg hover:bg-brand-red/10 transition-colors"
                 >
                   <ShieldCheck className="w-3.5 h-3.5" />
                   Admin Dashboard
                 </Link>
               </motion.div>
             )}
          </div>

          <div>
            <h4 className="font-sans font-bold text-sm uppercase tracking-widest text-gray-900 mb-6 underline cursor-default">Quick Links</h4>
            <ul className="space-y-4">
              <li><Link to="/about" className="text-gray-500 text-sm hover:text-brand-red transition-colors">About Us</Link></li>
              <li><Link to="/services" className="text-gray-500 text-sm hover:text-brand-red transition-colors">Services & Pricing</Link></li>
              <li><Link to="/faq" className="text-gray-500 text-sm hover:text-brand-red transition-colors">Frequently Asked Questions</Link></li>
              <li><Link to="/questionnaire" className="text-gray-500 text-sm hover:text-brand-red transition-colors">Patient Questionnaire</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-sans font-bold text-sm uppercase tracking-widest text-gray-900 mb-6 underline cursor-default">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-brand-red mt-0.5" />
                <a href="mailto:info@lalokhumed.co.za" className="text-gray-500 text-sm hover:text-brand-red transition-colors">
                  info@lalokhumed.co.za
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-brand-red mt-0.5" />
                <div className="text-gray-500 text-sm flex flex-col gap-1">
                  <a href="tel:+27678853687" className="hover:text-brand-red transition-colors">+27 678 853 687</a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-4 h-4 flex-shrink-0 mt-0.5">📍</div>
                <a 
                  href="https://www.google.com/maps/dir/?api=1&destination=273+Bryanston+Drive,+Bryanston,+Sandton,+Johannesburg,+2191" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-500 text-sm hover:text-brand-red transition-colors"
                >
                  273 Bryanston Drive, Bryanston, Sandton, Johannesburg, 2191
                </a>
              </li>
            </ul>
          </div>

          <div>
             <h4 className="font-sans font-bold text-sm uppercase tracking-widest text-gray-900 mb-6 underline cursor-default">Operating Hours</h4>
             <ul className="space-y-3">
               <li className="flex justify-between text-sm">
                 <span className="text-gray-500">Mon - Fri</span>
                 <span className="font-medium">08:00 - 17:00</span>
               </li>
               <li className="flex justify-between text-sm">
                 <span className="text-gray-500">Saturday</span>
                 <span className="font-medium">09:00 - 13:00</span>
               </li>
               <li className="flex justify-between text-sm">
                 <span className="text-gray-500">Sunday</span>
                 <span className="font-medium">Closed</span>
               </li>
             </ul>
          </div>
        </div>

        <div className="pt-10 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-gray-400 text-xs">
              © {new Date().getFullYear()} LALOKHUMED PTY LTD. All rights reserved.
            </p>
            <p className="text-gray-300 text-[10px] uppercase tracking-tighter">
              Website by TGS
            </p>
          </div>
          <div className="flex gap-6">
            <Link to="/privacy-policy" className="text-gray-400 text-xs hover:text-gray-600">Privacy Policy</Link>
            <Link to="/terms-of-service" className="text-gray-400 text-xs hover:text-gray-600">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function StickyCTA() {
  const [isVisible, setIsVisible] = useState(() => {
    try {
      const saved = localStorage.getItem('sticky-cta-visible');
      return saved !== null ? JSON.parse(saved) : true;
    } catch (e) {
      console.warn("localStorage is blocked or unavailable in this context (e.g. nested iframe):", e);
      return true;
    }
  });

  const toggleVisibility = () => {
    const newState = !isVisible;
    setIsVisible(newState);
    try {
      localStorage.setItem('sticky-cta-visible', JSON.stringify(newState));
    } catch (e) {
      console.warn("localStorage is blocked or unavailable in this context (e.g. nested iframe):", e);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 pointer-events-none">
       <AnimatePresence>
         {isVisible && (
           <motion.div
             initial={{ opacity: 0, y: 20, scale: 0.9 }}
             animate={{ opacity: 1, y: 0, scale: 1 }}
             exit={{ opacity: 0, y: 20, scale: 0.9 }}
             className="flex flex-col items-end gap-3 pointer-events-none"
           >
             <div className="flex items-center gap-2 mb-1">
               <button 
                 onClick={toggleVisibility}
                 className="pointer-events-auto bg-white/80 backdrop-blur-sm border border-gray-100 text-gray-400 hover:text-gray-600 p-1 rounded-full shadow-sm transition-colors active:scale-95"
                 title="Hide buttons"
               >
                 <ChevronRight className="w-4 h-4" />
               </button>
             </div>
             
             <a 
              href="https://wa.me/27678853687" 
              target="_blank" 
              rel="noopener noreferrer"
              className="pointer-events-auto bg-green-500 text-white p-3 rounded-full shadow-2xl hover:scale-110 transition-transform active:scale-95 flex items-center justify-center group relative"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.29-4.143c1.589.943 3.385 1.44 5.577 1.44 5.461 0 9.905-4.444 9.908-9.906.002-2.646-1.027-5.133-2.9-7.008-1.871-1.873-4.359-2.903-7.005-2.904-5.46 0-9.903 4.443-9.907 9.906 0 2.128.554 4.197 1.603 6.012l-.993 3.623 3.717-.963zm10.867-7.151c-.3-.15-1.77-.874-2.046-.976-.276-.102-.476-.15-.676.15-.2.3-.77.976-.944 1.176-.174.199-.348.225-.648.075-.3-.15-1.266-.467-2.41-1.486-.89-.794-1.49-1.775-1.666-2.075-.176-.3-.019-.462.131-.611.135-.134.3-.349.45-.525.151-.176.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.676-1.629-.926-2.228-.243-.584-.489-.505-.676-.514-.175-.008-.375-.01-.575-.01-.2 0-.525.075-.8.376-.275.301-1.05 1.026-1.05 2.502 0 1.475 1.075 2.901 1.225 3.101.15.199 2.114 3.227 5.122 4.526.715.309 1.273.493 1.708.633.72.227 1.373.196 1.89.119.578-.085 1.77-.723 2.021-1.424.25-.699.25-1.299.175-1.424-.075-.125-.275-.199-.575-.349z"/>
              </svg>
              <span className="absolute right-full mr-3 bg-gray-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap top-1/2 -translate-y-1/2 uppercase tracking-widest hidden md:block">WhatsApp</span>
            </a>
            
            <Link 
              to="/booking" 
              className="pointer-events-auto bg-brand-red text-white py-4 px-8 rounded-full shadow-2xl hover:bg-brand-red-dark transition-all hover:-translate-y-1 active:scale-95 font-medium flex items-center gap-2"
            >
              Book Now
            </Link>
          </motion.div>
         )}
       </AnimatePresence>

       {/* Reveal Button */}
       {!isVisible && (
         <motion.button
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           whileHover={{ scale: 1.1 }}
           whileTap={{ scale: 0.9 }}
           onClick={toggleVisibility}
           className="pointer-events-auto bg-brand-red/90 backdrop-blur-sm text-white p-3 rounded-full shadow-xl flex items-center justify-center group"
           title="Show book options"
         >
           <MessageCircle className="w-5 h-5" />
           <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 group-hover:ml-2 whitespace-nowrap text-xs font-medium uppercase tracking-widest">
             Book Now
           </span>
         </motion.button>
       )}
    </div>
  );
}

export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
    >
      {children}
    </motion.div>
  );
}
