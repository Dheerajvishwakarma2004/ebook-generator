# eBook Generator - Phase-by-Phase Implementation Plan

## Overview
This document outlines a structured approach to implementing all remaining features in 4 phases, with each phase building on the previous one.

---

## Phase 1: Template Usage & Editing (Foundation)
**Goal:** Enable users to use templates and customize them without affecting originals  
**Dependencies:** None - builds on existing template system

### Phase 1 Features:
1. **Template Editing Auto-Copy**
   - When user clicks "Edit" on any template, system creates a personal copy
   - Original template remains unchanged (read-only for non-creators)
   - User edits their copy instead of the original
   - Copy is saved as a user project in the dashboard

2. **Position-Only Editing Restriction**
   - Lock styling options in the editor
   - Only allow moving text elements (position changes)
   - Show a message: "This template is in view mode. Position changes only."
   - Restrict access to font, color, size adjustments

3. **Template Library Enhancement**
   - Add "Use" button to all templates (clicking creates copy and opens editor)
   - Add "View" button for read-only preview
   - Show creator name and usage count on template cards
   - Add category/search filters

### Phase 1 Files to Create/Modify:
- `lib/template-copy.ts` - Logic to copy templates and associate with user
- `app/components/use-template-button.tsx` - "Use" button component
- `app/template/[id]/view.tsx` - Read-only template preview page
- `app/dashboard/page.tsx` - Update to show copied templates
- `app/editor/page.tsx` - Detect if editing a copy vs original
- Update Firestore rules for copy permissions

### Phase 1 Database Changes:
- Add `isTemplateCopy: boolean` to userProjects
- Add `sourceTemplateId: string` to userProjects (track which template was copied)

### Phase 1 Deliverables:
- Users can use any template by clicking "Use"
- System auto-creates their personal copy
- They can edit positions in their copy
- Original template protected from edits
- Users see their copied templates in dashboard

---

## Phase 2: Creator Feedback & Suggestions System (Community)
**Goal:** Enable creators to receive and manage improvement suggestions from users  
**Dependencies:** Phase 1 (needs template usage tracking)

