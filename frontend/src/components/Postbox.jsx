import React, { useState } from 'react';
import './Postbox.css';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const Postbox = ({
	id,
	name,
	time,
	content,
	author,
	userAddress,
	likesCount = 0,
	commentsCount = 0,
	hasLiked = false,
	onLike,
	onUnlike,
	onEdit,
	onDelete,
	onComment,
	onViewComments
}) => {
	const [showEditModal, setShowEditModal] = useState(false);
	const [editContent, setEditContent] = useState(content);
	const [isLiking, setIsLiking] = useState(false);
	const [liked, setLiked] = useState(hasLiked);
	const [likes, setLikes] = useState(likesCount);

	const isOwner = userAddress && author && userAddress.toLowerCase() === author.toLowerCase();

	const handleLikeToggle = async () => {
		if (isLiking) return;
		setIsLiking(true);
		try {
			if (liked) {
				if (onUnlike) await onUnlike(id);
				setLikes(prev => Math.max(0, prev - 1));
			} else {
				if (onLike) await onLike(id);
				setLikes(prev => prev + 1);
			}
			setLiked(!liked);
		} catch (error) {
			console.error('Error toggling like:', error);
		} finally {
			setIsLiking(false);
		}
	};

	const handleEdit = async () => {
		if (onEdit && editContent.trim()) {
			await onEdit(id, editContent.trim());
			setShowEditModal(false);
		}
	};

	const handleDelete = async () => {
		if (window.confirm('Are you sure you want to delete this post?')) {
			if (onDelete) await onDelete(id);
		}
	};

	return (
		<div className="postbox">
			<div className="postbox-header">
				<div className="postbox-avatar">
					{name.charAt(0).toUpperCase()}
				</div>
				<div className="postbox-info">
					<span className="postbox-name">{name}</span>
					<span className="postbox-time">{time}</span>
				</div>
				{isOwner && (
					<div className="postbox-actions-owner">
						<button
							className="action-btn edit-btn"
							onClick={() => setShowEditModal(true)}
							title="Edit post"
						>
							<EditIcon fontSize="small" />
						</button>
						<button
							className="action-btn delete-btn"
							onClick={handleDelete}
							title="Delete post"
						>
							<DeleteIcon fontSize="small" />
						</button>
					</div>
				)}
			</div>

			<div className="postbox-content">{content}</div>

			<div className="postbox-footer">
				<button
					className={`footer-btn like-btn ${liked ? 'liked' : ''}`}
					onClick={handleLikeToggle}
					disabled={isLiking}
				>
					{liked ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
					<span>{likes}</span>
				</button>
				<button
					className="footer-btn comment-btn"
					onClick={() => onViewComments && onViewComments(id)}
				>
					<ChatBubbleOutlineIcon fontSize="small" />
					<span>{commentsCount}</span>
				</button>
			</div>

			{/* Edit Modal */}
			{showEditModal && (
				<div className="modal-overlay" onClick={() => setShowEditModal(false)}>
					<div className="modal-content" onClick={e => e.stopPropagation()}>
						<h3>Edit Post</h3>
						<textarea
							value={editContent}
							onChange={(e) => setEditContent(e.target.value)}
							placeholder="Edit your post..."
							rows={4}
						/>
						<div className="modal-actions">
							<button className="btn-cancel" onClick={() => setShowEditModal(false)}>
								Cancel
							</button>
							<button className="btn-save" onClick={handleEdit}>
								Save Changes
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default Postbox;
