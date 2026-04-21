const app = require("./app");
const { port } = require("./config/env");
const { connectDatabase, sequelize } = require("./config/database");

let server;

async function startServer() {
    await connectDatabase();

    server = app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}

async function shutdown(signal) {
    console.log(`${signal} received. Shutting down!`);

    if (server) {
        server.close(async () => {
            await sequelize.close();
            process.exit(0);
        });
        return;
    }

    await sequelize.close();
    process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

startServer().catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
});