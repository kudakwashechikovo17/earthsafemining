const https = require('https');

// Seed ONLY missing data (fast - skips shifts/sales)
const data = JSON.stringify({
    email: 'demo@earthsafe.com'
});

const options = {
    hostname: 'earthsafe-backend.onrender.com',
    port: 443,
    path: '/api/demo/seed-missing',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log('Seeding MISSING data only (Expenses, Payroll, Compliance, Loans, Inventory)...');
console.log('This should be much faster than full seed!');

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
