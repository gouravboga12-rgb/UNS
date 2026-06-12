import React from 'react';
import { MessageCircle } from 'lucide-react';

interface FloatingWhatsAppProps {
  productName?: string;
  isB2B?: boolean;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({ productName, isB2B = false }) => {
  const whatsappNumber = "917396158011"; // Country code + mobile number without '+'
  
  const generateMessage = () => {
    if (productName) {
      return `Hello UNS! I am interested in purchasing/inquiring about the product: ${productName}. Please provide price and availability details.`;
    }
    if (isB2B) {
      return `Hello UNS! I am a distributor/dealer interested in bulk purchase and dealership opportunities. Please share your catalog.`;
    }
    return `Hello UNS! I would like to make an enquiry about your cleaning products.`;
  };

  const handleClick = () => {
    const message = encodeURIComponent(generateMessage());
    const url = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${message}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95 animate-whatsapp-pulse group"
      aria-label="Contact UNS on WhatsApp"
      title="Chat with UNS"
    >
      <MessageCircle size={28} className="stroke-[2.5]" />
      
      {/* Tooltip on hover */}
      <span className="absolute right-16 bg-slate-900 text-white text-[11px] font-bold py-1.5 px-3 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap shadow-md border border-slate-800">
        {productName ? `Inquire about ${productName}` : "Contact us on WhatsApp"}
      </span>
    </button>
  );
};
export default FloatingWhatsApp;
