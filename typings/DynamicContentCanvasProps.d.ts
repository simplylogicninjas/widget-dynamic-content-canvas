/**
 * This file was generated from DynamicContentCanvas.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix UI Content Team
 */
import { ComponentType, CSSProperties } from "react";
import { ActionValue, EditableValue, ListValue, ListAttributeValue, ListWidgetValue } from "mendix";
import { Big } from "big.js";

export interface DynamicContentCanvasContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    sampleText: string;
    savedID: EditableValue<Big>;
    savedWidth: EditableValue<Big>;
    savedHeight: EditableValue<Big>;
    savedXpos: EditableValue<Big>;
    savedYpos: EditableValue<Big>;
    savedAngle: EditableValue<Big>;
    savedAction?: ActionValue;
    data: ListValue;
    content?: ListWidgetValue;
    itemName: ListAttributeValue<string>;
    itemId: ListAttributeValue<Big>;
    itemWidth: ListAttributeValue<Big>;
    itemHeight: ListAttributeValue<Big>;
    itemXpos: ListAttributeValue<Big>;
    itemYpos: ListAttributeValue<Big>;
    itemAngle: ListAttributeValue<Big>;
    lockedItemsData: ListValue;
    clickedItemID: EditableValue<Big>;
}

export interface DynamicContentCanvasPreviewProps {
    className: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    sampleText: string;
    savedID: string;
    savedWidth: string;
    savedHeight: string;
    savedXpos: string;
    savedYpos: string;
    savedAngle: string;
    savedAction: {} | null;
    data: {} | { type: string } | null;
    content: { widgetCount: number; renderer: ComponentType<{ caption?: string }> };
    itemName: string;
    itemId: string;
    itemWidth: string;
    itemHeight: string;
    itemXpos: string;
    itemYpos: string;
    itemAngle: string;
    lockedItemsData: {} | { type: string } | null;
    clickedItemID: string;
    clickedItemAction: {} | null;
}
