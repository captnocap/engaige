# Content Templates for Filler Apps

## Philosophy

**Two Types of Apps:**

1. **Interactive Apps** (Core Game Mechanics)
   - Messenger, MySpace, Dating apps
   - These need deep integration with NPC systems
   - WE focus on these

2. **Content Apps** (Browsable Filler)
   - Wikipedia, News, Forums, etc.
   - Just need templates + AI-generated content
   - OTHER AGENTS can spam these out

## Template Architecture

### Content App Structure

```typescript
interface ContentApp {
  id: string;
  type: 'browser_site' | 'reader_app' | 'media_viewer';
  metadata: {
    name: string;
    icon: string;
    url?: string; // For browser sites
    category: 'news' | 'wiki' | 'forum' | 'media' | 'entertainment';
  };
  contentSchema: ContentSchema;
  uiTemplate: UITemplate;
}
```

### Content Schema (JSON)

All filler content is stored as JSON that follows a schema:

```typescript
interface ContentSchema {
  version: string;
  contentType: 'article' | 'post' | 'listing' | 'profile' | 'feed';
  fields: ContentField[];
}

interface ContentField {
  name: string;
  type: 'string' | 'markdown' | 'image_url' | 'array' | 'object';
  required: boolean;
  description: string;
}
```

---

## 1. Wikipedia Clone Template

### Schema: `wiki_article.schema.json`

```json
{
  "version": "1.0",
  "contentType": "article",
  "description": "Wikipedia-style article about anything in the game world",
  "fields": [
    {
      "name": "title",
      "type": "string",
      "required": true,
      "description": "Article title"
    },
    {
      "name": "category",
      "type": "string",
      "required": true,
      "description": "Category (e.g., 'Culture', 'Technology', 'People', 'Events', 'Places')"
    },
    {
      "name": "summary",
      "type": "string",
      "required": true,
      "description": "Brief opening paragraph (2-3 sentences)"
    },
    {
      "name": "sections",
      "type": "array",
      "required": true,
      "description": "Article sections",
      "items": {
        "heading": "string",
        "content": "markdown",
        "subsections": "array (optional)"
      }
    },
    {
      "name": "infobox",
      "type": "object",
      "required": false,
      "description": "Right sidebar info box",
      "properties": {
        "image_url": "string",
        "facts": "object (key-value pairs)"
      }
    },
    {
      "name": "related_articles",
      "type": "array",
      "required": false,
      "description": "Links to other articles (just titles, we'll link them)"
    },
    {
      "name": "references",
      "type": "array",
      "required": false,
      "description": "Fake citations"
    }
  ]
}
```

### Example Article: `quantum_coffee.json`

```json
{
  "id": "quantum_coffee_001",
  "title": "Quantum Coffee Brewing",
  "category": "Technology",
  "summary": "Quantum Coffee Brewing is a revolutionary coffee preparation technique discovered in 2019 by Dr. Elena Martinez. The process uses quantum entanglement to achieve the perfect brew temperature across all molecules simultaneously.",
  "sections": [
    {
      "heading": "History",
      "content": "The technique was accidentally discovered when Dr. Martinez was experimenting with quantum computing and spilled coffee on her quantum processor..."
    },
    {
      "heading": "Process",
      "content": "The quantum brewing process involves three key steps:\n\n1. Quantum entanglement of water molecules\n2. Superposition of coffee grounds\n3. Observation collapse at optimal brewing temperature",
      "subsections": [
        {
          "heading": "Step 1: Entanglement",
          "content": "Water molecules are first entangled using a specialized quantum coil..."
        }
      ]
    },
    {
      "heading": "Cultural Impact",
      "content": "Quantum coffee shops have become increasingly popular in urban areas, with enthusiasts claiming they can taste the difference between quantum and classical brewing methods..."
    }
  ],
  "infobox": {
    "image_url": "https://example.com/quantum_coffee.jpg",
    "facts": {
      "Discovered": "2019",
      "Inventor": "Dr. Elena Martinez",
      "First Commercial Use": "2021",
      "Average Cost": "$47 per cup",
      "Popularity": "High among tech workers"
    }
  },
  "related_articles": [
    "Coffee Culture",
    "Quantum Computing",
    "Dr. Elena Martinez",
    "Modern Brewing Techniques"
  ],
  "references": [
    "Martinez, E. (2019). 'Accidental Quantum Brewing'. Journal of Caffeinated Physics.",
    "Tech Today Magazine. 'The Quantum Coffee Revolution'. April 2021."
  ]
}
```

