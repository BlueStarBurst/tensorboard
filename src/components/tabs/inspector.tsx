import { useContext, useEffect, useState } from "react";
import { ElementsContext } from "../canvas/elements-context";
import { Component, Data } from "../blocks";
import { useNotebook } from "./notebook-utils";

import { RadioGroup, Radio, Slider, Tooltip, Input, Switch } from "@nextui-org/react";

export default function Inspector() {

    const { selectedElement, setSelectedElement } = useContext(ElementsContext);

    const {
        updateNotebook
    } = useNotebook();


    const [data, setData] = useState<Data | undefined>(selectedElement?.component.data);
    const [component, setComponent] = useState<Component | undefined>(selectedElement?.component);

    useEffect(() => {
        setData(selectedElement?.component.data);
        setComponent(selectedElement?.component);
    }, [selectedElement]);

    function updateData(value: any, key: string) {
        var dat = data![key];
        dat.value = value;
        component!.data[key] = dat;
        component!.reload();
        updateNotebook();
        setData({ ...data, [key]: dat });
    }

    if (selectedElement === null) {
        return <div className="w-full h-full flex flex-col p-8 text-center justify-center items-center">
            <p className="text-xl">Nothing selected</p>
            <p className="text-gray-400">Create and select an element to edit its properties</p>
        </div>;
    }

    return (
        <div
            className="w-full h-full overflow-auto scroll gap-4 flex flex-col p-4"
            style={{
                boxShadow: "none"
            }}
        >
            <div className="flex flex-row justify-between">
                <p className="text-2xl">{component?.name}</p>
                <p className="text-gray-600">{component?.id}</p>
            </div>

            <p className="text-gray-400">{component?.description}</p>
            <div className="flex flex-col gap-5">
                {Object.keys(data ?? {}).map((key) => {
                    if (data![key].hidden) return <></>;
                    switch (data![key].type) {
                        case "matrix": {
                            return (
                                <div className="flex flex-col gap-2">
                                    <p>{key}</p>
                                    <div className="flex flex-row gap-2">
                                        {data![key].value.map((row: any, i: number) => {
                                            return (
                                                <div key={i} className="flex flex-col gap-2 w-full">
                                                    {row.map((cell: any, j: number) => {
                                                        return (
                                                            <div key={j} className="flex flex-row gap-2 w-full">
                                                                <Input
                                                                    className="w-full"
                                                                    defaultValue={cell}
                                                                    onChange={(e) => {
                                                                        if (e.target.value === "") return;

                                                                        if (isNaN(Number(e.target.value))) {
                                                                            console.log("Invalid number");
                                                                            e.target.value = data![key].value[i][j];
                                                                            return;
                                                                        }

                                                                        const v = Number(e.target.value);
                                                                        data![key].value[i][j] = v;
                                                                        updateData(data![key].value, key);
                                                                    }}
                                                                    size="sm"
                                                                    label={i + "," + j}
                                                                    isDisabled={data![key].readonly}
                                                                />
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        }

                        case "sort": {
                            return (
                                <>

                                </>
                            );
                        }
                        case "radio":
                            return (
                                <div className="flex flex-col gap-2">
                                    <p>{key}</p>
                                    <RadioGroup
                                        orientation="horizontal"
                                        onChange={(e) => {
                                            updateData(e.target.value, key);
                                        }}
                                        value={data![key].value}
                                    >
                                        {data![key].options!.map((option) => (
                                            <Radio key={option} value={option}>
                                                {option}
                                            </Radio>
                                        ))}
                                    </RadioGroup>
                                </div>
                            );
                        case "checkbox":
                            return (
                                <div className="flex flex-col gap-2">
                                    <p>{key}</p>
                                    <div className="flex flex-row items-center">

                                        <Switch
                                            checked={data![key].value}
                                            onChange={(e) => {
                                                updateData(e.target.checked ? "True" : "False", key);
                                            }}
                                        />
                                        <p>
                                            {data![key].value ? "Enabled" : "Disabled"}
                                        </p>
                                    </div>
                                </div>
                            );
                        case "slider":
                            return (
                                <div className="flex flex-col gap-2">
                                    <p>{key}</p>
                                    <div className="flex flex-row justify-between gap-4 items-center">
                                        <Input className="w-24" value={data![key].value} onChange={(e) => {
                                            const v = e.target.value;
                                            updateData(v, key);
                                        }} />
                                        <Slider
                                            className="overflow-hidden"
                                            minValue={data![key].min}
                                            maxValue={data![key].max}
                                            step={data![key].step}
                                            value={data![key].value}
                                            fillOffset={0}
                                            size="sm"
                                            onChange={(value) => {
                                                updateData(value, key);
                                            }}
                                        />



                                    </div>
                                </div>
                            );
                        case "text":
                        default:
                            return (
                                <div className="flex flex-col gap-2">
                                    <p>{key}</p>
                                    <div>
                                        <Input
                                            value={data![key].value}
                                            onChange={(e) => {
                                                const v = e.target.value;
                                                updateData(v, key);
                                            }}
                                            size="md"
                                            label={key}
                                            isDisabled={data![key].readonly}
                                        />
                                    </div>
                                </div>
                            );
                    }
                })}
            </div>
        </div>
    )
}