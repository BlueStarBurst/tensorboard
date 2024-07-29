function getInputOfType(inputs: Inputs, type: string) {
    for (let i = 0; i < Object.keys(inputs).length; i++) {
        if (inputs[Object.keys(inputs)[i]].name == type) {
            return inputs[Object.keys(inputs)[i]];
        }
    }
    return null;
}

function getInputsOfType(inputs: Inputs, type: string) {
    let inputsOfType = [];
    for (let i = 0; i < Object.keys(inputs).length; i++) {
        if (inputs[Object.keys(inputs)[i]].name == type) {
            inputsOfType.push(inputs[Object.keys(inputs)[i]]);
        }
    }
    return inputsOfType;
}

type Inputs = {
    [key: string]: Component;
};

type Data = {
    [key: string]: {
        type: string;
        value: any;
        hidden?: boolean;
        readonly?: boolean;
        trueValue?: any;
        options?: string[];
        step?: number;
        min?: number;
        max?: number;
        multiline?: boolean;
        rows?: number;
    };
};

export type Component = {
    bot?: boolean;
    top?: boolean;
    topInputs?: {
        [key: string]: Component;
    }
    name: string;
    description: string;
    color: string;
    id: number;
    priority: number;
    numInputs: number;
    numOutputs: number;
    data: Data;
    inputs: {
        [key: string]: Component;
    };
    outputs: {
        [key: string]: Component;
    };
    helpers: {
        [key: string]: Component;
    };
    transpile: () => string;
    getOutput: () => string | null;
    reload: () => void;
    getValue: () => any;
    getHelp: () => string[] | undefined;
    output: string;
};

const defaultComponent: Component = {
    bot: false,
    top: false,
    name: "Default",
    description: "Default component",
    color: "#000000",
    id: -1,
    data: {},
    inputs: {},
    outputs: {},
    helpers: {},
    priority: 0,
    numInputs: 0,
    numOutputs: 0,
    transpile: function () {
        return "";
    },
    getOutput: function () {
        return null;
    },
    reload: function () { },
    getValue: function () {
        return null;
    },
    getHelp: function () {
        return [];
    },
    output: "default",
};


const components = {} as { [key: string]: Component };

components["Numpy"] = {
    ...defaultComponent,
    name: "Numpy",
    color: "#7f538c",
    id: -1,
    priority: 2,
    numInputs: 0,
    numOutputs: -1,
    data: {},
    description:
        "This component is used to import the numpy library for mathematical operations",
    transpile: function () {
        return `%pip install numpy\nimport numpy as np`;
    },
    getOutput: function () {
        return null;
    },
    reload: function () { },
    getValue: function () {
        return null;
    },
};

components["Scipy"] = {
    ...defaultComponent,
    name: "Scipy",
    color: "#7f538c",
    id: -1,
    priority: 2,
    numInputs: 0,
    numOutputs: -1,
    data: {},
    description:
        "This component is used to import the scipy library for mathematical operations",
    transpile: function () {
        return `%pip install scipy\nimport scipy`;
    },
    getOutput: function () {
        return null;
    },
    reload: function () { },
    getValue: function () {
        return null;
    },
};

components["Matplotlib"] = {
    ...defaultComponent,
    name: "Matplotlib",
    color: "#7f538c",
    id: -1,
    priority: 2,
    numInputs: 0,
    numOutputs: -1,
    data: {},
    description:
        "This component is used to import the matplotlib library for plotting graphs",
    transpile: function () {
        return `%pip install matplotlib\nimport matplotlib.cm as cm\nimport matplotlib.pyplot as plt\nimport io\nimport base64`;
    },
    getOutput: function () {
        return null;
    },
    reload: function () { },
    getValue: function () {
        return null;
    },
};

components["Collections"] = {
    ...defaultComponent,
    name: "Collections",
    color: "#7f538c",
    id: -1,
    priority: 2,
    numInputs: 0,
    numOutputs: -1,
    data: {},
    description:
        "This component is used to import the collections library for python data structures",
    transpile: function () {
        return `import collections`;
    },
    getOutput: function () {
        return null;
    },
    reload: function () { },
    getValue: function () {
        return null;
    },
};

