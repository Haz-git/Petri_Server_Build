const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Chat = require('./models/chatModel');

//Using dotenv for env variables:
dotenv.config({
    path: `${__dirname}/config.env`
});

//Grabbing Express Application: 
const app = require('./app.js');

//Creating Connection to Socket.IO ?
const server = require('http').createServer(app);
const io = require('socket.io')(server);


//Connecting app to MongoDB via Mongoose:

const connectToDb = mongoose
    .connect(process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD), {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
    })
    .then(() => {
        console.log(`Biologger App on port: ${process.env.PORT} has been connected to MongoDB Atlas`);
    })

//Get message from client:
io.on('connection', socket => {
    socket.on('Input Chat Message', msg => {
        connectToDb.then(() => {
            try {
                //Grab data sent over via socket from client:
                let chat = new Chat({
                    message : msg.chatMessage,
                    sender : msg.userId,
                    username : msg.userName,
                    type: msg.type,
                });
                //Persist data to Mongo
                chat.save((err, doc) => {
                    if (err) return res.json({
                        success: false,
                        err,
                    })
                    
                    console.log('Chat document saved to Mongo');
                    console.log(doc._id);

                    Chat.find({
                        "_id": doc._id,
                    }).populate("sender").exec((err, doc) => {
                        //Once finish persistence, we send information back to client..
                        return io.emit("Output Chat Message", doc); 
                    });
                })
            } catch (err) {
                console.log(err);
            }
        })
    })
})

//Server Start:
server.listen(process.env.PORT, () => {
    console.log(`The server is online and listening on port: ${process.env.PORT}`);
})

