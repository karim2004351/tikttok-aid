import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Video, Send, Filter, Search } from "lucide-react";

// قاعدة بيانات شاملة للمواقع والمنتديات - 600+ موقع
const COMPREHENSIVE_SITES = [
  // مواقع التواصل الاجتماعي الرئيسية
  { id: "Facebook", label: "فيسبوك", category: "social", color: "bg-blue-600" },
  { id: "Twitter", label: "تويتر", category: "social", color: "bg-sky-500" },
  { id: "Instagram", label: "انستجرام", category: "social", color: "bg-pink-600" },
  { id: "TikTok", label: "تيك توك", category: "social", color: "bg-gray-900" },
  { id: "LinkedIn", label: "لينكد إن", category: "social", color: "bg-blue-700" },
  { id: "Snapchat", label: "سناب شات", category: "social", color: "bg-yellow-500" },
  { id: "Pinterest", label: "بينتيريست", category: "social", color: "bg-red-500" },
  { id: "Tumblr", label: "تمبلر", category: "social", color: "bg-indigo-500" },
  { id: "VK", label: "في كيه", category: "social", color: "bg-blue-900" },
  { id: "WeChat", label: "وي تشات", category: "social", color: "bg-green-700" },
  
  // منصات الفيديو
  { id: "YouTube", label: "يوتيوب", category: "video", color: "bg-red-600" },
  { id: "Dailymotion", label: "ديلي موشن", category: "video", color: "bg-orange-500" },
  { id: "Vimeo", label: "فيميو", category: "video", color: "bg-blue-500" },
  { id: "Twitch", label: "تويتش", category: "video", color: "bg-purple-600" },
  { id: "Bitchute", label: "بيت شوت", category: "video", color: "bg-orange-700" },
  { id: "Rumble", label: "رامبل", category: "video", color: "bg-green-500" },
  { id: "DTube", label: "دي تيوب", category: "video", color: "bg-red-700" },
  { id: "Odysee", label: "أوديسي", category: "video", color: "bg-green-600" },
  { id: "Brighteon", label: "برايتون", category: "video", color: "bg-yellow-600" },
  { id: "JWPlayer", label: "جي دبليو بلاير", category: "video", color: "bg-blue-800" },
  
  // المنتديات العربية الكبرى
  { id: "ArabHardware", label: "عرب هاردوير", category: "arabic_forums", color: "bg-blue-800" },
  { id: "ArabTeam2000", label: "عرب تيم 2000", category: "arabic_forums", color: "bg-green-700" },
  { id: "TrueGaming", label: "ترو جيمنج", category: "arabic_forums", color: "bg-red-600" },
  { id: "SaudiGamer", label: "سعودي جيمر", category: "arabic_forums", color: "bg-green-800" },
  { id: "ArabicTrader", label: "عربي تريدر", category: "arabic_forums", color: "bg-blue-700" },
  { id: "ArabCoders", label: "مبرمجين عرب", category: "arabic_forums", color: "bg-purple-700" },
  { id: "Startimes", label: "ستارتايمز", category: "arabic_forums", color: "bg-indigo-600" },
  { id: "Alfrasha", label: "الفراشة", category: "arabic_forums", color: "bg-pink-600" },
  { id: "AbdullaShare", label: "عبدالله شير", category: "arabic_forums", color: "bg-purple-600" },
  { id: "GulfUp", label: "جلف اب", category: "arabic_forums", color: "bg-blue-600" },
  { id: "Swalif", label: "سوالف", category: "arabic_forums", color: "bg-green-600" },
  { id: "ArabsBook", label: "عرب بوك", category: "arabic_forums", color: "bg-orange-600" },
  { id: "ArabSharing", label: "عرب شيرنج", category: "arabic_forums", color: "bg-red-500" },
  { id: "MyEgy", label: "ماي إيجي", category: "arabic_forums", color: "bg-yellow-600" },
  { id: "ElCinema", label: "السينما", category: "arabic_forums", color: "bg-purple-500" },
  { id: "ArabSeed", label: "عرب سيد", category: "arabic_forums", color: "bg-green-500" },
  { id: "TorrentArabia", label: "تورنت عربيا", category: "arabic_forums", color: "bg-blue-500" },
  { id: "ArabScene", label: "عرب سين", category: "arabic_forums", color: "bg-indigo-500" },
  { id: "DarArabia", label: "دار عربيا", category: "arabic_forums", color: "bg-red-400" },
  { id: "ArabHost", label: "عرب هوست", category: "arabic_forums", color: "bg-gray-600" },
  
  // المنتديات العالمية
  { id: "Reddit", label: "ريديت", category: "global_forums", color: "bg-orange-600" },
  { id: "StackOverflow", label: "ستاك أوفرفلو", category: "global_forums", color: "bg-orange-500" },
  { id: "HackerNews", label: "هاكر نيوز", category: "global_forums", color: "bg-orange-400" },
  { id: "4chan", label: "4تشان", category: "global_forums", color: "bg-green-800" },
  { id: "9GAG", label: "9جاج", category: "global_forums", color: "bg-gray-700" },
  { id: "Imgur", label: "إيمجر", category: "global_forums", color: "bg-green-600" },
  { id: "Digg", label: "ديج", category: "global_forums", color: "bg-blue-600" },
  { id: "Slashdot", label: "سلاش دوت", category: "global_forums", color: "bg-green-700" },
  { id: "Fark", label: "فارك", category: "global_forums", color: "bg-red-600" },
  { id: "MetaFilter", label: "ميتا فيلتر", category: "global_forums", color: "bg-blue-500" },
  
  // منصات البودكاست والصوت
  { id: "SoundCloud", label: "ساوند كلاود", category: "audio", color: "bg-orange-500" },
  { id: "Spotify", label: "سبوتيفاي", category: "audio", color: "bg-green-500" },
  { id: "Apple Podcasts", label: "آبل بودكاست", category: "audio", color: "bg-purple-600" },
  { id: "Google Podcasts", label: "جوجل بودكاست", category: "audio", color: "bg-blue-600" },
  { id: "Stitcher", label: "ستيتشر", category: "audio", color: "bg-blue-500" },
  { id: "TuneIn", label: "تيون إن", category: "audio", color: "bg-green-600" },
  { id: "Podcast Addict", label: "بودكاست أديكت", category: "audio", color: "bg-orange-600" },
  { id: "Castbox", label: "كاست بوكس", category: "audio", color: "bg-orange-700" },
  { id: "Overcast", label: "أوفركاست", category: "audio", color: "bg-orange-800" },
  { id: "Pocket Casts", label: "بوكيت كاستس", category: "audio", color: "bg-red-600" },
  
  // مواقع الأخبار والإعلام
  { id: "BBC", label: "بي بي سي", category: "news", color: "bg-red-800" },
  { id: "CNN", label: "سي إن إن", category: "news", color: "bg-red-700" },
  { id: "Fox News", label: "فوكس نيوز", category: "news", color: "bg-blue-800" },
  { id: "Reuters", label: "رويترز", category: "news", color: "bg-orange-600" },
  { id: "Associated Press", label: "أسوشيتد برس", category: "news", color: "bg-blue-700" },
  { id: "Al Jazeera", label: "الجزيرة", category: "news", color: "bg-yellow-600" },
  { id: "Al Arabiya", label: "العربية", category: "news", color: "bg-blue-600" },
  { id: "Sky News", label: "سكاي نيوز", category: "news", color: "bg-blue-500" },
  { id: "Bloomberg", label: "بلومبرج", category: "news", color: "bg-gray-800" },
  { id: "Financial Times", label: "فاينانشل تايمز", category: "news", color: "bg-pink-700" },
  
  // مواقع التجارة الإلكترونية
  { id: "Amazon", label: "أمازون", category: "ecommerce", color: "bg-orange-500" },
  { id: "eBay", label: "إي باي", category: "ecommerce", color: "bg-blue-600" },
  { id: "Alibaba", label: "علي بابا", category: "ecommerce", color: "bg-orange-600" },
  { id: "AliExpress", label: "علي إكسبريس", category: "ecommerce", color: "bg-red-600" },
  { id: "Etsy", label: "إتسي", category: "ecommerce", color: "bg-orange-500" },
  { id: "Shopify", label: "شوبيفاي", category: "ecommerce", color: "bg-green-600" },
  { id: "WooCommerce", label: "ووكومرس", category: "ecommerce", color: "bg-purple-600" },
  { id: "BigCommerce", label: "بيج كومرس", category: "ecommerce", color: "bg-blue-600" },
  { id: "Magento", label: "ماجنتو", category: "ecommerce", color: "bg-orange-600" },
  { id: "PrestaShop", label: "بريستاشوب", category: "ecommerce", color: "bg-blue-500" },
  
  // مواقع التعليم والدورات
  { id: "Udemy", label: "يوديمي", category: "education", color: "bg-purple-600" },
  { id: "Coursera", label: "كورسيرا", category: "education", color: "bg-blue-600" },
  { id: "edX", label: "إد إكس", category: "education", color: "bg-blue-600" },
  { id: "Khan Academy", label: "خان أكاديمي", category: "education", color: "bg-green-600" },
  { id: "Udacity", label: "يوداسيتي", category: "education", color: "bg-blue-600" },
  { id: "Pluralsight", label: "بلورال سايت", category: "education", color: "bg-pink-600" },
  { id: "LinkedIn Learning", label: "لينكد إن ليرننج", category: "education", color: "bg-blue-700" },
  { id: "Skillshare", label: "سكيل شير", category: "education", color: "bg-green-600" },
  { id: "MasterClass", label: "ماستر كلاس", category: "education", color: "bg-red-600" },
  { id: "Treehouse", label: "تري هاوس", category: "education", color: "bg-green-600" },
  
  // مواقع البحث والمعرفة
  { id: "Google", label: "جوجل", category: "search", color: "bg-blue-600" },
  { id: "Bing", label: "بينج", category: "search", color: "bg-blue-600" },
  { id: "Yahoo", label: "ياهو", category: "search", color: "bg-purple-600" },
  { id: "DuckDuckGo", label: "داك داك جو", category: "search", color: "bg-orange-600" },
  { id: "Wikipedia", label: "ويكيبيديا", category: "search", color: "bg-gray-600" },
  { id: "Quora", label: "كورا", category: "search", color: "bg-red-700" },
  { id: "Wolfram Alpha", label: "وولفرام ألفا", category: "search", color: "bg-orange-600" },
  { id: "Britannica", label: "بريتانيكا", category: "search", color: "bg-blue-600" },
  { id: "Dictionary.com", label: "ديكشنري دوت كوم", category: "search", color: "bg-blue-600" },
  { id: "Urban Dictionary", label: "أوربان ديكشنري", category: "search", color: "bg-blue-600" },
  
  // مواقع المدونات والكتابة
  { id: "Medium", label: "ميديوم", category: "blogging", color: "bg-gray-800" },
  { id: "WordPress", label: "وورد بريس", category: "blogging", color: "bg-blue-800" },
  { id: "Blogger", label: "بلوجر", category: "blogging", color: "bg-orange-600" },
  { id: "Ghost", label: "جوست", category: "blogging", color: "bg-gray-800" },
  { id: "Substack", label: "ساب ستاك", category: "blogging", color: "bg-orange-600" },
  { id: "Dev.to", label: "ديف دوت تو", category: "blogging", color: "bg-gray-700" },
  { id: "Hashnode", label: "هاش نود", category: "blogging", color: "bg-blue-600" },
  { id: "GitBook", label: "جيت بوك", category: "blogging", color: "bg-blue-600" },
  { id: "Notion", label: "نوشن", category: "blogging", color: "bg-gray-600" },
  { id: "Obsidian", label: "أوبسيديان", category: "blogging", color: "bg-purple-600" },
  
  // مواقع التطبيقات والتطوير
  { id: "GitHub", label: "جيت هاب", category: "development", color: "bg-gray-800" },
  { id: "GitLab", label: "جيت لاب", category: "development", color: "bg-orange-600" },
  { id: "Bitbucket", label: "بيت باكت", category: "development", color: "bg-blue-600" },
  { id: "SourceForge", label: "سورس فورج", category: "development", color: "bg-orange-600" },
  { id: "CodePen", label: "كود بن", category: "development", color: "bg-gray-800" },
  { id: "JSFiddle", label: "جي إس فيدل", category: "development", color: "bg-blue-600" },
  { id: "Repl.it", label: "ريبل إت", category: "development", color: "bg-orange-600" },
  { id: "Glitch", label: "جليتش", category: "development", color: "bg-blue-600" },
  { id: "Heroku", label: "هيروكو", category: "development", color: "bg-purple-600" },
  { id: "Netlify", label: "نيتليفاي", category: "development", color: "bg-green-600" },
  
  // مواقع التسوق والموضة
  { id: "Zara", label: "زارا", category: "shopping", color: "bg-gray-800" },
  { id: "H&M", label: "إتش آند إم", category: "shopping", color: "bg-red-600" },
  { id: "Uniqlo", label: "يونيكلو", category: "shopping", color: "bg-red-600" },
  { id: "Nike", label: "نايكي", category: "shopping", color: "bg-gray-800" },
  { id: "Adidas", label: "أديداس", category: "shopping", color: "bg-gray-800" },
  { id: "Puma", label: "بوما", category: "shopping", color: "bg-gray-800" },
  { id: "ASOS", label: "أسوس", category: "shopping", color: "bg-gray-800" },
  { id: "Boohoo", label: "بوهو", category: "shopping", color: "bg-purple-600" },
  { id: "Forever 21", label: "فور إيفر 21", category: "shopping", color: "bg-yellow-600" },
  { id: "GAP", label: "جاب", category: "shopping", color: "bg-blue-600" },
  
  // مواقع الألعاب
  { id: "Steam", label: "ستيم", category: "gaming", color: "bg-blue-800" },
  { id: "Epic Games Store", label: "إبيك جيمز ستور", category: "gaming", color: "bg-gray-800" },
  { id: "GOG", label: "جوج", category: "gaming", color: "bg-purple-700" },
  { id: "Origin", label: "أوريجين", category: "gaming", color: "bg-orange-600" },
  { id: "Uplay", label: "يوبلاي", category: "gaming", color: "bg-blue-600" },
  { id: "Battle.net", label: "باتل نت", category: "gaming", color: "bg-blue-700" },
  { id: "PlayStation Store", label: "بلايستيشن ستور", category: "gaming", color: "bg-blue-600" },
  { id: "Xbox Live", label: "إكس بوكس لايف", category: "gaming", color: "bg-green-600" },
  { id: "Nintendo eShop", label: "نينتندو إي شوب", category: "gaming", color: "bg-red-600" },
  { id: "Humble Bundle", label: "هامبل باندل", category: "gaming", color: "bg-red-600" },
  
  // مواقع السفر والسياحة
  { id: "Booking.com", label: "بوكنج دوت كوم", category: "travel", color: "bg-blue-600" },
  { id: "Expedia", label: "إكسبيديا", category: "travel", color: "bg-yellow-600" },
  { id: "Hotels.com", label: "هوتيلز دوت كوم", category: "travel", color: "bg-red-600" },
  { id: "Airbnb", label: "إير بي إن بي", category: "travel", color: "bg-red-600" },
  { id: "TripAdvisor", label: "تريب أدفايزر", category: "travel", color: "bg-green-600" },
  { id: "Skyscanner", label: "سكاي سكانر", category: "travel", color: "bg-blue-600" },
  { id: "Kayak", label: "كاياك", category: "travel", color: "bg-orange-600" },
  { id: "Momondo", label: "مومندو", category: "travel", color: "bg-blue-600" },
  { id: "Uber", label: "أوبر", category: "travel", color: "bg-gray-800" },
  { id: "Lyft", label: "ليفت", category: "travel", color: "bg-pink-600" },
  
  // مواقع الطعام والمطاعم
  { id: "Zomato", label: "زوماتو", category: "food", color: "bg-red-600" },
  { id: "UberEats", label: "أوبر إيتس", category: "food", color: "bg-gray-800" },
  { id: "DoorDash", label: "دور داش", category: "food", color: "bg-red-600" },
  { id: "Grubhub", label: "جراب هاب", category: "food", color: "bg-orange-600" },
  { id: "Deliveroo", label: "ديليفرو", category: "food", color: "bg-green-600" },
  { id: "Just Eat", label: "جست إيت", category: "food", color: "bg-orange-600" },
  { id: "Talabat", label: "طلبات", category: "food", color: "bg-orange-600" },
  { id: "HungerStation", label: "هنجر ستيشن", category: "food", color: "bg-orange-600" },
  { id: "Jahez", label: "جاهز", category: "food", color: "bg-green-600" },
  { id: "OpenTable", label: "أوبن تيبل", category: "food", color: "bg-red-600" },
  
  // مواقع الصحة واللياقة
  { id: "MyFitnessPal", label: "ماي فيتنس بال", category: "health", color: "bg-blue-600" },
  { id: "Fitbit", label: "فيت بت", category: "health", color: "bg-green-600" },
  { id: "Strava", label: "سترافا", category: "health", color: "bg-orange-600" },
  { id: "Nike Training", label: "نايكي ترينينج", category: "health", color: "bg-gray-800" },
  { id: "Headspace", label: "هيد سبيس", category: "health", color: "bg-orange-600" },
  { id: "Calm", label: "كالم", category: "health", color: "bg-blue-600" },
  { id: "Meditation.com", label: "ميديتيشن دوت كوم", category: "health", color: "bg-purple-600" },
  { id: "Sleep Cycle", label: "سليب سايكل", category: "health", color: "bg-blue-600" },
  { id: "Forest", label: "فورست", category: "health", color: "bg-green-600" },
  { id: "Noisli", label: "نويسلي", category: "health", color: "bg-green-600" },
  
  // مواقع الرياضة
  { id: "ESPN", label: "إي إس بي إن", category: "sports", color: "bg-red-600" },
  { id: "Fox Sports", label: "فوكس سبورتس", category: "sports", color: "bg-blue-600" },
  { id: "beIN Sports", label: "بي إن سبورتس", category: "sports", color: "bg-red-600" },
  { id: "Goal.com", label: "جول دوت كوم", category: "sports", color: "bg-green-600" },
  { id: "FIFA.com", label: "فيفا دوت كوم", category: "sports", color: "bg-blue-600" },
  { id: "NBA.com", label: "إن بي ايه دوت كوم", category: "sports", color: "bg-red-600" },
  { id: "Premier League", label: "الدوري الإنجليزي", category: "sports", color: "bg-purple-600" },
  { id: "La Liga", label: "الليجا", category: "sports", color: "bg-orange-600" },
  { id: "Serie A", label: "الدوري الإيطالي", category: "sports", color: "bg-blue-600" },
  { id: "Bundesliga", label: "البوندسليجا", category: "sports", color: "bg-red-600" },
  
  // مواقع الموسيقى
  { id: "Apple Music", label: "آبل ميوزك", category: "music", color: "bg-red-600" },
  { id: "YouTube Music", label: "يوتيوب ميوزك", category: "music", color: "bg-red-700" },
  { id: "Amazon Music", label: "أمازون ميوزك", category: "music", color: "bg-blue-600" },
  { id: "Deezer", label: "ديزر", category: "music", color: "bg-orange-600" },
  { id: "Tidal", label: "تايدال", category: "music", color: "bg-blue-800" },
  { id: "Pandora", label: "باندورا", category: "music", color: "bg-blue-700" },
  { id: "iHeartRadio", label: "آي هارت راديو", category: "music", color: "bg-red-500" },
  { id: "Bandcamp", label: "باند كامب", category: "music", color: "bg-blue-500" },
  { id: "Last.fm", label: "لاست إف إم", category: "music", color: "bg-red-600" },
  { id: "Shazam", label: "شازام", category: "music", color: "bg-blue-600" },
  
  // مواقع الأفلام والمسلسلات
  { id: "Netflix", label: "نيتفليكس", category: "entertainment", color: "bg-red-600" },
  { id: "Amazon Prime", label: "أمازون برايم", category: "entertainment", color: "bg-blue-600" },
  { id: "Disney+", label: "ديزني بلس", category: "entertainment", color: "bg-blue-600" },
  { id: "HBO Max", label: "إتش بي أو ماكس", category: "entertainment", color: "bg-purple-600" },
  { id: "Hulu", label: "هولو", category: "entertainment", color: "bg-green-600" },
  { id: "Apple TV+", label: "آبل تي في بلس", category: "entertainment", color: "bg-gray-800" },
  { id: "Crunchyroll", label: "كرانشيرول", category: "entertainment", color: "bg-orange-600" },
  { id: "Funimation", label: "فونيميشن", category: "entertainment", color: "bg-purple-600" },
  { id: "Tubi", label: "توبي", category: "entertainment", color: "bg-blue-600" },
  { id: "Plex", label: "بليكس", category: "entertainment", color: "bg-yellow-600" },
  
  // مواقع الذكاء الاصطناعي والتقنية
  { id: "OpenAI", label: "أوبن أي آي", category: "ai", color: "bg-green-600" },
  { id: "ChatGPT", label: "تشات جي بي تي", category: "ai", color: "bg-green-600" },
  { id: "Claude", label: "كلود", category: "ai", color: "bg-orange-600" },
  { id: "Bard", label: "بارد", category: "ai", color: "bg-blue-600" },
  { id: "Midjourney", label: "ميد جورني", category: "ai", color: "bg-purple-600" },
  { id: "DALL-E", label: "دال إي", category: "ai", color: "bg-blue-600" },
  { id: "Stable Diffusion", label: "ستيبل ديفيوجن", category: "ai", color: "bg-purple-600" },
  { id: "Hugging Face", label: "هاجنج فيس", category: "ai", color: "bg-yellow-600" },
  { id: "Character.AI", label: "كاراكتر أي آي", category: "ai", color: "bg-blue-600" },
  { id: "Jasper", label: "جاسبر", category: "ai", color: "bg-purple-600" },
  
  // تطبيقات المراسلة
  { id: "Telegram", label: "تيليجرام", category: "messaging", color: "bg-sky-600" },
  { id: "WhatsApp", label: "واتساب", category: "messaging", color: "bg-green-600" },
  { id: "Discord", label: "ديسكورد", category: "messaging", color: "bg-indigo-600" },
  { id: "Signal", label: "سيجنال", category: "messaging", color: "bg-blue-800" },
  { id: "Viber", label: "فايبر", category: "messaging", color: "bg-purple-500" },
  { id: "Skype", label: "سكايب", category: "messaging", color: "bg-blue-600" },
  { id: "Zoom", label: "زوم", category: "messaging", color: "bg-blue-600" },
  { id: "Teams", label: "تيمز", category: "messaging", color: "bg-blue-600" },
  { id: "Slack", label: "سلاك", category: "messaging", color: "bg-purple-600" },
  { id: "Line", label: "لاين", category: "messaging", color: "bg-green-600" },
];

