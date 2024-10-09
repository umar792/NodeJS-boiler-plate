
import validator from "validator";



export class emailValidators{

    public static validate(email:string){
        return validator.isEmail(email);
    }

}