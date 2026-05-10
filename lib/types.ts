// Firestore database types and schemas
export interface User {
  uid: string
  email: string
  displayName: string
  photoURL?: string
  accountType: 'free' | 'premium' // free or premium
  createdAt: number
  updatedAt: number
  bio?: string
  totalEarnings: number
  tier: 'creator' | 'standard' | 'premium' // tier for permissions
  userRole: 'creator' | 'regular' // creator or regular user
  hasSeenGuide?: boolean // track if user has seen onboarding guide
}

export interface Template {
  id: string
  creatorId: string // User UID who created it
  name: string
  description: string
  category: string
  coverStyle: 'classic' | 'modern' | 'bold' | 'elegant' | 'technical' | 'creative'
  fonts: {
    heading: string
    body: string
  }
  accentColor: string
  accentBg: string
  defaultContent: {
    title: string
    author: string
    subtitle: string
    chapters: Array<{
      id: string
      title: string
      content: string
    }>
  }
  latex?: string // Optional LaTeX code if user provided it
  isPublished: boolean // Can others use it?
  usageCount: number // Track how many times it's been used
  revenuePercentage: number // % creator gets from each use (0-100)
  tags: string[]
  createdAt: number
  updatedAt: number
  version: number // For versioning and updates
}

export interface TemplateUsage {
  id: string
  templateId: string
  userId: string // User who used the template
  creatorId: string // Template creator
  usedAt: number
  ebookTitle: string
}

export interface TemplateRevenue {
  id: string
  templateId: string
  creatorId: string
  month: string // YYYY-MM format
  usageCount: number
  revenuePercentage: number
  estimatedEarnings: number
  status: 'pending' | 'paid'
}

export interface TemplateSuggestion {
  id: string
  templateId: string
  suggestedByUserId: string
  creatorId: string
  title: string
  description: string
  changes: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: number
  resolvedAt?: number
}

export interface UserProject {
  id: string
  userId: string
  templateId: string
  title: string
  author: string
  subtitle: string
  chapters: Array<{
    id: string
    title: string
    content: string
  }>
  customizations?: Record<string, any> // User's custom edits to template
  createdAt: number
  updatedAt: number
  status: 'draft' | 'published'
}
