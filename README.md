# Admin Dashboard - Next.js Application

A modern, responsive admin dashboard built with Next.js 14, TypeScript, and Tailwind CSS. Features authentication, lazy loading, and a modular architecture for easy extensibility.

## 🚀 Features

- **🔐 Authentication System** - Role-based access control with admin credentials
- **📱 Responsive Design** - Mobile-first approach with Tailwind CSS
- **⚡ Lazy Loading** - Optimized performance with code splitting
- **🎨 Modern UI** - Clean, professional interface with shadcn/ui components
- **📊 Data Management** - CRUD operations for various data types
- **🛡️ Error Handling** - Comprehensive error boundaries and validation
- **📈 Performance Monitoring** - Built-in performance tracking
- **🔧 Modular Architecture** - Easy to extend with new modules

## 🏗️ Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (guest)/                  # Public routes (login, signup, etc.)
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── forgot/page.tsx
│   ├── admin/                    # Protected admin routes
│   │   ├── layout.tsx           # Admin layout with sidebar & topbar
│   │   ├── page.tsx             # Dashboard
│   │   ├── users/page.tsx
│   │   ├── products/page.tsx
│   │   ├── faqs/page.tsx
│   │   └── ...                   # Other admin pages
│   └── api/                      # API routes
│       └── auth/
├── components/                   # Reusable components
│   ├── admin/                   # Admin-specific components
│   ├── auth/                    # Authentication components
│   ├── modules/                 # Feature modules
│   │   └── faqs/               # FAQ module example
│   └── ui/                     # Base UI components
├── features/                    # Redux slices for state management
├── lib/                        # Utilities and configurations
├── data/                       # Static JSON data
└── store/                      # Redux store configuration
```

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: Redux Toolkit
- **Icons**: Lucide React
- **Authentication**: Cookie-based with role validation

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd myapp
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run the development server**
```bash
npm run dev
# or
yarn dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Default Credentials

For development, use these credentials to access the admin panel:
- **Email**: `admin@yopmail.com`
- **Password**: `AdminPass123!`

## 📖 Usage Guide

### Authentication

The application uses a role-based authentication system:

1. **Login**: Navigate to `/login` and enter admin credentials
2. **Access Control**: Only users with admin role can access `/admin/*` routes
3. **Logout**: Use the profile menu in the top-right corner

### Navigation

- **Public Routes**: Login, signup, forgot password
- **Admin Routes**: Dashboard, users, products, FAQs, settings, etc.
- **Sidebar Navigation**: Collapsible sidebar with organized menu items

## 🔧 Adding New Modules

This section shows how to add a new module to the application. We'll create a "Blog Posts" module as an example.

### Step 1: Create Data Structure

Create a new JSON file in `src/data/`:

```json
// src/data/blogPosts.json
[
  {
    "id": 1,
    "title": "Getting Started with Next.js",
    "content": "Learn the basics of Next.js development...",
    "author": "John Doe",
    "status": "Published",
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
]
```

### Step 2: Create Types

Define TypeScript interfaces:

```typescript
// src/components/modules/blogPosts/types.ts
export interface BlogPost {
  id: number
  title: string
  content: string
  author: string
  status: "Draft" | "Published" | "Archived"
  createdAt: string
  updatedAt: string
}

export interface CreateBlogPostPayload {
  title: string
  content: string
  author: string
  status: "Draft" | "Published"
}
```

### Step 3: Create Redux Slice

```typescript
// src/features/blogPosts/blogPostsSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import type { BlogPost, CreateBlogPostPayload } from "@/components/modules/blogPosts/types"

interface BlogPostsState {
  items: BlogPost[]
  loading: boolean
  error: string | null
}

const initialState: BlogPostsState = {
  items: [],
  loading: false,
  error: null
}

const blogPostsSlice = createSlice({
  name: "blogPosts",
  initialState,
  reducers: {
    fetchBlogPosts: (state) => {
      state.loading = true
      state.error = null
    },
    fetchBlogPostsSuccess: (state, action: PayloadAction<BlogPost[]>) => {
      state.loading = false
      state.items = action.payload
    },
    createBlogPost: (state, action: PayloadAction<CreateBlogPostPayload>) => {
      const newPost: BlogPost = {
        id: Date.now(),
        ...action.payload,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      state.items.unshift(newPost)
    },
    updateBlogPost: (state, action: PayloadAction<BlogPost>) => {
      const index = state.items.findIndex(post => post.id === action.payload.id)
      if (index !== -1) {
        state.items[index] = { ...action.payload, updatedAt: new Date().toISOString() }
      }
    },
    deleteBlogPost: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(post => post.id !== action.payload)
    }
  }
})

export const {
  fetchBlogPosts,
  fetchBlogPostsSuccess,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost
} = blogPostsSlice.actions

export const selectBlogPosts = (state: { blogPosts: BlogPostsState }) => state.blogPosts.items
export const selectBlogPostsLoading = (state: { blogPosts: BlogPostsState }) => state.blogPosts.loading

export default blogPostsSlice.reducer
```

