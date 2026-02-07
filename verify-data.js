const https = require('https');
const fs = require('fs');

const logFile = 'verification_log.txt';
fs.writeFileSync(logFile, 'Starting verification...\n');

function log(msg) {
    console.log(msg);
    fs.appendFileSync(logFile, (typeof msg === 'object' ? JSON.stringify(msg, null, 2) : msg) + '\n');
}

// Verify data for demo user
const email = 'demo@earthsafe.com';
const password = 'password123'; // Reset by force-loans-compliance.js

const loginData = JSON.stringify({ email, password });

const hostname = 'earthsafe-backend.onrender.com';

log('1. Logging in as demo user...');

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
            log('Login Failed: ' + res.statusCode + ' ' + body);
            return;
        }

        try {
            const response = JSON.parse(body);
            const token = response.token;
            // OrgID usually not in login response unless custom, but let's check
            const orgId = response.user.orgId || 'undefined';

            log(`Login Success! UserID: ${response.user.id}, OrgID (from login): ${orgId}`);

            // Step 2: Fetch Profile Stats
            fetchStats(token);
        } catch (e) {
            log('Error parsing login response: ' + e.message);
        }
    });
});

loginReq.write(loginData);
loginReq.end();

function fetchStats(token) {
    log('\n2. Fetching Profile Stats (/api/users/stats)...');
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
            log('Profile Stats Response: ' + res.statusCode);
            log(body);
            fetchProfile(token); // Chain
        });
    });
    req.end();
}

function fetchProfile(token) {
    log('\n3. Fetching User Profile (/api/users/profile)...');
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
            // log(body); // Verbose
            fetchMyOrgs(token);
        });
    });
    req.end();
}

function fetchMyOrgs(token) {
    log('\n4. Fetching My Orgs to get OrgID...');
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
            try {
                const orgs = JSON.parse(body);
                log(`Found ${orgs.length} orgs.`);
                if (orgs.length > 0) {
                    const orgId = orgs[0]._id;
                    log(`Using Primary OrgID: ${orgId} Name: ${orgs[0].name}`);

                    // NOW fetch specific lists
                    fetchOrgData(token, orgId, 'loans', 'Loans');
                    fetchOrgData(token, orgId, 'compliance/documents', 'Compliance Docs');
                    fetchOrgData(token, orgId, 'compliance/incidents', 'Incidents');
                } else {
                    log('No organizations found for this user!');
                }
            } catch (e) {
                log('Error parsing orgs: ' + e.message + ' Body: ' + body);
            }
        });
    });
    req.end();
}

function fetchOrgData(token, orgId, endpoint, label) {
    log(`\n5. Fetching ${label} (/api/orgs/${orgId}/${endpoint})...`);
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
            log(`${label} Status: ${res.statusCode}`);
            log(`${label} Data: ` + body);
        });
    });
    req.end();
}
