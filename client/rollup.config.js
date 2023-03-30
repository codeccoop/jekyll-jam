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

export default {
  input: "src/index.js",
  output: {
    file: path.join(__dirname, "..", "static/bundle.js"),
    format: "iife",
  },
  plugins: [
    resolve(),
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
