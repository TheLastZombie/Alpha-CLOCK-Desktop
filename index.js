const { app, BrowserWindow, Tray, Menu, shell } = require("electron");
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
			width: 1557,
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
				click: function (_menuItem, _browserWindow, _event) {
					win.show();
				},
				label: "Open"
			},
			{
				role: "quit",
				label: "Exit"
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
	});
};
