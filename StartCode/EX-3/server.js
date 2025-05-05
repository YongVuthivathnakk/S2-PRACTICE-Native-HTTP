const http = require('http');
const fs = require('fs');
const { parse } = require('querystring');

const server = http.createServer((req, res) => {
    const url = req.url;
    const method = req.method;

    console.log(`Received ${method} request for ${url}`);

    if (url === '/' && method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        return res.end('Welcome to the Home Page');
    }

    if (url === '/contact' && method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
          <form method="POST" action="/contact">
            <input type="text" name="name" placeholder="Your name" required />
            <button type="submit">Submit</button>
          </form>
        `);
        return;
    }

    if (url === '/contact' && method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            const formData = parse(body);
            const name = formData.name?.trim();

            if (!name) {
                res.writeHead(400, { 'Content-Type': 'text/html' });
                return res.end(`
                    <html>
                        <head><title>Error</title></head>
                        <body>
                            <h1>Submission Failed</h1>
                            <p>Name is required. Please go back and try again.</p>
                        </body>
                    </html>
                `);
            }

            const entry = {
                name: name,
            };

            // Append JSON object to file
            fs.appendFile("submissions.json", JSON.stringify(entry) + '\n', (err) => {
                if (err) {
                    console.error('Error writing to file:', err);
                    res.writeHead(500, { 'Content-Type': 'text/html' });
                    return res.end(`
                        <html>
                            <head><title>Server Error</title></head>
                            <body>
                                <h1>Internal Server Error</h1>
                                <p>Could not save your submission.</p>
                            </body>
                        </html>
                    `);
                }

                console.log("Data saved:", entry);

                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(`
                    <html>
                        <head><title>Thank You</title></head>
                        <body>
                            <h1>Thank You, ${name}!</h1>
                            <p>Your submission was received successfully.</p>
                        </body>
                    </html>
                `);
            });
        });
        return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    return res.end('404 Not Found');
});

server.listen(3000, () => {
    console.log('Server is running at http://localhost:3000');
});
