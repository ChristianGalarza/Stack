import { Field, Int, ObjectType } from 'type-graphql';
import { 
    Entity, 
    Column,
    PrimaryGeneratedColumn, 
    CreateDateColumn, 
    BaseEntity, 
    UpdateDateColumn, 
} from 'typeorm';

@ObjectType()
@Entity()
export class Product extends BaseEntity {
    @Field(()=> Int)
    @PrimaryGeneratedColumn()
    id!:number;

    @Field()
    @Column()
    name!:string;

    @Field(()=>Int)
    @Column()
    quantity!:number;

    @Field(()=>String)
    @CreateDateColumn()
    createdAt!:Date;

    @Field(()=>String)
    @UpdateDateColumn()
    updatedAt!:Date;
}

