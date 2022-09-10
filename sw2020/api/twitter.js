var Twit = require('twit');
var fs = require('fs');
const express = require('express');
const router = express.Router();
var path = require('path');
const { json } = require('body-parser');
const keys = JSON.parse(fs.readFileSync(path.join(__dirname, '../collections', 'twitKeys.json'), 'utf8'));
var T = new Twit(keys);
var getMidpoint = require("getmidpoint");
const moment = require('moment');



router.get('/tweetlist', (req, res) => {
    var params = {  // - structure to be sent to Twitter so we can get the tweets back
        q: 'a', //what I'm searching for
        count: 100, //number of tweets needed (max=100)
        tweet_mode: 'extended'  //if this parameter is not specified the tweets will arrive in a shortened version, which we don't want
    }

    if (req.query.q !== undefined && req.query.q !== null) { //we make sure that query sent by the client exists
        params.q = req.query.q + ' -is:retweet -RT';
        var argument = req.query.q.split(" ");
        argument.forEach(element => {
            params.q = params.q + ' -from:' + element;
        });
    } else { res.status(400).json({ msg: 'badq' }); }

    if (req.query.lat !== undefined && req.query.lat !== null && req.query.long !== undefined && req.query.long !== null && req.query.range !== undefined && req.query.range !== null) { //we make sure that coords sent by the client exist
        if (req.query.lat !== '' && req.query.long !== '' && req.query.range !== '') {
            params.q = params.q + ' geocode:' + req.query.lat + ',' + req.query.long + ',' + req.query.range;
        }
    }

    if (req.query.count !== undefined && req.query.count !== null && parseInt(req.query.count) > 0) { //we make sure that count sent by the client exists
        params.count = parseInt(req.query.count);
    } else { res.status(400).json({ msg: 'badcount' }); }


    T.get('search/tweets', params, gotData);    //we call the T.get to receive the tweets and handle them in gotData()

    function gotData(err, data, response) {

        if (err !== undefined && err !== null && err.code === 25) {    // we make sure the server doesn't crash if an empty search is queried
            res.status(400).json('emptysearch');
        } else if (data.statuses === null || data.statuses === undefined || data.statuses === []) {
            res.status(400).json('noTweets');
        } else {
            var tweets = data.statuses; // we extract the tweets form data.statuses
            var search_array = [];  // we initialize the array which will contain the tweets restructured by us
            tweets.forEach(element => { //we save each twit in a json format useful to us
                var single_twit = { //base json format useful to us
                    "id": 0,
                    "time": "",
                    "text": "",
                    "name": "",
                    "media": [],
                    "user_name": "",
                    "geo_lat": "",
                    "geo_lon": "",
                    "profile_img": "",
                    "link": ""
                };
                single_twit.id = element.id_str;  // each twit's id is unique, so we will use it as an id for our twit's structure
                single_twit.time = element.created_at;  // time at which the twit got posted
                single_twit.text = element.full_text;   // text published
                single_twit.text = deleteLinks(single_twit.text);

                if(typeof element.user.profile_image_url === 'string' && element.user.profile_image_url !== ''){
                    single_twit.profile_img = element.user.profile_image_url;
                }
                if(typeof element.user.name === 'string' && element.user.name !== ''){
                    single_twit.name = element.user.name;
                }
                // Saving media images links in a media array
                if (element.extended_entities !== undefined && element.extended_entities !== null && element.extended_entities.media !== null && element.extended_entities.media !== null) {
                    element.extended_entities.media.forEach(image => {
                        if (image.type === "photo") {
                            single_twit.media.push(image.media_url);
                        }
                    });
                } else if (element.entities.media !== undefined && element.entities.media !== null) {
                    element.entities.media.forEach(image => {
                        if (image.type === "photo") {
                            single_twit.media.push(image.media_url);
                        }
                    });
                }

                single_twit.user_name = element.user.screen_name;   // saving the user who posted the twit

                // we now work on the geo coords
                if (element.geo !== null) {
                    single_twit.geo_lat = element.geo.coordinates[0];
                    single_twit.geo_lon = element.geo.coordinates[1];
                } else if (element.coordinates !== null) {
                    single_twit.geo_lat = element.coordinates.coordinates[1];
                    single_twit.geo_lon = element.coordinates.coordinates[0];
                } else if (element.place !== null) {
                    var coords = getMidpoint(element.place.bounding_box.coordinates[0][0][1], element.place.bounding_box.coordinates[0][0][0], element.place.bounding_box.coordinates[0][2][1], element.place.bounding_box.coordinates[0][2][0], 'm');
                    single_twit.geo_lat = coords.latitude;
                    single_twit.geo_lon = coords.longitude;
                } else {
                    single_twit.geo_lat = req.query.lat;
                    single_twit.geo_lon = req.query.long;
                }

                // set the link so the post can be accessed
                single_twit.link = 'https://twitter.com/' + single_twit.user_name + '/status/' + single_twit.id;

                search_array.push(single_twit); // we add each restructured twit to our tweets array
            });
            res.json(search_array); // we send back the tweet array
        }
    }
});


