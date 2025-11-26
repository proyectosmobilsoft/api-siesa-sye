# Usa una imagen oficial de Node.js LTS
FROM node:18

# Crea el directorio de la app
WORKDIR /usr/src/app

# Copia package.json y package-lock.json
COPY package*.json ./

# Instala las dependencias de producción
RUN npm install --production

# Copia el resto del código fuente
COPY . .

# Expone el puerto por defecto
EXPOSE 3000

# Comando para iniciar la app
CMD [ "npm", "start" ]
