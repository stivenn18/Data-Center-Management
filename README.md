# 🖥️ Gestión de Data Center (Infraestructura Cloud)

Sistema asimétrico de gestión de crisis para Data Centers en tiempo real. Dos roles trabajan en conjunto: el **Monitor** observa las métricas del sistema y el **Técnico** ejecuta los comandos de respuesta. La comunicación entre ambos es vital para resolver la crisis.

## 👥 Integrantes

| Nombre | GitHub |
|--------|--------|
| Stiven Mora Bárcenas | [@stivenn18](https://github.com/stivenn18) |
| Jose Jhardiher Giraldo Muñoz | [@MunGZar](https://github.com/MunGZar) |



---

## 📖 Descripción

**Gestión de Data Center** es una aplicación web multijugador asimétrica donde:

- El **Monitor** tiene acceso de solo lectura: ve temperatura de racks, ancho de banda, intentos DDoS, métricas del sistema y el código de seguridad que debe comunicar al Técnico.
- El **Técnico** tiene acceso de solo acción: ejecuta comandos desde una terminal interactiva para enfriar racks, reiniciar servidores, activar firewalls y responder a las alertas que reporta el Monitor.

---

## 🛠️ Tecnologías

| Tecnología | Versión | Uso |
|---|---|---|
| React |  | Framework UI |
| React Router DOM | 7.x | Enrutamiento con layouts anidados |
| Zustand | 5.x | Estado global sincronizado con Socket |
| Socket.io Client | 4.x | Comunicación en tiempo real con el backend |
| Recharts | 2.x | Gráficas de barras y área |
| Tailwind CSS | 3.x | Estilos tipo "Centro de Mando" |
| Vite | 8.x | Bundler y servidor de desarrollo |

---

## 📁 Estructura del Proyecto

```
Data-Center-Monitoring/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.jsx          # Barra de navegación con nombre, rol y reloj
│   │   ├── layouts/
│   │   │   └── OpsLayout.jsx       # Layout que envuelve las vistas de operaciones
│   │   ├── pages/
│   │   │   ├── Lobby.jsx           # Registro del jugador y selección de rol
│   │   │   ├── MonitorView.jsx     # Vista del Monitor (solo lectura)
│   │   │   └── BridgeView.jsx      # Vista del Técnico (terminal + acciones)
│   │   ├── store/
│   │   │   └── useCrisisStore.js   # Store Zustand + integración Socket.io
│   │   ├── App.jsx                 # Definición de rutas con React Router v7
│   │   ├── main.jsx                # Punto de entrada de la aplicación
│   │   └── index.css               # Estilos globales + efectos CRT
│   ├── .env.example                # Plantilla de variables de entorno
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js
│   └── package.json

```

---

## ⚙️ Instalación

### Requisitos previos

- Node.js >= 18
- npm >= 9

### 1. Clonar el repositorio

```bash
git clone https://github.com/stivenn18/Data-Center-Management
cd Data-Center-Management
```

### 2. Instalar dependencias del frontend

```bash
cd frontend
npm install
```


---

## 🔐 Variables de Entorno

Dentro de la carpeta `frontend/`, crea un archivo `.env` basado en `.env.example`:

```bash
cp .env.example .env
```

Contenido del `.env`:

```env
VITE_SOCKET_URL=http://localhost:3001
```


---

## 🚀 Uso

### Levantar el frontend

```bash
cd frontend
npm run dev
```

La aplicación estará disponible en: [http://localhost:5173](http://localhost:5173)



### Scripts disponibles

| Script | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Genera el build de producción |
| `npm run preview` | Previsualiza el build de producción |
| `npm run lint` | Ejecuta ESLint sobre el código |

---

## 🗺️ Rutas

| Ruta | Componente | Descripción |
|---|---|---|
| `/` | `Lobby` | Registro del operador y selección de rol |
| `/ops/monitor` | `MonitorView` | Panel de monitoreo (solo lectura) |
| `/ops/bridge` | `BridgeView` | Terminal de comandos (solo acción) |

> Cualquier ruta no definida redirige automáticamente a `/`.

---

## 👥 Roles

### 🔵 Monitor
- Ve en tiempo real: temperatura de racks, ancho de banda 24h, intentos DDoS, CPU, memoria, disco y latencia.
- Tiene acceso al **código de seguridad** que debe comunicar verbalmente al Técnico.
- No puede ejecutar ninguna acción directa.

### 🟡 Técnico
- Accede a una terminal interactiva para escribir comandos.
- Usa el código de seguridad que le pasa el Monitor para autenticar sus acciones.
- Cuenta con botones de acciones rápidas para los comandos más comunes.
- Navega el historial de comandos con las teclas `↑` y `↓`.

---

## 💻 Comandos Disponibles (Técnico)

| Comando | Descripción |
|---|---|
| `COOL RACK-[ID] [%]` | Ajusta la potencia del aire acondicionado de un rack |
| `RESTART SRV-[ID]` | Reinicia un servidor específico |
| `FIREWALL ENABLE` | Activa el firewall de emergencia |
| `FIREWALL DISABLE` | Desactiva el firewall |
| `ISOLATE RACK-[ID]` | Aísla un rack de la red principal |
| `BOOST COOLING ALL` | Activa el enfriamiento al 100% en todos los racks |
| `SHUTDOWN SRV-[ID]` | Realiza el apagado controlado de un servidor |
| `STATUS REPORT` | Genera un informe completo del sistema |

**IDs válidos:**
- Racks: `A1`, `A2`, `B1`, `B2`, `C1`, `C2`
- Servidores: `SRV-100` a `SRV-200`

---

## 🔌 Conexión con el Backend

El frontend se conecta automáticamente al backend mediante Socket.io al iniciar la misión. Los eventos implementados son:

### Eventos que escucha el frontend (del backend)

| Evento | Descripción |
|---|---|
| `metrics:update` | Actualiza las métricas del sistema en tiempo real |
| `event:new` | Agrega un nuevo evento al log |
| `security:code` | Actualiza el código de seguridad |
| `system:status` | Cambia el estado global (`NOMINAL`, `WARNING`, `CRITICAL`) |
| `action:result` | Respuesta a un comando ejecutado por el Técnico |
| `alert:critical` | Dispara una alerta crítica en la UI |

### Eventos que emite el frontend (al backend)

| Evento | Payload | Descripción |
|---|---|---|
| `player:join` | `{ name, role }` | Registra al jugador en el servidor |
| `action:command` | `{ command, securityCode }` | Envía un comando del Técnico |

---

## 🎮 Modo Demo

Si el backend **no está disponible**, la aplicación funciona en **modo demo** automáticamente:

- Los comandos son simulados localmente con respuestas predefinidas.
- Las métricas se actualizan localmente al ejecutar comandos (enfriar baja temperaturas, firewall reduce DDoS, etc.).
- La Navbar muestra el indicador **`MODO DEMO`** cuando no hay conexión activa.
- Si el backend se conecta o reconecta, el modo demo se desactiva automáticamente.



---

## 📄 Licencia

Proyecto académico — 6° Semestre, Desarrollo de software.
