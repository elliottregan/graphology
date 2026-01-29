import {defineConfig} from 'vitepress';

export default defineConfig({
  title: 'Graphology',
  description:
    'A robust and multipurpose Graph object for JavaScript and TypeScript',

  // Use docs as the root
  srcDir: '.',
  outDir: './.vitepress/dist',

  // Clean URLs (no .html extension)
  cleanUrls: true,

  // Ignore dead links for now (some README links need manual fixing)
  ignoreDeadLinks: true,

  // Theme configuration
  themeConfig: {
    logo: undefined,

    nav: [
      {text: 'Guide', link: '/'},
      {text: 'Standard Library', link: '/standard-library/'},
      {
        text: 'GitHub',
        link: 'https://github.com/graphology/graphology'
      }
    ],

    sidebar: {
      '/': [
        {
          text: 'Getting Started',
          items: [
            {text: 'Introduction', link: '/'},
            {text: 'Instantiation', link: '/instantiation'},
            {text: 'Properties', link: '/properties'}
          ]
        },
        {
          text: 'Core API',
          items: [
            {text: 'Mutation', link: '/mutation'},
            {text: 'Read', link: '/read'},
            {text: 'Attributes', link: '/attributes'},
            {text: 'Iteration', link: '/iteration'},
            {text: 'Serialization', link: '/serialization'},
            {text: 'Events', link: '/events'},
            {text: 'Utilities', link: '/utilities'},
            {text: 'Known Methods', link: '/known-methods'}
          ]
        },
        {
          text: 'Advanced',
          items: [
            {text: 'Design Choices', link: '/design-choices'},
            {text: 'Performance Tips', link: '/performance-tips'},
            {text: 'Implementing Graphology', link: '/implementing-graphology'}
          ]
        },
        {
          text: 'Standard Library',
          link: '/standard-library/'
        }
      ],
      '/standard-library/': [
        {
          text: 'Standard Library',
          items: [
            {text: 'Overview', link: '/standard-library/'},
            {text: 'Assertions', link: '/standard-library/assertions'},
            {text: 'Bipartite', link: '/standard-library/bipartite'},
            {text: 'Canvas', link: '/standard-library/canvas'},
            {text: 'Communities Louvain', link: '/standard-library/communities-louvain'},
            {text: 'Components', link: '/standard-library/components'},
            {text: 'Cores', link: '/standard-library/cores'},
            {text: 'DAG', link: '/standard-library/dag'},
            {text: 'Generators', link: '/standard-library/generators'},
            {text: 'GEXF', link: '/standard-library/gexf'},
            {text: 'GraphML', link: '/standard-library/graphml'},
            {text: 'Indices', link: '/standard-library/indices'},
            {text: 'Layout', link: '/standard-library/layout'},
            {text: 'Layout Force', link: '/standard-library/layout-force'},
            {text: 'Layout ForceAtlas2', link: '/standard-library/layout-forceatlas2'},
            {text: 'Layout Noverlap', link: '/standard-library/layout-noverlap'},
            {text: 'Metrics', link: '/standard-library/metrics'},
            {text: 'Operators', link: '/standard-library/operators'},
            {text: 'Shortest Path', link: '/standard-library/shortest-path'},
            {text: 'Simple Path', link: '/standard-library/simple-path'},
            {text: 'SVG', link: '/standard-library/svg'},
            {text: 'Traversal', link: '/standard-library/traversal'},
            {text: 'Utils', link: '/standard-library/utils'}
          ]
        }
      ]
    },

    socialLinks: [
      {icon: 'github', link: 'https://github.com/graphology/graphology'}
    ],

    search: {
      provider: 'local'
    },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2016-present Guillaume Plique & contributors'
    },

    editLink: {
      pattern:
        'https://github.com/graphology/graphology/edit/master/docs/:path',
      text: 'Edit this page on GitHub'
    }
  },

  // Markdown configuration
  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    }
  },

  // Head tags
  head: [
    ['link', {rel: 'icon', type: 'image/svg+xml', href: '/logo.svg'}],
    ['meta', {name: 'theme-color', content: '#3eaf7c'}]
  ]
});
