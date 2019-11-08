const { app, BrowserWindow, Tray, Menu, shell } = require("electron");
const path = require("path");
var tray = null;
app.on("ready", function() {
	var win = new BrowserWindow({
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