### UI Template

```tsx
// src/components/browser/WikiArticle.tsx
interface WikiArticleProps {
  article: WikiArticleData;
}

export function WikiArticle({ article }: WikiArticleProps) {
  return (
    <div className="wiki-page">
      <h1>{article.title}</h1>
      <div className="wiki-layout">
        <main className="wiki-content">
          <p className="summary">{article.summary}</p>
          {article.sections.map(section => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              <Markdown content={section.content} />
              {section.subsections?.map(sub => (
                <div key={sub.heading}>
                  <h3>{sub.heading}</h3>
                  <Markdown content={sub.content} />
                </div>
              ))}
            </section>
          ))}
        </main>
        {article.infobox && (
          <aside className="wiki-infobox">
            <img src={article.infobox.image_url} alt={article.title} />
            <dl>
              {Object.entries(article.infobox.facts).map(([key, value]) => (
                <>
                  <dt>{key}</dt>
                  <dd>{value}</dd>
                </>
              ))}
            </dl>
          </aside>
        )}
      </div>
    </div>
  );
}
```

---

## 2. News Site Template

### Schema: `news_article.schema.json`

```json
{
  "version": "1.0",
  "contentType": "article",
  "description": "News article about game world events",
  "fields": [
    {
      "name": "headline",
      "type": "string",
      "required": true,
      "description": "Catchy headline"
    },
    {
      "name": "subheadline",
      "type": "string",
      "required": false,
      "description": "Secondary headline"
    },
    {
      "name": "category",
      "type": "string",
      "required": true,
      "description": "News category (e.g., 'Local', 'Entertainment', 'Tech', 'Gossip')"
    },
    {
      "name": "author",
      "type": "string",
      "required": true,
      "description": "Fake journalist name"
    },
    {
      "name": "date",
      "type": "string",
      "required": true,
      "description": "Publication date"
    },
    {
      "name": "featured_image",
      "type": "string",
      "required": false,
      "description": "URL to header image"
    },
    {
      "name": "content",
      "type": "markdown",
      "required": true,
      "description": "Full article body"
    },
    {
      "name": "tags",
      "type": "array",
      "required": false,
      "description": "Article tags"
    },
    {
      "name": "related_articles",
      "type": "array",
      "required": false,
      "description": "Related news links"
    }
  ]
}
```

### Example: `local_concert_cancelled.json`

```json
{
  "id": "news_concert_001",
  "headline": "Indie Band Cancels Show Due to 'Existential Crisis'",
  "subheadline": "The Velvet Algorithms cite 'questioning the nature of reality' as reason for postponement",
  "category": "Entertainment",
  "author": "Sarah Chen",
  "date": "2024-03-15",
  "featured_image": "https://example.com/concert.jpg",
  "content": "Local indie band The Velvet Algorithms has cancelled tonight's show at The Underground venue, citing an 'ongoing existential crisis' affecting all band members...\n\n[Full article continues]",
  "tags": ["music", "local events", "indie", "concerts"],
  "related_articles": [
    "The Velvet Algorithms: A Brief History",
    "Mental Health in the Music Industry",
    "Underground Venue Schedules"
  ]
}
```

---

## 3. Reddit Clone Template

### Schema: `forum_thread.schema.json`

