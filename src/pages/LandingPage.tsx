import React, { useState, useEffect } from 'react';
import { PostCard } from '../components/PostCard';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/supabase';
import { Search, Filter, PenSquare } from 'lucide-react';

type Post = Database['public']['Tables']['posts']['Row'];

export const LandingPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts
    .filter(post => 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.excerpt && post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            {/* Hero skeleton */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-16 mb-12">
              <div className="text-center">
                <div className="h-12 bg-blue-500 rounded w-1/2 mx-auto mb-6"></div>
                <div className="h-6 bg-blue-400 rounded w-2/3 mx-auto"></div>
              </div>
            </div>
            
            {/* Search skeleton */}
            <div className="flex gap-4 mb-8">
              <div className="flex-1 h-12 bg-gray-200 rounded-lg"></div>
              <div className="w-40 h-12 bg-gray-200 rounded-lg"></div>
            </div>
            
            {/* Posts grid skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-3">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="space-y-2 mb-4">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-2xl p-16 mb-12">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <PenSquare className="h-16 w-16 text-blue-200 mr-4" />
              <h1 className="text-5xl md:text-6xl font-bold">
                BlogHub
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              Discover insights, stories, and ideas from our community of writers
            </p>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Posts Grid */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-16">
            <PenSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <div className="text-gray-500 text-lg mb-2">
              {searchTerm ? 'No posts found matching your search.' : 'No posts available yet.'}
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-blue-600 hover:text-blue-700 transition-colors"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Latest Posts
                {searchTerm && (
                  <span className="text-lg font-normal text-gray-600 ml-2">
                    ({filteredPosts.length} result{filteredPosts.length !== 1 ? 's' : ''} for "{searchTerm}")
                  </span>
                )}
              </h2>
              <div className="text-sm text-gray-500">
                {filteredPosts.length} post{filteredPosts.length !== 1 ? 's' : ''}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <PostCard
                  key={post.id}
                  id={post.id}
                  title={post.title}
                  content={post.content}
                  excerpt={post.excerpt}
                  createdAt={post.created_at}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};