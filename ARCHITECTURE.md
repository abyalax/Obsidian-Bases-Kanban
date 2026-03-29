# Obsidian Bases Kanban Plugin - Architecture Overview

## High-Level Architecture

This plugin adds a kanban board view to Obsidian Bases, allowing users to visualize and interact with their data in a drag-and-drop card interface. The architecture follows Obsidian's plugin patterns with clear separation of concerns.

## Core Components

### 1. Plugin Entry Point (`main.ts`)

- **Purpose**: Plugin lifecycle management and registration
- **Responsibilities**:
  - Loads legacy data migration
  - Registers the kanban view type with Obsidian's Bases system
  - Handles plugin initialization and cleanup

### 2. Kanban View (`kanbanView.ts`)

- **Purpose**: Main view implementation extending `BasesView`
- **Key Features**:
  - Drag-and-drop card/column reordering using Sortable.js
  - Property-based grouping and filtering
  - State persistence using BasesViewConfig API
  - Interactive UI with color customization
- **Architecture Patterns**:
  - Debounced rendering for performance
  - In-memory state management to avoid config feedback loops
  - Patch-based DOM updates for efficient re-rendering

### 3. Constants (`constants.ts`)

- **Purpose**: Centralized configuration and styling
- **Contains**:
  - CSS class names with `.obk-` prefix
  - Color palette definitions
  - Data attribute names
  - Configuration constants

### 4. Utilities (`utils/`)

#### Grouping Logic (`grouping.ts`)

- **Functions**:
  - `ensureGroupExists()`: Map management for column groups
  - `normalizePropertyValue()`: Property value normalization with uncategorized handling

#### Property Formatters (`propertyFormatters.ts`)

- **Functions**:
  - `formatTags()`: Tag parsing and rendering
  - `formatDateIndonesian()`: Localized date formatting
  - `getTagColor()`: Dynamic color assignment for tags

#### Performance (`debounce.ts`)

- **Functions**:
  - `debounce()`: Generic debouncing utility with cancellation support

## Data Flow Architecture

### 1. Data Sources

```
Obsidian Bases → KanbanView → DOM Rendering
     ↓              ↓
Config Storage ← State Management ← User Interactions
```

### 2. State Management

- **In-memory preferences** (`_prefs`): Single source of truth during session
- **Config persistence**: Only on explicit user actions (drag-drop, color changes)
- **Legacy migration**: Seamless upgrade from old plugin.data.json format

### 3. Rendering Pipeline

1. **Data Update**: `onDataUpdated()` triggers debounced render
2. **Grouping**: Entries grouped by selected property
3. **Ordering**: Apply saved column/card orders
4. **DOM Updates**: Full rebuild or patch-based updates
5. **Interactive Setup**: Sortable.js initialization

## Key Architectural Decisions

### 1. BasesViewConfig vs Plugin.saveData

- **Choice**: Use BasesViewConfig for state persistence
- **Rationale**: Each .base file maintains independent state, avoiding shared configuration across bases

### 2. Debounced Rendering

- **Implementation**: 50ms debounce on data updates
- **Purpose**: Prevent excessive re-renders during rapid data changes

### 3. Patch-Based DOM Updates

- **Strategy**: Incremental DOM patches vs full rebuilds
- **Benefit**: Maintains Sortable.js state and improves performance

### 4. CSS Class Prefixing

- **Standard**: `.obk-` prefix for all custom classes
- **Purpose**: Prevent conflicts with other plugins and themes

## Performance Optimizations

### 1. Efficient Lookups

- Entry path → entry mapping (`_entryMap`)
- Column value → DOM element mapping

### 2. Selective Re-rendering

- Only rebuild when property changes or order changes
- Patch updates for data changes within same structure

### 3. Drag State Management

- Disable DOM reordering during active drags
- Prevent visual thrashing with Sortable.js

## Extension Points

### 1. Property Formatters

- Modular system for custom property rendering
- Easy to add new formatters for different data types

### 2. Color System

- Extensible color palette using CSS variables
- Consistent with Obsidian design system

### 3. Grouping Logic

- Pluggable grouping strategies
- Support for custom property normalization

## Dependencies

### External Libraries

- **Sortable.js**: Drag-and-drop functionality
- **Obsidian API**: Core plugin framework and Bases integration

### Internal Dependencies

- Clean module boundaries with minimal coupling
- Utility functions for reusable logic

## File Structure Summary

```
src/
├── main.ts              # Plugin entry point and registration
├── kanbanView.ts        # Main view implementation (core logic)
├── constants.ts         # CSS classes, colors, and configuration
└── utils/
    ├── debounce.ts      # Performance utilities
    ├── grouping.ts      # Data grouping logic
    └── propertyFormatters.ts  # UI formatting helpers
```

This architecture prioritizes performance, maintainability, and seamless integration with Obsidian's Bases system while providing a rich, interactive kanban experience.
