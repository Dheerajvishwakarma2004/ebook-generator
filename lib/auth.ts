import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from './firebase'
import type { User } from './types'

// ===== Firebase error code to readable message =====
const AUTH_ERRORS: Record<string, string> = {
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/operation-not-allowed': 'This sign-in method is not enabled. Contact support.',
  'auth/weak-password': 'Password must be at least 6 characters.',
  'auth/user-disabled': 'This account has been disabled. Contact support.',
  'auth/user-not-found': 'No account found with this email.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/invalid-credential': 'Invalid email or password. Please check and try again.',
  'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
  'auth/network-request-failed': 'Network error. Check your connection and try again.',
  'auth/popup-closed-by-user': 'Sign-in popup was closed. Please try again.',
  'auth/popup-blocked': 'Sign-in popup was blocked. Allow popups and try again.',
  'auth/account-exists-with-different-credential':
    'An account already exists with this email using a different sign-in method.',
  'auth/requires-recent-login': 'Please sign in again to complete this action.',
  'auth/expired-action-code': 'This link has expired. Please request a new one.',
  'auth/invalid-action-code': 'This link is invalid. Please request a new one.',
}

export function getAuthErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code: string }).code
    return AUTH_ERRORS[code] || `Authentication error: ${code}`
  }
  if (error instanceof Error) return error.message
  return 'An unexpected error occurred. Please try again.'
}

// ===== Create or update user profile in Firestore =====
async function ensureUserProfile(
  uid: string,
  email: string,
  displayName: string,
  photoURL?: string
): Promise<User | null> {
  try {
    const userRef = doc(db, 'users', uid)
    const existing = await getDoc(userRef)

    if (existing.exists()) {
      // Update last login
      await setDoc(userRef, { updatedAt: Date.now() }, { merge: true })
      return existing.data() as User
    }

    const userProfile: User = {
      uid,
      email,
      displayName,
      photoURL: photoURL || '',
      accountType: 'free',
      tier: 'standard',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      totalEarnings: 0,
    }

    await setDoc(userRef, userProfile)
    return userProfile
  } catch (error) {
    console.error('Firestore profile sync failed (check Firestore rules):', error)
    // Return a local-only profile so auth still works
    return {
      uid,
      email,
      displayName,
      photoURL: photoURL || '',
      accountType: 'free',
      tier: 'standard',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      totalEarnings: 0,
    }
  }
}

// ===== Sign up with email and password =====
export async function signUp(email: string, password: string, displayName: string) {
  const userCred = await createUserWithEmailAndPassword(auth, email, password)
  const user = userCred.user

  // Set display name on Firebase Auth profile
  await updateProfile(user, { displayName })

  // Create Firestore profile
  await ensureUserProfile(user.uid, user.email!, displayName)

  // Send verification email (non-blocking)
  sendEmailVerification(user).catch(() => {})

  return user
}

// ===== Sign in with email and password =====
export async function signIn(email: string, password: string) {
  const userCred = await signInWithEmailAndPassword(auth, email, password)
  // Update last login timestamp
  await ensureUserProfile(
    userCred.user.uid,
    userCred.user.email!,
    userCred.user.displayName || 'User'
  )
  return userCred.user
}

// ===== Sign in with Google =====
const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider)
  const user = result.user

  // Create or update Firestore profile
  await ensureUserProfile(
    user.uid,
    user.email!,
    user.displayName || 'User',
    user.photoURL || undefined
  )

  return user
}

// ===== Password reset =====
export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email)
}

// ===== Sign out =====
export async function logOut() {
  await signOut(auth)
}

// ===== Get current user profile from Firestore =====
export async function getUserProfile(uid: string): Promise<User | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid))
    return userDoc.exists() ? (userDoc.data() as User) : null
  } catch (error) {
    // Firestore rules not deployed yet or permissions issue
    console.warn('Could not fetch user profile from Firestore:', error)
    return null
  }
}

// ===== Update user profile =====
export async function updateUserProfile(uid: string, updates: Partial<User>) {
  const userRef = doc(db, 'users', uid)
  await setDoc(userRef, { ...updates, updatedAt: Date.now() }, { merge: true })
}

// ===== Subscribe to auth state changes =====
export function subscribeToAuthState(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback)
}
