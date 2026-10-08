import {Schema,model} from "mongoose"
import bcrypt from "bcrypt"

const UserSchema = new Schema({
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        index:true
    },
    password:{
        type:String,
        required:true,
        select:false
    }
},{timestamp:true})

UserSchema.pre("save",async function(next){
    if(!this.isModified("password")){return next()}
    this.password=await bcrypt.hash(this.password,10)
    next()
})


const User =model("User",UserSchema)
export default User