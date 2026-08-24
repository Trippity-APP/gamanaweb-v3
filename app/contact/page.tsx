"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Mail,
  MapPin,
  Phone,
  Send,
  CheckCircle2,
  MessageSquare,
  Headphones,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import HeroHeader from "@/components/navigation/hero-header";
import Footer from "@/components/navigation/footer";
import { useToast } from "@/hooks/use-toast";
import { HeroSlideshow } from "@/components/HeroSlideshow";

export default function ContactPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    inquiryType: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast({
      title: "Message sent successfully!",
      description: "We'll get back to you within 24 hours.",
    });

    setFormData({
      name: "",
      email: "",
      subject: "",
      inquiryType: "",
      message: "",
    });

    setIsSubmitting(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      content: "support@gamana.app",
      link: "mailto:support@gamana.app",
    },
    {
      icon: Phone,
      title: "Call Us",
      content: "+1 (203) 405-0700",
      link: "tel:+12034050700",
    },
    {
      icon: MapPin,
      title: "Visit Us",
      content: "48, Church St, Haridevpur, Shanthala Nagar, Ashok Nagar, Bengaluru, Karnataka 560001",
      link: "#",
    },
  ];

  return (
    <>
      <main className="min-h-screen">
        <section className="relative h-[62vh] sm:h-[68vh] flex items-center justify-center overflow-hidden">
          {/* Photo behind the brand gradient, matching /marketplace-redesign, /cities,
              /ecosystem, and /about — a flat gradient here was the odd one out. */}
          <div className="absolute inset-0">
            <HeroSlideshow
              images={[
                "/mumbai-marine-drive-dusk-queens-necklace-arabian-sea.jpg",
                "/mumbai-csmt-victorian-gothic-heritage-walk.jpg",
                "/kerala-alleppey-houseboat-backwaters-golden-hour.jpg",
              ]}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#159895]/25 via-[#1A5F7A]/22 to-[#57C5B6]/20"></div>
            <div className="absolute inset-0 bg-black/20"></div>
          </div>

          <HeroHeader transparent={true} />

          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 right-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 left-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-white/50 rounded-full blur-3xl"></div>
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-24 pb-24 sm:pb-28">
            <div className="max-w-5xl mx-auto text-center space-y-8">
              <div className="space-y-4">
                <div className="inline-block w-fit">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight mb-2 animate-fade-in">
                    Get in Touch
                  </h1>
                  <div className="h-2 bg-white/60 rounded-full opacity-0 animate-fade-in" style={{ animationDelay: "150ms" }}></div>
                </div>
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/95 leading-relaxed max-w-3xl mx-auto opacity-0 animate-fade-in" style={{ animationDelay: "300ms" }}>
                  Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6 opacity-0 animate-fade-in" style={{ animationDelay: "450ms" }}>
                <a
                  href="https://play.google.com/store/apps/details?id=com.agent.gamana.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:scale-105 transition-transform"
                >
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                    alt="Download Gamana Heritage Travel App with Personalized Audio Tours on Android"
                    title="Get Gamana - Heritage Travel App with Personalized Audio Tours on Android"
                    className="h-14 w-auto"
                  />
                </a>
                <a
                  href="https://apps.apple.com/in/app/gamana-ai/id6748155654"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:scale-105 transition-transform"
                >
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
                    alt="Download Gamana Heritage Travel App with Personalized Audio Tours on iOS"
                    title="Get Gamana - Heritage Travel App with Personalized Audio Tours on iPhone & iPad"
                    className="h-14 w-auto"
                  />
                </a>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
        </section>

        {/* Contact snapshot, floated up over the hero photo in the same overlapping-card
            pattern used across /marketplace-redesign, /cities, and /ecosystem. */}
        <section className="relative z-10 -mt-14 sm:-mt-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-gray-100 bg-white shadow-lg p-5 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
                {contactInfo.map((info, index) => {
                  const Icon = info.icon;
                  return (
                    <a
                      key={index}
                      href={info.link}
                      className="flex items-start gap-3 rounded-xl p-2 -m-2 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#159895]/10">
                        <Icon className="h-4 w-4 text-[#159895]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{info.title}</p>
                        <p className="text-xs leading-snug text-gray-500">{info.content}</p>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="pt-14 pb-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <Card className="border-2">
                <CardContent className="p-8">
                  <h2 className="text-3xl font-bold mb-6 text-center">
                    Send Us a Message
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="h-12"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="inquiryType">Inquiry Type *</Label>
                      <Select
                        value={formData.inquiryType}
                        onValueChange={(value) =>
                          setFormData({ ...formData, inquiryType: value })
                        }
                        required
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Select inquiry type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Inquiry</SelectItem>
                          <SelectItem value="partner">Become a Partner</SelectItem>
                          <SelectItem value="support">Technical Support</SelectItem>
                          <SelectItem value="press">Press & Media</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        name="subject"
                        type="text"
                        placeholder="How can we help you?"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="h-12"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Tell us more about your inquiry..."
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        className="resize-none"
                      />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-[#159895] to-[#1A5F7A] hover:from-[#1A5F7A] hover:to-[#159895] text-white text-lg py-6 h-auto shadow-xl font-semibold"
                    >
                      {isSubmitting ? (
                        "Sending..."
                      ) : (
                        <>
                          Send Message
                          <Send className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <Card className="border-0 bg-gradient-to-br from-[#159895]/10 via-[#1A5F7A]/10 to-[#57C5B6]/10 shadow-xl">
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    <div className="bg-gradient-to-br from-[#159895] to-[#1A5F7A] p-4 rounded-2xl flex-shrink-0 shadow-lg">
                      <CheckCircle2 className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                        What happens next?
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        Once you submit your message, our team will review it and get back to you within 24 hours. For urgent matters, please call us directly at the number listed above.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
