import mysql from 'mysql2/promise';
import fs from 'node:fs';
import path from 'node:path';

// Cargar variables de entorno desde .env si existe
const envPath = path.resolve(process.cwd(), '.env');
const env = {};
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...values] = trimmed.split('=');
      if (key) env[key.trim()] = values.join('=').trim();
    }
  }
}

const host = env.DB_HOST || process.env.DB_HOST || '127.0.0.1';
const port = Number(env.DB_PORT || process.env.DB_PORT || 3306);
const user = env.DB_USER || process.env.DB_USER || 'root';
const password = env.DB_PASSWORD ?? process.env.DB_PASSWORD ?? 'root';
const database = env.DB_NAME || process.env.DB_NAME || 'upea_security_db';

async function main() {
  console.log(`Conectando a MySQL en ${host}:${port} con usuario '${user}'...`);
  try {
    const connection = await mysql.createConnection({ host, port, user, password });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
    console.log(` Base de datos '${database}' lista (creada o ya existente).`);
    await connection.end();
  } catch (err) {
    console.error(`❌ Error al conectar con MySQL:`, err.message);
    console.error(`ℹ️ Verifica que el servicio de MySQL esté corriendo (ej. botón Start en XAMPP o 'C:\\xampp\\mysql_start.bat').`);
    process.exit(1);
  }
}

main();
