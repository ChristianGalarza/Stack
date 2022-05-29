import { ObjectType, Field, Int } from "type-graphql";
import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  BaseEntity,
  OneToOne,
  JoinColumn
} from "typeorm";
import { Profile } from "./Profile";

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column({ unique: true })
  username!: string;

  @Field()
  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Field(()=>String)
  @Column()
  birthdate!:Date;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;

  @Field(()=>Int)
  @Column({nullable:true})
  profileId:number | null;
  
  @OneToOne(() => Profile, (profile) => profile.user)
  @JoinColumn()
  profile:Profile;
}