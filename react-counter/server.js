const http = require('http');
const fs = require('fs');
const path = require('path');

const port = Number(process.env.PORT) || 3000;
const dataPath = path.join(__dirname, 'counter-data.json');
const htmlPath = path.join(__dirname, 'counter.html');

function loadCounter() {
    try {
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        if (!Number.isSafeInteger(data.value)) {
            throw new Error('Counter data must contain a safe integer value.');
        }
        return data.value;
    } catch (error) {
        if (error.code === 'ENOENT') return 0;
        throw error;
    }
}

let counter = loadCounter();

function sendJson(response, status, data) {
    response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify(data));
}

function readJson(request) {
    return new Promise((resolve, reject) => {
        let body = '';
        let settled = false;
        request.on('data', chunk => {
            if (settled) return;
            body += chunk;
            if (body.length > 1024) {
                settled = true;
                reject(new Error('Request body is too large.'));
            }
        });
        request.on('end', () => {
            if (settled) return;
            try {
                resolve(JSON.parse(body));
            } catch {
                settled = true;
                reject(new Error('Request body must be valid JSON.'));
            }
        });
        request.on('error', error => {
            if (!settled) reject(error);
        });
    });
}

const server = http.createServer(async (request, response) => {
    const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);

    if (url.pathname === '/api/counter' && request.method === 'GET') {
        return sendJson(response, 200, { value: counter });
    }

    if (url.pathname === '/api/counter' && request.method === 'POST') {
        let body;
        try {
            body = await readJson(request);
        } catch (error) {
            if (!response.headersSent) sendJson(response, 400, { error: error.message });
            return;
        }

        let nextCounter;
        if (body.action === 'increment' && Number.isSafeInteger(counter + 1)) {
            nextCounter = counter + 1;
        } else if (body.action === 'decrement' && Number.isSafeInteger(counter - 1)) {
            nextCounter = counter - 1;
        } else if (body.action === 'reset') {
            nextCounter = 0;
        } else {
            return sendJson(response, 400, { error: 'Action must be increment, decrement, or reset.' });
        }

        try {
            const temporaryPath = `${dataPath}.tmp`;
            fs.writeFileSync(temporaryPath, JSON.stringify({ value: nextCounter }, null, 2));
            fs.renameSync(temporaryPath, dataPath);
            counter = nextCounter;
            return sendJson(response, 200, { value: counter });
        } catch (error) {
            console.error('Could not persist counter:', error);
            return sendJson(response, 500, { error: 'Could not save the counter.' });
        }
    }

    if ((url.pathname === '/' || url.pathname === '/counter.html') && request.method === 'GET') {
        response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return fs.createReadStream(htmlPath).pipe(response);
    }

    if (url.pathname === '/api/counter') {
        response.setHeader('Allow', 'GET, POST');
        return sendJson(response, 405, { error: 'Method not allowed.' });
    }

    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
});

server.listen(port, '127.0.0.1', () => {
    console.log(`Counter app running at http://localhost:${port}`);
});
