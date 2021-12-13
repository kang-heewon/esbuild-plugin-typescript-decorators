export declare type PluginOptions = {
    tsconfig?: string;
    force?: boolean;
    tsx?: boolean;
    cwd?: string;
};
export declare const esbuildDecorators: (options?: PluginOptions) => {
    name: string;
    setup(build: any): void;
};
//# sourceMappingURL=esbuild-plugin-typescript-decorators.d.ts.map