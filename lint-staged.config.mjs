export default {
  '*.{ts,tsx,js,jsx,mjs,cjs}': ['eslint --fix --max-warnings=0', 'prettier --write'],
  '*.{html,scss,css,json,md,yml,yaml}': ['prettier --write'],
};
