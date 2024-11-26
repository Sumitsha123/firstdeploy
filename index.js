const http = require("http");

const server = http.createServer((req, res) => {
  if (req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Live Digital Clock</title>
                <style>
                    body {
                        display: flex;
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
                </style>
            </head>
            <body>
                <h1 id="clock"></h1>
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

server.listen(3000, () =>
  console.log("Server running on http://localhost:3000")
);
