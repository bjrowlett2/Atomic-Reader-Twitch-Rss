const Express = require('express');
const ExpressHandlebars = require('express-handlebars');
const NodeFetch = require('node-fetch');

const App = Express();

App.engine('handlebars', ExpressHandlebars());

App.set('views', '/app/src/views');
App.set('view engine', 'handlebars');

let AccessTokenValue = '';
let AccessTokenExpiresAt = Date.now();

const ClientId = process.env['TWITCH_CLIENT_ID'];
const ClientSecret = process.env['TWITCH_CLIENT_SECRET'];

if (!ClientId || !ClientSecret) {
    console.error('[ERROR] A ClientId and ClientSecret must be supplied!');
    process.exit(1);
}

function GetAccessToken(callback) {
    if (AccessTokenValue && !(AccessTokenExpiresAt < Date.now())) {
        if (callback) {
            callback(AccessTokenValue, AccessTokenExpiresAt); /// Use the cached access token.
        }
    } else {
        const url = `https://id.twitch.tv/oauth2/token?client_id=${ClientId}&client_secret=${ClientSecret}&grant_type=client_credentials`;
        const options = {
            method: 'POST'
        };
    
        const execCallbackFunc = json => {
            if (!json['access_token']) {
                throw new Error('[ERROR] No access_token found!');
            }
    
            if (!json['expires_in']) {
                throw new Error('[ERROR] No expires_in found!');
            }
    
            if (callback) {
                callback(json['access_token'], json['expires_in']);
            }
        };
    
        NodeFetch(url, options)
            .then(response => response.json())
            .then(json => execCallbackFunc(json))
            .catch(reason => console.error(reason));
    }
}

function GetUsers(login, callback) {
    const url = `https://api.twitch.tv/helix/users?login=${login}`;
    const options = {
        headers: {
            'Authorization': `Bearer ${AccessTokenValue}`,
            'Client-Id': ClientId
        }
    }

    const execCallbackFunc = json => {
        if (!json['data'][0]['id']) {
            throw new Error('[ERROR] No user_id found!');
        }

        if (callback) {
            callback(json['data'][0]['id']);
        }
    };

    NodeFetch(url, options)
        .then(response => response.json())
        .then(json => execCallbackFunc(json))
        .catch(reason => console.error(reason));
}

function GetVideos(userId, callback) {
    const url = `https://api.twitch.tv/helix/videos?user_id=${userId}&type=archive`;
    const options = {
        headers: {
            'Authorization': `Bearer ${AccessTokenValue}`,
            'Client-Id': ClientId
        }
    };

    const execCallbackFunc = json => {
        if (callback) {
            callback(json);
        }
    };

    NodeFetch(url, options)
        .then(response => response.json())
        .then(json => execCallbackFunc(json))
        .catch(reason => console.error(reason));
}

App.get('/api/v1/:login', async (request, response) => {
    const login = request.params['login'];

    GetAccessToken((accessToken, expiresIn) => {
        AccessTokenValue = accessToken;
        AccessTokenExpiresAt = Date.now() + expiresIn;

        GetUsers(login, userId => {
            GetVideos(userId, videos => {
                const thumbnailWidth = 640;
                const thumbnailHeight = 360;

                const context = {
                    title: login,
                    description: `${login}'s Twitch feed`,
                    link: `https://atomic-reader-rss.herokuapp.com/api/v1/${login}`,
                    items: videos.data.map(item => {
                        let thumbnail_url = item.thumbnail_url;
                        thumbnail_url = thumbnail_url.replace('%{width}', `${thumbnailWidth}`);
                        thumbnail_url = thumbnail_url.replace('%{height}', `${thumbnailHeight}`);

                        if (!thumbnail_url) {
                            thumbnail_url = `https://vod-secure.twitch.tv/_404/404_processing_${thumbnailWidth}x${thumbnailHeight}.png`;
                        }

                        return {
                            guid: item.id,
                            title: item.title,
                            description: `<a href="${item.url}"><img src="${thumbnail_url}" /></a>`,
                            link: item.url,
                            published: item.created_at
                        };
                    })
                };
    
                response.render('rss', context, (error, html) => {
                    if (error) {
                        response.sendStatus(500);
                    } else {
                        response.contentType('application/rss+xml').send(html);
                    }
                });
            });
        });
    });
});

const Port = 8080;
App.listen(Port, '0.0.0.0', () => {
    console.log(`Listening at http://localhost:${Port}`);
});
