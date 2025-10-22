import { useState, useEffect } from 'react';
import HomepageHeader from "../components/HomepageHeader";
import HomePagesidebar from "../components/HomePagesidebar";
import HomepageBody from "../components/HomepageBody";
import { getProfile, getProvider } from '../utils/web3.js';
import { ethers } from 'ethers';

const HomePage = ({ userAddress, onLogout }) => {
  const [profile, setProfile] = useState(null);
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (userAddress) {
        try {
          // Fetch user profile
          const userProfile = await getProfile(userAddress);
          setProfile(userProfile);

          // Fetch wallet balance
          const provider = getProvider();
          if (provider) {
            const userBalance = await provider.getBalance(userAddress);
            const formattedBalance = ethers.utils.formatEther(userBalance);
            setBalance(formattedBalance);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Set defaults if fetch fails
          setProfile({ username: 'Unknown User', bio: '', avatarCID: '', wallet: userAddress });
          setBalance('0.0');
        }
      }
    };

    fetchUserData();
  }, [userAddress]);

  return (
    <div style={{ margin: 0, padding: 0, width: '100%' }}>
      <HomepageHeader userAddress={userAddress} />
      <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start', padding: '12px 18px' }}>
        <div style={{ flex: '0 0 220px' }}>
          <HomePagesidebar userAddress={userAddress} profile={profile} balance={balance} onLogout={onLogout} />
        </div>

        <div style={{ flex: 1 }}>
          <HomepageBody userAddress={userAddress} />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
