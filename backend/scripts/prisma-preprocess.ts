import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';

const ROOT_DIR = path.join(__dirname, '..');
const PRISMA_CLIENT_DIR = path.join(ROOT_DIR, 'src', 'shared', 'prisma-client');
const PARTIALS_DIR = path.join(PRISMA_CLIENT_DIR, 'partials');
const TEMPLATE_FILE = path.join(PRISMA_CLIENT_DIR, 'schema.template.prisma');
const GENERATED_DIR = path.join(PRISMA_CLIENT_DIR, 'generated');
const OUTPUT_FILE = path.join(GENERATED_DIR, 'schema.prisma');
const MODULES_PATTERN = 'src/modules/**/infrastructure/persistence/*.prisma';

function loadPartials(): Map<string, string> {
  const partials = new Map<string, string>();

  if (!fs.existsSync(PARTIALS_DIR)) {
    return partials;
  }

  const files = fs.readdirSync(PARTIALS_DIR);
  for (const file of files) {
    if (file.endsWith('.prisma')) {
      const name = path.basename(file, '.prisma');
      const content = fs.readFileSync(path.join(PARTIALS_DIR, file), 'utf-8');
      partials.set(name, content.trimEnd());
    }
  }

  return partials;
}

function loadModuleSchemas(): string[] {
  const pattern = path.join(ROOT_DIR, MODULES_PATTERN);
  const files = glob.sync(pattern);

  return files.map((file) => {
    const content = fs.readFileSync(file, 'utf-8');
    const relativePath = path.relative(ROOT_DIR, file);
    return `// From: ${relativePath}\n${content}`;
  });
}

function expandPartials(content: string, partials: Map<string, string>): string {
  const spreadPattern = /^(\s*)\.\.\.(\w+)\s*$/gm;

  return content.replace(spreadPattern, (match, indent: string, partialName: string) => {
    const partial = partials.get(partialName);
    if (!partial) {
      console.warn(`Warning: Partial "${partialName}" not found`);
      return match;
    }
    return partial
      .split('\n')
      .map((line) => (line.trim() ? indent + line.trimStart() : line))
      .join('\n');
  });
}

function main(): void {
  if (!fs.existsSync(TEMPLATE_FILE)) {
    console.error(`Template file not found: ${TEMPLATE_FILE}`);
    process.exit(1);
  }

  // Ensure generated directory exists
  if (!fs.existsSync(GENERATED_DIR)) {
    fs.mkdirSync(GENERATED_DIR, { recursive: true });
  }

  const partials = loadPartials();
  console.log(`Loaded ${partials.size} partial(s): ${[...partials.keys()].join(', ') || '(none)'}`);

  const baseTemplate = fs.readFileSync(TEMPLATE_FILE, 'utf-8');
  const moduleSchemas = loadModuleSchemas();
  console.log(`Found ${moduleSchemas.length} module schema(s)`);

  const combinedSchema = [baseTemplate, ...moduleSchemas].join('\n\n');
  const output = expandPartials(combinedSchema, partials);

  const header = `// ⚠️  AUTO-GENERATED FILE - DO NOT EDIT DIRECTLY
// This file is generated from:
//   - src/shared/prisma-client/schema.template.prisma (base config)
//   - src/modules/**/infrastructure/persistence/*.prisma (module schemas)
// Run: pnpm prisma:generate

`;

  fs.writeFileSync(OUTPUT_FILE, header + output);
  console.log(`Generated: ${OUTPUT_FILE}`);
}

main();
