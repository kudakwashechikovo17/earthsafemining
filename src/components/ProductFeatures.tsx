
import { Card } from '@/components/ui/card';

const ProductFeatures = () => {
  const features = [
    {
      title: "Smart Data Syncing",
      description: "Automatically capture and process mining data from multiple sources",
      icon: "🔄",
      color: "bg-green-700"
    },
    {
      title: "Daily Profit + Expense Dashboards",
      description: "Real-time financial insights with clear profit and loss tracking",
      icon: "📊",
      color: "bg-yellow-600"
    },
    {
      title: "Automated Compliance Alerts",
      description: "Stay compliant with automated monitoring and instant notifications",
      icon: "⚠️",
      color: "bg-green-600"
    },
    {
      title: "AI-Powered Credit Score",
      description: "Transparent credit scoring with SHAP explanations you can understand",
      icon: "🧠",
      color: "bg-yellow-700"
    },
    {
      title: "In-App Loan Offers",
      description: "Receive instant equipment financing offers directly in the platform",
      icon: "💰",
      color: "bg-green-600"
    },
    {
      title: "Downloadable Financial Statements",
      description: "Professional reports ready for banks, investors, and compliance",
      icon: "📄",
      color: "bg-yellow-600"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Powerful Features for Mining Success
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Everything you need to digitize operations, build credit, and access financing
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="p-8 card-hover border-gray-200 bg-white backdrop-blur-sm animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl ${feature.color} text-white text-2xl mb-6`}>
                {feature.icon}
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {feature.title}
              </h3>
              
              <p className="text-gray-700 leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductFeatures;
