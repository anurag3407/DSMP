import React, { useState, useEffect } from 'react';
import Postbox from './Postbox';
import './HomepageBody.css';
import {
	createPost,
	getProfile,
	getTotalPosts,
	getPost,
	isUserRegistered,
	createProfile
} from '../utils/web3.js';
import {
	likePostAPI,
	unlikePostAPI,
	createPostAPI,
	deletePostAPI,
	getComments,
	addComment,
	getAuthToken
} from '../utils/api.js';

const HomepageBody = ({ userAddress }) => {
	const [posts, setPosts] = useState([]);
	const [text, setText] = useState('');
	const [loading, setLoading] = useState(false);
	const [fetchingPosts, setFetchingPosts] = useState(true);
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
			await fetchBlockchainPosts();
		} catch (err) {
			console.error('Error creating profile:', err);
			setError('Failed to create profile. Make sure you have Sepolia ETH for gas.');
		} finally {
			setLoading(false);
		}
	};

	// Fetch posts directly from blockchain
	const fetchBlockchainPosts = async () => {
		if (!userAddress) return;
		setFetchingPosts(true);
		try {
			const totalPosts = await getTotalPosts();
			const total = parseInt(totalPosts);
			console.log('[Blockchain] Total posts:', total);

			if (total === 0) {
				setPosts([]);
				setFetchingPosts(false);
				return;
			}

			// Fetch the most recent 20 posts
			const postsToFetch = Math.min(total, 20);
			const fetchedPosts = [];

			for (let i = total - 1; i >= total - postsToFetch && i >= 0; i--) {
				try {
					const post = await getPost(i);
					if (post.isDeleted) continue;

					// Get author profile
					let authorUsername = post.author.slice(0, 8) + '...';
					try {
						const profile = await getProfile(post.author);
						if (profile.username) {
							authorUsername = profile.username;
						}
					} catch (e) {
						console.log('Could not fetch profile for', post.author);
					}

					fetchedPosts.push({
						id: String(post.id),
						blockchainId: post.id,
						name: authorUsername,
						author: post.author,
						content: post.contentCID,
						time: new Date(parseInt(post.timestamp) * 1000).toLocaleString(),
						timestamp: parseInt(post.timestamp),
						likesCount: 0,
						hasLiked: false,
						commentsCount: 0,
						isOnChain: true
					});
				} catch (e) {
					console.error('Error fetching post', i, e);
				}
			}

			// Sort by timestamp (most recent first)
			fetchedPosts.sort((a, b) => b.timestamp - a.timestamp);
			setPosts(fetchedPosts);
			console.log('[Blockchain] Fetched posts:', fetchedPosts.length);
		} catch (err) {
			console.error('Error fetching blockchain posts:', err);
			setError('Failed to load posts from blockchain');
		} finally {
			setFetchingPosts(false);
		}
	};

	useEffect(() => {
		if (isRegistered) {
			fetchBlockchainPosts();
		}
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
			// Create post on blockchain (required)
			const result = await createPost(text.trim());
			console.log('[Blockchain] Post created:', result);

			// Also save to backend for caching (optional, doesn't cost gas)
			try {
				const token = getAuthToken();
				if (token) {
					await createPostAPI(text.trim(), {
						contentCID: text.trim(),
						isOnChain: true,
						onChainId: result.postId,
						txHash: result.txHash
					});
				}
			} catch (e) {
				console.log('Backend cache save failed (optional):', e);
			}

			setText('');
			await fetchBlockchainPosts();
		} catch (err) {
			console.error('Error creating post:', err);
			if (err.message?.includes('not registered')) {
				setError('Please create a profile first');
				setShowRegister(true);
				setIsRegistered(false);
			} else {
				setError('Failed to create post. Check your wallet for details.');
			}
		} finally {
			setLoading(false);
		}
	};

	// Use backend API for likes (saves gas!)
	const handleLike = async (id) => {
		try {
			await likePostAPI(id);
			setPosts(prev => prev.map(p =>
				p.id === id ? { ...p, hasLiked: true, likesCount: p.likesCount + 1 } : p
			));
		} catch (e) {
			console.error('Like error:', e);
		}
	};

	const handleUnlike = async (id) => {
		try {
			await unlikePostAPI(id);
			setPosts(prev => prev.map(p =>
				p.id === id ? { ...p, hasLiked: false, likesCount: Math.max(0, p.likesCount - 1) } : p
			));
		} catch (e) {
			console.error('Unlike error:', e);
		}
	};

	// Use backend API for delete (saves gas!)
	const handleDelete = async (id) => {
		try {
			await deletePostAPI(id);
			await fetchBlockchainPosts();
		} catch (e) {
			setError('Failed to delete');
		}
	};

	// Use backend API for comments (saves gas!)
	const handleViewComments = async (id) => {
		setSelectedPost(id);
		try {
			const r = await getComments(id);
			setComments(r.comments || []);
		} catch (e) {
			setComments([]);
		}
	};

	const handleAddComment = async () => {
		if (!newComment.trim()) return;
		try {
			await addComment(selectedPost, newComment.trim());
			setNewComment('');
			await handleViewComments(selectedPost);
		} catch (e) {
			console.error('Add comment error:', e);
		}
	};

	// Registration Modal
	if (showRegister) {
		return (
			<div className="homepage-body">
				<div className="register-modal">
					<h2>🔗 Create Your Blockchain Profile</h2>
					<p>Register on the blockchain to start posting. Your profile will be stored on Sepolia testnet forever!</p>
					<p style={{ fontSize: '13px', color: '#888' }}>This requires a small amount of Sepolia ETH for gas.</p>

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
							{loading ? 'Creating Profile...' : 'Create Profile on Blockchain'}
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="homepage-body">
			<div className="homepage-inner">
				{/* Header */}
				<div className="feed-header">
					<h2>Home</h2>
					<span className="chain-badge">⛓️ Sepolia</span>
				</div>

				{/* Composer */}
				<div className="composer">
					<textarea
						className="composer-input"
						placeholder="What's happening?"
						value={text}
						onChange={(e) => setText(e.target.value)}
						disabled={loading}
						maxLength={280}
					/>
					<div className="composer-actions">
						<span style={{ color: '#71767b', fontSize: '14px', marginRight: 'auto' }}>
							{text.length}/280
						</span>
						<button
							className="send-btn"
							onClick={addPost}
							disabled={loading || !text.trim()}
						>
							{loading ? 'Posting...' : 'Post'}
						</button>
					</div>
				</div>

				{error && <div className="error-message">{error}</div>}

				{/* Feed */}
				<div className="feed">
					{fetchingPosts ? (
						<div className="loading-spinner"></div>
					) : posts.length === 0 ? (
						<div className="empty-state">
							<p>No posts yet</p>
							<p style={{ fontSize: '14px', marginTop: '8px' }}>Be the first to post on the blockchain!</p>
						</div>
					) : (
						posts.map((p) => (
							<Postbox
								key={`${p.id}-${p.timestamp || ''}`}
								id={p.id}
								blockchainId={p.blockchainId}
								name={p.name}
								time={p.time}
								content={p.content}
								author={p.author}
								userAddress={userAddress}
								likesCount={p.likesCount}
								commentsCount={p.commentsCount}
								hasLiked={p.hasLiked}
								isOnChain={p.isOnChain}
								onLike={() => handleLike(p.id)}
								onUnlike={() => handleUnlike(p.id)}
								onDelete={handleDelete}
								onViewComments={handleViewComments}
							/>
						))
					)}
				</div>
			</div>

			{/* Comments Modal */}
			{selectedPost && (
				<div className="modal-overlay" onClick={() => setSelectedPost(null)}>
					<div className="comments-modal" onClick={e => e.stopPropagation()}>
						<h3>💬 Comments</h3>
						<div className="comments-list">
							{comments.length === 0 ? (
								<p style={{ color: '#71767b', textAlign: 'center' }}>No comments yet</p>
							) : (
								comments.map(c => (
									<div key={c._id} className="comment-item">
										<b>{c.authorUsername}</b>: {c.content}
									</div>
								))
							)}
						</div>
						<input
							type="text"
							placeholder="Add a comment..."
							value={newComment}
							onChange={(e) => setNewComment(e.target.value)}
							onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
						/>
						<button onClick={handleAddComment}>Post Comment</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default HomepageBody;
