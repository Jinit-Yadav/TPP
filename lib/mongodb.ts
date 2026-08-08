import { MongoClient, type Db } from 'mongodb'

const globalForMongo = globalThis as unknown as { mongoClient?: MongoClient; mongoDb?: Db }
function getUri() { const uri = process.env.MONGODB_CONNECTION_STRING; if (!uri) throw new Error('MONGODB_CONNECTION_STRING is not configured'); return uri }
export async function connectMongo() { const activeClient = globalForMongo.mongoClient ?? new MongoClient(getUri()); await activeClient.connect(); const database = globalForMongo.mongoDb ?? activeClient.db(process.env.MONGODB_DATABASE ?? 'study_planner'); globalForMongo.mongoClient = activeClient; globalForMongo.mongoDb = database; return database }
export type UserRecord = { _id?: import('mongodb').ObjectId; email: string; displayName: string; passwordHash: string; isAdmin: boolean; createdAt: Date }
export type SessionRecord = { _id?: import('mongodb').ObjectId; tokenHash: string; userId: import('mongodb').ObjectId; expiresAt: Date; createdAt: Date }
export type SubscriptionRecord = { _id?: import('mongodb').ObjectId; userId: import('mongodb').ObjectId; plan: 'free' | 'pro' | 'team'; status: 'active' | 'inactive'; updatedAt: Date }
export type StudyPlanRecord = { _id?: import('mongodb').ObjectId; userId: import('mongodb').ObjectId; title: string; planData: unknown; updatedAt: Date }
export type ProgressRecord = { _id?: import('mongodb').ObjectId; userId: import('mongodb').ObjectId; subject: string; minutes: number; completedOn: string; createdAt: Date }
