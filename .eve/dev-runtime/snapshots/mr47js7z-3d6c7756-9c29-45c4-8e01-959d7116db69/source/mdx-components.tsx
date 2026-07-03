import type { MDXComponents } from 'mdx/types'

// Essays live in app/essays/<slug>/page.mdx and render inside this wrapper.
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    wrapper: ({ children }) => <article className="prose-ai mx-auto py-12">{children}</article>,
    ...components,
  }
}
