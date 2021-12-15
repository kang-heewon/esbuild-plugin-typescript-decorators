### <span style="text-decoration:underline">[English](https://gitee.com/inardy/esbuild-plugin-typescript-decorators/blob/master/README.md)</span>&nbsp;&nbsp;|&nbsp;&nbsp;<span style="text-decoration:underline;padding-left:30px">[中文](https://gitee.com/inardy/esbuild-plugin-typescript-decorators/blob/master/README-zh.md)</span>

----

> ESBuild构建工具默认是不支持typescript的 [`emitDecoratorMetadata`](https://esbuild.github.io/content-types/#no-type-system).
> 
> 使用了装饰器开发时，在获取诸如`Reflect.getMetadata("design:type", target, key)`这样的值时，默认返回`undefined`, 但使用此插件，将使用以上返回正确的值

### 用法

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