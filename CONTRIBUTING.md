# Contributing to DegenScore

First off, thank you for considering contributing to DegenScore! It's people like you that make DegenScore such a great tool.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Code Standards](#code-standards)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Enhancements](#suggesting-enhancements)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- npm or yarn
- Git
- Solana Wallet (for testing)
- Helius API Key ([Free tier](https://helius.dev))

### Setting Up Development Environment

1. **Fork the repository**
   ```bash
   # Click 'Fork' on GitHub, then:
   git clone https://github.com/YOUR_USERNAME/DegenScore-Card.git
   cd DegenScore-Card
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your credentials
   ```

4. **Generate Prisma client**
   ```bash
   npx prisma generate
   ```

5. **Run development server**
   ```bash
   npm run dev
   # Open http://localhost:3000
   ```

## 🔄 Development Process

### Branching Strategy

- `main` - Production-ready code
- `develop` - Development branch
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Emergency fixes

### Workflow

1. Create a new branch from `develop`
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. Make your changes

3. Write/update tests

4. Run tests and linting
   ```bash
   npm test
   npm run lint
   ```

5. Commit your changes (see [Commit Messages](#commit-messages))

6. Push to your fork
   ```bash
   git push origin feature/your-feature-name
   ```

7. Open a Pull Request

## 💻 Code Standards

### TypeScript

- **Strict mode enabled** - All code must pass TypeScript strict checks
- Use **explicit types** - Avoid `any` unless absolutely necessary
- **Interfaces over types** for object shapes
- Use **enum** for constants with multiple values

### Code Style

- **Prettier** for formatting (auto-format on save)
- **ESLint** for linting
- **4 spaces** for indentation (automatic via Prettier)
- **120 character** line limit

### File Naming

- Components: `PascalCase.tsx` (e.g., `DegenCard.tsx`)
- Utilities: `camelCase.ts` (e.g., `metricsEngine.ts`)
- API routes: `kebab-case.ts` (e.g., `verify-payment.ts`)
- Tests: `*.test.ts` or `*.test.tsx`

### Import Order

```typescript
// 1. External packages
import { NextPage } from 'next';
import React from 'react';

// 2. Internal utilities
import { logger } from '@/lib/logger';
import { calculateMetrics } from '@/lib/metricsEngine';

// 3. Components
import DegenCard from '@/components/DegenCard';

// 4. Types
import type { WalletMetrics } from '@/lib/metricsEngine';

// 5. Styles
import styles from './styles.module.css';
```

### Logging

**Do NOT use `console.log` in production code.** Use the logger:

```typescript
import { logger } from '@/lib/logger';

// Development only
logger.debug('Debugging info', { userId: 123 });

// Production and development
logger.info('User logged in', { walletAddress });

// Warnings
logger.warn('Rate limit approaching', { requests: 95 });

// Errors (automatically sent to Sentry)
logger.error('Payment failed', error, { walletAddress });
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- __tests__/lib/metricsEngine.test.ts
```

### Writing Tests

- **Minimum 70% coverage** required
- Test file must be in `__tests__/` directory
- Follow the Arrange-Act-Assert (AAA) pattern

Example:

```typescript
describe('calculateDegenScore', () => {
  it('should return score between 0-100', () => {
    // Arrange
    const metrics = {
      profitLoss: 10,
      winRate: 70,
      moonshots: 2,
    };

    // Act
    const score = calculateDegenScore(metrics);

    // Assert
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});
```

### Test Coverage Requirements

- **Lines**: 70%+
- **Functions**: 70%+
- **Branches**: 70%+
- **Statements**: 70%+

## 📝 Submitting Changes

### Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(metrics): add moonshot detection algorithm

Implemented 100x+ gain detection for position tracking.
Uses FIFO accounting to calculate profit percentage.

Closes #123
```

```
fix(api): prevent payment verification exploit

Added sender verification to ensure wallet actually sent SOL.
Added balance change validation.

Fixes #456
```

### Pull Request Process

1. **Update documentation** if needed
2. **Add tests** for new features
3. **Ensure all tests pass** (`npm test`)
4. **Update CHANGELOG.md** with your changes
5. **Request review** from at least one maintainer
6. **Address feedback** promptly
7. **Squash commits** before merging (if requested)

### PR Title Format

```
[TYPE] Brief description (max 50 chars)
```

Examples:
- `[FEAT] Add multi-level referral system`
- `[FIX] Resolve rate limiting race condition`
- `[DOCS] Update API documentation`

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing completed
- [ ] Coverage threshold met (70%+)

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings introduced
- [ ] Tests pass locally
- [ ] Dependent changes merged

## Screenshots (if applicable)

## Related Issues
Closes #123
Related to #456
```

## 🐛 Reporting Bugs

### Before Submitting

1. **Check existing issues** - Your bug may already be reported
2. **Try latest version** - Bug might be fixed
3. **Reproduce consistently** - Provide clear steps

### Bug Report Template

```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., macOS 14.0]
- Browser: [e.g., Chrome 120]
- Node Version: [e.g., 18.17.0]
- DegenScore Version: [e.g., 0.2.0]

## Screenshots
If applicable

## Additional Context
Any other relevant information
```

## 💡 Suggesting Enhancements

### Feature Request Template

```markdown
## Feature Description
Clear description of the proposed feature

## Problem It Solves
What problem does this solve?

## Proposed Solution
How would this work?

## Alternatives Considered
Other approaches you've considered

## Additional Context
Any mockups, examples, or references
```

## 🏗️ Architecture Guidelines

### Smart Contracts (Solana/Anchor)

- Use Anchor framework for all programs
- Include comprehensive tests
- Document all instructions
- Implement pause mechanism for emergencies
- Consider upgrade paths

### API Endpoints

- Use Next.js API routes
- Implement rate limiting
- Validate all inputs with Zod
- Return consistent error format
- Log all requests

### Database

- Use Prisma ORM
- Write migrations for schema changes
- Add indices for performance
- Use transactions for atomic operations

### Frontend Components

- Use React hooks
- Implement error boundaries
- Add loading states
- Make components reusable
- Document complex components

## 📚 Additional Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Anchor Documentation](https://www.anchor-lang.com/)
- [Solana Cookbook](https://solanacookbook.com/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)

## 🤝 Community

- **Discord**: [discord.gg/degenscore](https://discord.gg/degenscore)
- **Twitter**: [@DegenScore](https://twitter.com/DegenScore)
- **Email**: hello@degenscore.com

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to DegenScore! 🚀
