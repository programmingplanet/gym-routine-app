#!/bin/bash

# Script simple para compilar y exportar imagen Docker para ARM64

echo "🏗️  Construyendo imagen Docker..."
echo ""

# Detectar si buildx está disponible
if docker buildx version &> /dev/null; then
    echo "✓ Buildx detectado, construyendo para ARM64..."

    # Asegurarse de que el builder existe
    docker buildx create --name arm-builder --driver docker-container --bootstrap 2>/dev/null || true
    docker buildx use arm-builder

    # Construir solo para ARM64 y exportar a archivo tar
    docker buildx build \
      --platform linux/arm64 \
      -t gym-routine-app:latest \
      -o type=docker,dest=gym-routine-app-arm64.tar \
      .

    echo ""
    echo "✅ Imagen construida exitosamente"
    echo ""
    echo "📦 Archivo creado: gym-routine-app-arm64.tar"
    echo ""
    echo "Para cargar en tu servidor ARM64:"
    echo "  1. Copia el archivo: scp gym-routine-app-arm64.tar usuario@servidor:/ruta/"
    echo "  2. En el servidor: docker load < gym-routine-app-arm64.tar"
    echo "  3. Ejecuta: docker run -d -p 3000:3000 --name gym-routine gym-routine-app:latest"
else
    echo "⚠️  Buildx no disponible, usando build estándar..."
    echo "   Nota: La imagen se compilará para la arquitectura actual"
    echo ""

    # Build normal
    docker build -t gym-routine-app:latest .

    # Exportar a archivo tar
    docker save gym-routine-app:latest -o gym-routine-app.tar

    echo ""
    echo "✅ Imagen construida"
    echo ""
    echo "📦 Archivo creado: gym-routine-app.tar"
    echo ""
    echo "⚠️  IMPORTANTE: Esta imagen es para la arquitectura de esta máquina"
    echo "   Si tu servidor es ARM64, necesitas actualizar Docker y usar buildx"
    echo ""
    echo "Para cargar en el servidor:"
    echo "  1. Copia: scp gym-routine-app.tar usuario@servidor:/ruta/"
    echo "  2. En el servidor: docker load < gym-routine-app.tar"
    echo "  3. Ejecuta: docker run -d -p 3000:3000 --name gym-routine gym-routine-app:latest"
fi
