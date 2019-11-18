### 记录一下敲代码过程中遇到的electron 的坑

1.electron 双开窗口页面：
场景：主窗口用于展示一些主内容，开一个同级页面用户展示图片，类似一个一个ppt播放器，所以要支持数据流通，在electron中即是数据通信，（方法有1.ipc通信; 2.浏览器缓存,localStorage, sessionStorage; 3.global,在主进程定义global对象,在渲染进程中调用）
技术栈： electron, nodejs, vuejs
因为electronz支持引入静态页面，结合vue路由，将另一个页面写入一个vue路由页面中
代码：
```
  const winURL = process.env.NODE_ENV === 'development' ? `http://localhost:8080` : `file://${__dirname}/index.html`

const newURL = process.env.NODE_ENV === 'development' ? `http://localhost:9064/#/newwin` : `file://${__dirname}/index.html#/newwin`
```

2. 双开窗口时任务栏图标设置
双开窗口开应该是两个同级窗口（父子窗口会出现点击任务图标关闭窗口时关闭bug,卡住，或者关闭不了，尤其是win7）,
所以，实现的思路是先开两个同级窗口，一个是主窗口，另一个是副窗口，初始化时隐藏，需要调用时，再显示它，通过控制其的显示与隐藏来模拟窗口的关闭与开启效果：
代码
```
let openName;
let mainWindow
function createWindow() {
  mainWindow = new BrowserWindow({
    height: 800,
    // useContentSize: true,
    width: 1200,
    maxHeight: 1080,
    maxWidth: 1920,
    minHeight: 800,
    minWidth: 1200,
    frame: false,
    resizable: true
  })
  mainWindow.loadURL(winURL)
  newwin = new BrowserWindow({
      width: 1000,
      height: 800,
      frame: false,
      movable: true,
      resizable: true,
      backgroundColor: '#fff',
      show: false,
    })
    newwin.loadURL(newURL)
}
  ipcMain.on('openDialog', (event, arg) => {
    newwin.show()
  }
```
3. electron 最大化最小化icon的实时有效变化
通过electron监听最大化，最小化来通信实现（因为存在双击窗口最大化，最小化，任务栏操作等，不能仅是通过点击最大化、最小化icon通信实现）

4. 窗口全屏bug，任务栏关闭不了，进程关闭不了，尤其是在win7 中。
原因之一是win7 electron全屏村在bug，折中实现，win7上使用最大化（即不盖住任务栏），
实现思路，通过nodejs中的os模块监听操作系统的平台（platform）和系统版本（release）来判断是不是win7系统

[windows各个版本对应的版本号](https://blog.csdn.net/shen_001/article/details/52946952)
![版本图片](./windows_version.jpg)
```
import os from 'os'
let platform = os.platform()
let release = os.release()
if(platform === 'win32' && release.slice(0, 3) === '6.1') {
  console.log('is win7')
}
```
