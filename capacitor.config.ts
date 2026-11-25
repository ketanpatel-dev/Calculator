import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.nexus.calculator',
  appName: 'Nexus Calculator',
  webDir: 'dist',
  bundledWebRuntime: false,
  backgroundColor: '#090b12',
  android: {
    allowMixedContent: false,
  },
}

export default config
