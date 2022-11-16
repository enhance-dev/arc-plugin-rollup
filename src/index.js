const { join } = require('path')
const { readdir } = require('fs/promises')
const { existsSync } = require('fs')
const { rollup } = require('rollup')
const resolve = require('@rollup/plugin-node-resolve')

async function build(inv) {
  const cwd = inv._project.cwd
  const browserDir = join(
    cwd,
    'app',
    'browser'
  )

  if (existsSync(browserDir)) {
    const files = await readdir(browserDir)
    for (let file of files) {
      const inFile = join(
        cwd,
        'app',
        'browser',
        file
      )

      const outFile = join(
        cwd,
        inv.static?.folder || 'public',
        'pages',
        file
      )

      const bundle = await rollup({
        input: inFile,
        plugins: [resolve()]
      })

      await bundle.write({
        file: outFile,
        format: 'es'
      })
    }
  }
}

module.exports = {
  sandbox: {
    async start({ inventory }) {
      await build(inventory.inv)
    },

    async watcher ({ filename, inventory }) {
      if (filename.indexOf('/app/browser/') > -1 ||
          filename.indexOf('/app/pages/') > -1 ||
          filename.indexOf('/app/elements/') > -1) {
        await build(inventory.inv)
      }
    }
  },
  deploy: {
    async start ({ cloudformation, inventory }) {
      await build(inventory.inv)
      return cloudformation
    }
  }
}
