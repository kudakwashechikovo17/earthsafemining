
import { Card } from '@/components/ui/card';

const FounderQuote = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          <Card className="p-8 md:p-12 bg-white shadow-xl border-gray-200">
            <div className="grid lg:grid-cols-3 gap-8 items-center">
              {/* Founder Image */}
              <div className="lg:col-span-1">
                <div className="w-full aspect-square rounded-xl overflow-hidden">
                  <img 
                    src="/lovable-uploads/75f79b78-8eff-4fcb-a159-fba9b2bc24be.png" 
                    alt="Kudakwashe Chikovo, Founder & CEO"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Quote content */}
              <div className="lg:col-span-2">
                <div className="text-6xl text-green-700 mb-6">"</div>
                <blockquote className="text-xl md:text-2xl text-gray-800 mb-8 leading-relaxed italic">
                  Small-scale miners already have the cash flow — what they lack is formal data. Earthsafe exists to bridge that gap and unlock affordable financing using credit scores built from the ground up.
                </blockquote>
                
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-700 rounded-full flex items-center justify-center text-white font-bold">
                      KC
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-lg">Kudakwashe Chikovo</div>
                      <div className="text-gray-600">Founder & CEO</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default FounderQuote;
