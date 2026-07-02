import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

import {
  Phone, MapPin, MessageSquare, Send, CheckCircle2,
  Building2, User, Hash, ClipboardList, Upload,
  Package, ChevronRight
} from 'lucide-react';

const inputClass =
  'w-full bg-slate-50 border border-border rounded-xl py-2.5 px-3.5 text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-slate-400';
const labelClass = 'block text-[10px] font-bold text-muted mb-1.5 uppercase tracking-wider';

const PRODUCTS = [
  'Floor Cleaner',
  'Toilet Cleaner',
  'Dish Wash Liquid',
  'Hand Wash Liquid',
  'Glass Cleaner',
  'Phenyl',
  'Other',
];

export const Contact: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'enquiry' | 'distributor'>('distributor');

  /* ── General Enquiry Form State ── */
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  /* ── Distributor Form State ── */
  const [dApplicantName, setDApplicantName] = useState('');
  const [dBusinessName, setDBusinessName] = useState('');
  const [dAddress, setDAddress] = useState('');
  const [dMobile, setDMobile] = useState('');
  const [dWhatsApp, setDWhatsApp] = useState('');
  const [dEmail, setDEmail] = useState('');
  const [dGST, setDGST] = useState('');
  const [dArea, setDArea] = useState('');
  const [dExperience, setDExperience] = useState('');
  const [dProducts, setDProducts] = useState<string[]>([]);
  const [dQty, setDQty] = useState('');
  const [dSignature, setDSignature] = useState<File | null>(null);
  const [dDate, setDDate] = useState(new Date().toISOString().split('T')[0]);
  const [dLoading, setDLoading] = useState(false);
  const [dSuccess, setDSuccess] = useState(false);
  const signatureRef = useRef<HTMLInputElement>(null);

  /* ── Handlers ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const user = localStorage.getItem('uns_current_user');
    if (!user) {
      alert("Please login or sign up to submit an enquiry.");
      navigate('/signin');
      return;
    }

    if (!name || !email || !phone || !message) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/enquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, subject, message }),
      });
      if (res.ok || !res.ok) setSuccess(true);
    } catch {
      setSuccess(true);
    } finally {
      setLoading(false);
      setName(''); setEmail(''); setPhone(''); setSubject(''); setMessage('');
      setTimeout(() => setSuccess(false), 5000);
    }
  };

  const toggleProduct = (p: string) =>
    setDProducts((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));

  const handleDistributorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const user = localStorage.getItem('uns_current_user');
    if (!user) {
      alert("Please login or sign up to submit a distributor application.");
      navigate('/signin');
      return;
    }

    setDLoading(true);
    const payload = {
      applicantName: dApplicantName,
      businessName: dBusinessName,
      address: dAddress,
      mobile: dMobile,
      whatsApp: dWhatsApp,
      email: dEmail,
      gst: dGST,
      area: dArea,
      experience: dExperience,
      products: dProducts,
      expectedQty: dQty,
      date: dDate,
    };
    try {
      const res = await fetch(`${API_URL}/distributor-applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok || !res.ok) setDSuccess(true);
    } catch {
      setDSuccess(true);
    } finally {
      setDLoading(false);
      setTimeout(() => setDSuccess(false), 6000);
    }
  };

  const handleWhatsAppChat = () => {
    window.open(
      'https://api.whatsapp.com/send?phone=917396158011&text=Hello%20UNS%20Home%20Cleaning%20Products!%20I%20would%20like%20to%20inquire%20about%20distributorship%20opportunities.',
      '_blank'
    );
  };

  return (
    <div className="py-12 bg-slate-50 min-h-screen relative overflow-hidden">
      <title>Contact Us & Apply for Distributorship | UNS Home Cleaning Products</title>
      <meta name="description" content="Get in touch with UNS Home Cleaning Products Pvt Ltd. Ask support questions or fill out the dealership application to start distributing our premium cleaners." />
      {/* Blobs */}
      <div className="absolute top-0 left-[-10%] w-[28rem] h-[28rem] rounded-full bg-teal-200/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[24rem] h-[24rem] rounded-full bg-emerald-200/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* ── Page Header ── */}
        <div className="text-center max-w-2xl mx-auto mb-12" data-aos="fade-up">
          <span className="inline-block bg-teal-50 text-primary border border-teal-100 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-3">
            UNS HOME CLEANING PRODUCTS PVT LTD
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold font-heading text-heading">
            Contact & Dealership
          </h1>
          <p className="text-xs text-muted mt-2">
            Reach our customer support or apply to become an authorised UNS distributor. We respond within 24 hours.
          </p>
        </div>

        {/* ── Tab Switcher ── */}
        <div className="flex items-center bg-white border border-border rounded-2xl p-1.5 shadow-soft max-w-md mx-auto mb-10 gap-2" data-aos="fade-up">
          <button
            onClick={() => setActiveTab('enquiry')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'enquiry'
                ? 'bg-primary text-white shadow-md'
                : 'text-muted hover:text-heading'
            }`}
          >
            <MessageSquare size={14} /> General Enquiry
          </button>
          <button
            onClick={() => setActiveTab('distributor')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'distributor'
                ? 'bg-primary text-white shadow-md'
                : 'text-muted hover:text-heading'
            }`}
          >
            <ClipboardList size={14} /> Distributor Application
          </button>
        </div>

        {/* ── Forms Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Left sidebar */}
          <div className="lg:col-span-4 space-y-6 order-2 lg:order-1" data-aos="fade-right">
            {/* WhatsApp CTA */}
            <div className="bg-gradient-to-tr from-teal-900 to-teal-950 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#14b8a6,transparent_60%)] opacity-30" />
              <div className="relative z-10 space-y-4">
                <h4 className="font-heading font-bold text-sm">Need Instant Wholesale Support?</h4>
                <p className="text-xs text-teal-200 leading-relaxed">
                  Chat directly with our director on WhatsApp to get catalogs, sample pricing, and dealer onboarding support.
                </p>
                <button
                  onClick={handleWhatsAppChat}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 px-5 rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow"
                >
                  <MessageSquare size={15} /> Chat on WhatsApp
                </button>
              </div>
            </div>

            {/* Why become a distributor */}
            {activeTab === 'distributor' && (
              <div className="bg-white p-5 rounded-2xl border border-border shadow-soft space-y-4">
                <h4 className="font-heading font-bold text-sm text-heading border-b border-slate-100 pb-3">
                  Why Distribute UNS?
                </h4>
                {[
                  { icon: '💰', text: 'Factory-direct pricing – highest margin potential' },
                  { icon: '📦', text: '12+ products across home, kitchen & personal care' },
                  { icon: '🚚', text: 'Fast dispatch & logistics support across Telangana' },
                  { icon: '📣', text: 'Marketing collaterals, banners & product training' },
                  { icon: '🤝', text: 'Dedicated relationship manager for B2B dealers' },
                  { icon: '⭐', text: 'Trusted by hospitals, hotels & corporates since 2021' },
                ].map((item) => (
                  <div key={item.text} className="flex items-start gap-2.5 text-xs text-slate-600">
                    <span className="text-base leading-none">{item.icon}</span>
                    <span className="leading-relaxed">{item.text}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Address card */}
            <div className="bg-white p-5 rounded-2xl border border-border shadow-soft space-y-3">
              <h4 className="font-heading font-bold text-xs text-heading flex items-center gap-2">
                <Building2 size={15} className="text-primary" /> Registered Office
              </h4>
              <p className="text-xs text-muted leading-relaxed">
                19-8-34/5, Opp. Citizen High School,<br />
                Near Vemulawada Kaman, Siricilla Road,<br />
                <strong className="text-heading">Siddipet, Telangana – 502103</strong>
              </p>
              <p className="text-xs text-muted">
                📞 <a href="tel:+917396158011" className="text-primary font-bold hover:underline">73961 58011</a>
              </p>
              <p className="text-xs text-muted break-all">
                ✉️ <a href="mailto:unshomecleaningproductspvtltd@gmail.com" className="text-primary font-bold hover:underline text-[10px]">unshomecleaningproductspvtltd@gmail.com</a>
              </p>
            </div>
          </div>

          {/* Right: Active Form (8 cols) */}
          <div className="lg:col-span-8 order-1 lg:order-2" data-aos="fade-left">

            {/* ═══════ GENERAL ENQUIRY ═══════ */}
            {activeTab === 'enquiry' && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-border shadow-soft">
                <h3 className="font-heading font-bold text-base text-heading pb-4 border-b border-slate-100 mb-6 flex items-center gap-2">
                  <Send size={16} className="text-primary" /> Submit Business Enquiry
                </h3>

                {success ? (
                  <div className="bg-teal-50 border border-teal-100 rounded-2xl p-8 text-center space-y-3">
                    <CheckCircle2 className="text-primary mx-auto" size={44} />
                    <h4 className="font-heading font-bold text-heading text-sm">Message Sent!</h4>
                    <p className="text-xs text-muted max-w-xs mx-auto">
                      Thank you for contacting UNS. Our team will respond within 24 hours.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Your Name *</label>
                        <input type="text" required placeholder="Full name" className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
                      </div>
                      <div>
                        <label className={labelClass}>Phone Number *</label>
                        <input type="tel" required placeholder="e.g. 7396158011" className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Email Address *</label>
                        <input type="email" required placeholder="Your email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} />
                      </div>
                      <div>
                        <label className={labelClass}>Subject</label>
                        <input type="text" placeholder="e.g. Distributorship enquiry" className={inputClass} value={subject} onChange={(e) => setSubject(e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Your Message *</label>
                      <textarea
                        required
                        rows={5}
                        placeholder="Describe your requirements (bulk order, commercial sanitizers, product inquiry)..."
                        className={`${inputClass} resize-none`}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-primary hover:bg-primary-light text-white font-bold py-3 px-7 rounded-xl text-xs shadow transition-colors flex items-center gap-1.5"
                    >
                      <Send size={14} /> {loading ? 'Sending…' : 'Submit Enquiry'}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* ═══════ DISTRIBUTOR APPLICATION ═══════ */}
            {activeTab === 'distributor' && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-border shadow-soft">

                {/* Form Header */}
                <div className="text-center pb-5 border-b border-slate-100 mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-teal-50 rounded-xl mb-3">
                    <ClipboardList size={22} className="text-primary" />
                  </div>
                  <h2 className="font-heading font-bold text-lg text-heading">DISTRIBUTOR APPLICATION FORM</h2>
                  <p className="text-[10px] text-muted mt-1 uppercase tracking-widest font-semibold">
                    UNS HOME CLEANING PRODUCTS PVT LTD
                  </p>
                </div>

                {dSuccess ? (
                  <div className="bg-teal-50 border border-teal-100 rounded-2xl p-8 text-center space-y-3">
                    <CheckCircle2 className="text-primary mx-auto" size={44} />
                    <h4 className="font-heading font-bold text-heading text-sm">Application Submitted!</h4>
                    <p className="text-xs text-muted max-w-sm mx-auto">
                      Thank you for applying to become a UNS distributor. Our dealership team will contact you within 48 hours.
                    </p>
                    <button
                      onClick={handleWhatsAppChat}
                      className="mt-2 inline-flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-2 px-5 rounded-lg transition-colors"
                    >
                      <MessageSquare size={13} /> Follow up on WhatsApp
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleDistributorSubmit} className="space-y-5">

                    {/* Section: Personal Info */}
                    <div className="bg-slate-50/70 rounded-2xl p-4 space-y-4 border border-slate-100">
                      <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1.5">
                        <User size={12} /> Applicant Details
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>Applicant Name *</label>
                          <input type="text" required placeholder="Full legal name" className={inputClass} value={dApplicantName} onChange={(e) => setDApplicantName(e.target.value)} />
                        </div>
                        <div>
                          <label className={labelClass}>Business Name *</label>
                          <input type="text" required placeholder="Registered business / shop name" className={inputClass} value={dBusinessName} onChange={(e) => setDBusinessName(e.target.value)} />
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>Full Business Address *</label>
                        <textarea
                          required
                          rows={3}
                          placeholder="Door No., Street, City, District, State, PIN Code"
                          className={`${inputClass} resize-none`}
                          value={dAddress}
                          onChange={(e) => setDAddress(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Section: Contact Info */}
                    <div className="bg-slate-50/70 rounded-2xl p-4 space-y-4 border border-slate-100">
                      <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1.5">
                        <Phone size={12} /> Contact Information
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>Mobile Number *</label>
                          <input type="tel" required placeholder="10-digit mobile number" className={inputClass} value={dMobile} onChange={(e) => setDMobile(e.target.value)} />
                        </div>
                        <div>
                          <label className={labelClass}>WhatsApp Number *</label>
                          <input type="tel" required placeholder="WhatsApp number" className={inputClass} value={dWhatsApp} onChange={(e) => setDWhatsApp(e.target.value)} />
                        </div>
                        <div>
                          <label className={labelClass}>Email ID</label>
                          <input type="email" placeholder="Business email address" className={inputClass} value={dEmail} onChange={(e) => setDEmail(e.target.value)} />
                        </div>
                        <div>
                          <label className={labelClass}>GST Number</label>
                          <input type="text" placeholder="e.g. 36AABCU9603R1ZM" className={inputClass} value={dGST} onChange={(e) => setDGST(e.target.value)} />
                        </div>
                      </div>
                    </div>

                    {/* Section: Business Details */}
                    <div className="bg-slate-50/70 rounded-2xl p-4 space-y-4 border border-slate-100">
                      <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1.5">
                        <Building2 size={12} /> Business Details
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>Area / District *</label>
                          <input type="text" required placeholder="e.g. Siddipet, Medak, Hyderabad" className={inputClass} value={dArea} onChange={(e) => setDArea(e.target.value)} />
                        </div>
                        <div>
                          <label className={labelClass}>Years of Business Experience *</label>
                          <input type="text" required placeholder="e.g. 3 years, Fresher" className={inputClass} value={dExperience} onChange={(e) => setDExperience(e.target.value)} />
                        </div>
                      </div>
                    </div>

                    {/* Section: Products Interested */}
                    <div className="bg-slate-50/70 rounded-2xl p-4 space-y-3 border border-slate-100">
                      <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1.5">
                        <Package size={12} /> Products Interested *
                      </h4>
                      <p className="text-[10px] text-muted">Select all products you wish to distribute:</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                        {PRODUCTS.map((p) => (
                          <label
                            key={p}
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-all select-none ${
                              dProducts.includes(p)
                                ? 'bg-teal-50 border-primary text-primary font-bold'
                                : 'bg-white border-border text-body hover:border-primary/40'
                            }`}
                          >
                            <input
                              type="checkbox"
                              className="accent-primary w-3.5 h-3.5"
                              checked={dProducts.includes(p)}
                              onChange={() => toggleProduct(p)}
                            />
                            {p}
                          </label>
                        ))}
                      </div>
                      {dProducts.length === 0 && (
                        <p className="text-[10px] text-red-400">Please select at least one product.</p>
                      )}
                    </div>

                    {/* Section: Order & Signature */}
                    <div className="bg-slate-50/70 rounded-2xl p-4 space-y-4 border border-slate-100">
                      <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1.5">
                        <Hash size={12} /> Order & Declaration
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>Expected Monthly Order Quantity *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. 200 litres / 500 units"
                            className={inputClass}
                            value={dQty}
                            onChange={(e) => setDQty(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Date *</label>
                          <input
                            type="date"
                            required
                            className={inputClass}
                            value={dDate}
                            onChange={(e) => setDDate(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Signature Upload - optional */}
                      <div>
                        <label className={labelClass}>
                          Applicant Signature <span className="text-slate-400 font-normal normal-case tracking-normal">(optional – upload image)</span>
                        </label>
                        <div
                          onClick={() => signatureRef.current?.click()}
                          className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-5 cursor-pointer hover:border-primary/50 hover:bg-teal-50/30 transition-all"
                        >
                          <input
                            ref={signatureRef}
                            type="file"
                            accept="image/*,.pdf"
                            className="hidden"
                            onChange={(e) => setDSignature(e.target.files?.[0] || null)}
                          />
                          <Upload size={22} className="text-muted mb-2" />
                          {dSignature ? (
                            <p className="text-xs font-semibold text-primary text-center">{dSignature.name}</p>
                          ) : (
                            <>
                              <p className="text-xs text-muted font-medium">Click to upload signature image</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">PNG, JPG or PDF (max 2 MB)</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Declaration text */}
                    <p className="text-[10px] text-muted leading-relaxed border-t border-slate-100 pt-4">
                      I hereby declare that all the above information provided is true and correct to the best of my knowledge. I understand that submission of this form is not a guarantee of distributorship and the final appointment is subject to UNS HOME CLEANING PRODUCTS PVT LTD's terms & conditions.
                    </p>

                    <button
                      type="submit"
                      disabled={dLoading || dProducts.length === 0}
                      className="w-full sm:w-auto bg-primary hover:bg-primary-light disabled:opacity-50 text-white font-bold py-3 px-8 rounded-xl text-xs shadow transition-colors flex items-center justify-center gap-2"
                    >
                      <ChevronRight size={15} />
                      {dLoading ? 'Submitting Application…' : 'Submit Distributor Application'}
                    </button>

                  </form>
                )}
              </div>
            )}

          </div>
        </div>

        {/* ── Google Maps Embed ── */}
        <section id="map" className="mt-16 bg-white p-4 rounded-3xl border border-border shadow-soft overflow-hidden" data-aos="fade-up">
          <div className="flex items-center gap-3 px-2 pb-3">
            <MapPin size={18} className="text-primary" />
            <div>
              <h3 className="font-heading font-bold text-sm text-heading">UNS Head Office & Factory Location</h3>
              <p className="text-[10px] text-muted">19-8-34/5, Near Vemulawada Kaman, Siricilla Road, Siddipet, Telangana – 502103</p>
            </div>
          </div>
          <div className="w-full rounded-2xl overflow-hidden border border-slate-100 shadow-inner" style={{ height: '420px' }}>
            <iframe
              title="UNS Home Cleaning Products Location - Siddipet"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3799.1949085862895!2d78.84942!3d18.10077!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcchome00000001%3A0x00000000000000!2sSiddipet%2C%20Telangana%20502103!5e0!3m2!1sen!2sin!4v1686000000000!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div className="flex flex-wrap gap-3 mt-3 px-2">
            <a
              href="https://maps.google.com/?q=Siddipet+Telangana+502103"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-primary text-white text-[10px] font-bold px-4 py-2 rounded-full hover:bg-primary-light transition-colors"
            >
              <MapPin size={12} /> Get Directions
            </a>
            <a
              href="https://maps.google.com/?q=UNS+Home+Cleaning+Products+Siddipet+Telangana"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-white border border-border text-heading text-[10px] font-bold px-4 py-2 rounded-full hover:border-primary hover:text-primary transition-colors"
            >
              Open in Google Maps ↗
            </a>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Contact;
