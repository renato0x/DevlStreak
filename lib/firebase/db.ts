import { firestore } from "./admin"
import { FieldValue, type QueryDocumentSnapshot } from "firebase-admin/firestore"
import { randomUUID } from "node:crypto"
import type { AchievementType } from "@/lib/engine/achievements"

export interface FirestoreUser {
  id: string
  name: string | null
  image: string | null
  githubLogin: string | null
  githubId: number | null
  xp: number
  level: number
  currentStreak: number
  longestStreak: number
  totalActiveDays: number
  lastSyncedAt: string | null
  createdAt: string
  updatedAt?: string
}

export interface ContributionRecord {
  date: string
  count: number
}

export interface GitHubCredential {
  accessToken: string
  githubLogin: string
  githubId: number
  updatedAt: string
}

const SYNC_LOCK_TTL_MS = 5 * 60 * 1000

function toUser(id: string, data: Record<string, unknown>): FirestoreUser {
  return {
    id,
    name: typeof data.name === "string" ? data.name : null,
    image: typeof data.image === "string" ? data.image : null,
    githubLogin: typeof data.githubLogin === "string" ? data.githubLogin : null,
    githubId: typeof data.githubId === "number" ? data.githubId : null,
    xp: typeof data.xp === "number" ? data.xp : 0,
    level: typeof data.level === "number" ? data.level : 1,
    currentStreak: typeof data.currentStreak === "number" ? data.currentStreak : 0,
    longestStreak: typeof data.longestStreak === "number" ? data.longestStreak : 0,
    totalActiveDays: typeof data.totalActiveDays === "number" ? data.totalActiveDays : 0,
    lastSyncedAt: typeof data.lastSyncedAt === "string" ? data.lastSyncedAt : null,
    createdAt: typeof data.createdAt === "string" ? data.createdAt : "",
    updatedAt: typeof data.updatedAt === "string" ? data.updatedAt : undefined,
  }
}

