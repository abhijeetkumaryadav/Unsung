"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { ArrowLeft, Clock, Share2, Bookmark, ExternalLink, Check } from "lucide-react";
import { getTopStories, getLatestNews } from "../../lib/dataService";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";

interface ArticleData {
  id: string;
  title: string;
  category: string;
  time: string;
  image: string;
  link: string;
  externalLink?: string;
  description?: string;
  content?: string;
  author?: string;
  publishedAt?: string;
  language?: string;
  translations?: Record<string, { title: string; description: string }>;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ArticlePage({ params }: PageProps) {
  const { t, currentLanguage } = useLanguage();
  const { isDark } = useTheme();
  const router = useRouter();
  const resolvedParams = use(params);
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showSharePopup, setShowSharePopup] = useState(false);

  const darkBg = '#1a1a1a';
  const darkBorder = '#333333';
  const darkText = '#e8e8e8';
  const darkTextSecondary = '#a0a0a0';
  const darkTextMuted = '#888888';

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      try {
        const [top, latest] = await Promise.all([
          getTopStories(),
          getLatestNews()
        ]);
        
        const allArticles = [...top, ...latest];
        const found = allArticles.find(item => item.id === resolvedParams.id);
        
        if (found) {
          setArticle(found);
          const bookmarks = JSON.parse(localStorage.getItem('unsung_bookmarks') || '[]');
          setIsBookmarked(bookmarks.includes(found.id));
        } else {
          router.push('/');
        }
      } catch (error) {
        console.error("Error fetching article:", error);
        router.push('/');
      }
      setLoading(false);
    };

    fetchArticle();
  }, [resolvedParams.id, router]);

  useEffect(() => {
    const refetchArticle = async () => {
      try {
        const [top, latest] = await Promise.all([
          getTopStories(),
          getLatestNews()
        ]);
        
        const allArticles = [...top, ...latest];
        const found = allArticles.find(item => item.id === resolvedParams.id);
        
        if (found) {
          setArticle(found);
        }
      } catch (error) {
        console.error("Error refetching article:", error);
      }
    };

    if (resolvedParams.id) {
      refetchArticle();
    }
  }, [currentLanguage, resolvedParams.id]);

  const toggleBookmark = () => {
    if (!article) return;
    const bookmarks = JSON.parse(localStorage.getItem('unsung_bookmarks') || '[]');
    if (isBookmarked) {
      const newBookmarks = bookmarks.filter((id: string) => id !== article.id);
      localStorage.setItem('unsung_bookmarks', JSON.stringify(newBookmarks));
      setIsBookmarked(false);
    } else {
      bookmarks.push(article.id);
      localStorage.setItem('unsung_bookmarks', JSON.stringify(bookmarks));
      setIsBookmarked(true);
    }
  };

  const handleShare = () => {
    if (!article) return;
    const url = window.location.href;
    const text = t(article, 'title');
    
    if (navigator.share) {
      navigator.share({
        title: text,
        text: text,
        url: url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${text}\n${url}`).then(() => {
        setShowSharePopup(true);
        setTimeout(() => setShowSharePopup(false), 3000);
      }).catch(() => {
        setShowSharePopup(true);
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: isDark ? darkBg : '#f8fafc' }}>
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="w-8 h-8 border-4 border-slate-200 dark:border-[#333333] border-t-red-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-sm mt-4" style={{ color: isDark ? darkTextMuted : '#64748b' }}>Loading article...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: isDark ? darkBg : '#f8fafc' }}>
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h2 className="text-xl font-black" style={{ color: isDark ? darkText : '#0f172a' }}>Article not found</h2>
          <Link href="/" className="text-red-600 hover:underline mt-4 inline-block">Back to Home</Link>
        </div>
      </div>
    );
  }

  const rawContent = t(article, 'description') || '';
  const contentParagraphs = rawContent
    ? rawContent.split(/\n\n+|(?<=[।.!?])\s+(?=[A-Z\u0900-\u097F\u0980-\u09FF\u0A00-\u0A7F\u0A80-\u0AFF\u0B00-\u0B7F\u0B80-\u0BFF\u0C00-\u0C7F\u0C80-\u0CFF\u0D00-\u0D7F\u0D80-\u0DFF])/)
        .filter((p: string) => p.trim().length > 0)
    : [];

  return (
    <div className="min-h-screen flex flex-col justify-between transition-colors duration-300" style={{ backgroundColor: isDark ? darkBg : '#f8fafc', color: isDark ? darkText : '#0f172a' }}>
      <div>
        <Header />
        
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Navigation */}
          <button 
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-xs font-bold transition mb-6 group cursor-pointer"
            style={{ color: isDark ? darkTextMuted : '#64748b' }}
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            Back
          </button>

          {/* Article Header */}
          <div className="space-y-3">
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight transition-colors duration-300" style={{ color: isDark ? darkText : '#0f172a' }}>
              {t(article, 'title')}
            </h1>
            
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 pb-6 border-b transition-colors duration-300" style={{ borderColor: isDark ? darkBorder : '#e2e8f0' }}>
              <div className="flex items-center gap-3 text-xs font-medium transition-colors duration-300" style={{ color: isDark ? darkTextSecondary : '#64748b' }}>
                <span className="font-bold" style={{ color: isDark ? darkText : '#0f172a' }}>By {article.author || 'UNSUNG News'}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {article.time || 'Just now'}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleShare}
                  className="p-2 rounded-lg border transition cursor-pointer relative"
                  style={{ color: isDark ? darkTextMuted : '#64748b', borderColor: isDark ? darkBorder : '#e2e8f0', backgroundColor: 'transparent' }}
                  aria-label="Share article"
                >
                  <Share2 className="w-4 h-4" />
                  {showSharePopup && (
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap" style={{ backgroundColor: isDark ? '#333333' : '#1e293b' }}>
                      Link copied!
                    </span>
                  )}
                </button>
                <button 
                  onClick={toggleBookmark}
                  className={`p-2 rounded-lg border transition cursor-pointer ${
                    isBookmarked 
                      ? 'text-red-600 bg-red-50 border-red-200 hover:bg-red-100' 
                      : isDark
                        ? 'text-[#888888] border-[#333333] hover:text-red-400 hover:bg-red-900/20'
                        : 'text-slate-500 border-slate-200 hover:text-red-600 hover:bg-slate-100'
                  }`}
                  aria-label="Bookmark article"
                >
                  {isBookmarked ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                </button>
                {article.externalLink && (
                  <a 
                    href={article.externalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg border transition cursor-pointer"
                    style={{ color: isDark ? darkTextMuted : '#64748b', borderColor: isDark ? darkBorder : '#e2e8f0', backgroundColor: 'transparent' }}
                    title="View original source"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Featured Image */}
          <div className="my-6 aspect-video rounded-xl overflow-hidden border shadow-xs transition-colors duration-300" style={{ borderColor: isDark ? darkBorder : '#e2e8f0', backgroundColor: isDark ? '#2d2d2d' : '#f1f5f9' }}>
            <img 
              src={article.image} 
              alt={t(article, 'title')} 
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1504370805625-d32c54b16100?auto=format&fit=crop&q=80&w=1200";
              }}
            />
          </div>

          {/* Article Body */}
          <article className="max-w-none space-y-4 text-sm sm:text-base leading-relaxed font-normal transition-colors duration-300">
            {contentParagraphs.length > 0 ? (
              contentParagraphs.map((paragraph: string, index: number) => (
                <p key={index} style={{ color: isDark ? '#c8c8c8' : '#334155' }}>{paragraph}</p>
              ))
            ) : (
              <p style={{ color: isDark ? darkTextMuted : '#64748b' }}>No content available for this article.</p>
            )}
          </article>
          
        </main>
      </div>

      <Footer />
    </div>
  );
}