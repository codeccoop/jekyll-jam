const path = require("path");
import resolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import replace from "@rollup/plugin-replace";
// import css from "rollup-plugin-import-css";
import scss from "rollup-plugin-scss";
import postcss from "postcss";
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
      "process.env.NODE_ENV": JSON.stringify("development"),
    }),
    babel({
      presets: ["@babel/preset-react"],
    }),
    commonjs(),
    // css(),
    scss({
      sourceMap: process.env.NODE_ENV !== "production",
      processor: () => postcss([autoprefixer]),
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
};
