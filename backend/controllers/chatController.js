//Model:
const Chat = require('../models/chatModel');
const handleAsync = require('../utils/handleAsync');

exports.chatLogs = handleAsync(async( req, res, next) =>{
    Chat.find()
        .populate('sender')
        .exec((err, chatLogs) => {
            if (err) return res.status(400).send(err);
            
            res.status(200).json({
                status: 'Success',
                // token,
                message: 'Chat logs have been grabbed.',
                completed: true,
                data: {
                    chats: chatLogs,
                }
            });
        })
})