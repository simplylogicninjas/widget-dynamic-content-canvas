/**
 * This file was generated from DynamicContentCanvas.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix UI Content Team
 */
import { ComponentType, CSSProperties } from "react";
import { ActionValue, DynamicValue, EditableValue, ListValue, ListAttributeValue, ListExpressionValue, ListWidgetValue } from "mendix";
import { Big } from "big.js";

export interface DynamicContentCanvasContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    widgetId?: DynamicValue<string>;
    savedID?: EditableValue<Big>;
    activeID?: EditableValue<Big>;
    savedWidth?: EditableValue<Big>;
    savedHeight?: EditableValue<Big>;
    savedXpos?: EditableValue<Big>;
    savedYpos?: EditableValue<Big>;
    savedAngle?: EditableValue<Big>;
    data: ListValue;
    content?: ListWidgetValue;
    popoverContent?: ListWidgetValue;
    itemId: ListAttributeValue<Big>;
    itemWidth: ListAttributeValue<Big>;
    itemHeight: ListAttributeValue<Big>;
    itemXpos: ListAttributeValue<Big>;
    itemYpos: ListAttributeValue<Big>;
    itemZIndex: ListAttributeValue<Big>;
    itemAngle: ListAttributeValue<Big>;
    itemLockPosition: ListExpressionValue<boolean>;
    itemAutoHeight: ListExpressionValue<boolean>;
    itemPreserveRatio: ListExpressionValue<boolean>;
    lockedItemsData: ListValue;
    clickedItemID?: EditableValue<Big>;
    presentationClickAction?: ActionValue;
    savedAction?: ActionValue;
}

export interface DynamicContentCanvasPreviewProps {
    className: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    widgetId: string;
    savedID: string;
    activeID: string;
    savedWidth: string;
    savedHeight: string;
    savedXpos: string;
    savedYpos: string;
    savedAngle: string;
    data: {} | { type: string } | null;
    content: { widgetCount: number; renderer: ComponentType<{ caption?: string }> };
    popoverContent: { widgetCount: number; renderer: ComponentType<{ caption?: string }> };
    itemId: string;
    itemWidth: string;
    itemHeight: string;
    itemXpos: string;
    itemYpos: string;
    itemZIndex: string;
    itemAngle: string;
    itemLockPosition: string;
    itemAutoHeight: string;
    itemPreserveRatio: string;
    lockedItemsData: {} | { type: string } | null;
    clickedItemID: string;
    clickedItemAction: {} | null;
    presentationClickAction: {} | null;
    savedAction: {} | null;
}
