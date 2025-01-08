### Command

```bash
docker compose up -d
```

### Init dev environment

```bash
docker compose --env-file .env.dev -f docker-compose.dev.yml up -d
```

### build image

```bash
docker build -f ./docker/app/dockerfile -t ychat-be .
```
