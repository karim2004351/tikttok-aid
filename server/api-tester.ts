export class APITester {
  
  // اختبار RapidAPI
  async testRapidAPI(): Promise<{ working: boolean, error?: string, data?: any }> {
    try {
      console.log('اختبار RapidAPI...');
      const response = await fetch('https://tiktok-scraper7.p.rapidapi.com/video/info', {
        method: 'POST',
        headers: {
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY!,
          'X-RapidAPI-Host': 'tiktok-scraper7.p.rapidapi.com',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: 'https://vm.tiktok.com/ZNdBP8PQL/' })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ RapidAPI يعمل بشكل صحيح');
        return { working: true, data };
      } else {
        const errorText = await response.text();
        console.log('❌ RapidAPI لا يعمل:', response.status, errorText);
        return { working: false, error: `${response.status}: ${errorText}` };
      }
    } catch (error) {
      console.log('❌ خطأ في RapidAPI:', error);
      return { working: false, error: error.message };
    }
  }

  // اختبار OpenAI
  async testOpenAI(): Promise<{ working: boolean, error?: string, data?: any }> {
    try {
      console.log('اختبار OpenAI...');
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: 'Hello' }],
          max_tokens: 5
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ OpenAI يعمل بشكل صحيح');
        return { working: true, data };
      } else {
        const errorText = await response.text();
        console.log('❌ OpenAI لا يعمل:', response.status, errorText);
        return { working: false, error: `${response.status}: ${errorText}` };
      }
    } catch (error) {
      console.log('❌ خطأ في OpenAI:', error);
      return { working: false, error: error.message };
    }
  }

  // اختبار DeepSeek
  async testDeepSeek(): Promise<{ working: boolean, error?: string, data?: any }> {
    try {
      console.log('اختبار DeepSeek...');
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: 'Hello' }],
          max_tokens: 5
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ DeepSeek يعمل بشكل صحيح');
        return { working: true, data };
      } else {
        const errorText = await response.text();
        console.log('❌ DeepSeek لا يعمل:', response.status, errorText);
        return { working: false, error: `${response.status}: ${errorText}` };
      }
    } catch (error) {
      console.log('❌ خطأ في DeepSeek:', error);
      return { working: false, error: error.message };
    }
  }

  // اختبار شامل لجميع APIs
  async testAllAPIs(): Promise<{
    rapidapi: { working: boolean, error?: string },
    openai: { working: boolean, error?: string },
    deepseek: { working: boolean, error?: string }
  }> {
    console.log('🔍 بدء اختبار جميع مفاتيح API...');

    const rapidapi = await this.testRapidAPI();
    const openai = await this.testOpenAI();
    const deepseek = await this.testDeepSeek();

    return {
      rapidapi: { working: rapidapi.working, error: rapidapi.error },
      openai: { working: openai.working, error: openai.error },
      deepseek: { working: deepseek.working, error: deepseek.error }
    };
  }
}

export const apiTester = new APITester();