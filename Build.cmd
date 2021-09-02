@ECHO OFF

SET VERSION=1.5

docker build -t dkr.atomic-reader.com/atomic-reader-rss:%VERSION% .

docker run --detach --env-file "twitch.env" --publish "30001:8080" --rm dkr.atomic-reader.com/atomic-reader-rss:%VERSION%
