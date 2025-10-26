import React, { useState, useRef } from 'react';
import { IoImageOutline, IoCloseCircle } from 'react-icons/io5';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Avatar from '../ui/Avatar';
import { useToast } from '../common/ToastContainer';
import './CreatePost.css';

const CreatePost = ({ user, onPostCreated }) => {
  const toast = useToast();
  const fileInputRef = useRef(null);
  const [caption, setCaption] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!caption.trim() && !imageFile) {
      toast.error('Please add a caption or image');
      return;
    }
    
    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('caption', caption);
      if (imageFile) {
        formData.append('file', imageFile);
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/post/new`, {
        method: 'POST',
        credentials: 'include', // Important: sends cookies with request
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Post created successfully!');
        setCaption('');
        handleRemoveImage();
        if (onPostCreated) {
          onPostCreated(data.post);
        }
      } else {
        throw new Error(data.message || 'Failed to create post');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="create-post">
      <div className="create-post-header">
        <Avatar src={user?.profilePicture?.url} alt={user?.name} size={48} />
        <h3 className="create-post-title">Create a post</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="create-post-form">
        <textarea
          className="create-post-textarea"
          placeholder="What's on your mind?"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={3}
          disabled={loading}
        />
        
        {imagePreview && (
          <div className="create-post-image-preview">
            <img src={imagePreview} alt="Preview" />
            <button 
              type="button"
              className="remove-image-btn"
              onClick={handleRemoveImage}
            >
              <IoCloseCircle />
            </button>
          </div>
        )}
        
        <div className="create-post-actions">
          <button
            type="button"
            className="add-image-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
          >
            <IoImageOutline />
            <span>Add Photo</span>
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="file-input-hidden"
          />
          
          <Button
            type="submit"
            variant="primary"
            disabled={loading || (!caption.trim() && !imageFile)}
            loading={loading}
          >
            Post
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default CreatePost;
