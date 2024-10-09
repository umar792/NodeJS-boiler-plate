import jwt from "jsonwebtoken"



export class generateToken {
    public static token: string;
    public static generate(user_id: number, secret_key: string, expiration_date: string) {
        this.token = jwt.sign({ id: user_id }, secret_key, {
            expiresIn: expiration_date
        });
        return this.token;
    }
}
