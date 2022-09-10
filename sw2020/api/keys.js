const express = require('express');
const fs = require('fs');
const path = require ('path');
const { request } = require('http');
const router = express.Router();

const twit = JSON.parse(fs.readFileSync(path.join(__dirname, '../collections', 'twitKeys.json'), 'utf8'));

//modify single member
router.put('', (req, res) => {

    if(req.body.consumer_key && req.body.consumer_secret && req.body.access_token && req.body.access_token_secret){
        if(req.body.consumer_key.indexOf(' ') === -1 && req.body.consumer_secret.indexOf(' ') === -1 && req.body.access_token.indexOf(' ') === -1 && req.body.access_token_secret.indexOf(' ') === -1){
            
            twit.consumer_key = req.body.consumer_key;
            twit.consumer_secret = req.body.consumer_secret;
            twit.access_token = req.body.access_token;
            twit.access_token_secret = req.body.access_token_secret;
            fs.writeFile(path.join(__dirname, '../collections', 'twitKeys.json'), JSON.stringify(twit), (err) => {
                if(err){
                    throw err;
                }
                res.json({ msg: 'OK'});
            });
        } else {
            res.status(400).json({ msg: 'spacyKeys'});
        }
    } else {
        res.status(400).json({ msg: 'nullKeys'});
    }        
});

module.exports = router;