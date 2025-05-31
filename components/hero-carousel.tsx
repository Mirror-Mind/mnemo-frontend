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
    title: "Daily Morning Review",
    subtitle: "Get a rundown of your day - schedule, tasks & more",
    placeholder: "Try: 'Good morning Orbia'",
    icon: <IconSunHigh className="h-3.5 w-3.5 text-orange-400 mx-auto mb-0.5" />,
    content: (
      <div className="space-y-3">
        <div className="flex items-start gap-2">
          <div className="bg-white rounded-2xl rounded-tl-md p-3 max-w-[85%] shadow-sm border">
            <p className="text-sm text-slate-800">☀️ Good morning! Here's your daily briefing:</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <div className="bg-white rounded-2xl rounded-bl-md p-3 max-w-[90%] shadow-sm border">
            <p className="text-sm text-slate-800 font-semibold mb-1">Today's Schedule (3 events):</p>
            <div className="text-xs text-slate-700 space-y-1">
              <p>• 10:00 AM: Team Standup</p>
              <p>• 01:00 PM: Lunch with Client</p>
              <p>• 03:30 PM: Project Sync</p>
            </div>
            <p className="text-sm text-slate-800 font-semibold mt-2 mb-1">Important Tasks (2):</p>
            <div className="text-xs text-slate-700 space-y-1">
              <p>• Follow up on Q3 report</p>
              <p>• Review PR #251</p>
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <div className="bg-green-500 rounded-2xl rounded-tr-md p-3 max-w-[85%] text-white shadow-sm">
            <p className="text-sm text-white">Thanks! Can you give me a podcast version?</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: "calendar",
    title: "Smart Calendar",
    subtitle: "View, schedule, and modify appointments via chat",
    placeholder: "Try: 'Reschedule my 2pm meeting'",
    icon: <IconCalendar className="h-3.5 w-3.5 text-green-400 mx-auto mb-0.5" />,
    content: (
      <div className="space-y-3">
        <div className="flex items-start gap-2">
          <div className="bg-white rounded-2xl rounded-tl-md p-3 max-w-[85%] shadow-sm border">
            <p className="text-sm text-slate-800">📅 How can I help with your calendar today?</p>
          </div>
        </div>
        <div className="flex justify-end">
          <div className="bg-green-500 rounded-2xl rounded-tr-md p-3 max-w-[85%] text-white shadow-sm">
            <p className="text-sm text-white">Schedule a 'Project Kick-off' for tomorrow at 11am with the design team.</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <div className="bg-white rounded-2xl rounded-tl-md p-3 max-w-[90%] shadow-sm border">
            <div className="flex items-start space-x-2">
              <IconCheck className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-slate-800 mb-2">Done! 'Project Kick-off' is scheduled with the design team for tomorrow at 11 AM.</p>
                <div className="bg-green-50 p-3 rounded-xl border border-green-200">
                  <p className="text-sm font-semibold text-slate-900">Project Kick-off</p>
                  <p className="text-xs text-slate-700">Tomorrow • 11:00 AM - 12:00 PM</p>
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
    subtitle: "Find and share your Google Drive documents instantly",
    placeholder: "Try: 'Find marketing plan Q3'",
    icon: <IconFiles className="h-3.5 w-3.5 text-blue-400 mx-auto mb-0.5" />,
    content: (
      <div className="space-y-3">
        <div className="flex items-start gap-2">
          <div className="bg-white rounded-2xl rounded-tl-md p-3 max-w-[85%] shadow-sm border">
            <p className="text-sm text-slate-800">📁 Need a file? Just ask. I can search your Google Drive.</p>
          </div>
        </div>
        <div className="flex justify-end">
          <div className="bg-green-500 rounded-2xl rounded-tr-md p-3 max-w-[85%] text-white shadow-sm">
            <p className="text-sm text-white">Find the 'Orbia Pitch Deck final version'</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <div className="bg-white rounded-2xl rounded-tl-md p-3 max-w-[90%] shadow-sm border">
            <p className="text-sm text-slate-800 mb-2">Found it! Here's 'Orbia_Pitch_Deck_v3_Final.pdf':</p>
            <div className="bg-blue-50 p-2 rounded-lg border border-blue-200 flex items-center space-x-2">
              <IconFiles className="h-4 w-4 text-blue-600" />
              <div className="flex-1">
                <p className="text-xs font-medium text-slate-900">Orbia_Pitch_Deck_v3_Final.pdf</p>
                <p className="text-xs text-slate-600">Google Drive • Shared with you</p>
              </div>
              <button className="text-xs bg-blue-600 text-white px-2 py-1 rounded font-medium">Share</button>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: "github",
    title: "GitHub Assistant",
    subtitle: "Stay on top of PRs, issues, and repo activity",
    placeholder: "Try: 'Any new PRs on orbia-app?'",
    icon: <IconBrandGithub className="h-3.5 w-3.5 text-purple-400 mx-auto mb-0.5" />,
    content: (
      <div className="space-y-3">
        <div className="flex items-start gap-2">
          <div className="bg-white rounded-2xl rounded-tl-md p-3 max-w-[85%] shadow-sm border">
            <p className="text-sm text-slate-800">🧑‍💻 Checking your GitHub activity now...</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <div className="bg-white rounded-2xl rounded-bl-md p-3 max-w-[90%] shadow-sm border">
            <p className="text-sm text-slate-800 mb-2">Updates for 'orbia-app':</p>
            <div className="space-y-2">
              <div className="bg-purple-50 p-2 rounded-lg border border-purple-200">
                <p className="text-xs font-medium text-slate-900">PR #251: 'Fix hero carousel layout' - Merged by @ishaan</p>
              </div>
              <div className="bg-orange-50 p-2 rounded-lg border border-orange-200">
                <p className="text-xs font-medium text-slate-900">Issue #253: 'Add morning review to carousel' - Opened</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <div className="bg-green-500 rounded-2xl rounded-tr-md p-3 max-w-[85%] text-white shadow-sm">
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
    icon: <IconMail className="h-3.5 w-3.5 text-red-400 mx-auto mb-0.5" />,
    content: (
      <div className="space-y-3">
        <div className="flex items-start gap-2">
          <div className="bg-white rounded-2xl rounded-tl-md p-3 max-w-[85%] shadow-sm border">
            <p className="text-sm text-slate-800">📧 Let's tackle your inbox. What can I help with?</p>
          </div>
        </div>
        <div className="flex justify-end">
          <div className="bg-green-500 rounded-2xl rounded-tr-md p-3 max-w-[85%] text-white shadow-sm">
            <p className="text-sm text-white">Draft a reply to Sarah about the project timeline.</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <div className="bg-white rounded-2xl rounded-tl-md p-3 max-w-[90%] shadow-sm border">
            <p className="text-sm text-slate-800 mb-1">Draft for Sarah:</p>
            <div className="text-xs bg-slate-50 p-2 rounded border border-slate-200">
              <p className="text-slate-800">"Hi Sarah, Regarding the timeline, we're on track to meet the Q3 deadline. Let me know if you need more details."</p>
            </div>
            <div className="mt-2 flex space-x-2">
              <button className="text-xs bg-green-600 text-white px-2 py-1 rounded font-medium">Send</button>
              <button className="text-xs bg-slate-300 text-slate-800 px-2 py-1 rounded font-medium">Edit</button>
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
      <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-emerald-400/10 rounded-3xl blur-3xl scale-110" />
      
      {/* Carousel Container */}
      <div className="relative bg-slate-800 rounded-3xl p-1.5 shadow-2xl border border-slate-700">
        {/* Phone frame */}
        <div className="bg-black rounded-[1.5rem] overflow-hidden">
          {/* Status bar */}
          <div className="bg-black px-4 py-2 flex justify-between items-center text-white text-xs font-medium">
            <span>9:41</span>
            <div className="flex space-x-1">
              <div className="w-3 h-1.5 bg-white rounded-sm" />
              <div className="w-0.5 h-1.5 bg-white rounded-sm" />
              <div className="w-4 h-1.5 bg-white rounded-sm" />
            </div>
          </div>
          
          {/* WhatsApp header */}
          <div className="bg-green-500 px-3 py-2.5 flex items-center">
            <div className="w-8 h-8 rounded-full bg-white/20 mr-2 flex items-center justify-center">
              <IconRobot className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white text-sm">Orbia Assistant</h3>
              <p className="text-xs text-white/80">Online • Ready to help</p>
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
          <div className="bg-slate-100 p-3 h-72 md:h-80 overflow-hidden relative">
            {currentUseCase.content}
          </div>
          
          {/* Input bar */}
          <div className="bg-slate-100 p-2 border-t border-slate-200">
            <div className="bg-white rounded-full flex items-center px-3 py-2 shadow-sm border">
              <input 
                type="text" 
                placeholder={currentUseCase.placeholder}
                className="flex-1 bg-transparent text-xs outline-none text-slate-700"
                readOnly
              />
              <Button size="sm" className="ml-2 h-6 w-6 p-0 rounded-full bg-green-500 hover:bg-green-600">
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
                index === currentSlide ? 'bg-green-400' : 'bg-slate-600'
              }`}
              aria-label={`Go to slide ${index + 1}: ${uc.title}`}
            />
          ))}
        </div>
        
        <div className="text-center">
          <p className="text-sm font-medium text-green-400">{currentUseCase.title}</p>
          <p className="text-xs text-slate-400">{currentUseCase.subtitle}</p>
        </div>
        
        {/* Use case navigation */}
        <div className="grid grid-cols-5 gap-1 text-xs">
          {useCases.map((uc, index) => (
            <button
              key={`nav-${uc.id}`}
              onClick={() => setCurrentSlide(index)}
              className={`bg-slate-800/50 rounded-md p-1.5 text-center border border-slate-700 cursor-pointer hover:bg-slate-700/70 transition-colors flex flex-col items-center justify-center space-y-0.5 ${
                index === currentSlide ? 'bg-slate-700/80 ring-1 ring-green-400' : ''
              }`}
              aria-label={`Navigate to ${uc.title}`}
            >
              {uc.icon}
              <span className="text-slate-300 text-[0.6rem] leading-tight block">{uc.title.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 