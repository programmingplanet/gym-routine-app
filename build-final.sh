#!/bin/bash

echo "🏗️  GymRoutine - Build para ARM64"
echo "=================================="
echo ""

# Detectar si estamos usando Docker o Podman
if command -v docker &> /dev/null && docker info &> /dev/null 2>&1; then
    CONTAINER_CMD="docker"
    echo "✓ Usando Docker"
elif command -v podman &> /dev/null; then
    CONTAINER_CMD="podman"
    echo "✓ Usando Podman"
else
    echo "❌ Error: Ni Docker ni Podman están disponibles"
    exit 1
fi

echo ""

# Si es Podman, verificar QEMU
if [ "$CONTAINER_CMD" = "podman" ]; then
    echo "⚠️  Nota: Podman requiere QEMU para cross-compilation"
    echo ""

    if ! command -v qemu-aarch64-static &> /dev/null; then
        echo "Instalando qemu-user-static..."
        sudo apt-get update && sudo apt-get install -y qemu-user-static binfmt-support
    fi

    echo "Registrando emuladores QEMU..."
    sudo update-binfmts --enable

    echo ""
fi

# Construir
echo "Construyendo imagen para linux/arm64..."
echo ""

$CONTAINER_CMD build \
  --platform linux/arm64 \
  -t gym-routine-app:latest \
  .

BUILD_STATUS=$?

if [ $BUILD_STATUS -eq 0 ]; then
    echo ""
    echo "✅ ¡Imagen construida exitosamente!"
    echo ""
    echo "Exportando imagen a archivo..."

    $CONTAINER_CMD save gym-routine-app:latest -o gym-routine-app-arm64.tar

    if [ -f gym-routine-app-arm64.tar ]; then
        SIZE=$(du -h gym-routine-app-arm64.tar | cut -f1)
        echo ""
        echo "✅ Imagen exportada: gym-routine-app-arm64.tar ($SIZE)"
        echo ""
        echo "📋 Siguiente paso - Desplegar en servidor ARM64:"
        echo ""
        echo "1. Copiar al servidor:"
        echo "   scp gym-routine-app-arm64.tar usuario@servidor:/ruta/"
        echo ""
        echo "2. En el servidor, cargar e iniciar:"
        echo "   docker load < gym-routine-app-arm64.tar"
        echo "   docker run -d -p 3000:3000 --name gym-routine gym-routine-app:latest"
        echo ""
    fi
else
    echo ""
    echo "❌ Error al construir la imagen"
    echo ""
    echo "Posibles soluciones:"
    echo "1. Instala Docker oficial: curl -fsSL https://get.docker.com | sh"
    echo "2. O compila directamente en el servidor ARM64 (ver DEPLOY.md)"
    echo ""
    exit 1
fi
