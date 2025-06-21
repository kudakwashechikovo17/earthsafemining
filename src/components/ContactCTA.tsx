
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const ContactCTA = () => {
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
    <section id="contact" className="py-20 bg-gradient-to-br from-slate-800 via-slate-700 to-amber-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-40 h-40 bg-amber-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-slate-500 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 px-2">
            Want to see <span className="text-amber-300">Earthsafe</span> in action?
          </h2>
          
          <p className="text-lg sm:text-xl text-white/90 mb-12 max-w-2xl mx-auto px-4">
            Join miners and lenders who are already transforming the mining finance landscape with AI-powered credit intelligence.
          </p>

          {/* CTA Cards */}
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 mb-16 px-4">
            <Card className="p-6 sm:p-8 bg-white/10 backdrop-blur-sm border-white/20 card-hover">
              <div className="text-3xl sm:text-4xl mb-4">👨‍💼</div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">For Mining Operations</h3>
              <p className="text-white/80 mb-6 text-sm sm:text-base">
                See how your operational data can unlock equipment financing and build your credit profile.
              </p>
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white w-full rounded-xl py-3 sm:py-4 text-base sm:text-lg"
                  >
                    Book a Live Demo
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-white">
                  <DialogHeader>
                    <DialogTitle>Request a Demo</DialogTitle>
                  </DialogHeader>
                  <ContactForm />
                </DialogContent>
              </Dialog>
            </Card>

            <Card className="p-6 sm:p-8 bg-white/10 backdrop-blur-sm border-white/20 card-hover">
              <div className="text-3xl sm:text-4xl mb-4">🏦</div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">For Financial Institutions</h3>
              <p className="text-white/80 mb-6 text-sm sm:text-base">
                Discover how verified mining data can reduce risk and expand your lending portfolio.
              </p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white w-full rounded-xl py-3 sm:py-4 text-base sm:text-lg"
                  >
                    Talk to Our Team
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-white">
                  <DialogHeader>
                    <DialogTitle>Contact Our Team</DialogTitle>
                  </DialogHeader>
                  <ContactForm />
                </DialogContent>
              </Dialog>
            </Card>
          </div>

          {/* Contact options */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-white/30 text-white hover:bg-white/10 px-4 sm:px-8 py-3 sm:py-4 rounded-xl backdrop-blur-sm w-full sm:w-auto text-sm sm:text-base min-w-0"
              onClick={() => window.open('mailto:earthsafeminetrack@gmail.com', '_blank')}
            >
              <span className="truncate">📧 earthsafeminetrack@gmail.com</span>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-white/30 text-white hover:bg-white/10 px-4 sm:px-8 py-3 sm:py-4 rounded-xl backdrop-blur-sm w-full sm:w-auto text-sm sm:text-base"
              onClick={() => window.open('https://wa.me/263718370460', '_blank')}
            >
              📱 +263718370460
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactCTA;
