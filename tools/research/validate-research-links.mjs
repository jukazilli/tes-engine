import { validateResearchRoot } from './validate-research-registry.mjs';

const result = await validateResearchRoot(process.cwd());

if (!result.ok) {
  console.error(result.errors.join('\n'));
  process.exit(1);
}

const sources = [...result.records.source.values()];
const invalidUrls = sources.filter((source) => source.url && !/^https?:\/\//.test(source.url));

if (invalidUrls.length > 0) {
  console.error(
    invalidUrls.map((source) => `${source.__file}: invalid URL ${source.url}`).join('\n'),
  );
  process.exit(1);
}

if (process.env.RESEARCH_LINKS_ONLINE === 'true') {
  const failures = [];
  for (const source of sources.filter((item) => item.url)) {
    try {
      const response = await fetch(source.url, { method: 'HEAD', redirect: 'follow' });
      if (response.status >= 400) {
        failures.push(`${source.__file}: ${source.url} returned ${response.status}`);
      }
    } catch (error) {
      failures.push(`${source.__file}: ${source.url} failed with ${error.message}`);
    }
  }
  if (failures.length > 0) {
    console.error(failures.join('\n'));
    process.exit(1);
  }
  console.log(
    `Research online link validation passed (${sources.filter((source) => source.url).length} URLs).`,
  );
} else {
  console.log(
    `Research link validation passed in offline mode (${sources.filter((source) => source.url).length} URLs checked structurally).`,
  );
}