router.post('/tweetsave', (req, res) => {

    var tweets = req.body;
    fs.writeFileSync(path.join(__dirname, '../collections/Searches', moment().format('DD[-]MM[-]YYYY[,]HH[-]mm[-]ss[-]') + moment().millisecond() + '.json'), JSON.stringify(tweets));
    res.json({ msg: 'OK' });

});


router.get('/loadSearchList', (req, res) => {

    const files = fs.readdirSync(path.join(__dirname, '../collections/Searches'), 'utf8');
    if (files === undefined || files === null || files === [] || files[0] === undefined || files[0] === null || files[0] === '') {

        res.status(400).json({ msg: 'empty' });
    }
    res.json(files);
});

router.get('/loadSearch', (req, res) => {
    var tweets = JSON.parse(fs.readFileSync(path.join(__dirname, '../collections/Searches', req.query.id), 'utf8'));
    res.json(tweets);
})



////////////// STREAM
/*
class Stream{
    constructor(){
        stream = null;
        term = '';
    }
    streamTerm(words){
        var i = 0, done = false;
        while(i < words.length && !done){
            if(words[i] === ' '){
                words = words.substring(0, i-1);
                done = true;
            }
            i = i + 1;
        }
        if(done === false){
            this.term = words;
        }
        this.stream = T.stream('statuses/filter', {track: this.term}, function(tweet){
            return tweet;
        });
    }
    stopStream(){
        this.stream.stop();
        this.stream = null;
        this.term = '';
    }

}
var myStream = new Stream();


router.get('/stream/')
*/




//////////////////// --- STREAM

//var stream = T.stream('statuses/filter', { locations: sanFrancisco })
//var sanFrancisco = [ '-122.75', '36.8', '-121.75', '37.8' ]

