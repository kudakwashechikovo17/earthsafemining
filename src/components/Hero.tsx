import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const Hero = () => {
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
    <section id="home" className="relative bg-white py-20 overflow-hidden min-h-screen flex items-center">
      {/* Background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/lovable-uploads/8ec48d40-e9ab-4028-a66b-a1995f374392.png)'
        }}
      ></div>
      
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Background decoration (keeping some subtle elements) */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-yellow-500 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-green-600 rounded-full blur-2xl"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-white text-xs sm:text-sm font-medium mb-8 mx-auto max-w-full">
            <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2 flex-shrink-0"></span>
            <span className="text-center leading-tight">Digital tools and AI-powered credit intelligence for the underbanked small-scale mining economy</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight px-2 drop-shadow-lg">
            Unlock Equipment Financing with{' '}
            <span className="text-yellow-300">Mining Data</span>{' '}
            That Works for You
          </h1>

          {/* Subtext */}
          <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed px-4 drop-shadow-md">
            Earthsafe MineTrack transforms production logs, receipts, and compliance records into a lender-trusted credit score — giving small-scale miners access to tools they need to grow.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-12 px-4">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="lg" 
                  className="bg-green-700 hover:bg-green-800 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto min-w-0"
                >
                  Request a Demo
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-white">
                <DialogHeader>
                  <DialogTitle>Request a Demo</DialogTitle>
                </DialogHeader>
                <ContactForm />
              </DialogContent>
            </Dialog>
            
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-white/50 text-white hover:bg-white/10 backdrop-blur-sm px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg rounded-xl w-full sm:w-auto transition-all duration-300 min-w-0"
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Explore the Platform
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
