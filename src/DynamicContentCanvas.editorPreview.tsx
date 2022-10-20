import { ReactElement, createElement } from "react";
import { DynamicContentCanvasPreviewProps } from "../typings/DynamicContentCanvasProps";

export function preview(_: DynamicContentCanvasPreviewProps): ReactElement {
    return <div />;
}

export function getPreviewCss(): string {
    return require("./ui/DynamicContentCanvas.css");
}