### Phase 2 Features:
1. **Suggestion Form Component**
   - Add "Suggest Improvement" button on template view pages
   - Form allows users to:
     - Enter suggestion title
     - Describe proposed changes
     - Optionally upload a modified version of the template
   - Form only shown to non-creators (creators can't suggest to their own templates)

2. **Creator Suggestions Inbox**
   - New dashboard page: `/dashboard/suggestions`
   - Shows all suggestions received by creator
   - List view with:
     - Suggestion title
     - Submitter name
     - Date submitted
     - Status (pending, approved, rejected)
   - Can filter by status

3. **Suggestion Management Flow**
   - Click suggestion → View full details
   - See proposed changes and reasoning
   - Action buttons: Approve, Reject, Respond
   - Optional: Add comment/feedback
   - If approved: Update template and mark suggestion as accepted
   - If rejected: Send note to suggester explaining why

4. **Notification System**
   - Notify creator when they receive a suggestion (in-app notification)
   - Notify suggester when their suggestion is approved/rejected
   - Store notifications in `userNotifications` collection

### Phase 2 Files to Create/Modify:
- `lib/suggestions.ts` - Suggestion CRUD operations
- `app/components/suggest-improvement-modal.tsx` - Modal form for suggesting
- `app/dashboard/suggestions/page.tsx` - Creator suggestions inbox
- `app/dashboard/suggestion/[id]/page.tsx` - Suggestion detail/management
- `lib/notifications.ts` - Notification system
- `app/components/notifications-dropdown.tsx` - Display notifications

### Phase 2 Database Changes:
- Create `templateSuggestions` collection with fields:
  - `id`, `templateId`, `creatorId`, `submitterId`
  - `title`, `description`, `proposedChanges`
  - `status` (pending, approved, rejected)
  - `creatorResponse`, `responseDate`
  - `createdAt`, `updatedAt`
- Create `userNotifications` collection with fields:
  - `id`, `userId`, `type` (suggestion_received, suggestion_approved, suggestion_rejected)
  - `relatedData`, `isRead`, `createdAt`

### Phase 2 Deliverables:
- Users can suggest improvements to templates
- Creators receive suggestions in inbox
- Creators can approve/reject suggestions
- Both parties receive notifications
- Audit trail of all suggestions and responses

---

## Phase 3: Creator Analytics & Revenue Dashboard (Monetization)
**Goal:** Enable creators to track template usage and earnings  
**Dependencies:** Phase 1 (needs usage tracking) + Phase 2 (suggestion counts)

### Phase 3 Features:
1. **Revenue Tracking Setup**
   - Track each template usage in database
   - Record: which user, which template, when used
   - Store in `templateUsage` collection (already exists)
   - Calculate earnings based on:
     - Template usage count
     - Creator's revenue share percentage (default 30%)
     - Platform ad revenue (for now, use mock revenue)

2. **Creator Analytics Dashboard**
   - New page: `/dashboard/analytics`
   - Show cards for:
     - Total templates created
     - Total template usage (all-time)
     - Total earnings (all-time)
     - Active templates (in use by others)

3. **Per-Template Analytics**
   - Click template → view detailed stats:
     - Usage count
     - Revenue generated from this template
     - Trend graph (usage over time)
     - Recent users (who used it)
     - Suggestions received count
     - Average rating

4. **Earnings Display**
   - Show estimated earnings per template
   - Formula: `usage_count × (revenue_share_percentage / 100) × mock_ad_revenue`
   - Mock ad revenue: $0.05 per template use (configurable)

5. **Basic Payout Info** (No real payouts yet)
   - Display total available earnings
   - Show message: "Payout feature coming soon"
   - Store payout threshold preference (optional)

### Phase 3 Files to Create/Modify:
- `lib/analytics.ts` - Analytics calculation functions
- `app/dashboard/analytics/page.tsx` - Overall analytics dashboard
- `app/dashboard/template/[id]/analytics.tsx` - Per-template analytics
- `components/analytics-cards.tsx` - Dashboard stat cards
- `components/usage-chart.tsx` - Chart showing usage trends
- Update editor to track template usage

### Phase 3 Database Changes:
- Update `templates` collection to add:
  - `viewCount`, `usageCount`, `totalRevenue`, `rating`
- Create/update `templateRevenue` collection with fields:
  - `templateId`, `creatorId`, `period` (monthly/weekly)
  - `usageCount`, `revenueGenerated`, `lastUpdated`
- Update `templateUsage` to track:
  - `templateId`, `userId`, `creatorId`, `usedAt`, `ebookTitle`

### Phase 3 Deliverables:
- Creators see detailed analytics for each template
- Real-time usage tracking
- Revenue estimates displayed
- Dashboard showing total earnings
- Trend visualization of template performance

---

## Phase 4: Document-to-LaTeX Guide & Future AI Prep (Learning Resources)
**Goal:** Create helpful documentation to bridge current LaTeX functionality and future AI features  
**Dependencies:** None (standalone feature)

### Phase 4 Features:
1. **Document Conversion Guide Page**
   - New page: `/guides/document-to-latex`
   - Shows step-by-step how to convert documents to LaTeX
   - Cover multiple source formats:
     - Microsoft Word (.docx)
     - PDF documents
     - Google Docs
     - Markdown

2. **Per-Format Instructions**
   - **Word to LaTeX:**
     - Step 1: Install Pandoc (link to download)
     - Step 2: Run conversion command
     - Step 3: Clean up output
     - Code example: `pandoc document.docx -o document.tex`
     - Template for basic LaTeX structure
   
   - **PDF to LaTeX:**
     - Recommendation: Use Mathpix Snip (for equations)
     - Manual approach using text extraction
     - Link to PDF parsing tools
   
   - **Google Docs to LaTeX:**
     - Using LaTeX equation plugin
     - Export as PDF, then convert
     - Alternative: StackEdit online converter
   
   - **Markdown to LaTeX:**
     - Pandoc command example
     - How to wrap with document class
     - Template for quick conversion

3. **Common LaTeX Template**
   - Show a minimal working example
   - Explain document structure
   - Provide commented version
   - Show where to put content

4. **Tips & Tricks Section**
   - Common LaTeX errors and fixes
   - How to structure documents for best parsing
   - Recommendations for chapter/section naming
   - Character encoding and special characters

5. **Video/Tutorial Links** (Future enhancement)
   - Links to external LaTeX tutorials
   - Links to conversion tool tutorials
   - Community resources

### Phase 4 Files to Create/Modify:
- `app/guides/document-to-latex/page.tsx` - Main guide page
- `components/guides/guide-section.tsx` - Reusable guide section component
- `components/guides/code-block.tsx` - Code example display
- `lib/guide-content.ts` - Content data for all guides

### Phase 4 Database Changes:
- None (static content page)

### Phase 4 Deliverables:
- Comprehensive guide for converting documents to LaTeX
- Multiple format coverage
- Copy-paste ready commands and templates
- Prepared infrastructure for future AI feature
- Users can prepare content before AI integration

---

## Implementation Timeline

```
Phase 1: Template Copying & Editing (2-3 days)
├─ Create template copy logic
├─ Update editor for position-only mode
├─ Add "Use Template" button
└─ Test copying workflow

Phase 2: Suggestions System (3-4 days)
├─ Create suggestion form
├─ Build creator inbox
├─ Implement approval workflow
├─ Add notifications
└─ Test suggestion flow

Phase 3: Analytics & Revenue (3-4 days)
├─ Create analytics dashboard
├─ Add revenue calculations
├─ Implement usage tracking
├─ Create per-template stats
└─ Test analytics display

Phase 4: Documentation (1-2 days)
├─ Create guide page structure
├─ Write format-specific instructions
├─ Add code examples
└─ Deploy guide
```

---

## Phase Dependencies & Order

```
Foundation Required:
Phase 1 (Editing) ✓ Independent

Builds on Phase 1:
Phase 2 (Suggestions) ← Needs usage tracking from Phase 1
Phase 3 (Analytics) ← Needs usage data from Phase 1 & suggestion counts from Phase 2

Independent:
Phase 4 (Guide) ← Can be done anytime
```

**Recommended Order:**
1. Phase 1 first (enables all user interactions)
2. Phase 2 second (community features need Phase 1)
3. Phase 3 third (analytics depends on Phase 1 & 2)
4. Phase 4 anytime (can be done in parallel)

---

## Success Criteria Per Phase

### Phase 1 Success:
- [x] Users can click "Use Template" on any template
- [x] System creates a personal copy
- [x] Original template is protected
- [x] User can edit copy positions only
- [x] Copy appears in user dashboard

### Phase 2 Success:
- [x] Users can submit suggestions to templates
- [x] Creators receive suggestions in inbox
- [x] Creators can approve/reject suggestions
- [x] Both parties get notifications
- [x] Suggestion history is maintained

### Phase 3 Success:
- [x] Analytics dashboard shows key metrics
- [x] Per-template stats are accurate
- [x] Revenue estimates display correctly
- [x] Usage trends are visible
- [x] Creators see earning potential

### Phase 4 Success:
- [x] Guide page is accessible and clear
- [x] Multiple format instructions provided
- [x] Code examples are copy-paste ready
- [x] Layout is responsive and readable
- [x] Users can follow along successfully

---

## Notes for Implementation

1. **Authentication:** Currently bypassed - remember to re-enable before production
2. **Firestore Rules:** Will need updates after each phase - test rules with emulator
3. **Testing:** Suggest using Firebase Emulator Suite for development
4. **Database Migrations:** Plan for data migration when adding new fields
5. **Performance:** Consider adding indexes for analytics queries
6. **User Experience:** Add loading states and optimistic updates where possible

---

## Risk Areas & Mitigations

| Risk | Mitigation |
|------|-----------|
| Complex Firestore rules | Use emulator, test thoroughly before deployment |
| Performance with large datasets | Add indexes, implement pagination in analytics |
| User confusion on editing | Clear messaging about "copy mode" vs "edit mode" |
| Notification spam | Rate limit suggestions, batch notifications |
| Revenue calculation errors | Log calculations, add audit trail |
| Guide content outdated | Set review schedule for guide updates |

---

## Questions Before Starting

1. Do you want all phases built exactly as described?
2. Should we implement real Stripe payments in Phase 3, or keep mock revenue?
3. For analytics charts, do you have a preference on charting library?
4. Should suggestions require approval from creator before being visible to other users?
5. Do you want email notifications or just in-app?
