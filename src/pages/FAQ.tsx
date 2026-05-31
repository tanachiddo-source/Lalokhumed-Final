import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Minus, 
  Search, 
  MessageSquare, 
  Stethoscope, 
  Droplets, 
  Hospital,
  Send,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { cn } from '../lib/utils';

interface FAQItem {
  question: string;
  answer: string;
  category: 'medical' | 'therapy' | 'practice';
}

const faqs: FAQItem[] = [
  // General Medical Questions (GP & Wellness)
  {
    category: 'medical',
    question: "What services does a General Practitioner (GP) consultation cover at LALOKHUMED?",
    answer: "Our GP consultations cover comprehensive clinical assessments for everyday health concerns, sudden-onset acute illnesses (like infections, seasonal flu, or allergies), biometric health checks, preventative screenings, and referrals to our trusted specialist network."
  },
  {
    category: 'medical',
    question: "Can I manage long-term chronic clinical conditions at the practice?",
    answer: "Yes. We offer professional Chronic Disease Management. Our clinical team works with patients to monitor vitals, review treatment efficacy, track lab values, and provide ongoing script coordination for chronic conditions like hypertension, asthma, thyroid disorders, and diabetes."
  },
  {
    category: 'medical',
    question: "Do you issue medical certificates (sick notes) and official referrals?",
    answer: "Yes, we issue legally compliant medical certificates (sick notes) when clinically indicated following a consultation. Our practice also provides official referral letters to laboratories, imaging partners, and trusted specialist doctors when advanced diagnostics are needed."
  },
  {
    category: 'medical',
    question: "Who will be conducting my medical consultations and clinical care?",
    answer: "All primary healthcare assessments, clinical examinations, screening audits, and medical consultations are conducted by registered, fully licensed family physicians and medical practitioners dedicated to evidence-based practices."
  },
  {
    category: 'medical',
    question: "How does a preventative wellness check or biometric screening work?",
    answer: "A wellness check-up evaluates crucial biometric indicators, including your blood pressure monitoring, blood glucose levels, body composition analysis, cholesterol, and a review of family history. Based on your results, we construct a personalized health roadmap to support your long-term wellness."
  },
  
  // IV Therapy Questions
  {
    category: 'therapy',
    question: "Do I need a prescription for IV therapy?",
    answer: "No, you do not need an external prescription. All IV treatments are overseen by our in-house medical team. We conduct an essential clinical screening and medical consultation prior to any drips or nutrient infusions to ensure they are safe and perfectly calibrated to your biology."
  },
  {
    category: 'therapy',
    question: "What is IV Nutrient Therapy and how does it benefit me?",
    answer: "IV Nutrient Therapy is the intravenous administration of high-quality, sterile vitamins, minerals, hydration, and antioxidants. Because it bypasses the digestive tract, it enables excellent, immediate cellular absorption to support recovery, immune health, and cellular wellness."
  },
  {
    category: 'therapy',
    question: "Who should not get IV nutrient drips?",
    answer: "Individuals with moderate-to-severe kidney dysfunction, congestive heart failure, fluid restrictions, or severe liver disease should avoid certain high-volume intravenous treatments. A thorough medical screening is conducted beforehand to confirm suitability."
  },
  {
    category: 'therapy',
    question: "Are there any side effects, and how safe is the procedure?",
    answer: "Infusions are highly safe when handled under strict clinical supervision. Minor, expected side effects can include a transient cold sensation in the arm, a temporary mineral taste in the mouth, or a small bruise/soreness at the injection site. Serious side effects are extremely rare."
  },
  {
    category: 'therapy',
    question: "How long does a session take?",
    answer: "Most IV drips take between 30 to 60 minutes depending on the specific treatment. Booster shots (intramuscular) take less than 5 minutes."
  },
  {
    category: 'therapy',
    question: "How often should I get an IV drip?",
    answer: "This varies based on individual goals. For general wellness support, once or twice a month is common. For specific recovery or acute symptoms, a more frequent protocol may be recommended by our specialists."
  },

  // Practice Specific Questions
  {
    category: 'practice',
    question: "Where is Lalokhumed located?",
    answer: "We are located at 273 Bryanston Drive, Bryanston, Sandton, Johannesburg. Our facility offers a private, clinical, yet relaxing environment for all treatments."
  },
  {
    category: 'practice',
    question: "Do you offer mobile services?",
    answer: "Currently, we focus on providing treatments at our Bryanston practice to ensure the highest standards of clinical safety and equipment availability. Mobile services may be considered for large corporate groups upon request."
  },
  {
    category: 'practice',
    question: "What are your operating hours?",
    answer: "We operate primarily by appointment to ensure dedicated time for each patient. Please check our booking calendar for available slots, which typically range from 8:00 AM to 5:00 PM on weekdays and select hours on weekends."
  }
];

