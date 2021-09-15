@ECHO OFF

SET VERSION=1.7

docker build -t dkr.atomic-reader.com/twitch-rss:%VERSION% .

docker run --detach --env-file "twitch.env" --name "atomic-reader-twitch-rss" --publish "30001:8080" dkr.atomic-reader.com/twitch-rss:%VERSION%
