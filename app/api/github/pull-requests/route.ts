import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Get the user session
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if the user has a GitHub account
    const githubAccount = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        providerId: "github"
      }
    });

    console.log("github account", githubAccount)
    if (!githubAccount) {
      return NextResponse.json(
        { error: "GitHub account not connected" },
        { status: 400 }
      );
    }
    const accessToken = githubAccount.accessToken;
    if (!accessToken) {
      return NextResponse.json(
        { error: "GitHub access token not found" },
        { status: 400 }
      );
    }
    
    // First, get the user's information to determine username
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });
    
    if (!userResponse.ok) {
      return NextResponse.json(
        { error: `GitHub API error: ${userResponse.status}` },
        { status: userResponse.status }
      );
    }
    
    const userData = await userResponse.json();
    const username = userData.login;
    
    // Fetch pull requests created by the user across all repositories
    const pullRequestsResponse = await fetch(`https://api.github.com/search/issues?q=is:pr+author:${username}+is:open`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!pullRequestsResponse.ok) {
      const errorData = await pullRequestsResponse.json();
      console.error('GitHub API error:', errorData);
      return NextResponse.json(
        { error: `GitHub API error: ${pullRequestsResponse.status}` },
        { status: pullRequestsResponse.status }
      );
    }

    const pullRequestsData = await pullRequestsResponse.json();
    
    // Transform the data to include repository information
    const pullRequests = pullRequestsData.items.map((item: any) => {
      // Extract repo owner and name from the HTML URL
      const urlParts = item.html_url.split('/');
      const repoOwner = urlParts[3];
      const repoName = urlParts[4];
      
      return {
        id: item.id.toString(),
        title: item.title,
        number: item.number,
        state: item.state,
        html_url: item.html_url,
        created_at: item.created_at,
        repository: {
          name: repoName,
          full_name: `${repoOwner}/${repoName}`
        }
      };
    });

    return NextResponse.json({ pullRequests });
  } catch (error) {
    console.error('Error fetching pull requests:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 