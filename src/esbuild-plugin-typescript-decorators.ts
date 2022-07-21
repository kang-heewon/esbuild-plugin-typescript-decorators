import os from "os"
import path from 'path'
import fs from 'fs/promises'
import typescript from 'typescript'

const parseTsConfig = (tsconfig: string, cwd = process.cwd()) => {
  const fileName = typescript.findConfigFile(cwd, typescript.sys.fileExists, tsconfig)
  if(!fileName) {
    throw new Error(`Fail to load tsconfig file (${tsconfig})!`)
  }
  const text = typescript.sys.readFile(fileName)
  if(!text) {
    throw new Error(`Tsconfig file content must not be empty!`)
  }
  const result = typescript.parseConfigFileTextToJson(fileName, text)
  if(result.error) {
    throw new Error(`Fail to parser tsconfig file: ` + result.error.messageText)
  }
  const parsedConfig = typescript.parseJsonConfigFileContent(result.config, typescript.sys, path.dirname(fileName))
  if(parsedConfig.errors[0]) {
    throw new Error(`Fail to parser tsconfig file: ` + parsedConfig.errors[0].messageText)
  }
  return parsedConfig
}

const FIND_COMMON_REGX = /(\/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*+\/)|(\/\/.*)/g
const FIND_DECORATOR_REGX = /[^'"]@[a-zA-Z$_][\w$]+|[^'"]@\([a-zA-Z$_][\w$]+\)\(/g
const findDecorators = (content: string) => {
  content = content?.trim?.()
  if(!content) {
    return false
  }
  content = content.replace(FIND_COMMON_REGX, '').trim()
  const lines = content.split(os.EOL)
    .filter(line => !line.startsWith("import ") && line.indexOf("@") > -1)
  return !!lines.find(line => FIND_DECORATOR_REGX.test(line))
}

export type PluginOptions = {
  tsconfig?: string,
  force?: boolean,
  tsx?: boolean,
  cwd?: string
}

export const esbuildDecorators = (options: PluginOptions = {}) => {
  return {
    name: "tsc",
    setup(build: any) {
      // 是否开启tsx支持
      const tsx = options.tsx === true
      // 工作目录，默认为: process.cwd()
      const cwd = options.cwd || process.cwd()
      // 是否强制使用装饰器解析，如果为false，则由tsconfig.json的配置emitDecoratorMetadata是否为true决定
      const force = options.force === true
      // tsconfig 配置文件路径
      const tsconfig = options.tsconfig || build.initialOptions?.tsconfig || path.join(cwd, "tsconfig.json")

      const tsConfig = parseTsConfig(tsconfig, cwd);
      if(tsConfig?.options?.sourcemap) {
        tsConfig.options.sourcemap = false
        tsConfig.options.inlineSources = true
        tsConfig.options.inlineSourceMap = true
      }
      build.onLoad({
        filter: tsx ? /\.tsx?$/ : /\.ts$/
      }, async (args: any) => {
        if(!force && !tsConfig?.options?.emitDecoratorMetadata) {
          return
        }
        const tsContent = await fs.readFile(args.path, 'utf8').catch(err => {
          console.error(`Fail access file (${args.path}): `, err)
          return null
        })
        if(!tsContent) {
          return
        }
        const hasDecorator = findDecorators(tsContent)
        if(!hasDecorator) {
          return
        }
        const program = typescript.transpileModule(tsContent, {
          compilerOptions: tsConfig.options
        })
        return {
          contents: program.outputText
        }
      })

    }
  }
}
