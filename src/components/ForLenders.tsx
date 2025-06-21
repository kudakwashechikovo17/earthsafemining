
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const ForLenders = () => {
  const advantages = [
    {
      title: "Verified Production Data",
      description: "Real-time insights from actual mining operations, not self-reported figures.",
      icon: "✅"
    },
    {
      title: "Risk Stratification",
      description: "AI-powered models segment borrowers by reliability and growth potential.",
      icon: "📊"
    },
    {
      title: "Cash Flow Projections",
      description: "Predictive analytics based on seasonal patterns and market conditions.",
      icon: "📈"
    },
    {
      title: "Automated Monitoring",
      description: "Continuous oversight of borrower performance with early warning systems.",
      icon: "👁️"
    }
  ];

  return (
    <section id="for-lenders" className="py-20 bg-yellow-50">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
          {/* Left visual */}
          <div className="animate-fade-in">
            <Card className="p-8 bg-white shadow-xl border-gray-200">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Lending Advantages</h3>
                
                <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-4">Why Partner With Us</h4>
                  <div className="space-y-4 text-left">
                    <div className="flex justify-between items-center">
                      <span className="text-green-800">Data-driven decisions</span>
                      <span className="text-green-700 font-medium">✓</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-green-800">Reduced lending risk</span>
                      <span className="text-green-700 font-medium">✓</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-green-800">Verified income streams</span>
                      <span className="text-green-700 font-medium">✓</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-green-800">Real-time monitoring</span>
                      <span className="text-green-700 font-medium">✓</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right content */}
          <div className="animate-slide-in-right">
            <div className="inline-flex items-center px-4 py-2 bg-yellow-100 border border-yellow-300 rounded-full text-green-800 text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
              For Financial Institutions
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Reliable Scores. <span className="text-green-700">Real Returns.</span>
            </h2>
            
            <p className="text-xl text-gray-700 mb-8 leading-relaxed">
              Tap into a high-potential segment with verified production-based credit scoring, cash-flow projections, and risk stratification.
            </p>

            <div className="space-y-6 mb-8">
              {advantages.map((advantage, index) => (
                <Card key={index} className="p-6 card-hover border-gray-200 bg-white">
                  <div className="flex items-start space-x-4">
                    <div className="text-2xl">{advantage.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-2">{advantage.title}</h4>
                      <p className="text-gray-700 text-sm">{advantage.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button 
                size="lg" 
                className="bg-green-700 hover:bg-green-800 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg rounded-xl w-full sm:w-auto min-w-0"
              >
                Partner With Us
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-yellow-600 text-yellow-700 hover:bg-yellow-50 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg rounded-xl w-full sm:w-auto min-w-0"
              >
                View Portfolio Data
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForLenders;
