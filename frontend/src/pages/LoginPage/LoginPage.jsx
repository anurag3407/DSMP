import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  IoWalletOutline, 
  IoPersonOutline, 
  IoImageOutline,
  IoCheckmarkCircle,
  IoShieldCheckmarkOutline
} from 'react-icons/io5';
import { SiEthereum } from 'react-icons/si';
import { useWeb3 } from '../../context/Web3Context';
import { useToast } from '../../components/common/ToastContainer';
import { Button, Input, Avatar, Card } from '../../components/ui';
import Loading from '../../components/common/Loading';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { account, connectWallet, signMessage, loading: web3Loading } = useWeb3();
  const toast = useToast();
  const fileInputRef = useRef(null);

  const [step, setStep] = useState(1); // 1: Connect Wallet, 2: Complete Profile
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    profilePicture: null,
    profilePicturePreview: null
  });
  const [errors, setErrors] = useState({});

  // Redirect if already logged in
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      navigate('/home', { replace: true });
    }
  }, [navigate]);

  // Step 1: Connect MetaMask
  const handleConnectWallet = async () => {
    try {
      console.log('[Login] Starting wallet connection...');
      setLoading(true);
      const walletAddress = await connectWallet();
      
      if (!walletAddress) {
        throw new Error('Failed to connect wallet');
      }
      
      console.log('[Login] Wallet connected:', walletAddress);
      toast.success('Wallet connected successfully!');
      
      // Check if user exists
      console.log('[Login] Checking if user exists...');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/check-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress })
      });
      
      if (!response.ok) {
        throw new Error('Failed to check user status');
      }
      
      const data = await response.json();
      console.log('[Login] User check result:', data);
      
      if (data.exists) {
        // User exists, proceed to login with signature
        console.log('[Login] User exists, proceeding to login...');
        toast.info('Please sign the message to verify your identity');
        await handleLogin(walletAddress);
      } else {
        // New user, proceed to registration (no signature needed yet)
        console.log('[Login] New user, showing registration form...');
        toast.success('Please complete your profile to continue');
        setLoading(false);
        setStep(2);
      }
    } catch (error) {
      console.error('[Login] Wallet connection error:', error);
      toast.error(error.message || 'Failed to connect wallet');
      setLoading(false);
    }
  };

  // Login existing user
  const handleLogin = async (walletAddress) => {
    try {
      console.log('[Login] handleLogin called with:', walletAddress);
      setLoading(true);
      
      // Get signature message from backend
      console.log('[Login] Requesting nonce...');
      const nonceResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/nonce`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress })
      });
      
      const nonceData = await nonceResponse.json();
      console.log('[Login] Nonce received:', nonceData);
      
      if (!nonceResponse.ok) {
        throw new Error(nonceData.message || 'Failed to get nonce');
      }
      
      // eslint-disable-next-line no-unused-vars
      const { nonce, message } = nonceData;
      
      // Sign the message
      console.log('[Login] Requesting signature from user...');
      const signature = await signMessage(message);
      
      if (!signature) {
        throw new Error('Signature cancelled or failed');
      }
      
      console.log('[Login] Signature received, logging in...');
      
      // Send signature to backend
      const loginResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Important: allows server to set cookies
        body: JSON.stringify({ walletAddress, signature, message })
      });
      
      const loginData = await loginResponse.json();
      console.log('[Login] Login response:', loginResponse.ok, loginData);
      
      if (loginResponse.ok && loginData.user) {
        localStorage.setItem('user', JSON.stringify(loginData.user));
        console.log('[Login] User saved to localStorage, navigating to /home');
        toast.success('Login successful!');
        navigate('/home');
      } else {
        console.error('[Login] Login failed:', loginData);
        throw new Error(loginData.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, profilePicture: 'Please select an image file' }));
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, profilePicture: 'File size must be less than 5MB' }));
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        profilePicture: file,
        profilePicturePreview: URL.createObjectURL(file)
      }));
      
      if (errors.profilePicture) {
        setErrors(prev => ({ ...prev, profilePicture: '' }));
      }
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.gender) {
      newErrors.gender = 'Please select your gender';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step 2: Complete registration
  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Create form data for multipart upload
      const data = new FormData();
      data.append('name', formData.name);
      data.append('gender', formData.gender);
      data.append('walletAddress', account);
      if (formData.profilePicture) {
        data.append('file', formData.profilePicture); // Changed from 'profilePicture' to 'file'
      }
      
      // Get signature for registration
      const signature = await signMessage(`Register account: ${account}`);
      data.append('signature', signature);
      
      // Send registration request
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: 'POST',
        credentials: 'include', // Important: allows server to set cookies
        body: data
      });
      
      const result = await response.json();
      
      if (response.ok && result.user) {
        localStorage.setItem('user', JSON.stringify(result.user));
        toast.success('Registration successful! Welcome to Nounce!');
        navigate('/home');
      } else {
        throw new Error(result.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (loading || web3Loading) {
    return <Loading fullScreen message="Processing..." />;
  }

  return (
    <div className="login-page">
      {/* Header */}
      <header className="login-header">
        <div className="login-header-content">
          <div className="login-logo">
            <SiEthereum className="logo-icon" />
            <span className="logo-text">Nounce</span>
          </div>
          <div className="login-profile-placeholder">
            <IoPersonOutline />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="login-main">
        {step === 1 ? (
          // Step 1: Connect Wallet
          <div className="login-content">
            <div className="login-hero">
              <h1 className="login-title">Welcome to Decentralized Social Media</h1>
              <p className="login-subtitle">Connect your wallet to get started</p>
              
              <Button
                variant="accent"
                size="lg"
                icon={<IoWalletOutline />}
                onClick={handleConnectWallet}
                className="connect-wallet-btn"
                disabled={loading}
              >
                Connect MetaMask Wallet
              </Button>
              
              {account && (
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    setLoading(false);
                    setStep(2);
                  }}
                  className="skip-to-register-btn"
                  style={{ marginTop: 'var(--spacing-md)' }}
                >
                  I'm a new user - Register
                </Button>
              )}
            </div>

            {/* Side Info Panels */}
            <div className="login-info-panels">
              <Card className="info-panel">
                <div className="info-icon-wrapper primary">
                  <IoCheckmarkCircle />
                </div>
                <h3>Create content & get rewarded</h3>
                <p>Share your thoughts and earn ETH tips directly from your audience</p>
              </Card>
              
              <Card className="info-panel">
                <div className="info-icon-wrapper secondary">
                  <IoShieldCheckmarkOutline />
                </div>
                <h3>Blockchain Verified</h3>
                <p>All data is stored on Sepolia testnet and IPFS for maximum security</p>
              </Card>
            </div>
          </div>
        ) : (
          // Step 2: Complete Profile
          <div className="registration-content">
            <Card className="registration-card">
              <h2 className="registration-title">Complete Your Profile</h2>
              <p className="registration-subtitle">Tell us a bit about yourself</p>
              
              <form onSubmit={handleRegister} className="registration-form">
                {/* Profile Picture Upload */}
                <div className="form-group">
                  <label className="form-label">Profile Picture</label>
                  <div className="profile-picture-upload">
                    <div 
                      className="profile-picture-preview"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {formData.profilePicturePreview ? (
                        <Avatar src={formData.profilePicturePreview} size={104} alt="Preview" />
                      ) : (
                        <div className="profile-picture-placeholder">
                          <IoImageOutline />
                          <span>Click to upload</span>
                        </div>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="file-input-hidden"
                    />
                  </div>
                  {errors.profilePicture && (
                    <span className="error-message">{errors.profilePicture}</span>
                  )}
                </div>

                {/* Name Input */}
                <Input
                  label="Name"
                  name="name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleInputChange}
                  error={errors.name}
                  required
                  icon={<IoPersonOutline />}
                />

                {/* Gender Select */}
                <div className="form-group">
                  <label className="form-label">
                    Gender <span className="required-star">*</span>
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className={`form-select ${errors.gender ? 'input-error' : ''}`}
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                  {errors.gender && (
                    <span className="error-message">{errors.gender}</span>
                  )}
                </div>

                {/* Wallet Address (Read-only) */}
                <Input
                  label="Wallet Address"
                  value={account || ''}
                  disabled
                  icon={<IoWalletOutline />}
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  icon={<IoCheckmarkCircle />}
                  disabled={loading}
                  loading={loading}
                >
                  Complete Registration
                </Button>
              </form>
            </Card>
          </div>
        )}
      </main>
      
      {/* Footer with wallet address */}
      {account && (
        <footer className="login-footer">
          <div className="wallet-address-display">
            <IoWalletOutline className="wallet-icon" />
            <span className="wallet-label">Connected Wallet:</span>
            <span className="wallet-address">{account}</span>
          </div>
        </footer>
      )}
    </div>
  );
};

export default LoginPage;
