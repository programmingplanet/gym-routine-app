#!/bin/bash

# Script para compilar imagen Docker solo para ARM64

echo "🏗️  Construyendo imagen Docker para ARM64..."
echo ""

# Crear builder si no existe
docker buildx create --name multiplatform-builder --use 2>/dev/null || docker buildx use multiplatform-builder

# Construir y hacer push al registry solo para ARM64
docker buildx build \
  --platform linux/arm64 \
  -t registry.programmingplanet.net/gym-routine-app:1.0.0 \
  -t registry.programmingplanet.net/gym-routine-app:latest \
  --push \
  .

echo ""
echo "✅ Imagen construida para ARM64 y enviada al registry"
echo ""
echo "Para desplegar en tu servidor ARM64:"
echo "  docker pull registry.programmingplanet.net/gym-routine-app:1.0.0"
echo "  docker run -d -p 3000:3000 --name gym-routine registry.programmingplanet.net/gym-routine-app:1.0.0"