const categories = [
  { id: 'all', label: 'All Questions', icon: MessageSquare },
  { id: 'medical', label: 'General Medical', icon: Stethoscope },
  { id: 'therapy', label: 'IV Therapy', icon: Droplets },
  { id: 'practice', label: 'Lalokhumed Practice', icon: Hospital },
] as const;

export default function FAQ() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<typeof categories[number]['id']>('all');
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  
  // Submission Form State
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ email: '', question: '' });

  const filteredFaqs = useMemo(() => {
    return faqs.filter(faq => {
      const matchesSearch = 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.question) return;

    setSubmitting(true);
    try {
      // 1. Save to Firebase
      await addDoc(collection(db, "faq_submissions"), {
        ...formData,
        createdAt: serverTimestamp()
      });

      // 2. Send email via Netlify Send Alert Function
      const response = await fetch("/api/send-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "faq_inquiry",
          data: {
            email: formData.email,
            question: formData.question
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Netlify email function returned an error status:", response.status, errorText);
      } else {
        const result = await response.json();
        console.log("Email notification sent successfully:", result);
      }

      setSubmitted(true);
      setFormData({ email: '', question: '' });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      console.error("Error submitting custom question:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-serif tracking-tight text-brand-text mb-4 leading-tight"
          >
            How can we help?
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-500 max-w-2xl mx-auto"
          >
            Find answers to common questions about our medical protocols, IV therapy benefits, and how our practice operates.
          </motion.p>
        </div>

        {/* Search Bar */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative mb-8"
        >
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search questions or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-100 h-16 pl-14 pr-6 rounded-2xl shadow-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all font-sans text-brand-text text-lg"
          />
        </motion.div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all",
                  activeCategory === cat.id 
                    ? "bg-brand-red text-white shadow-lg shadow-brand-red/20" 
                    : "bg-white text-gray-500 hover:bg-gray-50"
                )}
              >
                <Icon className="w-4 h-4" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* FAQ Grid */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, idx) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={faq.question}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md hover:border-brand-red/30 hover:shadow-brand-red/[0.02] transition-all duration-300 group"
                >
                  <button
                    onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-6 text-left"
                  >
                    <span className="font-bold text-brand-text pr-8 font-sans leading-tight group-hover:text-brand-red transition-colors duration-300">
                      {faq.question}
                    </span>
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                      openIndex === idx 
                        ? "bg-brand-red text-white" 
                        : "bg-gray-50 text-gray-400 group-hover:bg-brand-red/10 group-hover:text-brand-red group-hover:scale-110"
                    )}>
                      {openIndex === idx ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </div>
                  </button>
                  
                  <AnimatePresence>
                    {openIndex === idx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                      >
                        <div className="px-6 pb-6 text-gray-500 leading-relaxed text-sm">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-200"
              >
                <p className="text-gray-400">No questions found matching your search.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Submit Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-20 max-w-2xl mx-auto p-8 md:p-12 bg-neutral-950 rounded-[2.5rem] border border-neutral-800 text-white relative overflow-hidden shadow-2xl shadow-neutral-950/40"
        >
          {/* Subtle Red Glowing Accent */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-brand-red/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-red/5 rounded-full blur-2xl -ml-24 -mb-24 pointer-events-none" />
          
          <div className="relative z-10 max-w-lg mx-auto space-y-8">
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-serif tracking-tight mb-3 text-neutral-100">
                Can't find your question?
              </h2>
              <p className="text-neutral-400 text-sm leading-relaxed max-w-md mx-auto">
                Submit a custom inquiry, and our medical team will review it and reply directly to your inbox.
              </p>
            </div>

            <form onSubmit={handleSubmitQuestion} className="space-y-4 text-left">
              {submitted ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-neutral-900 border border-neutral-800 p-8 rounded-2xl text-center"
                >
                  <div className="w-12 h-12 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center mx-auto mb-3 border border-green-500/20">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-1 text-white">Inquiry Sent</h3>
                  <p className="text-neutral-400 text-xs leading-relaxed">
                    We will reply directly to your inbox shortly.
                  </p>
                </motion.div>
              ) : (
                <>
                  <div>
                    <input
                      type="email"
                      required
                      placeholder="Your Email Address"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-neutral-900/60 border border-neutral-800 h-12 px-5 rounded-xl outline-none focus:ring-4 focus:ring-brand-red/10 focus:border-brand-red focus:bg-neutral-900 transition-all text-sm placeholder:text-neutral-500 text-white"
                    />
                  </div>
                  <div>
                    <textarea
                      required
                      placeholder="How can we help you?"
                      rows={4}
                      value={formData.question}
                      onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                      className="w-full bg-neutral-900/60 border border-neutral-800 p-5 rounded-xl outline-none focus:ring-4 focus:ring-brand-red/10 focus:border-brand-red focus:bg-neutral-900 transition-all text-sm resize-none placeholder:text-neutral-500 text-white"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-brand-red hover:bg-brand-red/90 text-white h-12 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-red/10 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:scale-100"
                  >
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Custom Inquiry"}
                  </button>
                </>
              )}
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
