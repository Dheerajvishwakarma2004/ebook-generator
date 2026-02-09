import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  addDoc,
  increment,
  serverTimestamp,
  orderBy,
  limit,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Template, TemplateUsage, UserProject } from './types'
import type { EBook } from './templates'

// ===== TEMPLATE OPERATIONS =====

// Get all published templates
export async function getPublishedTemplates(limitCount = 50) {
  try {
    const q = query(
      collection(db, 'templates'),
      where('isPublished', '==', true),
      orderBy('usageCount', 'desc'),
      limit(limitCount)
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as Template))
  } catch (error) {
    console.error('Get published templates error:', error)
    return []
  }
}

// Get user's templates
export async function getUserTemplates(userId: string) {
  try {
    const q = query(collection(db, 'templates'), where('creatorId', '==', userId))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as Template))
  } catch (error) {
    console.error('Get user templates error:', error)
    return []
  }
}

// Get template by ID
export async function getTemplate(templateId: string): Promise<Template | null> {
  try {
    const docSnapshot = await getDoc(doc(db, 'templates', templateId))
    return docSnapshot.exists() ? ({ ...docSnapshot.data(), id: docSnapshot.id } as Template) : null
  } catch (error) {
    console.error('Get template error:', error)
    return null
  }
}

// Create new template
export async function createTemplate(userId: string, templateData: Omit<Template, 'id' | 'createdAt' | 'updatedAt' | 'version'>) {
  try {
    const newTemplate = {
      ...templateData,
      creatorId: userId,
      usageCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: 1,
    }
    const docRef = await addDoc(collection(db, 'templates'), newTemplate)
    return docRef.id
  } catch (error) {
    console.error('Create template error:', error)
    throw error
  }
}

// Update template
export async function updateTemplate(templateId: string, updates: Partial<Template>) {
  try {
    const templateRef = doc(db, 'templates', templateId)
    await updateDoc(templateRef, { ...updates, updatedAt: Date.now() })
  } catch (error) {
    console.error('Update template error:', error)
    throw error
  }
}

// Publish template
export async function publishTemplate(templateId: string, revenuePercentage: number) {
  try {
    const templateRef = doc(db, 'templates', templateId)
    await updateDoc(templateRef, {
      isPublished: true,
      revenuePercentage,
      updatedAt: Date.now(),
    })
  } catch (error) {
    console.error('Publish template error:', error)
    throw error
  }
}

// Track template usage
export async function trackTemplateUsage(
  templateId: string,
  userId: string,
  creatorId: string,
  ebookTitle: string
) {
  try {
    // Add usage record
    await addDoc(collection(db, 'templateUsage'), {
      templateId,
      userId,
      creatorId,
      ebookTitle,
      usedAt: Date.now(),
    } as TemplateUsage)

    // Increment template usage count
    const templateRef = doc(db, 'templates', templateId)
    await updateDoc(templateRef, {
      usageCount: increment(1),
    })
  } catch (error) {
    console.error('Track template usage error:', error)
    throw error
  }
}

// ===== USER PROJECT OPERATIONS =====

// Create new user project (from template)
export async function createUserProject(
  userId: string,
  templateId: string,
  projectData: Omit<UserProject, 'id' | 'createdAt' | 'updatedAt'>
) {
  try {
    const newProject = {
      ...projectData,
      userId,
      templateId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    const docRef = await addDoc(collection(db, 'userProjects'), newProject)
    
    // Track template usage
    const template = await getTemplate(templateId)
    if (template) {
      await trackTemplateUsage(templateId, userId, template.creatorId, projectData.title)
    }
    
    return docRef.id
  } catch (error) {
    console.error('Create user project error:', error)
    throw error
  }
}

// Get user's projects
export async function getUserProjects(userId: string) {
  try {
    const q = query(collection(db, 'userProjects'), where('userId', '==', userId))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as UserProject))
  } catch (error) {
    console.error('Get user projects error:', error)
    return []
  }
}

// Update user project
export async function updateUserProject(projectId: string, updates: Partial<UserProject>) {
  try {
    const projectRef = doc(db, 'userProjects', projectId)
    await updateDoc(projectRef, { ...updates, updatedAt: Date.now() })
  } catch (error) {
    console.error('Update user project error:', error)
    throw error
  }
}

// ===== DRAFT OPERATIONS =====

// Save user draft (non-throwing -- logs errors but doesn't break the editor)
export async function saveUserDraft(userId: string, ebook: EBook) {
  try {
    const draftRef = doc(db, 'userDrafts', userId)
    await setDoc(draftRef, {
      ebook,
      userId,
      updatedAt: serverTimestamp(),
    }, { merge: true })
  } catch (error) {
    console.warn('Draft save failed (deploy Firestore rules to fix):', error)
  }
}

// Get user's current draft
export async function getUserDraft(userId: string): Promise<EBook | null> {
  try {
    const draftRef = doc(db, 'userDrafts', userId)
    const snapshot = await getDoc(draftRef)
    return snapshot.exists() ? snapshot.data().ebook : null
  } catch (error) {
    console.error('Get draft error:', error)
    return null
  }
}
