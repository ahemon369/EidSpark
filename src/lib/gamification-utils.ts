
'use client';

import { doc, updateDoc, increment, collection, setDoc, getDoc, serverTimestamp, Firestore } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { toast } from '@/hooks/use-toast';

export type ActionType = 
  | 'GenerateExcuse' 
  | 'PersonalityTest' 
  | 'UploadSelfie' 
  | 'ReceiveLike' 
  | 'ReportMoon' 
  | 'AddJamaat' 
  | 'SalamiCalc';

const POINTS_MAP: Record<ActionType, number> = {
  GenerateExcuse: 2,
  PersonalityTest: 5,
  UploadSelfie: 10,
  ReceiveLike: 3,
  ReportMoon: 8,
  AddJamaat: 6,
  SalamiCalc: 2,
};

export const LEVELS = [
  { name: 'Eid Visitor', min: 0, icon: '🌙' },
  { name: 'Salami Hunter', min: 50, icon: '💰' },
  { name: 'Community Helper', min: 150, icon: '🤝' },
  { name: 'Eid Star', min: 350, icon: '⭐' },
  { name: 'Eid Legend', min: 750, icon: '👑' },
];

export function getLevelInfo(points: number) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (points >= LEVELS[i].min) {
      return { 
        ...LEVELS[i], 
        nextMin: LEVELS[i + 1]?.min || null,
        progress: LEVELS[i + 1] ? ((points - LEVELS[i].min) / (LEVELS[i + 1].min - LEVELS[i].min)) * 100 : 100
      };
    }
  }
  return { ...LEVELS[0], nextMin: 50, progress: 0 };
}

/**
 * Awards points to a user for a specific action.
 * Handles Firestore updates in a non-blocking way.
 */
export function awardPoints(db: Firestore, userId: string, action: ActionType) {
  const points = POINTS_MAP[action];
  const userRef = doc(db, 'users', userId);

  // Update total points
  updateDoc(userRef, {
    totalPoints: increment(points),
    updatedAt: new Date().toISOString()
  }).then(() => {
    // Notify user
    toast({
      title: `+${points} Eid Points! 🎉`,
      description: `You earned points for ${action.replace(/([A-Z])/g, ' $1').trim()}.`,
    });

    // Handle Daily Challenge Progress
    const today = new Date().toISOString().split('T')[0];
    const progressId = `${action}_${today}`;
    const progressRef = doc(db, 'users', userId, 'dailyChallengeProgress', progressId);

    getDoc(progressRef).then(snap => {
      if (!snap.exists()) {
        setDoc(progressRef, {
          userId,
          challengeId: action,
          date: today,
          currentCount: 1,
          isCompleted: false,
          createdAt: serverTimestamp()
        });
      } else {
        const data = snap.data();
        if (!data.isCompleted) {
          updateDoc(progressRef, {
            currentCount: increment(1)
          });
        }
      }
    });

  }).catch(async (serverError) => {
    const permissionError = new FirestorePermissionError({
      path: userRef.path,
      operation: 'update',
      requestResourceData: { totalPoints: `increment(${points})` },
    });
    errorEmitter.emit('permission-error', permissionError);
  });
}
