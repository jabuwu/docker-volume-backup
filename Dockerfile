FROM node
ENV DEBIAN_FRONTEND=noninteractive
WORKDIR /root

# install nginx
RUN apt-get update --fix-missing
RUN apt-get install -y nginx

# install node modules
COPY packages/dvb/package*.json ./packages/dvb/
RUN (cd packages/dvb && npm install)
COPY packages/dvb-ui/package*.json ./packages/dvb-ui/
RUN (cd packages/dvb-ui && npm install)

# build frontend
COPY packages/dvb-ui packages/dvb-ui/
COPY dockerfiles/dvb-ui.env packages/dvb-ui/.env.production
RUN (cd packages/dvb-ui && npm run build)

# build backend
COPY packages/dvb packages/dvb/
RUN (cd packages/dvb && npm run build)
COPY dockerfiles/dvb.env packages/dvb/.env

# configure nginx
RUN rm /etc/nginx/sites-enabled/default
COPY dockerfiles/dvb.nginx /etc/nginx/sites-enabled/dvb

# clean up
RUN apt-get autoremove -y && \
      apt-get clean -y && \
      rm -rf /var/lib/apt/lists/*
ENV DEBIAN_FRONTEND=dialog

# run command
COPY dockerfiles/run.sh .
RUN chmod +x run.sh
CMD ["bash", "./run.sh"]