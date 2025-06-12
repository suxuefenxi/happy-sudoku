import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import copy from "rollup-plugin-copy";
import css from "rollup-plugin-css-only";
import livereload from "rollup-plugin-livereload";
import svelte from "rollup-plugin-svelte";
import { terser } from "rollup-plugin-terser";
import sveltePreprocess from "svelte-preprocess";
import alias from "@rollup/plugin-alias";
import { writeFileSync } from "fs";
import path from "path";


const mode = process.env.NODE_ENV;
const production = mode === "production";

const preprocess = sveltePreprocess({
  postcss: {
    plugins: [
      require("postcss-import"),
      require("tailwindcss"),
      require("autoprefixer"),
      ...(production ? [require("postcss-clean")] : []),
    ],
  },
  defaults: {
    style: "postcss",
  },
});

export default {
  input: "src/main.js",
  output: {
    file: "dist/bundle.js",
    sourcemap: !production,
    name: "app",
    format: "iife",
    globals: {},
  },
  plugins: [
    alias({
      // <--- 添加 alias 插件配置
      entries: [
        // 这种方式更灵活，它会查找 .js 文件或目录下的 index.js
        {
          find: /^@sudoku\/(.*)$/,
          // __dirname 是当前 rollup.config.js 文件所在的目录
          // 这会将 @sudoku/game 解析到 src/libs/@sudoku/game
          // 然后 @rollup/plugin-node-resolve 会尝试添加 .js 或查找 index.js
          replacement: path.resolve(__dirname, "src/libs/@sudoku/$1"),
        },
      ],
    }),
    copy({
      targets: [
        { src: "src/template.html", dest: "dist", rename: "index.html" },
        { src: "static/**/*", dest: "dist" },
      ],
    }),

    svelte({
      compilerOptions: {
        dev: !production,
      },
      preprocess,
    }),

    css({
      output: !production
        ? "bundle.css"
        : (styles, styleNodes) => {
            for (let filename of Object.keys(styleNodes)) {
              if (filename.endsWith("App.css")) {
                writeFileSync("./dist/critical.css", styleNodes[filename]);
              }
            }
            writeFileSync("./dist/bundle.css", styles);
          },
    }),

    resolve({
      browser: true,
      dedupe: ["svelte"],
      extensions: [".js", ".json", ".svelte"], // 明确指定解析的扩展名
      // customResolveOptions: { // 当使用 alias 后，此处的 moduleDirectories 可能不再严格需要针对 src/libs
      //   moduleDirectories: ["node_modules", "src/libs"],
      // },
    }),

    commonjs(),

    !production && livereload({ watch: "dist" }),

    production && terser(),
  ],
  watch: {
    clearScreen: false,
  },
};