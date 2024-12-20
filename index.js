const http = require("http");
const redis = require("redis");

// Configure Redis client
const redisClient = redis.createClient({
  socket: {
    host: "clustercfg.elasti-cache1.n49gq2.use1.cache.amazonaws.com:6379", // Replace with your Redis endpoint
    port: 6379, // Default Redis port
  },
});

// Connect to Redis
redisClient.connect().catch((err) => console.error("Redis Connection Error:", err));

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
