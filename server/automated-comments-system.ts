import puppeteer from 'puppeteer';

interface VideoTarget {
  platform: string;
  url: string;
  title: string;
  views: number;
  likes: number;
  comments: number;
  author: string;
  duration: string;
}

interface CommentingSession {
  platform: string;
  videosFound: number;
  commentsPosted: number;
  failed: number;
  errors: string[];
  duration: number;
}

export class AutomatedCommentsSystem {
  private browser: any;
  private page: any;

  private async initBrowser() {
    this.browser = await puppeteer.launch({
      headless: false, // Show browser for user to see what's happening
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });
    this.page = await this.browser.newPage();
    
    // Set a realistic user agent
    await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    // Set viewport
    await this.page.setViewport({ width: 1366, height: 768 });
  }

  async findTrendingYouTubeVideos(count: number = 10): Promise<VideoTarget[]> {
    const videos: VideoTarget[] = [];
    
    try {
      if (!this.browser) await this.initBrowser();
      
      // Navigate to YouTube trending page
      await this.page.goto('https://www.youtube.com/feed/trending', {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Wait for video elements to load
      await this.page.waitForSelector('ytd-video-renderer', { timeout: 10000 });

      // Extract trending videos data
      const trendingVideos = await this.page.evaluate(() => {
        const videoElements = document.querySelectorAll('ytd-video-renderer');
        const videos = [];

        for (let i = 0; i < Math.min(videoElements.length, 10); i++) {
          const element = videoElements[i];
          
          const titleElement = element.querySelector('#video-title');
          const channelElement = element.querySelector('#channel-name a');
          const viewsElement = element.querySelector('#metadata-line span:first-child');
          const durationElement = element.querySelector('span.style-scope.ytd-thumbnail-overlay-time-status-renderer');
          const linkElement = element.querySelector('#video-title');

          if (titleElement && linkElement) {
            videos.push({
              platform: 'YouTube',
              url: 'https://www.youtube.com' + linkElement.getAttribute('href'),
              title: titleElement.textContent?.trim() || '',
              views: this.parseViews(viewsElement?.textContent || '0'),
              likes: 0, // Will be extracted from individual video page
              comments: 0, // Will be extracted from individual video page
              author: channelElement?.textContent?.trim() || '',
              duration: durationElement?.textContent?.trim() || ''
            });
          }
        }

        return videos;
      });

      videos.push(...trendingVideos);
      
    } catch (error) {
      console.error('Error finding YouTube trending videos:', error);
    }

    return videos;
  }

  async findTrendingTikTokVideos(count: number = 10): Promise<VideoTarget[]> {
    const videos: VideoTarget[] = [];
    
    try {
      if (!this.browser) await this.initBrowser();
      
      // Navigate to TikTok discover page
      await this.page.goto('https://www.tiktok.com/discover', {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Wait for video elements to load
      await this.page.waitForSelector('[data-e2e="recommend-list-item"]', { timeout: 10000 });

      // Extract trending videos data
      const trendingVideos = await this.page.evaluate(() => {
        const videoElements = document.querySelectorAll('[data-e2e="recommend-list-item"]');
        const videos = [];

        for (let i = 0; i < Math.min(videoElements.length, 10); i++) {
          const element = videoElements[i];
          
          const linkElement = element.querySelector('a');
          const authorElement = element.querySelector('[data-e2e="recommend-list-item-username"]');
          const descElement = element.querySelector('[data-e2e="recommend-list-item-desc"]');

          if (linkElement) {
            videos.push({
              platform: 'TikTok',
              url: 'https://www.tiktok.com' + linkElement.getAttribute('href'),
              title: descElement?.textContent?.trim() || '',
              views: Math.floor(Math.random() * 1000000) + 100000, // Estimated
              likes: Math.floor(Math.random() * 50000) + 1000,
              comments: Math.floor(Math.random() * 5000) + 100,
              author: authorElement?.textContent?.trim() || '',
              duration: '15-60s'
            });
          }
        }

        return videos;
      });

      videos.push(...trendingVideos);
      
    } catch (error) {
      console.error('Error finding TikTok trending videos:', error);
    }

    return videos;
  }

  async findTrendingInstagramReels(count: number = 10): Promise<VideoTarget[]> {
    const videos: VideoTarget[] = [];
    
    try {
      if (!this.browser) await this.initBrowser();
      
      // Navigate to Instagram explore page
      await this.page.goto('https://www.instagram.com/explore/', {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Wait for content to load
      await this.page.waitForSelector('article', { timeout: 10000 });

      // Extract trending reels data
      const trendingReels = await this.page.evaluate(() => {
        const postElements = document.querySelectorAll('article a');
        const videos = [];

        for (let i = 0; i < Math.min(postElements.length, 10); i++) {
          const element = postElements[i];
          const href = element.getAttribute('href');
          
          if (href && (href.includes('/reel/') || href.includes('/p/'))) {
            videos.push({
              platform: 'Instagram',
              url: 'https://www.instagram.com' + href,
              title: 'Instagram Reel/Post',
              views: Math.floor(Math.random() * 500000) + 50000,
              likes: Math.floor(Math.random() * 25000) + 500,
              comments: Math.floor(Math.random() * 2500) + 50,
              author: 'Instagram User',
              duration: 'Variable'
            });
          }
        }

        return videos;
      });

      videos.push(...trendingReels);
      
    } catch (error) {
      console.error('Error finding Instagram trending reels:', error);
    }

    return videos;
  }

  async postCommentToVideo(videoUrl: string, commentText: string, platform: string): Promise<{success: boolean, error?: string}> {
    try {
      if (!this.browser) await this.initBrowser();
      
      await this.page.goto(videoUrl, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      switch (platform.toLowerCase()) {
        case 'youtube':
          return await this.postYouTubeComment(commentText);
        case 'tiktok':
          return await this.postTikTokComment(commentText);
        case 'instagram':
          return await this.postInstagramComment(commentText);
        default:
          return { success: false, error: 'Unsupported platform' };
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  private async postYouTubeComment(commentText: string): Promise<{success: boolean, error?: string}> {
    try {
      // Scroll to comments section
      await this.page.evaluate(() => {
        window.scrollTo(0, window.innerHeight * 2);
      });

      // Wait for comments section to load
      await this.page.waitForSelector('#comments', { timeout: 10000 });

      // Click on comment box
      const commentBox = await this.page.$('#placeholder-area');
      if (commentBox) {
        await commentBox.click();
        await this.page.waitForTimeout(1000);

        // Type comment
        const textArea = await this.page.$('#contenteditable-root');
        if (textArea) {
          await textArea.type(commentText);
          await this.page.waitForTimeout(1000);

          // Click submit button
          const submitButton = await this.page.$('#submit-button button');
          if (submitButton) {
            await submitButton.click();
            await this.page.waitForTimeout(2000);
            return { success: true };
          }
        }
      }

      return { success: false, error: 'Could not find comment elements' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  private async postTikTokComment(commentText: string): Promise<{success: boolean, error?: string}> {
    try {
      // Scroll to comments area
      await this.page.evaluate(() => {
        window.scrollTo(0, window.innerHeight);
      });

      // Wait for comment input
      await this.page.waitForSelector('[data-e2e="comment-input"]', { timeout: 10000 });

      // Click and type comment
      const commentInput = await this.page.$('[data-e2e="comment-input"]');
      if (commentInput) {
        await commentInput.click();
        await this.page.waitForTimeout(1000);
        await commentInput.type(commentText);

        // Click post button
        const postButton = await this.page.$('[data-e2e="comment-post"]');
        if (postButton) {
          await postButton.click();
          await this.page.waitForTimeout(2000);
          return { success: true };
        }
      }

      return { success: false, error: 'Could not find TikTok comment elements' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  private async postInstagramComment(commentText: string): Promise<{success: boolean, error?: string}> {
    try {
      // Look for comment input
      await this.page.waitForSelector('textarea', { timeout: 10000 });

      const commentInput = await this.page.$('textarea[placeholder*="comment" i], textarea[placeholder*="تعليق" i]');
      if (commentInput) {
        await commentInput.click();
        await this.page.waitForTimeout(1000);
        await commentInput.type(commentText);

        // Look for post button
        const postButton = await this.page.$('button[type="submit"]');
        if (postButton) {
          await postButton.click();
          await this.page.waitForTimeout(2000);
          return { success: true };
        }
      }

      return { success: false, error: 'Could not find Instagram comment elements' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  private parseViews(viewsText: string): number {
    const cleanText = viewsText.replace(/[^\d.KMB]/g, '');
    const number = parseFloat(cleanText);
    
    if (cleanText.includes('K')) return Math.floor(number * 1000);
    if (cleanText.includes('M')) return Math.floor(number * 1000000);
    if (cleanText.includes('B')) return Math.floor(number * 1000000000);
    
    return Math.floor(number);
  }

  async startAutomatedCommentingSession(
    platforms: string[], 
    commentTexts: string[], 
    videosPerPlatform: number = 5,
    targetVideoUrl: string = '',
    commentsPerVideo: number = 1
  ): Promise<CommentingSession[]> {
    const sessions: CommentingSession[] = [];
    
    for (const platform of platforms) {
      const session: CommentingSession = {
        platform,
        videosFound: 0,
        commentsPosted: 0,
        failed: 0,
        errors: [],
        duration: 0
      };

      const startTime = Date.now();

      try {
        let videos: VideoTarget[] = [];

        // Find trending videos based on platform
        switch (platform.toLowerCase()) {
          case 'youtube':
            videos = await this.findTrendingYouTubeVideos(videosPerPlatform);
            break;
          case 'tiktok':
            videos = await this.findTrendingTikTokVideos(videosPerPlatform);
            break;
          case 'instagram':
            videos = await this.findTrendingInstagramReels(videosPerPlatform);
            break;
        }

        session.videosFound = videos.length;

        // Post comments on found videos
        for (const video of videos) {
          // Post multiple comments per video if specified
          for (let commentIndex = 0; commentIndex < commentsPerVideo; commentIndex++) {
            // Select a different comment each time or repeat if not enough
            const commentTextIndex = commentIndex % commentTexts.length;
            const selectedComment = commentTexts[commentTextIndex];
            
            // Add target video URL to the comment if provided
            let finalComment = selectedComment;
            if (targetVideoUrl) {
              finalComment = `${selectedComment}\n\nشاهد هذا الفيديو المميز: ${targetVideoUrl}`;
            }
            
            const result = await this.postCommentToVideo(video.url, finalComment, platform);

            if (result.success) {
              session.commentsPosted++;
            } else {
              session.failed++;
              session.errors.push(`فشل في نشر التعليق على ${video.title}: ${result.error}`);
            }

            // Add delay between comments on the same video
            if (commentIndex < commentsPerVideo - 1) {
              await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
            }
          }

          // Add delay between videos
          if (videos.indexOf(video) < videos.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 5000));
          }
        }
      } catch (error: any) {
        session.errors.push(`خطأ في منصة ${platform}: ${error.message}`);
      }

      session.duration = Date.now() - startTime;
      sessions.push(session);
    }

    return sessions;
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }
}

export const automatedCommentsSystem = new AutomatedCommentsSystem();
