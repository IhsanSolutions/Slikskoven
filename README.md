# Slikskoven 

Slikskoven er en full-stack webapplikation med frontend, backend og database.

Projektet køres med **Docker Compose** og består af:

- **Frontend**: HTML, CSS og JavaScript serveret med Nginx
- **Backend**: Spring Boot
- **Database**: MySQL 8.4

---

## Krav

Du skal have installeret:

- Docker Desktop
- Git
- En browser

---

## Start projektet

Gå til projektets rodmappe, hvor `compose.yml` ligger.

Hvis du står i `backend`-mappen, så gå én mappe op:

```bash
cd ..
```

Start projektet:

```bash
docker compose up -d --build
```

Tjek at alt kører:

```bash
docker compose ps
```

Alle tre services skal stå som `Up`:

```text
slikskoven-db
slikskoven-backend
slikskoven-frontend
```

---

## Åbn siden

Frontend kører på:

```text
http://localhost:8081
```

Brug ikke `localhost:8080`, da port `8080` bruges af backend inde i Docker.

---

## Docker services

| Service | Beskrivelse |
|---|---|
| `frontend` | Nginx serverer frontend og sender API-kald videre |
| `backend` | Spring Boot applikation |
| `db` | MySQL database |

Frontend har port mapping:

```text
localhost:8081 -> container port 80
```

Backend kører internt på:

```text
backend:8080
```

Database kører internt på:

```text
db:3306
```

---

## Nyttige kommandoer

Start i baggrunden:

```bash
docker compose up -d
```

Start med rebuild:

```bash
docker compose up -d --build
```

Stop projektet:

```bash
docker compose down
```

Se containere:

```bash
docker compose ps
```

Se frontend logs:

```bash
docker compose logs frontend
```

Se backend logs:

```bash
docker compose logs backend
```

Rebuild uden cache:

```bash
docker compose build --no-cache
docker compose up -d
```

---

## Test

Test frontend:

```bash
curl http://localhost:8081
```

Test API gennem frontend/Nginx:

```bash
curl http://localhost:8081/api/products
```

---

## Fejlfinding

### Siden loader ikke

Tjek først:

```bash
docker compose ps
```

Hvis `frontend` ikke står som `Up`, så kør:

```bash
docker compose logs frontend
```

---

### Nginx-fejl med `mode=block`

Hvis du får fejlen:

```text
unknown directive "mode=block"
```

så skyldes det typisk denne linje:

```nginx
add_header X-XSS-Protection 1; mode=block always;
```

Fjern linjen, eller skriv den sådan:

```nginx
add_header X-XSS-Protection "1; mode=block" always;
```

Anbefalet løsning:

```nginx
add_header X-Frame-Options SAMEORIGIN always;
add_header X-Content-Type-Options nosniff always;
```

---

## Git note

Hvis du står i `backend`-mappen og har ændret en fil i `frontend`, skal du enten tilføje filen direkte:

```bash
git add ../frontend/nginx/nginx.conf
```

eller gå til projektets rodmappe:

```bash
cd ..
git add .
```

---

## Anbefalet start

```bash
docker compose down
docker compose up -d --build
docker compose ps
```

Åbn derefter:

```text
http://localhost:8081
```
