const express = require("express");
const { connect, StringCodec } = require("nats");

async function createPingClient(url) {
  const nc = await connect({ servers: url });
  const sc = StringCodec();

  return {
    async requestHello(payload) {
      const response = await nc.request(
        "worker.hello",
        sc.encode(JSON.stringify(payload || {})),
        { timeout: 2000 }
      );
      return JSON.parse(sc.decode(response.data));
    },
    close() {
      return nc.close();
    },
  };
}

function createApp(pingClient) {
  const app = express();

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "public-service" });
  });

  app.get("/hello/:firstName", async (req, res) => {
    try {
      const firstName = String(req.params.firstName || "").trim();
      if (!firstName) {
        res.status(400).json({ ok: false, error: "firstName is required" });
        return;
      }

      const result = await pingClient.requestHello({ firstName });
      res.json({ ok: true, data: result });
    } catch (error) {
      res.status(500).json({ ok: false, error: "NATS request failed" });
    }
  });

  return app;
}

async function bootstrap() {
  const natsUrl = process.env.NATS_URL || "nats://localhost:4222";
  const port = Number(process.env.PORT || 3000);

  const pingClient = await createPingClient(natsUrl);
  const app = createApp(pingClient);

  const server = app.listen(port, () => {
    console.log(`public-service listening on port ${port}`);
  });

  const shutdown = async () => {
    server.close();
    await pingClient.close();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

if (require.main === module) {
  bootstrap().catch((error) => {
    console.error("public-service failed to start:", error);
    process.exit(1);
  });
}

module.exports = { createApp };
