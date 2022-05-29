import "reflect-metadata";
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { connection } from './config/typeorm';
import session from 'express-session';


import { UserResolver } from "./resolvers/userResolver";
import { TypeormStore } from "connect-typeorm/out";
import { COOKIE_NAME, __prod__ } from "./constants";

export const main = async () => {
    connection();
    const app = express();

    app.use(session({
        name:COOKIE_NAME,
        store: new TypeormStore(),
        secret:'mxjdncqwerdsap',
        resave:false,
        cookie:{
            maxAge:1000 * 60 * 60 * 24 * 365 * 10, // 10 years
            httpOnly:true,
            sameSite: 'lax',
            secure: __prod__
        }
    }));

    const server = new ApolloServer({
        schema: await buildSchema({
          resolvers: [UserResolver],
          validate:false
        }),
        context: ({ req, res }) => ({ req, res })
    });
    
    server.start().then(res => {
        server.applyMiddleware({ app, path: "/graphql" });
        app.listen({port:4000}, () => console.log('serverRunning ', server.graphqlPath)
        );
    });

    return app;
}
main();