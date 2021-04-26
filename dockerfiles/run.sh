if [ ! -z "${AUTH_USERNAME}" ]; then
  if [ ! -z "${AUTH_PASSWORD}" ]; then
    printf "$AUTH_USERNAME:$(openssl passwd -apr1 $AUTH_PASSWORD)\n" > /etc/nginx/htpasswd
    sed -i "s/#auth/auth_basic \"Login\";\n        auth_basic_user_file \/etc\/nginx\/htpasswd;/" /etc/nginx/conf.d/dvb.conf
  fi
fi
nginx
(cd packages/dvb-ui && npm start&)
(cd packages/dvb && npm start)