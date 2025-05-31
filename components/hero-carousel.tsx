"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  IconArrowRight,
  IconBrandGithub,
  IconBrandGoogle,
  IconCalendar,
  IconFiles,
  IconRobot,
  IconSearch,
  IconCheck,
  IconSunHigh,
  IconMail,
} from "@tabler/icons-react";

const useCases = [
  {
    id: "morning-review",
    title: "Morning Briefing",
    subtitle: "AI-powered insights about your schedule and priorities",
    placeholder: "Try: 'Good morning Mnemo'",
    icon: <IconSunHigh className="h-3.5 w-3.5 text-amber-600 mx-auto mb-0.5" />,
    content: (
      <div className="space-y-3">
        <div className="flex items-start gap-2">
          <div className="bg-white rounded-2xl rounded-tl-md p-3 max-w-[85%] shadow-sm border border-stone-200">
            <p className="text-sm text-slate-700">☀️ Good morning! Here's your daily briefing:</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <div className="bg-white rounded-2xl rounded-bl-md p-3 max-w-[90%] shadow-sm border border-stone-200">
            <p className="text-sm text-slate-800 font-semibold mb-1">Today's Schedule (3 events):</p>
            <div className="text-xs text-slate-600 space-y-1">
              <p>• 10:00 AM: Team Standup</p>
              <p>• 01:00 PM: Client Meeting</p>
              <p>• 03:30 PM: Project Review</p>
            </div>
            <p className="text-sm text-slate-800 font-semibold mt-2 mb-1">Priority Tasks (2):</p>
            <div className="text-xs text-slate-600 space-y-1">
              <p>• Follow up on Q3 report</p>
              <p>• Review PR #251</p>
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <div className="bg-amber-500 rounded-2xl rounded-tr-md p-3 max-w-[85%] text-white shadow-sm">
            <p className="text-sm text-white">Can you give me an audio version?</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: "calendar",
    title: "Smart Scheduling",
    subtitle: "AI that understands context and manages your calendar",
    placeholder: "Try: 'Schedule meeting for next week'",
    icon: <IconCalendar className="h-3.5 w-3.5 text-amber-600 mx-auto mb-0.5" />,
    content: (
      <div className="space-y-3">
        <div className="flex items-start gap-2">
          <div className="bg-white rounded-2xl rounded-tl-md p-3 max-w-[85%] shadow-sm border border-stone-200">
            <p className="text-sm text-slate-700">🗓️ How can I help with your calendar today?</p>
          </div>
        </div>
        <div className="flex justify-end">
          <div className="bg-amber-500 rounded-2xl rounded-tr-md p-3 max-w-[85%] text-white shadow-sm">
            <p className="text-sm text-white">Schedule a 'Project Kickoff' for tomorrow at 11am with the design team.</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <div className="bg-white rounded-2xl rounded-tl-md p-3 max-w-[90%] shadow-sm border border-stone-200">
            <div className="flex items-start space-x-2">
              <IconCheck className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-slate-700 mb-2">Done! 'Project Kickoff' is scheduled with the design team for tomorrow at 11 AM.</p>
                <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
                  <p className="text-sm font-semibold text-slate-900">Project Kickoff</p>
                  <p className="text-xs text-slate-600">Tomorrow • 11:00 AM - 12:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: "files",
    title: "Document Access",
    subtitle: "Find and share your files instantly with AI memory",
    placeholder: "Try: 'Find marketing plan Q3'",
    icon: <IconFiles className="h-3.5 w-3.5 text-amber-600 mx-auto mb-0.5" />,
    content: (
      <div className="space-y-3">
        <div className="flex items-start gap-2">
          <div className="bg-white rounded-2xl rounded-tl-md p-3 max-w-[85%] shadow-sm border border-stone-200">
            <p className="text-sm text-slate-700">📁 Need a file? I can search your documents instantly.</p>
          </div>
        </div>
        <div className="flex justify-end">
          <div className="bg-amber-500 rounded-2xl rounded-tr-md p-3 max-w-[85%] text-white shadow-sm">
            <p className="text-sm text-white">Find the 'Mnemo Pitch Deck final version'</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <div className="bg-white rounded-2xl rounded-tl-md p-3 max-w-[90%] shadow-sm border border-stone-200">
            <p className="text-sm text-slate-700 mb-2">Found it! Here's 'Mnemo_Pitch_Deck_v3_Final.pdf':</p>
            <div className="bg-amber-50 p-2 rounded-lg border border-amber-200 flex items-center space-x-2">
              <IconFiles className="h-4 w-4 text-amber-600" />
              <div className="flex-1">
                <p className="text-xs font-medium text-slate-900">Mnemo_Pitch_Deck_v3_Final.pdf</p>
                <p className="text-xs text-slate-600">Google Drive • Shared with you</p>
              </div>
              <button className="text-xs bg-amber-600 text-white px-2 py-1 rounded font-medium">Share</button>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: "github",
    title: "Code Assistant",
    subtitle: "Stay updated on your repositories and development work",
    placeholder: "Try: 'Any new PRs on mnemo-app?'",
    icon: <IconBrandGithub className="h-3.5 w-3.5 text-amber-600 mx-auto mb-0.5" />,
    content: (
      <div className="space-y-3">
        <div className="flex items-start gap-2">
          <div className="bg-white rounded-2xl rounded-tl-md p-3 max-w-[85%] shadow-sm border border-stone-200">
            <p className="text-sm text-slate-700">⚡ Checking your GitHub activity now...</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <div className="bg-white rounded-2xl rounded-bl-md p-3 max-w-[90%] shadow-sm border border-stone-200">
            <p className="text-sm text-slate-700 mb-2">Updates for 'mnemo-app':</p>
            <div className="space-y-2">
              <div className="bg-amber-50 p-2 rounded-lg border border-amber-200">
                <p className="text-xs font-medium text-slate-900">PR #251: 'Enhance hero carousel' - Merged by @team</p>
              </div>
              <div className="bg-stone-50 p-2 rounded-lg border border-stone-200">
                <p className="text-xs font-medium text-slate-900">Issue #253: 'Add morning briefing to carousel' - Opened</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <div className="bg-amber-500 rounded-2xl rounded-tr-md p-3 max-w-[85%] text-white shadow-sm">
            <p className="text-sm text-white">Thanks for the update!</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: "email",
    title: "Email Helper",
    subtitle: "Draft replies, get summaries, manage your inbox",
    placeholder: "Try: 'Summarize my unread emails'",
    icon: <IconMail className="h-3.5 w-3.5 text-amber-600 mx-auto mb-0.5" />,
    content: (
      <div className="space-y-3">
        <div className="flex items-start gap-2">
          <div className="bg-white rounded-2xl rounded-tl-md p-3 max-w-[85%] shadow-sm border border-stone-200">
            <p className="text-sm text-slate-700">📧 Let's tackle your inbox. What can I help with?</p>
          </div>
        </div>
        <div className="flex justify-end">
          <div className="bg-amber-500 rounded-2xl rounded-tr-md p-3 max-w-[85%] text-white shadow-sm">
            <p className="text-sm text-white">Draft a reply to Sarah about the project timeline.</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <div className="bg-white rounded-2xl rounded-tl-md p-3 max-w-[90%] shadow-sm border border-stone-200">
            <p className="text-sm text-slate-700 mb-1">Draft for Sarah:</p>
            <div className="text-xs bg-stone-50 p-2 rounded border border-stone-200">
              <p className="text-slate-700">"Hi Sarah, Regarding the timeline, we're on track to meet the Q3 deadline. Let me know if you need more details."</p>
            </div>
            <div className="mt-2 flex space-x-2">
              <button className="text-xs bg-amber-600 text-white px-2 py-1 rounded font-medium">Send</button>
              <button className="text-xs bg-stone-300 text-slate-800 px-2 py-1 rounded font-medium">Edit</button>
            </div>
          </div>
        </div>
      </div>
    )
  }
];

export function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % useCases.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const currentUseCase = useCases[currentSlide];

  return (
    <div className="relative w-full max-w-sm">
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-200/30 to-yellow-200/20 rounded-3xl blur-3xl scale-110" />
      
      {/* Carousel Container */}
      <div className="relative bg-stone-100 rounded-3xl p-1.5 shadow-2xl border border-stone-300/50">
        {/* Phone frame */}
        <div className="bg-white rounded-[1.5rem] overflow-hidden border border-stone-200">
          {/* Status bar */}
          <div className="bg-slate-900 px-4 py-2 flex justify-between items-center text-white text-xs font-medium">
            <span>9:41</span>
            <div className="flex space-x-1">
              <div className="w-3 h-1.5 bg-white rounded-sm" />
              <div className="w-0.5 h-1.5 bg-white rounded-sm" />
              <div className="w-4 h-1.5 bg-white rounded-sm" />
            </div>
          </div>
          
          {/* WhatsApp header */}
          <div className="bg-amber-500 px-3 py-2.5 flex items-center">
            <div className="w-8 h-8 rounded-full bg-white/20 mr-2 flex items-center justify-center">
              <IconRobot className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white text-sm">Mnemo</h3>
              <p className="text-xs text-white/80">Online • Perfect memory</p>
            </div>
            <div className="flex space-x-1">
              {useCases.map((_, index) => (
                <div 
                  key={`header-dot-${index}`}
                  className={`w-1.5 h-1.5 rounded-full ${
                    index === currentSlide ? 'bg-white' : 'bg-white/60'
                  }`}
                />
              ))}
            </div>
          </div>
          
          {/* Carousel Content */}
          <div className="bg-stone-50 p-3 h-72 md:h-80 overflow-hidden relative">
            {currentUseCase.content}
          </div>
          
          {/* Input bar */}
          <div className="bg-stone-50 p-2 border-t border-stone-200">
            <div className="bg-white rounded-full flex items-center px-3 py-2 shadow-sm border border-stone-200">
              <input 
                type="text" 
                placeholder={currentUseCase.placeholder}
                className="flex-1 bg-transparent text-xs outline-none text-slate-700"
                readOnly
              />
              <Button size="sm" className="ml-2 h-6 w-6 p-0 rounded-full bg-amber-500 hover:bg-amber-600">
                <IconArrowRight className="h-3 w-3 text-white" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Carousel indicators and use case labels */}
      <div className="mt-4 space-y-2">
        <div className="flex justify-center space-x-1.5">
          {useCases.map((uc, index) => (
            <button
              key={uc.id}
              onClick={() => setCurrentSlide(index)}
              className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-colors ${
                index === currentSlide ? 'bg-amber-500' : 'bg-stone-400'
              }`}
              aria-label={`Go to slide ${index + 1}: ${uc.title}`}
            />
          ))}
        </div>
        
        <div className="text-center">
          <p className="text-sm font-medium text-amber-600">{currentUseCase.title}</p>
          <p className="text-xs text-slate-600">{currentUseCase.subtitle}</p>
        </div>
        
        {/* Use case navigation */}
        <div className="grid grid-cols-5 gap-1 text-xs">
          {useCases.map((uc, index) => (
            <button
              key={`nav-${uc.id}`}
              onClick={() => setCurrentSlide(index)}
              className={`bg-white/80 rounded-md p-1.5 text-center border border-stone-200 cursor-pointer hover:bg-stone-50 transition-colors flex flex-col items-center justify-center space-y-0.5 shadow-sm ${
                index === currentSlide ? 'bg-amber-50 ring-1 ring-amber-400 border-amber-300' : ''
              }`}
              aria-label={`Navigate to ${uc.title}`}
            >
              {uc.icon}
              <span className="text-slate-600 text-[0.6rem] leading-tight block">{uc.title.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 