class Stream {
    constructor(){
        this.stream = null;
        this.manualFilterBy = '';
        this.foundTweets = [];
        this.trackItem = {};
        console.log(this.foundTweets);
    }
    setTerm(term){  //term: non null, non empty, string
        this.word = term;
        console.log(this.word);
    }
    setTrackItems(items){

        if(items.lon1 !== '' && items.term !== ''){
            this.trackItem = {locations: [items.lon1, items.lat1, items.lon2, items.lat2]};
            this.manualFilterBy = items.term;
        } else if(items.lon1 === '' && items.term !== ''){
            this.trackItem = {track: items.term};
        } else if(items.lon1 !== '' && items.term === ''){
            this.trackItem = {locations: [items.lon1, items.lat1, items.lon2, items.lat2]};
        } else {
            return {msg: 'no loc and no term'};
        }
    }
    setLocation(coords){
        this.location = [coords.lon1, coords.lat1, coords.lon2, coords.lat2];
    }
    getStream(){
        return this.stream;
    }
    isPresent(text){
        if(text.search(this.manualFilterBy) === -1){
            return false;
        }
        return true;
    }
    startStream(){
        console.log('\ntrackItem è');
        console.log(this.trackItem);
        this.stream = T.stream('statuses/filter', this.trackItem);
        this.stream.on('tweet', function (tweet){
            console.log(tweet);
            console.log('\n');
            var single_twit = { //base json format useful to us
                "id": 0,
                "time": "",
                "text": "",
                "media": [],
                "user_name": "",
                "geo_lat": "",
                "geo_lon": "",
                "link": "",
                "profile_img": ""
            };
            try{
                single_twit.text = tweet.extended_tweet.full_text;   // text published
            } catch {
                single_twit.text = tweet.text;   // text published
            }
            single_twit.text = deleteLinks(single_twit.text);
            var isGood = true;
            if(this.manualFilterBy !== '' && !myStream.isPresent(single_twit.text)){
                isGood = false;
            }

            if(isGood){

                single_twit.id = tweet.id_str;  // each twit's id is unique, so we will use it as an id for our twit's structure
                single_twit.time = tweet.created_at;  // time at which the twit got posted
                
                // Saving media images links in a media array
                if (tweet.extended_entities !== undefined && tweet.extended_entities !== null && tweet.extended_entities.media !== null && tweet.extended_entities.media !== null) {
                    tweet.extended_entities.media.forEach(image => {
                        if (image.type === "photo") {
                            single_twit.media.push(image.media_url);
                        }
                    });
                } else if (tweet.entities.media !== undefined && tweet.entities.media !== null) {
                    tweet.entities.media.forEach(image => {
                        if (image.type === "photo") {
                            single_twit.media.push(image.media_url);
                        }
                    });
                }
                if(typeof tweet.user.profile_image_url === 'string' && tweet.user.profile_image_url !== ''){
                    single_twit.profile_img = tweet.user.profile_image_url;
                }
                if(typeof tweet.user.name === 'string' && tweet.user.name !== ''){
                    single_twit.name = tweet.user.name;
                }
                single_twit.user_name = tweet.user.screen_name;   // saving the user who posted the twit
                // we now work on the geo coords
                if (tweet.geo !== null) {
                    single_twit.geo_lat = tweet.geo.coordinates[0];
                    single_twit.geo_lon = tweet.geo.coordinates[1];
                } else if (tweet.coordinates !== null) {
                    single_twit.geo_lat = tweet.coordinates.coordinates[1];
                    single_twit.geo_lon = tweet.coordinates.coordinates[0];
                } else if (tweet.place !== null) {
                    var coords = getMidpoint(tweet.place.bounding_box.coordinates[0][0][1], tweet.place.bounding_box.coordinates[0][0][0], tweet.place.bounding_box.coordinates[0][2][1], tweet.place.bounding_box.coordinates[0][2][0], 'm');
                    single_twit.geo_lat = coords.latitude;
                    single_twit.geo_lon = coords.longitude;
                } else {
                    //single_twit.geo_lat = req.query.lat;  //IF POSITION ACTIVE, ADD LAT, LON TO startStream
                    //single_twit.geo_lon = req.query.long; //IF POSITION ACTIVE, ADD LAT, LON TO startStream
                }
                // set the link so the post can be accessed
                single_twit.link = 'https://twitter.com/' + single_twit.user_name + '/status/' + single_twit.id;
                
                myStream.foundTweets.push(single_twit);
            }
            });
        }
        retrieveTweetsFromStream(){
            if(this.foundTweets.length > 0){
                var tmp = this.foundTweets;
                this.foundTweets = [];
                return tmp;
            } else {
                return {msg: 'noNew'};
            }
        }
        stopStream(){
        if(this.stream !== null){

            this.stream.stop();
            this.stream = null;
            this.trackItem = null;
            this.manualFilterBy = '';
            this.foundTweets = [];
        }
        return {msg: 'OK'};
    }
}
var myStream = new Stream();


