import { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

const Web3Context = createContext();

export const useWeb3 = () => {
    const context = useContext(Web3Context);
    if (!context) {
        throw new Error('useWeb3 must be used within Web3Provider');
    }
    return context;
};

export const Web3Provider = ({ children }) => {
    const [account, setAccount] = useState(null);
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [loading, setLoading] = useState(false);
    const [chainId, setChainId] = useState(null);

    // Check if MetaMask is installed
    const isMetaMaskInstalled = () => {
        return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
    };

    // Connect to MetaMask
    const connectWallet = async () => {
        if (!isMetaMaskInstalled()) {
            throw new Error('Please install MetaMask to continue');
        }

        setLoading(true);

        try {
            const web3Provider = new ethers.BrowserProvider(window.ethereum);
            
            // Request account access
            const accounts = await web3Provider.send('eth_requestAccounts', []);
            const userAccount = accounts[0];

            // Get signer
            const web3Signer = await web3Provider.getSigner();
            
            // Get chain ID
            const network = await web3Provider.getNetwork();
            const currentChainId = Number(network.chainId);

            setProvider(web3Provider);
            setSigner(web3Signer);
            setAccount(userAccount);
            setChainId(currentChainId);
            
            return userAccount;
        } catch (error) {
            console.error('Error connecting wallet:', error);
            throw new Error('Failed to connect wallet');
        } finally {
            setLoading(false);
        }
    };

    // Disconnect wallet
    const disconnectWallet = () => {
        setAccount(null);
        setProvider(null);
        setSigner(null);
        setChainId(null);
    };

    // Sign message for authentication
    const signMessage = async (message) => {
        if (!signer) {
            throw new Error('Please connect your wallet first');
        }

        try {
            console.log('[Web3] Requesting signature for message:', message);
            const signature = await signer.signMessage(message);
            console.log('[Web3] Signature obtained');
            return signature;
        } catch (error) {
            console.error('[Web3] Error signing message:', error);
            // Check if user rejected the signature
            if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
                throw new Error('Signature request was rejected');
            }
            throw new Error('Failed to sign message: ' + error.message);
        }
    };

    // Switch to Sepolia network
    const switchToSepolia = async () => {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0xaa36a7' }], // Sepolia chainId
            });
        } catch (error) {
            if (error.code === 4902) {
                // Chain not added
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: '0xaa36a7',
                        chainName: 'Sepolia Testnet',
                        nativeCurrency: {
                            name: 'SepoliaETH',
                            symbol: 'ETH',
                            decimals: 18
                        },
                        rpcUrls: ['https://sepolia.infura.io/v3/'],
                        blockExplorerUrls: ['https://sepolia.etherscan.io']
                    }]
                });
            } else {
                throw error;
            }
        }
    };

    // Listen for account changes
    useEffect(() => {
        if (!isMetaMaskInstalled()) return;

        const handleAccountsChanged = (accounts) => {
            if (accounts.length === 0) {
                disconnectWallet();
            } else if (accounts[0] !== account) {
                setAccount(accounts[0]);
            }
        };

        const handleChainChanged = (newChainId) => {
            const chainIdNumber = parseInt(newChainId, 16);
            setChainId(chainIdNumber);
            window.location.reload();
        };

        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);

        return () => {
            if (window.ethereum.removeListener) {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
                window.ethereum.removeListener('chainChanged', handleChainChanged);
            }
        };
    }, [account]);

    // Auto-connect if previously connected
    useEffect(() => {
        const autoConnect = async () => {
            if (!isMetaMaskInstalled()) return;

            try {
                const accounts = await window.ethereum.request({
                    method: 'eth_accounts'
                });

                if (accounts.length > 0) {
                    await connectWallet();
                }
            } catch (error) {
                console.error('Auto-connect error:', error);
            }
        };

        autoConnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const value = {
        account,
        provider,
        signer,
        chainId,
        loading,
        isConnected: !!account,
        isMetaMaskInstalled: isMetaMaskInstalled(),
        connectWallet,
        disconnectWallet,
        signMessage,
        switchToSepolia,
        isSepolia: chainId === 11155111,
    };

    return (
        <Web3Context.Provider value={value}>
            {children}
        </Web3Context.Provider>
    );
};

export default Web3Context;
