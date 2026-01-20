import { BaseComment } from './BaseComment'
import type { CommentData, CommentStyleConfig, CommentActions } from './types'

interface CommentThreadProps {
  comments: CommentData[]
  config: CommentStyleConfig
  actions?: CommentActions
  parentDepth?: number
  className?: string
}

export function CommentThread({
  comments,
  config,
  actions,
  parentDepth = 0,
  className = '',
}: CommentThreadProps) {
  const maxDepth = config.maxDepth ?? 10

  // For flat layout, don't nest
  if (config.layout === 'flat') {
    return (
      <div className={className}>
        {comments.map(comment => (
          <BaseComment
            key={comment.id}
            comment={{ ...comment, depth: 0 }}
            config={config}
            actions={actions}
          />
        ))}
      </div>
    )
  }

  // For nested layouts, increment depth
  return (
    <div className={className}>
      {comments.map(comment => {
        const depth = parentDepth + 1

        // If we've hit max depth, flatten remaining replies
        if (depth >= maxDepth && config.layout === 'deep-nested') {
          return (
            <div key={comment.id}>
              <BaseComment
                comment={{ ...comment, depth: maxDepth }}
                config={{ ...config, layout: 'flat' }}
                actions={actions}
                isReply
              />
            </div>
          )
        }

        return (
          <BaseComment
            key={comment.id}
            comment={{ ...comment, depth }}
            config={config}
            actions={actions}
            isReply
          />
        )
      })}
    </div>
  )
}

// Utility: Flatten a nested comment tree
export function flattenComments(comments: CommentData[]): CommentData[] {
  const result: CommentData[] = []

  function traverse(list: CommentData[], depth: number) {
    for (const comment of list) {
      result.push({ ...comment, depth })
      if (comment.replies && comment.replies.length > 0) {
        traverse(comment.replies, depth + 1)
      }
    }
  }

  traverse(comments, 0)
  return result
}

// Utility: Build tree from flat list (if comments have parentId)
interface FlatComment extends Omit<CommentData, 'replies'> {
  parentId?: string | null
}

export function buildCommentTree(flatComments: FlatComment[]): CommentData[] {
  const map = new Map<string, CommentData>()
  const roots: CommentData[] = []

  // First pass: create nodes
  for (const comment of flatComments) {
    map.set(comment.id, { ...comment, replies: [] })
  }

  // Second pass: build tree
  for (const comment of flatComments) {
    const node = map.get(comment.id)!
    if (comment.parentId && map.has(comment.parentId)) {
      const parent = map.get(comment.parentId)!
      parent.replies = parent.replies ?? []
      parent.replies.push(node)
    } else {
      roots.push(node)
    }
  }

  return roots
}