//input
//  term: 'stringa di roba che vuoi streammare'
//cosa fa
//  apre la stream per la parola term
//  se la stream è già aperta per quella parola, allora la mantiene aperta
//  se term è diverso dal term di una stream già attiva, prima chiude la stream attiva, poi fa partire la nuova
router.post('/startStream', (req, res) => {
    console.log(req.body);
    var stopped = {msg: 'OK'};
    if(myStream.getStream() !== null){
        stopped = myStream.stopStream();
    }
    if(stopped.msg === 'OK'){
        myStream.setTrackItems(req.body);
        myStream.startStream();
        res.json({msg: 'OK'});
    } else {
        res.status(stopped.errCode).json({msg: stopped.msg});
    }
});

router.get('/getStreamedTweets', (req, res) => {
    res.json(myStream.retrieveTweetsFromStream());
});

router.delete('/stopStream', (req, res) => {
    var stopped = myStream.stopStream();
    if(stopped.msg === 'OK'){
        res.json('OK');
    } else {
        res.status(stopped.errCode).json({msg: stopped.msg});
    }
});






router.post('/liveSave', (req, res) => {
    var lives = req.body;
    fs.writeFileSync(path.join(__dirname, '../collections/Streams', moment().format('DD[-]MM[-]YYYY[,]HH[-]mm[-]ss[-]') + moment().millisecond() + '.json'), JSON.stringify(lives));
    res.json({ msg: 'OK' });
});

router.get('/loadStreamList', (req, res) => {
    const files = fs.readdirSync(path.join(__dirname, '../collections/Streams'), 'utf8');
    if (files === undefined || files === null || files === [] || files[0] === undefined || files[0] === null || files[0] === '') {

        res.status(400).json({ msg: 'empty' });
    }
    res.json(files);
});

router.get('/loadStream', (req, res) => {
    var lives = JSON.parse(fs.readFileSync(path.join(__dirname, '../collections/Streams', req.query.id), 'utf8'));
    res.json(lives);
})











