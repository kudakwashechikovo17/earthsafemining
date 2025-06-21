
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setIsSubmitted(true);
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setIsOpen(false);
      setFormData({
        name: '',
        email: '',
        company: '',
        phone: '',
        message: ''
      });
    }, 3000);
  };

  const ContactForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="mt-1"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="company">Company/Organization</Label>
          <Input
            id="company"
            name="company"
            value={formData.company}
            onChange={handleInputChange}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleInputChange}
          placeholder="Tell us about your needs or ask any questions..."
          className="mt-1"
          rows={4}
        />
      </div>

      {isSubmitted ? (
        <div className="text-center py-4">
          <div className="text-green-600 font-semibold mb-2">✓ Thank you for your interest!</div>
          <p className="text-gray-600">We'll be in touch with you shortly.</p>
        </div>
      ) : (
        <Button type="submit" className="w-full bg-green-700 hover:bg-green-800">
          Submit Request
        </Button>
      )}
    </form>
  );

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-forest-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-forest-700 to-copper-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm sm:text-lg">E</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-forest-900 truncate">Earthsafe MineTrack</h1>
              <p className="text-xs text-forest-700 hidden sm:block">AI-powered credit intelligence</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            <a href="#home" className="text-forest-800 hover:text-copper-600 transition-colors font-medium text-sm xl:text-base">Home</a>
            <a href="#how-it-works" className="text-forest-800 hover:text-copper-600 transition-colors font-medium text-sm xl:text-base">How It Works</a>
            <a href="#for-miners" className="text-forest-800 hover:text-copper-600 transition-colors font-medium text-sm xl:text-base">For Miners</a>
            <a href="#for-lenders" className="text-forest-800 hover:text-copper-600 transition-colors font-medium text-sm xl:text-base">For Lenders</a>
            <a href="#about" className="text-forest-800 hover:text-copper-600 transition-colors font-medium text-sm xl:text-base">About</a>
            <a href="#contact" className="text-forest-800 hover:text-copper-600 transition-colors font-medium text-sm xl:text-base">Contact</a>
          </nav>

          {/* CTA Button */}
          <div className="hidden lg:block">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-forest-700 to-forest-800 hover:from-forest-800 hover:to-forest-900 text-white px-4 xl:px-6 py-2 rounded-lg transition-all duration-300 text-sm xl:text-base">
                  Request Demo
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-white">
                <DialogHeader>
                  <DialogTitle>Request a Demo</DialogTitle>
                </DialogHeader>
                <ContactForm />
              </DialogContent>
            </Dialog>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-forest-800 flex-shrink-0"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="lg:hidden mt-4 py-4 border-t border-forest-200 animate-fade-in">
            <div className="flex flex-col space-y-4">
              <a href="#home" className="text-forest-800 hover:text-copper-600 transition-colors font-medium text-center py-2">Home</a>
              <a href="#how-it-works" className="text-forest-800 hover:text-copper-600 transition-colors font-medium text-center py-2">How It Works</a>
              <a href="#for-miners" className="text-forest-800 hover:text-copper-600 transition-colors font-medium text-center py-2">For Miners</a>
              <a href="#for-lenders" className="text-forest-800 hover:text-copper-600 transition-colors font-medium text-center py-2">For Lenders</a>
              <a href="#about" className="text-forest-800 hover:text-copper-600 transition-colors font-medium text-center py-2">About</a>
              <a href="#contact" className="text-forest-800 hover:text-copper-600 transition-colors font-medium text-center py-2">Contact</a>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-forest-700 to-forest-800 text-white w-full mt-4 py-3 text-base">
                    Request Demo
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-white">
                  <DialogHeader>
                    <DialogTitle>Request a Demo</DialogTitle>
                  </DialogHeader>
                  <ContactForm />
                </DialogContent>
              </Dialog>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
