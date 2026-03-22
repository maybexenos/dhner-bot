FROM node:20-slim

RUN apt-get update && apt-get install -y \
    build-essential \
    python3 \
    git \
    libcairo2-dev \
    libjpeg-dev \
    libpango1.0-dev \
    libgif-dev \
    librsvg2-dev \
    libpixman-1-dev \
    uuid-dev \
    pkg-config \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN ln -sf /app/func/secrets/fca-sifu /app/node_modules/FCA-SIFU

RUN npm run build

ENV PORT=5000
EXPOSE 5000

CMD ["bash", "start.sh"]
