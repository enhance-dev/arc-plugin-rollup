module.exports = (msg) => console.log(msg)

/*
  The success of this CJS being imported and used is implicitly a passed test.

  Because this does not export a default it would fail during build time
  with the following error message:

    RollupError: "default" is not exported by "test/rollup-mock/app/browser/no-default-export.js", 
      imported by "test/rollup-mock/app/browser/index.mjs".

  Being able to add the Rollup CommonJS plugin fixes this issue. 
  See: https://github.com/rollup/plugins/tree/master/packages/commonjs
*/