/////////////////// FOLLOW
router.get('/followList', (req, res) => {
    var params = {  // - structure to be sent to Twitter so we can get the tweets back
        screen_name: 'mkbhd', //what I'm searching for
        count:200,
        tweet_mode: 'extended'
    }
    if (typeof req.query.q === 'string' && req.query.q !== '') { //we make sure that query sent by the client exists
        params.screen_name = req.query.q;
    } else { res.status(400).json({ msg: 'badq' }); }

    T.get('statuses/user_timeline', params, gotFollow);    //we call the T.get to receive the tweets and handle them in gotData()

    function gotFollow(err, data, response) {
        console.log(err)
        if (typeof err !== 'undefined' && err !== null && (err.code === 34 || err.statusCode === 401)) {    // we make sure the server doesn't crash if an empty search is queried
            res.status(400).json('no user found');
        } else if (data === null || typeof data === 'undefined' || data.length < 1) {
            res.status(400).json('noTweets');
        } else {
            var tweets = data; // we extract the tweets form data.statuses
            var search_array = [];  // we initialize the array which will contain the tweets restructured by us
            tweets.forEach(element => { //we save each twit in a json format useful to us
                var single_twit = { //base json format useful to us
                    "id": 0,
                    "name": "",
                    "time": "",
                    "text": "",
                    "media": [],
                    "user_name": "",
                    "profile_img": "",
                    "geo_lat": "",
                    "geo_lon": "",
                    "link": ""
                };
                single_twit.id = element.id_str;  // each twit's id is unique, so we will use it as an id for our twit's structure
                single_twit.time = element.created_at;  // time at which the twit got posted
                try{
                    single_twit.text = element.extended_tweet.full_text;   // text published
                } catch {
                    try{
                        single_twit.text = element.full_text;   // text published
                    } catch {
                        single_twit.text = element.text;   // text published
                }
                }

                single_twit.text = deleteLinks(single_twit.text);

                if(typeof element.user.profile_image_url === 'string' && element.user.profile_image_url !== ''){
                    single_twit.profile_img = element.user.profile_image_url;
                }
                if(typeof element.user.name === 'string' && element.user.name !== ''){
                    single_twit.name = element.user.name;
                }
                // Saving media images links in a media array
                if (element.extended_entities !== undefined && element.extended_entities !== null && element.extended_entities.media !== null && element.extended_entities.media !== null) {
                    element.extended_entities.media.forEach(image => {
                        if (image.type === "photo") {
                            single_twit.media.push(image.media_url);
                        }
                    });
                } else if (element.entities.media !== undefined && element.entities.media !== null) {
                    element.entities.media.forEach(image => {
                        if (image.type === "photo") {
                            single_twit.media.push(image.media_url);
                        }
                    });
                }

                single_twit.user_name = element.user.screen_name;   // saving the user who posted the twit

                // we now work on the geo coords
                if (element.geo !== null) {
                    single_twit.geo_lat = element.geo.coordinates[0];
                    single_twit.geo_lon = element.geo.coordinates[1];
                } else if (element.coordinates !== null) {
                    single_twit.geo_lat = element.coordinates.coordinates[1];
                    single_twit.geo_lon = element.coordinates.coordinates[0];
                } else if (element.place !== null) {
                    var coords = getMidpoint(element.place.bounding_box.coordinates[0][0][1], element.place.bounding_box.coordinates[0][0][0], element.place.bounding_box.coordinates[0][2][1], element.place.bounding_box.coordinates[0][2][0], 'm');
                    single_twit.geo_lat = coords.latitude;
                    single_twit.geo_lon = coords.longitude;
                } else {
                    single_twit.geo_lat = '';
                    single_twit.geo_lon = '';
                }

                // set the link so the post can be accessed
                single_twit.link = 'https://twitter.com/' + single_twit.user_name + '/status/' + single_twit.id;
                search_array.push(single_twit); // we add each restructured twit to our tweets array
            });
            res.json(search_array); // we send back the tweet array
        }
    }
});

router.post('/usersave', (req, res) => {
    var newUser = req.body;
    var oldUser = {};
    try{
        oldUser = JSON.parse(fs.readFileSync(path.join(__dirname, '../collections/Users', newUser.title + '.json'), 'utf8'));
    } catch (err) {
        oldUser = {tweets:[]};
    }

    for (let oldIndex = 0; oldIndex < oldUser.tweets.length; oldIndex++) {
        var found = false;
        var newIndex = 0;
        while(newIndex < newUser.tweets.length && !(found)){
            if(newUser.tweets[newIndex].id === oldUser.tweets[oldIndex].id){
                found = true;
            }
            newIndex = newIndex + 1;
        }
        if(!found){
            newUser.tweets.push(oldUser.tweets[oldIndex]);
        }
    }

    fs.writeFileSync(path.join(__dirname, '../collections/Users', newUser.title + '.json'), JSON.stringify(newUser));
    res.json({ msg: 'OK' });

});

router.get('/loadUserList', (req, res) => {

    const files = fs.readdirSync(path.join(__dirname, '../collections/Users'), 'utf8');
    if (files === undefined || files === null || files === [] || files[0] === undefined || files[0] === null || files[0] === '') {

        res.status(400).json({ msg: 'empty' });
    }
    res.json(files);
});

router.get('/loadUser', (req, res) => {
    console.log(req.query.id);
    var users = JSON.parse(fs.readFileSync(path.join(__dirname, '../collections/Users', req.query.id), 'utf8'));
    res.json(users);
})









function deleteLinks(tweetText){
    startString = '';
    endString = '';
    foundSpace = false;
    toDelete = tweetText.search('http');
    while(toDelete > -1){
        var i = toDelete+3;
        while(i < tweetText.length && !foundSpace){
            if(tweetText[i] === ' '){
                foundSpace = true;
            }
            i = i + 1;
        }

        startString = tweetText.slice(0, toDelete);
        endString = tweetText.slice(i-1, tweetText.length-1);
        tweetText = startString + endString;
        toDelete = tweetText.search('http');
    }
    return tweetText;
}







