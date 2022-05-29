import { InputType,Field } from "type-graphql";

@InputType()
export class ProductInputs {
    @Field()
    name!:string
    
    @Field()
    quantity!:number
}