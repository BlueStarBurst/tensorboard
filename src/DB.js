var version = "0.0.3";

export class DBManager {
	static instance = null;
	static getInstance() {
		if (DBManager.instance == null) {
			DBManager.instance = new DBManager();
		}
		return DBManager.instance;
	}

	constructor() {
		// get from local storage if exists
		this.db = JSON.parse(window.localStorage.getItem("tensorboardDB")) || {};
		this.history =
			JSON.parse(window.localStorage.getItem("tensorboardHistory")) || [];
		this.version = JSON.parse(window.localStorage.getItem("tensorboardVersion")) || "0";

		// if the version is different, clear the database
		if (this.version !== version) {
			this.db = {};
			this.version = version;
			window.localStorage.setItem("tensorboardVersion", JSON.stringify(version));
			this.history = [];
			this.save();
		}

		this.historyIndex = 0;
		this.undoing = false;
	}

	getItems() {
		return this.db;
	}

	getItem(key) {
		return this.db[key];
	}

	setItem(key, value) {
		this.db[key] = value;
		this.save();
	}

	setItems(items) {
		console.log("Setting items", items);
		this.db = items;
		this.save();
	}

	removeItem(key) {
		delete this.db[key];
		this.save();
	}

	save() {
		if (!this.undoing) {
			this.addToHistory();
		}
		this.undoing = false;
		window.localStorage.setItem("tensorboardDB", JSON.stringify(this.db));
	}

	addToHistory() {
		// if history index is not at the end, remove all the items after the index
		if (this.historyIndex > 0) {
			this.history = this.history.slice(this.historyIndex);
			this.historyIndex = 0;
		}

		this.history.unshift(this.db);
		if (this.history.length > 50) {
			this.history.pop();
		}
		this.saveHistory();
	}

	undo() {
		// use the history index to go back
		if (this.historyIndex < this.history.length - 1) {
			this.historyIndex++;
			this.db = this.history[this.historyIndex];
			this.undoing = true;
			this.save();
		}
	}

	redo() {
		// use the history index to go forward
		if (this.historyIndex > 0) {
			this.historyIndex--;
			this.db = this.history[this.historyIndex];
			this.undoing = true;
			this.save();
		}
	}

	saveHistory() {
		window.localStorage.setItem(
			"tensorboardHistory",
			JSON.stringify(this.history)
		);
	}
}
