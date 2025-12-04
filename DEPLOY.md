# Guía de Despliegue - GymRoutine App

## Problema: Compilar en AMD64 para desplegar en ARM64

Estás usando **Podman** en lugar de Docker. Aquí están las opciones:

## Opción 1: Instalar Docker con Buildx (RECOMENDADO)

```bash
# Instalar Docker (si no lo tienes)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Verificar que buildx esté disponible
docker buildx version

# Construir para ARM64
docker buildx build --platform linux/arm64 -t gym-routine-app:latest -o type=docker,dest=gym-routine-arm64.tar .

# Copiar al servidor
scp gym-routine-arm64.tar usuario@servidor:/ruta/

# En el servidor ARM64
docker load < gym-routine-arm64.tar
docker run -d -p 3000:3000 --name gym-routine gym-routine-app:latest
```

## Opción 2: Usar Podman con QEMU

```bash
# Instalar qemu-user-static
sudo apt-get update
sudo apt-get install -y qemu-user-static

# Registrar binfmt handlers
sudo podman run --rm --privileged multiarch/qemu-user-static --reset -p yes

# Ahora ejecutar el script
./build-podman.sh
```

## Opción 3: Compilar directamente en el servidor ARM64

La forma más simple:

```bash
# En tu servidor ARM64
git clone tu-repo
cd gym-routine-app

# Instalar Node.js si no está instalado
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar dependencias
npm install

# Build de producción
npm run build

# Ejecutar
npm start

# O con PM2 para mantenerlo corriendo
sudo npm install -g pm2
pm2 start npm --name "gym-routine" -- start
pm2 save
pm2 startup
```

## Opción 4: Sin Docker - Deploy directo

Si no quieres usar Docker en absoluto:

```bash
# En el servidor ARM64
npm install
npm run build

# Crear servicio systemd
sudo tee /etc/systemd/system/gym-routine.service > /dev/null <<EOF
[Unit]
Description=GymRoutine App
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=/ruta/a/gym-routine-app
ExecStart=/usr/bin/npm start
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

# Iniciar servicio
sudo systemctl daemon-reload
sudo systemctl enable gym-routine
sudo systemctl start gym-routine
sudo systemctl status gym-routine
```

## Recomendación

La **Opción 3** (compilar directamente en el servidor) es la más simple y evita todos los problemas de cross-compilation.

Si insistes en Docker/Podman, usa la **Opción 1** con Docker buildx.
