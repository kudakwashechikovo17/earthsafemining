const https = require('https');

const data = JSON.stringify({
    email: 'demo@earthsafe.com'
});

const options = {
    hostname: 'earthsafe-backend.onrender.com', // No https:// here
    port: 443,
    path: '/api/demo/seed',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const makeRequest = () => {
    console.log('Attempting to seed data...');
    const req = https.request(options, (res) => {
        console.log(`Response Status: ${res.statusCode}`);

        if (res.statusCode === 404) {
            console.log('Server not ready yet (404). Retrying in 10 seconds...');
            setTimeout(makeRequest, 10000);
        } else if (res.statusCode === 200) {
            console.log('SUCCESS! Data seeding started.');
            res.on('data', (d) => process.stdout.write(d));
        } else {
            console.log('Unexpected status.');
            res.on('data', (d) => process.stdout.write(d));
        }
    });

    req.on('error', (error) => {
        console.error('Connection error, retrying...', error.message);
        setTimeout(makeRequest, 10000);
    });

    req.write(data);
    req.end();
};

makeRequest();
