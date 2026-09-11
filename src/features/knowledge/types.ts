// src/features/knowledge/types.ts  (updated — additions at the bottom)
export type EntityType = 'concept' | 'note' | 'question' | 'resource';
export type QuestionStatus = 'open' | 'answered';
export type ResourceKind = 'article' | 'video' | 'book' | 'course' | 'podcast' | 'other';

export interface KnowledgeNode {
  id: string;
  type: EntityType;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  lastReviewedAt: string | null;
  status?: QuestionStatus;
  url?: string;
  resourceKind?: ResourceKind;
}

export interface KnowledgeLink {
  id: string;
  sourceId: string;
  targetId: string;
  label: string;
  createdAt: string;
}

/** Input for creating a node — ids/dates are filled by the action layer. */
export interface NewNodeInput {
  type: EntityType;
  title: string;
  content?: string;
  tags?: string[];
  status?: QuestionStatus;
  url?: string;
  resourceKind?: ResourceKind;
}

/** Patch for updates — identity fields are protected. */
export type NodePatch = Partial<Pick<KnowledgeNode,
  'title' | 'content' | 'tags' | 'status' | 'url' | 'resourceKind' | 'lastReviewedAt'
>>;