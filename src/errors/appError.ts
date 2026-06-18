class AppError extends Error{
    public statusCode: number;
    public isOperating: boolean;
    constructor(message:string,statusCode:number){
        super(message);
        this.statusCode = statusCode;
        this.isOperating = true;

        Object.setPrototypeOf(this,AppError.prototype);
    }
}

export default AppError;
