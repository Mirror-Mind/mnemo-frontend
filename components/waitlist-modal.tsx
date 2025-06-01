"use client"

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IconBrandWhatsapp, IconLoader2, IconCheck, IconArrowRight } from "@tabler/icons-react";
import { toast } from "sonner";
import { initializeEmailJS, sendWelcomeEmail, sendAdminNotification } from "@/lib/email";

interface WaitlistModalProps {
  children: React.ReactNode;
}

const countryCodes = [
  { code: "+1", country: "US/CA", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+49", country: "Germany", flag: "🇩🇪" },
  { code: "+33", country: "France", flag: "🇫🇷" },
  { code: "+81", country: "Japan", flag: "🇯🇵" },
  { code: "+86", country: "China", flag: "🇨🇳" },
  { code: "+61", country: "Australia", flag: "🇦🇺" },
  { code: "+55", country: "Brazil", flag: "🇧🇷" },
  { code: "+34", country: "Spain", flag: "🇪🇸" },
  { code: "+39", country: "Italy", flag: "🇮🇹" },
  { code: "+31", country: "Netherlands", flag: "🇳🇱" },
  { code: "+46", country: "Sweden", flag: "🇸🇪" },
  { code: "+47", country: "Norway", flag: "🇳🇴" },
  { code: "+41", country: "Switzerland", flag: "🇨🇭" },
  { code: "+82", country: "South Korea", flag: "🇰🇷" },
  { code: "+65", country: "Singapore", flag: "🇸🇬" },
  { code: "+852", country: "Hong Kong", flag: "🇭🇰" },
  { code: "+971", country: "UAE", flag: "🇦🇪" },
  { code: "+966", country: "Saudi Arabia", flag: "🇸🇦" },
];

export function WaitlistModal({ children }: WaitlistModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    countryCode: "+1",
  });

  // Initialize EmailJS when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      initializeEmailJS();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First, save to database
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Database insertion successful, now send emails
        try {
          // Send welcome email to user
          await sendWelcomeEmail(formData.email, formData.name);
          
          // Send admin notification
          await sendAdminNotification(formData);
          
          console.log("📧 Emails sent successfully");
        } catch (emailError) {
          console.error("Email sending failed:", emailError);
          // Don't show error to user since database entry was successful
        }

        setSuccess(true);
        toast.success("Welcome to the waitlist! We'll be in touch soon.");
        
        // Reset form after successful submission
        setTimeout(() => {
          setOpen(false);
          setSuccess(false);
          setFormData({
            name: "",
            email: "",
            phoneNumber: "",
            countryCode: "+1",
          });
        }, 2000);
      } else {
        // Handle validation errors
        if (data.details && Array.isArray(data.details)) {
          const errorMessages = data.details.map((detail: any) => detail.message).join(", ");
          toast.error(`Validation error: ${errorMessages}`);
        } else {
          toast.error(data.error || "Something went wrong. Please try again.");
        }
      }
    } catch (error) {
      console.error("Waitlist submission error:", error);
      toast.error("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Get the selected country data for display
  const selectedCountry = countryCodes.find(country => country.code === formData.countryCode);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
              <IconBrandWhatsapp className="h-4 w-4 text-green-500" />
            </div>
            Join the Mnemo Waitlist
          </DialogTitle>
          <DialogDescription>
            Be among the first to experience your personal WhatsApp assistant. We'll notify you when we're ready to launch!
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center py-8 text-center">
            <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
              <IconCheck className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">You're on the list! 🎉</h3>
            <p className="text-muted-foreground text-sm">
              We'll send you an email when Mnemo is ready for you.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">WhatsApp Number</Label>
              <div className="flex gap-2">
                <Select
                  value={formData.countryCode}
                  onValueChange={(value) => handleInputChange("countryCode", value)}
                  disabled={loading}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue>
                      {selectedCountry && (
                        <span className="flex items-center gap-2">
                          <span className="text-lg">{selectedCountry.flag}</span>
                          <span>{selectedCountry.code}</span>
                        </span>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {countryCodes.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{country.flag}</span>
                          <span>{country.code}</span>
                          <span className="text-muted-foreground text-sm">({country.country})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Phone number"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                  required
                  disabled={loading}
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <IconBrandWhatsapp className="h-3 w-3 text-green-500" />
                Make sure this number is your number on WhatsApp
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-green-500 hover:bg-green-600" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                  Joining Waitlist...
                </>
              ) : (
                <>
                  Join Waitlist
                  <IconArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              We'll keep your information safe and only use it to notify you about Mnemo.
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
} 