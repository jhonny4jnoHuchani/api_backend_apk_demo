# 🛡️ UPEA Token Service — Microservicio de Seguridad y Tokenización OTP

Microservicio backend de alto rendimiento desarrollado con **NestJS**, **TypeORM** y **MySQL**. Proporciona el núcleo de seguridad para el ecosistema universitario UPEA: autenticación con vinculación estricta de hardware (**Device Binding**), generación de tokens de un solo uso (**TOTP/OTP** de 6 dígitos) y validación en tiempo real para el sistema académico y la aplicación móvil.

---

## 📋 Requisitos Previos

Antes de comenzar la instalación en tu entorno de desarrollo, asegúrate de contar con:

- **Node.js**: Versión `v18.0.0` o superior (Recomendado `v20.x` LTS o `v22.x`).
- **npm**: Versión `9.x` o superior (incluido con Node.js).
- **MySQL / MariaDB**: Versión `8.0+` o MariaDB `10.4+` (puedes usar XAMPP, Laragon, Docker o MySQL Server local en el puerto `3306`).
- **Git** (opcional, para clonado y control de versiones).

---

## 🚀 Paso a Paso: Configuración para Modo Desarrollador

Sigue estos pasos en orden para dejar el servicio 100% operativo:

### 1. Ubicarse en el directorio del proyecto
Abre una terminal (PowerShell, Bash o CMD) en la raíz del microservicio:
```bash
cd d:/TRABAJO/upea-token-service
```

### 2. Instalar dependencias de Node.js
Ejecuta la instalación limpia de los paquetes declarados en `package.json`:
```bash
npm install
```

### 3. Configurar las Variables de Entorno (`.env`)
El proyecto incluye una plantilla `.env.example`. Crea tu archivo `.env` local:

En Windows (PowerShell):
```powershell
Copy-Item .env.example .env
```
O en Bash / CMD:
```bash
cp .env.example .env
```

Abre el archivo `.env` y ajusta las credenciales de tu servidor de base de datos MySQL:

```env
# Configuración del Servidor
PORT=3000
NODE_ENV=development

# Conexión MySQL / MariaDB (ej. XAMPP por defecto: user=root, password vacío)
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=upea_security_db

# Sincronización automática de TypeORM (true solo en desarrollo local)
DB_SYNCHRONIZE=true

# Logs de consultas SQL en terminal (true / false)
DB_LOGGING=true
```

> [!NOTE]
> En entornos locales con XAMPP, habitualmente `DB_USER=root` y `DB_PASSWORD=` se mantiene en blanco. Si usas contraseña de root o un usuario dedicado en MySQL, colócalo aquí.

---

## 🗄️ Creación y Migración de la Base de Datos

El microservicio cuenta con un flujo automatizado para inicializar la base de datos y generar todas las tablas:

### Paso A: Crear la Base de Datos en MySQL
Asegúrate de que tu servicio MySQL esté iniciado (ej. botón **Start** de MySQL en el panel de XAMPP). Luego ejecuta:

```bash
npm run db:create
```

Este comando ejecuta el script `scripts/create-db.js`, el cual se conecta a MySQL y crea la base de datos `upea_security_db` con el conjunto de caracteres adecuado si aún no existe.

### Paso B: Migración / Sincronización de Tablas
Este proyecto utiliza **TypeORM** con sincronización automática en desarrollo (`DB_SYNCHRONIZE=true` en `.env`).

Al iniciar el servidor en modo desarrollo (Paso 4 a continuación), TypeORM detectará automáticamente los modelos y creará o actualizará las siguientes tablas con sus índices y relaciones foráneas:
1. `app_users`: Registro de usuarios autorizados, contraseñas encriptadas y vinculación del hardware (`device_id`).
2. `tokens`: Almacén de códigos OTP de 6 dígitos, hash criptográfico, tiempo de vida (TTL) y estado (`PENDIENTE`, `USADO`, `EXPIRADO`).
3. `historial`: Auditoría transaccional de cada generación y validación de tokens.

