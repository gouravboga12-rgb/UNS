import React, { useState, useEffect } from 'react';
import { ShieldCheck, FileText, RefreshCw, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';

interface PoliciesProps {
  initialTab?: 'terms' | 'privacy' | 'refund';
}

export const Policies: React.FC<PoliciesProps> = ({ initialTab = 'terms' }) => {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy' | 'refund'>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  return (
    <div className="bg-slate-50 min-h-screen py-12 relative overflow-hidden font-sans">
      <title>Company Policies & Legal Agreements | UNS India</title>
      <meta name="description" content="Read the Terms and Conditions, Privacy Policies, and Refund and Cancellation Policy of UNS Home Cleaning Products Pvt Ltd." />

      {/* Decorative Blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[30rem] h-[30rem] rounded-full bg-teal-200/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[30rem] h-[30rem] rounded-full bg-emerald-200/10 blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="inline-block bg-teal-50 text-primary border border-teal-100 px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest mb-3.5 shadow-sm">
            Legal Portal
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-heading">
            Terms, Privacy & Policies
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-2">
            Please read our terms of service, privacy statements, and refund policies carefully to understand your rights and guidelines.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-col sm:flex-row bg-white border border-border rounded-2xl p-2 shadow-soft mb-8 gap-2">
          <button
            onClick={() => setActiveTab('terms')}
            className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'terms'
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'text-muted hover:text-heading hover:bg-slate-50'
            }`}
          >
            <FileText size={15} />
            <span>Terms & Conditions</span>
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'privacy'
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'text-muted hover:text-heading hover:bg-slate-50'
            }`}
          >
            <ShieldCheck size={15} />
            <span>Privacy Policy</span>
          </button>
          <button
            onClick={() => setActiveTab('refund')}
            className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'refund'
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'text-muted hover:text-heading hover:bg-slate-50'
            }`}
          >
            <RefreshCw size={15} />
            <span>Refund & Return Policy</span>
          </button>
        </div>

        {/* Content Render Card */}
        <div className="bg-white rounded-3xl border border-border shadow-soft p-6 sm:p-10 min-h-[400px]">
          
          {/* 1. TERMS & CONDITIONS CONTENT */}
          {activeTab === 'terms' && (
            <div className="space-y-6 animate-fadeIn text-body text-xs sm:text-sm leading-relaxed">
              <div>
                <h2 className="text-lg sm:text-xl font-heading font-extrabold text-heading border-b border-slate-100 pb-3 flex items-center gap-2 mb-4">
                  <FileText className="text-primary" size={20} /> Terms & Conditions
                </h2>
                <p className="text-muted text-[11px] mb-4">Last updated: July 02, 2026</p>
                <p className="mb-4">
                  Welcome to **UNS Home Cleaning Products Pvt Ltd**. These Terms and Conditions govern your access to and use of our website (https://unsindia.com), mobile application, and purchases made directly or booked via WhatsApp. By accessing or using our platform, you agree to comply with and be bound by these terms.
                </p>
              </div>

              <div className="space-y-4">
                <section>
                  <h3 className="font-heading font-bold text-heading text-sm mb-1.5 uppercase tracking-wide">1. Acceptance of Terms</h3>
                  <p className="text-muted">
                    By accessing our platform or purchasing our cleaning formulations, you represent that you are at least 18 years old and possess the legal capacity to enter into binding agreements. If you disagree with any part of these terms, you must discontinue use immediately.
                  </p>
                </section>

                <section>
                  <h3 className="font-heading font-bold text-heading text-sm mb-1.5 uppercase tracking-wide">2. Product Descriptions & Usage</h3>
                  <p className="text-muted">
                    We strive to describe our products, categories, concentrations, and variants as accurately as possible. UNS Home Cleaning Products makes high-quality household, commercial, and industrial cleaning formulations. It is the customer's responsibility to follow standard usage instructions (e.g. diluting floor cleaners, testing fabric compatibility with detergents, and keeping chemical formulas out of eyes and out of reach of children). We are not liable for accidental damages resulting from misuse.
                  </p>
                </section>

                <section>
                  <h3 className="font-heading font-bold text-heading text-sm mb-1.5 uppercase tracking-wide">3. Order Placement & WhatsApp Integration</h3>
                  <p className="text-muted">
                    To make ordering convenient, we support instant checkout options that generate order logs and pre-populate direct WhatsApp chat notifications. Final order dispatch and coordination are verified manually. We reserve the right to cancel or reject orders due to inventory limitations, pricing errors, or delivery route constraints.
                  </p>
                </section>

                <section>
                  <h3 className="font-heading font-bold text-heading text-sm mb-1.5 uppercase tracking-wide">4. Intellectual Property</h3>
                  <p className="text-muted">
                    All website code, content, layout design, images, icons, logos, brand names, and chemical formulation guidelines represent intellectual property belonging exclusively to **UNS HOME CLEANING PRODUCTS PVT LTD**. Unauthorised replication, copying, or reverse-engineering is strictly prohibited.
                  </p>
                </section>

                <section>
                  <h3 className="font-heading font-bold text-heading text-sm mb-1.5 uppercase tracking-wide">5. Governing Law & Jurisdiction</h3>
                  <p className="text-muted">
                    These Terms & Conditions are governed by and construed in accordance with the laws of the Republic of India. Any disputes arising out of these terms or direct sales shall be subject to the exclusive jurisdiction of the competent courts in Siddipet / Hyderabad, Telangana.
                  </p>
                </section>
              </div>
            </div>
          )}

          {/* 2. PRIVACY POLICY CONTENT */}
          {activeTab === 'privacy' && (
            <div className="space-y-6 animate-fadeIn text-body text-xs sm:text-sm leading-relaxed">
              <div>
                <h2 className="text-lg sm:text-xl font-heading font-extrabold text-heading border-b border-slate-100 pb-3 flex items-center gap-2 mb-4">
                  <ShieldCheck className="text-primary" size={20} /> Privacy Policy
                </h2>
                <p className="text-muted text-[11px] mb-4">Last updated: July 02, 2026</p>
                <p className="mb-4">
                  At **UNS Home Cleaning Products Pvt Ltd**, we respect your privacy and are committed to protecting the personal data you share with us. This policy details how we collect, store, and process your information when you register, browse, or place orders through our website or mobile application.
                </p>
              </div>

              <div className="space-y-4">
                <section>
                  <h3 className="font-heading font-bold text-heading text-sm mb-1.5 uppercase tracking-wide">1. Information We Collect</h3>
                  <p className="text-muted mb-2">We collect information directly provided by you during the following actions:</p>
                  <ul className="list-disc pl-5 space-y-1 text-muted">
                    <li>**Profile Registration:** Name, Email address, Phone number, and Shipping Address.</li>
                    <li>**Orders:** Details of the products you choose, total cart amounts, and transaction data.</li>
                    <li>**Distributor Applications:** Business names, GST details, operations experience, and signatures.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="font-heading font-bold text-heading text-sm mb-1.5 uppercase tracking-wide">2. How We Use Your Data</h3>
                  <p className="text-muted mb-2">We process collected data to achieve the following operational goals:</p>
                  <ul className="list-disc pl-5 space-y-1 text-muted">
                    <li>Generate manual and automatic order booking requests.</li>
                    <li>Integrate order details directly into your WhatsApp notification threads for quick shipping updates.</li>
                    <li>Verify payment link statuses securely via Razorpay gateway webhooks.</li>
                    <li>Optimize our products catalog based on category and region search trends.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="font-heading font-bold text-heading text-sm mb-1.5 uppercase tracking-wide">3. Third-party Sharing</h3>
                  <p className="text-muted">
                    We **never sell or lease** your personal data. We only share essential details with third-party service partners to fulfill your requests (e.g. sharing your address with delivery couriers and sharing purchase values with payment gateways like Razorpay). All data transfers are encrypted.
                  </p>
                </section>

                <section>
                  <h3 className="font-heading font-bold text-heading text-sm mb-1.5 uppercase tracking-wide">4. Security & Retention</h3>
                  <p className="text-muted">
                    Your account passwords and session data are stored securely. We maintain industry-standard security procedures to guard against unauthorised access, alteration, or data disclosure. We retain data only as long as necessary to fulfill legal accounting audits and active user profile requirements.
                  </p>
                </section>
              </div>
            </div>
          )}

          {/* 3. REFUND POLICY CONTENT */}
          {activeTab === 'refund' && (
            <div className="space-y-6 animate-fadeIn text-body text-xs sm:text-sm leading-relaxed">
              <div>
                <h2 className="text-lg sm:text-xl font-heading font-extrabold text-heading border-b border-slate-100 pb-3 flex items-center gap-2 mb-4">
                  <RefreshCw className="text-primary" size={20} /> Refund & Return Policy
                </h2>
                <p className="text-muted text-[11px] mb-4">Last updated: July 02, 2026</p>
                <p className="mb-4 font-semibold text-slate-700">
                  Thank you for shopping with UNS Home Cleaning Products. Please read our refund rules carefully before completing your purchase.
                </p>
              </div>

              <div className="space-y-5">
                {/* Eligibility Section */}
                <section className="bg-teal-50/50 border border-teal-100 rounded-2xl p-4 sm:p-5">
                  <h3 className="font-heading font-bold text-teal-900 text-sm mb-2 uppercase tracking-wide flex items-center gap-2">
                    <CheckCircle className="text-teal-600" size={16} /> 1. Refund Eligibility: Damage Claims
                  </h3>
                  <p className="text-teal-950/80">
                    Refunds are granted <span className="font-extrabold text-teal-900 uppercase">exclusively</span> in the case of products received in a physically damaged condition or if the wrong item was delivered. We do not support returns or refunds for change of mind after dispatch.
                  </p>
                </section>

                {/* Unboxing Rule Section */}
                <section className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 sm:p-5">
                  <h3 className="font-heading font-bold text-amber-900 text-sm mb-2 uppercase tracking-wide flex items-center gap-2">
                    <AlertTriangle className="text-amber-600" size={18} /> 2. The Mandatory Unboxing Rule
                  </h3>
                  <p className="text-amber-950/90 mb-3">
                    To protect our small business and ensure a fair resolution, a <span className="font-extrabold text-amber-900">continuous, unedited unboxing video</span> is strictly mandatory to claim any refund.
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-amber-950/80 text-xs font-semibold">
                    <li>The video recording must start **before** opening the outer shipping seal.</li>
                    <li>The shipping label (containing your Order ID and address) must be clearly shown.</li>
                    <li>Capture the full opening process and the damaged bottles/spillage in **one single continuous shot** (no cuts, pauses, or edits).</li>
                  </ul>
                  <div className="mt-3.5 bg-amber-900 text-white font-bold text-center py-2 px-4 rounded-xl text-xs tracking-wider uppercase">
                    ❌ NO VIDEO = NO REFUND.
                  </div>
                </section>

                {/* Manual Process Section */}
                <section className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5">
                  <h3 className="font-heading font-bold text-heading text-sm mb-2.5 uppercase tracking-wide flex items-center gap-2">
                    <HelpCircle className="text-primary" size={16} /> 3. Manual Refund Process
                  </h3>
                  <p className="text-muted mb-3">
                    For security and quality verification, all refunds are initiated manually by our corporate team:
                  </p>
                  <ol className="space-y-3 pl-4 list-decimal text-muted">
                    <li>
                      <strong className="text-slate-800">WhatsApp Verification:</strong> Share your Order ID, customer details, and the unboxing video proof with the owner on WhatsApp at <a href="https://wa.me/919398324095" target="_blank" rel="noreferrer" className="text-primary font-bold hover:underline">+91 9398324095</a>.
                    </li>
                    <li>
                      <strong className="text-slate-800">Review:</strong> Our product audit team will review the video proof and confirm the validity of the damage claim within 24-48 hours.
                    </li>
                    <li>
                      <strong className="text-slate-800">Initiation:</strong> Once verified and approved, the refund will be initiated to your original bank account or UPI source.
                    </li>
                    <li>
                      <strong className="text-slate-800">Timeline:</strong> The refunded amount will reflect in your bank account within <span className="font-bold text-slate-800">5-7 working days</span> after initiation.
                    </li>
                  </ol>
                </section>

                {/* Non-Refundable Items */}
                <section>
                  <h3 className="font-heading font-bold text-heading text-sm mb-2 uppercase tracking-wide">4. Non-Refundable Items</h3>
                  <p className="text-muted mb-2">The following scenarios are strictly excluded from refund eligibility:</p>
                  <ul className="list-disc pl-5 space-y-1.5 text-muted">
                    <li>Items damaged due to customer mishandling during opening (e.g., using sharp knives, scissors, or tools carelessly, cutting into product bottles).</li>
                    <li>Products that have been partially used, diluted, washed, or altered.</li>
                    <li>Sale or heavily discounted clearance items (unless received damaged).</li>
                  </ul>
                </section>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
export default Policies;
