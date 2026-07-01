export class User{
    constructor(
        public readonly name:string,
        public readonly email:string,
        public readonly password:string,
        public readonly id?:string |undefined,
        public readonly createdAt?:Date,
        public readonly updatedAt?:Date

    ){}
}