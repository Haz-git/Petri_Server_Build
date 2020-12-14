const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
    });
}

const sendErrorProduction = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message
    })
}

module.exports = (err, res) => {

    let { statusCode, message } = err;

    console.log(statusCode, message);

    statusCode = statusCode || 500;
    message = message || 'Error'

    //This error object IS being sent to the client. However, it appears that the promise is immediately and automatically rejected based on the status codes. Error-related status codes such as 401, 400, and 500 automatically result in a rejected promise.
    res.status(statusCode).json({
        statusCode: statusCode,
        status: 'Failed',
        message,
    })
}
