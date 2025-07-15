import React, { useState } from 'react';
import { Calendar, Clock, Share2, ExternalLink, Copy, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PostCardProps {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  createdAt: string;
}

export const PostCard: React.FC<PostCardProps> = ({
  id,
  title,
  content,
  excerpt,
  createdAt,
}) => {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const readingTime = Math.ceil(words / wordsPerMinute);
    return `${readingTime} min read`;
  };

  const generateExcerpt = (content: string) => {
    const textOnly = content.replace(/<[^>]*>/g, '');
    return textOnly.length > 120 ? textOnly.substring(0, 120) + '...' : textOnly;
  };

  const postUrl = `${window.location.origin}/post/${id}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: excerpt || generateExcerpt(content),
          url: postUrl,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      setShowShareMenu(!showShareMenu);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setShowShareMenu(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <article className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:border-gray-200 transition-all duration-300 group">
      <div className="p-6">
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(createdAt)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{getReadingTime(content)}</span>
            </div>
          </div>
          
          <div className="relative">
            <button
              onClick={handleShare}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="Share post"
            >
              <Share2 className="h-4 w-4 text-gray-400 hover:text-blue-600" />
            </button>
            
            {showShareMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-10">
                <div className="text-sm text-gray-600 mb-2">Share this post</div>
                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded border">
                  <input
                    type="text"
                    value={postUrl}
                    readOnly
                    className="flex-1 bg-transparent text-sm text-gray-700 outline-none"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center space-x-1 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                  >
                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <Link to={`/post/${id}`} className="block group-hover:text-blue-600 transition-colors">
          <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
            {title}
          </h2>
        </Link>

        <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
          {excerpt || generateExcerpt(content)}
        </p>

        <Link
          to={`/post/${id}`}
          className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
        >
          <span>Read More</span>
          <ExternalLink className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
};