import React from 'react';
import { motion } from 'motion/react';
import { Shield, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
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
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-4xl font-bold font-sans tracking-tight">Privacy Policy</h1>
        </div>

        <div className="prose prose-slate max-w-none space-y-8 text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-brand-text mb-4">1. Information We Collect</h2>
            <p>
              When you book a session or complete a medical questionnaire, we collect personal information including your name, email, phone number, and sensitive health data required to provide safe wellness services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-brand-text mb-4">2. How We Use Your Data</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To manage your appointments and communicate via SMS, Email, and WhatsApp.</li>
              <li>To ensure clinical safety through review of your medical history.</li>
              <li>To internal record-keeping and billing.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-brand-text mb-4">3. WhatsApp Communication</h2>
            <p>
              By providing your phone number, you consent to receive booking confirmations and service updates via WhatsApp. We will never share your number with third-party marketers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-brand-text mb-4">4. Data Security</h2>
            <p>
              We implement industry-standard encryption and security protocols to protect your medical records. Health data is strictly accessible only by our medical professionals and authorized administrators.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-brand-text mb-4">5. Your Rights</h2>
            <p>
              You have the right to request access to your records, correction of inaccuracies, or deletion of your personal data where permitted by law.
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
