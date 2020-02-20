var store;
$(function () {
	const Store = require("electron-store");
	store = new Store();
	const request = require("request");
	request("https://www.sony.net/united/clock/assets/js/heritage_data.js", function (_error, _response, body) {
		eval(body);
		for (i = 0; i < a_clock_heritage_data.length; i++) {
			$("#content").append("<div class='heritage'><div class='overlay'><div class='title'>" + a_clock_heritage_data[i].name.en + (a_clock_heritage_data[i].is_new ? "<span class='bx--tag'>NEW</span>" : "") + "</div><div class='description'>" + a_clock_heritage_data[i].country.en + "</div><div class='bx--btn-set'><button class='acd-btn-select bx--btn bx--btn--primary bx--btn--icon-only' data='" + a_clock_heritage_data[i].id + "'><img src='images/select-off.svg'></button><button class='acd-btn-open bx--btn bx--btn--secondary bx--btn--icon-only' data='" + a_clock_heritage_data[i].id + "'><img src='images/browser.svg'></button><button class='acd-btn-download bx--btn bx--btn--secondary bx--btn--icon-only' data='" + a_clock_heritage_data[i].id + "'><img src='images/download.svg'></button></div></div><img class='preview' src='https://www.sony.net/united/clock/share/img/photo/" + a_clock_heritage_data[i].id + "/fp/" + a_clock_heritage_data[i].thumbnail_default + ".jpg'></div>");
		};
		$(".bx--loading").detach();
		if (store.get("current")) {
			name();
		};
		if (store.get("enabled")) {
			$("#toggle").prop("checked", true);
			main();
			ipcRenderer.send("state", true);
		};
	});
	const { remote, ipcRenderer } = require("electron");
	$("#minimize").click(function (_e) {
		remote.BrowserWindow.getFocusedWindow().hide();
	});
	$("#close").click(function (_e) {
		remote.BrowserWindow.getFocusedWindow().close();
	});
	ipcRenderer.on("state", (_event, message) => {
		$("#toggle").prop("checked", message);
		store.set("enabled", message);
		if (message) {
			main();
		} else {
			const schedule = require("node-schedule");
			Object.values(schedule.scheduledJobs).map(job => {
				schedule.cancelJob(job.name);
			});
		};
	});
	store.onDidChange("current", function (_newValue, _oldValue) {
		main();
		name();
	});
});
$(document).on("change", "#toggle", function () {
	const { ipcRenderer } = require("electron");
	store.set("enabled", this.checked);
	ipcRenderer.send("state", this.checked);
	if (this.checked) {
		main();
	} else {
		const schedule = require("node-schedule");
		Object.values(schedule.scheduledJobs).map(job => {
			schedule.cancelJob(job.name);
		});
	};
});
$(document).on("click", ".acd-btn-select", function () {
	var data = $(this).attr("data");
	store.set("current", data);
	const request = require("request");
	request("https://www.sony.net/united/clock/assets/js/heritage_data.js", function (_error, _response, body) {
		eval(body);
		var temp = a_clock_heritage_data.filter(x => x.id == data);
		$(".bx--header__name--prefix").text(temp[0].name.en);
		$(".acd-btn-select img").attr("src", "images/select-off.svg");
		$(".acd-btn-select[data='" + temp[0].id + "'] img").attr("src", "images/select-on.svg");
		main();
	});
});
$(document).on("click", ".acd-btn-open", function () {
	const { shell } = require("electron");
	shell.openExternal("https://www.sony.net/united/clock/heritage/" + $(this).attr("data") + "/");
});
$(document).on("click", ".acd-btn-download", function () {
	var data = $(this).attr("data");
	const request = require("request");
	request("https://www.sony.net/united/clock/assets/js/heritage_data.js", function (_error, _response, body) {
		eval(body);
		var temp = a_clock_heritage_data.filter(x => x.id == data)[0];
		$("#content").hide();
		$("body").append("<div class='download'><div class='block'><div class='title'>" + temp.name.en + "</div><section class='bx--structured-list'><div class='bx--structured-list-thead'><div class='bx--structured-list-row bx--structured-list-row--header-row'><div class='bx--structured-list-th'>Method</div><div class='bx--structured-list-th'>Description</div><div class='bx--structured-list-th'>Link</div></div></div><div class='bx--structured-list-tbody'><div class='bx--structured-list-row'><div class='bx--structured-list-td'>Default</div><div class='bx--structured-list-td'>Downloads resources only, including snapshots, music tracks and soundscapes, but without a way to automatically set it as wallpaper.</div><div class='bx--structured-list-td'><a class='dl-link' data-heritage='" + temp.id + "' data-method='def' href='#'>Download</a></div></div><div class='bx--structured-list-row'><div class='bx--structured-list-td'>WinDynamicDesktop</div><div class='bx--structured-list-td'>Downloads the photos and converts them into a theme to use with WinDynamicDesktop on Windows.</div><div class='bx--structured-list-td'><a class='dl-link' data-heritage='" + temp.id + "' data-method='wdd' href='#'>Download</a></div></div><div class='bx--structured-list-row'><div class='bx--structured-list-td'>macOS</div><div class='bx--structured-list-td'>Downloads the photos and converts them into a dynamic wallpaper to use on macOS Mojave or later.</div><div class='bx--structured-list-td'><a class='dl-link' data-heritage='" + temp.id + "' data-method='mac' href='#'>Download</a></div></div><div class='bx--structured-list-row'><div class='bx--structured-list-td'>GNOME</div><div class='bx--structured-list-td'>Downloads the photos and converts them into a time-shifting wallpaper to use with GNOME-based environments.</div><div class='bx--structured-list-td'><a class='dl-link' data-heritage='" + temp.id + "' data-method='gtw' href='#'>Download</a></div></div></div></section></div></div>");
		$(".bx--header__name").hide();
		$(".bx--header").prepend("<button class='acd-btn-return bx--header__action' type='button' id='return'><img src='images/return.svg'></button>");
	});
});
$(document).on("click", ".dl-link", function () {
	var dataHeritage = $(this).attr("data-heritage");
	var dataMethod = $(this).attr("data-method");
	const { dialog } = require("electron").remote;
	var dataDirectory = dialog.showOpenDialogSync({
		properties: ["openDirectory"]
	});
	if (dataDirectory == undefined) {
		return;
	};
	dataDirectory = dataDirectory[0];
	const request = require("request");
	request("https://www.sony.net/united/clock/assets/js/heritage_data.js", function (_error, _response, body) {
		eval(body);
		var dataResponse = a_clock_heritage_data.filter(x => x.id == dataHeritage)[0];
		const fs = require("fs-extra");
		const path = require("path");
		const sanitize = require("sanitize-filename");
		dataDirectory = path.join(dataDirectory, sanitize(dataResponse.name.en, {
			replacement: "_"
		}));
		if (fs.existsSync(dataDirectory)) {
			$("body").append(`<div data-notification class="bx--toast-notification bx--toast-notification--warning">
				<svg class="bx--toast-notification__icon" width="20" height="20"><path d="M10 1c-5 0-9 4-9 9s4 9 9 9 9-4 9-9-4-9-9-9zm3.5 13.5l-8-8 1-1 8 8-1 1z"></path></svg>
				<div class="bx--toast-notification__details">
					<h3 class="bx--toast-notification__title">Directory already exists!</h3>
					<p class="bx--toast-notification__caption">Please select a different directory.</p>
				</div>
				<button data-notification-btn class="bx--toast-notification__close-button">
					<svg class="bx--toast-notification__close-icon" width="16" height="16"><path d="M12 4.7l-.7-.7L8 7.3 4.7 4l-.7.7L7.3 8 4 11.3l.7.7L8 8.7l3.3 3.3.7-.7L8.7 8z"></path></svg>
				</button>
			</div>`);
			return;
		};
		fs.mkdirSync(dataDirectory, {
			recursive: true
		});
		process.chdir(dataDirectory);
		$(".acd-btn-return").addClass("acd-btn-return-disabled");
		$(".dl-link").addClass("dl-link-disabled");
		$(".block .description").remove();
		$(".block").append("<div class='description'></div>");
		var dataLinks = [];
		const async = require("async");
		var dataThreads = 1;
		var dataFilesSuccess = 0;
		var dataFilesErorr = 0;
		const AdmZip = require("adm-zip");
		switch (dataMethod) {
			case "def":
				var dataResolutions = ["3840_2160", "1920_1200", "1920_1080", "1280_1024"];
				for (i = 0; i < 12; i++) {
					for (j = 0; j < dataResolutions.length; j++) {
						dataLinks.push("https://di.update.sony.net/ACLK/wallpaper/" + dataResponse.id + "/" + dataResolutions[j] + "/fp/" + dataResponse.id + "_" + dataResolutions[j] + "_fp_" + (i + 1).toString().padStart(2, "0") + ".zip");
					};
				};
				for (i = 0; i < 10; i++) {
					for (j = 0; j < dataResolutions.length; j++) {
						dataLinks.push("https://di.update.sony.net/ACLK/wallpaper/" + dataResponse.id + "/" + dataResolutions[j] + "/ss/" + dataResponse.id + "_" + dataResolutions[j] + "_ss_" + (i + 1).toString().padStart(2, "0") + ".zip");
					};
				};
				if (dataResponse.music) {
					dataLinks.push("https://www.sony.net/united/clock/assets/sound/theme_song_of_world_heritage_" + dataResponse.music + ".mp3");
				};
				if (dataResponse.soundscape) {
					dataLinks.push("https://www.sony.net" + dataResponse.soundscape.media.mp3);
				};
				async.eachOfLimit(dataLinks, dataThreads, function (asyncData, key, callback) {
					$(".block .description").html("Downloading <a href='" + asyncData + "' target='_blank'>" + asyncData + "</a> (" + (key + 1) + " of " + dataLinks.length + ")...");
					request({
						url: asyncData,
						encoding: null
					}, function (error, _response, body) {
						if (error) {
							dataFilesErorr++;
							callback();
						} else {
							dataFilesSuccess++;
							fs.writeFileSync(path.basename(asyncData), body);
							callback();
						};
					});
				}, function () {
					$(".block .description").html("Finished downloading " + dataResponse.name.en + " (with " + dataFilesSuccess + " successful and " + dataFilesErorr + " failed request" + (dataFilesErorr != 1 ? "s" : "") + ").");
					$(".acd-btn-return").removeClass("acd-btn-return-disabled");
					$(".dl-link").removeClass("dl-link-disabled");
					process.chdir(__dirname);
				});
				break;
			case "wdd":
				for (i = 0; i < 12; i++) {
					dataLinks.push("https://di.update.sony.net/ACLK/wallpaper/" + dataResponse.id + "/3840_2160/fp/" + dataResponse.id + "_3840_2160_fp_" + (i + 1).toString().padStart(2, "0") + ".zip");
				};
				var zip = new AdmZip();
				async.eachOfLimit(dataLinks, dataThreads, function (asyncData, key, callback) {
					$(".block .description").html("Downloading <a href='" + asyncData + "' target='_blank'>" + asyncData + "</a> (" + (key + 1) + " of " + dataLinks.length + ")...");
					request({
						url: asyncData,
						encoding: null
					}, function (error, _response, body) {
						if (error) {
							dataFilesErorr++;
							callback();
						} else {
							dataFilesSuccess++;
							new AdmZip(body).extractAllTo(process.cwd(), true);
							callback();
						};
					});
				}, function () {
					$(".block .description").html("Converting downloaded files to WinDynamicDesktop format...");
					for (i = 1; i < 10; i++) fs.renameSync(dataResponse.id + "_3840_2160_fp_0" + i + ".jpg", dataResponse.id + "_3840_2160_fp_" + i + ".jpg");
					var dataConvert = {
						"displayName": dataResponse.name.en,
						"imageFilename": dataResponse.id + "_3840_2160_fp_*.jpg",
						"imageCredits": "Sony",
						"sunriseImageList": [
							1,
							2
						],
						"dayImageList": [
							3,
							4,
							5,
							6,
							7,
							8
						],
						"sunsetImageList": [
							9,
							10
						],
						"nightImageList": [
							11,
							12
						]
					};
					zip.addFile("theme.json", Buffer.alloc(JSON.stringify(dataConvert).length, JSON.stringify(dataConvert)));
					fs.readdirSync("./").forEach(x => {
						zip.addLocalFile(x);
					});
					process.chdir("..");
					fs.removeSync(dataDirectory);
					zip.writeZip(sanitize(dataResponse.name.en, {
						replacement: "_"
					}) + ".ddw");
					$(".block .description").html("Finished downloading " + dataResponse.name.en + ". Use <a href='https://www.jetsoncreative.com/24hourwindows' target='_blank'>WinDynamicDesktop</a> to apply the scene and use it as wallpaper.");
					$(".acd-btn-return").removeClass("acd-btn-return-disabled");
					$(".dl-link").removeClass("dl-link-disabled");
					process.chdir(__dirname);
				});
				break;
			case "mac":
				for (i = 0; i < 12; i++) {
					dataLinks.push("https://di.update.sony.net/ACLK/wallpaper/" + dataResponse.id + "/3840_2160/fp/" + dataResponse.id + "_3840_2160_fp_" + (i + 1).toString().padStart(2, "0") + ".zip");
				};
				async.eachOfLimit(dataLinks, dataThreads, function (asyncData, key, callback) {
					$(".block .description").html("Downloading <a href='" + asyncData + "' target='_blank'>" + asyncData + "</a> (" + (key + 1) + " of " + dataLinks.length + ")...");
					request({
						url: asyncData,
						encoding: null
					}, function (error, _response, body) {
						if (error) {
							dataFilesErorr++;
							callback();
						} else {
							dataFilesSuccess++;
							new AdmZip(body).extractAllTo(process.cwd(), true);
							callback();
						};
					});
				}, function () {
					$(".block .description").html("Converting downloaded files to macOS format...");
					var dataConvert = [];
					for (i in dataResponse.fp) {
						if (isNaN(i)) {
							continue;
						};
						var dataTemp = {
							fileName: dataResponse.id + "_3840_2160_fp_" + i + ".jpg",
							time: "1970-01-01T" + dataResponse.fp[i].slice(0, 2) + ":" + dataResponse.fp[i].slice(2) + ":00Z"
						};
						if (dataResponse.preview == i) {
							dataTemp.isPrimary = true;
						};
						dataConvert.push(dataTemp);
					};
					fs.writeFileSync("wallpapper.json", JSON.stringify(dataConvert));
					$(".block .description").html("Finished downloading " + dataResponse.name.en + ". Pass the wallpapper.json to <a href='https://github.com/mczachurski/wallpapper#readme' target='_blank'>wallpapper</a> for the final step of the conversion process.");
					$(".acd-btn-return").removeClass("acd-btn-return-disabled");
					$(".dl-link").removeClass("dl-link-disabled");
					process.chdir(__dirname);
				});
				break;
			case "gtw":
				for (i = 0; i < 12; i++) {
					dataLinks.push("https://di.update.sony.net/ACLK/wallpaper/" + dataResponse.id + "/3840_2160/fp/" + dataResponse.id + "_3840_2160_fp_" + (i + 1).toString().padStart(2, "0") + ".zip");
				};
				async.eachOfLimit(dataLinks, dataThreads, function (asyncData, key, callback) {
					$(".block .description").html("Downloading <a href='" + asyncData + "' target='_blank'>" + asyncData + "</a> (" + (key + 1) + " of " + dataLinks.length + ")...");
					request({
						url: asyncData,
						encoding: null
					}, function (error, _response, body) {
						if (error) {
							dataFilesErorr++;
							callback();
						} else {
							dataFilesSuccess++;
							new AdmZip(body).extractAllTo(process.cwd(), true);
							callback();
						};
					});
				}, function () {
					$(".block .description").html("Converting downloaded files to GNOME format...");
					const builder = require("xmlbuilder");
					var xml;
					var dataInit;
					for (i in dataResponse.fp) {
						if (isNaN(i)) {
							continue;
						};
						if (!dataInit) {
							dataInit = dataResponse.fp[i];
							xml = builder.create("background")
								.ele("starttime")
								.ele("year", "1970").up()
								.ele("month", "1").up()
								.ele("day", "1").up()
								.ele("hour", dataInit.slice(0, 2)).up()
								.ele("minute", dataInit.slice(2)).up()
								.ele("second", "0").up()
								.up();
						};
						var t;
						if (i != 1) {
							var h = dataResponse.fp[i].slice(0, 2);
							var m = dataResponse.fp[i].slice(2);
							t = h * 3600 + m * 60;
						} else {
							t = 0;
						};
						var tn;
						if (dataResponse.fp[Number(i) + 1]) {
							var hn = dataResponse.fp[Number(i) + 1].slice(0, 2);
							var mn = dataResponse.fp[Number(i) + 1].slice(2);
							tn = hn * 3600 + mn * 60;
						} else {
							tn = 86400;
						};
						xml.ele("static")
							.ele("duration", tn - t).up()
							.ele("file", dataResponse.id + "_3840_2160_fp_" + i + ".jpg").up();
					};
					xml = xml.end();
					fs.writeFileSync("timed.xml", xml);
					$(".block .description").html("Finished downloading " + dataResponse.name.en + ". To apply it, set the generated timed.xml file as wallpaper from the GNOME Tweak Tool.");
					$(".acd-btn-return").removeClass("acd-btn-return-disabled");
					$(".dl-link").removeClass("dl-link-disabled");
					process.chdir(__dirname);
				});
				break;
			default:
				$("body").append(`<div data-notification class="bx--toast-notification bx--toast-notification--error">
					<svg class="bx--toast-notification__icon" width="20" height="20"><path d="M10 1c-5 0-9 4-9 9s4 9 9 9 9-4 9-9-4-9-9-9zm-.8 4h1.5v7H9.2V5zm.8 11c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1z"></path></svg>
					<div class="bx--toast-notification__details">
						<h3 class="bx--toast-notification__title">Unexpected method ` + dataMethod + `!</h3>
						<p class="bx--toast-notification__caption">Please report this error on GitHub. Thank you!</p>
					</div>
					<button data-notification-btn class="bx--toast-notification__close-button">
						<svg class="bx--toast-notification__close-icon" width="16" height="16"><path d="M12 4.7l-.7-.7L8 7.3 4.7 4l-.7.7L7.3 8 4 11.3l.7.7L8 8.7l3.3 3.3.7-.7L8.7 8z"></path></svg>
					</button>
				</div>`);
				$(".block .description").remove();
				$(".acd-btn-return").removeClass("acd-btn-return-disabled");
				$(".dl-link").removeClass("dl-link-disabled");
				process.chdir(__dirname);
				break;
		};
	});
});
$(document).on("click", ".acd-btn-return", function () {
	$("#content").show();
	$(".download").remove();
	$(".bx--header__name").show();
	$(".acd-btn-return").remove();
});
$(document).on("click", ".bx--toast-notification__close-button", function () {
	$(this).parent().remove();
});
function main() {
	if ($("#toggle").prop("checked") == false) {
		return;
	};
	const fs = require("fs-extra");
	const request = require("request");
	var data = store.get("current");
	if (data) {
		request("https://www.sony.net/united/clock/assets/js/heritage_data.js", function (_error, _response, body) {
			eval(body);
			var temp = a_clock_heritage_data.filter(x => x.id == data);
			if (temp.length == 0) {
				$("body").append(`<div data-notification class="bx--toast-notification bx--toast-notification--warning">
					<svg class="bx--toast-notification__icon" width="20" height="20"><path d="M10 1c-5 0-9 4-9 9s4 9 9 9 9-4 9-9-4-9-9-9zm3.5 13.5l-8-8 1-1 8 8-1 1z"></path></svg>
					<div class="bx--toast-notification__details">
						<h3 class="bx--toast-notification__title">Scene not found!</h3>
						<p class="bx--toast-notification__caption">Please check your network connection and try again.</p>
					</div>
					<button data-notification-btn class="bx--toast-notification__close-button">
						<svg class="bx--toast-notification__close-icon" width="16" height="16"><path d="M12 4.7l-.7-.7L8 7.3 4.7 4l-.7.7L7.3 8 4 11.3l.7.7L8 8.7l3.3 3.3.7-.7L8.7 8z"></path></svg>
					</button>
				</div>`);
				$("#toggle").prop("checked", false);
				store.set("enabled", false);
			} else {
				var value = Object.values(temp[0].fp).filter(x => x < (new Date().getHours().toString() + new Date().getMinutes().toString()).padStart(4, "0")).sort().slice(-1)[0];
				if (value == undefined) {
					value = Object.values(temp[0].fp).sort().slice(-1)[0];
				};
				request({
					url: "https://di.update.sony.net/ACLK/wallpaper/" + temp[0].id + "/3840_2160/fp/" + temp[0].id + "_3840_2160_fp_" + Object.keys(temp[0].fp).find(x => temp[0].fp[x] == value) + ".zip",
					encoding: null
				}, function (_error, _response, body) {
					const AdmZip = require("adm-zip");
					var zip = new AdmZip(body);
					zip.extractEntryTo(zip.getEntries()[0].entryName, ".", false, true);
					const wallpaper = require("wallpaper");
					wallpaper.set(zip.getEntries()[0].entryName).then(function () {
						fs.unlinkSync(zip.getEntries()[0].entryName);
					});
				});
				const schedule = require("node-schedule");
				Object.values(schedule.scheduledJobs).map(job => {
					schedule.cancelJob(job.name);
				});
				for (i in temp[0].fp) {
					if (isNaN(i)) {
						continue;
					};
					j = "https://di.update.sony.net/ACLK/wallpaper/" + temp[0].id + "/3840_2160/fp/" + temp[0].id + "_3840_2160_fp_" + i + ".zip";
					schedule.scheduleJob(temp[0].fp[i].slice(2) + " " + temp[0].fp[i].slice(0, 2) + " * * *", function (j) {
						request({
							url: j,
							encoding: null
						}, function (_error, _response, body) {
							const AdmZip = require("adm-zip");
							var zip = new AdmZip(body);
							zip.extractEntryTo(zip.getEntries()[0].entryName, ".", false, true);
							const wallpaper = require("wallpaper");
							wallpaper.set(zip.getEntries()[0].entryName).then(function () {
								fs.unlinkSync(zip.getEntries()[0].entryName);
							});
						});
					}.bind(false, j));
				};
			};
		});
	} else {
		$("body").append(`<div data-notification class="bx--toast-notification bx--toast-notification--warning">
			<svg class="bx--toast-notification__icon" width="20" height="20"><path d="M10 1c-5 0-9 4-9 9s4 9 9 9 9-4 9-9-4-9-9-9zm3.5 13.5l-8-8 1-1 8 8-1 1z"></path></svg>
			<div class="bx--toast-notification__details">
				<h3 class="bx--toast-notification__title">No scene selected!</h3>
				<p class="bx--toast-notification__caption">Please select a scene and try again.</p>
			</div>
			<button data-notification-btn class="bx--toast-notification__close-button">
				<svg class="bx--toast-notification__close-icon" width="16" height="16"><path d="M12 4.7l-.7-.7L8 7.3 4.7 4l-.7.7L7.3 8 4 11.3l.7.7L8 8.7l3.3 3.3.7-.7L8.7 8z"></path></svg>
			</button>
		</div>`);
		$("#toggle").prop("checked", false);
		store.set("enabled", false);
	};
};
function name() {
	if (store.get("current")) {
		var data = store.get("current");
		if (data) {
			const request = require("request");
			request("https://www.sony.net/united/clock/assets/js/heritage_data.js", function (_error, _response, body) {
				eval(body);
				var temp = a_clock_heritage_data.filter(x => x.id == data);
				if (temp.length == 0) {
					$(".bx--header__name--prefix").text("");
				} else {
					$(".bx--header__name--prefix").text(temp[0].name.en);
					$(".acd-btn-select img").attr("src", "images/select-off.svg");
					$(".acd-btn-select[data='" + temp[0].id + "'] img").attr("src", "images/select-on.svg");
				};
			});
		} else {
			$(".bx--header__name--prefix").text("");
		};
	} else {
		$(".bx--header__name--prefix").text("");
	};
};
