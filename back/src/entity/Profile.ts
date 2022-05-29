import { Field, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";

@ObjectType()
@Entity()
export class Profile extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id!: number;
    
    @Field(()=>String)
    @Column({length:35,nullable:true,default:''})
    description:string;

    @Field(()=>String)
    @Column({nullable:true,default:''})
    bio:string;

    @OneToOne(()=>User,(user) => user.profile)
    user:User;
}