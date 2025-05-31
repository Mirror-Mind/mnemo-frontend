"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { IconBrandGithub, IconExternalLink, IconLoader, IconCalendar } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

interface PullRequest {
  id: string;
  title: string;
  number: number;
  state: string;
  html_url: string;
  created_at: string;
  repository: {
    name: string;
    full_name: string;
  };
}

export function GithubPullRequests() {
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGithubConnected, setIsGithubConnected] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      
      try {
        // Check if GitHub is connected
        const { data: session } = await authClient.getSession();
        
        if (!session?.user?.accounts) {
          setIsGithubConnected(false);
          setLoading(false);
          return;
        }
        
        const githubAccount = session.user.accounts.find(
          (account: any) => account.providerId === 'github'
        );
        
        if (!githubAccount) {
          setIsGithubConnected(false);
          setLoading(false);
          return;
        }
        
        setIsGithubConnected(true);
        
        // Fetch pull requests
        const response = await fetch('/api/github/pull-requests');
        if (!response.ok) {
          throw new Error('Failed to fetch pull requests');
        }
        
        const data = await response.json();
        setPullRequests(data.pullRequests || []);
      } catch (err: any) {
        console.error('Error fetching pull requests:', err);
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  if (!isGithubConnected) {
    return null;
  }

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <IconBrandGithub size={20} />
            GitHub Pull Requests
          </CardTitle>
        </div>
        <CardDescription>Your open pull requests across repositories</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-6">
            <IconLoader className="animate-spin" />
          </div>
        ) : error ? (
          <div className="py-6 text-center text-muted-foreground">
            {error}
          </div>
        ) : pullRequests.length === 0 ? (
          <div className="py-6 text-center text-muted-foreground">
            No open pull requests
          </div>
        ) : (
          <div className="space-y-4">
            {pullRequests.slice(0, 5).map((pr) => (
              <div key={pr.id} className="flex flex-col md:flex-row md:items-start justify-between border-b pb-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs font-normal">
                      {pr.repository.full_name}
                    </Badge>
                    <Badge variant={pr.state === 'open' ? 'default' : 'secondary'}>
                      {pr.state}
                    </Badge>
                  </div>
                  <h3 className="font-medium text-sm md:text-base line-clamp-2">
                    {pr.title} <span className="text-muted-foreground">#{pr.number}</span>
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <IconCalendar size={14} />
                    <span>Created on {formatDate(pr.created_at)}</span>
                  </div>
                </div>
                <div className="mt-2 md:mt-0">
                  <a href={pr.html_url} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="flex items-center gap-1">
                      View
                      <IconExternalLink size={14} />
                    </Button>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-2">
        <a 
          href="https://github.com/pulls" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm text-muted-foreground hover:underline w-full text-center"
        >
          View all pull requests on GitHub
        </a>
      </CardFooter>
    </Card>
  );
} 