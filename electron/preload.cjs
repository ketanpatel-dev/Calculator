const { contextBridge } = require('electron')

contextBridge.exposeInMainWorld('nexusDesktop', {
  platform: 'windows',
})
