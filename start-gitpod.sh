URL_3000=$(gp url 3000)
URL_1998=$(gp url 1998)
URL_1998_WS=$(echo $URL_1998 | sed "s/https/wss/")
sudo docker-up
sudo chown gitpod:gitpod /var/run/docker.sock
echo -e "CORS_ORIGIN=$URL_3000" > packages/dvb/.env
echo -e "NEXT_PUBLIC_GRAPHQL=$URL_1998/graphql\nNEXT_PUBLIC_GRAPHQL_WS=$URL_1998_WS/graphql" > packages/dvb-ui/.env.development.local
npm run dev