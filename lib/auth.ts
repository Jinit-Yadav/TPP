import { cookies } from 'next/headers'
import { createHash, randomBytes } from 'crypto'
import { ObjectId } from 'mongodb'
import { connectMongo, type UserRecord } from './mongodb'

export const SESSION_COOKIE = 'study_session'
const SESSION_DAYS = 14
function hashToken(token: string) { return createHash('sha256').update(token).digest('hex') }
export async function createSession(userId: ObjectId) { const db = await connectMongo(); const token = randomBytes(32).toString('hex'); await db.collection('sessions').insertOne({ tokenHash: hashToken(token), userId, expiresAt: new Date(Date.now() + SESSION_DAYS * 86400000), createdAt: new Date() }); return token }
export async function getCurrentUser(): Promise<(UserRecord & { _id: ObjectId }) | null> { const token = (await cookies()).get(SESSION_COOKIE)?.value; if (!token) return null; const db = await connectMongo(); const session = await db.collection('sessions').findOne({ tokenHash: hashToken(token), expiresAt: { $gt: new Date() } }); if (!session) return null; return db.collection<UserRecord>('users').findOne({ _id: session.userId }) as Promise<(UserRecord & { _id: ObjectId }) | null> }
export async function deleteCurrentSession() { const token = (await cookies()).get(SESSION_COOKIE)?.value; if (token) { const db = await connectMongo(); await db.collection('sessions').deleteOne({ tokenHash: hashToken(token) }) } }
export function isObjectId(value: string) { return ObjectId.isValid(value) }
export async function hasProAccess(userId: ObjectId) { const db = await connectMongo(); const subscription = await db.collection('subscriptions').findOne({ userId, status: 'active' }); return subscription?.plan === 'pro' || subscription?.plan === 'team' }
