import React from 'react';
import './Postbox.css';
import avatarImg from '../assets/user.png';

const Postbox = ({
	name = 'Neha Sharma',
	time = 'an hour ago',
	content,
}) => {
	const defaultContent = content || `Choosing the "best" testnet largely depends on the blockchain you're developing for. For Ethereum-based dApps, Sepolia and Holesky are currently the most recommended testnets. Sepolia is ideal for application-layer testing due to its quick sync times and smaller state, while Holesky is better suited for staking and infrastructure testing. Other popular testnets include the Binance Smart Chain Testnet, Polygon Mumbai, and Avalanche Fuji C-Chain, each mirroring their respective mainnets. These environments allow developers to thoroughly test smart contracts and dApps with "test tokens" that hold no real-world value, mitigating financial risk before deploying to the live network.`;

	return (
		<div className="postbox">
			<div className="postbox-header">
				<img src={avatarImg} alt={name} className="postbox-avatar" />
				<div className="postbox-meta">
					<div className="postbox-name">{name}</div>
					<div className="postbox-time">{time}</div>
				</div>
			</div>

			<div className="postbox-content">
				<p>{defaultContent}</p>
			</div>

			<div className="postbox-actions">
				<button className="action">Like</button>
				<button className="action">Comment</button>
				<button className="action">Share</button>
			</div>
		</div>
	);
};

export default Postbox;

