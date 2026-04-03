import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sun, Moon, Globe, MessageCircle, Send, X, 
  Instagram, Facebook, Send as Telegram, Phone as WhatsApp,
  Palette, Layout, Image as ImageIcon, GraduationCap, 
  Users, MessageSquare, Briefcase, Menu, ChevronRight,
  CheckCircle2, Sparkles, ArrowUpRight
} from 'lucide-react';
import { cn } from './lib/utils';
import { useFirebase } from './hooks/useFirebase';
import { db, auth } from './firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

// --- Translations ---
const translations = {
  ar: {
    name: "مهند محمد 🖌️",
    nav: {
      home: "الرئيسية",
      designServices: "خدمات التصميم",
      photography: "التصوير الفوتوغرافي",
      designPortfolio: "أعمال التصميم",
      learning: "التعلم",
      contact: "تواصل معنا"
    },
    hero: {
      welcome: "مرحباً بكم في عالم الإبداع",
      title: "مهند محمد - مصمم ومصور محترف",
      desc: "نجمع بين فن التصميم واحترافية التصوير لنقدم لك تجربة بصرية متكاملة وفريدة.",
      cta: "ابدأ مشروعك الآن"
    },
    designServices: {
      title: "خدماتنا الإبداعية في التصميم",
      items: [
        {
          title: "تصميم شعارات (Logo) باحترافية",
          desc: "نبتكر شعارات فريدة تعبر عن هوية مشروعك وتظل راسخة في أذهان عملائك، مع مراعاة قواعد التوازن والبساطة العالمية."
        },
        {
          title: "هويات بصرية تجارية باحترافية",
          desc: "تصميم هوية تجارية متكاملة تشمل الألوان، الخطوط، والمطبوعات الرسمية التي تمنح مشروعك طابعاً مؤسسياً موثوقاً."
        },
        {
          title: "تصميم سوشل ميديا",
          desc: "إعداد تصاميم جذابة لمنصات التواصل الاجتماعي (إنستقرام، فيسبوك، تويتر) تزيد من التفاعل وتبرز منتجاتك بشكل عصري."
        },
        {
          title: "تصميم تهنيات بجميع أنواعها",
          desc: "تصميم بطاقات تهنئة إبداعية للمناسبات الدينية والوطنية والخاصة، بلمسات فنية تعبر عن مشاعرك بأسلوب راقٍ."
        }
      ]
    },
    photographyServices: {
      title: "خدمات التصوير الفوتوغرافي",
      items: [
        {
          title: "تصوير المناسبات",
          desc: "تغطية كاملة واحترافية لجميع مناسباتكم بأحدث المعدات والتقنيات."
        },
        {
          title: "تصوير المنتجات",
          desc: "إظهار منتجاتك بأفضل صورة ممكنة لزيادة جاذبيتها ومبيعاتك."
        },
        {
          title: "جلسات التصوير (Photoshoot)",
          desc: "جلسات تصوير شخصية وخارجية بلمسة فنية فريدة تعبر عن شخصيتك."
        }
      ]
    },
    designPortfolio: {
      title: "أعمالنا في التصميم",
      logos: {
        title: "رسومات الشعارات (Logo Sketches)",
        desc: "هنا نعرض لكم المراحل الأولى لابتكار الشعار، من الفكرة المبدئية والرسومات اليدوية إلى النتيجة النهائية الرقمية."
      },
      posters: {
        title: "البوسترات العالمية (Global Posters)",
        desc: "مجموعة من التصاميم الإبداعية للبوسترات التي تتبع المعايير العالمية في التكوين البصري وتوزيع العناصر."
      },
      works: [
        { title: "شعار مجمع التميز", category: "رسومات شعارات", image: "https://picsum.photos/seed/sketch1/800/800" },
        { title: "بوستر إعلاني عالمي", category: "بوسترات عالمية", image: "https://picsum.photos/seed/poster1/800/800" },
        { title: "هوية تجارية فاخرة", category: "هوية بصرية", image: "https://picsum.photos/seed/identity1/800/800" },
        { title: "تهنئة عيد مبارك", category: "تصميم تهنيات", image: "https://picsum.photos/seed/eid1/800/800" }
      ]
    },
    photographyPortfolio: {
      title: "معرض التصوير الفوتوغرافي",
      viewAll: "عرض الكل",
      works: [
        {
          title: "تصوير مجمع التميز الصناعي",
          client: "مجمع التميز الصناعي",
          category: "تصوير منشآت",
          image: "https://picsum.photos/seed/photography1/800/800"
        },
        {
          title: "جلسة تصوير خارجية",
          client: "موديل طبيعي",
          category: "بورتريه",
          image: "https://picsum.photos/seed/photography2/800/800"
        }
      ]
    },
    learning: {
      title: "تعلم التصميم",
      step1: "فهم الفكرة والجمهور المستهدف",
      step2: "البحث والاستلهام من التصاميم العالمية",
      step3: "الرسم المبدئي (Sketching)",
      step4: "التنفيذ الرقمي باستخدام البرامج الاحترافية",
      tips: "نصيحة: البساطة هي مفتاح النجاح في تصميم الشعارات."
    },
    stats: {
      visitors: "زائر",
      comments: "تعليق",
      projects: "مشروع"
    },
    chat: {
      title: "الدردشة المباشرة",
      placeholder: "اكتب رسالتك هنا...",
      adminStatus: "حالة المشرف",
      lastSeen: "آخر ظهور",
      online: "متصل الآن",
      offline: "غير متصل",
      admin: "المشرف"
    },
    comments: {
      title: "آراء العملاء",
      namePlaceholder: "اسمك الكريم",
      commentPlaceholder: "اكتب تعليقك هنا...",
      submit: "إرسال التعليق",
      error: "يرجى كتابة الاسم والتعليق"
    },
    footer: "جميع الحقوق محفوظة لدى مهند محمد © 2026"
  },
  en: {
    name: "Muhanad Muhammed 🖌️",
    nav: {
      home: "Home",
      designServices: "Design Services",
      photography: "Photography",
      designPortfolio: "Design Portfolio",
      learning: "Learning",
      contact: "Contact"
    },
    hero: {
      welcome: "Welcome to the World of Creativity",
      title: "Muhanad Muhammed - Designer & Photographer",
      desc: "We combine the art of design with the professionalism of photography to provide you with an integrated and unique visual experience.",
      cta: "Start Your Project Now"
    },
    designServices: {
      title: "Our Creative Design Services",
      items: [
        {
          title: "Professional Logo Design",
          desc: "We create unique logos that express your project's identity and remain fixed in your customers' minds, considering global balance and simplicity rules."
        },
        {
          title: "Professional Commercial Visual Identity",
          desc: "Designing an integrated commercial identity including colors, fonts, and official prints that give your project a reliable institutional character."
        },
        {
          title: "Social Media Design",
          desc: "Preparing attractive designs for social media platforms (Instagram, Facebook, Twitter) that increase interaction and highlight your products modernly."
        },
        {
          title: "All Types of Greeting Designs",
          desc: "Designing creative greeting cards for religious, national, and special occasions, with artistic touches that express your feelings elegantly."
        }
      ]
    },
    photographyServices: {
      title: "Photography Services",
      items: [
        {
          title: "Event Photography",
          desc: "Full and professional coverage for all your events with the latest equipment and techniques."
        },
        {
          title: "Product Photography",
          desc: "Showing your products in the best possible way to increase their attractiveness and sales."
        },
        {
          title: "Photoshoots",
          desc: "Personal and outdoor photography sessions with a unique artistic touch that expresses your personality."
        }
      ]
    },
    designPortfolio: {
      title: "Our Design Works",
      logos: {
        title: "Logo Sketches",
        desc: "Here we show you the first stages of creating a logo, from the initial idea and hand sketches to the final digital result."
      },
      posters: {
        title: "Global Posters",
        desc: "A collection of creative poster designs that follow global standards in visual composition and element distribution."
      },
      works: [
        { title: "Al-Tamayuz Logo", category: "Logo Sketches", image: "https://picsum.photos/seed/sketch1/800/800" },
        { title: "Global Ad Poster", category: "Global Posters", image: "https://picsum.photos/seed/poster1/800/800" },
        { title: "Luxury Identity", category: "Visual Identity", image: "https://picsum.photos/seed/identity1/800/800" },
        { title: "Eid Mubarak Greeting", category: "Greetings", image: "https://picsum.photos/seed/eid1/800/800" }
      ]
    },
    photographyPortfolio: {
      title: "Photography Gallery",
      viewAll: "View All",
      works: [
        {
          title: "Al-Tamayuz Complex Shoot",
          client: "Al-Tamayuz Industrial Complex",
          category: "Facility Photography",
          image: "https://picsum.photos/seed/photography1/800/800"
        },
        {
          title: "Outdoor Photoshoot",
          client: "Natural Model",
          category: "Portrait",
          image: "https://picsum.photos/seed/photography2/800/800"
        }
      ]
    },
    learning: {
      title: "Learn Design",
      step1: "Understand the idea and target audience",
      step2: "Research and inspiration from global designs",
      step3: "Initial Sketching",
      step4: "Digital execution using professional software",
      tips: "Tip: Simplicity is the key to success in logo design."
    },
    stats: {
      visitors: "Visitors",
      comments: "Comments",
      projects: "Projects"
    },
    chat: {
      title: "Live Chat",
      placeholder: "Type your message...",
      adminStatus: "Admin Status",
      lastSeen: "Last seen",
      online: "Online",
      offline: "Offline",
      admin: "Admin"
    },
    comments: {
      title: "Client Reviews",
      namePlaceholder: "Your Name",
      commentPlaceholder: "Type your comment...",
      submit: "Submit Comment",
      error: "Please enter name and comment"
    },
    footer: "All Rights Reserved to Muhanad Muhammed © 2026"
  }
};

