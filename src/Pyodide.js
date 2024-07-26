import React, { useEffect, useRef, useState } from "react";
import { useScript } from "usehooks-ts";

/**
 * Pyodide component
 *
 * @param {object} props - react props
 * @param {string} props.pythonCode - python code to run
 * @param {string} [props.loadingMessage] - loading message
 * @param {string} [props.evaluatingMessage] - evaluating message
 * @returns {object} - pyodide node displaying result of python code
 */
function Pyodide({
  pythonCode,
  loadingMessage = "loading…",
  evaluatingMessage = "evaluating…",
}) {
  const pyodideStatus = useScript(
    `https://cdn.jsdelivr.net/pyodide/v0.21.2/full/pyodide.js`,
    {
      removeOnUnmount: false,
    }
  );
  const bokehStatus = useScript(
    `https://cdn.bokeh.org/bokeh/release/bokeh-2.4.3.js`,
    {
      removeOnUnmount: false,
      shouldPreventLoad: pyodideStatus !== "ready",
    }
  );
  const bokehWidgetsStatus = useScript(
    `https://cdn.bokeh.org/bokeh/release/bokeh-widgets-2.4.3.min.js`,
    {
      removeOnUnmount: false,
      shouldPreventLoad: bokehStatus !== "ready",
    }
  );
  const bokehTablesStatus = useScript(
    `https://cdn.bokeh.org/bokeh/release/bokeh-tables-2.4.3.min.js`,
    {
      removeOnUnmount: false,
      shouldPreventLoad: bokehWidgetsStatus !== "ready",
    }
  );
  const panelStatus = useScript(
    `https://cdn.jsdelivr.net/npm/@holoviz/panel@0.14.0/dist/panel.min.js`,
    {
      removeOnUnmount: false,
      shouldPreventLoad: bokehTablesStatus !== "ready",
    }
  );

  console.log(
    pyodideStatus,
    bokehStatus,
    bokehWidgetsStatus,
    bokehTablesStatus,
    panelStatus
  );

  const indexURL = "https://cdn.jsdelivr.net/pyodide/v0.21.2/full/";
  const pyodide = useRef(null);
  const [isPyodideLoading, setIsPyodideLoading] = useState(true);
  const [pyodideOutput, setPyodideOutput] = useState(evaluatingMessage); // load pyodide wasm module and initialize it

  useEffect(() => {
    if (panelStatus === "ready") {
      setTimeout(() => {
        (async function () {
          pyodide.current = await globalThis.loadPyodide({ indexURL });
          setIsPyodideLoading(false);
        })();
      }, 1000);
    }
  }, [pyodide, panelStatus]); // evaluate python code with pyodide and set output

  useEffect(() => {
    if (!isPyodideLoading) {
      const evaluatePython = async (pyodide, pythonCode) => {
        try {
          await pyodide.loadPackage("micropip");
          const micropip = pyodide.pyimport("micropip");
          await micropip.install("panel", keep_going=true);
          return await pyodide.runPython(pythonCode);
        } catch (error) {
          console.error(error);
          return "Error evaluating Python code. See console for details.";
        }
      };
      (async function () {
        setPyodideOutput(await evaluatePython(pyodide.current, pythonCode));
      })();
    }
  }, [isPyodideLoading, pyodide, pythonCode]);

  if (panelStatus !== "ready") {
    return <div></div>;
  }

  return (
    <>
      <div>{isPyodideLoading ? loadingMessage : pyodideOutput}</div>
    </>
  );
}

// Pyodide.propTypes = {
//   pythonCode: PropTypes.string.isRequired,
//   loadingMessage: PropTypes.string,
//   evaluatingMessage: PropTypes.string,
// };

export function PyodideTest() {
  let myPythonCodeString = `
    import panel as pn
    pn.extension(sizing_mode="stretch_width")
    
    slider = pn.widgets.FloatSlider(start=0, end=10, name='Amplitude')
    
    def callback(new):
        return f'Amplitude is: {new}'
    
    component = pn.Row(slider, pn.bind(callback, slider))
    component.servable(target='my_panel_widget');
    `;

  return (
    <>
      <Pyodide pythonCode={myPythonCodeString} />
      <div id="my_panel_widget"></div>
    </>
  );
}

export default Pyodide;
