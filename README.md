# Kanban Board Component

## Live Storybook
[Deployed Storybook URL]

## Installation
```bash path=null start=null
npm install
npm run storybook
```

## Architecture
- React + TypeScript + Vite. Strict TS enabled (noImplicitAny, strictNullChecks, noUnusedLocals/Parameters).
- Tailwind CSS tokens in tailwind.config.js; utility-first styles with focus-visible and snap scrolling.
- Components: KanbanBoard, KanbanColumn, KanbanCard; primitives (Button, Modal, Avatar); hooks (useKanbanBoard, useDragAndDrop); utils (task/column helpers).
- State: useKanbanBoard manages columns/tasks, exposes onTaskMove/onTaskCreate/onTaskUpdate/onTaskDelete. HTML5 DnD (mouse) + keyboard drag.
- Performance: memoizable components, simple virtualization inside columns, lazy modal.
- Accessibility: ARIA roles/labels; keyboard navigation (Tab, Shift+Tab, Space/Enter, Escape, Arrow keys, Home/End).

## Features
- [x] Drag-and-drop tasks (mouse + keyboard)
- [x] Task creation/editing (modal with priority, status, assignee, tags, due date)
- [x] Responsive design (mobile stacked, tablet 2-col, desktop horizontal)
- [x] Keyboard accessibility and focus management
- [x] Search and filters (priority, assignee, tag)
- [x] Bulk select + bulk move/delete; quick actions (edit/duplicate/delete)
- [x] Column menu (rename, WIP), collapse/expand, WIP indicators

## Storybook Stories
- Default board
- Empty state
- Large dataset
- Mobile view
- Interactive playground

## Run Dev App
```bash path=null start=null
npm run dev
```

## Technologies
- React 19 + TypeScript 5
- Vite 7
- Tailwind CSS 3.x
- Storybook 9 (Vite builder)

## Contact
[Your email]

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
