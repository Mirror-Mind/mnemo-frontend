import prisma from '@/lib/prisma';
import { DynamicTool } from "@langchain/core/tools";
import { CallbackManagerForToolRun } from "@langchain/core/callbacks/manager";

// Get GitHub access token for a user
async function getGitHubAccessToken(userId: string) {
  try {
    // Find GitHub account for the user
    const account = await prisma.account.findFirst({
      where: {
        userId,
        providerId: "github"
      }
    });

    if (!account) {
      throw new Error("No GitHub account connected");
    }
    
    if (!account.accessToken) {
      throw new Error("Missing GitHub access token");
    }

    return account.accessToken;
  } catch (error: any) {
    console.error("GitHub authentication error:", error);
    throw error;
  }
}

// List pull requests for a user
export async function listPullRequests(userId: string) {
  try {
    console.log(`[GITHUB] Listing pull requests for user: ${userId}`);
    
    // Get authenticated client
    const accessToken = await getGitHubAccessToken(userId);
    
    // First, get the user's information to determine username
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });
    
    if (!userResponse.ok) {
      throw new Error(`GitHub API error: ${userResponse.status}`);
    }
    
    const userData = await userResponse.json();
    const username = userData.login;
    
    // Fetch pull requests created by the user
    const pullRequestsResponse = await fetch(`https://api.github.com/search/issues?q=is:pr+author:${username}+is:open`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });
    
    if (!pullRequestsResponse.ok) {
      throw new Error(`GitHub API error: ${pullRequestsResponse.status}`);
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
    
    console.log(`[GITHUB] Found ${pullRequests.length} pull requests`);
    
    return { 
      success: true, 
      data: pullRequests 
    };
  } catch (error: any) {
    console.error(`[GITHUB ERROR] List pull requests: ${error.message}`);
    
    if (error.message.includes("No GitHub account")) {
      return { 
        success: false, 
        error: "No GitHub account connected",
        code: "NO_GITHUB_ACCOUNT"
      };
    }
    
    if (error.message.includes("GitHub API error")) {
      return { 
        success: false, 
        error: error.message,
        code: "GITHUB_API_ERROR"
      };
    }
    
    return { 
      success: false, 
      error: "Failed to fetch pull requests",
      details: error.message,
      code: "GITHUB_ERROR"
    };
  }
}

// Get details of a specific pull request
export async function getPullRequestDetails(
  userId: string,
  params: {
    owner: string;
    repo: string;
    pullRequestNumber: number;
  }
) {
  try {
    console.log(`[GITHUB] Getting PR details for user: ${userId}`);
    // console.log(`[GITHUB] PR details: ${JSON.stringify(params)}`);
    
    // Get authenticated client
    const accessToken = await getGitHubAccessToken(userId);
    
    // Fetch the pull request details
    const { owner, repo, pullRequestNumber } = params;
    const prResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${pullRequestNumber}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });
    
    if (!prResponse.ok) {
      throw new Error(`GitHub API error: ${prResponse.status}`);
    }
    
    const prData = await prResponse.json();
    
    console.log(`[GITHUB] Retrieved PR details for PR #${pullRequestNumber}`);
    
    return { 
      success: true, 
      data: {
        id: prData.id.toString(),
        title: prData.title,
        number: prData.number,
        state: prData.state,
        html_url: prData.html_url,
        created_at: prData.created_at,
        updated_at: prData.updated_at,
        body: prData.body,
        user: {
          login: prData.user.login,
          avatar_url: prData.user.avatar_url,
        },
        repository: {
          name: repo,
          full_name: `${owner}/${repo}`
        },
        additions: prData.additions,
        deletions: prData.deletions,
        changed_files: prData.changed_files
      }
    };
  } catch (error: any) {
    console.error(`[GITHUB ERROR] Get PR details: ${error.message}`);
    
    if (error.message.includes("No GitHub account")) {
      return { 
        success: false, 
        error: "No GitHub account connected",
        code: "NO_GITHUB_ACCOUNT"
      };
    }
    
    if (error.message.includes("GitHub API error")) {
      return { 
        success: false, 
        error: error.message,
        code: "GITHUB_API_ERROR"
      };
    }
    
    return { 
      success: false, 
      error: "Failed to get pull request details",
      details: error.message,
      code: "GITHUB_ERROR"
    };
  }
}

