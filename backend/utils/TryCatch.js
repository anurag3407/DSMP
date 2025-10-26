const TryCatch = (handler) => { 
    return async(req, res, next) => {
        try {
            await handler(req, res, next);
        } catch (error) {
            console.error("Error:", error.message);
            console.error("Stack:", error.stack);
            res.status(500).json({ message: error.message || "Server Error" });      
        }
    };
};

export default TryCatch;