```json
{
  "version": "1.0",
  "contentType": "post",
  "description": "Forum thread with nested comments",
  "fields": [
    {
      "name": "subreddit",
      "type": "string",
      "required": true,
      "description": "Subreddit name (e.g., 'r/coffee', 'r/relationshipadvice')"
    },
    {
      "name": "title",
      "type": "string",
      "required": true,
      "description": "Thread title"
    },
    {
      "name": "author",
      "type": "string",
      "required": true,
      "description": "Username (can be NPC or fake user)"
    },
    {
      "name": "content",
      "type": "markdown",
      "required": true,
      "description": "Post body"
    },
    {
      "name": "flair",
      "type": "string",
      "required": false,
      "description": "Post flair (e.g., 'Advice Needed', 'Discussion')"
    },
    {
      "name": "upvotes",
      "type": "number",
      "required": true,
      "description": "Upvote count"
    },
    {
      "name": "comments",
      "type": "array",
      "required": false,
      "description": "Comment tree",
      "items": {
        "author": "string",
        "content": "string",
        "upvotes": "number",
        "replies": "array (nested comments)"
      }
    },
    {
      "name": "created_at",
      "type": "string",
      "required": true,
      "description": "Post timestamp"
    }
  ]
}
```

### Example: `coffee_drama.json`

```json
{
  "id": "reddit_coffee_001",
  "subreddit": "r/coffee",
  "title": "AITA for refusing to drink my roommate's 'quantum brewed' coffee?",
  "author": "throwaway_brew_123",
  "content": "My (24M) roommate (26F) just bought a $3000 quantum coffee maker and insists I try it every morning. I think it's pseudoscience bs and tastes the same as regular coffee. She's now claiming I'm 'closed-minded' and 'don't appreciate innovation.' AITA?",
  "flair": "Advice Needed",
  "upvotes": 2847,
  "created_at": "2024-03-15T08:23:00Z",
  "comments": [
    {
      "author": "CaffeineAddict99",
      "content": "NTA. Your coffee, your choice. Though I gotta say, quantum coffee IS pretty good...",
      "upvotes": 1523,
      "replies": [
        {
          "author": "throwaway_brew_123",
          "content": "I just don't see how quantum physics makes coffee taste better lol",
          "upvotes": 892,
          "replies": [
            {
              "author": "QuantumBaristaGirl",
              "content": "As someone who works at a quantum cafe, there IS a difference. The molecular structure is more uniform. But yeah, $3k is excessive for home use.",
              "upvotes": 2104,
              "replies": []
            }
          ]
        }
      ]
    },
    {
      "author": "RelationshipGuru",
      "content": "YTA. She's excited about something and wants to share it with you. Just try one cup and be supportive!",
      "upvotes": -234,
      "replies": []
    }
  ]
}
```

---

## 4. Streaming Site Template (Twitch)

### Schema: `stream.schema.json`

```json
{
  "version": "1.0",
  "contentType": "listing",
  "description": "Live stream listing",
  "fields": [
    {
      "name": "streamer",
      "type": "string",
      "required": true,
      "description": "Streamer name (can be NPC)"
    },
    {
      "name": "title",
      "type": "string",
      "required": true,
      "description": "Stream title"
    },
    {
      "name": "category",
      "type": "string",
      "required": true,
      "description": "Game/category (e.g., 'Art', 'Music', 'Just Chatting')"
    },
    {
      "name": "thumbnail",
      "type": "string",
      "required": true,
      "description": "Stream thumbnail URL"
    },
    {
      "name": "viewer_count",
      "type": "number",
      "required": true,
      "description": "Current viewers"
    },
    {
      "name": "is_live",
      "type": "boolean",
      "required": true,
      "description": "Currently streaming?"
    },
    {
      "name": "chat_messages",
      "type": "array",
      "required": false,
      "description": "Pre-generated chat messages that scroll",
      "items": {
        "username": "string",
        "message": "string",
        "timestamp": "string"
      }
    },
    {
      "name": "tags",
      "type": "array",
      "required": false,
      "description": "Stream tags"
    }
  ]
}
```

