import { useContext } from "react";
import { ElementsContext } from "../canvas/elements-context";

export default function Raw() {

    const {
        notebookCells
    } = useContext(ElementsContext);

    const start = `{"cells": `;
    const end = `,"metadata": {"kernelspec": {"display_name": "Python 3","language": "python","name": "python3"},"language_info": {"codemirror_mode": {"name": "ipython","version": 3},"file_extension": ".py","mimetype": "text/x-python","name": "python","nbconvert_exporter": "python","pygments_lexer": "ipython3","version": "3.10.13"},"colab": {"provenance": []}},"nbformat": 4,"nbformat_minor": 0}`;

    return (
        <textarea
            readOnly
            autoCorrect="off"
            spellCheck="false"
            className="text-gray-400 scroll p-4"
            style={{
                width: "100%",
                height: "100%",
                backgroundColor: "transparent",
                border: "none",
                fontSize: "0.8em",
                resize: "none",
            }}
            value={start + JSON.stringify(notebookCells, null, 4) + end}
        ></textarea>
    );
}