> [!TIP]
> Si en algún momento modificas las entidades en `src/**/*.entity.ts`, TypeORM actualizará las tablas automáticamente sin necesidad de scripts manuales de migración en modo desarrollo.

---

## 💻 Comandos para Ejecutar el Proyecto

### Modo Desarrollador (Watch Mode con recarga en vivo)
Para iniciar el microservicio observando cambios en el código TypeScript:
```bash
npm run start:dev
```
*(También puedes usar el alias `npm run serve`)*.

Verás en consola:
```text
Microservicio de seguridad UPEA corriendo en el puerto 3000
```
La API estará escuchando en `http://localhost:3000` (o `http://127.0.0.1:3000`).

### Modo Debug (Depuración con Inspect)
```bash
npm run start:debug
```

### Compilar y Ejecutar en Modo Producción
```bash
npm run build
npm run start:prod
```

---

## 🧪 Pruebas Automatizadas y Linter

El proyecto utiliza **Vitest** y **oxlint** para máxima velocidad y fiabilidad:

```bash
# Ejecutar suite de pruebas unitarias
npm run test

# Ejecutar pruebas en modo interactivo (watch)
npm run test:watch

# Ver reporte de cobertura de código
npm run test:cov

# Ejecutar pruebas End-to-End (E2E)
npm run test:e2e

# Validar calidad de código y buenas prácticas con oxlint
npm run lint

# Formatear código con Prettier
npm run format
```

---

## 📡 Endpoints de la API REST

| Método | Ruta | Descripción | Consumidor Principal |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Registro inicial de credenciales de usuario móvil | App Móvil / Kardex |
| `POST` | `/api/auth/login-device` | Autenticación con validación de hardware (**Device Binding**) | App Móvil React Native |
| `POST` | `/api/tokens/generate` | Generación de token OTP dinámico de 6 dígitos | App Móvil React Native |
| `POST` | `/api/tokens/validate` | Verificación de validez y consumo de token OTP | Sistema Académico Laravel |

### Ejemplo: Validar Token (Consumo desde Laravel)
```http
POST /api/tokens/validate HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "identificador_sistema": "30009999",
  "codigo": "489215"
}
```

Respuesta esperada:
```json
{
  "valido": true,
  "mensaje": "Token validado y consumido exitosamente",
  "timestamp": "2026-10-29T05:20:00.000Z"
}
```

---

## 🔗 Relación con los Otros Proyectos

```text
       ┌────────────────────────┐
       │   sistema-academico    │  (Laravel 11 + Vue)
       │    Puerto: 8000        │
       └───────────┬────────────┘
                   │
                   │ Valida OTP al confirmar operaciones críticas
                   ▼
       ┌────────────────────────┐
       │   upea-token-service   │◄──── Genera OTP & Vincula Dispositivo
       │    Puerto: 3000        │      (Device Binding)
       └────────────────────────┘
                   ▲
                   │
       ┌───────────┴────────────┐
       │    upea-token-app      │  (React Native / Expo)
       │   Puerto Web: 8081     │
       └────────────────────────┘
```

---

## ❓ Preguntas Frecuentes y Solución de Problemas

1. **Error: `connect ECONNREFUSED 127.0.0.1:3306`**:
   - Asegúrate de haber iniciado MySQL en XAMPP o como servicio de Windows.
   - Verifica que el puerto en el archivo `.env` (`DB_PORT=3306`) coincida con tu configuración.
2. **Error: `Access denied for user 'root'@'localhost'`**:
   - Revisa si tu usuario `root` tiene contraseña configurada. Si es así, colócala en `DB_PASSWORD=tu_password` dentro de `.env`.
3. **¿Cómo limpiar la base de datos de prueba?**:
   - Puedes eliminar la base de datos ejecutando `DROP DATABASE upea_security_db;` en phpMyAdmin/MySQL Workbench y volver a correr `npm run db:create` seguido de `npm run start:dev`.
