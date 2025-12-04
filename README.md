# GymRoutine App

Aplicación moderna de gestión de rutinas de gimnasio construida con Next.js 14, React, TypeScript y Tailwind CSS, siguiendo la arquitectura Atomic Design.

## Características

- **Autenticación de usuarios**: Login para usuarios Lesly y John
- **Rutinas predefinidas**: 4 días de entrenamiento completo (Pecho+Tríceps, Espalda+Bíceps, Piernas+Glúteos, Hombros+Full Body)
- **Seguimiento de progreso**: Registra peso, repeticiones y series para cada ejercicio
- **Historial de entrenamientos**: Visualiza tu progreso a lo largo del tiempo
- **Modo oscuro**: Tema claro/oscuro con persistencia
- **Diseño responsive**: Optimizado para móvil, tablet y escritorio
- **Imágenes reales**: Cada ejercicio incluye una imagen de referencia

## Tecnologías

- **Next.js 14**: Framework de React con App Router
- **TypeScript**: Tipado estático para mayor seguridad
- **Tailwind CSS**: Estilos modernos y responsive
- **Atomic Design**: Arquitectura de componentes escalable
- **Lucide React**: Iconos modernos
- **date-fns**: Manejo de fechas

## Estructura del Proyecto

```
gym-routine-app/
├── app/                    # App Router de Next.js
│   ├── dashboard/          # Dashboard principal
│   ├── login/              # Página de login
│   └── routine/[id]/       # Detalle de rutina (dinámico)
├── components/             # Componentes Atomic Design
│   ├── atoms/              # Componentes básicos (Button, Input, Card, Badge)
│   ├── molecules/          # Componentes compuestos (ExerciseCard, ProgressForm)
│   └── organisms/          # Componentes complejos (Header, WorkoutTracker)
├── data/                   # Datos iniciales
│   ├── users.ts            # Usuarios predefinidos
│   └── routines.ts         # Rutinas de entrenamiento
├── lib/                    # Utilidades y lógica de negocio
│   ├── api.ts              # Capa de servicios API (preparada para backend)
│   └── AuthContext.tsx     # Contexto de autenticación
└── types/                  # Definiciones de tipos TypeScript
```

## Instalación y Uso

### Desarrollo Local

1. Instalar dependencias:
```bash
npm install
```

2. Ejecutar en modo desarrollo:
```bash
npm run dev
```

3. Abrir en el navegador: [http://localhost:3000](http://localhost:3000)

### Producción

```bash
npm run build
npm start
```

## Docker

### Opción 1: Build simple (misma arquitectura)

```bash
# Construir la imagen
docker build -t gym-routine-app .

# Ejecutar el contenedor
docker run -p 3000:3000 gym-routine-app
```

### Opción 2: Build multi-plataforma (AMD64 y ARM64)

Si necesitas compilar en una máquina AMD64 y desplegar en ARM64 (o viceversa):

```bash
# Usando el script incluido
./build-multiplatform.sh

# O manualmente con buildx
docker buildx create --name multiplatform-builder --use
docker buildx build --platform linux/amd64,linux/arm64 -t gym-routine-app:latest --load .
```

### Opción 3: Build específico para ARM64

Si solo necesitas ARM64:

```bash
docker buildx build --platform linux/arm64 -t gym-routine-app:latest --load .
```

### Exportar/Importar imagen Docker

Para transferir la imagen a otro servidor:

```bash
# Exportar (en tu máquina AMD64)
docker save gym-routine-app:latest | gzip > gym-routine-app.tar.gz

# Copiar al servidor ARM64 (ejemplo con scp)
scp gym-routine-app.tar.gz usuario@servidor:/ruta/destino/

# Importar (en el servidor ARM64)
docker load < gym-routine-app.tar.gz
docker run -p 3000:3000 gym-routine-app:latest
```

### Usar Docker Compose

```bash
# Construir y ejecutar
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener
docker-compose down
```

## Usuarios de Prueba

- **Usuario**: lesly | **Contraseña**: lesly123
- **Usuario**: john | **Contraseña**: john123

## Características Futuras

La aplicación está preparada para conectarse con un backend real. La capa de servicios (`lib/api.ts`) está diseñada para ser fácilmente reemplazada por llamadas a una API REST.

### Para conectar con un backend:

1. Configura `NEXT_PUBLIC_API_URL` en las variables de entorno
2. Reemplaza las funciones en `lib/api.ts` con llamadas fetch/axios reales
3. Los comentarios `// TODO:` indican dónde hacer los cambios

Ejemplo:
```typescript
// Actual (localStorage)
async login(username: string, password: string): Promise<User | null> {
  const user = users.find(u => u.username === username && u.password === password);
  return user || null;
}

// Futuro (API)
async login(username: string, password: string): Promise<User | null> {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  return response.json();
}
```

## Arquitectura Atomic Design

- **Atoms**: Componentes básicos reutilizables (Button, Input, Card, Badge)
- **Molecules**: Combinaciones de atoms (ExerciseCard, ProgressForm, RoutineCard)
- **Organisms**: Componentes complejos (Header, WorkoutTracker)
- **Templates**: Layouts de página (actualmente en app/)
- **Pages**: Páginas completas con lógica de negocio

## Licencia

MIT
