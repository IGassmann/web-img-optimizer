import 'svgo'

declare module 'svgo' {
  function extendDefaultPlugins(plugins: string[]): PluginConfig[]
}

