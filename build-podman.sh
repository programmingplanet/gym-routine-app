#!/bin/bash

# Script para compilar imagen con Podman para ARM64

echo "🏗️  Construyendo imagen con Podman para ARM64..."
echo ""

# Verificar si qemu-user-static está instalado
if ! command -v qemu-aarch64-static &> /dev/null; then
    echo "⚠️  Instalando qemu-user-static para emulación ARM64..."
    sudo apt-get update && sudo apt-get install -y qemu-user-static
fi

# Registrar emuladores binfmt
if [ -f /proc/sys/fs/binfmt_misc/qemu-aarch64 ]; then
    echo "✓ Emulador ARM64 registrado"
else
    echo "⚠️  Registrando emulador ARM64..."
    sudo podman run --rm --privileged multiarch/qemu-user-static --reset -p yes
fi

echo ""
echo "Construyendo imagen para ARM64..."

# Construir para ARM64 con Podman
podman build \
  --platform linux/arm64 \
  --format docker \
  -t gym-routine-app:latest \
  .

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Imagen construida exitosamente"
    echo ""

    # Exportar la imagen
    echo "📦 Exportando imagen..."
    podman save gym-routine-app:latest -o gym-routine-app-arm64.tar

    echo ""
    echo "✅ Imagen exportada: gym-routine-app-arm64.tar"
    echo ""
    echo "Para desplegar en tu servidor ARM64:"
    echo ""
    echo "1. Copiar archivo al servidor:"
    echo "   scp gym-routine-app-arm64.tar usuario@servidor:/ruta/"
    echo ""
    echo "2. En el servidor ARM64, cargar la imagen:"
    echo "   docker load < gym-routine-app-arm64.tar"
    echo "   # o con podman:"
    echo "   podman load < gym-routine-app-arm64.tar"
    echo ""
    echo "3. Ejecutar el contenedor:"
    echo "   docker run -d -p 3000:3000 --name gym-routine gym-routine-app:latest"
    echo "   # o con podman:"
    echo "   podman run -d -p 3000:3000 --name gym-routine gym-routine-app:latest"
    echo ""
else
    echo ""
    echo "❌ Error al construir la imagen"
    exit 1
fi
