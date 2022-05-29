import {createConnection} from 'typeorm';
import path from 'path';

export const connection = async () => {
    await createConnection({
        type: 'postgres',
        host: 'localhost',
        username: 'postgres',
        password: 'jklñ{}',
        database:'social',
        logging: true,
        entities: [
            path.join(__dirname,'../entity/**/**.ts')
        ],
        synchronize: true,
    });
    console.log('Database is connected'); 
}