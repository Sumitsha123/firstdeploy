const http = require("http");
const redis = require('redis');

// Replace 'clustercfg.elasti-cache1.n49gq2.use1.cache.amazonaws.com' with your Redis endpoint
const redisClient = redis.createClient({
  socket: {
    host: 'clustercfg.elasti-cache1.n49gq2.use1.cache.amazonaws.com',
    port: 6379,
  },
});

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

redisClient.on('error', (err) => {
  console.error('Redis Connection Error:', err);
});

(async () => {
  try {
    await redisClient.connect();

    // Test Redis set and get operations
    await redisClient.set('test-key', 'Hello, Redis!');
    const value = await redisClient.get('test-key');
    console.log('Redis Test Value:', value);

    // Keep the connection open for the application
  } catch (err) {
    console.error('Error during Redis operations:', err);
  }
})();

const server = http.createServer(async (req, res) => {
  if (req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/html" });
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
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("404 Not Found");
  }
});

server.listen(3100, () => console.log("Server running on http://localhost:3100"));
