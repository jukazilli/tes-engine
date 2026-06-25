export default {
  '*.{ts,tsx,js,jsx,mjs,cjs}': ['eslint --fix --max-warnings=0', 'prettier --write'],
  '*.md': ['prettier --write', 'markdownlint-cli2'],
  '*.{html,scss,css,json,yml,yaml}': ['prettier --write'],
};