// Helper function to log tool calls
const logToolCall = (toolName: string, args: any, result: any) => {
  console.log(`[TOOL CALL] ${toolName}`);
  console.log(`[TOOL ARGS] ${JSON.stringify(args, null, 2)}`);
  console.log(`[TOOL RESPONSE] ${JSON.stringify(result, null, 2)}`);
};

// Create pull requests list tool
export const getGitHubPullRequestsListTool = (getCurrentUserId: () => string) => new DynamicTool({
  name: "list_github_pull_requests",
  description: "Lists open pull requests created by the user on GitHub.",
  func: async (args: string, runManager?: CallbackManagerForToolRun): Promise<string> => {
    try {
      // Use the current user ID from the request context
      const userId = getCurrentUserId();
      console.log(`[TOOL] list_github_pull_requests called for user: ${userId}`);
      
      // Parse arguments if any
      const parsedArgs = args ? JSON.parse(args) : {};
      
      // Call the PR listing function
      const result = await listPullRequests(userId);
      
      // Log the tool call
      logToolCall("list_github_pull_requests", parsedArgs, result);
      
      if (!result.success) {
        if (result.code === "NO_GITHUB_ACCOUNT") {
          return "You don't have a GitHub account connected. Please connect your GitHub account in the Providers section of your dashboard.";
        }
        return `Error: ${result.error}`;
      }
      
      const prs = result.data;
      if (prs.length === 0) {
        return "You don't have any open pull requests.";
      }
      
      // Format the response
      const prList = prs.map((pr: any) => {
        return `- #${pr.number}: "${pr.title}" in ${pr.repository.full_name} (${pr.html_url})`;
      }).join("\n");
      
      return `Your open pull requests:\n\n${prList}`;
    } catch (error: any) {
      console.error("[TOOL ERROR] list_github_pull_requests:", error);
      return `Error listing pull requests: ${error.message}`;
    }
  },
  returnDirect: false
});

// Create pull request details tool
export const getGitHubPullRequestDetailsTool = (getCurrentUserId: () => string) => new DynamicTool({
  name: "get_github_pull_request_details",
  description: "Gets detailed information about a specific GitHub pull request. Requires owner (string), repo (string), and pullRequestNumber (number) parameters.",
  func: async (args: string, runManager?: CallbackManagerForToolRun): Promise<string> => {
    try {
      // Use the current user ID from the request context
      const userId = getCurrentUserId();
      console.log(`[TOOL] get_github_pull_request_details called for user: ${userId}`);
      
      // Parse arguments
      const parsedArgs = JSON.parse(args);
      if (!parsedArgs.owner || !parsedArgs.repo || !parsedArgs.pullRequestNumber) {
        return "Error: Missing required parameters. Please provide owner, repo, and pullRequestNumber.";
      }
      
      // Call the PR details function
      const result = await getPullRequestDetails(userId, {
        owner: parsedArgs.owner,
        repo: parsedArgs.repo,
        pullRequestNumber: parseInt(parsedArgs.pullRequestNumber)
      });
      
      // Log the tool call
      logToolCall("get_github_pull_request_details", parsedArgs, result);
      
      if (!result.success) {
        if (result.code === "NO_GITHUB_ACCOUNT") {
          return "You don't have a GitHub account connected. Please connect your GitHub account in the Providers section of your dashboard.";
        }
        return `Error: ${result.error}`;
      }
      
      const pr = result.data;
      if (!pr) {
        return "Error: Pull request data not found";
      }
      
      // Format the response
      return `
Pull Request #${pr.number}: "${pr.title}"
Repository: ${pr.repository.full_name}
URL: ${pr.html_url}
Status: ${pr.state}
Created: ${new Date(pr.created_at).toLocaleString()}
Last Updated: ${new Date(pr.updated_at).toLocaleString()}
Author: ${pr.user.login}

Description:
${pr.body || "(No description provided)"}

Changes:
- Added ${pr.additions} lines
- Removed ${pr.deletions} lines
- Changed ${pr.changed_files} files
      `.trim();
    } catch (error: any) {
      console.error("[TOOL ERROR] get_github_pull_request_details:", error);
      return `Error getting pull request details: ${error.message}`;
    }
  },
  returnDirect: false
}); 