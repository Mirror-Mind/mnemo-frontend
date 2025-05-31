import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  IconArrowRight,
  IconBrandGithub,
  IconBrandGoogle,
  IconBrandWhatsapp,
  IconCalendar,
  IconChevronRight,
  IconFiles,
  IconLockSquareRoundedFilled,
  IconBrandTeams,
  IconMessage,
  IconRobot,
  IconSearch,
  IconShieldCheckFilled,
  IconSparkles,
  IconBrandSlack,
  IconCheck,
  IconSunHigh,
  IconBell,
  IconHeadphones,
  IconBolt,
  IconBrain,
  IconMail,
  IconMenu2,
  IconX,
} from "@tabler/icons-react";
import { WaitlistModal } from "@/components/waitlist-modal";
import { HeroCarousel } from "@/components/hero-carousel";

export default async function page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b sticky top-0 bg-background/80 backdrop-blur-md z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center">
            <span className="font-bold text-xl">
              <span className="text-primary animate-pulse">Orbia</span>
            </span>
          </div>
          <nav className="flex items-center gap-4">
            <div className="hidden md:flex space-x-6">
              <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
              <Link href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
                How It Works
              </Link>
              <Link href="#integrations" className="text-muted-foreground hover:text-foreground transition-colors">
                Integrations
              </Link>
            </div>
            <div className="flex items-center gap-2">
              {session?.user ? (
                <Link href="/dashboard">
                  <Button>
                    Dashboard
                    <IconArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <WaitlistModal>
                  <Button size="sm" className="bg-green-500 hover:bg-green-600 text-xs sm:text-sm px-3 sm:px-4">
                    <span className="hidden sm:inline">Join Waitlist</span>
                    <span className="sm:hidden">Join</span>
                  </Button>
                </WaitlistModal>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* Enhanced Hero section */}
      <section className="bg-slate-900 relative overflow-hidden min-h-[85vh] sm:min-h-[90vh] lg:min-h-screen flex items-center">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/5" />
        <div className="absolute inset-0 bg-grid-small-white/[0.02]" />
        
        <div className="container relative py-8 sm:py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
            
            {/* Left side - Main content */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left flex flex-col justify-center">
              
              {/* Badge */}
              <div className="inline-flex items-center px-3 py-1.5 bg-green-500/10 rounded-full border border-green-500/20 w-fit mx-auto lg:mx-0">
                <IconSparkles className="h-3 w-3 text-green-400 mr-2" />
                <span className="text-xs sm:text-sm font-medium text-green-400">The AI assistant that nudges you first</span>
              </div>
              
              {/* Main headline */}
              <div className="space-y-4 sm:space-y-6">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-white leading-tight">
                  Your Proactive
                  <span className="text-green-400 block sm:inline lg:block"> WhatsApp Assistant</span>
                </h1>
                
                <p className="text-base sm:text-lg lg:text-xl text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  Unlike regular chatbots, <span className="font-semibold text-white">Orbia nudges you first</span> — 
                  morning reviews, automatic scheduling, smart reminders, and your daily podcast summary.
                </p>
              </div>

              {/* Key differentiators */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 py-4">
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start mb-2">
                    <IconBell className="h-4 w-4 text-green-400 mr-2" />
                    <span className="text-white font-semibold text-sm">Proactive Nudging</span>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">Reaches out first with daily reviews and reminders</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start mb-2">
                    <IconHeadphones className="h-4 w-4 text-blue-400 mr-2" />
                    <span className="text-white font-semibold text-sm">Morning Podcast</span>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">Daily schedule as personalized audio briefing</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start mb-2">
                    <IconBolt className="h-4 w-4 text-yellow-400 mr-2" />
                    <span className="text-white font-semibold text-sm">Auto-Scheduling</span>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">Schedules meetings from emails automatically</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start mb-2">
                    <IconBrain className="h-4 w-4 text-purple-400 mr-2" />
                    <span className="text-white font-semibold text-sm">Infinite Memory</span>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">Remembers preferences and details forever</p>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <WaitlistModal>
                  <Button size="lg" className="h-12 px-6 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-300">
                    <IconBrandWhatsapp className="mr-2 h-4 w-4" />
                    Join Waitlist
                  </Button>
                </WaitlistModal>
                <Link href="#how-it-works">
                  <Button size="lg" variant="outline" className="h-12 px-6 rounded-xl border-2 border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white font-semibold text-sm transition-all duration-300">
                    <IconMessage className="mr-2 h-4 w-4" />
                    See How It Works
                  </Button>
                </Link>
              </div>

              {/* Social proof */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-2 sm:gap-4 text-xs sm:text-sm text-slate-400">
                  <div className="flex items-center space-x-1">
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <IconSparkles key={i} className="h-3 w-3 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <span className="font-medium">Early Access</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <IconShieldCheckFilled className="h-3 w-3 text-green-400" />
                    <span className="whitespace-nowrap">End-to-end encrypted</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <IconBrandWhatsapp className="h-3 w-3 text-green-400" />
                    <span className="whitespace-nowrap">No new apps needed</span>
                  </div>
                </div>
                
                {/* Trusted by text */}
                <p className="text-xs sm:text-sm text-slate-400 text-center lg:text-left">
                  Integrates with Google, Microsoft, GitHub & more
                </p>
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

      {/* Proactive Features Section - NEW */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="container px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white mb-4">
              Your Assistant Works <span className="text-green-400">While You Sleep</span>
            </h2>
            <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto px-4">
              Orbia doesn't wait for you to ask. It proactively manages your day, sends you briefings, 
              and handles tasks automatically so you're always ahead.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-start max-w-6xl mx-auto">
            {/* Morning Review Demo */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/10 rounded-2xl p-8 border border-green-500/20">
                <div className="flex items-center mb-4">
                  <IconSunHigh className="h-8 w-8 text-green-400 mr-3" />
                  <h3 className="text-2xl font-bold text-white">Morning Review</h3>
                </div>
                <p className="text-slate-300 mb-6">
                  Every morning, get a comprehensive briefing of your day — as text or a personalized podcast.
                </p>
                
                {/* Sample morning review */}
                <div className="bg-slate-800/50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center text-green-400 text-sm font-medium">
                    <IconHeadphones className="h-4 w-4 mr-2" />
                    Today's Briefing - March 15, 2024
                  </div>
                  <div className="space-y-2 text-sm text-slate-300">
                    <p>🌅 Good morning! You have 4 meetings today, including the important client call at 2 PM.</p>
                    <p>📧 3 urgent emails require your attention, including the budget approval from Sarah.</p>
                    <p>🎯 Your deadline for the marketing proposal is tomorrow - I'll remind you at 3 PM to review it.</p>
                    <p>☂️ It's raining today, so I've moved your 5 PM outdoor meeting to the conference room.</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/10 rounded-2xl p-8 border border-blue-500/20">
                <div className="flex items-center mb-4">
                  <IconBolt className="h-8 w-8 text-blue-400 mr-3" />
                  <h3 className="text-2xl font-bold text-white">Smart Auto-Scheduling</h3>
                </div>
                <p className="text-slate-300 mb-6">
                  Orbia reads your emails and automatically schedules meetings, avoiding conflicts and optimizing your calendar.
                </p>
                
                <div className="bg-slate-800/50 rounded-xl p-4 space-y-3">
                  <div className="text-blue-400 text-sm font-medium">
                    Email → Calendar Magic
                  </div>
                  <div className="space-y-2 text-sm text-slate-300">
                    <p>📧 "Let's schedule our quarterly review next week" → 🗓️ Automatically proposes 3 optimal time slots</p>
                    <p>📧 "Can we meet to discuss the project?" → 🗓️ Finds mutual free time and sends calendar invite</p>
                    <p>📧 "Reschedule tomorrow's meeting" → 🗓️ Automatically moves to next available slot</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Reminders Demo */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/10 rounded-2xl p-8 border border-purple-500/20">
                <div className="flex items-center mb-4">
                  <IconBell className="h-8 w-8 text-purple-400 mr-3" />
                  <h3 className="text-2xl font-bold text-white">Dynamic Email Nudges</h3>
                </div>
                <p className="text-slate-300 mb-6">
                  Get contextual reminders based on your emails and deadlines, not just static calendar events.
                </p>
                
                <div className="bg-slate-800/50 rounded-xl p-4 space-y-3">
                  <div className="text-purple-400 text-sm font-medium">
                    Intelligent Reminders
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                      <p className="text-red-400 font-medium">⚠️ Urgent: Budget approval needed</p>
                      <p className="text-slate-300">Sarah's waiting for your response (deadline today 5 PM)</p>
                    </div>
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                      <p className="text-yellow-400 font-medium">📋 Follow up reminder</p>
                      <p className="text-slate-300">Send project update to client (you mentioned this yesterday)</p>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                      <p className="text-green-400 font-medium">🎉 Achievement unlocked</p>
                      <p className="text-slate-300">All quarterly reports submitted on time!</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-500/20 to-red-500/10 rounded-2xl p-8 border border-orange-500/20">
                <div className="flex items-center mb-4">
                  <IconBrain className="h-8 w-8 text-orange-400 mr-3" />
                  <h3 className="text-2xl font-bold text-white">Infinite Memory</h3>
                </div>
                <p className="text-slate-300 mb-6">
                  Your assistant remembers everything - from your coffee preferences to complex project details.
                </p>
                
                <div className="bg-slate-800/50 rounded-xl p-4 space-y-2 text-sm text-slate-300">
                  <p>"Order my usual from Starbucks" → Remembers: Oat milk latte, no sugar, extra shot</p>
                  <p>"Schedule with the design team" → Knows: Prefers mornings, needs conference room with projector</p>
                  <p>"Book restaurant for anniversary" → Recalls: Wife's dietary restrictions, favorite cuisine, special occasions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works section */}
      <section id="how-it-works" className="py-12 sm:py-16 lg:py-20 bg-muted/50">
        <div className="container px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-4">Getting Started with Orbia</h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              Connect your digital life to WhatsApp in a few simple steps.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="bg-card p-8 rounded-xl border shadow-sm hover:shadow-md transition-all text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Sign Up & Connect WhatsApp</h3>
              <p className="text-muted-foreground">
                Create your Orbia account and securely link your WhatsApp number to our platform.
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="bg-card p-8 rounded-xl border shadow-sm hover:shadow-md transition-all text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Link Your Services</h3>
              <p className="text-muted-foreground">
                Safely connect your Google (Gmail, Calendar, Drive), Microsoft, GitHub, and other accounts.
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="bg-card p-8 rounded-xl border shadow-sm hover:shadow-md transition-all text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Let Orbia Take Over</h3>
              <p className="text-muted-foreground">
                Your assistant starts working immediately - morning briefings, smart reminders, and automatic scheduling.
              </p>
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <WaitlistModal>
              <Button className="rounded-full bg-green-500 hover:bg-green-600">
                Join Waitlist & Get Your AI Assistant
                <IconArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </WaitlistModal>
          </div>
        </div>
      </section>

      {/* Streamlined Features section */}
      <section id="features" className="py-12 sm:py-16 lg:py-20">
        <div className="container px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-4">Beyond Traditional Chatbots</h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto px-4">
              Orbia isn't just another AI assistant — it's a proactive productivity companion that works behind the scenes.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[ 
              {
                icon: <IconMail className="h-6 w-6 text-green-500" />,
                title: "Email Intelligence",
                description: "Orbia reads your emails and automatically creates tasks, schedules meetings, and sends reminders.",
                points: [
                  "Auto-extracts action items from emails",
                  "Schedules meetings mentioned in emails",
                  "Tracks email follow-ups and deadlines"
                ]
              },
              {
                icon: <IconCalendar className="h-6 w-6 text-green-500" />,
                title: "Smart Calendar Management",
                description: "Beyond basic scheduling - intelligent conflict resolution and context-aware planning.",
                points: [
                  "Automatically avoids scheduling conflicts",
                  "Suggests optimal meeting times",
                  "Considers your energy levels and preferences"
                ]
              },
              {
                icon: <IconFiles className="h-6 w-6 text-green-500" />,
                title: "Instant Document Access",
                description: "Find any file instantly across all your connected services with natural language.",
                points: [
                  "Search across Google Drive, OneDrive, GitHub",
                  "Find files by content, not just name",
                  "Share files directly through WhatsApp"
                ]
              },
              {
                icon: <IconBrandGithub className="h-6 w-6 text-green-500" />,
                title: "Developer Workflow",
                description: "Stay on top of your code with intelligent GitHub integration and notifications.",
                points: [
                  "Get PR status updates and review requests",
                  "Track issue progress and deadlines",
                  "Monitor repository activity and releases"
                ]
              },
              {
                icon: <IconSearch className="h-6 w-6 text-green-500" />,
                title: "Cross-App Search",
                description: "Search your entire digital life from one place - emails, files, calendar, and more.",
                points: [
                  "Unified search across all connected services",
                  "Contextual results based on your current needs",
                  "Find information without remembering where it's stored"
                ]
              },
              {
                icon: <IconLockSquareRoundedFilled className="h-6 w-6 text-green-500" />,
                title: "Privacy & Security",
                description: "Enterprise-grade security with granular control over your data and permissions.",
                points: [
                  "End-to-end encrypted communication",
                  "OAuth-only authentication (no passwords stored)",
                  "Granular permission controls"
                ]
              }
            ].map(feature => (
              <div key={feature.title} className="bg-card p-6 rounded-xl border shadow-sm hover:shadow-md transition-all">
                <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-5">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground mb-4 text-sm">
                  {feature.description}
                </p>
                <ul className="space-y-2 mb-4">
                  {feature.points.map(point => (
                    <li key={point} className="flex items-start">
                      <IconChevronRight className="h-4 w-4 text-green-500 mt-1 flex-shrink-0 mr-2" />
                      <span className="text-sm text-muted-foreground">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Memory capabilities section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white dark:bg-slate-900">
        <div className="container px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-4">A Personal Assistant That Actually Remembers</h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              Orbia stores and learns from your conversations, creating a truly personal experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-start max-w-6xl mx-auto">
            <div>
              <div className="space-y-6">
                <div className="bg-card p-6 rounded-xl border shadow-sm">
                  <h3 className="text-xl font-semibold mb-3 flex items-center">
                    <span className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center mr-3">
                      <IconSparkles className="h-4 w-4 text-green-500" />
                    </span>
                    Short-Term Memory
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Orbia remembers context within conversations, so you don't have to repeat yourself during the same chat.
                  </p>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm italic">
                      "Send that document to Sarah" → Orbia remembers which document you were just discussing without you having to specify again.
                    </p>
                  </div>
                </div>
                
                <div className="bg-card p-6 rounded-xl border shadow-sm">
                  <h3 className="text-xl font-semibold mb-3 flex items-center">
                    <span className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center mr-3">
                      <IconSparkles className="h-4 w-4 text-green-500" />
                    </span>
                    Long-Term Memory
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Orbia remembers important details about you over time - your preferences, allergies, work schedule, and more.
                  </p>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm italic">
                      If you once mentioned having a milk allergy, Orbia will automatically suggest almond milk in your Starbucks order weeks later.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-xl border shadow-md overflow-hidden">
              <div className="p-4 bg-green-500 flex items-center">
                <div className="w-10 h-10 rounded-full bg-white/20 mr-3 flex items-center justify-center">
                  <IconBrandWhatsapp className="h-5 w-5 text-white" />
                </div>
                <div className="text-white">
                  <div className="font-medium">Memory in Action</div>
                  <div className="text-xs opacity-80">See how it helps in real life</div>
                </div>
              </div>
              
              <div className="p-4 space-y-4 bg-slate-50 dark:bg-slate-900">
                {/* Day 1 conversation */}
                <div className="border-b pb-4">
                  <div className="text-xs text-muted-foreground mb-2">March 15</div>
                  
                  <div className="flex items-start gap-2 justify-end ml-auto max-w-[80%]">
                    <div className="bg-green-500 rounded-lg p-3 text-sm text-white">
                      <p>Just a heads up, I have a milk allergy. Need to be careful with dairy.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2 max-w-[80%] mt-2">
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-3 text-sm">
                      <p>Thanks for letting me know about your milk allergy. I'll remember that for future reference.</p>
                    </div>
                  </div>
                </div>
                
                {/* Day 2 conversation - weeks later */}
                <div>
                  <div className="text-xs text-muted-foreground mb-2">April 2 (Weeks Later)</div>
                  
                  <div className="flex items-start gap-2 justify-end ml-auto max-w-[80%]">
                    <div className="bg-green-500 rounded-lg p-3 text-sm text-white">
                      <p>What should I order at Starbucks today? I'm thinking of trying a Java Chip Frappuccino.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2 max-w-[80%] mt-2">
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-3 text-sm">
                      <p>For a Java Chip Frappuccino, I'd recommend asking for it with almond milk and no whipped cream since you have a milk allergy. This way you can enjoy it safely!</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2 justify-end ml-auto max-w-[80%] mt-2">
                    <div className="bg-green-500 rounded-lg p-3 text-sm text-white">
                      <p>Wow, you remembered my allergy! Thanks for looking out for me.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Unlike other assistants that forget your information, Orbia builds a secure personal knowledge base that makes every interaction smarter and more helpful.
            </p>
            <WaitlistModal>
              <Button className="rounded-full bg-green-500 hover:bg-green-600">
                Join Waitlist
                <IconArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </WaitlistModal>
          </div>
        </div>
      </section>

      {/* Integrations section */}
      <section id="integrations" className="py-12 sm:py-16 lg:py-20 bg-muted/50">
        <div className="container px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-4">Seamlessly Connect Your Digital World</h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              Orbia integrates with the services you already use, making your life simpler.
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 max-w-4xl mx-auto">
            {[ // Keep existing icons and add or update names based on README
              { name: "WhatsApp", icon: <IconBrandWhatsapp className="h-8 w-8 text-green-500" /> },
              { name: "Google Calendar", icon: <IconCalendar className="h-8 w-8 text-blue-500" /> },
              { name: "Google Drive", icon: <IconFiles className="h-8 w-8 text-yellow-500" /> },
              { name: "Gmail", icon: <IconBrandGoogle className="h-8 w-8 text-red-500" /> }, // IconBrandGoogle can represent Gmail
              { name: "GitHub", icon: <IconBrandGithub className="h-8 w-8 text-purple-500" /> },
              { name: "Microsoft Teams", icon: <IconBrandTeams className="h-8 w-8 text-sky-500" /> }, // Example, can use a generic MS icon or Files
              { name: "Slack", icon: <IconBrandSlack className="h-8 w-8 text-pink-500" /> },
              { name: "And many more...", icon: <IconSparkles className="h-8 w-8 text-gray-500" /> }
            ].map((integration, idx) => (
              <div key={idx} className="flex flex-col items-center justify-center p-4 sm:p-6 rounded-xl border bg-card hover:shadow-md transition-all">
                <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-muted flex items-center justify-center mb-2 sm:mb-3 text-primary">
                  {integration.icon}
                </div>
                <span className="text-xs sm:text-sm font-medium text-center text-muted-foreground">{integration.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WhatsApp Chat Demo */}
      <section className="py-12 sm:py-16 lg:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-small-black/[0.05] dark:bg-grid-small-white/[0.05] -z-10" />
        <div className="container relative px-4 sm:px-6">
          <div className="absolute top-40 right-0 h-80 w-80 rounded-full bg-green-500/10 blur-3xl -z-10" />
          
          <div className="flex flex-col lg:flex-row gap-8 sm:gap-12 items-center">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center justify-center p-2 bg-background rounded-full mb-4">
                <IconBrandWhatsapp size={18} className="text-green-500 mr-2" />
                <span className="text-sm font-medium">WhatsApp Powered</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-6">
                Just Chat Like You Would <br className="hidden sm:block" />With a Friend
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground mb-6">
                No complicated commands to learn. Just text normally and your personal assistant understands what you need.
              </p>
              
              <ul className="space-y-4 mb-8">
                {[
                  "What meetings do I have today?",
                  "Find my marketing presentation from last week",
                  "Remind me to call Sarah at 3pm",
                  "Any updates on the GitHub project?",
                  "Schedule lunch with Mark for Friday at noon"
                ].map((example, idx) => (
                  <li key={idx} className="flex items-start">
                    <div className="mr-2 mt-1 h-5 w-5 rounded-full bg-green-500/20 flex items-center justify-center">
                      <IconChevronRight className="h-3 w-3 text-green-500" />
                    </div>
                    <span className="text-muted-foreground">{example}</span>
                  </li>
                ))}
              </ul>
              
              <WaitlistModal>
                <Button className="rounded-full bg-green-500 hover:bg-green-600">
                  Join Waitlist
                  <IconArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </WaitlistModal>
            </div>
            
            <div className="flex-1 w-full max-w-xs sm:max-w-sm lg:max-w-md">
              <div className="bg-card rounded-2xl sm:rounded-3xl border shadow-lg overflow-hidden">
                <div className="p-4 bg-green-500 flex items-center">
                  <div className="flex-1 flex items-center">
                    <div className="w-10 h-10 rounded-full bg-white/20 mr-3"></div>
                    <div>
                      <div className="font-medium text-white">Orbia Assistant</div>
                      <div className="text-xs text-white/70">Online</div>
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-4 bg-slate-50 dark:bg-slate-900">
                  {/* Bot Message */}
                  <div className="flex items-start gap-2 max-w-[80%]">
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-3 text-sm shadow-sm">
                      <p>Hello! I'm your Orbia assistant. How can I help you today?</p>
                    </div>
                  </div>
                  
                  {/* User Message */}
                  <div className="flex items-start gap-2 justify-end ml-auto max-w-[80%]">
                    <div className="bg-green-500 rounded-lg p-3 text-sm text-white shadow-sm">
                      <p>What's on my calendar for today?</p>
                    </div>
                  </div>
                  
                  {/* Bot Message with Calendar */}
                  <div className="flex items-start gap-2 max-w-[90%]">
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-3 text-sm shadow-sm">
                      <p className="mb-2">Here's your schedule for today:</p>
                      <div className="border rounded-md p-2 mb-2 bg-slate-100 dark:bg-slate-700">
                        <p className="font-medium">9:00 AM - Team Stand-up</p>
                        <p className="text-xs">Conference Room B</p>
                      </div>
                      <div className="border rounded-md p-2 mb-2 bg-slate-100 dark:bg-slate-700">
                        <p className="font-medium">12:30 PM - Lunch with Client</p>
                        <p className="text-xs">Downtown Cafe</p>
                      </div>
                      <div className="border rounded-md p-2 bg-slate-100 dark:bg-slate-700">
                        <p className="font-medium">3:00 PM - Product Review</p>
                        <p className="text-xs">Zoom Meeting</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* User Message */}
                  <div className="flex items-start gap-2 justify-end ml-auto max-w-[80%]">
                    <div className="bg-green-500 rounded-lg p-3 text-sm text-white shadow-sm">
                      <p>Can you reschedule the Product Review to tomorrow at 10am?</p>
                    </div>
                  </div>
                  
                  {/* Bot Message */}
                  <div className="flex items-start gap-2 max-w-[80%]">
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-3 text-sm shadow-sm">
                      <p>I've rescheduled the Product Review to tomorrow at 10:00 AM. All participants have been notified of the change.</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 border-t bg-slate-50 dark:bg-slate-900">
                  <div className="bg-white dark:bg-slate-800 rounded-full p-3 flex items-center shadow-sm">
                    <input type="text" className="bg-transparent flex-1 outline-none text-sm dark:text-white" placeholder="Type a message..." />
                    <Button size="sm" className="rounded-full h-8 w-8 p-0 bg-green-500 hover:bg-green-600">
                      <IconArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-muted/50">
        <div className="container px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-6">
              Ready to simplify your digital life?
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground mb-8 max-w-2xl mx-auto px-4">
              Connect your WhatsApp to your digital services and manage everything in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <WaitlistModal>
                <Button size="lg" className="rounded-full h-12 px-8 bg-green-500 hover:bg-green-600">
                  Join Waitlist
                  <IconArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </WaitlistModal>
              <Link href="#how-it-works">
                <Button variant="outline" size="lg" className="rounded-full h-12 px-8">
                  Learn More
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">No credit card required. Be first in line.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-10 border-t">
        <div className="container px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
            <div className="mb-4 md:mb-0">
              <span className="font-bold text-xl">
                <span className="text-primary animate-pulse">Orbia</span>
              </span>
              <p className="text-sm text-muted-foreground mt-2">
                Your Personal Assistant in WhatsApp
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-end gap-4 sm:gap-6">
              <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </Link>
            </div>
          </div>
          
          <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Orbia. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
