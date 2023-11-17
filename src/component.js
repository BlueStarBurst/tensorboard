export class Component {
	constructor() {
		this.state = {};
        this.inputs = {};
        this.outputs = {};
        this.id = "";
	}

	setState(newState) {
		this.state = newState;
	}
}

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

	removeItem(key) {
		delete this.db[key];
		this.save();
	}

	save() {
		window.localStorage.setItem("tensorboardDB", JSON.stringify(this.db));
	}
}