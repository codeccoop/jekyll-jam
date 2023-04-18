const path = require("path");
import resolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import replace from "rollup-plugin-replace";
import postcss from "rollup-plugin-postcss";
import url from "postcss-url";
import autoprefixer from "autoprefixer";
import json from "@rollup/plugin-json";
import dev from "rollup-plugin-dev";
import alias from "@rollup/plugin-alias";

export default {
  input: "src/index.js",
  output: {
    file: path.join(__dirname, "..", "static/bundle.js"),
    format: "iife",
  },
  plugins: [
    resolve(),
    alias({
      entries: [
        {
          find: "assets",
          replacement: path.resolve(__dirname, "src/assets"),
        },
        {
          find: "components",
          replacement: path.resolve(__dirname, "src/components"),
        },
        {
          find: "lib",
          replacement: path.resolve(__dirname, "src/lib"),
        },
        {
          find: "asset",
          replacement: path.resolve(__dirname, "src/assets"),
        },
        {
          find: "hooks",
          replacement: path.resolve(__dirname, "src/hooks"),
        },
        {
          find: "layouts",
          replacement: path.resolve(__dirname, "src/layouts"),
        },
        {
          find: "pages",
          replacement: path.resolve(__dirname, "src/pages"),
        },
        {
          find: "services",
          replacement: path.resolve(__dirname, "src/services"),
        },
        {
          find: "store",
          replacement: path.resolve(__dirname, "src/store"),
        },
        {
          find: "style",
          replacement: path.resolve(__dirname, "src/style"),
        },
      ],
    }),
    replace({
      preventAssignment: true,
      "process.env.NODE_ENV": JSON.stringify("development"),
      "process.env.BASE_URL": JSON.stringify(process.env.BASE_URL || "/"),
    }),
    babel({
      presets: ["@babel/preset-react"],
    }),
    commonjs(),
    postcss({
      plugins: [autoprefixer(), url({ url: "inline" })],
    }),
    json(),
    dev({
      port: 3000,
      spa: true,
      dirs: ["../"],
      proxy: [{ from: "/api", to: "http://jekyll-jam.orzopad.net/api" }],
      server: {
        connectionTimeout: 1e4,
      },
    }),
  ],
  preserveSymlinks: true,
};
