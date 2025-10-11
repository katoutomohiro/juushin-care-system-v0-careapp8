declare module "@vitejs/plugin-react" {
  import type { PluginOption } from "vite"

  const plugin: (options?: Record<string, unknown>) => PluginOption
  export default plugin
}
