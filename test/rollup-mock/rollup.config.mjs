import commonjs from "@rollup/plugin-commonjs";

export default {
  output: {
    intro: "Hello Rollup!"
  },
  plugins: [commonjs()] // This plugin should be included
};