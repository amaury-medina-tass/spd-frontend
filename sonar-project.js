const scanner = require('sonarqube-scanner').default;

scanner({
  serverUrl: 'http://localhost:9000',
  options: {
    'sonar.projectKey': 'spd-frontend-key',
    'sonar.projectName': 'SPD Frontend',
    'sonar.token': 'sqp_9dd631d703028776e58458568567ed47a68d7fe5',
    'sonar.sources': 'src',
    'sonar.tests': 'src',
    'sonar.test.inclusions': 'src/**/*.test.ts,src/**/*.test.tsx,src/**/*.spec.ts,src/**/*.spec.tsx',
    'sonar.typescript.tsconfigPath': 'tsconfig.json',
    'sonar.javascript.lcov.reportPaths': 'coverage/lcov.info',

    'sonar.exclusions': [
      '**/node_modules/**',
      '**/.next/**',
      '**/dist/**',
      '**/coverage/**',
      '**/public/**',
      '**/data/**',
      '**/*.css',
      '**/*.config.ts',
      '**/*.config.mjs',
      '**/types/**',
    ].join(','),
  }
}, () => process.exit());
