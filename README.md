# TD web-service

- `public-service` (HTTP, port 3000)
- `worker-service` (NATS)

## Lancement

```bash
pnpm install
docker compose up -d nats
pnpm --filter worker-service start
pnpm --filter public-service start
```

## Vérification

```bash
curl http://localhost:3000/health
curl http://localhost:3000/hello/Jean
```

## Stop NATS

```bash
docker compose stop nats
```
