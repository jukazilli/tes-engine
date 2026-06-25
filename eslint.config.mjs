import nx from '@nx/eslint-plugin';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: ['**/dist', '**/out-tsc'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints: [
            {
              sourceTag: 'scope:frontend',
              onlyDependOnLibsWithTags: ['scope:frontend', 'scope:shared'],
            },
            {
              sourceTag: 'scope:backend',
              onlyDependOnLibsWithTags: ['scope:backend', 'scope:shared', 'scope:engine'],
            },
            {
              sourceTag: 'scope:engine',
              onlyDependOnLibsWithTags: ['scope:engine', 'scope:shared'],
            },
            {
              sourceTag: 'scope:shared',
              onlyDependOnLibsWithTags: ['scope:shared'],
            },
            {
              sourceTag: 'type:contracts',
              onlyDependOnLibsWithTags: ['type:contracts', 'type:domain', 'type:testing'],
            },
            {
              sourceTag: 'type:ui',
              notDependOnLibsWithTags: ['type:app'],
            },
            {
              sourceTag: 'type:util',
              notDependOnLibsWithTags: ['type:app', 'type:ui'],
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
    // Override or add rules here
    rules: {},
  },
  {
    files: ['libs/shared/**/*.ts', 'libs/engines/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@angular/*', '@po-ui/*', '@nestjs/*'],
              message:
                'Bibliotecas agnosticas e engines nao podem depender de Angular, PO UI ou NestJS.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['apps/web/**/*.ts', 'libs/frontend/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            'fs',
            'path',
            'crypto',
            'http',
            'https',
            'stream',
            'child_process',
            'process',
            'os',
          ],
          patterns: [
            {
              group: ['node:*'],
              message: 'Projetos browser nao podem importar APIs exclusivas de Node.js.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['apps/api/**/*.ts', 'apps/worker/**/*.ts', 'libs/backend/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@po-ui/*'],
              message: 'Projetos Node.js nao podem depender de PO UI.',
            },
          ],
        },
      ],
    },
  },
];
