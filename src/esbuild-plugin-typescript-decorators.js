"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.esbuildDecorators = void 0;
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const typescript_1 = __importDefault(require("typescript"));
const parseTsConfig = (tsconfig, cwd = process.cwd()) => {
    const fileName = typescript_1.default.findConfigFile(cwd, typescript_1.default.sys.fileExists, tsconfig);
    if (!fileName) {
        throw new Error(`Fail to load tsconfig file (${tsconfig})!`);
    }
    const text = typescript_1.default.sys.readFile(fileName);
    if (!text) {
        throw new Error(`Tsconfig file content must not be empty!`);
    }
    const result = typescript_1.default.parseConfigFileTextToJson(fileName, text);
    if (result.error) {
        throw new Error(`Fail to parser tsconfig file: ` + result.error.messageText);
    }
    const parsedConfig = typescript_1.default.parseJsonConfigFileContent(result.config, typescript_1.default.sys, path_1.default.dirname(fileName));
    if (parsedConfig.errors[0]) {
        throw new Error(`Fail to parser tsconfig file: ` + parsedConfig.errors[0].messageText);
    }
    return parsedConfig;
};
const FIND_COMMON_REGX = /(\/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*+\/)|(\/\/.*)/g;
const findDecorators = (content) => {
    var _a;
    content = (_a = content === null || content === void 0 ? void 0 : content.trim) === null || _a === void 0 ? void 0 : _a.call(content);
    if (!content) {
        return false;
    }
    content = content.replace(FIND_COMMON_REGX, '').trim();
    const lines = content.split(os_1.default.EOL)
        .filter(line => !line.startsWith("import ") && !line.startsWith('} from ') && line.indexOf("@") > -1);
    return lines.length > 0;
};
const esbuildDecorators = (options = {}) => {
    return {
        name: "tsc",
        setup(build) {
            var _a, _b;
            // 是否开启tsx支持
            const tsx = options.tsx === true;
            // 工作目录，默认为: process.cwd()
            const cwd = options.cwd || process.cwd();
            // 是否强制使用装饰器解析，如果为false，则由tsconfig.json的配置emitDecoratorMetadata是否为true决定
            const force = options.force === true;
            // tsconfig 配置文件路径
            const tsconfig = options.tsconfig || ((_a = build.initialOptions) === null || _a === void 0 ? void 0 : _a.tsconfig) || path_1.default.join(cwd, "tsconfig.json");
            const tsConfig = parseTsConfig(tsconfig, cwd);
            if ((_b = tsConfig === null || tsConfig === void 0 ? void 0 : tsConfig.options) === null || _b === void 0 ? void 0 : _b.sourcemap) {
                tsConfig.options.sourcemap = false;
                tsConfig.options.inlineSources = true;
                tsConfig.options.inlineSourceMap = true;
            }
            build.onLoad({
                filter: tsx ? /\.tsx?$/ : /\.ts$/
            }, (args) => __awaiter(this, void 0, void 0, function* () {
                var _c;
                if (!force && !((_c = tsConfig === null || tsConfig === void 0 ? void 0 : tsConfig.options) === null || _c === void 0 ? void 0 : _c.emitDecoratorMetadata)) {
                    return;
                }
                const tsContent = yield promises_1.default.readFile(args.path, 'utf8').catch(err => {
                    console.error(`Fail access file (${args.path}): `, err);
                    return null;
                });
                if (!tsContent) {
                    return;
                }
                const hasDecorator = findDecorators(tsContent);
                if (!hasDecorator) {
                    return;
                }
                const program = typescript_1.default.transpileModule(tsContent, {
                    compilerOptions: tsConfig.options
                });
                return {
                    contents: program.outputText
                };
            }));
        }
    };
};
exports.esbuildDecorators = esbuildDecorators;
//# sourceMappingURL=esbuild-plugin-typescript-decorators.js.map