const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    task: {
        type: String,
        required: [true, 'Please enter a task'],
    }
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;