import {  model, Schema, Types } from "mongoose";

  export interface IUser{
    _id?:Types.ObjectId,
    name:string,
    email:string,
    password:string,
    createdAt?:Date,
    updatedAt?:Date
  }


    const userSchema = new Schema<IUser>(
    {
        name:{
            type:String,
            required:true
        },
        email:{
            type:String,
            required:true,
            unique:true
        },
        password:{
            type:String,
            required:true
        }
    },
    {
        timestamps:true
    }
  )

  export const UserModel = model<IUser>("User",userSchema)