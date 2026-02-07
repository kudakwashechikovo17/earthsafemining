const https = require('https');

// Verify data for demo user
const email = 'demo@earthsafe.com';
const password = 'password123'; // Assuming default password for demo

const loginData = JSON.stringify({ email, password });

const hostname = 'earthsafe-backend.onrender.com';
// const hostname = 'localhost'; // If I could check local, but user is on prod
// const port = 5000;

console.log('1. Logging in as demo user...');

const loginReq = https.request({
    hostname: hostname,
    port: 443,
    path: '/api/users/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': loginData.length
    }
}, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
        if (res.statusCode !== 200) {
            console.error('Login Failed:', res.statusCode, body);
            return;
        }

        const response = JSON.parse(body);
        const token = response.token;
        const orgId = response.user.orgId || 'undefined'; // Might be in user or we need to fetch profile

        console.log(`Login Success! UserID: ${response.user.id}, OrgID (from login): ${orgId}`);
        console.log('Token received.');

        // Step 2: Fetch Profile to confirm OrgID
        verifyProfile(token);
    });
});

loginReq.write(loginData);
loginReq.end();

function verifyProfile(token) {
    console.log('\n2. Fetching Profile Stats...');
    const req = https.request({
        hostname: hostname,
        port: 443,
        path: '/api/users/stats',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
            console.log('Profile Stats Response:', res.statusCode);
            console.log(body);
            verifyLoans(token); // Chain to next
        });
    });
    req.end();
}

function verifyLoans(token) {
    console.log('\n3. Fetching Loans...');
    // We need the OrgID to fetch loans usually, but let's try the generic "my-orgs" endpoint or guess the route
    // Based on apiService: getLoans: GET /orgs/:orgId/loans
    // We need to fetch the user's org first to know the ID.

    // Let's first fetch the User Profile to get the membership/org
    const req = https.request({
        hostname: hostname,
        port: 443,
        path: '/api/users/profile',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
            // Need to get Membership actually, usually /orgs/my-orgs
            verifyMyOrgs(token);
        });
    });
    req.end();
}

function verifyMyOrgs(token) {
    console.log('\n4. Fetching My Orgs to get OrgID...');
    const req = https.request({
        hostname: hostname,
        port: 443,
        path: '/api/orgs/my-orgs',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
            const orgs = JSON.parse(body);
            console.log(`Found ${orgs.length} orgs.`);
            if (orgs.length > 0) {
                const orgId = orgs[0]._id;
                console.log(`Using OrgID: ${orgId}`);

                // NOW fetch specific lists
                fetchOrgData(token, orgId, 'loans');
                fetchOrgData(token, orgId, 'compliance/documents');
            } else {
                console.error('No organizations found for this user!');
            }
        });
    });
    req.end();
}

function fetchOrgData(token, orgId, endpoint) {
    console.log(`\n5. Fetching /api/orgs/${orgId}/${endpoint}...`);
    const req = https.request({
        hostname: hostname,
        port: 443,
        path: `/api/orgs/${orgId}/${endpoint}`,
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
            console.log(`${endpoint} Status: ${res.statusCode}`);
            // console.log(`${endpoint} Data:`, body.substring(0, 200) + '...');
            console.log(`${endpoint} Full Data:`, body);
        });
    });
    req.end();
}
