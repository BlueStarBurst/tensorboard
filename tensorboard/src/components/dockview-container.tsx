import React from "react";
import {
    IDockviewPanelProps,
    DockviewApi,
    DockviewReact,
    DockviewReadyEvent,
    DockviewDefaultTab,
    IDockviewPanelHeaderProps,
    DockviewPanelApi
} from "dockview";
import Canvas from "./canvas/canvas";
import Blocks from "./tabs/blocks";
import Raw from "./tabs/raw";
import Notebook from "./tabs/notebook";

const components = {
    default: (props: IDockviewPanelProps) => {
        return (
            <div
                style={{
                    height: "100%",
                    backgroundColor: props.params.color,
                    padding: "10px"
                }}
            >
                <h2>{`This is panel '${props.api.id}'`}</h2>
            </div>
        );
    },
    Blocks: (props: IDockviewPanelProps) => {
        return (
            <Blocks />
        );
    },
    Canvas: (props: IDockviewPanelProps) => {
        // remove header
        return (
            <Canvas canvasWidth={1920*2} canvasHeight={1080*2} maxScale={2} minScale={0.5} />
        );
    },
    Raw: (props: IDockviewPanelProps) => {
        return (
            <Raw />
        )
    },
    Notebook: (props: IDockviewPanelProps) => {
        return (
            <Notebook />
        )
    }

};

const CustomTabRenderer = (props: IDockviewPanelHeaderProps) => {
    const api: DockviewPanelApi = props.api;
    const containerApi: DockviewApi = props.containerApi;

    console.log(api.id, containerApi);

    return <div className="w-full h-full flex flex-row justify-center items-center px-5">
        <p>
            {api.id}
        </p>
    </div>
}

export default function DockViewContainer() {
    const api = React.useRef<DockviewApi>();

    const onReady = (event: DockviewReadyEvent) => {
        api.current = event.api;

        // if we add panels without initially rendering the grid
        // with a size the default width and height are zero.
        event.api.layout(window.innerWidth, window.innerHeight);

        const canvas = event.api.addPanel({
            id: "Canvas",
            component: "Canvas",
            params: { color: "gray" },
        });

        canvas.group.header.hidden = true;
        canvas.group.locked = true;


        event.api.addPanel({
            id: "Raw",
            component: "Raw",
            params: { color: "red" },
            position: { referencePanel: "Canvas", direction: "right" }
        });
        event.api.addPanel({
            id: "Notebook",
            component: "Notebook",
            params: { color: "red" }
        });
        event.api.addPanel({
            id: "Blocks",
            component: "Blocks",
            params: { color: "red" },
            position: { referencePanel: "Canvas", direction: "below" }
        });
    };

    React.useEffect(() => {
        const onResize = () => {
            api.current?.layout(window.innerWidth, window.innerHeight);
        };

        window.addEventListener("resize", onResize);
        onResize();

        return () => {
            window.removeEventListener("resize", onResize);
        };
    }, []);

    return (
        <DockviewReact
            className="dockview-theme-dark overflow-hidden"
            components={components}
            onReady={onReady}
            defaultTabComponent={CustomTabRenderer}
        />
    );
}