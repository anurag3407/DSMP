import React, { useState, useEffect } from 'react';
import Postbox from './Postbox';
import './HomepageBody.css';
import { getFeed, createPost, getProfile } from '../utils/web3.js';

const HomepageBody = ({ userAddress }) => {
	const [posts, setPosts] = useState([]);
	const [text, setText] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const fetchFeed = async () => {
		if (!userAddress) return;
		try {
			setLoading(true);
			setError(null);
			const feed = await getFeed(userAddress);
			// Fetch profiles for each post author
			const postsWithProfiles = await Promise.all(
				feed.map(async (post) => {
					try {
						const profile = await getProfile(post.author);
						const timeAgo = getTimeAgo(parseInt(post.timestamp));
						return {
							id: post.id,
							name: profile.username || post.author.slice(0, 6) + '...',
							time: timeAgo,
							content: post.content,
							author: post.author
						};
					} catch (err) {
						console.error('Error fetching profile for', post.author, err);
						const timeAgo = getTimeAgo(parseInt(post.timestamp));
						return {
							id: post.id,
							name: post.author.slice(0, 6) + '...',
							time: timeAgo,
							content: post.content,
							author: post.author
						};
					}
				})
			);
			setPosts(postsWithProfiles);
		} catch (err) {
			console.error('Error fetching feed:', err);
			setError('Failed to load feed. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchFeed();
	}, [userAddress]);

	const addPost = async () => {
		if (!text.trim()) return;
		try {
			setLoading(true);
			await createPost(text.trim());
			setText('');
			// Refresh feed after posting
			await fetchFeed();
		} catch (err) {
			console.error('Error creating post:', err);
			setError('Failed to create post. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	const onKeyDown = (e) => {
		if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
			addPost();
		}
	};

	const getTimeAgo = (timestamp) => {
		const now = Date.now() / 1000;
		const diff = now - timestamp;
		if (diff < 60) return 'just now';
		if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
		if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
		return `${Math.floor(diff / 86400)} days ago`;
	};

	return (
		<div className="homepage-body">
			<div className="homepage-inner">
				<div className="composer">
					<textarea
						className="composer-input"
						placeholder="What's on your mind?"
						value={text}
						onChange={(e) => setText(e.target.value)}
						onKeyDown={onKeyDown}
						disabled={loading}
					/>
					<div className="composer-actions">
						<button className="send-btn" onClick={addPost} disabled={loading || !text.trim()}>
							{loading ? 'Posting...' : 'Post'}
						</button>
					</div>
				</div>

				{error && <div style={{ color: 'red', padding: '10px' }}>{error}</div>}

				<div className="feed">
					{loading && posts.length === 0 ? (
						<div>Loading feed...</div>
					) : (
						posts.map((p) => (
							<Postbox key={p.id} name={p.name} time={p.time} content={p.content} />
						))
					)}
				</div>
			</div>
		</div>
	);
};

export default HomepageBody;

