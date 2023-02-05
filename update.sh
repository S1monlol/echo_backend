docker stop discord-bot-echo-backend
docker rm discord-bot-echo-backend

git pull

docker build . -t discord-bot-echo-backend

docker run -d --name discord-bot-echo-backend --restart always --env-file .env discord-bot-echo-backend
docker logs -f discord-bot-echo-backend
