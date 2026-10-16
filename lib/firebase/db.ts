import { firestore } from "./admin"
import type { QueryDocumentSnapshot } from "firebase-admin/firestore"
import type { AchievementType } from "@/lib/engine/achievements"

export interface FirestoreUser {
  id: string
  name: string | null
  email: string | null
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
  accessToken?: string | null
}

export interface ContributionRecord {
  date: string
  count: number
}

export const dbService = {
  // ─── Users ─────────────────────────────────────────────────────────────
  async getUser(userId: string): Promise<FirestoreUser | null> {
    const snap = await firestore.collection("users").doc(userId).get()
    if (!snap.exists) return null
    return { id: snap.id, ...snap.data() } as FirestoreUser
  },

  async getUserByLogin(login: string): Promise<FirestoreUser | null> {
    const snap = await firestore
      .collection("users")
      .where("githubLogin", "==", login)
      .limit(1)
      .get()

    if (snap.empty) return null
    const doc = snap.docs[0]
    return { id: doc.id, ...doc.data() } as FirestoreUser
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
