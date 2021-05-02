FROM node:alpine
ENV DEBIAN_FRONTEND=noninteractive
WORKDIR /root

# fetch git commit info
COPY .git .git
RUN apk add git && \
      git rev-parse --short HEAD > .gitcommit && \
      git show -s --format=%ci $(git rev-parse --short HEAD) | sed 's/ .*//' > .gitdate && \
      rm -rf .git

# build frontend
COPY packages/dvb-ui packages/dvb-ui/
COPY dockerfiles/dvb-ui.env packages/dvb-ui/.env.production
RUN echo "" >> packages/dvb-ui/.env.production && \
      echo "NEXT_PUBLIC_GIT_COMMIT=$(cat .gitcommit)" >> packages/dvb-ui/.env.production && \
      echo "NEXT_PUBLIC_GIT_DATE=$(cat .gitdate)" >> packages/dvb-ui/.env.production && \
      (cd packages/dvb-ui && npm install) && \
      (cd packages/dvb-ui && npm run build) && \
      (cd packages/dvb-ui && rm -rf node_modules) && \
      (cd packages/dvb-ui && npm install --production)

# build backend
COPY packages/dvb packages/dvb/
COPY dockerfiles/dvb.env packages/dvb/.env
RUN (cd packages/dvb && npm install) && \
      (cd packages/dvb && npm run build) && \
      (cd packages/dvb && rm -rf node_modules) && \
      (cd packages/dvb && npm install --production)

# configure nginx
RUN apk add nginx && \
      mkdir -p /run/nginx/ && \
      rm /etc/nginx/conf.d/default.conf
COPY dockerfiles/dvb.nginx /etc/nginx/conf.d/dvb.conf

# attribution
RUN npx license-report --output=html --package=packages/dvb/package.json > packages/dvb-ui/public/attributions/backend.html && \
      npx license-report --output=html --package=packages/dvb-ui/package.json > packages/dvb-ui/public/attributions/frontend.html

# run command
COPY dockerfiles/run.sh .
RUN apk add openssl && \
      chmod +x run.sh
CMD ["sh", "./run.sh"]