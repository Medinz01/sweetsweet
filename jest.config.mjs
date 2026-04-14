import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
/** @type {import('jest').Config} */
const config = {
  // Add more setup options before each test is run
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'node', // Changed from jsdom as most logic is backend/API
  transformIgnorePatterns: [
    '/node_modules/(?!(jose|uuid|sequelize)/)', // Allow these modules to be transformed
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.d.ts',
    '!src/**/index.js',
    '!src/**/layout.js', // Exclude layout wrappers
  ],
  reporters: [
    'default',
    ['jest-html-reporter', {
      pageTitle: 'Marketplace Test Report',
      outputPath: `./test-reports/${process.env.JEST_REPORT_NAME || 'test-report'}.html`,
      includeFailureMsg: true,
      includeConsoleLog: true,
      statusIgnoreFilter: 'pending',
    }]
  ]
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config)
