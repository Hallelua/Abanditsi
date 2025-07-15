import React from 'react';
import { Calendar, Clock } from 'lucide-react';

interface BlogPostProps {
  title: string;
  content: string;
  excerpt?: string;
  createdAt: string;
  isPreview?: boolean;
}

export const BlogPost: React.FC<BlogPostProps> = ({
  title,
  content,
  excerpt,
  createdAt,
  isPreview = false,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const readingTime = Math.ceil(words / wordsPerMinute);
    return `${readingTime} min read`;
  };

  return (
    <article className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 ${isPreview ? 'border-2 border-blue-200' : ''}`}>
      <div className="p-6">
        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(createdAt)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{getReadingTime(content)}</span>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors">
          {title}
        </h2>

        {excerpt && (
          <p className="text-gray-600 mb-4 leading-relaxed">
            {excerpt}
          </p>
        )}

        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </article>
  );
};