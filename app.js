const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const NexMo = require('nexmo');
const socketio = require('socket.io');

// init app
const app = express();

// init nexmo
const nexmo = new NexMo({
    apiKey: '',
    apiSecret: ''
}, { debug: true })

// Template engine setup
app.set('view engine', 'html');
app.engine('html', ejs.renderFile);

// Public folder setup
app.use(express.static(__dirname + '/public'));

// BodyParser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// index route
app.get('/', (req, res) => {
    res.render('index');
});

// catch form
app.post('/', (req, res) => {
    // res.send(req.body);
    // console.log(req.body);
    const number = req.body.number;
    const text = req.body.text;

    nexmo.message.sendSms(
        '', number, text, { type: 'unicode' },
        (err, responseData) => {
            if (err) {
                console.log(err);
            } else {
                console.dir(responseData);
                // get data from response
                const data = {
                    id: responseData.messages[0]['message-id'],
                    number: responseData.messages[0]['to']
                }

                // emit to client
                io.emit('smsStatus', data);
            }
        }
    )
})

// define port
const port = 3000;

// start port

const server = app.listen(port, () => console.log(`server started on port ${port}`));

// connect to socket.io
const io = socketio(server);
io.on('connection', (socket) => {
    console.log('connected');
    io.on("disconnect", () => {
        console.log('disonnected');
    })
})