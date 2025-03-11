module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // New feature
        'fix', // Bug fix
        'improve', // Code improvement
        'refactor', // Code refactoring
        'docs', // Documentation
        'chore', // Small change in development process
        'style', // Fix typo, formatting, no logic change
        'test', // Test code
        'revert', // Revert previous commit
        'ci', // CI/CD configuration change
        'build', // Build file change
      ],
    ],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    // 'scope-empty': [2, 'never'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 72],
  },
};
