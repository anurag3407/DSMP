import axios from 'axios';
import FormData from 'form-data';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

class PinataService {
    constructor() {
        this.apiKey = process.env.PINATA_API_KEY;
        this.apiSecret = process.env.PINATA_SECRET_API_KEY;
        this.baseURL = 'https://api.pinata.cloud';
        this.gatewayURL = 'https://gateway.pinata.cloud/ipfs';
    }

    /**
     * Upload file to Pinata IPFS
     * @param {Buffer} fileBuffer - File buffer
     * @param {string} fileName - Original filename
     * @param {object} metadata - Optional metadata
     * @returns {Promise<object>} - IPFS hash and URL
     */
    async uploadFile(fileBuffer, fileName, metadata = {}) {
        try {
            const formData = new FormData();
            formData.append('file', fileBuffer, fileName);

            const pinataMetadata = JSON.stringify({
                name: fileName,
                keyvalues: metadata
            });
            formData.append('pinataMetadata', pinataMetadata);

            const pinataOptions = JSON.stringify({
                cidVersion: 1,
            });
            formData.append('pinataOptions', pinataOptions);

            const response = await axios.post(
                `${this.baseURL}/pinning/pinFileToIPFS`,
                formData,
                {
                    headers: {
                        'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
                        'pinata_api_key': this.apiKey,
                        'pinata_secret_api_key': this.apiSecret,
                    },
                    maxBodyLength: Infinity,
                }
            );

            return {
                success: true,
                ipfsHash: response.data.IpfsHash,
                url: `${this.gatewayURL}/${response.data.IpfsHash}`,
                pinSize: response.data.PinSize,
                timestamp: response.data.Timestamp,
            };
        } catch (error) {
            console.error('Error uploading to Pinata:', error.response?.data || error.message);
            throw new Error(`Pinata upload failed: ${error.message}`);
        }
    }

    /**
     * Upload base64 image to Pinata
     * @param {string} base64Data - Base64 encoded image
     * @param {string} fileName - Filename
     * @returns {Promise<object>} - IPFS hash and URL
     */
    async uploadBase64(base64Data, fileName) {
        try {
            // Remove data URL prefix if present
            const base64Image = base64Data.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(base64Image, 'base64');

            return await this.uploadFile(buffer, fileName);
        } catch (error) {
            console.error('Error uploading base64 to Pinata:', error);
            throw new Error(`Pinata base64 upload failed: ${error.message}`);
        }
    }

    /**
     * Upload JSON to Pinata
     * @param {object} jsonData - JSON object
     * @param {string} name - Name for the JSON file
     * @returns {Promise<object>} - IPFS hash and URL
     */
    async uploadJSON(jsonData, name) {
        try {
            const response = await axios.post(
                `${this.baseURL}/pinning/pinJSONToIPFS`,
                {
                    pinataContent: jsonData,
                    pinataMetadata: {
                        name: name,
                    },
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'pinata_api_key': this.apiKey,
                        'pinata_secret_api_key': this.apiSecret,
                    },
                }
            );

            return {
                success: true,
                ipfsHash: response.data.IpfsHash,
                url: `${this.gatewayURL}/${response.data.IpfsHash}`,
                pinSize: response.data.PinSize,
                timestamp: response.data.Timestamp,
            };
        } catch (error) {
            console.error('Error uploading JSON to Pinata:', error.response?.data || error.message);
            throw new Error(`Pinata JSON upload failed: ${error.message}`);
        }
    }

    /**
     * Delete (unpin) file from Pinata
     * @param {string} ipfsHash - IPFS hash to unpin
     * @returns {Promise<boolean>} - Success status
     */
    async deleteFile(ipfsHash) {
        try {
            await axios.delete(
                `${this.baseURL}/pinning/unpin/${ipfsHash}`,
                {
                    headers: {
                        'pinata_api_key': this.apiKey,
                        'pinata_secret_api_key': this.apiSecret,
                    },
                }
            );

            return true;
        } catch (error) {
            console.error('Error deleting from Pinata:', error.response?.data || error.message);
            // Don't throw error for deletion failures
            return false;
        }
    }

    /**
     * Get file metadata from Pinata
     * @param {string} ipfsHash - IPFS hash
     * @returns {Promise<object>} - File metadata
     */
    async getFileMetadata(ipfsHash) {
        try {
            const response = await axios.get(
                `${this.baseURL}/data/pinList?hashContains=${ipfsHash}`,
                {
                    headers: {
                        'pinata_api_key': this.apiKey,
                        'pinata_secret_api_key': this.apiSecret,
                    },
                }
            );

            return response.data.rows[0] || null;
        } catch (error) {
            console.error('Error fetching metadata from Pinata:', error);
            return null;
        }
    }

    /**
     * Test Pinata connection
     * @returns {Promise<boolean>} - Connection status
     */
    async testConnection() {
        try {
            const response = await axios.get(
                `${this.baseURL}/data/testAuthentication`,
                {
                    headers: {
                        'pinata_api_key': this.apiKey,
                        'pinata_secret_api_key': this.apiSecret,
                    },
                }
            );

            console.log('Pinata connection successful:', response.data);
            return true;
        } catch (error) {
            console.error('Pinata connection failed:', error.response?.data || error.message);
            return false;
        }
    }

    /**
     * Extract IPFS hash from URL
     * @param {string} url - Pinata or IPFS URL
     * @returns {string} - IPFS hash
     */
    extractIPFSHash(url) {
        if (!url) return null;

        // Handle different URL formats
        const patterns = [
            /ipfs\/([a-zA-Z0-9]+)/,
            /\/([a-zA-Z0-9]+)$/,
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) return match[1];
        }

        return null;
    }
}

// Export singleton instance
const pinataService = new PinataService();

export default pinataService;
