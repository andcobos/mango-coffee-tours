import { defineConfig } from '@prisma/config';
import * as dotenv from 'dotenv';

// Cargar el .env sincrónicamente
dotenv.config();

export default defineConfig({
  datasource: {
    // Aquí está el cambio clave: usamos la URL directa para comandos de terminal
    url: process.env.DIRECT_URL,
  },
});