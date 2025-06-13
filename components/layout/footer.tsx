import Link from "next/link";
import { Car, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    "Company": [
      { name: "About Us", href: "/about" },
      { name: "How It Works", href: "/how-it-works" },
      { name: "Careers", href: "/careers" },
      { name: "Press", href: "/press" },
      { name: "Blog", href: "/blog" },
    ],
    "For Renters": [
      { name: "Browse Cars", href: "/cars" },
      { name: "Pricing", href: "/pricing" },
      { name: "Insurance", href: "/insurance" },
      { name: "Safety", href: "/safety" },
      { name: "Renter Guide", href: "/renter-guide" },
    ],
    "For Hosts": [
      { name: "List Your Car", href: "/host" },
      { name: "Host Resources", href: "/host-resources" },
      { name: "Host Insurance", href: "/host-insurance" },
      { name: "Calculator", href: "/calculator" },
      { name: "Host Guide", href: "/host-guide" },
    ],
    "Support": [
      { name: "Help Center", href: "/help" },
      { name: "Contact Us", href: "/contact" },
      { name: "Trust & Safety", href: "/trust-safety" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Privacy Policy", href: "/privacy" },
    ],
  };

  const socialLinks = [
    { name: "Facebook", href: "#", icon: Facebook },
    { name: "Twitter", href: "#", icon: Twitter },
    { name: "Instagram", href: "#", icon: Instagram },
    { name: "LinkedIn", href: "#", icon: Linkedin },
  ];

  return (
    <footer className="bg-background border-t border-border">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:px-8">
        {/* Newsletter Section */}
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8 xl:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center bg-foreground text-background">
                <Car className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold text-foreground">CarGopher</span>
            </div>
            <p className="text-sm leading-6 text-muted-foreground max-w-xs">
              The world's largest car sharing marketplace. Find the perfect car for any trip.
            </p>
            <div className="flex space-x-6">
              {socialLinks.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>
          
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-foreground">Company</h3>
                <ul className="mt-6 space-y-4">
                  {footerLinks.Company.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm leading-6 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-foreground">For Renters</h3>
                <ul className="mt-6 space-y-4">
                  {footerLinks["For Renters"].map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm leading-6 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-foreground">For Hosts</h3>
                <ul className="mt-6 space-y-4">
                  {footerLinks["For Hosts"].map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm leading-6 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-foreground">Support</h3>
                <ul className="mt-6 space-y-4">
                  {footerLinks.Support.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm leading-6 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="mt-16 border-t border-border pt-8 sm:mt-20 lg:mt-24">
          <div className="xl:grid xl:grid-cols-3 xl:gap-8">
            <div>
              <h3 className="text-sm font-semibold leading-6 text-foreground">
                Subscribe to our newsletter
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Get the latest updates, special offers, and travel inspiration.
              </p>
            </div>
            <div className="mt-6 sm:flex sm:max-w-md xl:mt-0">
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <Input
                type="email"
                name="email-address"
                id="email-address"
                autoComplete="email"
                required
                className="w-full min-w-0 appearance-none border-border bg-background px-3 py-1.5 text-base text-foreground placeholder-muted-foreground shadow-sm focus:border-foreground focus:ring-foreground sm:w-64 sm:text-sm sm:leading-6 xl:w-full"
                placeholder="Enter your email"
              />
              <div className="mt-4 sm:ml-4 sm:mt-0 sm:flex-shrink-0">
                <Button
                  type="submit"
                  className="flex w-full items-center justify-center bg-foreground px-3 py-2 text-sm font-semibold text-background shadow-sm hover:bg-foreground/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground sm:w-auto"
                >
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-8 border-t border-border pt-8 md:flex md:items-center md:justify-between">
          <div className="flex space-x-6 md:order-2">
            <Link
              href="/privacy"
              className="text-sm leading-6 text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy policy
            </Link>
            <Link
              href="/terms"
              className="text-sm leading-6 text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms of service
            </Link>
            <Link
              href="/cookies"
              className="text-sm leading-6 text-muted-foreground hover:text-foreground transition-colors"
            >
              Cookie policy
            </Link>
          </div>
          <p className="mt-8 text-xs leading-5 text-muted-foreground md:order-1 md:mt-0">
            &copy; {currentYear} CarGopher, Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 