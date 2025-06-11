interface CommentPublishingConfig {
  targetUrl: string;
  commentText: string;
  platforms: string[];
  userCredentials: {
    [platform: string]: {
      username?: string;
      password?: string;
      accessToken?: string;
      apiKey?: string;
    };
  };
}

interface CommentPublishingResult {
  platform: string;
  success: boolean;
  commentId?: string;
  error?: string;
  timestamp: string;
  targetUrl: string;
}

export class SocialCommentsPublisher {
  private async publishToFacebook(config: CommentPublishingConfig): Promise<CommentPublishingResult> {
    try {
      // Facebook Graph API for commenting
      const credentials = config.userCredentials.facebook;
      if (!credentials?.accessToken) {
        throw new Error('Facebook access token required');
      }

      // Extract post ID from Facebook URL
      const postId = this.extractFacebookPostId(config.targetUrl);
      if (!postId) {
        throw new Error('Invalid Facebook URL');
      }

      const response = await fetch(`https://graph.facebook.com/v18.0/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: config.commentText,
          access_token: credentials.accessToken
        })
      });

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error.message);
      }

      return {
        platform: 'Facebook',
        success: true,
        commentId: result.id,
        timestamp: new Date().toISOString(),
        targetUrl: config.targetUrl
      };
    } catch (error: any) {
      return {
        platform: 'Facebook',
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        targetUrl: config.targetUrl
      };
    }
  }

  private async publishToTwitter(config: CommentPublishingConfig): Promise<CommentPublishingResult> {
    try {
      // Twitter API v2 for replying to tweets
      const credentials = config.userCredentials.twitter;
      if (!credentials?.accessToken) {
        throw new Error('Twitter access token required');
      }

      const tweetId = this.extractTwitterTweetId(config.targetUrl);
      if (!tweetId) {
        throw new Error('Invalid Twitter URL');
      }

      const response = await fetch('https://api.twitter.com/2/tweets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${credentials.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: config.commentText,
          reply: {
            in_reply_to_tweet_id: tweetId
          }
        })
      });

      const result = await response.json();
      
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      return {
        platform: 'Twitter',
        success: true,
        commentId: result.data?.id,
        timestamp: new Date().toISOString(),
        targetUrl: config.targetUrl
      };
    } catch (error: any) {
      return {
        platform: 'Twitter',
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        targetUrl: config.targetUrl
      };
    }
  }

  private async publishToYouTube(config: CommentPublishingConfig): Promise<CommentPublishingResult> {
    try {
      // YouTube Data API for commenting
      const credentials = config.userCredentials.youtube;
      if (!credentials?.accessToken) {
        throw new Error('YouTube access token required');
      }

      const videoId = this.extractYouTubeVideoId(config.targetUrl);
      if (!videoId) {
        throw new Error('Invalid YouTube URL');
      }

      const response = await fetch('https://www.googleapis.com/youtube/v3/commentThreads', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${credentials.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          snippet: {
            videoId: videoId,
            topLevelComment: {
              snippet: {
                textOriginal: config.commentText
              }
            }
          }
        })
      });

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error.message);
      }

      return {
        platform: 'YouTube',
        success: true,
        commentId: result.id,
        timestamp: new Date().toISOString(),
        targetUrl: config.targetUrl
      };
    } catch (error: any) {
      return {
        platform: 'YouTube',
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        targetUrl: config.targetUrl
      };
    }
  }

  private async publishToInstagram(config: CommentPublishingConfig): Promise<CommentPublishingResult> {
    try {
      // Instagram Basic Display API for commenting
      const credentials = config.userCredentials.instagram;
      if (!credentials?.accessToken) {
        throw new Error('Instagram access token required');
      }

      const mediaId = this.extractInstagramMediaId(config.targetUrl);
      if (!mediaId) {
        throw new Error('Invalid Instagram URL');
      }

      const response = await fetch(`https://graph.instagram.com/${mediaId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: config.commentText,
          access_token: credentials.accessToken
        })
      });

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error.message);
      }

      return {
        platform: 'Instagram',
        success: true,
        commentId: result.id,
        timestamp: new Date().toISOString(),
        targetUrl: config.targetUrl
      };
    } catch (error: any) {
      return {
        platform: 'Instagram',
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        targetUrl: config.targetUrl
      };
    }
  }

  private async publishToTikTok(config: CommentPublishingConfig): Promise<CommentPublishingResult> {
    try {
      // TikTok API for commenting (requires special permissions)
      const credentials = config.userCredentials.tiktok;
      if (!credentials?.accessToken) {
        throw new Error('TikTok access token required');
      }

      // TikTok commenting is limited and requires special business permissions
      // For now, we'll simulate the request structure
      const videoId = this.extractTikTokVideoId(config.targetUrl);
      if (!videoId) {
        throw new Error('Invalid TikTok URL');
      }

      // Note: TikTok's API for commenting is very restricted
      // This would require TikTok for Business API access
      return {
        platform: 'TikTok',
        success: false,
        error: 'TikTok commenting requires special business API permissions',
        timestamp: new Date().toISOString(),
        targetUrl: config.targetUrl
      };
    } catch (error: any) {
      return {
        platform: 'TikTok',
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        targetUrl: config.targetUrl
      };
    }
  }

  private async publishToTelegram(config: CommentPublishingConfig): Promise<CommentPublishingResult> {
    try {
      // Telegram Bot API for messaging
      const credentials = config.userCredentials.telegram;
      if (!credentials?.accessToken) {
        throw new Error('Telegram bot token required');
      }

      const chatId = this.extractTelegramChatId(config.targetUrl);
      if (!chatId) {
        throw new Error('Invalid Telegram URL or chat ID');
      }

      const response = await fetch(`https://api.telegram.org/bot${credentials.accessToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: config.commentText,
          reply_to_message_id: this.extractTelegramMessageId(config.targetUrl)
        })
      });

      const result = await response.json();
      
      if (!result.ok) {
        throw new Error(result.description);
      }

      return {
        platform: 'Telegram',
        success: true,
        commentId: result.result.message_id.toString(),
        timestamp: new Date().toISOString(),
        targetUrl: config.targetUrl
      };
    } catch (error: any) {
      return {
        platform: 'Telegram',
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        targetUrl: config.targetUrl
      };
    }
  }

  private async publishToSnapchat(config: CommentPublishingConfig): Promise<CommentPublishingResult> {
    // Snapchat doesn't have a public API for commenting
    return {
      platform: 'Snapchat',
      success: false,
      error: 'Snapchat does not provide public API for commenting',
      timestamp: new Date().toISOString(),
      targetUrl: config.targetUrl
    };
  }

  private async publishToLikee(config: CommentPublishingConfig): Promise<CommentPublishingResult> {
    // Likee doesn't have a widely available public API for commenting
    return {
      platform: 'Likee',
      success: false,
      error: 'Likee API for commenting is not publicly available',
      timestamp: new Date().toISOString(),
      targetUrl: config.targetUrl
    };
  }

  // URL extraction helper methods
  private extractFacebookPostId(url: string): string | null {
    const match = url.match(/facebook\.com\/.*\/posts\/(\d+)/);
    return match ? match[1] : null;
  }

  private extractTwitterTweetId(url: string): string | null {
    const match = url.match(/twitter\.com\/\w+\/status\/(\d+)/);
    return match ? match[1] : null;
  }

  private extractYouTubeVideoId(url: string): string | null {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  }

  private extractInstagramMediaId(url: string): string | null {
    const match = url.match(/instagram\.com\/p\/([^\/]+)/);
    return match ? match[1] : null;
  }

  private extractTikTokVideoId(url: string): string | null {
    const match = url.match(/tiktok\.com\/@[^\/]+\/video\/(\d+)/);
    return match ? match[1] : null;
  }

  private extractTelegramChatId(url: string): string | null {
    const match = url.match(/t\.me\/([^\/]+)/);
    return match ? match[1] : null;
  }

  private extractTelegramMessageId(url: string): number | null {
    const match = url.match(/t\.me\/[^\/]+\/(\d+)/);
    return match ? parseInt(match[1]) : null;
  }

  async publishComments(config: CommentPublishingConfig): Promise<CommentPublishingResult[]> {
    const results: CommentPublishingResult[] = [];
    
    for (const platform of config.platforms) {
      let result: CommentPublishingResult;
      
      switch (platform.toLowerCase()) {
        case 'facebook':
          result = await this.publishToFacebook(config);
          break;
        case 'twitter':
          result = await this.publishToTwitter(config);
          break;
        case 'youtube':
          result = await this.publishToYouTube(config);
          break;
        case 'instagram':
          result = await this.publishToInstagram(config);
          break;
        case 'tiktok':
          result = await this.publishToTikTok(config);
          break;
        case 'telegram':
          result = await this.publishToTelegram(config);
          break;
        case 'snapchat':
          result = await this.publishToSnapchat(config);
          break;
        case 'likee':
          result = await this.publishToLikee(config);
          break;
        default:
          result = {
            platform: platform,
            success: false,
            error: 'Unsupported platform',
            timestamp: new Date().toISOString(),
            targetUrl: config.targetUrl
          };
      }
      
      results.push(result);
      
      // Add delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return results;
  }
}

export const socialCommentsPublisher = new SocialCommentsPublisher();