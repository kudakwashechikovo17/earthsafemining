const https = require('https');

// Force-add Loans and Compliance (clears and re-adds)
const data = JSON.stringify({
    email: 'demo@earthsafe.com'
});

const options = {
    hostname: 'earthsafe-backend.onrender.com',
    port: 443,
    path: '/api/demo/force-loans-compliance',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log('Force-adding Loans and Compliance...');
console.log('This clears existing data and adds fresh records.');

const req = https.request(options, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log('Response:', body);
    });
});

req.on('error', (e) => {
    console.error('Error:', e.message);
});

req.write(data);
req.end();
