
import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import { User } from "../entity/User";
import argon2 from 'argon2';
import { Profile } from "../entity/Profile";
import { MyContext } from "../types";
import { COOKIE_NAME } from "../constants";

@InputType()
class UserRegisterInput {
    @Field()
    username!:string;

    @Field()
    email!:string;

    @Field()
    password!:string;

    @Field()
    birthdate!:Date;
}

@InputType()
class UserLoginInput {
    @Field()
    username!:string;

    @Field()
    password!:string;
}

@InputType()
class ProfileInput {
    @Field()
    bio!:string

    @Field()
    description!:string
}

@ObjectType()
class FieldError{
    @Field()
    field:string

    @Field()
    message:string
}

@ObjectType()
class UserResponse {
    @Field(()=> [FieldError],{nullable:true})
    errors?:FieldError[]

    @Field(()=> User,{nullable:true})
    user?:User
}

@Resolver()
export class UserResolver {
    @Query(() => User, { nullable: true })
    me(@Ctx() { req }: MyContext) {
      // you are not logged in
      if (!req.session.UserID) {
        return null;
      }
  
      return User.findOne({where:{id:req.session.UserID}});
    }

    @Mutation(()=> User)
    async register(
        @Arg("userInput") userInput:UserRegisterInput,
    ){
        const hashedPassword= await argon2.hash(userInput.password);
        try {            
            const u = User.create({
                username:userInput.username,
                email:userInput.email,
                password:hashedPassword,
                birthdate:userInput.birthdate
            });
            return await u.save();
        } catch (error:any) {
            if(error.code == "23505"){
                error.detail.includes('username') 
                ?
                console.error('User already taken')
                :  
                console.error('email already registed');
            }
        }
    }

    @Mutation(()=> UserResponse)
    async login(
        @Arg("userInput") userInput:UserLoginInput,
        @Ctx() {req}:MyContext
    ): Promise<UserResponse>{
        const u = await User.findOne({where:{username:userInput.username}})
        if(!u){
            return {
                errors:[
                    {
                        field:"username",
                        message:"that username does not exist"
                    }
                ]}
        }
        const validatePass = await argon2.verify(u.password,userInput.password);
        if(!validatePass){
            return {
                errors:[
                    {
                        field:"password",
                        message:"Incorrect Password, try it again"
                    }
                ]
            }
        }
        req.session.UserID=u.id;
        return {
            user:u
        };
    }

    @Mutation(() => Boolean)
    logout(@Ctx() { req, res }: MyContext) {
        return new Promise((resolve) =>
            req.session.destroy((err) => {
            res.clearCookie(COOKIE_NAME);
            if (err) {
                console.log(err);
                resolve(false);
                return;
            }
        resolve(true);
        })
        );
    }


    @Mutation(()=>User)
    async assignProfile(
        @Arg("userId") userId:number,
        @Arg("profileInput") profileInput:ProfileInput
    ){
        const u = await User.findOne({where: {id:userId}})
        if(u?.profileId){
            return u;
        }
        const profile = await Profile.create({
            bio:profileInput.bio,
            description:profileInput.description
        }).save();
        const assignProfileToUser = await User.update(
            {id:userId},
            {profileId:profile.id}
        );        
        return u;
    }

    @Mutation(()=>Profile)
    async updateProfileToUser(
        @Arg("userId") userId:number,
        @Arg("profileInput") profileInput:ProfileInput
    ){
        const u = await User.findOne({where: {id:userId}})
        const up: any = u?.profileId;
        const p = await Profile.findOne({where: {id:up}})
        p!.bio=profileInput.bio
        p!.description=profileInput.description
        return await p!.save();
    }

    @Query(() => [User])
    async users() {
        return await User.find();
    } 
}