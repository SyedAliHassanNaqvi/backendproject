//status code should be less than 400.
//server has status codes
class ApiResponse{
  constructor(statusCode,data,message="Success"){
    this.statusCode=statusCode
    this.data=data
    this.message=message
    this.success=statusCode<400
  }
}

export {ApiResponse}