components["Data"] = {
    ...defaultComponent,
    name: "Data",
    // color: "#F1AB86",
    color: "#c2734a",
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
            return `from huggingface_hub import hf_hub_download\nimport pandas as pd\nprint('Downloading data from https://hugingface.com/${this.data.RepoID.value
                }')\n${this.getOutput()} = pd.read_csv(\n\thf_hub_download(repo_id="${this.data.RepoID.value
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
    outputs: {},
    inputs: {},
    getOutput: function () {
        return this.output + this.id;
    },
    output: "dataset",
    getValue: function () {
        return null;
    }
};

components["Normalize"] = {
    ...defaultComponent,
    name: "Normalize",
    description: "Normalizes the input data",
    numInputs: 1,
    numOutputs: -1,
    color: "#a3313e",
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
        // if this has an input, return the first input
        if (Object.keys(this.inputs).length > 0) {
            return `${this.getOutput()} = ${this.inputs[
                Object.keys(this.inputs)[0]
            ].getOutput()} / ${this.data.Range.value} - ${this.data.Translate.value
                }`;
        }
        return `print('Normalizing data')`;
    },
    reload: function () { },
    outputs: {},
    inputs: {},
    getOutput: function () {
        return this.output + this.id;
    },
    output: "norm",
    getValue: function () {
        return null;
    }
};

components["Value"] = {
    ...defaultComponent,
    name: "Value",
    description: "Create variables of different types",
    color: "#c42b59",
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
            trueValue: "",
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
            this.data.Other.value =
                this.inputs[Object.keys(this.inputs)[0]].getOutput();
            this.data.Other.trueValue = this.inputs[Object.keys(this.inputs)[0]]
                .getValue()
                ? this.inputs[Object.keys(this.inputs)[0]].getValue()
                : this.inputs[Object.keys(this.inputs)[0]].getOutput();
            return `${this.getOutput()} = ${this.inputs[
                Object.keys(this.inputs)[0]
            ].getOutput()}`;
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
    outputs: {},
    inputs: {},
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
            return this.data.Other.trueValue;
        }
    },
    output: "value",
};

components["Operator"] = {
    ...defaultComponent,
    name: "Operator",
    description: "Create operator that can operate value(s)",
    color: "#2b3da1",
    numInputs: 1,
    numOutputs: -1,
    data: {
        Type: {
            type: "radio",
            options: [
                "Add",
                "Subtract",
                "Multiply",
                "Divide",
                "Modulus",
                "Exponent",
                "Root",
                "Logarithm",
                "Sine",
                "Cosine",
                "Tangent",
                "Secant",
                "Cosecant",
                "Cotangent",
                "Arcsine",
                "Arccosine",
                "Arctangent",
                "Factorial",
            ],
            value: "Integer",
            hidden: false,
        },
        Add: {
            type: "checkbox",
            value: "False",
            hidden: true,
        },
        Subtract: {
            type: "checkbox",
            value: "False",
            hidden: true,
        },
        Multiply: {
            type: "checkbox",
            value: "False",
            hidden: true,
        },
        Divide: {
            type: "checkbox",
            value: "False",
            hidden: true,
        },
        Modulus: {
            type: "checkbox",
            value: "False",
            hidden: true,
        },
        Exponent: {
            type: "checkbox",
            value: "False",
            hidden: true,
        },
        Root: {
            type: "checkbox",
            value: "False",
            hidden: true,
        },
        Logarithm: {
            type: "checkbox",
            value: "False",
            hidden: true,
        },
        Sine: {
            type: "checkbox",
            value: "False",
            hidden: true,
        },
        Cosine: {
            type: "checkbox",
            value: "False",
            hidden: true,
        },
        Tangent: {
            type: "checkbox",
            value: "False",
            hidden: true,
        },
        Secant: {
            type: "checkbox",
            value: "False",
            hidden: true,
        },
        Cosecant: {
            type: "checkbox",
            value: "False",
            hidden: true,
        },
        Cotangent: {
            type: "checkbox",
            value: "False",
            hidden: true,
        },
        Arcsine: {
            type: "checkbox",
            value: "False",
            hidden: true,
        },
        Arccosine: {
            type: "checkbox",
            value: "False",
            hidden: true,
        },
        Arctangent: {
            type: "checkbox",
            value: "False",
            hidden: true,
        },
        Factorial: {
            type: "checkbox",
            value: "False",
            hidden: true,
        },
    },
    transpile: function () {
        if (Object.keys(this.inputs).length == 2) {
            if (this.data.Type.value == "Add") {
                return (
                    this.getOutput() +
                    " = " +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                    " + " +
                    this.inputs[Object.keys(this.inputs)[1]].getOutput()
                );
            }
            if (this.data.Type.value == "Subtract") {
                return (
                    this.getOutput() +
                    " = " +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                    " - " +
                    this.inputs[Object.keys(this.inputs)[1]].getOutput()
                );
            }
            if (this.data.Type.value == "Multiply") {
                return (
                    this.getOutput() +
                    " = " +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                    " * " +
                    this.inputs[Object.keys(this.inputs)[1]].getOutput()
                );
            }
            if (this.data.Type.value == "Divide") {
                return (
                    this.getOutput() +
                    " = " +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                    " / " +
                    this.inputs[Object.keys(this.inputs)[1]].getOutput()
                );
            }
            if (this.data.Type.value == "Modulus") {
                return (
                    this.getOutput() +
                    " = " +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                    " % " +
                    this.inputs[Object.keys(this.inputs)[1]].getOutput()
                );
            }
            if (this.data.Type.value == "Exponent") {
                return (
                    this.getOutput() +
                    " = " +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                    " ** " +
                    this.inputs[Object.keys(this.inputs)[1]].getOutput()
                );
            }
            if (this.data.Type.value == "Root") {
                return (
                    this.getOutput() +
                    " = " +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                    " **(1/" +
                    this.inputs[Object.keys(this.inputs)[1]].getOutput() +
                    ")"
                );
            }
            if (this.data.Type.value == "Logarithm") {
                return (
                    this.getOutput() +
                    " = math.log(" +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                    " , " +
                    this.inputs[Object.keys(this.inputs)[1]].getOutput() +
                    ")"
                );
            }
        }

        if (Object.keys(this.inputs).length == 1) {
            if (this.data.Type.value == "Sine") {
                return (
                    this.getOutput() +
                    " = math.sin(" +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                    ")"
                );
            }
            if (this.data.Type.value == "Cosine") {
                return (
                    this.getOutput() +
                    " = math.cos(" +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                    ")"
                );
            }
            if (this.data.Type.value == "Tangent") {
                return (
                    this.getOutput() +
                    " = math.tan(" +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                    ")"
                );
            }
            if (this.data.Type.value == "Secant") {
                return (
                    this.getOutput() +
                    " = 1/(math.cos(" +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                    "))"
                );
            }
            if (this.data.Type.value == "Cosecant") {
                return (
                    this.getOutput() +
                    " = 1/(math.sin(" +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                    "))"
                );
            }
            if (this.data.Type.value == "Cotangent") {
                return (
                    this.getOutput() +
                    " = 1/(math.tan(" +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                    "))"
                );
            }
            if (this.data.Type.value == "Arcsine") {
                return (
                    this.getOutput() +
                    " = np.arcsin(" +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                    ")"
                );
            }
            if (this.data.Type.value == "Arccosine") {
                return (
                    this.getOutput() +
                    " = np.arccos(" +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                    ")"
                );
            }
            if (this.data.Type.value == "Arctangent") {
                return (
                    this.getOutput() +
                    " = np.arctan(" +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                    ")"
                );
            }
            if (this.data.Type.value == "Factorial") {
                return (
                    this.getOutput() +
                    " = math.factorial(" +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                    ")"
                );
            }
        }

        return "";
    },
    reload: function () { },
    outputs: {},
    inputs: {},
    getOutput: function () {
        return "Operator" + this.id;
    },
    getValue: function () {
        return null;
    },
    output: "value",
};

components["ArrayListOperator"] = {
    ...defaultComponent,
    name: "Arraylist Operator",
    description: "Create arraylist operator that can operate value(s)",
    color: "#3a4563",
    numInputs: 1,
    numOutputs: -1,
    data: {
        Type: {
            type: "radio",
            options: ["Append", "Count", "Index", "Pop", "Remove", "Reverse"],
            value: "Integer",
            hidden: false,
        },
    },
    transpile: function () {
        if (Object.keys(this.inputs).length > 1) {
            if (this.data.Type.value == "Append") {
                return (
                    this.getOutput() +
                    " = " +
                    this.inputs[Object.keys(this.inputs)[1]].getOutput() +
                    " + " +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput()
                );
            }
            if (this.data.Type.value == "Count") {
                return (
                    this.getOutput() +
                    " = " +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                    ".count(" +
                    this.inputs[Object.keys(this.inputs)[1]].getOutput() + ")"
                );
            }
            if (this.data.Type.value == "Index") {
                return (
                    this.getOutput() +
                    " = " +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                    ".index(" +
                    this.inputs[Object.keys(this.inputs)[1]].getOutput() + ")"
                );
            }
            if (this.data.Type.value == "Pop") {
                return (
                    this.getOutput() +
                    " = " +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                    ".pop(" +
                    this.inputs[Object.keys(this.inputs)[1]].getOutput() + ")"
                );
            }
            if (this.data.Type.value == "Remove") {
                return (
                    this.getOutput() +
                    " = " +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                    ".remove(" +
                    this.inputs[Object.keys(this.inputs)[1]].getOutput() + ")"
                );
            }
        }
        if (Object.keys(this.inputs).length == 1) {
            if (this.data.Type.value == "Reverse") {
                return (
                    this.getOutput() +
                    " = " +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                    ".reverse()"
                );
            }
        }
        return "";
    },
    reload: function () { },
    outputs: {},
    inputs: {},
    getOutput: function () {
        return "ArraylistOperator" + this.id;
    },
    getValue: function () {
        return null;
    },
    output: "value",
};

components["LinkedListOperator"] = {
    ...defaultComponent,
    name: "Linkedlist Operator",
    description: "Create arraylist operator that can operate value(s)",
    color: "#444737",
    numInputs: 1,
    numOutputs: -1,
    data: {
        Type: {
            type: "radio",
            options: ["Append", "Insert", "Pop", "Remove"],
            value: "Integer",
            hidden: false,
        },
    },
    transpile: function () {
        const linkedList = getInputOfType(this.inputs, "Linked List");

        if (linkedList == null) {
            return "";
        }

        if (this.data.Type.value == "Append") {
            const value = getInputOfType(this.inputs, "Value");

            if (value == null) {
                return "";
            }

            console.log(linkedList.getOutput());
            return (
                linkedList.getOutput() +
                ".append(" +
                value.getOutput() + ")"
            );
        }
        if (this.data.Type.value == "Insert") {
            return (
                this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                ".insert(" +
                this.inputs[Object.keys(this.inputs)[1]].getOutput() + ", " +
                this.inputs[Object.keys(this.inputs)[2]].getOutput() + ")"
            );
        }
        if (this.data.Type.value == "Pop") {
            return (
                this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                ".pop() "
            );
        }
        if (this.data.Type.value == "Remove") {
            return (
                this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                ".remove(" +
                this.inputs[Object.keys(this.inputs)[1]].getOutput() + ")"
            );
        }
        return "";
    },
    reload: function () { },
    outputs: {},
    inputs: {},
    getOutput: function () {
        let linkedList = getInputOfType(this.inputs, "Linked List");
        return linkedList?.getOutput() ?? null;
    },
    getValue: function () {
        return null;
    },
    output: "value",
};

components["StacksOperator"] = {
    ...defaultComponent,
    name: "Stacks Operator",
    description: "Create arraylist operator that can operate value(s)",
    color: "#428878",
    numInputs: 1,
    numOutputs: -1,
    data: {
        Type: {
            type: "radio",
            options: ["WIP"],
            value: "Integer",
            hidden: false,
        },
    },
    transpile: function () {
        return "";
    },
    reload: function () { },
    outputs: {},
    inputs: {},
    getOutput: function () {
        return "StacksOperator" + this.id;
    },
    getValue: function () {
        return null;
    },
    output: "value",
};

components["QueueOperator"] = {
    ...defaultComponent,
    name: "Queue Operator",
    description: "Create arraylist operator that can operate value(s)",
    color: "#583877",
    numInputs: 1,
    numOutputs: -1,
    data: {
        Type: {
            type: "radio",
            options: ["WIP"],
            value: "Integer",
            hidden: false,
        },
    },
    transpile: function () {
        return "";
    },
    reload: function () { },
    outputs: {},
    inputs: {},
    getOutput: function () {
        return "QueueOperator" + this.id;
    },
    getValue: function () {
        return null;
    },
    output: "value",
};

components["BinaryTreeOperator"] = {
    ...defaultComponent,
    name: "Binary Tree Operator",
    description: "Create arraylist operator that can operate value(s)",
    color: "#289877",
    numInputs: 1,
    numOutputs: -1,
    data: {
        Type: {
            type: "radio",
            options: ["WIP"],
            value: "Integer",
            hidden: false,
        },
    },
    transpile: function () {
        return "";
    },
    reload: function () { },
    outputs: {},
    inputs: {},
    getOutput: function () {
        return "BinaryTreeOperator" + this.id;
    },
    getValue: function () {
        return null;
    },
    output: "value",
};

components["HashingOperator"] = {
    ...defaultComponent,
    name: "Hashing Operator",
    description: "Create arraylist operator that can operate value(s)",
    color: "#374577",
    numInputs: 1,
    numOutputs: -1,
    data: {
        Type: {
            type: "radio",
            options: ["WIP"],
            value: "Integer",
            hidden: false,
        },
    },
    transpile: function () {
        return "";
    },
    reload: function () { },
    outputs: {},
    inputs: {},
    getOutput: function () {
        return "HashingOperator" + this.id;
    },
    getValue: function () {
        return null;
    },
    output: "value",
};

components["BooleanOperator"] = {
    ...defaultComponent,
    name: "Boolean Operator",
    description: "Create boolean operator that can operate value(s)",
    color: "#428737",
    numInputs: 1,
    numOutputs: -1,
    data: {
        Type: {
            type: "radio",
            options: ["Or", "And", "Not", "Xor", "Nand", "Nor", "Xnor"],
            value: "Integer",
            hidden: false,
        },
    },
    transpile: function () {
        if (Object.keys(this.inputs).length > 1) {
            if (this.data.Type.value == "Or") {
                return (
                    this.getOutput() +
                    " = " +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                    " or " +
                    this.inputs[Object.keys(this.inputs)[1]].getOutput()
                );
            }
            if (this.data.Type.value == "And") {
                return (
                    this.getOutput() +
                    " = " +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                    " and " +
                    this.inputs[Object.keys(this.inputs)[1]].getOutput()
                );
            }
            if (this.data.Type.value == "Not") {
                return (
                    this.getOutput() +
                    " = not(" +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                    ")"
                );
            }
            if (this.data.Type.value == "Xor") {
                return (
                    this.getOutput() +
                    " = " +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                    " ^ " +
                    this.inputs[Object.keys(this.inputs)[1]].getOutput()
                );
            }
            if (this.data.Type.value == "Nand") {
                return (
                    this.getOutput() +
                    " = not(" +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                    " and " +
                    this.inputs[Object.keys(this.inputs)[1]].getOutput() +
                    ")"
                );
            }
            if (this.data.Type.value == "Nor") {
                return (
                    this.getOutput() +
                    " = not(" +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                    " or " +
                    this.inputs[Object.keys(this.inputs)[1]].getOutput() +
                    ")"
                );
            }
            if (this.data.Type.value == "Xnor") {
                return (
                    this.getOutput() +
                    " = not(" +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                    " ^ " +
                    this.inputs[Object.keys(this.inputs)[1]].getOutput() +
                    ")"
                );
            }
        }

        return "";
    },
    reload: function () { },
    outputs: {},
    inputs: {},
    getOutput: function () {
        return "BooleanOperator" + this.id;
    },
    getValue: function () {
        return null;
    },
    output: "value",
};

components["PolynomialOperator"] = {
    ...defaultComponent,
    name: "Polynomial Operator",
    description: "Create polynomial operator that can operate value(s)",
    color: "#7d6529",
    numInputs: 1,
    numOutputs: -1,
    data: {
        Type: {
            type: "radio",
            options: [
                "Polynomial",
                "Add Polynomials",
                "Subtract Polynomials",
                "Multiply Polynomials",
                "Divide Polynomials",
                "Polynomial Fit",
                "Value for x",
                "Roots",
                "Derivative",
                "Second Derivative",
                "Integral",
            ],
            value: "Integer",
            hidden: false,
        },
    },
    transpile: function () {
        if (Object.keys(this.inputs).length == 2) {
            if (this.data.Type.value == "Value for x") {
                return (
                    this.getOutput() +
                    " = np.polyval(" +
                    this.inputs[Object.keys(this.inputs)[1]].getOutput() +
                    ", " +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                    ")"
                );
            }
            if (this.data.Type.value == "Add Polynomials") {
                return (
                    this.getOutput() +
                    " = np.polyadd(" +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() + " , " +
                    this.inputs[Object.keys(this.inputs)[1]].getOutput() +
                    ")"
                );
            }
            if (this.data.Type.value == "Subtract Polynomials") {
                return (
                    this.getOutput() +
                    " = np.polysub(" +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() + " , " +
                    this.inputs[Object.keys(this.inputs)[1]].getOutput() +
                    ")"
                );
            }
            if (this.data.Type.value == "Multiply Polynomials") {
                return (
                    this.getOutput() +
                    " = np.polymul(" +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() + " , " +
                    this.inputs[Object.keys(this.inputs)[1]].getOutput() +
                    ")"
                );
            }
            if (this.data.Type.value == "Divide Polynomials") {
                return (
                    this.getOutput() +
                    " = np.polydiv(" +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() + " , " +
                    this.inputs[Object.keys(this.inputs)[1]].getOutput() +
                    ")"
                );
            }
        }
        else if (Object.keys(this.inputs).length == 3) {
            if (this.data.Type.value == "Polynomial Fit") {
                return (
                    this.getOutput() +
                    " = np.polyfit(" +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() + " , " +
                    this.inputs[Object.keys(this.inputs)[1]].getOutput() + " , " +
                    this.inputs[Object.keys(this.inputs)[2]].getOutput() +
                    ")"
                );
            }
        }
        else if (Object.keys(this.inputs).length == 1) {
            if (this.data.Type.value == "Polynomial") {
                return (
                    this.getOutput() +
                    " = np.poly1d(" +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                    ")"
                );
            }
            if (this.data.Type.value == "Roots") {
                return (
                    this.getOutput() +
                    " = np.roots(" +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                    ")"
                );
            }
            if (this.data.Type.value == "Derivative") {
                return (
                    this.getOutput() +
                    " = np.polyder(" +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                    ")"
                );
            }
            if (this.data.Type.value == "Second Derivative") {
                return (
                    this.getOutput() +
                    " = np.polyder(np.polyder(" +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                    "))"
                );
            }
            if (this.data.Type.value == "Integral") {
                return (
                    this.getOutput() +
                    " = np.polyint(" +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                    ")"
                );
            }
        }

        return "";
    },
    reload: function () { },
    outputs: {},
    inputs: {},
    getOutput: function () {
        return "PolynomialOperator" + this.id;
    },
    getValue: function () {
        return null;
    },
    output: "value",
};

components["GeometryOperator"] = {
    ...defaultComponent,
    name: "Geometry Operator",
    description: "Create a geometry operator that can operate value(s)",
    color: "#325637",
    numInputs: 1,
    numOutputs: -1,
    data: {
        Type: {
            type: "radio",
            options: ["Create Point", "Line Length"],
            value: "Integer",
            hidden: false,
        },
    },
    transpile: function () {

        if (this.data.Type.value == "Create Point") {
            return (
                this.getOutput() + " = Point(" +
                this.inputs[Object.keys(this.inputs)[0]].getOutput() + ")"
            );
        }
        if (this.data.Type.value == "Line Length") {
            return (
                this.getOutput() + " = LineString(" +
                this.inputs[Object.keys(this.inputs)[0]].getOutput() + ").length"
            );
        }
        return "";
    },
    reload: function () { },
    outputs: {},
    inputs: {},
    getOutput: function () {
        return "GeometryOperator" + this.id;
    },
    getValue: function () {
        return null;
    },
    output: "value",
};

components["SetsOperator"] = {
    ...defaultComponent,
    name: "Sets Operator",
    description: "Create a sets operator that can operate value(s)",
    color: "#325637",
    numInputs: 1,
    numOutputs: -1,
    data: {
        Type: {
            type: "radio",
            options: ["Union", "Intersection"],
            value: "Integer",
            hidden: false,
        },
    },
    transpile: function () {

        if (this.data.Type.value == "Union") {
            return (
                this.getOutput() + " = " +
                this.inputs[Object.keys(this.inputs)[0]].getOutput() + " | " +
                this.inputs[Object.keys(this.inputs)[1]].getOutput()
            );
        }
        if (this.data.Type.value == "Intersection") {
            return (
                this.getOutput() + " = " +
                this.inputs[Object.keys(this.inputs)[0]].getOutput() + " & " +
                this.inputs[Object.keys(this.inputs)[1]].getOutput()
            );
        }
        return "";
    },
    reload: function () { },
    outputs: {},
    inputs: {},
    getOutput: function () {
        return "SetsOperator" + this.id;
    },
    getValue: function () {
        return null;
    },
    output: "value",
};

components["StatsOperator"] = {
    ...defaultComponent,
    name: "Statistic Operator",
    description: "Create Statistic operator that can operate value(s)",
    color: "#6f7529",
    numInputs: 1,
    numOutputs: -1,
    data: {
        Type: {
            type: "radio",
            options: [
                "Median",
                "Mean",
                "Mode",
                "Maximum",
                "Minimum",
                "Range",
                "IQR",
                "Standard Deviation",
                "Variance",
                "Skew",
            ],
            value: "Integer",
            hidden: false,
        },
    },
    transpile: function () {
        if (this.data.Type.value == "Median") {
            return (
                this.getOutput() +
                " = statistics.median(" +
                this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                ")"
            );
        }
        if (this.data.Type.value == "Mean") {
            return (
                this.getOutput() +
                " = statistics.mean(" +
                this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                ")"
            );
        }
        if (this.data.Type.value == "Mode") {
            return (
                this.getOutput() +
                " = statistics.mode(" +
                this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                ")"
            );
        }
        if (this.data.Type.value == "Maximum") {
            return (
                this.getOutput() +
                " = max(" +
                this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                ")"
            );
        }
        if (this.data.Type.value == "Minimum") {
            return (
                this.getOutput() +
                " = min(" +
                this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                ")"
            );
        }
        if (this.data.Type.value == "Range") {
            return (
                this.getOutput() +
                " = max(" +
                this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                ") - min(" +
                this.inputs[Object.keys(this.inputs)[0]].getOutput() + ")"
            );
        }
        if (this.data.Type.value == "IQR") {
            return (
                this.getOutput() +
                " = scipy.stats.iqr(" +
                this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                ")"
            );
        }
        if (this.data.Type.value == "Standard Deviation") {
            return (
                this.getOutput() +
                " = statistics.stdev(" +
                this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                ")"
            );
        }
        if (this.data.Type.value == "Variance") {
            return (
                this.getOutput() +
                " = statistics.variance(" +
                this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                ")"
            );
        }
        if (this.data.Type.value == "Skew") {
            return (
                this.getOutput() +
                " = scipy.stats.skew(" +
                this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                ")"
            );
        }
        return "";
    },
    reload: function () { },
    outputs: {},
    inputs: {},
    getOutput: function () {
        return "StatsOperator" + this.id;
    },
    getValue: function () {
        return null;
    },
    output: "value",
};

components["VectorOperator"] = {
    ...defaultComponent,
    name: "Vector Operator",
    description: "Create vector operator that can operate value(s)",
    color: "#7d295b",
    numInputs: 1,
    numOutputs: -1,
    data: {
        Type: {
            type: "radio",
            options: [
                "Dot Product",
                "Cross Product",
                "Magnitude",
                "Unit Vector",
                "Outer Product",
                "Kronecker Product",
                "Distance",
                "Angle Between",
                "Projection",
                "Other Projection",
                "Parallelogram Area",
                "Parallelopiped Volume",
                "Einstein Summation",
                "Plane Normal",
                "Orthogonalization",
            ],
            value: "Integer",
            hidden: false,
        },
    },
    transpile: function () {
        if (Object.keys(this.inputs).length == 2) {
            if (this.data.Type.value == "Dot Product") {
                return (
                    this.getOutput() +
                    " = np.vdot(" +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                    " , " +
                    this.inputs[Object.keys(this.inputs)[1]].getOutput() +
                    ")"
                );
            }
            if (this.data.Type.value == "Cross Product") {
                return (
                    this.getOutput() +
                    " = np.cross(" +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                    " , " +
                    this.inputs[Object.keys(this.inputs)[1]].getOutput() +
                    ")"
                );
            }
            if (this.data.Type.value == "Outer Product") {
                return (
                    this.getOutput() +
                    " = np.outer(" +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                    " , " +
                    this.inputs[Object.keys(this.inputs)[1]].getOutput() +
                    ")"
                );
            }
            if (this.data.Type.value == "Kronecker Product") {
                return (
                    this.getOutput() +
                    " = np.kron(" +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                    " , " +
                    this.inputs[Object.keys(this.inputs)[1]].getOutput() +
                    ")"
                );
            }
            if (this.data.Type.value == "Distance") {
                return (
                    this.getOutput() +
                    " = np.linalg.norm(" +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                    " - " +
                    this.inputs[Object.keys(this.inputs)[1]].getOutput() +
                    ")"
                );
            }
            if (this.data.Type.value == "Angle Between") {
                return (
                    this.getOutput() +
                    " = np.arccos(np.vdot(" +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                    " , " +
                    this.inputs[Object.keys(this.inputs)[1]].getOutput() +
                    ") / (np.linalg.norm(" + this.inputs[Object.keys(this.inputs)[0]].getOutput() + ") * np.linalg.norm(" +
                    this.inputs[Object.keys(this.inputs)[1]].getOutput() +
                    ")))"
                );
            }
            if (this.data.Type.value == "Projection") {
                return (
                    this.getOutput() +
                    " = (np.vdot(" +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                    " , " + this.inputs[Object.keys(this.inputs)[1]].getOutput() +
                    ") / np.vdot(" +
                    this.inputs[Object.keys(this.inputs)[1]].getOutput() +
                    " , " + this.inputs[Object.keys(this.inputs)[1]].getOutput() +
                    ")) * (" + this.inputs[Object.keys(this.inputs)[1]].getOutput() + ")"
                );
            }
            if (this.data.Type.value == "Other Projection") {
                return (
                    this.getOutput() +
                    " = (np.vdot(" +
                    this.inputs[Object.keys(this.inputs)[1]].getOutput() +
                    " , " + this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                    ") / np.vdot(" +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                    " , " + this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                    ")) * (" + this.inputs[Object.keys(this.inputs)[0]].getOutput() + ")"
                );
            }
            if (this.data.Type.value == "Parallelogram Area") {
                return (
                    this.getOutput() +
                    " = np.linalg.norm(np.cross(" +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                    " , " +
                    this.inputs[Object.keys(this.inputs)[1]].getOutput() +
                    "))"
                );
            }
            if (this.data.Type.value == "Einstein Summation") {
                return (
                    this.getOutput() +
                    ' = np.einsum("n,n", ' +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                    " , " +
                    this.inputs[Object.keys(this.inputs)[1]].getOutput() +
                    ")"
                );
            }
            if (this.data.Type.value == "Orthogonalization") {
                return (
                    this.getOutput() +
                    " = " + this.inputs[Object.keys(this.inputs)[1]].getOutput() + " - (np.vdot(" +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                    " , " + this.inputs[Object.keys(this.inputs)[1]].getOutput() +
                    ") / np.vdot(" +
                    this.inputs[Object.keys(this.inputs)[1]].getOutput() +
                    " , " + this.inputs[Object.keys(this.inputs)[1]].getOutput() +
                    ")) * (" + this.inputs[Object.keys(this.inputs)[1]].getOutput() + ")"
                );
            }
        }
        if (Object.keys(this.inputs).length == 3) {
            if (this.data.Type.value == "Parallelopiped Volume") {
                return (
                    this.getOutput() +
                    " = np.linalg.norm(np.vdot(" +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                    " , np.cross(" +
                    this.inputs[Object.keys(this.inputs)[1]].getOutput() + " , " +
                    this.inputs[Object.keys(this.inputs)[2]].getOutput() +
                    ")))"
                );
            }
            if (this.data.Type.value == "Plane Normal") {
                return (
                    this.getOutput() +
                    " = np.cross(np.subtract(" + this.inputs[Object.keys(this.inputs)[1]].getOutput() + " , "
                    + this.inputs[Object.keys(this.inputs)[0]].getOutput() + ") , np.subtract(" +
                    this.inputs[Object.keys(this.inputs)[2]].getOutput() + " , " +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() + "))"
                );
            }
        }
        if (Object.keys(this.inputs).length == 1) {
            if (this.data.Type.value == "Magnitude") {
                return (
                    this.getOutput() +
                    " = np.linalg.norm(" +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                    ")"
                );
            }
            if (this.data.Type.value == "Unit Vector") {
                return (
                    this.getOutput() +
                    " = " + this.inputs[Object.keys(this.inputs)[0]].getOutput() + "/np.linalg.norm(" +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                    ")"
                );
            }
        }

        return "";
    },
    reload: function () { },
    outputs: {},
    inputs: {},
    getOutput: function () {
        return "VectorOperator" + this.id;
    },
    getValue: function () {
        return null;
    },
    output: "value",
};

components["MatrixOperator"] = {
    ...defaultComponent,
    name: "Matrix Operator",
    description: "Create Matrix operator that can operate value(s)",
    color: "#39297d",
    numInputs: 1,
    numOutputs: -1,
    data: {
        Type: {
            type: "radio",
            options: [
                "Dot Product",
                "Cross Product",
                "Matrix Power",
                "Kronecker Product",
                "Hadamard Product",
                "Cholesky Decomposition",
                "Determinant",
                "Eigenvalues",
                "Normal",
                "Condition",
                "Rank",
                "Trace",
                "Inverse",
                "Diagonal",
                "Transpose",
                "Einstein Summation",
                "Gradient",
                "Orthonormal Basis",
                "Solve for Ax = B",
                "Subspace Angle",
                "SVD",
                "QR"
            ],
            value: "Integer",
            hidden: false,
        },
    },
    transpile: function () {
        if (Object.keys(this.inputs).length > 1) {
            if (this.data.Type.value == "Dot Product") {
                return (
                    this.getOutput() +
                    " = np.dot(" +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                    " , " +
                    this.inputs[Object.keys(this.inputs)[1]].getOutput() +
                    ")"
                );
            }
            if (this.data.Type.value == "Cross Product") {
                return (
                    this.getOutput() +
                    " = np.cross(" +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                    " , " +
                    this.inputs[Object.keys(this.inputs)[1]].getOutput() +
                    ")"
                );
            }
            if (this.data.Type.value == "Matrix Power") {
                return (
                    this.getOutput() +
                    " = np.linalg.matrix_power(" +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                    " , " +
                    this.inputs[Object.keys(this.inputs)[1]].getOutput() +
                    ")"
                );
            }
            if (this.data.Type.value == "Kronecker Product") {
                return (
                    this.getOutput() +
                    " = np.kron(" +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                    " , " +
                    this.inputs[Object.keys(this.inputs)[1]].getOutput() +
                    ")"
                );
            }
            if (this.data.Type.value == "Hadamard Product") {
                return (
                    this.getOutput() +
                    " = np.multiply(" +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                    " , " +
                    this.inputs[Object.keys(this.inputs)[1]].getOutput() +
                    ")"
                );
            }
            if (this.data.Type.value == "Einstein Summation") {
                return (
                    this.getOutput() +
                    ' = np.einsum("mk,kn", ' +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                    " , " +
                    this.inputs[Object.keys(this.inputs)[1]].getOutput() +
                    ")"
                );
            }
            if (this.data.Type.value == "Solve for Ax = B") {
                return (
                    this.getOutput() +
                    " = scipy.linalg.solve(" +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                    " , " +
                    this.inputs[Object.keys(this.inputs)[1]].getOutput() +
                    ")"
                );
            }
            if (this.data.Type.value == "Subspace Angle") {
                return (
                    this.getOutput() +
                    " = scipy.linalg.subspace_angles(" +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                    " , " +
                    this.inputs[Object.keys(this.inputs)[1]].getOutput() +
                    ")"
                );
            }
        } else if (Object.keys(this.inputs).length == 1) {
            if (this.data.Type.value == "Cholesky Decomposition") {
                return (
                    this.getOutput() +
                    " = np.linalg.cholesky(" +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                    ")"
                );
            }
            else if (this.data.Type.value == "Determinant") {
                return (
                    this.getOutput() +
                    " = np.linalg.det(" +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                    ")"
                );
            }
            else if (this.data.Type.value == "Eigenvalues") {
                return (
                    this.getOutput() +
                    " = np.linalg.eig(" +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                    ")"
                );
            }
            else if (this.data.Type.value == "Normal") {
                return (
                    this.getOutput() +
                    " = np.linalg.norm(" +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                    ")"
                );
            }
            else if (this.data.Type.value == "Condition") {
                return (
                    this.getOutput() +
                    " = np.linalg.cond(" +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                    ")"
                );
            }
            else if (this.data.Type.value == "Rank") {
                return (
                    this.getOutput() +
                    " = np.linalg.matrix_rank(" +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                    ")"
                );
            }
            else if (this.data.Type.value == "Trace") {
                return (
                    this.getOutput() +
                    " = np.trace(" +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                    ")"
                );
            }
            else if (this.data.Type.value == "Inverse") {
                return (
                    this.getOutput() +
                    " = np.linalg.inv(" +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                    ")"
                );
            }
            else if (this.data.Type.value == "Diagonal") {
                return (
                    this.getOutput() +
                    " = np.diagonal(" +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                    ")"
                );
            }
            else if (this.data.Type.value == "Transpose") {
                return (
                    this.getOutput() +
                    " = np.transpose(" +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                    ")"
                );
            }
            else if (this.data.Type.value == "Gradient") {
                return (
                    this.getOutput() +
                    " = np.gradient(" +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                    ")"
                );
            }
            else if (this.data.Type.value == "Orthonormal Basis") {
                return (
                    this.getOutput() +
                    " = scipy.linalg.orth(" +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                    ")"
                );
            }
            else if (this.data.Type.value == "SVD") {
                return (
                    this.getOutput() +
                    " = np.linalg.svd(" +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                    ")"
                );
            }
            else if (this.data.Type.value == "QR") {
                return (
                    this.getOutput() +
                    " = np.linalg.qr(" +
                    this.inputs[Object.keys(this.inputs)[0]].getOutput() +
                    ")"
                );
            }
        }

        return "";
    },
    reload: function () { },
    outputs: {},
    inputs: {},
    getOutput: function () {
        return "VectorOperator" + this.id;
    },
    getValue: function () {
        return null;
    },
    output: "value",
};

components["Library"] = {
    ...defaultComponent,
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
    outputs: {},
    inputs: {},
    getOutput: function () {
        return this.output + this.id;
    },
    getValue: function () {
        return null;
    },
    output: "library",
};

components["Import"] = {
    ...defaultComponent,
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
    reload: function () { },
    outputs: {},
    inputs: {},
    getOutput: function () {
        return this.output + this.id;
    },
    getValue: function () {
        return null;
    },
    output: "import",
};

components["Array"] = {
    ...defaultComponent,
    name: "Array",
    color: "#0c7fc4",
    numInputs: -1,
    numOutputs: -1,
    description: "Use Values as inputs to create an array of values",
    data: {
        Sort: {
            type: "sort",
            value: [],
            hidden: false,
        },
        Data: {
            type: "text",
            value: "text",
            readonly: true,
            hidden: false,
        },
    },
    transpile: function () {
        // get the outputs of the inputs
        this.reload();

        const vals: any[] = [];
        var outputs = this.data.Sort.value.map((obj: any) => {
            vals.push(obj.value);
            return obj.id;
        });
        // console.log(outputs);

        this.data.Data.value = `[${vals.join(", ")}]`;

        // return an array of the outputs
        return `${this.getOutput()} = [${outputs.join(", ")}]`;
    },
    reload: function () {
        // loop through the inputs and if they are not in the sort, add them
        if (Object.keys(this.inputs).length > this.data.Sort.value.length) {
            var sorts = [];
            var keys = Object.keys(this.inputs);
            // push the new inputs to the sort
            sorts = this.data.Sort.value;
            for (var i = 0; i < keys.length; i++) {
                if (
                    sorts.filter((obj: any) => obj.id == this.inputs[keys[i]].getOutput())
                        .length == 0
                ) {
                    sorts.push({
                        id: this.inputs[keys[i]].getOutput(),
                        value:
                            this.inputs[keys[i]].getValue != null
                                ? this.inputs[keys[i]].getValue()
                                : this.inputs[keys[i]].getOutput(),
                        realId: keys[i],
                    });
                }
            }
            this.data.Sort.value = sorts;
        } else if (
            Object.keys(this.inputs).length < this.data.Sort.value.length
        ) {
            // remove the inputs that are not in the sort

            var temp = [];
            var keys = Object.keys(this.inputs);
            // remove the inputs that are not in the sort

            for (var i = 0; i < this.data.Sort.value.length; i++) {
                if (
                    keys.filter(
                        (obj) =>
                            this.inputs[obj].getOutput() == this.data.Sort.value[i].id
                    ).length > 0
                ) {
                    temp.push(this.data.Sort.value[i]);
                }
            }
            this.data.Sort.value = temp;
        }

        for (var i = 0; i < this.data.Sort.value.length; i++) {
            if (this.inputs[this.data.Sort.value[i].realId].getValue()) {
                this.data.Sort.value[i].value =
                    this.inputs[this.data.Sort.value[i].realId].getValue();
            } else {
                this.data.Sort.value[i].value =
                    this.inputs[this.data.Sort.value[i].realId].getOutput();
            }
            this.data.Sort.value[i].id =
                this.inputs[this.data.Sort.value[i].realId].getOutput();
        }

        if (this.data.Sort.value.length == 0) {
            // hide the Sort
            this.data.Sort.hidden = true;
        } else {
            this.data.Sort.hidden = false;
        }
    },
    getOutput: function () {
        return "array" + this.id;
    },
    getValue: function () {
        return this.data.Data.value;
    },
    inputs: {},
    outputs: {},
};

components["LinkedList"] = {
    ...defaultComponent,
    name: "Linked List",
    color: "#0c7fc4",
    numInputs: -1,
    numOutputs: -1,
    description: "Use Values as inputs to create an linked list of values",
    data: {
        Sort: {
            type: "sort",
            value: [],
            hidden: false,
        },
        Data: {
            type: "text",
            value: "text",
            readonly: true,
            hidden: false,
        },
    },
    transpile: function () {
        // get the outputs of the inputs
        this.reload();

        var tmpOutput = `${this.getOutput()} = collections.deque()\n`;

        const vals: any[] = [];
        var outputs = this.data.Sort.value.map((obj: any) => {
            vals.push(obj.value);
            tmpOutput += `${this.getOutput()}.append(${obj.id})\n`;
            return obj.id;
        });
        // console.log(outputs);

        this.data.Data.value = `[${vals.join(", ")}]`;

        // return an array of the outputs
        return tmpOutput;
    },
    reload: function () {
        // loop through the inputs and if they are not in the sort, add them
        if (Object.keys(this.inputs).length > this.data.Sort.value.length) {
            var sorts = [];
            var keys = Object.keys(this.inputs);
            // push the new inputs to the sort
            sorts = this.data.Sort.value;
            for (var i = 0; i < keys.length; i++) {
                if (
                    sorts.filter((obj: any) => obj.id == this.inputs[keys[i]].getOutput())
                        .length == 0
                ) {
                    sorts.push({
                        id: this.inputs[keys[i]].getOutput(),
                        value:
                            this.inputs[keys[i]].getValue != null
                                ? this.inputs[keys[i]].getValue()
                                : this.inputs[keys[i]].getOutput(),
                        realId: keys[i],
                    });
                }
            }
            this.data.Sort.value = sorts;
        } else if (
            Object.keys(this.inputs).length < this.data.Sort.value.length
        ) {
            // remove the inputs that are not in the sort

            var temp = [];
            var keys = Object.keys(this.inputs);
            // remove the inputs that are not in the sort

            for (var i = 0; i < this.data.Sort.value.length; i++) {
                if (
                    keys.filter(
                        (obj) =>
                            this.inputs[obj].getOutput() == this.data.Sort.value[i].id
                    ).length > 0
                ) {
                    temp.push(this.data.Sort.value[i]);
                }
            }
            this.data.Sort.value = temp;
        }

        for (var i = 0; i < this.data.Sort.value.length; i++) {
            if (this.inputs[this.data.Sort.value[i].realId].getValue()) {
                this.data.Sort.value[i].value =
                    this.inputs[this.data.Sort.value[i].realId].getValue();
            } else {
                this.data.Sort.value[i].value =
                    this.inputs[this.data.Sort.value[i].realId].getOutput();
            }
            this.data.Sort.value[i].id =
                this.inputs[this.data.Sort.value[i].realId].getOutput();
        }

        if (this.data.Sort.value.length == 0) {
            // hide the Sort
            this.data.Sort.hidden = true;
        } else {
            this.data.Sort.hidden = false;
        }
    },
    getOutput: function () {
        return "ll" + this.id;
    },
    getValue: function () {
        return this.data.Data.value;
    },
    inputs: {},
    outputs: {},
};

components["Vector"] = {
    ...defaultComponent,
    name: "Vector",
    color: "#29697d",
    numInputs: -1,
    numOutputs: 1,
    description: "Use Values as inputs to create a vector of values",
    data: {
        Sort: {
            type: "sort",
            value: [],
            hidden: false,
        },
        Data: {
            type: "text",
            value: "text",
            readonly: true,
            hidden: false,
        },
    },
    transpile: function () {
        // get the outputs of the inputs
        this.reload();

        const vals: any[] = [];
        var outputs = this.data.Sort.value.map((obj: any) => {
            vals.push(obj.value);
            return obj.id;
        });
        // console.log(outputs);

        this.data.Data.value = `[${vals.join(", ")}]`;

        // return an array of the outputs
        return `${this.getOutput()} = np.array([${outputs.join(", ")}])`;
    },
    reload: function () {
        // loop through the inputs and if they are not in the sort, add them
        if (Object.keys(this.inputs).length > this.data.Sort.value.length) {
            var sorts = [];
            var keys = Object.keys(this.inputs);
            // push the new inputs to the sort
            sorts = this.data.Sort.value;
            for (var i = 0; i < keys.length; i++) {
                if (
                    sorts.filter((obj: any) => obj.id == this.inputs[keys[i]].getOutput())
                        .length == 0
                ) {
                    sorts.push({
                        id: this.inputs[keys[i]].getOutput(),
                        value:
                            this.inputs[keys[i]].getValue != null
                                ? this.inputs[keys[i]].getValue()
                                : this.inputs[keys[i]].getOutput(),
                        realId: keys[i],
                    });
                }
            }
            this.data.Sort.value = sorts;
        } else if (
            Object.keys(this.inputs).length < this.data.Sort.value.length
        ) {
            // remove the inputs that are not in the sort

            var temp = [];
            var keys = Object.keys(this.inputs);
            // remove the inputs that are not in the sort

            for (var i = 0; i < this.data.Sort.value.length; i++) {
                if (
                    keys.filter(
                        (obj) =>
                            this.inputs[obj].getOutput() == this.data.Sort.value[i].id
                    ).length > 0
                ) {
                    temp.push(this.data.Sort.value[i]);
                }
            }
            this.data.Sort.value = temp;
        }

        for (var i = 0; i < this.data.Sort.value.length; i++) {
            if (this.inputs[this.data.Sort.value[i].realId].getValue()) {
                this.data.Sort.value[i].value =
                    this.inputs[this.data.Sort.value[i].realId].getValue();
            } else {
                this.data.Sort.value[i].value =
                    this.inputs[this.data.Sort.value[i].realId].getOutput();
            }
            this.data.Sort.value[i].id =
                this.inputs[this.data.Sort.value[i].realId].getOutput();
        }

        if (this.data.Sort.value.length == 0) {
            // hide the Sort
            this.data.Sort.hidden = true;
        } else {
            this.data.Sort.hidden = false;
        }
    },
    getOutput: function () {
        return "array" + this.id;
    },
    getValue: function () {
        return this.data.Data.value;
    },
    inputs: {},
    outputs: {},
};

components["Matrix"] = {
    ...defaultComponent,
    name: "Matrix",
    color: "#57297d",
    numInputs: 0,
    numOutputs: 1,
    description: "Use Values as inputs to create a matrix of values",
    data: {
        Rows: {
            type: "slider",
            value: 2,
            min: 1,
            max: 4,
        },
        Cols: {
            type: "slider",
            value: 2,
            min: 1,
            max: 4,
        },
        Matrix: {
            type: "matrix",
            value: [
                [0, 0],
                [0, 0],
            ],
            hidden: false,
        },
        Data: {
            type: "text",
            value: "[[0, 0], [0, 0]]",
            readonly: true,
            hidden: false,
        },
    },
    transpile: function () {
        // get the outputs of the inputs

        var vals = [];
        var outputs = this.data.Matrix.value.map((row: any) => {
            var rowVals = row.map((val: any) => {
                vals.push(val);
                return val;
            });
            return "[" + rowVals.join(", ") + "]";
        });
        // this.data.Data.value = "[" + outputs.join(", ") + "]";

        // return an array of the outputs
        return `${this.getOutput()} = np.array([${outputs.join(", ")}])`;
    },

    reload: function () {
        // change the size of the matrix but keep the values
        var matrix = [];
        for (var i = 0; i < this.data.Rows.value; i++) {
            var row = [];
            for (var j = 0; j < this.data.Cols.value; j++) {
                if (this.data.Matrix.value[i] && this.data.Matrix.value[i][j]) {
                    row.push(this.data.Matrix.value[i][j]);
                } else {
                    row.push(0);
                }
            }
            matrix.push(row);
        }
        this.data.Matrix.value = matrix;
        this.data.Data.value = JSON.stringify(matrix);
    },
    getOutput: function () {
        return "matrix" + this.id;
    },
    getValue: function () {
        return this.data.Data.value;
    },
    inputs: {},
    outputs: {},
};

components["Print"] = {
    ...defaultComponent,
    name: "Print",
    description: "Print a value to the console",
    color: "#4db074",
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
                if (this.inputs[key].getValue()) {
                    return this.inputs[key].getValue();
                } else if (this.inputs[key].getOutput()) {
                    return this.inputs[key].getOutput();
                }
            });

            outputs = outputs.filter((val) => val != null);

            this.data.Output.value = outputs.join(", ");
            this.data.Output.readonly = true;

            var trueOutputs = Object.keys(this.inputs).map((key, index) => {
                return this.inputs[key].getOutput();
            });

            trueOutputs = trueOutputs.filter((val) => val != null);

            return `print(${trueOutputs.join(", ")})`;
        } else {
            // print the value
            this.data.Output.readonly = false;
            return `print("${this.data.Output.value}")`;
        }
    },
    reload: function () { },
    getOutput: function () {
        return this.output + this.id;
    },
    getValue: function () {
        return null;
    },
    output: "print",
};

components["Connector"] = {
    ...defaultComponent,
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
    reload: function () { },
    outputs: {},
    inputs: {},
    getOutput: function () {
        // return this.output + this.id;
        return null
    },
    getValue: function () {
        return null;
    },
    output: "connector",
};

components["CustomCode"] = {
    ...defaultComponent,
    name: "Custom Code",
    description: "Write custom code!",
    color: "#ba501e",
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
                '# This is a code snippet!\nprint("Hello World!")\nfor i in range(0,4):\n\tprint(i)',
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
            var body = lines.map((line: any) => {
                return "\t" + line;
            });
            return head + body.join("\n");
        } else if (this.data.Type.value == "Class") {
            var head = `class ${this.getOutput()}:\n`;
            var init = `\tdef __init__(self, ${params}):\n\t\t# this is the constructor!\n`;
            // add tabs to the code
            var lines = this.data.Code.value.split("\n");
            var body = lines.map((line: any) => {
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
};

components["Helper"] = {
    ...defaultComponent,
    name: "Helper",
    description: "A helper component to help manage the flow of the notebook",
    color: "#cfa021",
    numInputs: 1,
    numOutputs: 1,
    top: true,
    bot: true,
    data: {
        Sort: {
            type: "sort",
            value: [],
            hidden: false,
        },
        Help: {
            type: "text",
            value: "",
            readonly: true,
            hidden: false,
        },
    },
    transpile: function () {
        // get the outputs of the inputs

        if (Object.keys(this.inputs).length > this.data.Sort.value.length) {
            var sorts = [];
            var keys = Object.keys(this.inputs);
            // push the new inputs to the sort
            sorts = this.data.Sort.value;
            for (var i = 0; i < keys.length; i++) {
                if (
                    sorts.filter((obj: any) => obj.id == this.inputs[keys[i]].getOutput())
                        .length == 0
                ) {
                    sorts.push({
                        id: this.inputs[keys[i]].getOutput(),
                        value:
                            this.inputs[keys[i]].getValue != null
                                ? this.inputs[keys[i]].getValue()
                                : this.inputs[keys[i]].getOutput(),
                        realId: keys[i],
                    });
                }
            }
            this.data.Sort.value = sorts;
        } else if (
            Object.keys(this.inputs).length < this.data.Sort.value.length
        ) {
            // remove the inputs that are not in the sort

            var temp = [];
            var keys = Object.keys(this.inputs);
            // remove the inputs that are not in the sort

            for (var i = 0; i < this.data.Sort.value.length; i++) {
                if (
                    keys.filter(
                        (obj) =>
                            this.inputs[obj].getOutput() == this.data.Sort.value[i].id
                    ).length > 0
                ) {
                    temp.push(this.data.Sort.value[i]);
                }
            }
            this.data.Sort.value = temp;
        }

        for (var i = 0; i < this.data.Sort.value.length; i++) {
            if (this.inputs[this.data.Sort.value[i].realId].getValue()) {
                this.data.Sort.value[i].value =
                    this.inputs[this.data.Sort.value[i].realId].getValue();
            } else {
                this.data.Sort.value[i].value =
                    this.inputs[this.data.Sort.value[i].realId].getOutput();
            }
            this.data.Sort.value[i].id =
                this.inputs[this.data.Sort.value[i].realId].getOutput();
        }

        if (this.data.Sort.value.length == 0) {
            // hide the Sort
            this.data.Sort.hidden = true;
        } else {
            this.data.Sort.hidden = false;
        }

        const input: any[] = [];
        const vals: any[] = [];
        this.data.Sort.value.map((obj: any) => {
            input.push(obj.id);
            vals.push(obj.value);
        });

        // console.log("RELOADING HELPER");
        // console.log(this.helpers);
        if (Object.keys(this.helpers).length > 0) {
            var helper = this.helpers[Object.keys(this.helpers)[0]];
            var help = helper.getHelp() || [];
            var help2 = helper.getHelp() || [];
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
    outputs: {},
    inputs: {},
    helpers: {},
    topInputs: {},
    getOutput: function () {
        return this.output + this.id;
    },
    getValue: function () {
        return this.data.Help.value;
    },
    output: "helper",
};

components["IndexAt"] = {
    ...defaultComponent,
    name: "IndexAt",
    description: "Get the item in an array at a specific index",
    color: "#bda1cc",
    numInputs: 1,
    numOutputs: 1,
    output: "index",
    data: {
        Index: {
            type: "slider",
            value: 0,
            min: 0,
            max: 100,
            hidden: false,
            step: 1,
        },
        Data: {
            type: "text",
            value: "text",
            readonly: true,
            hidden: false,
        },
    },
    transpile: function () {
        this.reload();
        // get the outputs of the inputs
        const values: any[] = [];
        var outputs = Object.keys(this.inputs).map((key, index) => {
            if (this.inputs[key].getValue()) {
                values.push(this.inputs[key].getValue());
            }
            return this.inputs[key].getOutput();
        });

        var max = 0;
        if (values.length > 0) {
            var val = values[0];
            // if val has [ and ] in it, it is an array
            if (val.includes("[") && val.includes("]")) {
                // get the length of the array
                val = val.replace("[", "").replace("]", "");
                max = val.split(",").length;
                this.data.Index.max = max - 1;
                if (this.data.Index.value < max) {
                    this.data.Data.value = val.split(",")[this.data.Index.value];
                }
            } else {
                this.data.Index.max = 10;
                this.data.Data.value = `${outputs[0]}[${this.data.Index.value}]`;
            }
        } else {
            this.data.Data.value = `${outputs[0]}[${this.data.Index.value}]`;
        }

        return `${this.getOutput()} = ${outputs[0]}[${this.data.Index.value}]`;
    },
    reload: function () {
        if (Object.keys(this.inputs).length > 0) {
            this.data.Index.hidden = false;
        } else {
            this.data.Index.hidden = true;
        }
    },
    getOutput: function () {
        return this.output + this.id;
    },
    getValue: function () {
        return null;
    },
};

components["MatplotTest"] = {
    ...defaultComponent,
    name: "Matplot Test",
    description: "Test Matplotlib",
    color: "#bda1cc",
    numInputs: 0,
    numOutputs: 0,
    output: "matplot",
    data: {
        Data: {
            type: "text",
            value: "text",
            readonly: true,
            hidden: false,
        },
    },

    transpile: function () {
        return `import matplotlib.cm as cm
  import io
  import base64
  import js
  
  from matplotlib import pyplot as plt
  delta = 0.025
  x = y = np.arange(-3.0, 3.0, delta)
  X, Y = np.meshgrid(x, y)
  Z1 = np.exp(-(X**2) - Y**2)
  Z2 = np.exp(-((X - 1) ** 2) - (Y - 1) ** 2)
  Z = (Z1 - Z2) * 2
  plt.figure()
  plt.imshow(
  Z,
  interpolation="bilinear",
  cmap=cm.RdYlGn,
  origin="lower",
  extent=[-3, 3, -3, 3],
  vmax=abs(Z).max(),
  vmin=-abs(Z).max(),
  )
  plt.show()`
    },
    getOutput: function () {
        return this.output + this.id;
    },
    getValue: function () {
        return this.data.Data.value;
    },
    reload: function () { },

}

export default components;