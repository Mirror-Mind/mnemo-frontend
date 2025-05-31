import { CalendarEvents } from "@/components/CalendarEvents";
import { RecentDocuments } from "@/components/RecentDocuments";
import { GithubPullRequests } from "@/components/GithubPullRequests";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IconBrandWhatsapp, IconCalendar, IconFiles, IconMessageCircle, IconCheck, IconMail } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function Page() {
  // Get user session and data
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  
  // Get full user data from database with phoneNumber
  const user = session?.user?.id 
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { 
          id: true, 
          name: true, 
          email: true, 
          phoneNumber: true 
        }
      })
    : null;
  
  // Check if WhatsApp is connected by checking if phoneNumber exists
  const isWhatsAppConnected = user?.phoneNumber ? true : false;
  
  return (
    <div className="min-h-screen pb-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name?.split(' ')[0] || 'there'}!</h1>
        <p className="text-muted-foreground mt-1">
          Here's what's happening in your Orbia orbit
        </p>
      </div>
      
      {/* WhatsApp Status Card */}
      <Card className={`mb-6 ${isWhatsAppConnected 
        ? "bg-gradient-to-br from-green-100 to-white dark:from-green-900/30 dark:to-slate-900 border border-green-200 dark:border-green-900/40" 
        : "bg-gradient-to-br from-green-50 to-white dark:from-green-900/20 dark:to-slate-900 border border-green-100 dark:border-green-900/30"}`}>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className={`flex h-16 w-16 items-center justify-center rounded-full ${isWhatsAppConnected 
              ? "bg-green-500/30" 
              : "bg-green-500/20"}`}>
              {isWhatsAppConnected 
                ? <IconCheck className="h-8 w-8 text-green-600" /> 
                : <IconBrandWhatsapp className="h-8 w-8 text-green-500" />}
            </div>
            
            <div className="flex-1 text-center md:text-left">
              {isWhatsAppConnected ? (
                <>
                  <h3 className="text-xl font-medium mb-2">Orbia Connected</h3>
                  <p className="text-muted-foreground mb-4 max-w-lg">
                    Orbia is ready. Start sending messages to manage your digital life!
                  </p>
                  
                  <Link href="/dashboard/chatbot">
                    <Button className="bg-green-500 hover:bg-green-600">
                      Try Orbia Assistant
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-medium mb-2">Connect Orbia</h3>
                  <p className="text-muted-foreground mb-4 max-w-lg">
                    Link your account to start managing your digital life through Orbia.
                  </p>
                  
                  <Link href="/dashboard/providers">
                    <Button className="bg-green-500 hover:bg-green-600">
                      Connect Orbia
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Activity Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded bg-blue-500/10 flex items-center justify-center">
                <IconCalendar className="h-4 w-4 text-blue-500" />
              </div>
              <CardTitle className="text-base">Today's Events</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3 Events</div>
            <p className="text-xs text-muted-foreground">Next: Team Meeting at 2:00 PM</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded bg-amber-500/10 flex items-center justify-center">
                <IconFiles className="h-4 w-4 text-amber-500" />
              </div>
              <CardTitle className="text-base">Recent Documents</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12 Documents</div>
            <p className="text-xs text-muted-foreground">Last edited: Marketing Plan.pdf</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded bg-rose-500/10 flex items-center justify-center">
                <IconMail className="h-4 w-4 text-rose-500" />
              </div>
              <CardTitle className="text-base">Unread Emails</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8 Unread</div>
            <p className="text-xs text-muted-foreground">Latest from: Product Team</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded bg-purple-500/10 flex items-center justify-center">
                <IconMessageCircle className="h-4 w-4 text-purple-500" />
              </div>
              <CardTitle className="text-base">WhatsApp Activity</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isWhatsAppConnected ? "24 Messages" : "Not connected"}</div>
            <p className="text-xs text-muted-foreground">{isWhatsAppConnected ? "Last command: Calendar check" : "Connect WhatsApp to get started"}</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
            <CardDescription>Your upcoming schedule</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] overflow-auto">
            <CalendarEvents />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Documents</CardTitle>
            <CardDescription>Files you've recently accessed</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] overflow-auto">
            <RecentDocuments />
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>GitHub Pull Requests</CardTitle>
            <CardDescription>Latest activity from your repositories</CardDescription>
          </CardHeader>
          <CardContent className="h-[200px] overflow-auto">
            <GithubPullRequests />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
