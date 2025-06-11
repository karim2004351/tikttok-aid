import fetch from 'node-fetch';

export class FacebookAPITester {
  
  async testAccessToken(accessToken: string): Promise<{
    valid: boolean;
    userInfo?: any;
    pages?: any[];
    error?: string;
  }> {
    try {
      // اختبار صحة المفتاح والحصول على معلومات المستخدم
      const userResponse = await fetch(`https://graph.facebook.com/me?access_token=${accessToken}&fields=id,name,email`);
      
      if (!userResponse.ok) {
        const errorData = await userResponse.json() as any;
        return {
          valid: false,
          error: `Facebook API Error: ${errorData.error?.message || userResponse.statusText}`
        };
      }

      const userInfo = await userResponse.json();

      // الحصول على الصفحات المرتبطة بالحساب
      const pagesResponse = await fetch(`https://graph.facebook.com/me/accounts?access_token=${accessToken}&fields=id,name,access_token`);
      
      let pages: any[] = [];
      if (pagesResponse.ok) {
        const pagesData = await pagesResponse.json() as any;
        pages = pagesData.data || [];
      }

      return {
        valid: true,
        userInfo,
        pages
      };

    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async testPostToPage(accessToken: string, pageId: string, message: string): Promise<{
    success: boolean;
    postId?: string;
    error?: string;
  }> {
    try {
      const response = await fetch(`https://graph.facebook.com/${pageId}/feed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: message,
          access_token: accessToken
        })
      });

      if (!response.ok) {
        const errorData = await response.json() as any;
        return {
          success: false,
          error: `Facebook posting error: ${errorData.error?.message || response.statusText}`
        };
      }

      const data = await response.json() as any;
      
      return {
        success: true,
        postId: data.id
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Posting failed'
      };
    }
  }

  async testPostToProfile(accessToken: string, message: string): Promise<{
    success: boolean;
    postId?: string;
    error?: string;
  }> {
    try {
      const response = await fetch(`https://graph.facebook.com/me/feed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: message,
          access_token: accessToken
        })
      });

      if (!response.ok) {
        const errorData = await response.json() as any;
        return {
          success: false,
          error: `Facebook posting error: ${errorData.error?.message || response.statusText}`
        };
      }

      const data = await response.json() as any;
      
      return {
        success: true,
        postId: data.id
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Posting failed'
      };
    }
  }
}

export const facebookAPITester = new FacebookAPITester();