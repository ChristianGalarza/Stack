import { Arg, Mutation, Query, Resolver } from "type-graphql";
import { Product } from "../entity/Product";

@Resolver()
export class ProductResolver {
  @Mutation(()=>Product)
  async createProduct(
    @Arg("name") name:string,
    @Arg("quantity") quantity:number,
  ){
    return await Product.insert({name,quantity});
  }

  @Query(() => [Product])
  products() {
    return Product.find();
  }
}