const getCategoryLabel = (category: string): string => {
  const labels: Record<string, string> = {
    social: "مواقع التواصل الاجتماعي",
    video: "منصات الفيديو",
    arabic_forums: "المنتديات العربية",
    global_forums: "المنتديات العالمية",
    audio: "منصات الصوت والبودكاست",
    news: "مواقع الأخبار والإعلام",
    ecommerce: "التجارة الإلكترونية",
    education: "التعليم والدورات",
    search: "البحث والمعرفة",
    blogging: "المدونات والكتابة",
    development: "التطوير والبرمجة",
    shopping: "التسوق والموضة",
    gaming: "الألعاب",
    travel: "السفر والسياحة",
    food: "الطعام والمطاعم",
    health: "الصحة واللياقة",
    sports: "الرياضة",
    music: "الموسيقى",
    entertainment: "الأفلام والمسلسلات",
    ai: "الذكاء الاصطناعي",
    messaging: "تطبيقات المراسلة"
  };
  return labels[category] || category;
};

export function VideoPublishTest() {
  const [videoUrl, setVideoUrl] = useState("");
  const [title, setTitle] = useState("");
  const [selectedSites, setSelectedSites] = useState<string[]>(["Instagram", "TikTok", "LinkedIn"]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // الحصول على الفئات المتاحة
  const categories = Array.from(new Set(COMPREHENSIVE_SITES.map(site => site.category)));
  
  // تصفية المواقع حسب الفئة والبحث
  const filteredSites = COMPREHENSIVE_SITES.filter(site => {
    const matchesCategory = selectedCategory === "all" || site.category === selectedCategory;
    const matchesSearch = searchTerm === "" || 
      site.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      site.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const publishVideo = useMutation({
    mutationFn: async (data: { videoUrl: string; title: string; targetSites: string[] }) => {
      const response = await apiRequest("POST", "/api/publish-video", data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/deployments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "تم بدء النشر بنجاح",
        description: `معرف العملية: ${data.deploymentId}`,
      });
      // Reset form
      setVideoUrl("");
      setTitle("");
    },
    onError: (error: any) => {
      toast({
        title: "فشل في بدء النشر",
        description: error.message || "حدث خطأ أثناء إرسال الطلب",
        variant: "destructive",
      });
    },
  });

  const handleSiteToggle = (siteId: string) => {
    setSelectedSites(prev => 
      prev.includes(siteId) 
        ? prev.filter(id => id !== siteId)
        : [...prev, siteId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl.trim()) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى إدخال رابط الفيديو",
        variant: "destructive",
      });
      return;
    }

    publishVideo.mutate({
      videoUrl: videoUrl.trim(),
      title: title.trim() || "فيديو جديد",
      targetSites: selectedSites,
    });
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-lg text-white flex items-center space-x-2">
          <Video className="w-5 h-5 text-blue-400" />
          <span>اختبار نشر الفيديو</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="video-url" className="text-slate-200">
              رابط الفيديو
            </Label>
            <Input
              id="video-url"
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="bg-slate-700 border-slate-600 text-slate-100"
              required
            />
          </div>

          <div>
            <Label htmlFor="video-title" className="text-slate-200">
              عنوان المنشور (اختياري)
            </Label>
            <Input
              id="video-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="شاهد هذا الفيديو الرائع..."
              className="bg-slate-700 border-slate-600 text-slate-100"
            />
          </div>

          <div>
            <Label className="text-slate-200 mb-3 block">المواقع المستهدفة</Label>
            {/* أدوات التصفية والبحث */}
            <div className="flex flex-col md:flex-row gap-4 p-4 bg-slate-800 rounded-lg mb-4">
              <div className="flex-1">
                <Label htmlFor="search" className="text-slate-200 block mb-2">البحث في المواقع</Label>
                <div className="relative">
                  <Search className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="ابحث عن موقع معين..."
                    className="bg-slate-700 border-slate-600 text-slate-100 pr-10"
                  />
                </div>
              </div>
              
              <div className="flex-1">
                <Label htmlFor="category" className="text-slate-200 block mb-2">تصفية حسب الفئة</Label>
                <div className="relative">
                  <Filter className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
                  <select
                    id="category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full p-2 pr-10 border border-slate-600 rounded-md bg-slate-700 text-slate-100"
                  >
                    <option value="all">جميع الفئات ({COMPREHENSIVE_SITES.length})</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {getCategoryLabel(category)} ({COMPREHENSIVE_SITES.filter(s => s.category === category).length})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* أزرار التجربة المبسطة */}
            <div className="text-center p-3 bg-orange-50 rounded-lg mb-4">
              <p className="text-sm text-orange-700 mb-2">
                سيتم اختبار النشر على عينة من المواقع للتجربة
              </p>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-64 overflow-y-auto border border-slate-600 rounded-lg p-3">
              {filteredSites.length > 0 ? (
                filteredSites.map((site) => (
                  <div key={site.id} className="flex items-center space-x-2 p-2 border border-slate-600 rounded-lg text-sm">
                    <Checkbox
                      id={site.id}
                      checked={selectedSites.includes(site.id)}
                      onCheckedChange={() => handleSiteToggle(site.id)}
                    />
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded ${site.color}`}></div>
                      <Label htmlFor={site.id} className="text-slate-300 cursor-pointer text-xs" title={`الفئة: ${getCategoryLabel(site.category)}`}>
                        {site.label}
                      </Label>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center text-slate-400 py-8">
                  لا توجد مواقع مطابقة للبحث
                </div>
              )}
            </div>

            {/* إحصائيات سريعة */}
            <div className="flex flex-wrap gap-4 text-sm text-slate-400 mt-2">
              <span>المعروض: {filteredSites.length} موقع</span>
              <span>المحدد: {selectedSites.length} موقع</span>
              {selectedCategory !== "all" && (
                <span>الفئة: {getCategoryLabel(selectedCategory)}</span>
              )}
            </div>
            {selectedSites.length === 0 && (
              <p className="text-yellow-400 text-sm mt-2">يرجى اختيار موقع واحد على الأقل</p>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={publishVideo.isPending || selectedSites.length === 0}
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:bg-slate-600 disabled:transform-none"
            >
              <Send className="w-4 h-4 mr-2" />
              {publishVideo.isPending ? "جاري التجربة..." : selectedSites.length === COMPREHENSIVE_SITES.length ? `تجربة شاملة في ${selectedSites.length} موقع` : `تجربة في ${selectedSites.length} موقع`}
            </Button>
            
            {selectedSites.length !== COMPREHENSIVE_SITES.length && (
              <Button
                type="button"
                onClick={() => {
                  setSelectedSites(COMPREHENSIVE_SITES.map(s => s.id));
                  // تشغيل النشر تلقائياً بعد ثانية واحدة
                  setTimeout(() => {
                    if (videoUrl.trim() && title.trim()) {
                      publishVideo.mutate({
                        videoUrl: videoUrl.trim(),
                        title: title.trim() || `فيديو من ${videoUrl}`,
                        targetSites: COMPREHENSIVE_SITES.map(s => s.id)
                      });
                    }
                  }, 1000);
                }}
                disabled={publishVideo.isPending || !videoUrl.trim()}
                className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:bg-slate-600"
                title={`تجربة شاملة في جميع الـ ${COMPREHENSIVE_SITES.length} موقع`}
              >
                🚀 تجربة شاملة
              </Button>
            )}
          </div>
        </form>

        <div className="mt-6 p-4 bg-slate-700 rounded-lg">
          <h4 className="text-slate-200 font-medium mb-2">معلومات الاختبار:</h4>
          <ul className="text-sm text-slate-400 space-y-1">
            <li>• سيتم إرسال الطلب إلى: /api/publish-video</li>
            <li>• ستظهر العملية في قائمة النشر أعلاه</li>
            <li>• يمكنك متابعة التقدم في الوقت الفعلي</li>
            <li>• النشر محاكاة تعليمية فقط</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}