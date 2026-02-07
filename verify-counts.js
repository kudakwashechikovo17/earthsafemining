const https = require('https');

const hostname = 'earthsafe-backend.onrender.com';
const email = 'demo@earthsafe.com';
const password = 'password123';

console.log('Starting Verification...');

const loginData = JSON.stringify({ email, password });

const req = https.request({
    hostname: hostname,
    port: 443,
    path: '/api/users/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': loginData.length }
}, (res) => {
    let body = '';
    res.on('data', c => body += c);
    res.on('end', () => {
        if (res.statusCode !== 200) { console.log('Login Failed', res.statusCode); return; }
        const token = JSON.parse(body).token;
        verifyMyOrgs(token);
    });
});
req.write(loginData);
req.end();

function verifyMyOrgs(token) {
    https.get({
        hostname, path: '/api/orgs/my-orgs', headers: { Authorization: `Bearer ${token}` }
    }, (res) => {
        let body = '';
        res.on('data', c => body += c);
        res.on('end', () => {
            const orgs = JSON.parse(body);
            if (orgs.length === 0) { console.log('No Orgs'); return; }
            const orgId = orgs[0]._id;
            fetchAll(token, orgId);
        });
    });
}

function fetchAll(token, orgId) {
    let loans = 0, docs = 0, incidents = 0, checklists = 0;

    let pending = 4;

    const checkDone = () => {
        pending--;
        if (pending === 0) {
            console.log(`FINAL_COUNTS | Loans: ${loans} | Docs: ${docs} | Incidents: ${incidents} | Checklists: ${checklists}`);
        }
    };

    const get = (url, cb) => {
        https.get({ hostname, path: url, headers: { Authorization: `Bearer ${token}` } }, (res) => {
            let body = '';
            res.on('data', c => body += c);
            res.on('end', () => {
                try { cb(JSON.parse(body)); } catch (e) { cb([]); }
                checkDone();
            });
        });
    };

    get(`/api/orgs/${orgId}/loans`, (data) => { loans = data.length || 0; });
    get(`/api/orgs/${orgId}/compliance/documents`, (data) => { docs = data.length || 0; });
    get(`/api/orgs/${orgId}/compliance/incidents`, (data) => { incidents = data.length || 0; });
    get(`/api/orgs/${orgId}/compliance/checklists`, (data) => { checklists = data.length || 0; }); // Guessing route?
}
