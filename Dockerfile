# Usar uma imagem oficial e leve do Node.js (LTS - Long Term Support)
FROM node:18-slim

# Definir o diretório de trabalho dentro do contêiner
WORKDIR /usr/src/app

# Copiar os arquivos de dependência
COPY package*.json ./

# Instalar apenas as dependências de produção
RUN npm install --omit=dev

# Copiar os arquivos da nossa aplicação
COPY ./app ./app
COPY ./data ./data

# Expor a porta que o nosso servidor Express usa
EXPOSE 80

# Comando para iniciar o servidor quando o contêiner rodar
CMD [ "node", "app/index.js" ]