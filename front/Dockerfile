FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./

RUN --mount=type=cache,target=/root/.npm npm ci

COPY . .

ARG VITE_API_BASE_URL
ARG VITE_FRONTEND_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_FRONTEND_URL=${VITE_FRONTEND_URL}


RUN npm run build:vite

FROM nginx:1.27-alpine AS runtime
WORKDIR /usr/share/nginx/html

RUN rm -rf ./*


COPY --from=build /app/dist/ ./

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
