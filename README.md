# Proyecto_Final
# Frontend
Este repositorio contiene el frontend de mi proyecto final de la carrera: una plataforma de e-commerce full stack con chatbot integrado, panel de administración y dashboards de inteligencia de negocios.

El frontend provee una interfaz de usuario responsiva para clientes y administradores, permitiendo la navegación de productos, gestión del carrito de compras, realización de pedidos y visualización de datos.

# Funcionalidades principales
- Autenticación de usuarios y gestión de sesiones
- Catálogo de productos con filtros y búsqueda
- Flujo de carrito de compras y proceso de checkout
- Panel de administración para la gestión de productos, usuarios, pedidos y stock
- Chatbot con IA integrado para asistencia al cliente
- Dashboards de BI para análisis de ventas y negocio
- Sistema de pronóstico de demanda
- Interfaz responsiva para dispositivos desktop y móviles

# Stack tecnológico
- Framework Frontend: Angular
- Lenguaje: TypeScript
- UI: Bootstrap
- Gestión de estado: Servicios de Angular
- Comunicación con la API: REST (HTTP Client)
- Gráficos y visualización: Chart.js
- Despliegue: AWS (S3 + CloudFront / entorno demo)

# Estructura de la aplicación
- Components: interfaces y vistas
- Services: comunicación con la API y lógica de negocio
- Modules: separación por funcionalidades
- Assets: recursos estáticos

# Primeros pasos (ejecución local)
1. Clonar el repositorio
2. Instalar dependencias  
   `npm install`
3. Ejecutar el servidor de desarrollo  
   `ng serve`
4. Abrir http://localhost:4200

# Integración con el backend
El frontend se comunica con el backend a través de una API REST.
Los endpoints son consumidos mediante servici


# Final Degree Project
# Frontend
This repository contains the frontend of my final degree project: a full-stack e-commerce platform with an integrated chatbot, admin panel, and business intelligence dashboards.

The frontend provides a responsive user interface for customers and administrators, enabling product browsing, shopping cart management, order placement, and data visualization.

# Main features
- User authentication and session management
- Product catalog with filters and search
- Shopping cart and checkout flow
- Admin panel for managing products, users, orders, and stock
- Integrated AI chatbot for customer assistance
- BI dashboards for sales and business analysis
- Demand Forecasting System
- Responsive UI for desktop and mobile devices

# Tech Stack
- Frontend Framework: Angular
- Language: TypeScript
- UI: Bootstrap
- State Management: Angular Services
- API Communication: REST (HTTP Client)
- Charts & Visualization: Chart.js
- Deployment: AWS (S3 + CloudFront / demo environment)

# Application Structure
- Components: UI and views
- Services: API communication and business logic
- Modules: feature separation
- Assets: static resources

# Getting Started (Local Setup)
1. Clone the repository
2. Install dependencies
   npm install
3. Run the development server
   ng serve
4. Open http://localhost:4200

# Backend integration
The frontend communicates with the backend through a RESTful API.
API endpoints are consumed using Angular services and secured using JWT authentication.
