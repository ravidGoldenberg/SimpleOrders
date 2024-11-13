const axios = require('axios');
const crypto = require('crypto');

// MongoDB Atlas Project Details
var MONGODB_GROUP_ID = process.env.MONGODB_GROUP_ID;
var MONGODB_PUBLIC_KEY = process.env.MONGODB_PUBLIC_KEY;
var MONGODB_PRIVATE_KEY = process.env.MONGODB_PRIVATE_KEY;

// Function to Get Render's Public IP Address
async function getPublicIP() {
    const res = await axios.get('https://api64.ipify.org?format=json');
    return res.data.ip;
}

// Function to Create a MongoDB Atlas API Request
async function updateMongoDBWhitelist(ip) {
    const date = new Date().toUTCString();
    const path = `/api/atlas/v1.0/groups/${MONGODB_GROUP_ID}/accessList`;

    // Generate API request signature
    const payload = `GET\n${date}\n${path}\n\n`;
    const signature = crypto.createHmac('sha1', MONGODB_PRIVATE_KEY).update(payload).digest('base64');

    // MongoDB API request headers
    const headers = {
        'Authorization': `MongoDB ${MONGODB_PUBLIC_KEY}:${signature}`,
        'Date': date,
        'Content-Type': 'application/json'
    };

    // Add the Render IP to the whitelist
    await axios.post(`https://cloud.mongodb.com${path}`,
        { ipAddress: ip, comment: 'Render Deployment' },
        { headers }
    );
}

(async () => {
    try {
        const renderIP = await getPublicIP();
        await updateMongoDBWhitelist(renderIP);
        console.log('MongoDB IP whitelist updated with Render IP:', renderIP);
    } catch (error) {
        console.error('Error updating MongoDB whitelist:', error);
    }
})();
