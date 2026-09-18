const { defineConfig, globalIgnores } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier/flat');

/** Couches où l'accès direct à Supabase est INTERDIT : seul `src/services` (et `src/lib`) parle au backend. */
const NO_DIRECT_BACKEND = [
  'app/**/*.{ts,tsx}',
  'src/components/**/*.{ts,tsx}',
  'src/hooks/**/*.{ts,tsx}',
  'src/stores/**/*.{ts,tsx}',
  'src/design-system/**/*.{ts,tsx}',
  'src/i18n/**/*.{ts,tsx}',
];

module.exports = defineConfig([
  globalIgnores([
    'node_modules/**',
    'dist/**',
    '.expo/**',
    'coverage/**',
    'ios/**',
    'android/**',
    'docs/**', // spécifications LOCKED
    'supabase/**', // SQL + Edge Functions Deno (hors périmètre ESLint Expo)
    'backoffice/**', // application web séparée
    'e2e/**',
    'scripts/**',
  ]),
  expoConfig,
  prettierConfig,
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'always'],
    },
  },
  {
    // Règle d'architecture (Blueprint §2, §21) : aucun composant React n'appelle Supabase directement.
    files: NO_DIRECT_BACKEND,
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@supabase/*', '@/lib/supabase', '@/lib/supabase/*', '**/lib/supabase'],
              message:
                'Aucun accès direct à Supabase hors de src/services : passer par un service typé.',
              allowTypeImports: true,
            },
            {
              group: ['@/services/moderation.service', '**/moderation.service'],
              message:
                'moderation.service est réservé au backoffice : jamais importé par l’app mobile.',
            },
          ],
        },
      ],
    },
  },
  {
    // RTL prêt dès le premier écran (Blueprint produit §5) : `start`/`end`, jamais `left`/`right`.
    files: ['app/**/*.{ts,tsx}', 'src/components/**/*.{ts,tsx}', 'src/design-system/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector:
            'Property[key.name=/^(left|right|(margin|padding)(Left|Right)|border(Left|Right).*|border(Top|Bottom)(Left|Right)Radius)$/]',
          message:
            'Utiliser les propriétés logiques (start/end, marginStart, paddingEnd, borderTopStartRadius…) pour le RTL.',
        },
      ],
    },
  },
  {
    // Zéro chaîne en dur dans les composants (Blueprint produit §5) : tout texte visible passe par `t('clé')`.
    files: ['app/**/*.{ts,tsx}', 'src/components/**/*.{ts,tsx}'],
    ignores: ['**/*.test.tsx'],
    rules: {
      'react/jsx-no-literals': [
        'error',
        { noStrings: false, allowedStrings: [], ignoreProps: true },
      ],
      'no-restricted-properties': [
        'error',
        { object: 'console', property: 'log', message: 'Pas de console.log dans les composants.' },
      ],
    },
  },
]);
