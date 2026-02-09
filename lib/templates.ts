export interface EBookTemplate {
  id: string
  name: string
  description: string
  category: string
  accentColor: string
  accentBg: string
  coverStyle: 'classic' | 'modern' | 'bold' | 'elegant' | 'technical' | 'creative'
  fonts: {
    heading: string
    body: string
  }
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
}

export interface EBook {
  title: string
  author: string
  subtitle?: string
  chapters: Array<{
    id: string
    title: string
    content: string
  }>
  templateId?: string
}

export const templates: EBookTemplate[] = [
  {
    id: 'classic-novel',
    name: 'Classic Novel',
    description: 'Timeless serif typography with elegant chapter openings. Perfect for fiction and literary works.',
    category: 'Fiction',
    accentColor: '#8B7355',
    accentBg: 'from-amber-950 to-amber-900',
    coverStyle: 'classic',
    fonts: {
      heading: 'Georgia, serif',
      body: 'Georgia, serif',
    },
    defaultContent: {
      title: 'The Untold Story',
      author: 'Your Name',
      subtitle: 'A Novel',
      chapters: [
        {
          id: '1',
          title: 'Chapter One',
          content: 'It was a bright cold day in April, and the clocks were striking thirteen. The story begins here, in the quiet of an ordinary morning that would prove to be anything but ordinary.\n\nWrite your opening paragraphs here. Set the scene, introduce your protagonist, and draw the reader into your world.',
        },
        {
          id: '2',
          title: 'Chapter Two',
          content: 'Continue your narrative here. Develop your characters, build tension, and advance the plot.\n\nEach chapter should move the story forward while deepening the reader\'s connection to your characters.',
        },
      ],
    },
  },
  {
    id: 'modern-minimal',
    name: 'Modern Minimal',
    description: 'Clean sans-serif design with generous whitespace. Ideal for contemporary non-fiction and essays.',
    category: 'Non-Fiction',
    accentColor: '#2563EB',
    accentBg: 'from-blue-950 to-slate-900',
    coverStyle: 'modern',
    fonts: {
      heading: 'system-ui, -apple-system, sans-serif',
      body: 'system-ui, -apple-system, sans-serif',
    },
    defaultContent: {
      title: 'Clear Thinking',
      author: 'Your Name',
      subtitle: 'A Guide to Modern Ideas',
      chapters: [
        {
          id: '1',
          title: 'Introduction',
          content: 'In a world of information overload, clarity of thought has become the most valuable skill. This book explores how to think more clearly and communicate more effectively.\n\nReplace this text with your introduction. Outline the problem you are solving and why the reader should care.',
        },
        {
          id: '2',
          title: 'The Foundation',
          content: 'Every great idea starts with a solid foundation. In this chapter, we explore the building blocks of clear thinking.\n\nAdd your content here. Use short paragraphs and direct language for maximum impact.',
        },
        {
          id: '3',
          title: 'Putting It Into Practice',
          content: 'Theory without practice is empty. Here we bridge the gap between understanding and action.\n\nProvide practical examples, exercises, or frameworks the reader can apply immediately.',
        },
      ],
    },
  },
  {
    id: 'academic-textbook',
    name: 'Academic Textbook',
    description: 'Formal structure with numbered sections and clear hierarchy. Built for educational and scholarly content.',
    category: 'Academic',
    accentColor: '#166534',
    accentBg: 'from-green-950 to-emerald-950',
    coverStyle: 'elegant',
    fonts: {
      heading: 'system-ui, -apple-system, sans-serif',
      body: 'Georgia, serif',
    },
    defaultContent: {
      title: 'Principles of Modern Science',
      author: 'Your Name, Ph.D.',
      subtitle: 'An Introduction',
      chapters: [
        {
          id: '1',
          title: '1. Foundations and Core Concepts',
          content: 'This chapter introduces the fundamental concepts and theoretical framework that underpin the subject matter. We begin with a historical overview before diving into the core principles.\n\nLearning Objectives:\n- Understand the basic terminology\n- Identify key historical milestones\n- Apply foundational concepts to simple problems',
        },
        {
          id: '2',
          title: '2. Methods and Methodology',
          content: 'A rigorous understanding of methodology is essential for any serious study. This chapter covers the primary research methods used in the field.\n\nKey Topics:\n- Qualitative vs. Quantitative approaches\n- Experimental design\n- Data collection and analysis',
        },
        {
          id: '3',
          title: '3. Advanced Topics',
          content: 'Building on the foundations from previous chapters, we now explore more complex and nuanced aspects of the subject.\n\nThis chapter assumes familiarity with the concepts introduced in Chapters 1 and 2.',
        },
      ],
    },
  },
  {
    id: 'technical-manual',
    name: 'Technical Manual',
    description: 'Structured layout with code-friendly formatting. Designed for documentation, guides, and technical writing.',
    category: 'Technical',
    accentColor: '#9333EA',
    accentBg: 'from-violet-950 to-slate-950',
    coverStyle: 'technical',
    fonts: {
      heading: 'system-ui, -apple-system, sans-serif',
      body: 'system-ui, -apple-system, sans-serif',
    },
    defaultContent: {
      title: 'Developer Handbook',
      author: 'Your Name',
      subtitle: 'Complete Reference Guide v1.0',
      chapters: [
        {
          id: '1',
          title: 'Getting Started',
          content: 'Welcome to the Developer Handbook. This guide provides everything you need to get up and running quickly.\n\nPrerequisites:\n- Basic programming knowledge\n- A modern development environment\n- Familiarity with command-line tools\n\nInstallation:\nFollow the steps below to install and configure your environment.',
        },
        {
          id: '2',
          title: 'Core Architecture',
          content: 'Understanding the architecture is crucial for building robust applications. This chapter breaks down the system into its core components.\n\nSystem Overview:\nThe architecture follows a modular design pattern with clear separation of concerns between the data layer, business logic, and presentation layer.',
        },
        {
          id: '3',
          title: 'API Reference',
          content: 'This chapter provides a comprehensive reference for all available APIs and their parameters.\n\nAuthentication:\nAll API requests require a valid authentication token. Tokens can be obtained through the /auth endpoint.\n\nEndpoints:\nDocument your API endpoints, parameters, and response formats here.',
        },
      ],
    },
  },
  {
    id: 'memoir',
    name: 'Personal Memoir',
    description: 'Warm, inviting typography with an intimate feel. Perfect for memoirs, biographies, and personal stories.',
    category: 'Biography',
    accentColor: '#B45309',
    accentBg: 'from-orange-950 to-stone-950',
    coverStyle: 'creative',
    fonts: {
      heading: 'Georgia, serif',
      body: 'Georgia, serif',
    },
    defaultContent: {
      title: 'Looking Back',
      author: 'Your Name',
      subtitle: 'A Memoir',
      chapters: [
        {
          id: '1',
          title: 'The Beginning',
          content: 'Every life has a beginning, and mine started in the most unexpected way. The earliest memory I carry is the sound of rain on a tin roof, a melody that still brings me comfort decades later.\n\nWrite about your earliest memories, the place you grew up, and the people who shaped your early years.',
        },
        {
          id: '2',
          title: 'Turning Points',
          content: 'Life rarely follows the path we imagine for ourselves. The moments that define us are often the ones we never saw coming.\n\nShare the pivotal moments that changed the course of your life. Be honest, be vulnerable, be real.',
        },
      ],
    },
  },
  {
    id: 'business-report',
    name: 'Business Report',
    description: 'Corporate and professional with clean data presentation. Suited for reports, whitepapers, and proposals.',
    category: 'Business',
    accentColor: '#0F766E',
    accentBg: 'from-teal-950 to-slate-950',
    coverStyle: 'bold',
    fonts: {
      heading: 'system-ui, -apple-system, sans-serif',
      body: 'system-ui, -apple-system, sans-serif',
    },
    defaultContent: {
      title: 'Annual Strategy Report',
      author: 'Your Organization',
      subtitle: 'Fiscal Year 2026',
      chapters: [
        {
          id: '1',
          title: 'Executive Summary',
          content: 'This report provides a comprehensive overview of the organization\'s performance, strategic initiatives, and forward-looking projections for the coming fiscal year.\n\nKey Highlights:\n- Revenue growth of X% year-over-year\n- Successful launch of new product lines\n- Expansion into three new markets',
        },
        {
          id: '2',
          title: 'Market Analysis',
          content: 'The market landscape has evolved significantly over the past year. This chapter examines current trends, competitive dynamics, and emerging opportunities.\n\nMarket Size and Growth:\nProvide data and analysis about your target market, growth trajectories, and key drivers.',
        },
        {
          id: '3',
          title: 'Strategic Recommendations',
          content: 'Based on the analysis presented in previous chapters, we recommend the following strategic priorities for the coming year.\n\nPriority 1: Innovation\nPriority 2: Market Expansion\nPriority 3: Operational Excellence\n\nDetail each recommendation with supporting evidence and implementation timelines.',
        },
      ],
    },
  },
]
