import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IoCallOutline, IoSendOutline } from 'react-icons/io5';
import io from 'socket.io-client';
import Sidebar from '../../components/layout/Sidebar';
import Avatar from '../../components/ui/Avatar';
import { useToast } from '../../components/common/ToastContainer';
import './ChatPage.css';

const ChatPage = () => {
  const { id } = useParams(); // User ID from URL
  const navigate = useNavigate();
  const toast = useToast();
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  
  const [currentUser, setCurrentUser] = useState(null);
  const [chatUser, setChatUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    fetchCurrentUser();
    fetchChatUser();
    fetchMessages();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/me`, {
        credentials: 'include'
      });

      if (!response.ok) {
        navigate('/login');
        return;
      }

      const data = await response.json();
      if (data.user) {
        setCurrentUser(data.user);
        initializeSocket(data.user);
      }
    } catch (err) {
      console.error('Failed to fetch current user:', err);
      navigate('/login');
    }
  };

  const initializeSocket = (user) => {
    socketRef.current = io(import.meta.env.VITE_API_URL, {
      withCredentials: true,
      auth: {
        userId: user._id
      }
    });

    socketRef.current.on('connect', () => {
      console.log('Socket connected');
      socketRef.current.emit('join-chat', {
        senderId: user._id,
        receiverId: id
      });
    });

    socketRef.current.on('receive-message', (message) => {
      setMessages(prev => [...prev, message]);
      setTyping(false);
    });

    socketRef.current.on('user-typing', ({ userId: typingUserId }) => {
      if (typingUserId === id) {
        setTyping(true);
        setTimeout(() => setTyping(false), 3000);
      }
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      toast.error('Failed to connect to chat server');
    });
  };

  const fetchChatUser = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/user/${id}`,
        {
          credentials: 'include'
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();
      if (data.user) {
        setChatUser(data.user);
      }
    } catch (err) {
      console.error('Failed to fetch user details:', err);
      toast.error('Failed to fetch user details');
    }
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/message/${id}`,
        {
          credentials: 'include'
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      toast.error('Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!messageText.trim()) return;
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/message/send`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            receiverId: id,
            text: messageText
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Emit socket event
      if (socketRef.current && data.message) {
        socketRef.current.emit('send-message', {
          receiverId: id,
          message: data.message
        });
        
        setMessages(prev => [...prev, data.message]);
        setMessageText('');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleTyping = () => {
    if (socketRef.current) {
      socketRef.current.emit('typing', {
        receiverId: id,
        senderId: currentUser?._id
      });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const truncateAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="chat-page">
      <Sidebar user={currentUser} />
      
      <main className="chat-main">
        {/* Chat Header */}
        <div className="chat-header">
          <div className="chat-header-user">
            <Avatar 
              src={chatUser?.profilePicture?.url} 
              alt={chatUser?.name} 
              size={42} 
            />
            <div className="chat-header-info">
              <h3 className="chat-user-name">{chatUser?.name}</h3>
              <p className="chat-user-wallet">{truncateAddress(chatUser?.walletAddress)}</p>
            </div>
          </div>
          
          <button className="chat-call-btn" onClick={() => toast.info('Call feature coming soon!')}>
            <IoCallOutline />
          </button>
        </div>

        {/* Messages Window */}
        <div className="chat-messages">
          {loading ? (
            <div className="chat-loading">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="chat-empty">
              <h4>Start chatting now!</h4>
              <p>Send a message to start the conversation</p>
            </div>
          ) : (
            <>
              {messages.map((message, index) => {
                const isSender = message.sender === currentUser?._id || message.senderWallet === currentUser?.walletAddress;
                
                return (
                  <div 
                    key={message._id || index}
                    className={`message-bubble ${isSender ? 'message-sender' : 'message-receiver'}`}
                  >
                    {!isSender && (
                      <Avatar 
                        src={chatUser?.profilePicture?.url} 
                        alt={chatUser?.name} 
                        size={32}
                        className="message-avatar"
                      />
                    )}
                    <div className="message-content">
                      <p className="message-text">{message.text}</p>
                      <span className="message-time">{formatTime(message.createdAt)}</span>
                    </div>
                  </div>
                );
              })}
              {typing && (
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Message Input */}
        <form className="chat-input-container" onSubmit={handleSendMessage}>
          <input
            type="text"
            className="chat-input"
            placeholder="Type a message..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleTyping}
          />
          <button 
            type="submit"
            className="chat-send-btn"
            disabled={!messageText.trim()}
          >
            <IoSendOutline />
          </button>
        </form>
      </main>
    </div>
  );
};

export default ChatPage;
