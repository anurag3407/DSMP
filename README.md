# 🚀 Nounce - Decentralized Social Media Platform# Nounce - Decentralized Social Media Platform



A modern, gas-optimized social media platform built with **React**, **Node.js**, **MongoDB**, **Pinata IPFS**, and **Ethereum Sepolia** blockchain. Users connect with **MetaMask**, upload content to **IPFS**, and optionally store data on-chain for immutability.A fully decentralized social media application built on **Sepolia blockchain**, **Pinata IPFS**, and **MongoDB Atlas**. Users connect with MetaMask, upload content to IPFS, and all interactions are recorded on-chain.



------



## ✨ Key Features## 🌟 Features



### 🔐 **Web3 Authentication**### Core Functionality

- **MetaMask wallet-based login** - No passwords required- ✅ **Web3 Authentication**: MetaMask wallet-based login (no passwords!)

- **Signature verification** with nonce-based SIWE (Sign-In with Ethereum)- ✅ **Decentralized Storage**: All images/videos stored on IPFS via Pinata

- **Cookie-based sessions** for seamless UX- ✅ **Blockchain Integration**: User profiles, posts, likes, follows, and comments recorded on Sepolia

- ✅ **Real-time Chat**: Socket.io-powered messaging with wallet addresses

### 💾 **Hybrid Storage Architecture**- ✅ **ETH Tipping**: Send tips to content creators directly on-chain

- **Off-chain (MongoDB)**: Likes, comments, followers, user profiles- ✅ **Immutable Content**: Posts stored permanently on IPFS with blockchain verification

- **IPFS (Pinata)**: Images, videos, and media files

- **On-chain (Optional)**: IPFS hashes for immutable proof### Technical Stack

- **99% Gas Savings**: Only essential data on blockchain- **Frontend**: React 19 + Vite + TailwindCSS + ethers.js

- **Backend**: Express.js + Node.js

### 📱 **Core Functionality**- **Blockchain**: Solidity Smart Contracts on Sepolia Testnet

- ✅ Create posts with images/videos- **Storage**: Pinata IPFS for media, MongoDB Atlas for indexing

- ✅ Like and comment on posts- **Real-time**: Socket.io for chat

- ✅ Follow/unfollow users- **Security**: Helmet, rate limiting, Joi validation, input sanitization

- ✅ Real-time chat with Socket.io

- ✅ View user profiles with post grids---

- ✅ Recommended users feed

- ✅ Responsive design for all devices## 📋 Prerequisites



### ⚡ **Performance & Security**- **Node.js** >= 18.0.0

- Cookie-based authentication (httpOnly, secure)- **npm** >= 9.0.0

- Rate limiting (100 requests/15min)- **MetaMask** browser extension

- File upload validation (50MB limit)- **Sepolia ETH** (get from faucet)

- MongoDB injection prevention- **MongoDB Atlas** account

- XSS sanitization- **Pinata** account

- Helmet.js security headers- **Infura** or **Alchemy** RPC URL

- Input validation with Joi

---

---

## 🚀 Installation & Setup

## 🛠️ Tech Stack

### 1. Clone Repository

### **Frontend**\`\`\`bash

- **Framework**: React 19 + Vitegit clone <your-repo-url>

- **Styling**: CSS Modules + Custom Design Systemcd Nounce

