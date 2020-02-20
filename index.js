const { app, BrowserWindow, Tray, Menu, shell, ipcMain } = require("electron");
const path = require("path");
var win = null;
var tray = null;
if (!app.requestSingleInstanceLock()) {
	app.quit();
} else {
	app.on("second-instance", (_event, _commandLine, _workingDirectory) => {
		if (win) {
			if (win.isMinimized()) win.restore();
			win.show();
			win.focus();
		};
	});
	app.on("ready", () => {
		win = new BrowserWindow({
			width: 1540,
			height: 932,
			webPreferences: {
				nodeIntegration: true
			},
			frame: false
		});
		tray = new Tray(path.join(__dirname, "images/icon.png"));
		tray.setToolTip("α CLOCK Desktop");
		tray.setIgnoreDoubleClickEvents(true);
		const contextMenu = Menu.buildFromTemplate([
			{
				label: "α CLOCK Desktop",
				enabled: false
			},
			{
				type: "separator"
			},
			{
				click: function (menuItem, _browserWindow, _event) {
					win.webContents.send("state", menuItem.checked);
				},
				label: "Enable service",
				type: "checkbox",
				id: "enabled"
			},
			{
				type: "separator"
			},
			{
				click: function (_menuItem, _browserWindow, _event) {
					win.show();
				},
				label: "Restore window"
			},
			{
				role: "quit",
				label: "Exit (stops updates)"
			}
		]);
		tray.on("click", function (_e) {
			win.show();
		});
		tray.on("right-click", function (_e) {
			tray.popUpContextMenu(contextMenu);
		});
		win.loadFile("index.html");
		win.webContents.on("new-window", function (e, url) {
			e.preventDefault();
			shell.openExternal(url);
		});
		ipcMain.on("state", (_event, arg) => {
			contextMenu.getMenuItemById("enabled").checked = arg;
		});
	});
};
