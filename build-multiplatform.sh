#!/bin/bash

# Script para compilar imagen Docker multi-plataforma (AMD64 y ARM64)

echo "🏗️  Construyendo imagen Docker multi-plataforma..."
echo ""

# Crear builder si no existe
docker buildx create --name multiplatform-builder --use 2>/dev/null || docker buildx use multiplatform-builder

# Construir y hacer push al registry para ambas plataformas
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t registry.programmingplanet.net/gym-routine-app:1.0.0 \
  -t registry.programmingplanet.net/gym-routine-app:latest \
  --push \
  .

echo ""
echo "✅ Imagen construida y enviada al registry exitosamente"
echo ""
echo "Para desplegar en tu servidor:"
echo "  docker pull registry.programmingplanet.net/gym-routine-app:1.0.0"
echo "  docker run -d -p 3000:3000 --name gym-routine registry.programmingplanet.net/gym-routine-app:1.0.0"
echo ""
echo "O usando docker-compose en el servidor, crea un docker-compose.yml:"
echo "  version: '3.8'"
echo "  services:"
echo "    gym-routine-app:"
echo "      image: registry.programmingplanet.net/gym-routine-app:1.0.0"
echo "      ports:"
echo "        - '3000:3000'"
echo "      restart: unless-stopped"