- **Web3**: ethers.js v6\`\`\`

- **Real-time**: Socket.io Client

- **Routing**: React Router v6### 2. Install Backend Dependencies

- **State**: React Hooks\`\`\`bash

cd backend

### **Backend**npm install

- **Runtime**: Node.js 18+\`\`\`

- **Framework**: Express.js

- **Database**: MongoDB Atlas### 3. Install Frontend Dependencies

- **Storage**: Pinata IPFS\`\`\`bash

- **Blockchain**: Ethereum Sepolia (optional)cd ../frontend

- **Real-time**: Socket.ionpm install

- **Authentication**: JWT + Cookies\`\`\`



### **Blockchain** (Optional)### 4. Configure Environment Variables

- **Smart Contract**: Solidity

- **Network**: Ethereum Sepolia Testnet#### Backend (.env)

- **Library**: ethers.jsCreate \`backend/.env\` file:

- **Development**: Hardhat\`\`\`env

# Server

---NODE_ENV=development

PORT=5000

## 📋 PrerequisitesFRONTEND_URL=http://localhost:5173



Before you begin, ensure you have:# MongoDB Atlas

MONGODB_URI=mongodb+srv://anuragmishra3407_db_user:mQq6gwB4wqDvW6Hl@cluster0.x1vcvar.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

- **Node.js** >= 18.0.0

- **npm** >= 9.0.0# JWT

- **MongoDB Atlas** account ([Sign up](https://www.mongodb.com/cloud/atlas))JWT_SECRET=your_super_secret_jwt_key_change_this

- **Pinata** account for IPFS ([Sign up](https://pinata.cloud))

- **MetaMask** browser extension ([Install](https://metamask.io))# Pinata IPFS

- **Sepolia ETH** (optional, for blockchain features) ([Faucet](https://sepoliafaucet.com))PINATA_API_KEY=8819404ba34769d736a5

PINATA_SECRET_API_KEY=433122da3fbbf685531b6524a812af033265f066ce006e00f524c3cee8ff4155

---

# Sepolia Blockchain

## 🚀 Quick StartSEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID

SEPOLIA_PRIVATE_KEY=your_private_key_here

### 1. **Clone Repository**CONTRACT_ADDRESS=<deployed_contract_address>

```bashCONTRACT_ACCOUNT=0x01c8A19650E2F8D1247dEc586B1ae484b5Fd9D6d

git clone <your-repo-url>

cd Nounce# Etherscan (for verification)

```ETHERSCAN_API_KEY=your_etherscan_api_key

\`\`\`

### 2. **Install Dependencies**

```bash#### Frontend (.env)

# Install backend dependenciesCreate \`frontend/.env\` file:

cd backend\`\`\`env

npm installVITE_API_URL=http://localhost:5000/api

VITE_CONTRACT_ADDRESS=<deployed_contract_address>

# Install frontend dependenciesVITE_CHAIN_ID=11155111

cd ../frontend\`\`\`

npm install

```---



### 3. **Configure Environment**## 🔧 Smart Contract Deployment



Copy the example environment file to the root directory:### 1. Compile Contract

```bash\`\`\`bash

cp .env.example .envcd Nounce

```npm run hardhat:compile

\`\`\`

Edit `.env` with your credentials:

### 2. Deploy to Sepolia

```env\`\`\`bash

# ===========================================npm run hardhat:deploy

# SERVER CONFIGURATION\`\`\`

# ===========================================

NODE_ENV=developmentSave the deployed contract address and update:

PORT=5001- \`backend/.env\` → \`CONTRACT_ADDRESS\`

FRONTEND_URL=http://localhost:5173- \`frontend/.env\` → \`VITE_CONTRACT_ADDRESS\`



# ===========================================### 3. Verify Contract (Optional)

# DATABASE CONFIGURATION\`\`\`bash

# ===========================================npm run hardhat:verify

MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/nounce\`\`\`



# ===========================================---

# AUTHENTICATION & SECURITY

# ===========================================## 🏃 Running the Application

JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

COOKIE_EXPIRES=7d### Development Mode



# ===========================================#### Terminal 1 - Backend

# PINATA IPFS CONFIGURATION\`\`\`bash

# ===========================================cd backend

PINATA_API_KEY=your_pinata_api_keynpm run dev

PINATA_SECRET_API_KEY=your_pinata_secret_api_key\`\`\`

Server runs on: http://localhost:5000

# ===========================================

# BLOCKCHAIN (OPTIONAL - KEEP DISABLED FOR GAS SAVINGS)#### Terminal 2 - Frontend

# ===========================================\`\`\`bash

ENABLE_BLOCKCHAIN=falsecd frontend

SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_IDnpm run dev

SEPOLIA_PRIVATE_KEY=your_private_key\`\`\`

CONTRACT_ADDRESS=your_contract_addressApp runs on: http://localhost:5173



# ===========================================### Production Build

# FRONTEND CONFIGURATION\`\`\`bash

# ===========================================# Backend

VITE_API_URL=http://localhost:5001cd backend

VITE_CONTRACT_ADDRESS=your_contract_addressnpm start

VITE_SEPOLIA_CHAIN_ID=11155111

```# Frontend

