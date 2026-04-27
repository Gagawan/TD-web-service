const { connect, StringCodec } = require("nats");

function buildGreeting(payload) {
  const firstName = String(payload.firstName || "").trim() || "inconnu";
  return {
    ok: true,
    from: "worker-service",
    message: `Bonjour ${firstName}`,
  };
}

async function bootstrap() {
  const natsUrl = process.env.NATS_URL || "nats://localhost:4222";
  const nc = await connect({ servers: natsUrl });
  const sc = StringCodec();

  const sub = nc.subscribe("worker.hello");
  console.log("worker-service subscribed to worker.hello");

  for await (const msg of sub) {
    try {
      const payload = JSON.parse(sc.decode(msg.data || sc.encode("{}")));
      const response = buildGreeting(payload);
      msg.respond(sc.encode(JSON.stringify(response)));
    } catch (error) {
      msg.respond(
        sc.encode(
          JSON.stringify({
            pong: false,
            error: "invalid payload",
            details: error.message,
          })
        )
      );
    }
  }
}

if (require.main === module) {
  bootstrap().catch((error) => {
    console.error("worker-service failed to start:", error);
    process.exit(1);
  });
}

module.exports = { buildGreeting };
