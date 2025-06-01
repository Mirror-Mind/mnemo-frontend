"use client";
import { Button } from "@/components/ui/button";
import {
  IconArrowRight,
  IconBrandWhatsapp,
  IconMessage,
  IconSunHigh,
  IconBell,
  IconBolt,
  IconEye,
  IconBook,
} from "@tabler/icons-react";
import { LoginModal } from "@/components/login-modal";
import { HeroCarousel } from "@/components/hero-carousel";

export default function page() {
  return (
    <div className="flex min-h-screen flex-col scroll-smooth">
      <section className="bg-white relative overflow-hidden min-h-screen flex items-center scroll-section">
        {/* Light yellow gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 via-amber-25 to-yellow-100/30" />
        
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="h-full w-full"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.15) 1px, transparent 0)`,
              backgroundSize: '20px 20px'
            }}
          />
        </div>

        <div className="container relative py-8 px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
            
            {/* Left Column - Content */}
            <div className="space-y-8 flex flex-col justify-center">
              
              {/* Badge */}


              {/* Main Mnemo headline - largest text */}
              <div className="mb-6">
                <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold text-amber-600 leading-tight mb-2">
                  Meet Mnemo
                </h1>
              </div>

              {/* Main headline */}
              <div className="space-y-6">
                <div className="space-y-3">
                  <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 leading-tight">
                    Your Memory.
                  </h2>
                  <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-amber-500 leading-tight">
                    Your Mind.
                  </h2>
                  <div className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                    <h3 className="text-xl lg:text-2xl font-bold">
                      Whispered back to you.
                    </h3>
                  </div>
                </div>
                
                <p className="text-lg lg:text-xl text-gray-600 max-w-lg leading-relaxed">
                  <span className="font-semibold text-amber-600">Mnemo</span> is your personal assistant on WhatsApp — powered by AI, grounded in presence, 
                  and designed to mirror the way you think.
                </p>
              </div>

              {/* Feature grid */}
              <div className="grid grid-cols-2 gap-4 py-6">
                
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-amber-100/80 shadow-sm">
                  <div className="flex items-center mb-2">
                    <IconBell className="h-5 w-5 text-amber-600 mr-2" />
                    <span className="font-semibold text-gray-900 text-sm">Smart Reminders</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Quick notes, voice memos, and follow-ups that stick
                  </p>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-amber-100/80 shadow-sm">
                  <div className="flex items-center mb-2">
                    <IconSunHigh className="h-5 w-5 text-amber-600 mr-2" />
                    <span className="font-semibold text-gray-900 text-sm">Reflective Prompts</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Helps you think clearly and stay organized
                  </p>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-amber-100/80 shadow-sm">
                  <div className="flex items-center mb-2">
                    <IconBolt className="h-5 w-5 text-amber-600 mr-2" />
                    <span className="font-semibold text-gray-900 text-sm">Mind Mirroring</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Organizes your mind, not just your tasks
                  </p>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-amber-100/80 shadow-sm">
                  <div className="flex items-center mb-2">
                    <IconBook className="h-5 w-5 text-amber-600 mr-2" />
                    <span className="font-semibold text-gray-900 text-sm">Personal Memory</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Learns from you, gets smarter over time
                  </p>
                </div>

              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <LoginModal>
                  <Button
                    size="lg"
                    className="h-12 px-8 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Try Mnemo Today
                  </Button>
                </LoginModal>
                <a href="#features" className="inline-block">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 px-8 rounded-xl border-2 border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold transition-all duration-300"
                  >
                    <IconMessage className="mr-2 h-4 w-4" />
                    See How It Works
                  </Button>
                </a>
              </div>

              {/* Trust indicators */}
              <div className="flex items-center space-x-6 pt-4">
                <div className="flex items-center space-x-1">
                  <div className="flex -space-x-1">
                    {[1,2,3,4].map((i) => (
                      <div key={i} className="w-6 h-6 rounded-full bg-amber-200 border-2 border-white"></div>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 ml-2">For thinkers & dreamers</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-sm text-green-600">🔒</span>
                  <span className="text-sm text-gray-600">Private & encrypted</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-sm text-green-600">📱</span>
                  <span className="text-sm text-gray-600">Just WhatsApp</span>
                </div>
              </div>

              {/* Integration note */}
              <p className="text-sm text-gray-500 border-t border-amber-100 pt-4">
                Inspired by Mnemosyne, the Greek goddess of memory
              </p>

            </div>

            {/* Right Column - Mobile Mockup */}
            <div className="flex justify-center lg:justify-end items-center">
              <div className="relative">
                {/* Gradient background behind phone */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-200/40 to-yellow-300/30 rounded-3xl blur-3xl scale-110 opacity-60" />
                
                {/* Phone mockup container */}
                <div className="relative w-80 max-w-sm">
                  <HeroCarousel />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Founder-focused Features Section */}
      <section
        id="features"
        className="min-h-screen bg-gradient-to-b from-background to-muted/50 flex items-center scroll-section"
      >
        <div className="container px-4 sm:px-6 py-4">
          <div className="text-center mb-8 lg:mb-4">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
              <span className="text-amber-600 block text-lg sm:text-xl lg:text-2xl font-normal">
                Executive Excellence
              </span>
            </h2>
            <p className="text-base sm:text-lg lg:text-lg text-muted-foreground max-w-2xl mx-auto">
              The discipline of Stoic leaders, now automated for modern founders.
            </p>
          </div>

          <div className="max-w-5xl mx-auto relative">
            {/* Top Text Box - Daily Briefings */}
            <div className="flex justify-center mb-6 lg:mb-8">
              <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-4 lg:p-5 border border-amber-200/50 max-w-sm lg:max-w-md text-center shadow-lg">
                <div className="flex items-center justify-center mb-2 lg:mb-3">
                  <IconSunHigh className="h-5 w-5 lg:h-6 lg:w-6 text-amber-600 mr-2" />
                  <h3 className="text-lg lg:text-xl font-bold text-card-foreground">
                    Daily Briefings
                  </h3>
                </div>
                <p className="text-muted-foreground text-xs lg:text-sm mb-3 lg:mb-4">
                  Start each day with AI-powered insights about your meetings, deadlines, and priorities
                </p>
                <div className="bg-muted/60 rounded-lg p-2 lg:p-3 border border-border">
                  <p className="text-xs text-amber-700 font-medium mb-1">
                    Today's Focus
                  </p>
                  <p className="text-xs text-muted-foreground">
                    📊 VC pitch at 2pm • 🤝 Product demo with enterprise client • ⚡ Board deck deadline tomorrow
                  </p>
                </div>
              </div>
            </div>

            {/* Middle Row - Left, Center Image, Right */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-center mb-6 lg:mb-8">
              {/* Left Text Box - Meeting Prep */}
              <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-4 lg:p-5 border border-amber-200/50 text-center lg:text-right shadow-lg">
                <div className="flex items-center justify-center lg:justify-end mb-2 lg:mb-3">
                  <h3 className="text-lg lg:text-xl font-bold text-card-foreground mr-2">
                    Meeting Prep
                  </h3>
                  <IconBolt className="h-5 w-5 lg:h-6 lg:w-6 text-amber-600" />
                </div>
                <p className="text-muted-foreground text-xs lg:text-sm mb-3 lg:mb-4">
                  Automatically prepares you for every meeting with context, background, and talking points
                </p>
                <div className="bg-muted/60 rounded-lg p-2 lg:p-3 border border-border">
                  <p className="text-xs text-amber-700 font-medium mb-1">
                    Smart Prep
                  </p>
                  <p className="text-xs text-muted-foreground">
                    💼 "VC meeting at 2pm" → 📋 Investor background, portfolio, recent investments, talking points ready
                  </p>
                </div>
              </div>

              {/* Center Image */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-200/40 to-yellow-200/30 rounded-2xl blur-xl scale-110" />
                  <img
                    src="https://cdn.prod.website-files.com/62f41dee5606d80f65b7dcbb/66797dab410300c772a3f856_people_talking.webp"
                    alt="Founders collaborating with AI assistance"
                    className="relative w-48 h-48 lg:w-56 lg:h-56 object-cover rounded-2xl shadow-2xl border-2 border-amber-300/40"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-amber-900/20 to-transparent rounded-2xl" />
                  <div className="absolute bottom-3 lg:bottom-4 left-3 lg:left-4 right-3 lg:right-4 text-center">
                    <p className="text-white text-sm font-medium drop-shadow-lg">
                      Executive Focus
                    </p>
                    <p className="text-amber-100 text-xs drop-shadow-lg">
                      Never miss what matters
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Text Box - Smart Reminders */}
              <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-4 lg:p-5 border border-amber-200/50 text-center lg:text-left shadow-lg">
                <div className="flex items-center justify-center lg:justify-start mb-2 lg:mb-3">
                  <IconBell className="h-5 w-5 lg:h-6 lg:w-6 text-amber-600 mr-2" />
                  <h3 className="text-lg lg:text-xl font-bold text-card-foreground">
                    Smart Reminders
                  </h3>
                </div>
                <p className="text-muted-foreground text-xs lg:text-sm mb-3 lg:mb-4">
                  Proactive alerts for deadlines, follow-ups, and important commitments before you forget
                </p>
                <div className="bg-muted/60 rounded-lg p-2 lg:p-3 border border-border">
                  <p className="text-xs text-amber-700 font-medium mb-1">
                    Priority Alerts
                  </p>
                  <div className="space-y-1">
                    <p className="text-xs text-red-600">
                      🚨 Board deck due in 2 hours
                    </p>
                    <p className="text-xs text-yellow-700">
                      📧 Follow up with Series A lead
                    </p>
                    <p className="text-xs text-amber-700">
                      ✅ Customer feedback collected!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Text Box - Executive Memory */}
            <div className="flex justify-center">
              <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-4 lg:p-5 border border-amber-200/50 max-w-sm lg:max-w-md text-center shadow-lg">
                <div className="flex items-center justify-center mb-2 lg:mb-3">
                  <IconBook className="h-5 w-5 lg:h-6 lg:w-6 text-amber-600 mr-2" />
                  <h3 className="text-lg lg:text-xl font-bold text-card-foreground">
                    Executive Memory
                  </h3>
                </div>
                <p className="text-muted-foreground text-xs lg:text-sm mb-3 lg:mb-4">
                  Remembers every conversation, commitment, and decision across all your interactions
                </p>
                <div className="bg-muted/60 rounded-lg p-2 lg:p-3 border border-border">
                  <p className="text-xs text-amber-700 font-medium mb-1">
                    Perfect Recall
                  </p>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p>
                      "Acme wants metrics" → Q3 revenue, user growth, churn rates ready
                    </p>
                    <p>"Sarah prefers Zoom" → Auto-suggests video calls for future meetings</p>
                    <p>
                      "No Friday meetings" → Blocks calendar, suggests alternatives
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Memory capabilities section */}
      <section
        id="memory"
        className="min-h-screen bg-gradient-to-b from-muted/50 to-background flex items-center scroll-section"
      >
        <div className="container px-4 sm:px-6 py-12">
          <div className="text-center mb-8 lg:mb-12">
            <h2 className="font-bold tracking-tight mb-4 lg:mb-6">
              <span className="text-amber-600 block text-lg sm:text-xl lg:text-3xl font-normal mb-2">
                The Discipline of Memory
              </span>
              <span className="block text-lg text-foreground italic">
                That Never Forgets Your Business
              </span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-xl mx-auto">
              Every conversation, every commitment, every detail that builds your company.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start max-w-6xl mx-auto mb-8 lg:mb-12">
            <div>
              <div className="space-y-4 lg:space-y-6">
                <div className="bg-card/90 backdrop-blur-sm p-4 lg:p-6 rounded-xl border border-amber-200/50 shadow-lg">
                  <h3 className="text-lg lg:text-xl font-semibold mb-2 lg:mb-3 flex items-center">
                    <span className="h-7 w-7 lg:h-8 lg:w-8 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                      <IconEye className="h-3 w-3 lg:h-4 lg:w-4 text-amber-600" />
                    </span>
                    Contextual Awareness
                  </h3>
                  <p className="text-muted-foreground mb-3 lg:mb-4 text-sm lg:text-base">
                    Mnemo maintains the threads of your ongoing business conversations, 
                    so every interaction builds seamlessly on the last.
                  </p>
                  <div className="bg-muted/60 p-3 lg:p-4 rounded-lg border border-border">
                    <p className="text-sm italic text-muted-foreground">
                      "Send the deck to the Acme team" → Mnemo knows which pitch deck version 
                      you discussed in yesterday's strategy meeting, no clarification needed.
                    </p>
                  </div>
                </div>

                <div className="bg-card/90 backdrop-blur-sm p-4 lg:p-6 rounded-xl border border-amber-200/50 shadow-lg">
                  <h3 className="text-lg lg:text-xl font-semibold mb-2 lg:mb-3 flex items-center">
                    <span className="h-7 w-7 lg:h-8 lg:w-8 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                      <IconBook className="h-3 w-3 lg:h-4 lg:w-4 text-amber-600" />
                    </span>
                    Business Intelligence
                  </h3>
                  <p className="text-muted-foreground mb-3 lg:mb-4 text-sm lg:text-base">
                    Mnemo remembers investor preferences, team dynamics, customer needs, 
                    and strategic decisions across your entire founding journey.
                  </p>
                  <div className="bg-muted/60 p-3 lg:p-4 rounded-lg border border-border">
                    <p className="text-sm italic text-muted-foreground">
                      When you mention "Series A," Mnemo recalls Sarah at Andreessen prefers 
                      detailed unit economics, while Tom at Sequoia focuses on market size first.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card/90 backdrop-blur-sm rounded-xl border border-amber-200/50 shadow-lg overflow-hidden">
              <div className="p-3 lg:p-4 bg-amber-500 flex items-center">
                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-white/20 mr-3 flex items-center justify-center">
                  <IconBrandWhatsapp className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
                </div>
                <div className="text-white">
                  <div className="font-medium text-sm lg:text-base">
                    Executive Assistant
                  </div>
                  <div className="text-xs opacity-80">
                    Your business memory in action
                  </div>
                </div>
              </div>

              <div className="p-3 lg:p-4 space-y-3 lg:space-y-4 bg-muted/80 max-h-96 overflow-y-auto">
                {/* Day 1 conversation */}
                <div className="border-b border-border pb-3 lg:pb-4">
                  <div className="text-xs text-muted-foreground mb-2">
                    March 15 - Strategic Planning
                  </div>

                  <div className="flex items-start gap-2 justify-end ml-auto max-w-[80%]">
                    <div className="bg-amber-500 rounded-lg p-2 lg:p-3 text-xs lg:text-sm text-white">
                      <p>
                        Reminder: Sarah from Benchmark prefers seeing unit economics 
                        before market size. Make sure that's first in our deck.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 max-w-[80%] mt-2">
                    <div className="bg-background rounded-lg p-2 lg:p-3 text-xs lg:text-sm border border-border">
                      <p className="text-foreground">
                        Noted and remembered. This preference will guide all future 
                        interactions and materials prepared for Sarah.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Day 2 conversation - weeks later */}
                <div>
                  <div className="text-xs text-muted-foreground mb-2">
                    April 2 - Investor Prep (3 weeks later)
                  </div>

                  <div className="flex items-start gap-2 justify-end ml-auto max-w-[80%]">
                    <div className="bg-amber-500 rounded-lg p-2 lg:p-3 text-xs lg:text-sm text-white">
                      <p>
                        Prep materials for tomorrow's Benchmark meeting. 
                        Sarah's attending.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 max-w-[80%] mt-2">
                    <div className="bg-background rounded-lg p-2 lg:p-3 text-xs lg:text-sm border border-border">
                      <p className="text-foreground">
                        Perfect. I've prioritized unit economics data upfront for Sarah, 
                        as she prefers seeing financial metrics before market analysis. 
                        Deck restructured accordingly.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 justify-end ml-auto max-w-[80%] mt-2">
                    <div className="bg-amber-500 rounded-lg p-2 lg:p-3 text-xs lg:text-sm text-white">
                      <p>
                        Incredible. This is exactly the kind of detail that 
                        makes or breaks investor meetings.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-base lg:text-lg text-muted-foreground mb-4 lg:mb-6 max-w-xl mx-auto">
              <span className="font-semibold text-amber-700">
                Wisdom in action.
              </span>{" "}
              Your executive assistant awaits.
            </p>
            <LoginModal>
              <Button className="rounded-full bg-amber-500 hover:bg-amber-600 text-base lg:text-lg px-6 lg:px-8 py-4 lg:py-6 shadow-lg">
                Get Your AI Assistant
                <IconArrowRight className="ml-2 h-4 w-4 lg:h-5 lg:w-5" />
              </Button>
            </LoginModal>
          </div>
        </div>
      </section>
    </div>
  );
}
