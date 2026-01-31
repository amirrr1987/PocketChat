---
description: Use Vant for UI components in the frontend
globs: src/**/*.vue
alwaysApply: false
---

# Use Vant for UI

Prefer **Vant** components over custom HTML + Tailwind for forms, lists, navigation, and feedback in Vue views and components.

## When to use Vant

- **Forms**: `van-field`, `van-form`, `van-button` for inputs and submit
- **Lists**: `van-cell`, `van-cell-group`, `van-list` for chat lists, contacts, settings
- **Navigation**: `van-nav-bar`, `van-tabbar` for headers and bottom nav
- **Feedback**: `van-toast`, `van-dialog`, `van-loading` for loading and messages
- **Other**: `van-image`, `van-swipe-cell`, `van-popup` where they fit

## Usage

- Import only the components you use (tree-shake):  
  `import { Button, Field, NavBar } from 'vant'`
- Or use the full import already in `main.ts` and reference components by name (e.g. `<van-button>`).
- Keep existing Tailwind for layout (flex, grid, spacing, colors) and for one-off styling; use Vant for the actual interactive components.

## Example

```vue
<template>
  <Form @submit="onSubmit">
    <CellGroup inset>
      <Field
        v-model="email"
        name="email"
        label="Email"
        type="email"
        placeholder="you@example.com"
        :rules="[{ required: true }]"
      />
      <Field
        v-model="password"
        name="password"
        label="Password"
        type="password"
        placeholder="••••••••"
        :rules="[{ required: true }]"
      />
    </CellGroup>
    <div class="p-4">
      <Button block type="primary" native-type="submit">Sign in</Button>
    </div>
  </Form>
</template>
<script setup lang="ts">
import { Form, CellGroup, Field ,Button} from 'vant'
</script>
```
