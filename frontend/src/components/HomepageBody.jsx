import React, { useState } from 'react';
import Postbox from './Postbox';
import './HomepageBody.css';

const initialPosts = [
	{
		id: 1,
		name: 'Neha Sharma',
		time: '2 days ago',
		content:
			"Frontend development is all about what you see and interact with in your browser. Think of it as the 'client-side.' This involves mastering languages like HTML for structuring content, CSS for styling and layout, and JavaScript for adding interactivity and dynamic behavior...",
	},
	{
		id: 2,
		name: 'Neha Sharma',
		time: '2 days ago',
		content:
			"Choosing the \"best\" testnet largely depends on the blockchain you're developing for. For Ethereum-based dApps, Sepolia and Holesky are currently the most recommended testnets...",
	},
];

const HomepageBody = () => {
	const [posts, setPosts] = useState(initialPosts);
	const [text, setText] = useState('');

	const addPost = () => {
		if (!text.trim()) return;
		const newPost = {
			id: Date.now(),
			name: 'You',
			time: 'just now',
			content: text.trim(),
		};
		setPosts([newPost, ...posts]);
		setText('');
	};

	const onKeyDown = (e) => {
		if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
			addPost();
		}
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
				/>
				<div className="composer-actions">
					<button className="send-btn" onClick={addPost}>
						Post
					</button>
				</div>
						</div>

						<div className="feed">
				{posts.map((p) => (
					<Postbox key={p.id} name={p.name} time={p.time} content={p.content} />
				))}
						</div>
					</div>
				</div>
	);
};

export default HomepageBody;