---

## 5. E-commerce Template (Amazon)

### Schema: `product_listing.schema.json`

```json
{
  "version": "1.0",
  "contentType": "listing",
  "description": "Product listing",
  "fields": [
    {
      "name": "name",
      "type": "string",
      "required": true,
      "description": "Product name"
    },
    {
      "name": "category",
      "type": "string",
      "required": true,
      "description": "Product category"
    },
    {
      "name": "price",
      "type": "number",
      "required": true,
      "description": "Price in dollars"
    },
    {
      "name": "rating",
      "type": "number",
      "required": true,
      "description": "Average rating (0-5)"
    },
    {
      "name": "image_url",
      "type": "string",
      "required": true,
      "description": "Product image"
    },
    {
      "name": "description",
      "type": "string",
      "required": true,
      "description": "Product description"
    },
    {
      "name": "reviews",
      "type": "array",
      "required": false,
      "description": "Customer reviews",
      "items": {
        "author": "string",
        "rating": "number",
        "title": "string",
        "content": "string",
        "verified": "boolean"
      }
    },
    {
      "name": "related_products",
      "type": "array",
      "required": false,
      "description": "Recommended products"
    }
  ]
}
```

---

## Content Generation Prompt Templates

### For AI Agents to Generate Content

#### Wikipedia Article Generator

```
Generate a Wikipedia-style article for the engAIge game world.

SCHEMA: wiki_article.schema.json

TONE: Encyclopedia-like, informative, slightly absurd

GUIDELINES:
- Make it feel real but have fun with it
- Reference other fake articles/people
- Include realistic but fake citations
- Topics can be: places, people, events, technology, culture, history
- Should feel like it exists in a modern world but with creative twists

TOPICS TO COVER (pick one):
- Quantum Coffee Brewing
- The Great Meme War of 2019
- Underground Art Scene in [City]
- [NPC Name] (Celebrity/Artist)
- Aesthetic Movements (Y2K Revival, Cyber-Goth, etc.)
- Fake Technologies
- Local Landmarks
- Cultural Phenomena

OUTPUT FORMAT: JSON following wiki_article.schema.json
```

#### News Article Generator

```
Generate a news article for the engAIge game world.

SCHEMA: news_article.schema.json

TONE: Journalistic but fun, like Onion meets actual news

CATEGORIES:
- Local Events (concerts, openings, closures)
- Entertainment (celebrity gossip about NPCs)
- Technology (new apps, devices, trends)
- Lifestyle (trends, advice, how-tos)
- Opinion (hot takes, editorials)

GUIDELINES:
- Reference NPCs when relevant
- Create fake businesses/venues
- Be topical to current in-game events
- Mix serious and silly

OUTPUT FORMAT: JSON following news_article.schema.json
```

#### Reddit Thread Generator

```
Generate a Reddit-style thread for the engAIge game world.

SCHEMA: forum_thread.schema.json

SUBREDDITS:
- r/relationshipadvice
- r/coffee
- r/indiemusic
- r/art
- r/gaming
- r/casualconversation
- r/amithea**hole
- r/askreddit

GUIDELINES:
- Create realistic drama/discussion
- Include varied opinions in comments
- Use Reddit slang (NTA, YTA, ESH, etc.)
- Nested comment chains
- Some comments get lots of upvotes, some downvotes
- Can reference NPCs or fake users

OUTPUT FORMAT: JSON following forum_thread.schema.json
```

---

## Storage Structure

```
server/data/content/
├── wiki/
│   ├── quantum_coffee.json
│   ├── meme_war_2019.json
│   └── ...
├── news/
│   ├── local_concert_cancelled.json
│   ├── new_coffee_shop_opens.json
│   └── ...
├── reddit/
│   ├── coffee_drama.json
│   ├── relationship_advice_001.json
│   └── ...
├── streams/
│   ├── alex_paints_live.json
│   └── ...
└── products/
    ├── quantum_coffee_maker.json
    └── ...
```

