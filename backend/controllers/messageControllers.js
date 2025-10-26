import TryCatch from "../utils/TryCatch.js";
import Message from "../models/messages.js";
import Chat from "../models/chatModels.js";
import { User } from "../models/userModel.js";
import { getRecieverSocketId, io } from "../socket/socket.js";

/**
 * Send a message (wallet-based)
 */
export const sendMessage = TryCatch(async (req, res) => {
    const { message, receiverId } = req.body;
    const senderId = req.user._id;
    const senderWallet = req.user.walletAddress;

    if (!message || !receiverId) {
        return res.status(400).json({ message: "Message and receiver ID are required" });
    }

    // Find receiver
    const receiver = await User.findById(receiverId);
    if (!receiver) {
        return res.status(404).json({ message: "Receiver not found" });
    }

    const receiverWallet = receiver.walletAddress;

    try {
        // Find or create chat between these two users
        let chat = await Chat.findOne({
            userWallets: { $all: [senderWallet, receiverWallet] }
        });

        if (!chat) {
            // Create new chat
            chat = await Chat.create({
                users: [senderId, receiverId],
                userWallets: [senderWallet, receiverWallet],
                latestMessages: [],
            });
        }

        // Create message
        const newMessage = await Message.create({
            chat: chat._id,
            sender: senderId,
            senderWallet: senderWallet,
            content: message,
            readBy: [senderId],
        });

        // Update chat's latest messages
        chat.latestMessages.push({
            sender: senderId,
            senderWallet: senderWallet,
            content: message,
            timestamp: new Date(),
        });

        // Keep only last 10 messages in latestMessages array
        if (chat.latestMessages.length > 10) {
            chat.latestMessages = chat.latestMessages.slice(-10);
        }

        await chat.save();

        // Populate sender info
        await newMessage.populate('sender', 'name walletAddress profilePicture');

        // Emit socket event to receiver
        const receiverSocketId = getRecieverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json({
            message: "Message sent successfully",
            data: newMessage,
        });
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({
            message: "Failed to send message",
            error: error.message
        });
    }
});

/**
 * Get messages between two users (wallet-based)
 */
export const getMessages = TryCatch(async (req, res) => {
    const { userId } = req.params;
    const currentUserId = req.user._id;
    const currentUserWallet = req.user.walletAddress;

    // Find other user
    const otherUser = await User.findById(userId);
    if (!otherUser) {
        return res.status(404).json({ message: "User not found" });
    }

    const otherUserWallet = otherUser.walletAddress;

    try {
        // Find chat between these users
        const chat = await Chat.findOne({
            userWallets: { $all: [currentUserWallet, otherUserWallet] }
        });

        if (!chat) {
            return res.status(200).json({ messages: [] });
        }

        // Get all messages for this chat
        const messages = await Message.find({ chat: chat._id })
            .populate('sender', 'name walletAddress profilePicture')
            .sort({ createdAt: 1 });

        // Mark messages as read
        await Message.updateMany(
            {
                chat: chat._id,
                sender: userId,
                readBy: { $ne: currentUserId }
            },
            {
                $addToSet: { readBy: currentUserId }
            }
        );

        res.status(200).json({ messages });
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({
            message: "Failed to fetch messages",
            error: error.message
        });
    }
});

/**
 * Get all chats for current user
 */
export const getAllChats = TryCatch(async (req, res) => {
    const currentUserId = req.user._id;
    const currentUserWallet = req.user.walletAddress;

    try {
        const chats = await Chat.find({
            userWallets: currentUserWallet
        })
            .populate('users', 'name walletAddress profilePicture')
            .sort({ updatedAt: -1 });

        // Get unread count for each chat
        const chatsWithUnread = await Promise.all(
            chats.map(async (chat) => {
                const unreadCount = await Message.countDocuments({
                    chat: chat._id,
                    sender: { $ne: currentUserId },
                    readBy: { $ne: currentUserId }
                });

                const otherUser = chat.users.find(
                    user => user._id.toString() !== currentUserId.toString()
                );

                return {
                    _id: chat._id,
                    user: otherUser,
                    latestMessage: chat.latestMessages[chat.latestMessages.length - 1] || null,
                    unreadCount,
                    updatedAt: chat.updatedAt,
                };
            })
        );

        res.status(200).json({ chats: chatsWithUnread });
    } catch (error) {
        console.error("Error fetching chats:", error);
        res.status(500).json({
            message: "Failed to fetch chats",
            error: error.message
        });
    }
});

/**
 * Delete a message
 */
export const deleteMessage = TryCatch(async (req, res) => {
    const { messageId } = req.params;
    const currentUserId = req.user._id;

    const message = await Message.findById(messageId);

    if (!message) {
        return res.status(404).json({ message: "Message not found" });
    }

    // Only sender can delete
    if (message.sender.toString() !== currentUserId.toString()) {
        return res.status(403).json({ message: "Unauthorized: Only sender can delete message" });
    }

    await message.deleteOne();

    res.status(200).json({ message: "Message deleted successfully" });
});

/**
 * Mark messages as read
 */
export const markAsRead = TryCatch(async (req, res) => {
    const { chatId } = req.params;
    const currentUserId = req.user._id;

    await Message.updateMany(
        {
            chat: chatId,
            sender: { $ne: currentUserId },
            readBy: { $ne: currentUserId }
        },
        {
            $addToSet: { readBy: currentUserId }
        }
    );

    res.status(200).json({ message: "Messages marked as read" });
});
