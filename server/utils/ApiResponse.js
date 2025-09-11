class ApiResponse {
    constructor(statusCode, message='success', data) {
        this.statusCode = statusCode      // HTTP status for response
        this.message = message            // Error description
        this.data = data                  // Data returned (null for errors)
        this.success = statusCode<400     //        
       

    }
}

export default ApiResponse;