### <span style="text-decoration:underline">[English](https://gitee.com/inardy/esbuild-plugin-typescript-decorators/blob/master/README.md)</span>&nbsp;&nbsp;|&nbsp;&nbsp;<span style="text-decoration:underline;padding-left:30px">[中文](https://gitee.com/inardy/esbuild-plugin-typescript-decorators/blob/master/README-zh.md)</span>

----

> The esbuild build tool does not support typescript's [`emitdecoratormetadata`] (https://esbuild.github.io/content-types/#no-type-system) by default.
> 
> when using decorator development, when obtaining such as `Reflect.getMetadata ("design: type", target, key)`, it returns `undefined` by default. However, using this plugin, it will return the correct value by use the above method

### Usage

```js
import esbuild from 'esbuild'
import { esbuildDecorators } from 'esbuild-plugin-typescript-decorators'

esbuild.build({
    // ...config,
    plugins: [
        esbuildDecorators()
    ]
})
```