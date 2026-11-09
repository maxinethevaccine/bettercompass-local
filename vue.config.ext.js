// Build config for the Chrome extension bundle (npm run build:ext).
// One JS file + one CSS file, everything inlined, no HTML page, no service worker.
const webpack = require("webpack")

module.exports = {
  outputDir: "extension/app",
  publicPath: "",
  filenameHashing: false,
  productionSourceMap: false,
  lintOnSave: false,
  css: { extract: true },
  transpileDependencies: ["vuetify"],
  chainWebpack: (config) => {
    config.module
      .rule("vue")
      .use("vue-loader")
      .tap((options) => {
        options.compiler = require("vue-template-babel-compiler")
        return options
      })

    config.entry("app").clear().add("./src/ext/entry.js")

    ;["html", "preload", "prefetch", "copy", "pwa", "html-pwa", "workbox", "manifest"].forEach(
      (name) => config.plugins.delete(name)
    )

    // Chrome refuses content scripts containing Unicode non-characters (e.g. U+FFFE found in
    // library regexes), so emit every non-ASCII character as an escape sequence.
    config.optimization.minimizer("terser").tap((args) => {
      args[0].terserOptions = args[0].terserOptions || {}
      args[0].terserOptions.output = Object.assign({}, args[0].terserOptions.output, {
        ascii_only: true
      })
      return args
    })

    config.optimization.splitChunks(false)
    config
      .plugin("limit-chunks")
      .use(webpack.optimize.LimitChunkCountPlugin, [{ maxChunks: 1 }])

    // Inline every asset as a data URI so nothing depends on a public path.
    ;["images", "media", "fonts"].forEach((name) => {
      config.module
        .rule(name)
        .use("url-loader")
        .loader("url-loader")
        .options({ limit: 1000000000 })
    })
    config.module.rule("svg").uses.clear()
    config.module
      .rule("svg")
      .use("url-loader")
      .loader("url-loader")
      .options({ limit: 1000000000 })
  }
}
