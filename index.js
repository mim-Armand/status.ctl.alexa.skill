/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/
// We can use the following API:
// https://status.ctl.io/v1/status
'use strict';
const Alexa = require('alexa-sdk');
const https = require('https');

const helloMessages = ["hello!"]
const reprompMessages = ["Reprompt"]
const unrecognisedResponses = ["What was that again?"]
const APP_ID = process.env.APP_ID;
const apiUrl = 'https://status.ctl.io/v1/status';

const handlers = {
    'LaunchRequest': function() {
        console.log('======================== LaunchRequest')
        this.attributes.speechOutput = helloMessages[randomInRange(0, helloMessages.length)];
        this.attributes.repromptSpeech = reprompMessages[randomInRange(0, reprompMessages.length)];
        this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
        this.emit(':responseReady');
    },
    'RepromptRequest': function() {
        this.attributes.repromptSpeech = reprompMessages[randomInRange(0, reprompMessages.length)];
        this.response.speak(this.attributes.repromptSpeech).listen(this.attributes.repromptSpeech);
        this.emit(':responseReady');
    },
    'GetStatus': function() {
        console.log('======================== GetPrice')
        fetchPrice().then((d) => {

            let statesList = [[],[],[],[],[]]

            Object.keys(d.services).map( function(item, index){
                var st = d.services[item].state;
                var time = 'current'; // 'current', or like: '9/21'
                if(st[time]){
                    statesList[st[time]].push(item);
                    // values for st[time]:
                    // I guess numbers map to: ( needs to be verified )
                    //
                    // Operational: 0 or 1
                    // Planned Maintenance: 2
                    // Partial Service Disruption: 3
                    // Service Disruption: 4
                    //
                }
                return null;
            })
            console.log('statesList', statesList)

            //todo: make the text_to_be_spoken according to the result

            this.attributes.speechOutput = `Currently there are ${d.active.length} active and ${d.future.length} future planned maintenance events on the network.`
                +` There is also`;
            this.response.speak(this.attributes.speechOutput);
            this.response.cardRenderer(
            `Status.CTL.io © mim.Armand`,
            `Test text`
            // {
            //     smallImageUrl: `https://www.cryptocompare.com/media/${coins.imgs[ coins.syms.indexOf(sym) ]}`,
            //     largeImageUrl: `https://www.cryptocompare.com/media/${coins.imgs[ coins.syms.indexOf(sym) ]}`
            // }
        );
        this.emit(':responseReady');
    })
    },
    'Unhandled': function() {
        console.log('======================== Unhandled')
        this.attributes.unrecognizedSpeech = unrecognisedResponses[randomInRange(0, unrecognisedResponses.length)];
        this.response.speak(this.attributes.unrecognizedSpeech).listen(this.attributes.repromptSpeech);
        this.emit('RepromptRequest');
    },
    'AMAZON.HelpIntent': function() {
        const speechOutput = "Ask me for the CTL operation status!";
        const reprompt = "Ask something like: what is the status of CTL?!";
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function() {
        this.emit(':tell', "Cool!");
    },
    'AMAZON.StopIntent': function() {
        this.emit(':tell', "See ya later!");
    },
};
const fetchPrice = function() {
    return new Promise(function(resolve, reject) {
        https.get( apiUrl, (res) => {
            let rawData = "";
        res.on('data', (chunk) => { rawData += chunk })
        res.on('end', () => {
            resolve( JSON.parse(rawData) )
    })
    }).on('error', (e) => {
            reject(e)
        });
        // post_req.end();
    })
}
const randomInRange = function(min, max) {
    return Math.floor((Math.random() * (max - min) + min));
}
exports.handler = function(event, context) {
    const alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    // To enable string internationalization (i18n) features, set a resources object.
    // alexa.resources = languageStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};