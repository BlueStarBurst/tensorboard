export const components = {
	Data: {
		name: "Data",
		// color: "#F1AB86",
		color: "#9e6649",
		description:
			"This component is used to download data from a remote URL for model training",
		id: -1,
		numInputs: 0,
		numOutputs: -1,
		data: {
			Type: {
				type: "radio",
				options: ["HuggingFace", "Zip"],
				value: "HuggingFace",
				hidden: false,
			},
			URL: {
				type: "text",
				value: "",
				hidden: true,
			},
			RepoID: {
				type: "text",
				value: "",
				hidden: false,
			},
			FileName: {
				type: "text",
				value: "",
				hidden: false,
			},
		},
		transpile: function () {
			// console.log("TRANSPILING", this.id, this.data);
			if (this.data.Type.value == "HuggingFace") {
				return `from huggingface_hub import hf_hub_download\nimport pandas as pd\nprint('Downloading data from https://hugingface.com/${
					this.data.RepoID.value
				}')\n${this.getOutput()} = pd.read_csv(\n\thf_hub_download(repo_id="${
					this.data.RepoID.value
				}", filename="${this.data.FileName.value}", repo_type="dataset")\n)`;
			} else {
				return `print('Downloading data from ${this.data.URL.value}')\n!wget -O dataset.zip ${this.data.URL.value}`;
			}
		},
		reload: function () {
			if (this.data.Type.value == "HuggingFace") {
				this.data.RepoID.hidden = false;
				this.data.FileName.hidden = false;
				this.data.URL.hidden = true;
			} else {
				this.data.RepoID.hidden = true;
				this.data.FileName.hidden = true;
				this.data.URL.hidden = false;
			}
		},
		outputs: [],
		inputs: [],
		getOutput: function () {
			return this.output + this.id;
		},
		output: "dataset",
	},
	Normalize: {
		name: "Normalize",
		description: "Normalizes the input data",
		numInputs: 1,
		numOutputs: -1,
		color: "#6A2E35",
		data: {
			Range: {
				type: "slider",
				value: 255.0,
				step: 0.01,
			},
			Translate: {
				type: "slider",
				value: 0,
				step: 0.01,
			},
		},
		transpile: function () {
			return `print('Normalizing data')`;
		},
		reload: function () {},
		outputs: [],
		inputs: [],
		getOutput: function () {
			return this.output + this.id;
		},
		output: "norm",
	},
	Value: {
		name: "Value",
		description: "Create variables of different types",
		color: "#943854",
		numInputs: 1,
		numOutputs: -1,
		data: {
			Type: {
				type: "radio",
				options: ["Integer", "String", "Float", "Boolean", "Other"],
				value: "Integer",
				hidden: false,
			},
			Integer: {
				type: "slider",
				value: 0,
				min: -100,
				max: 100,
				step: 1,
				hidden: false,
			},
			String: {
				type: "text",
				value: "",
				hidden: true,
			},
			Float: {
				type: "slider",
				value: 0.0,
				min: -100,
				max: 100,
				step: 0.01,
				hidden: true,
			},
			Boolean: {
				type: "checkbox",
				value: "False",
				hidden: true,
			},
			Other: {
				type: "text",
				value: "",
				readonly: true,
				hidden: true,
			},
		},
		transpile: function () {
			// if this has an input, return the first input
			if (Object.keys(this.inputs).length > 0) {
				this.data.Type.value = "Other";
				this.data.Integer.hidden = true;
				this.data.String.hidden = true;
				this.data.Float.hidden = true;
				this.data.Boolean.hidden = true;
				this.data.Other.hidden = false;
				this.data.Other.value = this.inputs[Object.keys(this.inputs)[0]].getOutput();
				return `${this.getOutput()} = ${this.inputs[Object.keys(this.inputs)[0]].getOutput()}`;
			}

			if (this.data.Type.value == "Integer") {
				return `${this.getOutput()} = ${this.data.Integer.value}`;
			} else if (this.data.Type.value == "String") {
				return `${this.getOutput()} = "${this.data.String.value}"`;
			} else if (this.data.Type.value == "Float") {
				return `${this.getOutput()} = ${this.data.Float.value}`;
			} else if (this.data.Type.value == "Boolean") {
				return `${this.getOutput()} = ${this.data.Boolean.value}`;
			} else {
				return `${this.getOutput()} = ${this.data.Other.value}`;
			}
		},
		reload: function () {
			if (this.data.Type.value == "Integer") {
				this.data.Integer.hidden = false;
				this.data.String.hidden = true;
				this.data.Float.hidden = true;
				this.data.Boolean.hidden = true;
				this.data.Other.hidden = true;
			} else if (this.data.Type.value == "String") {
				this.data.Integer.hidden = true;
				this.data.String.hidden = false;
				this.data.Float.hidden = true;
				this.data.Boolean.hidden = true;
				this.data.Other.hidden = true;
			} else if (this.data.Type.value == "Float") {
				this.data.Integer.hidden = true;
				this.data.String.hidden = true;
				this.data.Float.hidden = false;
				this.data.Boolean.hidden = true;
				this.data.Other.hidden = true;
			} else if (this.data.Type.value == "Boolean") {
				this.data.Integer.hidden = true;
				this.data.String.hidden = true;
				this.data.Float.hidden = true;
				this.data.Boolean.hidden = false;
				this.data.Other.hidden = true;
			} else {
				this.data.Integer.hidden = true;
				this.data.String.hidden = true;
				this.data.Float.hidden = true;
				this.data.Boolean.hidden = true;
				this.data.Other.hidden = false;
			}
		},
		outputs: [],
		inputs: [],
		getOutput: function () {
			return this.data.Type.value.toLowerCase() + this.id;
		},
		getValue: function () {
			if (this.data.Type.value == "Integer") {
				return this.data.Integer.value;
			} else if (this.data.Type.value == "String") {
				return this.data.String.value;
			} else if (this.data.Type.value == "Float") {
				return this.data.Float.value;
			} else if (this.data.Type.value == "Boolean") {
				return this.data.Boolean.value;
			} else {
				return this.data.Other.value;
			}
		},
		output: "value",
	},
	Library: {
		name: "Library",
		description: "Install a library from pip",
		color: "#403e9c",
		priority: 1,
		numInputs: 0,
		numOutputs: -1,
		data: {
			UseVersion: {
				type: "checkbox",
				value: "False",
				hidden: false,
			},
			Library: {
				type: "text",
				value: "",
				hidden: false,
			},
			Version: {
				type: "text",
				value: "",
				hidden: true,
			},
		},
		transpile: function () {
			if (this.data.Version.value) {
				return `%pip install ${this.data.Library.value}==${this.data.Version.value}`;
			}
			return `%pip install ${this.data.Library.value}`;
		},
		reload: function () {
			if (this.data.UseVersion.value == "True") {
				this.data.Version.hidden = false;
			} else {
				this.data.Version.hidden = true;
			}
		},
		outputs: [],
		inputs: [],
		getOutput: function () {
			return this.output + this.id;
		},
		output: "library",
	},
	Import: {
		name: "Import",
		description: "Import a library or module",
		color: "#7f538c",
		priority: 2,
		numInputs: 1,
		numOutputs: -1,
		data: {
			from: {
				type: "text",
				value: "",
			},
			import: {
				type: "text",
				value: "",
			},
			as: {
				type: "text",
				value: "",
			},
		},
		transpile: function () {
			var output = "";
			if (this.data.from.value) {
				output += `from ${this.data.from.value} `;
			}
			if (this.data.as.value) {
				return (
					output + `import ${this.data.import.value} as ${this.data.as.value}`
				);
			}
			return output + `import ${this.data.import.value}`;
		},
		reload: function () {},
		outputs: [],
		inputs: [],
		getOutput: function () {
			return this.output + this.id;
		},
		output: "import",
	},
	Array: {
		name: "Array",
		color: "#0c6fab",
		numInputs: -1,
		numOutputs: -1,
		description: "Use Values as inputs to create an array of values",
		data: {
			Data: {
				type: "text",
				value: "text",
				readonly: true,
				hidden: false,
			},
		},
		transpile: function () {
			// get the outputs of the inputs

			var vals = [];
			var outputs = Object.keys(this.inputs).map((key, index) => {
				var input = this.inputs[key];
				if (input.getValue) {
					vals.push(input.getValue());
				}
				return input.getOutput();
			});
			console.log(outputs);

			this.data.Data.value = `[${vals.join(", ")}]`;

			// return an array of the outputs
			return `${this.getOutput()} = [${outputs.join(", ")}]`;
		},
		reload: function () {},
		getOutput: function () {
			return "array" + this.id;
		},
		getValue: function () {
			return this.data.Data.value;
		},
	},
	Print: {
		name: "Print",
		description: "Print a value to the console",
		color: "#4a8260",
		numInputs: 1,
		numOutputs: 0,
		data: {
			Output: {
				type: "text",
				value: "",
				readonly: false,
				hidden: false,
			},
		},
		transpile: function () {
			// if there is an input, print the input
			if (Object.keys(this.inputs).length > 0) {
				// print all the inputs

				var outputs = Object.keys(this.inputs).map((key, index) => {
					if (this.inputs[key].getValue) {
						return this.inputs[key].getValue();
					} else if (this.inputs[key].getOutput) {
						return this.inputs[key].getOutput();
					}
				});
				this.data.Output.value = outputs.join(", ");
				this.data.Output.readonly = true;

				var trueOutputs = Object.keys(this.inputs).map((key, index) => {
					return this.inputs[key].getOutput();
				});

				return `print(${trueOutputs.join(", ")})`;
			} else {
				// print the value
				this.data.Output.readonly = false;
				return `print("${this.data.Output.value}")`;
			}
		},
		reload: function () {},
		getOutput: function () {
			return this.output + this.id;
		},
		output: "print",
	},
	Connector: {
		name: "Connector",
		description:
			"Connects multiple components together to help manage the flow of the notebook. It can also connect to blocks that don't have any inputs.",
		color: "#424651",
		numInputs: -1,
		numOutputs: -1,
		data: {},
		transpile: function () {
			return "";
		},
		reload: function () {},
		outputs: [],
		inputs: [],
		getOutput: function () {
			return this.output + this.id;
		},
		output: "connector",
	},
	CustomCode: {
		name: "CustomCode",
		description: "Write custom code!",
		color: "#3d3d3d",
		numInputs: 0,
		numOutputs: -1,
		bot: true,
		data: {
			Type: {
				type: "radio",
				options: ["Snippet", "Function", "Class"],
				value: "Snippet",
				hidden: false,
			},
			Parameters: {
				type: "slider",
				value: 3,
				min: 0,
				max: 10,
				hidden: true,
			},
			Code: {
				type: "text",
				value:
					'# This is a code snippet!\nprint("Hello World!")\nfor i in range(0,4)\n\tprint(i)',
				multiline: true,
				rows: 5,
				hidden: false,
			},
		},
		transpile: function () {
			var params = "";
			// add the parameters starting from a to z
			for (var i = 0; i < this.data.Parameters.value; i++) {
				// if less than 26, add the letter
				if (i < 26) {
					params += String.fromCharCode(97 + i) + ", ";
				} else {
					params += "param" + (i - 25) + ", ";
				}
			}
			// remove the last comma
			params = params.slice(0, -2);
			if (this.data.Type.value == "Snippet") {
				return this.data.Code.value;
			} else if (this.data.Type.value == "Function") {
				var head = `def ${this.output + this.id}(${params}):\n`;
				// add tabs to the code
				var lines = this.data.Code.value.split("\n");
				var body = lines.map((line) => {
					return "\t" + line;
				});
				return head + body.join("\n");
			} else if (this.data.Type.value == "Class") {
				var head = `class ${this.getOutput()}:\n`;
				var init = `\tdef __init__(self, ${params}):\n\t\t# this is the constructor!\n`;
				// add tabs to the code
				var lines = this.data.Code.value.split("\n");
				var body = lines.map((line) => {
					return "\t" + line;
				});
				return head + init + body.join("\n");
			}
		},
		reload: function () {
			if (this.data.Type.value == "Snippet") {
				this.data.Parameters.hidden = true;
			} else if (this.data.Type.value == "Function") {
				this.data.Parameters.hidden = false;
			} else if (this.data.Type.value == "Class") {
				this.data.Parameters.hidden = true;
			}
		},
		outputs: {},
		inputs: {},
		helpers: {},
		priority: 3,
		getOutput: function () {
			if (
				this.data.Type.value == "Class" ||
				this.data.Type.value == "Function"
			) {
				return this.output + this.id + "()";
			}
			return this.output + this.id;
		},
		getHelp: function () {
			if (this.data.Type.value == "Function") {
				// return ["functionName(", "null", ")"];
				var start = this.output + this.id + "(";
				var end = ")";
				var params = [];
				for (var i = 0; i < this.data.Parameters.value; i++) {
					params.push("null");
					params.push(", ");
				}
				params.pop();
				return [start].concat(params).concat([end]);
			} else if (this.data.Type.value == "Class") {
				var start = this.output + this.id + "(";
				var end = ")";
				var params = [];
				for (var i = 0; i < this.data.Parameters.value; i++) {
					params.push("null");
					params.push(", ");
				}
				params.pop();
				return [start].concat(params).concat([end]);
			} else {
				return [this.output + this.id];
			}
		},
		output: "custom",
	},
	Helper: {
		name: "Helper",
		description: "A helper component to help manage the flow of the notebook",
		color: "#3d3d3d",
		numInputs: 1,
		numOutputs: 1,
		top: true,
		bot: true,
		data: {
			Help: {
				type: "text",
				value: "",
				readonly: true,
				hidden: false,
			},
		},
		transpile: function () {
			var input = [];
			var vals = [];
			if (Object.keys(this.inputs).length > 0) {
				input = Object.keys(this.inputs).map((key, index) => {
					return this.inputs[key].getOutput();
				});
				vals = Object.keys(this.inputs).map((key, index) => {
					if (this.inputs[key].getValue) return this.inputs[key].getValue();
					else return this.inputs[key].getOutput();
				});
			}
			console.log("RELOADING HELPER");
			console.log(this.helpers);
			if (Object.keys(this.helpers).length > 0) {
				var helper = this.helpers[Object.keys(this.helpers)[0]];
				var help = helper.getHelp();
				var help2 = helper.getHelp();
				if (help == null) {
					return `print("Helper")`;
				}
				// for every input, replace the @ with the input
				for (var i = 0; i < input.length; i++) {
					// find a null in the help
					var index = help.indexOf("null");
					if (index > -1) {
						help[index] = input[i];
						help2[index] = vals[i];
					}
				}
				this.data.Help.value = help2.join("");
				return this.getOutput() + " = " + help.join("");
			}
			return `print("Helper")`;
		},
		reload: function () {
			return this.transpile();
		},
		getHelp: function () {
			if (Object.keys(this.helpers).length > 0) {
				var helper = this.helpers[Object.keys(this.helpers)[0]];
				var help = helper.getHelp();
				return help;
			}
		},
		outputs: [],
		inputs: [],
		helpers: {},
		topInputs: {},
		getOutput: function () {
			return this.output + this.id;
		},
		getValue: function () {
			return this.data.Help.value;
		},
		output: "helper",
	},
};
