const path = require("path");
import resolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import replace from "rollup-plugin-replace";
import postcss from "rollup-plugin-postcss";
import url from "postcss-url";
import autoprefixer from "autoprefixer";
import json from "@rollup/plugin-json";
import alias from "@rollup/plugin-alias";
import dev from "rollup-plugin-dev";
import livereload from "rollup-plugin-livereload";

const dotenv_path =
  process.env.NODE_ENV === "development" ? ".env.development" : ".env";
require("dotenv").config({
  path: dotenv_path,
  debug: process.env.NODE_ENV === "development",
});

const CWD = path.join(__dirname, "..");

export default {
  input: "src/index.js",
  output: {
    file: path.join(CWD, "static/bundle.js"),
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
      "preventAssignment": true,
      "process.env.NODE_ENV": JSON.stringify("development"),
      "process.env.VOCERO_BASE_URL": JSON.stringify(
        process.env.VOCERO_BASE_URL || "/"
      ),
      "process.env.VOCERO_API_URL": JSON.stringify(
        process.env.VOCERO_API_URL || "/"
      ),
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
      dirs: [CWD],
      port: 3000,
      proxy: [
        {
          from: "/api",
          to: "http://localhost:8000/api",
        },
      ],
      spa: true,
      server: {
        connectionTimeout: 1e4,
      },
      silent: true,
    }),
    livereload({
      delay: 1e3,
    }),
  ],
  preserveSymlinks: true,
};
