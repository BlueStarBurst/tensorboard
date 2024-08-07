export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        // import pyodide
        const { loadPyodide } = await import('pyodide')
    }

    // if (process.env.NEXT_RUNTIME === 'edge') {
    //     await import('./instrumentation-edge')
    // }
}