cd frontend

### 4. **Run the Application**npm run build

npm run preview

Open **two terminals**:\`\`\`



#### Terminal 1 - Backend---

```bash

cd backend## 🌐 Deployment to Vercel

npm run dev

```### 1. Install Vercel CLI

✅ Server runs on: **http://localhost:5001**\`\`\`bash

npm install -g vercel

#### Terminal 2 - Frontend\`\`\`

```bash

cd frontend### 2. Set Environment Variables

npm run devGo to Vercel Dashboard → Project → Settings → Environment Variables

```

✅ Frontend runs on: **http://localhost:5173** or **5174**Add all variables from \`.env\` files.



### 5. **Access the Application**### 3. Deploy

\`\`\`bash

Open your browser and navigate to:vercel

```\`\`\`

http://localhost:5173

```Or connect GitHub repo to Vercel for automatic deployments.



Connect your **MetaMask** wallet and start using Nounce!---



---## 📖 API Documentation



## 📚 API Documentation### Authentication

- \`POST /api/auth/register\` - Register with MetaMask

### **Base URL**: `http://localhost:5001/api`- \`POST /api/auth/login\` - Login with signature

- \`POST /api/auth/logout\` - Logout

### 🔐 **Authentication Routes** (`/api/auth`)- \`GET /api/auth/me\` - Get current user



| Method | Endpoint | Description | Auth Required |### Users

|--------|----------|-------------|---------------|- \`GET /api/user/me\` - My profile

| POST | `/api/auth/check-user` | Check if wallet is registered | No |- \`GET /api/user/:id\` - User by ID

| POST | `/api/auth/nonce` | Get nonce for wallet signature | No |- \`GET /api/user/wallet/:address\` - User by wallet

| POST | `/api/auth/register` | Register new user with MetaMask | No |- \`PUT /api/user/update\` - Update profile

| POST | `/api/auth/login` | Login with wallet signature | No |- \`POST /api/user/follow/:id\` - Follow/unfollow user

| POST | `/api/auth/logout` | Logout and clear cookie | Yes |- \`GET /api/user/recommended\` - Recommended users

- \`DELETE /api/user/delete\` - Delete account

### 👤 **User Routes** (`/api/user`)

### Posts

| Method | Endpoint | Description | Auth Required |- \`POST /api/post/new?type=image\` - Create post

|--------|----------|-------------|---------------|- \`GET /api/post/all\` - Get all posts

| GET | `/api/user/me` | Get current user profile | Yes |- \`GET /api/post/:id\` - Get post by ID

| GET | `/api/user/:id` | Get user profile by ID | Yes |- \`DELETE /api/post/:id\` - Delete post

| PUT | `/api/user/update-profile` | Update profile (name, bio, avatar) | Yes |- \`POST /api/post/like/:id\` - Like/unlike post

| POST | `/api/user/:id/follow` | Follow/unfollow user | Yes |- \`POST /api/post/comment/:id\` - Add comment

| GET | `/api/user/:id/followdata` | Get followers and following | Yes |- \`DELETE /api/post/comment/:id\` - Delete comment

| GET | `/api/user/recommended` | Get recommended users | Yes |

### Messages

### 📝 **Post Routes** (`/api/post`)- \`POST /api/message/send\` - Send message

- \`GET /api/message/:userId\` - Get messages with user

| Method | Endpoint | Description | Auth Required |- \`GET /api/message/chats\` - Get all chats

|--------|----------|-------------|---------------|- \`DELETE /api/message/:id\` - Delete message

| POST | `/api/post/new` | Create new post with media | Yes |- \`PUT /api/message/read/:chatId\` - Mark as read

| GET | `/api/post/all` | Get all posts (feed) | Yes |

| DELETE | `/api/post/:id` | Delete own post | Yes |---

| POST | `/api/post/:id/like` | Like/unlike post | Yes |

| POST | `/api/post/:id/comment` | Add comment to post | Yes |## 🧪 Testing



### 💬 **Message Routes** (`/api/message`)### Run Tests

\`\`\`bash

| Method | Endpoint | Description | Auth Required |# Backend

|--------|----------|-------------|---------------|cd backend

| POST | `/api/message/` | Send message | Yes |npm test

| GET | `/api/message/` | Get messages (query params) | Yes |

| GET | `/api/message/chats` | Get all chat conversations | Yes |# Frontend

cd frontend

---npm test

\`\`\`

## 📁 Project Structure

### Lint

```\`\`\`bash

Nounce/npm run lint

├── backend/npm run lint:fix

│   ├── controllers/        # Business logic\`\`\`

│   │   ├── authControllers.js

│   │   ├── userControllers.js---

│   │   ├── postController.js

│   │   └── messageControllers.js## 🎨 UI Specifications

│   ├── models/            # MongoDB schemas

│   │   ├── userModel.js### Login Page

│   │   ├── postModel.js- Header: 70px, #65d3c6 background

│   │   ├── chatModels.js- MetaMask button: 44px height, #9C95C8

│   │   └── messages.js- Form card: 420px width, border-radius 18px

│   ├── routes/            # API endpoints

│   │   ├── authRoutes.js### Homepage

│   │   ├── userRoutes.js- Sidebar: 290px width, #65d3c6

│   │   ├── postRoutes.js- Post cards: 580px width, #F8F9FF

│   │   └── messageRoutes.js- Avatar: 48px circular

│   ├── middlewares/       # Auth, upload, validation- Action buttons: 32px

│   │   ├── isAuth.js

│   │   └── middleware.js### Profile Page

│   ├── services/          # External services- Banner: 240px height

│   │   ├── pinataService.js- Avatar: 104px circular with white border

│   │   └── blockchainService.js- Stats display: followers/following count

│   ├── socket/            # Real-time chat

│   │   └── socket.js### Chat Page

│   ├── utils/             # Helper functions- Message bubbles: Turquoise (sender), White (receiver)

│   │   ├── generateTokens.js- Input: 88% width, send button #9C95C8

│   │   └── TryCatch.js- Timestamps: 14px, silver color

│   └── server.js          # Entry point

│---

├── frontend/

│   ├── src/## 🔒 Security Features

│   │   ├── components/    # Reusable UI components

│   │   │   ├── common/    # Toast, ErrorBoundary, Skeleton- ✅ Helmet.js security headers

│   │   │   ├── layout/    # Sidebar- ✅ Rate limiting (100 req/15min)

│   │   │   ├── post/      # PostCard, CreatePost- ✅ MongoDB injection prevention

│   │   │   └── ui/        # Button, Avatar, Input- ✅ XSS sanitization

│   │   ├── pages/         # Route pages- ✅ JWT authentication

│   │   │   ├── LoginPage/- ✅ CORS protection

│   │   │   ├── HomePage/- ✅ File upload validation

│   │   │   ├── ProfilePage/- ✅ Input validation with Joi

│   │   │   └── ChatPage/

│   │   ├── context/       # React Context---

│   │   │   └── Web3Context.jsx

│   │   ├── App.jsx        # Main app component## 🐛 Troubleshooting

│   │   └── main.jsx       # Entry point

│   ├── index.html### MetaMask Connection Issues

│   └── vite.config.js- Ensure MetaMask is unlocked

│- Switch to Sepolia network

├── contract.sol           # Solidity smart contract- Check browser console for errors

├── .env.example           # Environment template

└── README.md              # This file### Blockchain Transaction Failures

```- Ensure sufficient Sepolia ETH