### Step 4: Create Components

```typescript
// src/components/modules/blogPosts/BlogPostsTable.tsx
"use client"
import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash, Eye } from "lucide-react"
import type { BlogPost } from "./types"

interface BlogPostsTableProps {
  posts: BlogPost[]
  onEdit: (post: BlogPost) => void
  onDelete: (id: number) => void
  onView: (post: BlogPost) => void
}

export default function BlogPostsTable({ posts, onEdit, onDelete, onView }: BlogPostsTableProps) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Published": return "default"
      case "Draft": return "secondary"
      case "Archived": return "outline"
      default: return "secondary"
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map((post) => (
            <TableRow key={post.id}>
              <TableCell className="font-medium">{post.title}</TableCell>
              <TableCell>{post.author}</TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(post.status)}>
                  {post.status}
                </Badge>
              </TableCell>
              <TableCell>
                {new Date(post.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => onView(post)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onEdit(post)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onDelete(post.id)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
```

### Step 5: Create Page

```typescript
// src/app/admin/blog-posts/page.tsx
"use client"
import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchBlogPosts, selectBlogPosts, createBlogPost, deleteBlogPost } from "@/features/blogPosts/blogPostsSlice"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import BlogPostsTable from "@/components/modules/blogPosts/BlogPostsTable"
import type { BlogPost } from "@/components/modules/blogPosts/types"

export default function BlogPostsPage() {
  const dispatch = useAppDispatch()
  const posts = useAppSelector(selectBlogPosts)
  const [editing, setEditing] = useState<BlogPost | null>(null)

  useEffect(() => {
    // Load data from JSON file (in real app, this would be an API call)
    const loadData = async () => {
      const response = await fetch('/data/blogPosts.json')
      const data = await response.json()
      dispatch(fetchBlogPostsSuccess(data))
    }
    loadData()
  }, [dispatch])

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this blog post?")) {
      dispatch(deleteBlogPost(id))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Blog Posts</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Post
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <BlogPostsTable
            posts={posts}
            onEdit={setEditing}
            onDelete={handleDelete}
            onView={(post) => console.log("View post:", post)}
          />
        </CardContent>
      </Card>
    </div>
  )
}
```

### Step 6: Add to Store

```typescript
// src/store/store.ts
import { configureStore } from "@reduxjs/toolkit"
import blogPostsReducer from "@/features/blogPosts/blogPostsSlice"
// ... other imports

export const store = configureStore({
  reducer: {
    blogPosts: blogPostsReducer,
    // ... other reducers
  },
})
```

### Step 7: Add to Sidebar

```typescript
// src/components/admin/sidebar.tsx
// Add to the navigation items:
{
  title: "Blog Posts",
  href: "/admin/blog-posts",
  icon: FileText,
}
```

## 🎨 Customization

### Styling

The application uses Tailwind CSS with a custom design system. Key customization points:

- **Colors**: Defined in `tailwind.config.js`
- **Components**: Based on shadcn/ui, located in `src/components/ui/`
- **Layout**: Responsive grid system with breakpoints

### Adding New UI Components

1. Use the shadcn/ui CLI to add new components:
   ```bash
   npx shadcn-ui@latest add [component-name]
   ```

2. Or create custom components in `src/components/ui/`

### State Management

The application uses Redux Toolkit for state management. Each feature has its own slice:

- **Actions**: Define what can happen
- **Reducers**: Handle state changes
- **Selectors**: Extract data from state
- **Async Thunks**: Handle API calls

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Environment Variables

Create a `.env.local` file:

```env
# API Configuration (for future backend integration)
NEXT_PUBLIC_API_URL=http://localhost:8000/api
API_KEY=your_api_key_here

# Authentication
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=http://localhost:3000
```

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

## 📚 API Integration

The application is prepared for backend integration:

### Current State
- Client-side authentication with hardcoded credentials
- Static JSON data files
- Placeholder API routes

### Future Integration
- Replace `src/lib/auth.ts` functions with API calls
- Update Redux slices to use `createAsyncThunk`
- Implement real API endpoints in `src/app/api/`

## 🐛 Troubleshooting

### Common Issues

1. **Authentication not working**
   - Check if cookies are enabled
   - Verify credentials match exactly
   - Clear browser cache and cookies

2. **Lazy loading not working**
   - Ensure components are properly exported
   - Check for TypeScript errors
   - Verify Suspense boundaries are in place

3. **Styling issues**
   - Check Tailwind CSS configuration
   - Verify component imports
   - Clear Next.js cache: `rm -rf .next`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code examples

---

**Happy coding! 🚀**