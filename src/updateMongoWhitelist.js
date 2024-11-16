const axios = require('axios');
const getClient = require('mongodb-atlas-api-client');

// MongoDB Atlas Project Details
var MONGODB_GROUP_ID = process.env.MONGODB_GROUP_ID;
var MONGODB_PUBLIC_KEY = process.env.MONGODB_PUBLIC_KEY;
var MONGODB_PRIVATE_KEY = process.env.MONGODB_PRIVATE_KEY;

// Initialize MongoDB Atlas Client
const { projectWhitelist } = getClient({
    "publicKey": MONGODB_PUBLIC_KEY,
    "privateKey": MONGODB_PRIVATE_KEY,
    "baseUrl": "https://cloud.mongodb.com/api/atlas/v1.0",
    "projectId": MONGODB_GROUP_ID
});

const options = {
    "envelope": true,
    "itemsPerPage": 10,
    "pretty": true,
    "httpOptions": { // This parameter will not be sent as querystring. This will be send to http request package `urllib`
        "timeout": 5000
    }
}

// Function to Get Render's Public IP Address
async function getPublicIP() {
    const res = await axios.get('https://api64.ipify.org?format=json');
    return res.data.ip;
}

// Function to Update the MongoDB Atlas Whitelist
async function updateMongoDBWhitelist(ip) {
    try {

        let responseWhitelist = await projectWhitelist.create([{
            ipAddress: ip,
            comment: 'Render Deployment'
        }])
        console.log(responseWhitelist);
        // let response = await projectWhitelist.getAll(options);
        // console.log(response.content.results);
        console.log('MongoDB IP whitelist updated with Render IP:', ip);
    } catch (error) {
        console.error('Error updating MongoDB whitelist:', error.response ? error.response.data : error.message);
    }
}

(async () => {
    try {
        const renderIP = await getPublicIP();
        await updateMongoDBWhitelist(renderIP);
    } catch (error) {
        console.error('Error updating MongoDB whitelist:', error);
    }
})();
