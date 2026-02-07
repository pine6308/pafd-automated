console.log('Starting test...');
const { app, BrowserWindow } = require('electron');
console.log('app:', app);
console.log('BrowserWindow:', BrowserWindow);

app.whenReady().then(() => {
  console.log('App is ready!');
  const win = new BrowserWindow({ width: 400, height: 300 });
  win.loadURL('https://google.com');
});

app.on('window-all-closed', () => {
  app.quit();
});
