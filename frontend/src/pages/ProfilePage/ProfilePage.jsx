import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IoPersonAddOutline, IoPersonRemoveOutline, IoChatbubbleOutline } from 'react-icons/io5';
import Sidebar from '../../components/layout/Sidebar';
import PostCard from '../../components/post/PostCard';
import { SkeletonCard, SkeletonAvatar, SkeletonText } from '../../components/common/Skeleton';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import { useToast } from '../../components/common/ToastContainer';
import './ProfilePage.css';

const ProfilePage = () => {
  const { id } = useParams(); // User ID from URL
  const navigate = useNavigate();
  const toast = useToast();
  
  const [currentUser, setCurrentUser] = useState(null);
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [recommendedUsers, setRecommendedUsers] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentUser();
    fetchProfile();
    fetchRecommendedUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, navigate]);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/me`, {
        credentials: 'include'
      });

      if (!response.ok) {
        navigate('/login');
        return;
      }

      const data = await response.json();
      if (data.user) {
        setCurrentUser(data.user);
      }
    } catch (err) {
      console.error('Failed to fetch current user:', err);
      navigate('/login');
    }
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      // Fetch user profile with posts
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/user/${id}`,
        {
          credentials: 'include'
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.user) {
        setProfileUser(data.user);
        setPosts(data.user.posts || []);
        
        // Check if current user is following this profile
        if (currentUser && data.user.followers) {
          setIsFollowing(data.user.followers.some(
            f => f._id === currentUser._id
          ));
        }
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      toast.error('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendedUsers = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/recommended`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();
      if (data.users) {
        setRecommendedUsers(data.users);
      }
    } catch (err) {
      console.log('Failed to fetch recommended users:', err);
    }
  };

  const handleFollow = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/user/${id}/follow`,
        {
          method: 'POST',
          credentials: 'include'
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      
      const data = await response.json();
      
      setIsFollowing(!isFollowing);
      toast.success(data.message || (isFollowing ? 'Unfollowed successfully' : 'Following successfully'));
      
      // Refresh profile to get updated follower count
      fetchProfile();
    } catch (error) {
      console.error('Failed to update follow status:', error);
      toast.error('Failed to update follow status');
    }
  };

  const handleChatClick = () => {
    navigate(`/chat/${id}`);
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
      
      // Update the post in the list
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post._id === postId 
            ? { ...post, likes: data.liked ? [...post.likes, currentUser._id] : post.likes.filter(id => id !== currentUser._id) }
            : post
        )
      );
      
      toast.success(data.message);
    } catch (error) {
      console.error('Failed to like post:', error);
      toast.error('Failed to like post');
    }
  };

  const handleComment = async (postId, comment) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/post/${postId}/comment`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ comment })
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();
      
      // Update the post with new comments
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post._id === postId 
            ? { ...post, comments: data.comments }
            : post
        )
      );
      
      toast.success(data.message);
    } catch (error) {
      console.error('Failed to comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/post/${postId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();
      setPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
      toast.success(data.message || 'Post deleted successfully');
    } catch (error) {
      console.error('Failed to delete post:', error);
      toast.error('Failed to delete post');
    }
  };

  const isOwnProfile = currentUser?._id === id;

  return (
    <div className="profile-page">
      <Sidebar user={currentUser} recommendedUsers={recommendedUsers} />
      
      <main className="profile-main">
        <div className="profile-content">
          {loading ? (
            <>
              <div className="profile-header-skeleton">
                <div className="profile-banner-skeleton skeleton" />
                <SkeletonAvatar size={104} className="profile-avatar-skeleton" />
                <SkeletonText width="200px" height="26px" />
                <SkeletonText width="150px" height="18px" />
              </div>
            </>
          ) : (
            <>
              {/* Profile Header */}
              <div className="profile-header">
                <div className="profile-banner" />
                
                <div className="profile-info-section">
                  <div className="profile-avatar-container">
                    <Avatar 
                      src={profileUser?.profilePicture?.url} 
                      alt={profileUser?.name} 
                      size={104} 
                    />
                  </div>
                  
                  <div className="profile-details">
                    <div className="profile-name-row">
                      <h1 className="profile-name">{profileUser?.name}</h1>
                      {!isOwnProfile && (
                        <div className="profile-actions">
                          <Button
                            variant={isFollowing ? 'outline' : 'primary'}
                            icon={isFollowing ? <IoPersonRemoveOutline /> : <IoPersonAddOutline />}
                            onClick={handleFollow}
                          >
                            {isFollowing ? 'Unfollow' : 'Follow'}
                          </Button>
                          <Button
                            variant="outline"
                            icon={<IoChatbubbleOutline />}
                            onClick={handleChatClick}
                          >
                            Chat
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    <p className="profile-wallet">
                      {profileUser?.walletAddress}
                    </p>
                    
                    <div className="profile-stats">
                      <div className="profile-stat">
                        <span className="stat-value">{posts.length}</span>
                        <span className="stat-label">Posts</span>
                      </div>
                      <div className="profile-stat">
                        <span className="stat-value">{profileUser?.followers?.length || 0}</span>
                        <span className="stat-label">Followers</span>
                      </div>
                      <div className="profile-stat">
                        <span className="stat-value">{profileUser?.following?.length || 0}</span>
                        <span className="stat-label">Following</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Posts */}
              <div className="profile-posts">
                <h2 className="profile-posts-title">Posts</h2>
                
                {posts.length === 0 ? (
                  <div className="empty-state">
                    <h3>No posts yet</h3>
                    <p>{isOwnProfile ? 'Create your first post!' : 'This user hasn\'t posted anything yet.'}</p>
                  </div>
                ) : (
                  <div className="posts-grid">
                    {posts.map(post => (
                      <PostCard
                        key={post._id}
                        post={post}
                        currentUser={currentUser}
                        onLike={handleLike}
                        onDelete={handleDelete}
                        onComment={handleComment}
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
