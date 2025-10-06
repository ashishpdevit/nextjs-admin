# NextJS Admin Dashboard - Starter Kit

A comprehensive, production-ready admin dashboard built with Next.js 14, TypeScript, Redux Toolkit, and Tailwind CSS. This starter kit provides a complete foundation for building modern admin interfaces with advanced features like pagination, search, sorting, role-based access control, and more.

## 🚀 Features

### Core Functionality
- **Modern Tech Stack**: Next.js 14, TypeScript, Redux Toolkit, Tailwind CSS
- **Server-Side Pagination**: Efficient data loading with configurable page sizes
- **Advanced Search & Filtering**: Real-time search with debouncing and multiple filter options
- **Sorting**: Multi-column sorting with ascending/descending order
- **Loading States**: Professional loading spinners and empty state handling
- **Responsive Design**: Mobile-first approach with adaptive layouts

### Admin Modules
- **Products Management**: Full CRUD with inventory tracking and categorization
- **Customers Management**: Customer profiles with contact information and status tracking
- **Orders Management**: Order processing with status updates and customer linking
- **Users Management**: Admin user management with role assignments
- **FAQs Management**: Multi-language FAQ system with categorization
- **Contact Messages**: Contact form message management and processing
- **App Settings**: Application configuration and maintenance mode controls
- **Menu Links**: Dynamic navigation menu management
- **RBAC System**: Role-based access control with permissions and assignments

### Technical Features
- **Type Safety**: Full TypeScript implementation with strict type checking
- **State Management**: Redux Toolkit with RTK Query for efficient data fetching
- **API Integration**: RESTful API with mock data support for development
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Performance**: Optimized with lazy loading, memoization, and efficient re-renders
- **Accessibility**: WCAG compliant components with proper ARIA labels

## 📁 Project Structure

```
src/
├── app/                          # Next.js 14 App Router
│   ├── (guest)/                  # Public routes (login, signup, etc.)
│   ├── admin/                    # Admin dashboard routes
│   │   ├── products/            # Products management
│   │   ├── customers/           # Customers management
│   │   ├── orders/              # Orders management
│   │   ├── users/               # Users management
│   │   ├── faqs/                # FAQs management
│   │   ├── contact-us/          # Contact messages
│   │   ├── app-settings/        # App configuration
│   │   ├── app-menu-links/      # Menu management
│   │   └── rbac/                # Role-based access control
│   │       ├── roles/           # Role management
│   │       ├── permissions/     # Permission management
│   │       ├── modules/         # Module management
│   │       └── assignments/     # User-role assignments
│   └── api/                     # API routes
├── components/                   # Reusable UI components
│   ├── admin/                   # Admin-specific components
│   ├── auth/                    # Authentication components
│   ├── modules/                 # Feature-specific components
│   ├── rbac/                    # RBAC components
│   └── ui/                      # Base UI components
├── features/                    # Feature modules (Redux slices)
│   ├── products/               # Products feature
│   ├── customers/              # Customers feature
│   ├── orders/                 # Orders feature
│   ├── users/                  # Users feature
│   ├── faqs/                   # FAQs feature
│   ├── contact/                # Contact feature
│   ├── appSettings/            # App settings feature
│   ├── appMenuLinks/           # Menu links feature
│   └── rbac/                   # RBAC feature
├── hooks/                      # Custom React hooks
├── lib/                        # Utility functions and configurations
├── mocks/                      # Mock data for development
├── providers/                  # Context providers
└── store/                      # Redux store configuration
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nextjs-admin
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure your environment variables:
   ```env
   NEXT_PUBLIC_USE_MOCK=true  # Set to false for production API
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Usage Guide

### Authentication
- **Login**: Use the login form at `/login`
- **Default Credentials**: 
  - Email: `admin@example.com`
  - Password: `password`

### Admin Dashboard
After logging in, you'll have access to the admin dashboard with the following modules:

#### Products Management (`/admin/products`)
- View, create, edit, and delete products
- Search by name, description, or category
- Filter by status (Active/Hidden) and category
- Sort by ID, name, price, inventory, or status
- Export data to CSV

#### Customers Management (`/admin/customers`)
- Manage customer profiles and contact information
- Search by name, email, or phone
- Filter by status (Active/Inactive)
- Sort by various fields
- Export customer data

