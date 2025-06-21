
import { Button } from '@/components/ui/button';

const ForMiners = () => {
  const benefits = [
    {
      title: "No Paperwork Hassles",
      description: "Skip the endless forms and documentation. Your operational data speaks for itself.",
      icon: "📋"
    },
    {
      title: "Direct Equipment Access",
      description: "Get financing offers for excavators, crushers, and processing equipment based on your performance.",
      icon: "🚜"
    },
    {
      title: "Build Credit While You Work",
      description: "Every day of operations strengthens your credit profile for future opportunities.",
      icon: "📈"
    },
    {
      title: "Transparent Scoring",
      description: "Understand exactly how your credit score is calculated with clear explanations.",
      icon: "🔍"
    }
  ];

  return (
    <section id="for-miners" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center animate-fade-in">
            <div className="inline-flex items-center px-4 py-2 bg-green-100 rounded-full text-green-800 text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
              For Small-Scale Miners
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Grow with <span className="text-yellow-600">Confidence</span>
            </h2>
            
            <p className="text-xl text-gray-700 mb-12 leading-relaxed max-w-3xl mx-auto">
              No paperwork. No brokers. Just verified data that unlocks new equipment opportunities and supports your daily operations.
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {benefits.map((benefit, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl mb-4">{benefit.icon}</div>
                  <h4 className="font-semibold text-gray-900 mb-3">{benefit.title}</h4>
                  <p className="text-gray-700 text-sm leading-relaxed">{benefit.description}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-green-700 hover:bg-green-800 text-white px-8 py-4 rounded-xl"
              >
                Start Building Credit
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-yellow-600 text-yellow-700 hover:bg-yellow-50 px-8 py-4 rounded-xl"
              >
                See How It Works
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForMiners;
