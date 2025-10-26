import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import CreatePost from '../../components/post/CreatePost';
import PostCard from '../../components/post/PostCard';
import { SkeletonCard } from '../../components/common/Skeleton';
import { useToast } from '../../components/common/ToastContainer';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [recommendedUsers, setRecommendedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }

    setUser(JSON.parse(userData));
    fetchPosts();
    fetchRecommendedUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - run only once on mount

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/post/all`, {
        credentials: 'include' // Send cookies
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.posts) {
        setPosts(data.posts);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      toast.error('Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendedUsers = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/recommended`, {
        credentials: 'include' // Send cookies
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.users) {
        setRecommendedUsers(data.users);
      }
    } catch (error) {
      console.log('Failed to fetch recommended users:', error);
    }
  };

  const handleLike = async (postId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/post/${postId}/like`, {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.post) {
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post._id === postId ? data.post : post
          )
        );
      }
    } catch (error) {
      console.error('Failed to like post:', error);
      toast.error('Failed to like post');
    }
  };

  const handleComment = async (postId, text) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/post/${postId}/comment`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.post) {
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post._id === postId ? data.post : post
          )
        );
      }
    } catch (error) {
      console.error('Failed to comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const handleDelete = async (postId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/post/${postId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.message) {
        setPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
        toast.success('Post deleted successfully');
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
      toast.error('Failed to delete post');
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };

  return (
    <div className="home-page">
      <Sidebar user={user} recommendedUsers={recommendedUsers} />
      
      <main className="home-main">
        <div className="home-content">
          <CreatePost user={user} onPostCreated={handlePostCreated} />
          
          <div className="posts-feed">
            {loading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : posts.length === 0 ? (
              <div className="empty-state">
                <h3>No posts yet</h3>
                <p>Be the first to create a post!</p>
              </div>
            ) : (
              posts.map(post => (
                <PostCard
                  key={post._id}
                  post={post}
                  currentUser={user}
                  onLike={handleLike}
                  onDelete={handleDelete}
                  onComment={handleComment}
                />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
