import enhance from '@enhance/element'
import MyElement from '../elements/my-element.mjs'
import noDefault from "./no-default-export.js"

noDefault("Should work even though it's CJS.")

enhance('my-element', MyElement)

