"use client";

import React, { useState } from "react";
import {
    IDockviewPanelProps,
    DockviewApi,
    DockviewReact,
    DockviewReadyEvent,
    DockviewDefaultTab,
    IDockviewPanelHeaderProps,
    DockviewPanelApi,
    GroupviewPanelState,
    IGroupPanelInitParameters,
    PanelUpdateEvent
} from "dockview";
import Canvas from "./canvas/canvas";
import Blocks from "./tabs/blocks";
import Raw from "./tabs/raw";
import Notebook from "./tabs/notebook";
import Inspector from "./tabs/inspector";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpRightFromSquare, faMinimize, faShare } from "@fortawesome/free-solid-svg-icons";
import { useStorage } from "./misc/local-storage";
import { StorageContext } from "./misc/storage-context";

const CustomTabRenderer = (props: IDockviewPanelHeaderProps) => {
    const api: DockviewPanelApi = props.api;
    const containerApi: DockviewApi = props.containerApi;

    return <div className="w-full h-full flex flex-row justify-center items-center px-5 scroll">
        <p>
            {api.id}
        </p>
    </div>
}

const FloatingTabRenderer = (props: IDockviewPanelHeaderProps) => {
    const api: DockviewPanelApi = props.api;
    const containerApi: DockviewApi = props.containerApi;


    function makeFloating(e: React.MouseEvent) {


        console.log("makeFloating", api.id);

        if (api.location.type === "floating") {
            return;
        }

        const group = containerApi.addGroup();
        api.moveTo({ group });

        containerApi.addFloatingGroup(group, {
            width: 400,
            height: 500,
            x: e.clientX,
            y: e.clientY
        });
    }


    return <div className="w-full h-full flex flex-row justify-center items-center px-5 scroll">
        <p>
            {api.id}
            <FontAwesomeIcon
                icon={faArrowUpRightFromSquare}
                className="text-gray-300 ml-2 cursor-pointer opacity-50 hover:opacity-100"
                onClick={makeFloating}
            />
        </p>
    </div>
}

const tabComponents = {
    default: CustomTabRenderer,
    FloatingTabRenderer: FloatingTabRenderer
}

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
            <Canvas canvasWidth={4000} canvasHeight={4000} maxScale={2} minScale={0.4} />
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
    },
    Inspector: (props: IDockviewPanelProps) => {
        return (
            <Inspector />
        )
    },
};

export default function DockViewContainer() {

    const api = React.useRef<DockviewApi>();

    const onReady = (event: DockviewReadyEvent) => {
        api.current = event.api;

        // if we add panels without initially rendering the grid
        // with a size the default width and height are zero.
        event.api.layout(window.innerWidth, window.innerHeight);

        event.api.onDidLayoutChange(() => {

            const isMobile = window.innerWidth < 800;

            if (isMobile) {
                return;
            }

            console.log("layout changed");
            window.localStorage.setItem("layout", JSON.stringify(event.api.toJSON()));
        });

        if (window.localStorage.getItem("layout")) {
            console.log("loading layout");
            event.api.fromJSON(JSON.parse(window.localStorage.getItem("layout")!));
            return;
        }

        const canvas = event.api.addPanel({
            id: "Canvas",
            component: "Canvas",
            params: { color: "gray" },
        });

        canvas.group.header.hidden = true;
        canvas.group.locked = true;
        const blocks = event.api.addPanel({
            id: "Blocks",
            component: "Blocks",
            params: { color: "red" },
            position: { referencePanel: "Canvas", direction: "right" }
        });
        event.api.addPanel({
            id: "Inspector",
            component: "Inspector",
            params: { color: "red" },
            tabComponent: "FloatingTabRenderer"
        });

        blocks.focus();

        event.api.addPanel({
            id: "Raw",
            component: "Raw",
            params: { color: "red" },
            position: { referencePanel: "Blocks", direction: "below" }
        });
        event.api.addPanel({
            id: "Notebook",
            component: "Notebook",
            params: { color: "red" }
        });



    };

    React.useEffect(() => {
        const onResize = () => {

            const isMobile = window.innerWidth < 800;
            console.log("isMobile", isMobile);

            api.current?.layout(window.innerWidth, window.innerHeight);

            if (!isMobile) {
                if (window.localStorage.getItem("layout")) {
                    console.log("loading layout");
                    api.current?.fromJSON(JSON.parse(window.localStorage.getItem("layout")!));
                }
                return;
            }

            const panels = api.current?.panels;

            const canvasPanel = panels?.find((panel) => panel.id === "Canvas");

            const nonCanvasPanels = panels?.filter((panel) => panel.id !== "Canvas");

            console.log("nonCanvasPanels", nonCanvasPanels);

            const newGroup = api.current?.addGroup();

            if (!newGroup) {
                return;
            }

            for (const panel of nonCanvasPanels ?? []) {
                panel.api.moveTo({ group: newGroup });
            }

            //move group to below canvas
            newGroup.api.moveTo({ group: canvasPanel?.group, position: "bottom" });

        };

        window.addEventListener("resize", onResize);
        onResize();

        return () => {
            window.removeEventListener("resize", onResize);
        };
    }, []);

    return (
        <DockviewReact
            className="dockview-theme-dark overflow-hidden scroll"
            components={components}
            tabComponents={tabComponents}
            onReady={onReady}
            defaultTabComponent={CustomTabRenderer}
        />
    );
}