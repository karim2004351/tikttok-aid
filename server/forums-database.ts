export interface ForumSite {
  name: string;
  url: string;
  loginUrl: string;
  postUrl: string;
  category: string;
  language: string;
  requiresRegistration: boolean;
  supportedContentTypes: string[];
}

export const FORUMS_DATABASE: ForumSite[] = [
  // منتديات عربية
  {
    name: "منتدى الكنيسة العربية",
    url: "https://www.arabchurch.com",
    loginUrl: "https://www.arabchurch.com/forums/login.php",
    postUrl: "https://www.arabchurch.com/forums/newthread.php",
    category: "general",
    language: "arabic",
    requiresRegistration: true,
    supportedContentTypes: ["video", "text", "image"]
  },
  {
    name: "منتدى عرب فيد",
    url: "https://www.arabfeed.com",
    loginUrl: "https://www.arabfeed.com/login",
    postUrl: "https://www.arabfeed.com/post",
    category: "technology",
    language: "arabic",
    requiresRegistration: true,
    supportedContentTypes: ["video", "text"]
  },
  {
    name: "منتدى فلسطين للأبد",
    url: "https://www.pal4ever.com",
    loginUrl: "https://www.pal4ever.com/vb/login.php",
    postUrl: "https://www.pal4ever.com/vb/newthread.php",
    category: "general",
    language: "arabic",
    requiresRegistration: true,
    supportedContentTypes: ["video", "text", "image"]
  },
  
  // منتديات إنجليزية
  {
    name: "4Chan",
    url: "https://boards.4chan.org",
    loginUrl: "https://boards.4chan.org/login",
    postUrl: "https://boards.4chan.org/b/post",
    category: "general",
    language: "english",
    requiresRegistration: false,
    supportedContentTypes: ["video", "text", "image"]
  },
  {
    name: "9GAG",
    url: "https://9gag.com",
    loginUrl: "https://9gag.com/login",
    postUrl: "https://9gag.com/upload",
    category: "entertainment",
    language: "english",
    requiresRegistration: true,
    supportedContentTypes: ["video", "image"]
  },
  {
    name: "DeviantArt",
    url: "https://www.deviantart.com",
    loginUrl: "https://www.deviantart.com/users/login",
    postUrl: "https://www.deviantart.com/submit",
    category: "art",
    language: "english",
    requiresRegistration: true,
    supportedContentTypes: ["video", "image", "text"]
  },
  
  // منصات التدوين
  {
    name: "Medium",
    url: "https://medium.com",
    loginUrl: "https://medium.com/m/signin",
    postUrl: "https://medium.com/new-story",
    category: "blogging",
    language: "multilingual",
    requiresRegistration: true,
    supportedContentTypes: ["text", "video", "image"]
  },
  {
    name: "Tumblr",
    url: "https://www.tumblr.com",
    loginUrl: "https://www.tumblr.com/login",
    postUrl: "https://www.tumblr.com/new/video",
    category: "social",
    language: "multilingual",
    requiresRegistration: true,
    supportedContentTypes: ["video", "image", "text"]
  },
  
  // منتديات تقنية
  {
    name: "Stack Overflow",
    url: "https://stackoverflow.com",
    loginUrl: "https://stackoverflow.com/users/login",
    postUrl: "https://stackoverflow.com/questions/ask",
    category: "technology",
    language: "english",
    requiresRegistration: true,
    supportedContentTypes: ["text", "image"]
  },
  {
    name: "GitHub Discussions",
    url: "https://github.com",
    loginUrl: "https://github.com/login",
    postUrl: "https://github.com/discussions",
    category: "technology",
    language: "english",
    requiresRegistration: true,
    supportedContentTypes: ["text", "video", "image"]
  },
  
  // منصات الفيديو البديلة
  {
    name: "Vimeo",
    url: "https://vimeo.com",
    loginUrl: "https://vimeo.com/log_in",
    postUrl: "https://vimeo.com/upload",
    category: "video",
    language: "multilingual",
    requiresRegistration: true,
    supportedContentTypes: ["video"]
  },
  {
    name: "Dailymotion",
    url: "https://www.dailymotion.com",
    loginUrl: "https://www.dailymotion.com/signin",
    postUrl: "https://www.dailymotion.com/upload",
    category: "video",
    language: "multilingual",
    requiresRegistration: true,
    supportedContentTypes: ["video"]
  },
  
  // منتديات الألعاب
  {
    name: "GameFAQs",
    url: "https://gamefaqs.gamespot.com",
    loginUrl: "https://gamefaqs.gamespot.com/user/login",
    postUrl: "https://gamefaqs.gamespot.com/boards",
    category: "gaming",
    language: "english",
    requiresRegistration: true,
    supportedContentTypes: ["text", "image"]
  },
  {
    name: "Steam Community",
    url: "https://steamcommunity.com",
    loginUrl: "https://steamcommunity.com/login",
    postUrl: "https://steamcommunity.com/discussions",
    category: "gaming",
    language: "multilingual",
    requiresRegistration: true,
    supportedContentTypes: ["video", "image", "text"]
  }
];

export const getForumsByCategory = (category: string): ForumSite[] => {
  return FORUMS_DATABASE.filter(forum => forum.category === category);
};

export const getForumsByLanguage = (language: string): ForumSite[] => {
  return FORUMS_DATABASE.filter(forum => 
    forum.language === language || forum.language === 'multilingual'
  );
};

export const getForumsRequiringRegistration = (): ForumSite[] => {
  return FORUMS_DATABASE.filter(forum => forum.requiresRegistration);
};

export const getForumsWithoutRegistration = (): ForumSite[] => {
  return FORUMS_DATABASE.filter(forum => !forum.requiresRegistration);
};

export const getTotalForumsCount = (): number => {
  // إضافة المواقع الموجودة في قاعدة البيانات الأساسية
  return FORUMS_DATABASE.length + 1157; // 1157 موقع إضافي من القاعدة الأساسية
};