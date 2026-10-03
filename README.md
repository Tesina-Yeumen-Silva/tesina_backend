# Mendoza Reporta - Core API (Node.js)

Este repositorio contiene la API principal y el núcleo lógico del sistema **Mendoza Reporta**, encargado de la gestión ciudadana de incidentes urbanos. Está diseñado para ofrecer una arquitectura robusta, segura y escalable.

## 🚀 Tecnologías Principales

- **Runtime**: [Node.js](https://nodejs.org/) con [TypeScript](https://www.typescriptlang.org/)
- **Framework Web**: [Express.js](https://expressjs.com/)
- **ORM & Base de Datos**: [Prisma](https://www.prisma.io/) + [PostgreSQL](https://www.postgresql.org/) (con soporte [PostGIS](https://postgis.net/) para consultas geoespaciales)
- **Autenticación**: JSON Web Tokens (JWT) & OAuth 2.0 (Google)
- **Almacenamiento (Storage)**: Integración S3-compatible (Cloudflare R2) para gestión de imágenes.
- **Mailing**: Brevo (Sendinblue) para recuperación de contraseñas y notificaciones.

## 📋 Requisitos Previos

- **Node.js** v18 o superior.
- **Gestor de paquetes**: npm o yarn.
- **Base de Datos**: Instancia de PostgreSQL con la extensión `postgis` habilitada.

## ⚙️ Configuración del Entorno

1. Clonar el repositorio.
2. Copiar el archivo de variables de entorno de ejemplo:
   ```bash
   cp .env.example .env
   ```
3. Completar las variables de entorno en `.env` con las credenciales correspondientes de la base de datos, JWT y los servicios de terceros.

## 🛠️ Instalación y Uso Local

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Ejecutar migraciones de base de datos (y generar cliente de Prisma):
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

3. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

El servidor estará escuchando por defecto en el puerto `4500` (o el configurado en `.env`).

## 🏗️ Arquitectura y Flujo

- **Capa de Controladores / Servicios**: Separación estricta entre la capa de red (Express) y la lógica de negocio.
- **Middlewares**: Validación de esquemas con Zod, manejo centralizado de errores, interceptores de autenticación y soporte para Refresh Tokens.
- **Interoperabilidad IA**: Este backend inserta los reportes pendientes en la base de datos que luego son procesados de forma asíncrona por el **Python AI Worker**.

## 🤝 Contribución

Todo el código fuente debe adherirse a las reglas de tipado estricto de TypeScript definidas en el proyecto. Asegúrese de ejecutar los linters correspondientes antes de abrir un *Pull Request*.
