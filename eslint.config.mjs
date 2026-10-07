import pluginSecurity from "eslint-plugin-security";

export default [
  pluginSecurity.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
  },
];
