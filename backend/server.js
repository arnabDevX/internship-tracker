const app = require("./src/app");
const { connectDB } = require("./src/config/db");

const PORT = 5050;
const HOST = "127.0.0.1";

async function startServer() {
  await connectDB();

  app.listen(PORT, HOST, () => {
    console.log(`🚀 Server running on http://${HOST}:${PORT}`);
  });
}

startServer();