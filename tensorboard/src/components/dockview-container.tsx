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
import Canvas from "./canvas";
import Blocks from "./tabs/blocks";

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
            <Canvas />
        );
    }

};

const CustomTabRenderer = (props: IDockviewPanelHeaderProps) => {
    const api: DockviewPanelApi = props.api;
    const containerApi: DockviewApi = props.containerApi;

    console.log(api.id, containerApi);

    return <div>{/** logic */}</div>
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
            component: "default",
            params: { color: "gray" },
        });

        canvas.group.header.hidden = true;
        canvas.group.locked = true;

        
        event.api.addPanel({
            id: "Raw",
            component: "default",
            params: { color: "red" },
            position: { referencePanel: "Canvas", direction: "right" }
        });
        event.api.addPanel({
            id: "Notebook",
            component: "default",
            params: { color: "red" }
        });
        event.api.addPanel({
            id: "Blocks",
            component: "default",
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
        // defaultTabComponent={CustomTabRenderer}
        />
    );
}