---

## Universal Content Loader

```typescript
// server/src/services/content-loader.ts

interface ContentIndex {
  type: 'wiki' | 'news' | 'reddit' | 'stream' | 'product';
  files: string[];
}

export class ContentLoader {
  private cache: Map<string, any> = new Map();

  // Load all content of a type
  async loadContentType(type: string): Promise<any[]> {
    const dir = `./data/content/${type}`;
    const files = await readdir(dir);

    return Promise.all(
      files
        .filter(f => f.endsWith('.json'))
        .map(f => this.loadContent(type, f))
    );
  }

  // Load single content file
  async loadContent(type: string, filename: string): Promise<any> {
    const cacheKey = `${type}/${filename}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const content = JSON.parse(
      await readFile(`./data/content/${type}/${filename}`, 'utf-8')
    );

    this.cache.set(cacheKey, content);
    return content;
  }

  // Search content
  searchContent(type: string, query: string): any[] {
    // Simple text search across cached content
    // Can be enhanced with better search later
  }

  // Get random content
  getRandomContent(type: string, count: number = 1): any[] {
    // Return random items for discovery
  }
}
```

---

## React Component Generator

```typescript
// Generic content viewer component
interface ContentViewerProps {
  contentType: 'wiki' | 'news' | 'reddit' | 'stream' | 'product';
  contentId: string;
}

export function ContentViewer({ contentType, contentId }: ContentViewerProps) {
  const content = useContent(contentType, contentId);

  switch (contentType) {
    case 'wiki':
      return <WikiArticle article={content} />;
    case 'news':
      return <NewsArticle article={content} />;
    case 'reddit':
      return <RedditThread thread={content} />;
    case 'stream':
      return <StreamView stream={content} />;
    case 'product':
      return <ProductListing product={content} />;
  }
}
```

---

## Agent Instructions

**For other AI agents generating content:**

1. **Pick a template** (wiki, news, reddit, stream, product)
2. **Read the schema** to understand required fields
3. **Follow the tone guidelines** for that content type
4. **Generate 10-50 pieces** of content in one go
5. **Save as JSON files** in appropriate directory
6. **Reference NPCs** when it makes sense (check NPC database for names/interests)
7. **Create interconnections** - articles reference each other, build a web

**Batch Generation Command:**

```bash
# Generate 50 Wikipedia articles
bun run generate-content --type wiki --count 50

# Generate 100 news articles
bun run generate-content --type news --count 100

# Generate 30 Reddit threads
bun run generate-content --type reddit --count 30
```

---

## Benefits of This System

1. **Parallel Work**: You can have 5 agents generating different content types simultaneously
2. **Modular**: Easy to add new content types
3. **No Game Logic**: Filler content doesn't need to interact with NPCs/relationships
4. **Cheap**: Content generation can use cheaper models (GPT-4o-mini)
5. **Cacheable**: Pre-generated content loads instantly
6. **Expandable**: Users could even mod in their own content
7. **Fun**: Creates a rich, browsable world

---

## What YOU Focus On

While agents generate filler content, YOU build:

- **Messenger** (NPC conversations, relationship mechanics)
- **MySpace** (NPC profiles, posts, social dynamics)
- **Dating App** (matching, relationship progression)
- **Settings** (AI config, budgets)
- **Files** (media management)

The filler content makes the world feel alive, but the core apps are where the actual GAME happens.

---

## Example Workflow

1. **You**: Build Messenger with full NPC integration
2. **Agent 1**: Generate 100 Wikipedia articles
3. **Agent 2**: Generate 200 news articles
4. **Agent 3**: Generate 150 Reddit threads
5. **Agent 4**: Generate 50 product listings
6. **You**: Build MySpace with profile system
7. **Agent 5**: Generate 30 fake streams

By the time you finish the core apps, you have a MASSIVE browsable world filled with content, all without writing a single fake article yourself.

🚀 **Ready to parallelize this shit?**
