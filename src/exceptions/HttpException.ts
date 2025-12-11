export class HttpException extends Error {
    public status: number;
    public message: string;
  
    constructor(status: number, message: string) {
      super(message);
      this.status = status;
      this.message = message;
    }
  }

  export class ConflictException extends HttpException {
    public message: string;
  
    constructor(message: string) {
      super(409 , message);
      this.message = message;
    }
  }
  
  