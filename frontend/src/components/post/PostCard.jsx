import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  IoHeartOutline, 
  IoHeart,
  IoChatbubbleOutline,
  IoShareSocialOutline,
  IoGiftOutline,
  IoSendOutline,
  IoTrashOutline
} from 'react-icons/io5';
import Avatar from '../ui/Avatar';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useToast } from '../common/ToastContainer';
import './PostCard.css';

const PostCard = ({ post, currentUser, onLike, onDelete, onComment }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);

  const isLiked = post.likes?.some(like => 
    like.walletAddress === currentUser?.walletAddress
  );
  const isOwner = post.author?.walletAddress === currentUser?.walletAddress;

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const handleLike = async () => {
    try {
      await onLike(post._id);
    } catch {
      toast.error('Failed to like post');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    
    if (!commentText.trim()) return;
    
    try {
      setLoading(true);
      await onComment(post._id, commentText);
      setCommentText('');
      toast.success('Comment added successfully!');
    } catch {
      toast.error('Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  const handleTip = async () => {
    // Implement tip functionality
    toast.info('Tip feature coming soon!');
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Post by ${post.author?.name}`,
          text: post.caption || '',
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      }
    } catch (err) {
      console.log('Share failed:', err);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await onDelete(post._id);
        toast.success('Post deleted successfully!');
      } catch {
        toast.error('Failed to delete post');
      }
    }
  };

  return (
    <Card className="post-card" padding="none">
      {/* Post Header */}
      <div className="post-header">
        <div 
          className="post-author"
          onClick={() => navigate(`/profile/${post.author?.walletAddress}`)}
        >
          <Avatar 
            src={post.author?.profilePicture?.url} 
            alt={post.author?.name} 
            size={48} 
          />
          <div className="post-author-info">
            <h4 className="post-author-name">{post.author?.name}</h4>
            <p className="post-time">{formatTimeAgo(post.createdAt)}</p>
          </div>
        </div>
        {isOwner && (
          <button className="post-delete-btn" onClick={handleDelete}>
            <IoTrashOutline />
          </button>
        )}
      </div>

      {/* Post Image */}
      {post.image?.url && (
        <div className="post-image-container">
          <img 
            src={post.image.url} 
            alt={post.caption || 'Post image'} 
            className="post-image"
          />
        </div>
      )}

      {/* Post Content */}
      <div className="post-content">
        {post.caption && (
          <p className="post-caption">{post.caption}</p>
        )}

        {/* Post Actions */}
        <div className="post-actions">
          <div className="post-actions-left">
            <button 
              className={`post-action-btn ${isLiked ? 'post-action-liked' : ''}`}
              onClick={handleLike}
            >
              {isLiked ? <IoHeart /> : <IoHeartOutline />}
              <span>{post.likes?.length || 0}</span>
            </button>
            
            <button 
              className="post-action-btn"
              onClick={() => setShowComments(!showComments)}
            >
              <IoChatbubbleOutline />
              <span>{post.comments?.length || 0}</span>
            </button>
            
            <button 
              className="post-action-btn"
              onClick={handleShare}
            >
              <IoShareSocialOutline />
            </button>
          </div>

          <Button
            variant="accent"
            size="sm"
            icon={<IoGiftOutline />}
            onClick={handleTip}
            className="post-tip-btn"
          >
            Tip ETH
          </Button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="post-comments">
            <div className="comments-list">
              {post.comments?.map((comment) => (
                <div key={comment._id} className="comment-item">
                  <Avatar 
                    src={comment.user?.profilePicture?.url} 
                    alt={comment.user?.name} 
                    size={32} 
                  />
                  <div className="comment-content">
                    <div className="comment-header">
                      <span className="comment-author">{comment.user?.name}</span>
                      <span className="comment-time">{formatTimeAgo(comment.createdAt)}</span>
                    </div>
                    <p className="comment-text">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <form className="comment-form" onSubmit={handleComment}>
              <input
                type="text"
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="comment-input"
                disabled={loading}
              />
              <button 
                type="submit" 
                className="comment-submit-btn"
                disabled={loading || !commentText.trim()}
              >
                <IoSendOutline />
              </button>
            </form>
          </div>
        )}
      </div>
    </Card>
  );
};

export default PostCard;
