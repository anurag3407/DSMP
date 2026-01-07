import React, { useState, useEffect } from 'react';
import Postbox from './Postbox';
import './HomepageBody.css';
import { createPost, getProfile, editPost, deletePost, isUserRegistered, createProfile } from '../utils/web3.js';
import { getFeedAPI, likePostAPI, unlikePostAPI, createPostAPI, updatePostAPI, deletePostAPI, getComments, addComment, deleteComment, getAuthToken } from '../utils/api.js';

const HomepageBody = ({ userAddress }) => {
	const [posts, setPosts] = useState([]);
	const [text, setText] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [selectedPost, setSelectedPost] = useState(null);
	const [comments, setComments] = useState([]);
	const [newComment, setNewComment] = useState('');
	const [isRegistered, setIsRegistered] = useState(null);
	const [showRegister, setShowRegister] = useState(false);
	const [username, setUsername] = useState('');
	const [bio, setBio] = useState('');

	// Check if user is registered
	useEffect(() => {
		const checkRegistration = async () => {
			if (!userAddress) return;
			try {
				const registered = await isUserRegistered(userAddress);
				setIsRegistered(registered);
				if (!registered) {
					setShowRegister(true);
				}
			} catch (err) {
				console.error('Error checking registration:', err);
				setIsRegistered(false);
				setShowRegister(true);
			}
		};
		checkRegistration();
	}, [userAddress]);

	const handleRegister = async () => {
		if (!username.trim()) {
			setError('Username is required');
			return;
		}
		setLoading(true);
		setError(null);
		try {
			await createProfile(username.trim(), bio.trim(), '');
			setIsRegistered(true);
			setShowRegister(false);
			await fetchFeed();
		} catch (err) {
			console.error('Error creating profile:', err);
			setError('Failed to create profile. Make sure you have Sepolia ETH for gas.');
		} finally {
			setLoading(false);
		}
	};

	const fetchFeed = async () => {
		if (!userAddress) return;
		try {
			setLoading(true);
			const token = getAuthToken();
			if (token) {
				try {
					const response = await getFeedAPI(1, 20);
					setPosts(response.posts.map(post => ({
						id: post._id, name: post.authorUsername || post.author.slice(0, 8) + '...',
						time: new Date(post.createdAt).toLocaleString(), content: post.content, author: post.author,
						likesCount: post.likesCount || 0, commentsCount: post.commentsCount || 0, hasLiked: post.hasLiked || false
					})));
				} catch (apiError) {
					console.log('Backend API not available');
				}
			}
		} catch (err) { setError('Failed to load feed'); }
		finally { setLoading(false); }
	};

	useEffect(() => {
		if (isRegistered) fetchFeed();
	}, [userAddress, isRegistered]);

	const addPost = async () => {
		if (!text.trim()) return;
		if (!isRegistered) {
			setError('Please create a profile first');
			setShowRegister(true);
			return;
		}
		setLoading(true);
		setError(null);
		try {
			let onChainData = {};
			try {
				const result = await createPost(text.trim());
				onChainData = { contentCID: text.trim(), isOnChain: true, onChainId: result.postId, txHash: result.txHash };
			} catch (e) {
				console.error('Blockchain post failed:', e);
				if (e.message?.includes('User not registered')) {
					setError('Please create a profile first');
					setShowRegister(true);
					setIsRegistered(false);
					return;
				}
			}
			if (getAuthToken()) await createPostAPI(text.trim(), onChainData);
			setText('');
			await fetchFeed();
		} catch (err) {
			console.error('Error creating post:', err);
			setError('Failed to create post');
		}
		finally { setLoading(false); }
	};

	const handleLike = async (id) => { try { await likePostAPI(id); } catch (e) { } };
	const handleUnlike = async (id) => { try { await unlikePostAPI(id); } catch (e) { } };
	const handleEdit = async (id, content) => { try { await updatePostAPI(id, content); await fetchFeed(); } catch (e) { setError('Failed to edit'); } };
	const handleDelete = async (id) => { try { await deletePostAPI(id); await fetchFeed(); } catch (e) { setError('Failed to delete'); } };
	const handleViewComments = async (id) => { setSelectedPost(id); try { const r = await getComments(id); setComments(r.comments || []); } catch (e) { setComments([]); } };
	const handleAddComment = async () => { if (!newComment.trim()) return; try { await addComment(selectedPost, newComment.trim()); setNewComment(''); await handleViewComments(selectedPost); await fetchFeed(); } catch (e) { } };

	// Registration Modal
	if (showRegister) {
		return (
			<div className="homepage-body">
				<div className="register-modal">
					<h2>Create Your Profile</h2>
					<p>You need to create a profile on the blockchain before you can post.</p>
					<p style={{ fontSize: '13px', color: '#888' }}>This will require a small amount of Sepolia ETH for gas.</p>

					<div className="register-form">
						<input
							type="text"
							placeholder="Username *"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							className="register-input"
						/>
						<textarea
							placeholder="Bio (optional)"
							value={bio}
							onChange={(e) => setBio(e.target.value)}
							className="register-input"
							rows={3}
						/>
						{error && <div className="error-message">{error}</div>}
						<button
							onClick={handleRegister}
							disabled={loading || !username.trim()}
							className="register-btn"
						>
							{loading ? 'Creating Profile...' : 'Create Profile'}
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="homepage-body">
			<div className="homepage-inner">
				<div className="composer">
					<textarea className="composer-input" placeholder="What's on your mind?" value={text} onChange={(e) => setText(e.target.value)} disabled={loading} />
					<div className="composer-actions">
						<button className="send-btn" onClick={addPost} disabled={loading || !text.trim()}>{loading ? 'Posting...' : 'Post'}</button>
					</div>
				</div>
				{error && <div className="error-message">{error}</div>}
				<div className="feed">
					{posts.length === 0 ? (
						<div className="empty-state">No posts yet. Be the first to post!</div>
					) : (
						posts.map((p) => (
							<Postbox key={p.id} id={p.id} name={p.name} time={p.time} content={p.content} author={p.author} userAddress={userAddress}
								likesCount={p.likesCount} commentsCount={p.commentsCount} hasLiked={p.hasLiked}
								onLike={handleLike} onUnlike={handleUnlike} onEdit={handleEdit} onDelete={handleDelete} onViewComments={handleViewComments} />
						))
					)}
				</div>
			</div>
			{selectedPost && (
				<div className="modal-overlay" onClick={() => setSelectedPost(null)}>
					<div className="comments-modal" onClick={e => e.stopPropagation()}>
						<h3>Comments</h3>
						<div className="comments-list">{comments.map(c => <div key={c._id} className="comment-item"><b>{c.authorUsername}</b>: {c.content}</div>)}</div>
						<input type="text" placeholder="Add comment..." value={newComment} onChange={(e) => setNewComment(e.target.value)} />
						<button onClick={handleAddComment}>Post</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default HomepageBody;
