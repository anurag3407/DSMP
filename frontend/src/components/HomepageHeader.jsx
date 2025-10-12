import React from 'react';
import logo from '../assets/logo.png';
import chatIcon from '../assets/Metamaskicon.png';

const HomepageHeader = () => {
	const styles = {
		header: {
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'space-between',
			padding: '12px 20px',
			background: '#7edece',
			boxShadow: 'inset 0 -6px 0 rgba(0,0,0,0.18)',
		},
		left: { display: 'flex', alignItems: 'center', gap: 12 },
		logo: { height: 36 },
		searchWrap: {
			flex: 1,
			display: 'flex',
			justifyContent: 'center',
			padding: '0 20px',
		},
		search: {
			width: '60%',
			maxWidth: 520,
			background: 'rgba(0,0,0,0.06)',
			borderRadius: 20,
			padding: '8px 14px',
			border: 'none',
			outline: 'none',
		},
		right: { display: 'flex', alignItems: 'center', gap: 12 },
		chat: { width: 34, height: 34, borderRadius: '50%' },
	};

	return (
		<header style={styles.header}>
			<div style={styles.left}>
				<img src={logo} alt="Nounce" style={styles.logo} />
			</div>

			<div style={styles.searchWrap}>
				<input style={styles.search} placeholder="Search" />
			</div>

			<div style={styles.right}>
				<img src={chatIcon} alt="chat" style={styles.chat} />
			</div>
		</header>
	);
};

export default HomepageHeader;

