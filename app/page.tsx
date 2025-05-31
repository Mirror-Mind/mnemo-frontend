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
        <div className="absolute inset-0 bg-gradient-to-br from-stone-100/50 to-slate-100/30" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,_rgba(120,119,198,0.1),_transparent),radial-gradient(circle_at_80%_20%,_rgba(255,206,84,0.15),_transparent)]" />
        <div className="absolute inset-0 opacity-20">
          <div
            className="h-full w-full bg-gradient-to-br from-stone-200/20 to-slate-200/10"
            style={{
              backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(0,0,0,0.02) 5px, rgba(0,0,0,0.02) 10px)`,
            }}
          />
        </div>

        <div className="container relative py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
            <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left flex flex-col justify-center">
              {/* Badge */}
              <div className="inline-flex items-center px-4 py-2 bg-amber-50 rounded-full border border-amber-200/50 w-fit mx-auto lg:mx-0 shadow-sm">
                <IconEye className="h-3 w-3 text-amber-600 mr-2" />
                <span className="text-xs sm:text-sm font-medium text-amber-700">
                  The executive assistant every founder needs
                </span>
              </div>

              {/* Main headline */}
              <div className="space-y-4 sm:space-y-6">
                <div className="space-y-3">
                  <p className="text-xl sm:text-3xl lg:text-4xl text-amber-600 font-semibold leading-tight">
                    Mnemo: Your AI Executive Assistant
                  </p>
                  <p className="text-md italic text-slate-700 font-medium">
                    Lives in Your WhatsApp. Never Misses a Beat. ⚡
                  </p>
                  <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0">
                    From VC pitch prep to daily briefings, stay ahead of every meeting, deadline, and opportunity.
                  </p>
                </div>
              </div>

              {/* Key benefits - founder focused */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6">
                <div className="text-center border border-slate-300 rounded-md p-2">
                  <div className="text-2xl sm:text-3xl font-bold text-amber-600 mb-1">
                    📊
                  </div>
                  <div className="text-xs sm:text-sm text-slate-600">
                    Meeting Prep
                  </div>
                </div>

                <div className="text-center border border-slate-300 rounded-md p-2">
                  <div className="text-2xl sm:text-3xl font-bold text-amber-500 mb-1">
                    🗓️
                  </div>
                  <div className="text-xs sm:text-sm text-slate-600">
                    Daily Briefings
                  </div>
                </div>
                <div className="text-center border border-slate-300 rounded-md p-2">
                  <div className="text-2xl sm:text-3xl font-bold text-amber-500 mb-1">
                    💡
                  </div>
                  <div className="text-xs sm:text-sm text-slate-600">
                    Smart Reminders
                  </div>
                </div>
                <div className="text-center border border-slate-300 rounded-md p-2">
                  <div className="text-2xl sm:text-3xl font-bold text-amber-600 mb-1">
                    📱
                  </div>
                  <div className="text-xs sm:text-sm text-slate-600">
                    Just WhatsApp
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <LoginModal>
                  <Button
                    size="lg"
                    className="h-12 px-6 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <IconBrandWhatsapp className="mr-2 h-4 w-4" />
                    Get Your AI Assistant
                  </Button>
                </LoginModal>
                <a href="#features" className="inline-block">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 px-6 rounded-xl border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-semibold text-sm transition-all duration-300"
                  >
                    <IconMessage className="mr-2 h-4 w-4" />
                    See How It Works
                  </Button>
                </a>
              </div>
            </div>

            {/* Right side - Enhanced Use Cases Carousel */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end items-center">
              <div className="w-full max-w-xs sm:max-w-sm mt-8 lg:mt-0">
                <HeroCarousel />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Founder-focused Features Section */}
      <section
        id="features"
        className="min-h-screen bg-gradient-to-b from-white to-stone-50 flex items-center scroll-section"
      >
        <div className="container px-4 sm:px-6 py-4">
          <div className="text-center mb-8 lg:mb-4">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-800">
              <span className="text-amber-600 block text-lg sm:text-xl lg:text-2xl font-normal">
                Executive Excellence
              </span>
            </h2>
            <p className="text-base sm:text-lg lg:text-lg text-slate-600 max-w-2xl mx-auto">
              The discipline of Stoic leaders, now automated for modern founders.
            </p>
          </div>

          <div className="max-w-5xl mx-auto relative">
            {/* Top Text Box - Daily Briefings */}
            <div className="flex justify-center mb-6 lg:mb-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 lg:p-5 border border-amber-200/50 max-w-sm lg:max-w-md text-center shadow-lg">
                <div className="flex items-center justify-center mb-2 lg:mb-3">
                  <IconSunHigh className="h-5 w-5 lg:h-6 lg:w-6 text-amber-600 mr-2" />
                  <h3 className="text-lg lg:text-xl font-bold text-slate-800">
                    Daily Briefings
                  </h3>
                </div>
                <p className="text-slate-600 text-xs lg:text-sm mb-3 lg:mb-4">
                  Start each day with AI-powered insights about your meetings, deadlines, and priorities
                </p>
                <div className="bg-stone-100/60 rounded-lg p-2 lg:p-3 border border-stone-200/50">
                  <p className="text-xs text-amber-700 font-medium mb-1">
                    Today's Focus
                  </p>
                  <p className="text-xs text-slate-600">
                    📊 VC pitch at 2pm • 🤝 Product demo with enterprise client • ⚡ Board deck deadline tomorrow
                  </p>
                </div>
              </div>
            </div>

            {/* Middle Row - Left, Center Image, Right */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-center mb-6 lg:mb-8">
              {/* Left Text Box - Meeting Prep */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 lg:p-5 border border-amber-200/50 text-center lg:text-right shadow-lg">
                <div className="flex items-center justify-center lg:justify-end mb-2 lg:mb-3">
                  <h3 className="text-lg lg:text-xl font-bold text-slate-800 mr-2">
                    Meeting Prep
                  </h3>
                  <IconBolt className="h-5 w-5 lg:h-6 lg:w-6 text-amber-600" />
                </div>
                <p className="text-slate-600 text-xs lg:text-sm mb-3 lg:mb-4">
                  Automatically prepares you for every meeting with context, background, and talking points
                </p>
                <div className="bg-stone-100/60 rounded-lg p-2 lg:p-3 border border-stone-200/50">
                  <p className="text-xs text-amber-700 font-medium mb-1">
                    Smart Prep
                  </p>
                  <p className="text-xs text-slate-600">
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
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 lg:p-5 border border-amber-200/50 text-center lg:text-left shadow-lg">
                <div className="flex items-center justify-center lg:justify-start mb-2 lg:mb-3">
                  <IconBell className="h-5 w-5 lg:h-6 lg:w-6 text-amber-600 mr-2" />
                  <h3 className="text-lg lg:text-xl font-bold text-slate-800">
                    Smart Reminders
                  </h3>
                </div>
                <p className="text-slate-600 text-xs lg:text-sm mb-3 lg:mb-4">
                  Proactive alerts for deadlines, follow-ups, and important commitments before you forget
                </p>
                <div className="bg-stone-100/60 rounded-lg p-2 lg:p-3 border border-stone-200/50">
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
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 lg:p-5 border border-amber-200/50 max-w-sm lg:max-w-md text-center shadow-lg">
                <div className="flex items-center justify-center mb-2 lg:mb-3">
                  <IconBook className="h-5 w-5 lg:h-6 lg:w-6 text-amber-600 mr-2" />
                  <h3 className="text-lg lg:text-xl font-bold text-slate-800">
                    Executive Memory
                  </h3>
                </div>
                <p className="text-slate-600 text-xs lg:text-sm mb-3 lg:mb-4">
                  Remembers every conversation, commitment, and decision across all your interactions
                </p>
                <div className="bg-stone-100/60 rounded-lg p-2 lg:p-3 border border-stone-200/50">
                  <p className="text-xs text-amber-700 font-medium mb-1">
                    Perfect Recall
                  </p>
                  <div className="space-y-1 text-xs text-slate-600">
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
        className="min-h-screen bg-gradient-to-b from-stone-50 to-white flex items-center scroll-section"
      >
        <div className="container px-4 sm:px-6 py-12">
          <div className="text-center mb-8 lg:mb-12">
            <h2 className="font-bold tracking-tight mb-4 lg:mb-6">
              <span className="text-amber-600 block text-lg sm:text-xl lg:text-3xl font-normal mb-2">
                The Discipline of Memory
              </span>
              <span className="block text-lg text-slate-800 italic">
                That Never Forgets Your Business
              </span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-slate-600 max-w-xl mx-auto">
              Every conversation, every commitment, every detail that builds your company.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start max-w-6xl mx-auto mb-8 lg:mb-12">
            <div>
              <div className="space-y-4 lg:space-y-6">
                <div className="bg-white/90 backdrop-blur-sm p-4 lg:p-6 rounded-xl border border-amber-200/50 shadow-lg">
                  <h3 className="text-lg lg:text-xl font-semibold mb-2 lg:mb-3 flex items-center">
                    <span className="h-7 w-7 lg:h-8 lg:w-8 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                      <IconEye className="h-3 w-3 lg:h-4 lg:w-4 text-amber-600" />
                    </span>
                    Contextual Awareness
                  </h3>
                  <p className="text-slate-600 mb-3 lg:mb-4 text-sm lg:text-base">
                    Mnemo maintains the threads of your ongoing business conversations, 
                    so every interaction builds seamlessly on the last.
                  </p>
                  <div className="bg-stone-100/60 p-3 lg:p-4 rounded-lg border border-stone-200/50">
                    <p className="text-sm italic text-slate-700">
                      "Send the deck to the Acme team" → Mnemo knows which pitch deck version 
                      you discussed in yesterday's strategy meeting, no clarification needed.
                    </p>
                  </div>
                </div>

                <div className="bg-white/90 backdrop-blur-sm p-4 lg:p-6 rounded-xl border border-amber-200/50 shadow-lg">
                  <h3 className="text-lg lg:text-xl font-semibold mb-2 lg:mb-3 flex items-center">
                    <span className="h-7 w-7 lg:h-8 lg:w-8 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                      <IconBook className="h-3 w-3 lg:h-4 lg:w-4 text-amber-600" />
                    </span>
                    Business Intelligence
                  </h3>
                  <p className="text-slate-600 mb-3 lg:mb-4 text-sm lg:text-base">
                    Mnemo remembers investor preferences, team dynamics, customer needs, 
                    and strategic decisions across your entire founding journey.
                  </p>
                  <div className="bg-stone-100/60 p-3 lg:p-4 rounded-lg border border-stone-200/50">
                    <p className="text-sm italic text-slate-700">
                      When you mention "Series A," Mnemo recalls Sarah at Andreessen prefers 
                      detailed unit economics, while Tom at Sequoia focuses on market size first.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-amber-200/50 shadow-lg overflow-hidden">
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

              <div className="p-3 lg:p-4 space-y-3 lg:space-y-4 bg-stone-50/80 max-h-96 overflow-y-auto">
                {/* Day 1 conversation */}
                <div className="border-b border-stone-200 pb-3 lg:pb-4">
                  <div className="text-xs text-slate-500 mb-2">
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
                    <div className="bg-white rounded-lg p-2 lg:p-3 text-xs lg:text-sm border border-stone-200">
                      <p className="text-slate-700">
                        Noted and remembered. This preference will guide all future 
                        interactions and materials prepared for Sarah.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Day 2 conversation - weeks later */}
                <div>
                  <div className="text-xs text-slate-500 mb-2">
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
                    <div className="bg-white rounded-lg p-2 lg:p-3 text-xs lg:text-sm border border-stone-200">
                      <p className="text-slate-700">
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
            <p className="text-base lg:text-lg text-slate-600 mb-4 lg:mb-6 max-w-xl mx-auto">
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