- Check gas estimates

---- Verify contract address

- Check RPC URL connectivity

## 🎨 Design System

### IPFS Upload Errors

### **Color Palette**- Verify Pinata API credentials

```css- Check file size (max 50MB)

--color-primary: #65d3c6      /* Turquoise */- Ensure valid file types

--color-primary-dark: #169C96  /* Deep Cyan */

--color-accent: #9C95C8        /* Lavender */### MongoDB Connection

--color-background: #F8F9FF    /* Light Blue */- Verify connection string

--color-text-bold: #25272B     /* Dark Gray */- Check IP whitelist on Atlas

--color-white: #FFFFFF- Ensure database user permissions

```

---

### **Component Specifications**

- **Header Height**: 70px## 📝 License

- **Sidebar Width**: 290px (desktop), 84px (mobile)

- **Post Card Width**: 580px maxMIT License - see LICENSE file

- **Avatar Sizes**: 32px, 42px, 48px, 104px

- **Border Radius**: 12px (small), 18px (large)---

- **Shadows**: Multiple levels for depth

## 👥 Contributors

---

Nounce Team

## 🔧 Smart Contract Deployment (Optional)

---

If you want to enable blockchain features:

## 🙏 Acknowledgments

### 1. **Compile Contract**

```bash- Sepolia Testnet

npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox- Pinata IPFS

npx hardhat compile- MongoDB Atlas

```- MetaMask

