var version = "0.0.4";

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
		this.db = JSON.parse(window.localStorage.getItem("tensorboardDB")) || {"elements": {}};
		this.history =
			JSON.parse(window.localStorage.getItem("tensorboardHistory")) || [JSON.stringify(this.db)];
		this.version =
			JSON.parse(window.localStorage.getItem("tensorboardVersion")) || "0";

		// if the version is different, clear the database
		if (this.version !== version) {
			this.db = {};
			this.version = version;
			window.localStorage.setItem(
				"tensorboardVersion",
				JSON.stringify(version)
			);
			this.history = [];
			this.save();
		}

		this.historyIndex =
			JSON.parse(window.localStorage.getItem("tensorboardHistoryIndex")) || 0;
		this.undoing = false;
	}

	getItems() {
		return this.db;
	}

	getItem(key) {
		return this.db[key];
	}

	jsonifyElements(elements) {
		if (!elements) {
			return {};
		}
		var elems = {};
		Object.keys(elements).forEach((key) => {
			elems[key] = elements[key];
			elems[key].component.inputs = {};
			elems[key].component.outputs = {};
			elems[key].component.helpers = {};
			elems[key].component.topInputs = {};
		});
		console.log("jsonifyElements", elems);
		return elems;
	}

	setItem(key, value) {
		console.log("Setting item", key, value);

		// if the value is the same, don't save
		var hist =
			key == "elements" &&
			JSON.stringify({ elements: this.jsonifyElements(this.db[key]) }) ==
				JSON.stringify({ elements: this.jsonifyElements(value) });
		if (hist) {
			console.log("Value is the same, not saving");
			return;
		}

		this.db[key] = value;
		this.save(key == "elements");
	}

	setItems(items) {
		// if the value is the same, don't save
		if (JSON.stringify(this.db) === JSON.stringify(items)) {
			console.log("Value is the same, not saving");
			return;
		}

		console.log("Setting items", items);
		this.db = items;
		this.save();
	}

	removeItem(key) {
		delete this.db[key];
		this.save();
	}

	save(hist = false) {
		if (hist) {
			if (!this.undoing) {
				this.addToHistory();
			} else {
				this.undoing = false;
			}
		}
		window.localStorage.setItem("tensorboardDB", JSON.stringify(this.db));
	}

	addToHistory() {
		console.log("adding to history", this.historyIndex);
		// if history index is not at the end, remove all the items after the index
		if (this.historyIndex > 0) {
			this.history = this.history.slice(this.historyIndex);
			this.historyIndex = 0;
		}

		this.history.unshift(JSON.stringify(this.db));
		if (this.history.length > 50) {
			this.history.pop();
		}
		this.saveHistory();
	}

	undo() {
		// use the history index to go back
		if (this.historyIndex < this.history.length - 1) {
			console.log("undoing");
			this.undoing = true;
			this.historyIndex++;
			this.db = JSON.parse(this.history[this.historyIndex]);
			this.save();
		}
	}

	redo() {
		// use the history index to go forward
		if (this.historyIndex > 0) {
			this.undoing = true;
			this.historyIndex--;
			this.db = JSON.parse(this.history[this.historyIndex]);
			this.save();
		}
	}

	saveHistory() {
		window.localStorage.setItem(
			"tensorboardHistory",
			JSON.stringify(this.history)
		);
		window.localStorage.setItem(
			"tensorboardHistoryIndex",
			JSON.stringify(this.historyIndex)
		);
	}
}
