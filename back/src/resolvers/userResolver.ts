
import { Arg, Field, InputType, Mutation, Query, Resolver } from "type-graphql";
import { User } from "../entity/User";
import argon2 from 'argon2';
import { Profile } from "../entity/Profile";

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
class ProfileInput {
    @Field()
    bio!:string

    @Field()
    description!:string
}

@Resolver()
export class UserResolver {
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