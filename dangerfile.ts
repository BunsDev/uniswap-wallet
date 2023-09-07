import { danger, fail, markdown, message, warn } from 'danger'

// Other ideas:
//  - verify TODO have work items linked

function getIndicesOf(searchStr: string, str: string): number[] {
  var searchStrLen = searchStr.length;
  if (searchStrLen == 0) {
      return [];
  }
  var startIndex = 0, index, indices: number[] = [];
  while ((index = str.indexOf(searchStr, startIndex)) > -1) {
      indices.push(index);
      startIndex = index + searchStrLen;
  }
  return indices;
}

async function processAddChanges() {
  const updatedTsFiles = danger.git.modified_files
  .concat(danger.git.created_files)
  .filter((file) => (file.endsWith('.ts') || file.endsWith('.tsx')) && !file.includes('dangerfile.ts'))

  const addChanges = (await Promise.all(updatedTsFiles.flatMap(async (file) => {
    const structuredDiff = await danger.git.structuredDiffForFile(file);

    return (structuredDiff?.chunks || []).flatMap((chunk) => {
      return chunk.changes.filter((change) => change.type === 'add')
    })
  }))).flatMap((x) => x)

  // Checks for any logging and reminds the developer not to log sensitive data
  if (addChanges.some((change) => change.content.includes('logMessage') || change.content.includes('logger.'))) {
    warn('You are logging data. Please confirm that nothing sensitive is being logged!')
  }

  // Check for UI package imports that are longer than needed
  const validLongerImports = ['ui/src', 'ui/src/theme', 'ui/src/loading', 'ui/src/theme/restyle']
  const longestImportLength = Math.max(...validLongerImports.map((i) => i.length))
  addChanges.forEach((change) => {
    const indices = getIndicesOf(`from 'ui/src/`, change.content)

    indices.forEach((idx) => {
      const potentialSubstring = change.content.substring(idx, Math.min(change.content.length, idx + longestImportLength + 6 + 1))
      if (!validLongerImports.some((validImport) => potentialSubstring.includes(validImport))) {
        const endOfImport = change.content.indexOf(`'`, idx + 6) // skipping the "from '"
        warn(`It looks like you have a longer import from ui/src than needed (${change.content.substring(idx + 6, endOfImport)}). Please use one of [${validLongerImports.join(', ')}] when possible!`)
      }
    })
  })
}

/* Warn about storing credentials in GH and uploading env.local to 1Password */
const envChanged = danger.git.modified_files.includes('.env.defaults')
if (envChanged) {
  warn(
    'Changes were made to .env.defaults. Confirm that no sensitive data is in the .env.defaults file. Sensitive data must go in .env (web) or .env.defaults.local (mobile) and then run `yarn upload-env-local` to store it in 1Password.'
  )
}

// Run checks on added changes
processAddChanges()

// Stories for new components
const createdComponents = danger.git.created_files.filter(
  (f) =>
    f.includes('components/buttons') ||
    f.includes('components/input') ||
    f.includes('components/layout/') ||
    f.includes('components/text')
)
const hasCreatedComponent = createdComponents.length > 0
const createdStories = createdComponents.filter((filepath) => filepath.includes('stories/'))
const hasCreatedStories = createdStories.length > 0
if (hasCreatedComponent && !hasCreatedStories) {
  warn(
    'There are new primitive components, but not stories. Consider documenting the new component with Storybook'
  )
}

// Warn when there is a big PR
const bigPRThreshold = 500
if (danger.github.pr.additions + danger.github.pr.deletions > bigPRThreshold) {
  warn(':exclamation: Big PR')
  markdown(
    '> Pull Request size seems relatively large. If PR contains multiple changes, split each into separate PRs for faster, easier reviews.'
  )
}

// No PR is too small to warrant a paragraph or two of summary
if (danger.github.pr.body.length < 50) {
  warn(
    'The PR description is looking sparse. Please consider explaining more about this PRs goal and implementation decisions.'
  )
}

// Congratulate when code was deleted
if (danger.github.pr.additions < danger.github.pr.deletions) {
  message(
    `✂️ Thanks for removing  ${danger.github.pr.deletions - danger.github.pr.additions} lines!`
  )
}

const stories = danger.git.fileMatch('**/*stories*')
if (stories.edited) {
  message('🙌 Thanks for keeping stories up to date!')
}

// Migrations + schema warnings
const updatedSchemaFile = danger.git.modified_files.find((file) =>
  file.includes('src/app/schema.ts')
)

const updatedMigrationsFile = danger.git.modified_files.find((file) =>
  file.includes('src/app/migrations.ts')
)

const updatedMigrationsTestFile = danger.git.modified_files.find((file) =>
  file.includes('src/app/migrations.test.ts')
)

const createdSliceFile = danger.git.created_files.find((file) =>
  file.toLowerCase().includes('slice')
)

const modifiedSliceFile = danger.git.modified_files.find((file) =>
  file.toLowerCase().includes('slice')
)

const deletedSliceFile = danger.git.deleted_files.find((file) =>
  file.toLowerCase().includes('slice')
)

if (modifiedSliceFile && (!updatedSchemaFile || !updatedMigrationsFile)) {
  warn(
    'You modified a slice file. If you added, renamed, or deleted required properties from state, then make sure to define a new schema and a create a migration.'
  )
}

if (updatedSchemaFile && !updatedMigrationsFile) {
  warn(
    'You updated the schema file but not the migrations file. Make sure to also define a migration.'
  )
}

if (!updatedSchemaFile && updatedMigrationsFile) {
  warn(
    'You updated the migrations file but not the schema. Schema always needs to be updated when a new migration is defined.'
  )
}

if (createdSliceFile && (!updatedMigrationsFile || !updatedSchemaFile)) {
  fail(
    'You created a new slice file. Please write a migration, update initialState in the `migrations.test.ts` file, and create a new schema.'
  )
}

if (deletedSliceFile && (!updatedSchemaFile || !updatedMigrationsFile)) {
  fail('You deleted a slice file. Make sure to define a new schema and and create a migration.')
}

if (updatedMigrationsFile && !updatedMigrationsTestFile) {
  fail(
    'You updated the migrations file but did not write any new tests. Each migration must have a test!'
  )
}