export const dbService = {
  // ─── Users ─────────────────────────────────────────────────────────────
  async getUser(userId: string): Promise<FirestoreUser | null> {
    const snap = await firestore.collection("users").doc(userId).get()
    if (!snap.exists) return null
    return toUser(snap.id, snap.data() as Record<string, unknown>)
  },

  async getUserByLogin(login: string): Promise<FirestoreUser | null> {
    const snap = await firestore
      .collection("users")
      .where("githubLogin", "==", login)
      .limit(1)
      .get()

    if (snap.empty) return null
    const doc = snap.docs[0]
    return toUser(doc.id, doc.data() as Record<string, unknown>)
  },

  async saveUser(userId: string, data: Partial<FirestoreUser>) {
    await firestore.collection("users").doc(userId).set(
      {
        ...data,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    )
  },

  async upsertUserProfile(
    userId: string,
    profile: Pick<FirestoreUser, "name" | "image" | "githubLogin" | "githubId">
  ) {
    const ref = firestore.collection("users").doc(userId)
    const now = new Date().toISOString()

    await firestore.runTransaction(async (transaction) => {
      const snap = await transaction.get(ref)
      if (snap.exists) {
        transaction.set(ref, { ...profile, updatedAt: now }, { merge: true })
        return
      }

      transaction.set(ref, {
        id: userId,
        ...profile,
        xp: 0,
        level: 1,
        currentStreak: 0,
        longestStreak: 0,
        totalActiveDays: 0,
        lastSyncedAt: null,
        createdAt: now,
        updatedAt: now,
      })
    })
  },

  // ─── Server-only GitHub credentials ───────────────────────────────────
  async saveGitHubCredential(userId: string, credential: Omit<GitHubCredential, "updatedAt">) {
    await firestore.collection("githubCredentials").doc(userId).set({
      ...credential,
      updatedAt: new Date().toISOString(),
    })
  },

  async getGitHubCredential(userId: string): Promise<GitHubCredential | null> {
    const snap = await firestore.collection("githubCredentials").doc(userId).get()
    if (!snap.exists) return null

    const data = snap.data() as Partial<GitHubCredential>
    if (
      typeof data.accessToken !== "string" ||
      typeof data.githubLogin !== "string" ||
      typeof data.githubId !== "number" ||
      typeof data.updatedAt !== "string"
    ) {
      return null
    }

    return data as GitHubCredential
  },

  async migrateLegacyGitHubCredential(userId: string): Promise<GitHubCredential | null> {
    const userRef = firestore.collection("users").doc(userId)
    const credentialRef = firestore.collection("githubCredentials").doc(userId)

    return firestore.runTransaction(async (transaction) => {
      const credentialSnap = await transaction.get(credentialRef)
      if (credentialSnap.exists) {
        const data = credentialSnap.data() as GitHubCredential
        return data
      }

      const userSnap = await transaction.get(userRef)
      const legacy = userSnap.data() as Record<string, unknown> | undefined
      if (
        !legacy ||
        typeof legacy.accessToken !== "string" ||
        typeof legacy.githubLogin !== "string" ||
        typeof legacy.githubId !== "number"
      ) {
        return null
      }

      const credential: GitHubCredential = {
        accessToken: legacy.accessToken,
        githubLogin: legacy.githubLogin,
        githubId: legacy.githubId,
        updatedAt: new Date().toISOString(),
      }
      transaction.set(credentialRef, credential)
      transaction.update(userRef, { accessToken: FieldValue.delete() })
      return credential
    })
  },

  // ─── Sync coordination ─────────────────────────────────────────────────
  async acquireGitHubSyncLock(userId: string): Promise<string | null> {
    const ref = firestore.collection("githubSyncLocks").doc(userId)
    const lockId = randomUUID()
    const now = Date.now()

    return firestore.runTransaction(async (transaction) => {
      const snap = await transaction.get(ref)
      const current = snap.data() as { expiresAt?: number } | undefined
      if (current?.expiresAt && current.expiresAt > now) return null

      transaction.set(ref, {
        lockId,
        acquiredAt: new Date(now).toISOString(),
        expiresAt: now + SYNC_LOCK_TTL_MS,
      })
      return lockId
    })
  },

  async releaseGitHubSyncLock(userId: string, lockId: string) {
    const ref = firestore.collection("githubSyncLocks").doc(userId)
    await firestore.runTransaction(async (transaction) => {
      const snap = await transaction.get(ref)
      if (snap.data()?.lockId === lockId) transaction.delete(ref)
    })
  },

  // ─── Contributions ────────────────────────────────────────────────────
  async saveContributions(userId: string, days: ContributionRecord[]) {
    const batch = firestore.batch()
    const contribsCol = firestore
      .collection("users")
      .doc(userId)
      .collection("contributions")

    for (const day of days) {
      const docRef = contribsCol.doc(day.date)
      batch.set(docRef, { date: day.date, count: day.count }, { merge: true })
    }

    await batch.commit()
  },

  async getContributions(userId: string): Promise<ContributionRecord[]> {
    const snap = await firestore
      .collection("users")
      .doc(userId)
      .collection("contributions")
      .orderBy("date", "asc")
      .get()

    return snap.docs.map((d: QueryDocumentSnapshot) => d.data() as ContributionRecord)
  },

  // ─── Achievements ─────────────────────────────────────────────────────
  async getAchievements(userId: string): Promise<{ type: AchievementType; unlockedAt: string }[]> {
    const snap = await firestore
      .collection("users")
      .doc(userId)
      .collection("achievements")
      .get()

    return snap.docs.map((d: QueryDocumentSnapshot) => d.data() as { type: AchievementType; unlockedAt: string })
  },

  async addAchievements(userId: string, types: AchievementType[]) {
    if (!types.length) return
    const batch = firestore.batch()
    const col = firestore
      .collection("users")
      .doc(userId)
      .collection("achievements")

    const now = new Date().toISOString()
    for (const type of types) {
      const docRef = col.doc(type)
      batch.set(docRef, { type, unlockedAt: now }, { merge: true })
    }

    await batch.commit()
  },
}
