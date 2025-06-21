
import { Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-green-900 text-white py-16">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-yellow-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">Earthsafe MineTrack</h3>
                <p className="text-sm text-white/70">AI-powered credit intelligence</p>
              </div>
            </div>
            <p className="text-white/80 mb-6 max-w-md">
              Transforming the mining economy with AI-powered credit intelligence that connects small-scale miners to the financing they need to grow.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://www.linkedin.com/in/kudakwashe-chikovo-85430123a" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-3 text-white/80">
              <li><a href="#how-it-works" className="hover:text-yellow-300 transition-colors">How It Works</a></li>
              <li><a href="#for-miners" className="hover:text-yellow-300 transition-colors">For Miners</a></li>
              <li><a href="#for-lenders" className="hover:text-yellow-300 transition-colors">For Lenders</a></li>
              <li><a href="#" className="hover:text-yellow-300 transition-colors">Pricing</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-3 text-white/80">
              <li><a href="#" className="hover:text-yellow-300 transition-colors">Help Center</a></li>
              <li><a href="#contact" className="hover:text-yellow-300 transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-yellow-300 transition-colors">API Documentation</a></li>
              <li><a href="#" className="hover:text-yellow-300 transition-colors">Status Page</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex flex-wrap gap-6 text-sm text-white/70 mb-4 md:mb-0">
            <a href="#" className="hover:text-yellow-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-yellow-300 transition-colors">Terms of Use</a>
            <a href="#" className="hover:text-yellow-300 transition-colors">Cookie Policy</a>
            <a href="#" className="hover:text-yellow-300 transition-colors">Security</a>
          </div>
          <div className="text-sm text-white/70">
            © 2024 Earthsafe MineTrack. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