export default function App() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatName, setChatName] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [commentName, setCommentName] = useState('');
  const [commentInput, setCommentInput] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const { stats, chatMessages, comments, adminStatus, sendMessage, addComment } = useFirebase();
  const t = translations[lang];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isChatOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatOpen]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  const toggleLang = () => setLang(prev => prev === 'ar' ? 'en' : 'ar');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !chatName.trim()) return;
    const isAdmin = auth.currentUser?.email === "muhaned76995@gmail.com";
    sendMessage(chatInput, chatName, isAdmin);
    setChatInput('');
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !commentName.trim()) return;
    addComment(commentInput, commentName);
    setCommentInput('');
    setCommentName('');
  };

  const handleAdminLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const formatLastSeen = (date: any) => {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return formatDistanceToNow(d, { addSuffix: true, locale: lang === 'ar' ? ar : enUS });
  };

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-500 font-sans",
      theme === 'dark' ? "bg-[#050505] text-white" : "bg-gray-50 text-gray-900",
      lang === 'ar' ? "rtl" : "ltr"
    )}>
      {/* --- Glow Effects --- */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full" />
      </div>

      {/* --- Header --- */}
      <header className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300 px-6 py-4 flex items-center justify-between",
        isScrolled ? "bg-black/80 backdrop-blur-md border-b border-white/10" : "bg-transparent"
      )}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Palette className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">{t.name}</h1>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          {Object.entries(t.nav).map(([key, value]) => (
            <a key={key} href={`#${key}`} className="text-sm font-medium hover:text-purple-500 transition-colors">
              {value}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
            <Users className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-mono">{stats.visitorCount}</span>
          </div>
          <button onClick={toggleTheme} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button onClick={toggleLang} className="p-2 hover:bg-white/10 rounded-full transition-colors flex items-center gap-1">
            <Globe className="w-5 h-5" />
            <span className="text-xs font-bold">{lang.toUpperCase()}</span>
          </button>
          <button onClick={() => setIsChatOpen(true)} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full text-sm font-bold transition-all shadow-lg shadow-purple-500/20 flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">{lang === 'ar' ? "دردشة" : "Chat"}</span>
          </button>
        </div>
      </header>

      {/* --- Hero Section --- */}
      <section id="home" className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-sm font-medium mb-8"
        >
          <Sparkles className="w-4 h-4" />
          {t.hero.welcome}
        </motion.div>
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl font-black mb-6 leading-tight"
        >
          {t.hero.title}
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg text-gray-400 max-w-2xl mb-10"
        >
          {t.hero.desc}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:scale-105 transition-transform shadow-xl shadow-purple-500/20 flex items-center gap-2">
            {t.hero.cta}
            <ArrowUpRight className="w-5 h-5" />
          </button>
          <button className="bg-white/5 border border-white/10 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white/10 transition-colors">
            {t.photographyPortfolio.viewAll}
          </button>
        </motion.div>
      </section>

      {/* --- Stats Section --- */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: t.stats.visitors, value: stats.visitorCount, icon: Users, color: "text-blue-500" },
            { label: t.stats.comments, value: stats.commentCount, icon: MessageSquare, color: "text-purple-500" },
            { label: t.stats.projects, value: stats.projectCount, icon: Briefcase, color: "text-pink-500" }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/5 border border-white/10 p-8 rounded-3xl text-center flex flex-col items-center"
            >
              <stat.icon className={cn("w-10 h-10 mb-4", stat.color)} />
              <div className="text-4xl font-black mb-2">{stat.value}</div>
              <div className="text-gray-400 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- Design Services Section --- */}
      <section id="designServices" className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black mb-4">{t.designServices.title}</h2>
          <div className="w-20 h-1.5 bg-gradient-to-r from-purple-600 to-blue-600 mx-auto rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {t.designServices.items.map((service, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-all hover:-translate-y-2"
            >
              <div className="w-14 h-14 bg-purple-600/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {i === 0 ? <Palette className="w-8 h-8 text-purple-500" /> : 
                 i === 1 ? <Layout className="w-8 h-8 text-purple-500" /> :
                 i === 2 ? <MessageSquare className="w-8 h-8 text-purple-500" /> :
                 <Sparkles className="w-8 h-8 text-purple-500" />}
              </div>
              <h3 className="text-xl font-bold mb-4">{service.title}</h3>
              <p className="text-gray-400 leading-relaxed text-sm">{service.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- Photography Services Section --- */}
      <section id="photography" className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black mb-4">{t.photographyServices.title}</h2>
          <div className="w-20 h-1.5 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {t.photographyServices.items.map((service, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-all hover:-translate-y-2"
            >
              <div className="w-14 h-14 bg-blue-600/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {i === 0 ? <Users className="w-8 h-8 text-blue-500" /> : 
                 i === 1 ? <ImageIcon className="w-8 h-8 text-blue-500" /> :
                 <Layout className="w-8 h-8 text-blue-500" />}
              </div>
              <h3 className="text-xl font-bold mb-4">{service.title}</h3>
              <p className="text-gray-400 leading-relaxed text-sm">{service.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- Design Portfolio Section --- */}
      <section id="designPortfolio" className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black mb-4">{t.designPortfolio.title}</h2>
          <div className="w-20 h-1.5 bg-gradient-to-r from-purple-600 to-blue-600 mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <div className="bg-white/5 border border-white/10 p-8 rounded-[32px]">
            <h3 className="text-2xl font-bold mb-4 text-purple-400">{t.designPortfolio.logos.title}</h3>
            <p className="text-gray-400 mb-6 leading-relaxed">{t.designPortfolio.logos.desc}</p>
            <div className="aspect-video rounded-2xl overflow-hidden">
              <img src="https://picsum.photos/seed/sketch-demo/800/450" className="w-full h-full object-cover" alt="Sketches" referrerPolicy="no-referrer" />
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 p-8 rounded-[32px]">
            <h3 className="text-2xl font-bold mb-4 text-blue-400">{t.designPortfolio.posters.title}</h3>
            <p className="text-gray-400 mb-6 leading-relaxed">{t.designPortfolio.posters.desc}</p>
            <div className="aspect-video rounded-2xl overflow-hidden">
              <img src="https://picsum.photos/seed/poster-demo/800/450" className="w-full h-full object-cover" alt="Posters" referrerPolicy="no-referrer" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {t.designPortfolio.works.map((work, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="aspect-square bg-white/5 rounded-3xl overflow-hidden relative group cursor-pointer border border-white/5"
            >
              <img 
                src={work.image} 
                alt={work.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-8">
                <span className="text-purple-400 text-xs font-bold mb-2 uppercase tracking-widest">{work.category}</span>
                <h4 className="text-xl font-bold text-white mb-1">{work.title}</h4>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- Photography Portfolio Section --- */}
      <section id="photographyPortfolio" className="py-20 px-6 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-16">
          <div>
            <h2 className="text-4xl font-black mb-4">{t.photographyPortfolio.title}</h2>
            <div className="w-20 h-1.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {t.photographyPortfolio.works.map((work, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="aspect-video bg-white/5 rounded-3xl overflow-hidden relative group cursor-pointer border border-white/5"
            >
              <img 
                src={work.image} 
                alt={work.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-8">
                <span className="text-blue-400 text-xs font-bold mb-2 uppercase tracking-widest">{work.category}</span>
                <h4 className="text-xl font-bold text-white mb-1">{work.title}</h4>
                <p className="text-gray-400 text-sm">{work.client}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- Learning Section --- */}
      <section id="learning" className="py-20 px-6 max-w-7xl mx-auto bg-white/5 rounded-[40px] border border-white/10 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-10 opacity-10">
          <GraduationCap className="w-64 h-64" />
        </div>
        <div className="relative z-10">
          <h2 className="text-4xl font-black mb-12 text-center">{t.learning.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8">
              {[t.learning.step1, t.learning.step2, t.learning.step3, t.learning.step4].map((step, i) => (
                <div key={i} className="flex gap-6">
                  <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold mb-2">{step}</h4>
                    <p className="text-gray-400 text-sm">خطوة أساسية للوصول إلى نتيجة احترافية ومميزة.</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-purple-600/10 border border-purple-600/20 p-8 rounded-3xl flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-6">
                <CheckCircle2 className="w-8 h-8 text-purple-500" />
                <h4 className="text-2xl font-bold text-purple-400">{lang === 'ar' ? "نصيحة ذهبية" : "Golden Tip"}</h4>
              </div>
              <p className="text-xl font-medium leading-relaxed italic">
                "{t.learning.tips}"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- Comments Section --- */}
      <section className="py-20 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black mb-4">{t.comments.title}</h2>
          <div className="w-20 h-1.5 bg-gradient-to-r from-purple-600 to-blue-600 mx-auto rounded-full" />
        </div>

        <form onSubmit={handleAddComment} className="bg-white/5 border border-white/10 p-8 rounded-3xl mb-12">
          <div className="grid grid-cols-1 gap-6">
            <input 
              type="text" 
              placeholder={t.comments.namePlaceholder}
              value={commentName}
              onChange={(e) => setCommentName(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-purple-500 transition-colors"
              required
            />
            <textarea 
              placeholder={t.comments.commentPlaceholder}
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-purple-500 transition-colors min-h-[120px]"
              required
            />
            <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-all">
              {t.comments.submit}
            </button>
          </div>
        </form>

        <div className="space-y-6">
          {comments.map((comment) => (
            <motion.div 
              key={comment.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="bg-white/5 border border-white/10 p-6 rounded-2xl"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-purple-400">{comment.userName}</h4>
                <span className="text-xs text-gray-500">
                  {comment.timestamp && formatDistanceToNow(comment.timestamp.toDate(), { addSuffix: true, locale: lang === 'ar' ? ar : enUS })}
                </span>
              </div>
              <p className="text-gray-300">{comment.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="py-12 px-6 border-t border-white/10 text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
            <Palette className="text-white w-5 h-5" />
          </div>
          <h1 className="text-lg font-bold">{t.name}</h1>
        </div>
        <p className="text-gray-500 text-sm mb-8">{t.footer}</p>
        <div className="flex justify-center gap-6 mb-8">
          {[
            { icon: WhatsApp, url: "https://wa.me/967780321342", color: "hover:text-green-500" },
            { icon: Facebook, url: "https://www.facebook.com/profile.php?id=61573565738936", color: "hover:text-blue-600" },
            { icon: Instagram, url: "https://instagram.com/MUHANAD_MUHAMMED76995", color: "hover:text-pink-500" },
            { icon: Telegram, url: "https://t.me/muhaned566", color: "hover:text-blue-400" }
          ].map((social, i) => (
            <a key={i} href={social.url} target="_blank" rel="noopener noreferrer" className={cn("text-gray-400 transition-colors", social.color)}>
              <social.icon className="w-6 h-6" />
            </a>
          ))}
        </div>
        <button 
          onClick={handleAdminLogin}
          className="text-[10px] text-gray-700 hover:text-gray-500 transition-colors uppercase tracking-widest"
        >
          {auth.currentUser?.email === "muhaned76995@gmail.com" ? "Admin Mode Active" : "Admin Login"}
        </button>
      </footer>

      {/* --- Floating Contact Icons --- */}
      <div className={cn(
        "fixed bottom-8 z-40 flex flex-col gap-4",
        lang === 'ar' ? "left-8" : "right-8"
      )}>
        {[
          { icon: WhatsApp, url: "https://wa.me/967780321342", bg: "bg-green-500" },
          { icon: Telegram, url: "https://t.me/muhaned566", bg: "bg-blue-400" }
        ].map((item, i) => (
          <a 
            key={i} 
            href={item.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className={cn("w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl hover:scale-110 transition-transform", item.bg)}
          >
            <item.icon className="w-7 h-7" />
          </a>
        ))}
      </div>

      {/* --- Chat Modal --- */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#0f0f0f] border border-white/10 w-full max-w-lg h-[600px] rounded-[32px] flex flex-col overflow-hidden shadow-2xl"
            >
              {/* Chat Header */}
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                      <Palette className="w-6 h-6 text-white" />
                    </div>
                    <div className={cn(
                      "absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#0f0f0f]",
                      adminStatus?.isOnline ? "bg-green-500" : "bg-gray-500"
                    )} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{t.chat.title}</h3>
                    <p className="text-xs text-gray-400">
                      {adminStatus?.isOnline ? t.chat.online : `${t.chat.lastSeen} ${formatLastSeen(adminStatus?.lastSeen)}`}
                    </p>
                  </div>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={cn(
                    "flex flex-col max-w-[80%]",
                    msg.uid === auth.currentUser?.uid ? "self-end items-end" : "self-start items-start"
                  )}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{msg.senderName}</span>
                      {msg.isAdmin && <span className="bg-purple-600 text-[8px] px-1.5 py-0.5 rounded text-white font-black uppercase">{t.chat.admin}</span>}
                    </div>
                    <div className={cn(
                      "px-4 py-2.5 rounded-2xl text-sm",
                      msg.uid === auth.currentUser?.uid 
                        ? "bg-purple-600 text-white rounded-tr-none" 
                        : "bg-white/10 text-white rounded-tl-none"
                    )}>
                      {msg.text}
                    </div>
                    <span className="text-[9px] text-gray-600 mt-1">
                      {msg.timestamp && formatDistanceToNow(msg.timestamp.toDate(), { addSuffix: true, locale: lang === 'ar' ? ar : enUS })}
                    </span>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="p-6 bg-white/5 border-t border-white/10">
                {!chatName && (
                  <input 
                    type="text" 
                    placeholder={t.comments.namePlaceholder}
                    value={chatName}
                    onChange={(e) => setChatName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 mb-4 outline-none focus:border-purple-500 text-sm"
                    required
                  />
                )}
                {chatName && (
                  <div className="flex gap-3">
                    <input 
                      type="text" 
                      placeholder={t.chat.placeholder}
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-purple-500 text-sm"
                      required
                    />
                    <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-lg shadow-purple-500/20">
                      <Send className={cn("w-5 h-5", lang === 'ar' && "rotate-180")} />
                    </button>
                  </div>
                )}
                {!chatName && <p className="text-[10px] text-center text-gray-500 mt-2">يرجى إدخال اسمك للبدء في الدردشة</p>}
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
