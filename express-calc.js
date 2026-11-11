const express = require('express');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 3000;

// Built-in middleware to parse JSON and URL-encoded request bodies from clients
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * 1. Calculation Middleware
 * -------------------------------------------------------------
 * Intercepts incoming client requests, extracts numerical inputs,
 * performs mathematical calculations, and attaches the computed results
 * to the `req` object (as `req.calculation`) before passing control
 * to the server's route handler via `next()`.
 */
const calculationMiddleware = (req, res, next) => {
    // Extract inputs from query string (GET) or request body (POST)
    const num1 = parseFloat(req.query.num1 ?? req.body.num1 ?? 10);
    const num2 = parseFloat(req.query.num2 ?? req.body.num2 ?? 5);
    const operation = (req.query.operation ?? req.body.operation ?? 'add').toLowerCase();

    // Input validation
    if (isNaN(num1) || isNaN(num2)) {
        return res.status(400).json({
            error: "Invalid input: 'num1' and 'num2' must be valid numbers."
        });
    }

    let result;
    switch (operation) {
        case 'add':
        case '+':
            result = num1 + num2;
            break;
        case 'subtract':
        case '-':
            result = num1 - num2;
            break;
        case 'multiply':
        case '*':
            result = num1 * num2;
            break;
        case 'divide':
        case '/':
            if (num2 === 0) {
                return res.status(400).json({ error: "Division by zero is not allowed." });
            }
            result = num1 / num2;
            break;
        case 'power':
        case '^':
            result = Math.pow(num1, num2);
            break;
        default:
            return res.status(400).json({
                error: `Unsupported operation '${operation}'. Use add, subtract, multiply, divide, or power.`
            });
    }

    // Attach calculated data to the request object so downstream server route handlers can access it
    req.calculation = {
        inputs: { num1, num2, operation },
        result: result,
        computedAt: new Date().toISOString()
    };

    console.log(`[Middleware] Performed calculation: ${num1} ${operation} ${num2} = ${result}`);
    console.log(`[Middleware] Forwarding calculation to server route handler via req.calculation...\n`);

    // Pass control to the next handler (the server route)
    next();
};

/**
 * 2. Server Route Handler
 * -------------------------------------------------------------
 * Receives the request after the middleware has attached the
 * calculated data to `req.calculation`. It processes the data
 * and sends an HTTP response back to the client.
 */
app.all('/calculate', calculationMiddleware, (req, res) => {
    console.log(`[Server Route Handler] Received calculation from middleware:`, req.calculation);

    // Return the response to the client
    res.json({
        success: true,
        message: "Calculation processed by middleware and returned by server.",
        data: req.calculation
    });
});

/**
 * 3. Client Web Interface
 * -------------------------------------------------------------
 * Serves an interactive HTML client directly in the browser at http://localhost:3000
 */
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Client-Server Express Middleware Demo</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 640px; margin: 40px auto; padding: 20px; line-height: 1.6; background-color: #f7f9fa; }
                .card { background: white; padding: 24px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
                h2 { margin-top: 0; color: #2c3e50; }
                .form-group { margin-bottom: 14px; }
                label { display: block; font-weight: 600; margin-bottom: 4px; }
                input, select { width: 100%; box-sizing: border-box; padding: 10px; border: 1px solid #ccd0d5; border-radius: 6px; font-size: 15px; }
                button { background-color: #007bff; color: white; border: none; padding: 10px 18px; border-radius: 6px; font-size: 16px; cursor: pointer; font-weight: 600; }
                button:hover { background-color: #0056b3; }
                pre { background: #1e1e1e; color: #4af626; padding: 14px; border-radius: 8px; overflow-x: auto; font-size: 14px; }
                .flow-badge { display: inline-block; background: #e3f2fd; color: #0d47a1; padding: 4px 10px; border-radius: 20px; font-size: 13px; font-weight: bold; margin-bottom: 12px; }
            </style>
        </head>
        <body>
            <div class="card">
                <span class="flow-badge">Client &rarr; Middleware (Calculation) &rarr; Server &rarr; Client</span>
                <h2>Client-Server Calculation Demo</h2>
                <p>Send numbers to the server. The Express <b>middleware</b> calculates the result, passes it to the server handler via <code>req.calculation</code>, and the server replies.</p>
                
                <form id="calcForm">
                    <div class="form-group">
                        <label for="num1">First Number:</label>
                        <input type="number" id="num1" value="25" step="any" required />
                    </div>
                    <div class="form-group">
                        <label for="operation">Operation:</label>
                        <select id="operation">
                            <option value="add">Add (+)</option>
                            <option value="subtract">Subtract (-)</option>
                            <option value="multiply">Multiply (*)</option>
                            <option value="divide">Divide (/)</option>
                            <option value="power">Power (^)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="num2">Second Number:</label>
                        <input type="number" id="num2" value="4" step="any" required />
                    </div>
                    <button type="submit">Send Request to Server</button>
                </form>

                <h3>Server Response Received by Client:</h3>
                <pre id="responseOutput">Awaiting request...</pre>
            </div>

            <script>
                document.getElementById('calcForm').addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const num1 = document.getElementById('num1').value;
                    const num2 = document.getElementById('num2').value;
                    const operation = document.getElementById('operation').value;

                    document.getElementById('responseOutput').textContent = 'Sending request to server...';

                    try {
                        const res = await fetch('/calculate', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ num1, num2, operation })
                        });
                        const data = await res.json();
                        document.getElementById('responseOutput').textContent = JSON.stringify(data, null, 2);
                    } catch (err) {
                        document.getElementById('responseOutput').textContent = 'Error: ' + err.message;
                    }
                });
            </script>
        </body>
        </html>
    `);
});

// Start the Express server
const server = app.listen(PORT, () => {
    console.log(`======================================================================`);
    console.log(` [Server] Express Server running at: http://localhost:${PORT}`);
    console.log(` [Browser] Open http://localhost:${PORT} to test via web interface`);
    console.log(`======================================================================\n`);

    // 4. Automated Client Interaction (Built-in Terminal Client Demo)
    runClientDemo();
});

/**
 * 4. Terminal Client Simulation
 * -------------------------------------------------------------
 * Demonstrates the client-side interaction right in the console by sending
 * a sample POST request to the server, logging the full flow.
 */
function runClientDemo() {
    console.log(`[Client] Initiating client request...`);
    const payload = JSON.stringify({ num1: 15, num2: 3, operation: 'multiply' });
    console.log(`[Client] Sending payload: ${payload} to POST /calculate\n`);

    const req = http.request({
        hostname: 'localhost',
        port: PORT,
        path: '/calculate',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload)
        }
    }, (res) => {
        let responseBody = '';
        res.on('data', (chunk) => { responseBody += chunk; });
        res.on('end', () => {
            console.log(`[Client] Received response from server (Status ${res.statusCode}):`);
            console.log(JSON.stringify(JSON.parse(responseBody), null, 2));
            console.log(`\n======================================================================`);
            console.log(` Client-Server interaction complete! Press Ctrl+C to stop the server.`);
            console.log(`======================================================================\n`);
        });
    });

    req.on('error', (err) => {
        console.error(`[Client] Request failed:`, err.message);
    });

    req.write(payload);
    req.end();
}

