import React from 'react';
import { motion } from 'motion/react';
import { FileText, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-brand-text/60 hover:text-brand-red transition-colors mb-12 group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-brand-red/10 flex items-center justify-center text-brand-red">
            <FileText className="w-6 h-6" />
          </div>
          <h1 className="text-4xl font-bold font-sans tracking-tight">Terms of Service</h1>
        </div>

        <div className="prose prose-slate max-w-none space-y-8 text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-brand-text mb-4">1. Medical Disclaimer</h2>
            <p>
              Our services (IV Drip therapies and wellness boosters) are designed for wellness support and are not a replacement for professional medical diagnosis or treatment for acute emergency conditions. Consult your primary physician if you have serious pre-existing health concerns.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-brand-text mb-4">2. Booking & Cancellation</h2>
            <p>
              A booking is considered confirmed only after you receive a confirmation message from our admin team. Please provide at least 24 hours' notice for cancellations to avoid any potential rescheduling fees.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-brand-text mb-4">3. Patient Responsibility</h2>
            <p>
              You agree to provide accurate and complete medical history. Failure to disclose medical conditions or medications may result in the refusal of treatment for your own safety.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-brand-text mb-4">4. Payment</h2>
            <p>
              Payment is due at the time of service unless otherwise arranged. We accept all major cards and digital payment methods. Prices are subject to change without prior notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-brand-text mb-4">5. Governing Law</h2>
            <p>
              These terms are governed by the laws of the jurisdiction in which the clinic operates. Any disputes will be settled in the local courts of said jurisdiction.
            </p>
          </section>

          <div className="pt-12 border-t border-gray-100 italic text-sm">
            Last updated: May 2026
          </div>
        </div>
      </div>
    </div>
  );
}
