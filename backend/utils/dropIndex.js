import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function dropIndex() {
    try {
        const mongoUrl = process.env.MONGODB_URL;
        console.log('Connecting to MongoDB...');
        
        await mongoose.connect(mongoUrl, {
            dbName: 'social_media_app'
        });
        
        console.log('Connected to MongoDB');
        
        const db = mongoose.connection.db;
        await db.collection('users').dropIndex('username_1');
        
        console.log('✅ Successfully dropped username_1 index');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

dropIndex();