// stampa su twitter tweets  // ok funziona
/**var tweet = {
    status: '#prova17novembre another trial'
}
T.post('statuses/update', tweet, tweeted);
function tweeted(err, data, response){
    if (err){
        console.log("Something went wrong!");
    } else{
        console.log("it worked!");
    }
} */



//caricamento immagine - ok funziona 
/**var filename = 'output.png';
var params = {
    encoding : 'base64'
}
var b64 = fs.readFileSync(filename, params);
T.post('media/upload', {media_data: b64}, uploaded); //---> sto caricando su twitter qualcosa, ma non sto twittando
function uploaded (err, data, response){
    //Qui potrò twittare
    //data è la chiave, data ha un index 
    var id = data.media_id_string;
    var tweet = {
        status: '#prova17novembre another trial with an image',
        media_ids: [id]
    }
    T.post('statuses/update', tweet, tweeted);
}
function tweeted(err, data, response){
    if (err){
        console.log("Something went wrong!");
    } else{
        console.log("it worked!");
    }
} */








//raccolta tweets con la località, stampa soltanto i tweet che hanno il place diverso da null

/**var stream = T.stream('statuses/filter', {track: "covid"})
stream.on('tweet', function (tweet){
    if (tweet.place!=null){
    if (tweet.place.country_code == 'US'){ //qui si può specificare di quale paese voglio raccogliere i tweets
   console.log(tweet);
   console.log('-------------------------------------');
    }
    }
    
}) */



//ricerca con più parole
/*var stream = T.stream('statuses/filter', { track: ['bananas', 'oranges', 'strawberries'] })
stream.on('tweet', function(tweet){
        console.log(tweet);
        console.log('-------------------');
    
}) */














//lettura dei tweets da twitter // ok funziona
//----------------> place per individuare il luogo ............... ok 







// stampa su twitter tweets  // ok funziona
/**var tweet = {
    status: '#prova17novembre another trial'
}
T.post('statuses/update', tweet, tweeted);
function tweeted(err, data, response){
    if (err){
        console.log("Something went wrong!");
    } else{
        console.log("it worked!");
    }
} */



//caricamento immagine - ok funziona 
/**var filename = 'output.png';
var params = {
    encoding : 'base64'
}
var b64 = fs.readFileSync(filename, params);
T.post('media/upload', {media_data: b64}, uploaded); //---> sto caricando su twitter qualcosa, ma non sto twittando
function uploaded (err, data, response){
    //Qui potrò twittare
    //data è la chiave, data ha un index 
    var id = data.media_id_string;
    var tweet = {
        status: '#prova17novembre another trial with an image',
        media_ids: [id]
    }
    T.post('statuses/update', tweet, tweeted);
}
function tweeted(err, data, response){
    if (err){
        console.log("Something went wrong!");
    } else{
        console.log("it worked!");
    }
} */



// real time monitoring stream hashtag - // ok funziona - raccoglie tweets in live 
/**var stream = T.stream('statuses/filter', {track: '#covid'})
stream.on('tweet', function (tweet){
    console.log(tweet.text);
    console.log('-----');
}) 
*/




//raccolta tweets con la località, stampa soltanto i tweet che hanno il place diverso da null

/**var stream = T.stream('statuses/filter', {track: "covid"})
stream.on('tweet', function (tweet){
    if (tweet.place!=null){
    if (tweet.place.country_code == 'US'){ //qui si può specificare di quale paese voglio raccogliere i tweets
   console.log(tweet);
   console.log('-------------------------------------');
    }
    }
    
}) */



//ricerca con più parole
/*var stream = T.stream('statuses/filter', { track: ['bananas', 'oranges', 'strawberries'] })
stream.on('tweet', function(tweet){
        console.log(tweet);
        console.log('-------------------');
    
}) */

module.exports = router;