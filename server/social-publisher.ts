import puppeteer, { Browser, Page } from 'puppeteer';

export interface PublisherConfig {
  videoUrl: string;
  title: string;
  description?: string;
  tags?: string[];
}

export interface PublisherCredentials {
  username: string;
  password: string;
}

export abstract class SocialPublisher {
  protected browser: Browser | null = null;
  protected page: Page | null = null;

  abstract siteName: string;
  abstract loginUrl: string;
  abstract postUrl: string;

  async initialize(): Promise<void> {
    this.browser = await puppeteer.launch({
      headless: false, // للمراقبة المباشرة
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
    await this.page.setViewport({ width: 1366, height: 768 });
  }

  abstract login(credentials: PublisherCredentials): Promise<boolean>;
  abstract publishPost(config: PublisherConfig): Promise<string>;

  async cleanup(): Promise<void> {
    if (this.page) {
      await this.page.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
  }
}

export class FacebookPublisher extends SocialPublisher {
  siteName = 'Facebook';
  loginUrl = 'https://www.facebook.com/login';
  postUrl = 'https://www.facebook.com';

  async login(credentials: PublisherCredentials): Promise<boolean> {
    if (!this.page) throw new Error('Page not initialized');

    try {
      await this.page.goto(this.loginUrl, { waitUntil: 'networkidle2' });
      
      await this.page.waitForSelector('#email', { timeout: 10000 });
      await this.page.type('#email', credentials.username);
      await this.page.type('#pass', credentials.password);
      
      await this.page.click('[data-testid="royal_login_button"]');
      await this.page.waitForNavigation({ waitUntil: 'networkidle2' });
      
      const isLoggedIn = await this.page.url().includes('facebook.com') && 
                        !await this.page.url().includes('login');
      
      return isLoggedIn;
    } catch (error) {
      console.error('Facebook login error:', error);
      return false;
    }
  }

  async publishPost(config: PublisherConfig): Promise<string> {
    if (!this.page) throw new Error('Page not initialized');

    try {
      await this.page.goto(this.postUrl, { waitUntil: 'networkidle2' });
      
      await this.page.waitForSelector('[data-testid="status-attachment-mentions-input"]', { timeout: 10000 });
      
      const postContent = `${config.title}\n\n${config.videoUrl}`;
      await this.page.click('[data-testid="status-attachment-mentions-input"]');
      await this.page.type('[data-testid="status-attachment-mentions-input"]', postContent);
      
      await this.page.waitForSelector('[data-testid="react-composer-post-button"]', { timeout: 5000 });
      await this.page.click('[data-testid="react-composer-post-button"]');
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      return `https://facebook.com/post/${Date.now()}`;
    } catch (error) {
      console.error('Facebook publish error:', error);
      throw error;
    }
  }
}

export class TwitterPublisher extends SocialPublisher {
  siteName = 'Twitter';
  loginUrl = 'https://twitter.com/i/flow/login';
  postUrl = 'https://twitter.com/compose/tweet';

  async login(credentials: PublisherCredentials): Promise<boolean> {
    if (!this.page) throw new Error('Page not initialized');

    try {
      await this.page.goto(this.loginUrl, { waitUntil: 'networkidle2' });
      
      await this.page.waitForSelector('input[autocomplete="username"]', { timeout: 10000 });
      await this.page.type('input[autocomplete="username"]', credentials.username);
      
      await this.page.click('[role="button"]:has-text("Next")');
      
      await this.page.waitForSelector('input[autocomplete="current-password"]', { timeout: 10000 });
      await this.page.type('input[autocomplete="current-password"]', credentials.password);
      
      await this.page.click('[data-testid="LoginForm_Login_Button"]');
      await this.page.waitForNavigation({ waitUntil: 'networkidle2' });
      
      const isLoggedIn = await this.page.url().includes('home');
      return isLoggedIn;
    } catch (error) {
      console.error('Twitter login error:', error);
      return false;
    }
  }

  async publishPost(config: PublisherConfig): Promise<string> {
    if (!this.page) throw new Error('Page not initialized');

    try {
      await this.page.goto('https://twitter.com', { waitUntil: 'networkidle2' });
      
      await this.page.waitForSelector('[data-testid="tweetTextarea_0"]', { timeout: 10000 });
      
      const tweetContent = `${config.title}\n\n${config.videoUrl}`;
      await this.page.click('[data-testid="tweetTextarea_0"]');
      await this.page.type('[data-testid="tweetTextarea_0"]', tweetContent);
      
      await this.page.waitForSelector('[data-testid="tweetButton"]', { timeout: 5000 });
      await this.page.click('[data-testid="tweetButton"]');
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      return `https://twitter.com/tweet/${Date.now()}`;
    } catch (error) {
      console.error('Twitter publish error:', error);
      throw error;
    }
  }
}

export class PublisherFactory {
  static createPublisher(siteName: string): SocialPublisher {
    switch (siteName.toLowerCase()) {
      case 'facebook':
        return new FacebookPublisher();
      case 'twitter':
        return new TwitterPublisher();
      default:
        throw new Error(`Publisher not implemented for ${siteName}`);
    }
  }
}