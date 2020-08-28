module.exports =  {
    plugins: ["@typescript-eslint", "jest"],
    parser:  "@typescript-eslint/parser",
    extends:  [
        "plugin:@typescript-eslint/recommended",
        "plugin:jest/recommended",
    ],
    parserOptions:  {
        ecmaVersion:  2019,
        sourceType:  'module',
    },
    rules: {
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/explicit-member-accessibility": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/no-parameter-properties": "off",
        "@typescript-eslint/interface-name-prefix": "off",
        "@typescript-eslint/no-explicit-any": ["off"],
        "jest/no-disabled-tests": "warn",
        "jest/no-focused-tests": "error",
        "jest/no-identical-title": "error",
        "jest/prefer-to-have-length": "warn",
        "jest/valid-expect": "error"
    },
};