#### Orders Management (`/admin/orders`)
- Process and track orders
- Search by customer name or order ID
- Filter by status (Pending, Processing, Shipped, Delivered, Cancelled)
- Sort by order date, total, or status
- Export order data

#### Users Management (`/admin/users`)
- Manage admin users and their roles
- Search by name or email
- Filter by status and role
- Assign roles and permissions
- Export user data

#### FAQs Management (`/admin/faqs`)
- Create and manage frequently asked questions
- Multi-language support
- Filter by status and type (Web/User App)
- Search across question and answer content

#### Contact Messages (`/admin/contact-us`)
- View and manage contact form submissions
- Search by message content or contact information
- Sort by date or contact details

#### App Settings (`/admin/app-settings`)
- Configure application settings
- Manage maintenance mode
- Update app version and force update settings

#### Menu Links (`/admin/app-menu-links`)
- Manage navigation menu items
- Configure menu structure and permissions
- Filter by type and target audience

#### RBAC System (`/admin/rbac`)
- **Roles**: Create and manage user roles
- **Permissions**: Define granular permissions
- **Modules**: Organize permissions by modules
- **Assignments**: Assign roles to users

## 🔧 API Integration

### Mock Data (Development)
The application uses mock data by default for development. Mock data is stored in the `src/mocks/` directory and provides realistic sample data for all modules.

### Production API
To connect to a real API:

1. Set `NEXT_PUBLIC_USE_MOCK=false` in your environment variables
2. Configure your API endpoints in `src/lib/axios.ts`
3. Update API functions in `src/features/*/api.ts` files

### API Response Format
All APIs follow a consistent response format:

```typescript
interface ApiResponse<T> {
  status: boolean
  message: string
  data: T[]
  links: {
    first: string | null
    last: string | null
    prev: string | null
    next: string | null
  }
  meta: {
    current_page: number
    from: number
    last_page: number
    links: Array<{
      url: string | null
      label: string
      active: boolean
    }>
    path: string
    per_page: number
    to: number
    total: number
  }
}
```

## 🎨 Customization

### Theming
The application uses Tailwind CSS with a custom design system. To customize:

1. **Colors**: Update the color palette in `tailwind.config.js`
2. **Components**: Modify components in `src/components/ui/`
3. **Layout**: Update layouts in `src/app/admin/layout.tsx`

### Adding New Modules
To add a new admin module:

1. **Create API functions** in `src/features/[module]/[module]Api.ts`
2. **Create Redux slice** in `src/features/[module]/[module]Slice.ts`
3. **Create store exports** in `src/store/[module].ts`
4. **Create page component** in `src/app/admin/[module]/page.tsx`
5. **Add navigation** in the sidebar component

### Custom Hooks
The application includes several custom hooks:

- `useDebounce`: Debounce input values to prevent excessive API calls
- `useSmartEffect`: Prevent double execution in React Strict Mode
- `useRBAC`: Role-based access control utilities
- `useLocalStorage`: Persistent local storage with React state

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Deploy to Other Platforms
The application can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

## 📊 Performance Features

### Optimization Techniques
- **Code Splitting**: Automatic route-based code splitting
- **Lazy Loading**: Components loaded on demand
- **Memoization**: React.memo and useMemo for expensive operations
- **Debouncing**: Search input debouncing to reduce API calls
- **Pagination**: Server-side pagination for large datasets
- **Caching**: Redux state caching and API response caching

### Bundle Analysis
```bash
npm run analyze
```

## 🔒 Security Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (RBAC)
- Permission-based component rendering
- Protected routes and API endpoints

### Data Validation
- TypeScript for compile-time type checking
- Runtime validation with Zod schemas
- Input sanitization and validation
- XSS protection with proper escaping

## 🧪 Testing

### Running Tests
```bash
npm run test
```

### Test Coverage
```bash
npm run test:coverage
```

## 📝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Standards
- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Redux Toolkit](https://redux-toolkit.js.org/) - State management
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Lucide React](https://lucide.dev/) - Icons
- [Sonner](https://sonner.emilkowal.ski/) - Toast notifications

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review existing issues and discussions

---

**Built with ❤️ for developers who want to build amazing admin dashboards quickly and efficiently.**