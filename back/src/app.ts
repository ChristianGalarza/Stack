import "reflect-metadata";
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { connection } from './config/typeorm';
import session from 'express-session';
import { getConnection } from "typeorm";
import { UserResolver } from "./resolvers/userResolver";
import { TypeormStore } from "connect-typeorm";
import { COOKIE_NAME, __prod__ } from "./constants";
import { Session } from "./entity/Session";

export const main = async () => {
    connection();
    const app = express();

    const repository = getConnection().getRepository(Session);
    app.use(session({
        name:COOKIE_NAME,
        store: new TypeormStore().connect(repository),
        secret:'mxjdncqwerdsap',
        resave:false,
        saveUninitialized:false,
        cookie:{
            maxAge:1000 * 60 * 60 * 24 * 365 * 10, // 10 years
            httpOnly:true,
            sameSite: "lax",
            secure: __prod__
        }   
    }));

    const server = new ApolloServer({
        schema: await buildSchema({
          resolvers: [UserResolver],
          validate:false,
        }),
        context: ({ req, res }) => ({ req, res })
    });
    
    server.start().then(res => {
        server.applyMiddleware({ 
            app,
            path: "/graphql"
        });
        app.listen({port:4000}, () => console.log('serverRunning ', server.graphqlPath)
        );
    });

    return app;
}
main();