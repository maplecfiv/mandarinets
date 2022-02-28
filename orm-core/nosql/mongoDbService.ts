// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { MongoClient, Bson, ListDatabaseInfo } from "https://deno.land/x/mongo@v0.29.2/mod.ts";
import { Database } from "https://deno.land/x/mongo@v0.29.2/src/database.ts";
import { Collection } from "https://deno.land/x/mongo@v0.29.2/src/collection/collection.ts";

export class MongoDBService {

    private client!: MongoClient;

    constructor(connectionUrl: string) {
        this.client = new MongoClient();
        this.client.connect(connectionUrl);
    }

    public async listDatabases(): Promise<Array<ListDatabaseInfo>> {
        return await this.client.listDatabases();
    }

    public getDatabase(name: string): Database {
        return this.client.database(name);
    }

    public getCollection<T = any>(db: Database | string, collectionName: string): Collection<T> | undefined {
        if(typeof db === "string") {
            return this.getDatabase(db).collection(collectionName);
        } else {
            if(db instanceof Database) {
                return db.collection(collectionName);
            }
        }
        return undefined;
    }

    public bson() {
        return Bson;
    }

    public close() {
        this.client.close();
    }

}