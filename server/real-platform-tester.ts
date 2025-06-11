import fetch from 'node-fetch';

export interface RealPlatformResult {
  success: boolean;
  platform: string;
  postId?: string;
  url?: string;
  error?: string;
  details?: any;
}

export class RealPlatformTester {
  
  async testFacebookPosting(accessToken: string, message: string): Promise<RealPlatformResult> {
    try {
      const response = await fetch(`https://graph.facebook.com/me/feed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          access_token: accessToken
        })
      });

      const data = await response.json();
      
      if (response.ok && data.id) {
        return {
          success: true,
          platform: "Facebook",
          postId: data.id,
          url: `https://facebook.com/${data.id}`
        };
      } else {
        return {
          success: false,
          platform: "Facebook",
          error: data.error?.message || "Facebook posting failed",
          details: data
        };
      }
    } catch (error: any) {
      return {
        success: false,
        platform: "Facebook",
        error: error.message
      };
    }
  }

  async testTwitterPosting(accessToken: string, tokenSecret: string, message: string): Promise<RealPlatformResult> {
    try {
      // Twitter API v2 posting
      const response = await fetch('https://api.twitter.com/2/tweets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: message
        })
      });

      const data = await response.json();
      
      if (response.ok && data.data?.id) {
        return {
          success: true,
          platform: "Twitter",
          postId: data.data.id,
          url: `https://twitter.com/user/status/${data.data.id}`
        };
      } else {
        return {
          success: false,
          platform: "Twitter",
          error: data.errors?.[0]?.message || "Twitter posting failed",
          details: data
        };
      }
    } catch (error: any) {
      return {
        success: false,
        platform: "Twitter",
        error: error.message
      };
    }
  }

  async testRedditPosting(accessToken: string, subreddit: string, title: string, text: string): Promise<RealPlatformResult> {
    try {
      const response = await fetch(`https://oauth.reddit.com/api/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'SmartPublisher/1.0'
        },
        body: new URLSearchParams({
          api_type: 'json',
          kind: 'self',
          sr: subreddit,
          title: title,
          text: text
        })
      });

      const data = await response.json();
      
      if (response.ok && data.json?.data?.name) {
        return {
          success: true,
          platform: "Reddit",
          postId: data.json.data.name,
          url: data.json.data.url
        };
      } else {
        return {
          success: false,
          platform: "Reddit",
          error: data.json?.errors?.[0]?.[1] || "Reddit posting failed",
          details: data
        };
      }
    } catch (error: any) {
      return {
        success: false,
        platform: "Reddit",
        error: error.message
      };
    }
  }

  async testLinkedInPosting(accessToken: string, personUrn: string, text: string): Promise<RealPlatformResult> {
    try {
      const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        },
        body: JSON.stringify({
          author: personUrn,
          lifecycleState: 'PUBLISHED',
          specificContent: {
            'com.linkedin.ugc.ShareContent': {
              shareCommentary: {
                text: text
              },
              shareMediaCategory: 'NONE'
            }
          },
          visibility: {
            'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
          }
        })
      });

      const data = await response.json();
      
      if (response.ok && data.id) {
        return {
          success: true,
          platform: "LinkedIn",
          postId: data.id,
          url: `https://linkedin.com/feed/update/${data.id}`
        };
      } else {
        return {
          success: false,
          platform: "LinkedIn",
          error: data.message || "LinkedIn posting failed",
          details: data
        };
      }
    } catch (error: any) {
      return {
        success: false,
        platform: "LinkedIn",
        error: error.message
      };
    }
  }

  async testAllMainPlatforms(tokens: {
    facebook?: string;
    twitter?: string;
    twitterSecret?: string;
    reddit?: string;
    linkedin?: string;
    linkedinUrn?: string;
  }, message: string): Promise<RealPlatformResult[]> {
    const results: RealPlatformResult[] = [];

    if (tokens.facebook) {
      const facebookResult = await this.testFacebookPosting(tokens.facebook, message);
      results.push(facebookResult);
    }

    if (tokens.twitter && tokens.twitterSecret) {
      const twitterResult = await this.testTwitterPosting(tokens.twitter, tokens.twitterSecret, message);
      results.push(twitterResult);
    }

    if (tokens.reddit) {
      const redditResult = await this.testRedditPosting(tokens.reddit, 'test', 'Test Post', message);
      results.push(redditResult);
    }

    if (tokens.linkedin && tokens.linkedinUrn) {
      const linkedinResult = await this.testLinkedInPosting(tokens.linkedin, tokens.linkedinUrn, message);
      results.push(linkedinResult);
    }

    return results;
  }
}

export const realPlatformTester = new RealPlatformTester();