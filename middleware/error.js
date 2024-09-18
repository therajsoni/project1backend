

export const errorMiddleware = (err,req,res,next) => {

    err.message ||= "Internal Server Error";
    err.statusCode ||= 500

    if(err.name === "CastError"){ //id wrong provide kiye ho tabh
        err.message = "Invalid ID"
    }

    return res.status(err.statusCode).json({
    success : false,
    message : err.message
})

}



export const TryCatch = (functionReq) => (req,res,next) => {
return Promise.resolve(functionReq(req,res,next)).catch(next)
}

