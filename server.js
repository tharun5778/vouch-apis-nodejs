const express = require('express')
const axios = require('axios')
const app = express()
const port = process.env.PORT || 3000
const bodyParser = require('body-parser');
const OAuth = require('oauth');



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "*"); //
    next();
});

app.get('/auth', (req, res) => {
    //Using OAuth package for Signature
    var oauth = new OAuth.OAuth(
        'https://api.twitter.com/oauth/request_token', //request token
        'https://api.twitter.com/oauth/access_token', //access token
        'EkPTcyVBB2MI3I2hGQeCrPCww', //twitter api key or consumer key
        'BpStXLAoMspOoH8rhC6dGbveTAhThKVxkm1brdmywaDrncJrOI', //secret key twitter api...
        '1.0A', // version
        null,
        'HMAC-SHA1' //signature method
    );
    oauth.getOAuthRequestToken((error, oauth_token, oauth_token_secret, results) => {
            if (error) {
                res.send({
                    error: true,
                    message: "internal server error"
                })
            } else {
                res.send({
                    error: false,
                    oauth_token: oauth_token, //Request token for developer webisite
                    oauth_token_secret: oauth_token_secret //Request token secret for developer webisite
                })
            }
        })
        //Using postman code for Signature
        // var config = {
        //     method: 'get',
        //     url: 'https://api.twitter.com/oauth/request_token',
        //     headers: {
        //         'Authorization': 'OAuth oauth_consumer_key="EkPTcyVBB2MI3I2hGQeCrPCww",oauth_signature_method="HMAC-SHA1",oauth_timestamp="1601743294",oauth_nonce="nqIFadzzI8G",oauth_version="1.0",oauth_signature="wDMsw3nb9ZVge5G4h1quFntJkW4%3D"',
        //     }
        // };

    // axios(config)
    //     .then((response) => {
    //         var data = response.data
    //         var values = data.split('&')
    //         var dataobject = {
    //             oauth_token: values[0].split("=")[1],
    //             oauth_token_secret: values[1].split("=")[1],
    //             oauth_callback_confirmed: values[2].split("=")[1]
    //         }
    //         res.send(dataobject)
    //     })
    //     .catch((error) => {
    //         res.send("internal server error")
    //     });
})

//Verify the login from twitter
app.get('/auth_verify/:oauth_token/:oauth_verifier', (req, res) => {
    let body = req.params
    console.log("oauth_token", body.oauth_token, "oauth_verifier", body.oauth_verifier)
    var config = {
        method: 'get',
        url: "https://api.twitter.com/oauth/access_token?oauth_token=" + body.oauth_token + "&oauth_verifier=" + body.oauth_verifier,
    };
    axios(config)
        .then((response) => {
            console.log("RESPONSE", response)
            var data = response.data
            var values = data.split('&')
            var dataobject = {
                oauth_token: values[0].split("=")[1],
                oauth_token_secret: values[1].split("=")[1],
                user_id: values[2].split("=")[1],
                screen_name: values[3].split("=")[1]
            }
            res.send({ error: false, tweets: dataobject })
        })
        .catch((error) => {
            res.send({
                error: true,
                message: "internal server error"
            })
        });

})
app.get("/error", (req, res) => {
        throw Error('error in code');

    })
    // app.get('/home/:oauth_token_secret/:oauth_token', async (req, res) => {
    //     let body = req.params
    //     console.log("oauth_token", body.oauth_token, "oauth_token_secret", body.oauth_token_secret)
    //     let access_token = body.oauth_token
    //     let access_token_secret = body.oauth_token_secret
    //     var axios = require('axios');
    //     console.log(typeof (access_token))
    //     var config = {
    //         method: 'get',
    //         url: 'https://api.twitter.com/1.1/statuses/home_timeline.json?include_entities=true',
    //         headers: {
    //             'Authorization': 'OAuth oauth_consumer_key="EkPTcyVBB2MI3I2hGQeCrPCww",oauth_signature_method="HMAC-SHA1",oauth_timestamp="1601546817",oauth_nonce="GyBCDZZ4fI2",oauth_version="1.0",oauth_signature="JcHPprvBei7YxoAiw%2FRRyqVOZJA%3D",oauth_token=' + access_token + ""
    //         }
    //     };
    //     console.log("Headers", config.headers.Authorization)
    //     axios(config)
    //         .then((response) => {
    //             // console.log(JSON.stringify(response.data));
    //             res.send({ data: response.data })
    //         })
    //         .catch((error) => {
    //             console.log("errorr>>>>>>>>", JSON.stringify(error))
    //             res.send({ error: true })
    //         });
    // })

//get users Tweets from twitter api
app.get('/tweets/:oauth_token_secret/:oauth_token', async(req, res) => {
    let body = req.params
    let access_token = body.oauth_token
    let access_token_secret = body.oauth_token_secret
    var oauth = new OAuth.OAuth(
        'https://api.twitter.com/oauth/request_token', //request token
        'https://api.twitter.com/oauth/access_token', //access token
        'EkPTcyVBB2MI3I2hGQeCrPCww', //twitter api key or consumer key
        'BpStXLAoMspOoH8rhC6dGbveTAhThKVxkm1brdmywaDrncJrOI', //secret key twitter api
        '1.0A', // version
        null,
        'HMAC-SHA1' //signature method
    );
    oauth.get(
        'https://api.twitter.com/1.1/statuses/home_timeline.json?count=200',
        access_token, //test user token
        access_token_secret, //test user secret            
        (e, data) => {
            if (e) {
                res.send({
                    error: true,
                    message: "internal server error"
                })
            }
            var tweets = JSON.parse(data)
            res.send({ error: false, data: tweets })

        });
});
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})