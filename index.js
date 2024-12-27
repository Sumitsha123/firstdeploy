require('dotenv').config();
const https = require("https");
const fs = require("fs");
const redis = require('redis');

// Load SSL certificates
const options = {
    key: fs.readFileSync('/path/to/your/private.key'),  // Path to your private key
    cert: fs.readFileSync('/path/to/your/certificate.crt'),  // Path to your certificate
    ca: fs.readFileSync('/path/to/your/ca-bundle.crt')  // Optional, if you have a CA chain
};

// Initialize Redis client
const redisClient = redis.createClient({
    socket: {
        host: process.env.REDIS_HOST || 'clustercfg.elasti-cache1.n49gq2.use1.cache.amazonaws.com',
        port: process.env.REDIS_PORT || 6379,
    },
    password: process.env.REDIS_PASSWORD, // Optional if Redis cluster uses authentication
});

redisClient.on('connect', () => {
    console.log('Connected to Redis');
});

redisClient.on('error', (err) => {
    console.error('Redis Connection Error:', err);
});

// Connect to Redis
(async () => {
    try {
        await redisClient.connect();
        console.log("Redis connection successful.");
    } catch (err) {
        console.error("Error connecting to Redis:", err);
    }
})();

// Create HTTPS Server
const HOST = process.env.HOST || '0.0.0.0'; // Listen on all interfaces by default
const PORT = process.env.PORT || 3100;

const server = https.createServer(options, async (req, res) => {
    if (req.url === "/") {
        res.writeHead(200, { "Content-Type": "text/html" });
        try {
            const visits = await redisClient.incr("visits"); // Increment and get the number of visits
            res.end(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Live Digital Clock</title>
                    <style>
                        body {
                            display: flex;
                            flex-direction: column;
                            justify-content: center;
                            align-items: center;
                            height: 100vh;
                            margin: 0;
                            font-family: Arial, sans-serif;
                            background-color: #282c34;
                            color: white;
                        }
                        h1 {
                            font-size: 4rem;
                        }
                        p {
                            font-size: 1.5rem;
                        }
                    </style>
                </head>
                <body>
                    <h1 id="clock"></h1>
                    <p>Number of visits: ${visits}</p>
                    <script>
                        function updateClock() {
                            const now = new Date();
                            document.getElementById("clock").innerText = now.toLocaleTimeString();
                        }
                        setInterval(updateClock, 1000);
                        updateClock();
                    </script>
                </body>
                </html>
            `);
        } catch (err) {
            console.error("Error incrementing Redis key:", err);
            res.end("<h1>Something went wrong!</h1>");
        }
    } else {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("404 Not Found");
    }
});

// Start the server
server.listen(PORT, HOST, () => console.log(`Server running on https://${HOST}:${PORT}`));

// Graceful shutdown
process.on('SIGINT', async () => {
    try {
        console.log("Shutting down server...");
        await redisClient.quit();
        console.log("Redis connection closed.");
        process.exit(0);
    } catch (err) {
        console.error("Error closing Redis connection:", err);
        process.exit(1);
    }
});
