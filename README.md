# Slikskoven 🍬

En moderne full-stack webapplikation til Slikskoven - et candy shop management system.

## 🏗️ Arkitektur

### Backend (Spring Boot)
- **Framework**: Spring Boot 4.0.6
- **Database**: H2 (development) / MySQL (production)
- **ORM**: JPA/Hibernate
- **Security**: Spring Security
- **Testing**: JUnit 5 + Mockito

### Frontend (Vanilla JavaScript)
- **HTML5**: Semantisk markup
- **CSS3**: Responsive design
- **JavaScript**: ES6+ med Fetch API
- **Kommunikation**: REST endpoints

## 📁 Projekt Struktur

```
slikskoven/
├── frontend/                      # Frontend applikation
│   ├── src/                      # Kildekode (HTML, CSS, JS)
│   ├── dist/                     # Bygget version
│   ├── build/                    # Build scripts
│   ├── nginx/                    # Nginx konfiguration
│   ├── package.json             # Frontend dependencies
│   └── README.md                # Frontend dokumentation
├── src/main/java/               # Backend Java kode
│   ├── controller/              # REST controllere
│   ├── service/                 # Forretningslogik
│   ├── model/                   # JPA entiteter
│   ├── repository/              # Data access
│   └── dto/                     # Data transfer objekter
├── src/main/resources/          # Backend ressourcer
│   ├── static/                  # Frontend filer (efter build)
│   ├── templates/               # Thymeleaf templates
│   └── application.properties   # Konfiguration
├── src/test/                    # Unit tests
└── pom.xml                      # Maven konfiguration
```

## 🚀 Installation & Kørsel

### Prerequisites
- Java 25+
- Maven 3.6+
- Node.js 16+ (for frontend development)
- MySQL (for production)

### Backend Setup

```bash
# Klon projektet
git clone <repository-url>
cd slikskoven

# Kør tests
./mvnw test

# Start backend
./mvnw spring-boot:run
```

Backend kører på: `http://localhost:8080`

### Frontend Setup

```bash
# Gå til frontend directory
cd frontend

# Installér dependencies
npm install

# Byg og deploy til Spring Boot
npm run deploy

# Eller kør development server
npm run dev
```

Frontend tilgængelig på: `http://localhost:8080/index.html`

## 🔗 API Endpoints

### Produkter
- `GET /api/products` - Alle produkter
- `GET /api/products/{id}` - Produkt efter ID
- `GET /api/products/search?name=...` - Søg efter navn
- `GET /api/products/category/{category}` - Filtrer efter kategori
- `GET /api/products/gelatine-free` - Kun gelatinefri
- `POST /api/products` - Opret produkt

### Nyheder
- `GET /api/news` - Alle nyheder
- `GET /api/news/{id}` - Nyhed efter ID
- `POST /api/news` - Opret nyhed

### Ordrer
- `GET /api/orders` - Alle ordrer
- `GET /api/orders/{id}` - Ordre efter ID
- `POST /api/orders` - Opret ordre
- `PATCH /api/orders/{id}/status` - Opdater status

## 🎨 Frontend Funktioner

### 🏠 Forside (`index.html`)
- Nyheder og arrangementer
- Dansk datoformatering
- Responsive navigation

### 🍬 Produkter (`products.html`)
- Produktkatalog med billeder
- Kategorifiltrering (CANDY, ICE_CREAM, COFFEE, etc.)
- Gelatinefri filter 🌱
- Pris per 100g

### 📦 Bestilling (`order.html`)
- **Manuel bestilling**: Vælg produkter og mængder
- **Kommentar bestilling**: Skriv ønsker i tekst
- Automatisk prisberegning
- Kundeinformation (navn, telefon)
- Validering og fejlhåndtering

## 🧪 Testing

```bash
# Kør alle tests
./mvnw test

# Kør specifik test
./mvnw test -Dtest=ProductServiceTest

# Frontend tests (hvis implementeret)
cd frontend && npm test
```

## 🚢 Deployment

### Development
```bash
# Start Spring Boot (serves both frontend and API)
./mvnw spring-boot:run
```

### Production med Nginx
```bash
# 1. Byg frontend
cd frontend && npm run deploy

# 2. Start Spring Boot
./mvnw spring-boot:run

# 3. Start Nginx (i separat terminal)
sudo nginx -c $(pwd)/frontend/nginx/nginx.conf
```

## 🔧 Udvikling

### Backend Udvikling
- Entiteter i `model/` pakken
- Services i `service/` pakken
- REST endpoints i `controller/` pakken
- Tests i `src/test/`

### Frontend Udvikling
- HTML filer i `frontend/src/`
- CSS i `frontend/src/style.css`
- JavaScript moduler pr. side
- API kommunikation via `api.js`

### Kode Stil
- **Java**: Google Java Style Guide
- **JavaScript**: Airbnb JavaScript Style Guide
- **HTML/CSS**: BEM metodologi

## 🤝 Bidrag

1. Fork projektet
2. Opret feature branch (`git checkout -b feature/amazing-feature`)
3. Commit ændringer (`git commit -m 'Add amazing feature'`)
4. Push til branch (`git push origin feature/amazing-feature`)
5. Åbn Pull Request

## 📝 Licens

Dette projekt er licenseret under MIT License - se [LICENSE](LICENSE) filen for detaljer.

## 👥 Udviklere

- **Projekt**: Slikskoven Full-Stack Application
- **Teknologi**: Spring Boot + Vanilla JavaScript
- **Formål**: Læringsprojekt for moderne webudvikling

---

**🍬 Slikskoven - Where Candy Dreams Come True!**