- Hardhat

### 2. **Deploy to Sepolia**- ethers.js

```bash

npx hardhat run scripts/deploy.js --network sepolia---

```

## 📞 Support

### 3. **Update .env**

Add the deployed contract address:For issues and questions:

```env- GitHub Issues: [Create Issue]

ENABLE_BLOCKCHAIN=true- Documentation: [Wiki]

CONTRACT_ADDRESS=0x...

VITE_CONTRACT_ADDRESS=0x...---

```

**Built with ❤️ using Web3 technologies**

### 4. **Verify Contract** (Optional)
```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

---

## 🧪 Testing

### **Backend Tests**
```bash
cd backend
npm test
```

### **Frontend Tests**
```bash
cd frontend
npm test
```

### **Linting**
```bash
# Backend
cd backend
npm run lint

# Frontend
cd frontend
npm run lint
```

---

## 🚢 Production Deployment

### **Build Frontend**
```bash
cd frontend
npm run build
```
Output → `frontend/dist/`

### **Deploy Backend**

#### Option 1: Traditional Hosting (Heroku, Railway, etc.)
```bash
cd backend
npm start
```

#### Option 2: Vercel/Netlify
- Connect GitHub repository
- Set environment variables in dashboard
- Auto-deploy on push

### **Environment Variables**
Ensure all production environment variables are set:
- `MONGODB_URI` - Production database
- `JWT_SECRET` - Strong secret key
- `PINATA_API_KEY` - Production API keys
- `FRONTEND_URL` - Production frontend URL
- `NODE_ENV=production`

---

## 💡 Key Architecture Decisions

### **Why Hybrid Storage?**
1. **Gas Optimization**: Only IPFS hashes on-chain (~$0.50 per post vs $50+)
2. **Performance**: Fast reads from MongoDB cache
3. **Flexibility**: Can add features without blockchain upgrades
4. **User Experience**: No gas fees for likes/comments

### **Why Cookie-based Auth?**
- More secure than localStorage (httpOnly, SameSite)
- Automatic CSRF protection
- Better mobile support
- Seamless session management

### **Why Pinata IPFS?**
- Reliable gateway URLs
- No need for self-hosted IPFS node
- CDN-backed image delivery
- Simple API

---

## 🐛 Troubleshooting

### **MetaMask Connection Issues**
```bash
# Check:
✅ MetaMask is unlocked
✅ Connected to Sepolia network (if using blockchain)
✅ Browser console for errors
```

### **Backend Won't Start**
```bash
# Check:
✅ MongoDB connection string is correct
✅ Port 5001 is not in use (lsof -ti:5001)
✅ All environment variables are set
✅ Node version >= 18
```

### **Frontend Won't Connect**
```bash
# Check:
✅ VITE_API_URL is correct (http://localhost:5001)
✅ Backend is running
✅ CORS is configured for your frontend URL
```

### **IPFS Upload Fails**
```bash
# Check:
✅ Pinata API keys are valid
✅ File size < 50MB
✅ File type is allowed (image/video)
✅ Internet connection
```

### **Blockchain Transaction Errors**
```bash
# Check:
✅ ENABLE_BLOCKCHAIN is set to true
✅ Sufficient Sepolia ETH in wallet
✅ RPC URL is accessible
✅ Private key is correct (with 0x prefix)
```

---

## 📖 API Usage Examples

### **Register New User**
```javascript
// POST /api/auth/register
const formData = new FormData();
formData.append('name', 'John Doe');
formData.append('walletAddress', '0x123...');
formData.append('signature', '0xabc...');
formData.append('profilePicture', fileBlob);

const response = await fetch('http://localhost:5001/api/auth/register', {
  method: 'POST',
  body: formData,
  credentials: 'include'
});
```

### **Create Post**
```javascript
// POST /api/post/new
const formData = new FormData();
formData.append('caption', 'My first post!');
formData.append('media', imageFile);
formData.append('type', 'image');

const response = await fetch('http://localhost:5001/api/post/new', {
  method: 'POST',
  credentials: 'include',
  body: formData
});
```

### **Like Post**
```javascript
// POST /api/post/:id/like
const response = await fetch(`http://localhost:5001/api/post/${postId}/like`, {
  method: 'POST',
  credentials: 'include'
});

const data = await response.json();
// { message: "Post liked", liked: true }
```

---

## 🔒 Security Best Practices

✅ **Never commit `.env` file to Git**
✅ **Use strong JWT_SECRET** (32+ random characters)
✅ **Enable HTTPS** in production
✅ **Whitelist MongoDB Atlas IP** addresses
✅ **Rotate API keys** regularly
✅ **Keep private keys** in secure vaults
✅ **Use environment-specific** configurations
✅ **Enable rate limiting** on all endpoints
✅ **Sanitize user inputs** before database operations
✅ **Validate file uploads** (size, type, content)

---

## 📊 Gas Cost Comparison

| Operation | On-Chain | Off-Chain (MongoDB) | Savings |
|-----------|----------|---------------------|---------|
| Create Post | ~$5-15 | $0 | 100% |
| Like Post | ~$2-5 | $0 | 100% |
| Comment | ~$3-8 | $0 | 100% |
| Follow User | ~$2-5 | $0 | 100% |
| 10,000 Likes | ~$20,000 | $0 | 100% |

**With `ENABLE_BLOCKCHAIN=false`**: Zero gas costs, full functionality

---

## 🛣️ Roadmap

- [ ] Video streaming support
- [ ] NFT minting for posts
- [ ] Token-gated content
- [ ] Decentralized notifications
- [ ] Multi-chain support (Polygon, Arbitrum)
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Content moderation tools

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details

---

## 👥 Support

- **GitHub Issues**: [Create Issue](https://github.com/your-repo/issues)
- **Documentation**: This README
- **Email**: support@nounce.app

---

## 🙏 Acknowledgments

- [Ethereum Foundation](https://ethereum.org/)
- [Pinata IPFS](https://pinata.cloud/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [MetaMask](https://metamask.io/)
- [Hardhat](https://hardhat.org/)
- [ethers.js](https://docs.ethers.org/)
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)

---

**Built with ❤️ by the Nounce Team**

🌐 **Live Demo**: Coming Soon  
📧 **Contact**: team@nounce.app  
🐦 **Twitter**: [@NounceApp](https://twitter.com/nounceapp)

---

*"Decentralized social media, without the gas fees."*
