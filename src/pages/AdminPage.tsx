import React, { useState, useEffect } from 'react';
import { RichTextEditor } from '../components/RichTextEditor';
import { BlogPost } from '../components/BlogPost';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Database } from '../lib/supabase';
import { 
  Save, 
  Send, 
  Edit, 
  Trash2, 
  Plus, 
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

type Post = Database['public']['Tables']['posts']['Row'];

export const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentPost, setCurrentPost] = useState<Partial<Post>>({
    title: '',
    content: '',
    excerpt: '',
    published: false,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user]);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('author_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handleSave = async (publish: boolean = false) => {
    if (!user || !currentPost.title || !currentPost.content) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const postData = {
        ...currentPost,
        author_id: user.id,
        published: publish,
      };

      let result;
      if (isEditing && currentPost.id) {
        result = await supabase
          .from('posts')
          .update(postData)
          .eq('id', currentPost.id)
          .select();
      } else {
        result = await supabase
          .from('posts')
          .insert([postData])
          .select();
      }

      if (result.error) throw result.error;

      setMessage({ 
        type: 'success', 
        text: publish ? 'Post published successfully!' : 'Post saved as draft!' 
      });

      await fetchPosts();
      
      if (publish) {
        setCurrentPost({ title: '', content: '', excerpt: '', published: false });
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error saving post:', error);
      setMessage({ type: 'error', text: 'Failed to save post' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (post: Post) => {
    setCurrentPost(post);
    setIsEditing(true);
    setShowPreview(false);
  };

  const handleDelete = async (postId: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Post deleted successfully!' });
      await fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      setMessage({ type: 'error', text: 'Failed to delete post' });
    }
  };

  const handleNewPost = () => {
    setCurrentPost({ title: '', content: '', excerpt: '', published: false });
    setIsEditing(false);
    setShowPreview(false);
  };

  const generateExcerpt = (content: string) => {
    const textOnly = content.replace(/<[^>]*>/g, '');
    return textOnly.length > 150 ? textOnly.substring(0, 150) + '...' : textOnly;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">Please sign in to access the admin panel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <button
            onClick={handleNewPost}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>New Post</span>
          </button>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${
            message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600" />
            )}
            <span className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}>
              {message.text}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Editor Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {isEditing ? 'Edit Post' : 'Create New Post'}
                </h2>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {showPreview ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  <span>{showPreview ? 'Hide Preview' : 'Show Preview'}</span>
                </button>
              </div>

              {!showPreview ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={currentPost.title || ''}
                      onChange={(e) => setCurrentPost({ ...currentPost, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter post title..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Excerpt (optional)
                    </label>
                    <textarea
                      value={currentPost.excerpt || ''}
                      onChange={(e) => setCurrentPost({ ...currentPost, excerpt: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Brief description of your post..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content *
                    </label>
                    <RichTextEditor
                      value={currentPost.content || ''}
                      onChange={(content) => setCurrentPost({ ...currentPost, content })}
                    />
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <button
                      onClick={() => handleSave(false)}
                      disabled={loading}
                      className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      <Save className="h-5 w-5" />
                      <span>Save Draft</span>
                    </button>
                    <button
                      onClick={() => handleSave(true)}
                      disabled={loading}
                      className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      <Send className="h-5 w-5" />
                      <span>Publish</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg p-4">
                  <BlogPost
                    title={currentPost.title || 'Untitled Post'}
                    content={currentPost.content || ''}
                    excerpt={currentPost.excerpt || generateExcerpt(currentPost.content || '')}
                    createdAt={currentPost.created_at || new Date().toISOString()}
                    isPreview={true}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Posts List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Posts</h2>
              
              {posts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No posts yet. Create your first post!
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <div
                      key={post.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-900 truncate">{post.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          post.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {post.published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {post.excerpt || generateExcerpt(post.content)}
                      </p>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(post)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};