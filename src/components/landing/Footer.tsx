import { Shield, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-card py-12">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Shield className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">VproTechDigital</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Empowering businesses through innovative software solutions and building the next generation of tech talent.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> contact@vprotechdigital.com</li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> +91-XXXXX-XXXXX</li>
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> India</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} VproTechDigital. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
