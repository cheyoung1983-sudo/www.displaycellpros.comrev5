"use client";

import React, { useState, useEffect } from 'react';
import { Hero } from './Hero';
import { ServicesSection } from './ServicesSection';
import { PortfolioSection } from './PortfolioSection';
import { TeamSection } from './TeamSection';
import { InsightsSection } from './InsightsSection';
import { FAQSection } from './FAQSection';
import { TrustImpactSection } from './TrustImpactSection';
import { ProjectEstimator } from './ProjectEstimator';
import { ClientPortalModal } from './ClientPortalModal';
import { Phase1LoadoutModal } from './Phase1LoadoutModal';
import { ContactSection } from './ContactSection';
import { ClassyFooter } from './ClassyFooter';
import { TriageAIWidget } from './TriageAIWidget';
import { ScrollProgress } from './ScrollProgress';
import { CheckCircle2, XCircle, X } from 'lucide-react';

interface ClassyOverviewViewProps {
  onNavigateToIntake?: () => void;
  onNavigateToBooking?: () => void;
}

export const ClassyOverviewView: React.FC<ClassyOverviewViewProps> = ({
  onNavigateToIntake,
  onNavigateToBooking
}) => {
  const [showEstimatorModal, setShowEstimatorModal] = useState(false);
  const [showClientPortal, setShowClientPortal] = useState(false);
  const [showLoadoutModal, setShowLoadoutModal] = useState(false);
  const [initialEstimatorService, setInitialEstimatorService] = useState<string | undefined>(undefined);
  const [contactInitialScope, setContactInitialScope] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'canceled' | null>(null);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get('success')) {
      setPaymentStatus('success');
      window.history.replaceState(null, '', window.location.pathname);
    }
    if (query.get('canceled')) {
      setPaymentStatus('canceled');
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  const scrollToContact = () => {
    const contactEl = document.getElementById('contact');
    if (contactEl) {
      contactEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectServiceForEstimate = (serviceId: string) => {
    setInitialEstimatorService(serviceId);
    setShowEstimatorModal(true);
  };

  const handleOpenContactWithScope = (summary: string) => {
    setShowEstimatorModal(false);
    setContactInitialScope(summary);
    scrollToContact();
  };

  return (
    <div className="bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-white rounded-3xl overflow-hidden shadow-2xl border border-slate-800 my-4">
      <ScrollProgress />
      
      {/* Main Sections */}
      <main>
        {/* 1. Hero Section */}
        <Hero
          onOpenEstimator={() => {
            setInitialEstimatorService(undefined);
            setShowEstimatorModal(true);
          }}
          onOpenContact={scrollToContact}
          onOpenClientPortal={() => setShowClientPortal(true)}
          onOpenLoadoutModal={() => setShowLoadoutModal(true)}
        />

        {/* 2. Services / Capabilities */}
        <ServicesSection
          onSelectServiceForEstimate={handleSelectServiceForEstimate}
          onOpenContact={scrollToContact}
        />

        {/* 3. Interactive Repair Unit Economics Calculator Banner Section */}
        <section id="loadout" className="py-16 bg-slate-950 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ProjectEstimator
              initialServiceId={initialEstimatorService}
              onOpenContactWithScope={handleOpenContactWithScope}
            />
          </div>
        </section>

        {/* 4. Trust & Federal Impact Metrics Section */}
        <TrustImpactSection />

        {/* 5. Case Studies / Precision Bench Portfolio */}
        <PortfolioSection onOpenContact={scrollToContact} />

        {/* 6. Leadership & Technical Credentials */}
        <TeamSection onOpenContact={scrollToContact} />

        {/* 7. Industry Insights & Federal Strategy */}
        <InsightsSection onOpenContact={scrollToContact} />

        {/* 8. Technical FAQ */}
        <FAQSection />

        {/* 9. Contact / Dispatch Section */}
        <ContactSection initialScope={contactInitialScope} />
      </main>

      {/* Floating AI Triage Companion Widget */}
      <TriageAIWidget
        onOpenEstimator={() => {
          setInitialEstimatorService(undefined);
          setShowEstimatorModal(true);
        }}
        onOpenContact={scrollToContact}
      />

      {/* Phase 1 Loadout Modal */}
      <Phase1LoadoutModal
        isOpen={showLoadoutModal}
        onClose={() => setShowLoadoutModal(false)}
      />

      {/* Estimator Modal Overlay */}
      {showEstimatorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl my-8">
            <button
              onClick={() => setShowEstimatorModal(false)}
              className="absolute top-5 right-5 p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <ProjectEstimator
              initialServiceId={initialEstimatorService}
              onOpenContactWithScope={handleOpenContactWithScope}
            />
          </div>
        </div>
      )}

      {/* Client Portal Modal */}
      {showClientPortal && (
        <ClientPortalModal onClose={() => setShowClientPortal(false)} />
      )}

      {/* Stripe Payment Notification Toast */}
      {paymentStatus && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-slate-900 border border-slate-700 p-4 rounded-xl shadow-2xl flex items-start gap-3 animate-slide-up">
          {paymentStatus === 'success' ? (
            <>
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-white">Payment Successful</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Your deposit has been processed. A technician will review your logic board dispatch ticket.
                </p>
              </div>
            </>
          ) : (
            <>
              <XCircle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-white">Payment Canceled</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Checkout was not completed. You can re-open the client portal or contact support anytime.
                </p>
              </div>
            </>
          )}
          <button
            onClick={() => setPaymentStatus(null)}
            className="text-slate-500 hover:text-white ml-auto"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Classy Footer */}
      <ClassyFooter
        onOpenEstimator={() => {
          setInitialEstimatorService(undefined);
          setShowEstimatorModal(true);
        }}
        onOpenClientPortal={() => setShowClientPortal(true)}
        onOpenContact={scrollToContact}
        onOpenLoadoutModal={() => setShowLoadoutModal(true)}
      />
    </div>
  );
};

export default ClassyOverviewView;
