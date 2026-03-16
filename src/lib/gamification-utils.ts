
'use client';

import { doc, updateDoc, increment, collection, setDoc, getDoc, serverTimestamp, Firestore } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { toast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';

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

const CHALLENGE_BONUS: Record<string, { target: number; reward: number }> = {
  GenerateExcuse: { target: 3, reward: 10 },
  UploadSelfie: { target: 1, reward: 15 },
  ReportMoon: { target: 1, reward: 20 },
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
 * Awards points to a user for a specific action and manages daily challenges.
 */
export function awardPoints(db: Firestore, userId: string, action: ActionType) {
  const points = POINTS_MAP[action];
  const userRef = doc(db, 'users', userId);

  // Update total points using setDoc with merge to ensure doc exists
  setDoc(userRef, {
    id: userId,
    totalPoints: increment(points),
    updatedAt: new Date().toISOString()
  }, { merge: true }).then(() => {
    // Celebrity burst for earning points
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#065f46', '#fbbf24', '#ffffff']
    });

    toast({
      title: `+${points} Eid Points! 🎉`,
      description: `Action rewarded: ${action.replace(/([A-Z])/g, ' $1').trim()}.`,
    });

    // Handle Daily Challenge Progress
    const today = new Date().toISOString().split('T')[0];
    const progressId = `${action}_${today}`;
    const progressRef = doc(db, 'users', userId, 'dailyChallengeProgress', progressId);

    getDoc(progressRef).then(snap => {
      const bonusConfig = CHALLENGE_BONUS[action];
      
      if (!snap.exists()) {
        const isComplete = !!(bonusConfig && bonusConfig.target === 1);
        setDoc(progressRef, {
          userId,
          challengeId: action,
          date: today,
          currentCount: 1,
          isCompleted: isComplete,
          createdAt: serverTimestamp()
        });
        
        if (isComplete && bonusConfig) awardBonus(db, userId, action, bonusConfig.reward);
      } else {
        const data = snap.data();
        if (!data.isCompleted) {
          const newCount = (data.currentCount || 0) + 1;
          const isNowComplete = !!(bonusConfig && newCount >= bonusConfig.target);
          
          updateDoc(progressRef, {
            currentCount: newCount,
            isCompleted: isNowComplete
          });

          if (isNowComplete && bonusConfig) awardBonus(db, userId, action, bonusConfig.reward);
        }
      }
    });

  }).catch(async (serverError) => {
    const permissionError = new FirestorePermissionError({
      path: userRef.path,
      operation: 'update',
      requestResourceData: { totalPoints: `increment(${points})`, id: userId },
    });
    errorEmitter.emit('permission-error', permissionError);
  });
}

function awardBonus(db: Firestore, userId: string, action: string, reward: number) {
  const userRef = doc(db, 'users', userId);
  updateDoc(userRef, {
    totalPoints: increment(reward)
  }).then(() => {
    // Grand celebration for finishing a challenge
    confetti({
      particleCount: 250,
      spread: 120,
      origin: { y: 0.5 },
      colors: ['#fbbf24', '#ffffff', '#059669']
    });
    toast({
      title: "Challenge Complete! 🏆",
      description: `You earned a bonus of +${reward} XP for finishing Today's Challenge!`,
    });
  });
}
