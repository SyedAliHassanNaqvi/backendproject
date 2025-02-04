//overriding super class's message using super(message) / this.message=message
// if condition is used to detect stack cz api errors can be of hundred of lines in these stack traces WE CAN AVOID THIS CODE!  

class ApiError extends Error{
  constructor(
    statusCode,
    message="Something went wrong",
    errors=[],
    stack=""
  ){
    super(message)
    this.statusCode=statusCode;
    this.data=null
    this.message=message
    this.successs=false
    this.errors = errors

    if(stack){
      this.stack=stack
    }else
    {
      Error.captureStackTrace(this,this.constructor)
    }
  }
}

export {ApiError};