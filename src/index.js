const { join } = require('path')
const { readdir } = require('fs/promises')
const { existsSync } = require('fs')
const { rollup } = require('rollup')
const { loadConfigFile } = require('rollup/loadConfigFile');
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
        'browser',
        file
      )

      const rollupFile = join(cwd, 'rollup.config.mjs')
      if(existsSync(rollupFile)) {
        await externalRollup(rollupFile, inFile, outFile);
      } else {
        await internalRollup(inFile, outFile);
      }
    }
  }
}

const internalRollup = async (inFile, outFile) => {
  const bundle = await rollup({
    input: inFile,
    plugins: [resolve()]
  })

  await bundle.write({
    file: outFile,
    format: 'es'
  })
}

const externalRollup = async (rollupFile, inFile, outFile) => {
  let rollUpConfig = {}
  let grab = memoize(loadConfigFile)
  const { options, warnings } = await grab(rollupFile)

  if(!warnings?.count) {
    rollUpConfig = options
  }

  //eslint-disable-next-line no-undef
  await Promise.all(rollUpConfig.map(async config => {
    config.input = inFile
    config.plugins.unshift(resolve())
    const bundle = await rollup(config)
    config.output.forEach(o => {
      o.file = outFile
      o.format = 'es'
    })
    //eslint-disable-next-line no-undef
    await Promise.all(config.output.map(bundle.write))
  }))
}

const memoize = (fn) => {
  let cache = {};
  return async (obj) => {
    if(obj in cache) {
      return cache[obj]
    } else {
      cache[obj] = await fn(obj)
      return cache[obj]
    }
  }
}

module.exports = {
  sandbox: {
    async start({ inventory }) {
      await build(inventory.inv)
    },

    async watcher({ filename, inventory }) {
      const { cwd } = inventory.inv._project
      const appDir = join(cwd, 'app')

      if (filename.indexOf(appDir) === 0) {
        await build(inventory.inv)
      }
    },
  },
  deploy: {
    async start ({ cloudformation, inventory }) {
      await build(inventory.inv)
      return cloudformation
    }
  }
}
