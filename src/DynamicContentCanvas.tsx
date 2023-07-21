import { ReactElement, createElement, useEffect, useRef, useState } from "react";
import { DynamicContentCanvasContainerProps } from "../typings/DynamicContentCanvasProps";
import "./ui/DynamicContentCanvas.css";
import Big from "big.js";
import { ObjectItem, EditableValue, ActionValue, ValueStatus } from "mendix";
import CanvasInteract, { Item } from "./components/CanvasInteract";

export function DynamicContentCanvas({
    widgetId,
    name,
    data,
    lockedItemsData,
    clickedItemID,
    activeID,
    content,
    popoverContent,
    savedWidth,
    savedHeight,
    savedXpos,
    savedYpos,
    savedAngle,
    savedAction,
    savedID,
    itemId,
    itemWidth,
    itemHeight,
    itemXpos,
    itemYpos,
    itemZIndex,
    itemAngle,
    itemAutoHeight,
    itemLockPosition,
    itemPreserveRatio,
    presentationClickAction
    
}: DynamicContentCanvasContainerProps): ReactElement {
    const [widgetName, setWidgetName] = useState(name);
    const widgetNameRef = useRef(name);
    const itemsRef = useRef<Item[]>([]);
    const objectItemsRef = useRef<ObjectItem[]>([]);
    const [canvasItems, setCanvasItems] = useState<Item[]>([]);
    const savedIdRef = useRef<EditableValue<Big>>();
    const savedWidthRef = useRef<EditableValue<Big>>();
    const savedHeightRef = useRef<EditableValue<Big>>();
    const savedXposRef = useRef<EditableValue<Big>>();
    const savedYposRef = useRef<EditableValue<Big>>();
    const savedAngleRef = useRef<EditableValue<Big>>();
    const savedActionRef = useRef<ActionValue | undefined>();
    const canSaveItemDimension = useRef<boolean>(false);

    const updateItems = (allItems: Item[], lockedItems: ObjectItem[] = []) => {
        const updatedItems = allItems
        .map(item => {
            if (lockedItems.find(it => it.id === item.id)) {
                return {
                    ...item,
                    locked: true,
                    z: item.z - 10
                }
            } else {
                return item;
            }
        });

        return updatedItems;
    }

    const getCanvasItems = (objectItems: ObjectItem[] = []) => {
        try {
            const canvasItems = objectItems.length ? [...objectItems] : [...objectItemsRef.current];

            return canvasItems.map(item => {
                const itemID = itemId.get(item);
                const width = itemWidth.get(item);
                const height = itemHeight.get(item);
                const xPos = itemXpos.get(item);
                const yPos = itemYpos.get(item);
                const zIndex = itemZIndex.get(item);
                const angle = itemAngle.get(item);

                return {
                    id: item.id,
                    itemId: itemID.value ? itemID.value.toString() : '',
                    locked: false,
                    content: content?.get(item),
                    popoverContent: popoverContent?.get(item),
                    width: width.value?.toNumber() ?? 0,
                    height: height.value?.toNumber() ?? 0,
                    x: xPos.value?.toNumber() ?? 0,
                    y: yPos.value?.toNumber() ?? 0,
                    z: (zIndex.value?.toNumber() ?? 0) + 12,
                    rotation: angle.value?.toNumber() ?? 0,
                    autoHeight: itemAutoHeight.get(item).value ?? false,
                    lockPosition: itemLockPosition.get(item).value ?? false,
                    preserveAspectRatio: itemPreserveRatio.get(item).value ?? false
                }
            }).sort(it => it.z);
        } catch (e) {
            return [];
        }
    }

    const saveItemDimension = (target: HTMLElement) => {
        const id = target.getAttribute('data-id') || target.getAttribute('data-itemid');

        if (canSaveItemDimension.current && id) {
            const item = document.querySelector(`.${widgetNameRef.current} .canvas-item-${id}`) as HTMLElement;

            if (item) {
                const itemX = (parseFloat(item.getAttribute('data-x') as string) || 0);
                const itemY = (parseFloat(item.getAttribute('data-y') as string) || 0);
                const itemWidth = (parseFloat(item.style.width as string) || 0);
                const itemHeight = (parseFloat(item.style.height as string) || 0);
                const itemAngle = (parseFloat(item.getAttribute('data-rotate') as string) || 0);

                savedID?.setValue(new Big(id));
                savedXposRef.current?.setValue(new Big(itemX.toFixed(8)));
                savedYposRef.current?.setValue(new Big(itemY.toFixed(8)));
                savedWidthRef.current?.setValue(new Big(itemWidth.toFixed(8)));
                savedHeightRef.current?.setValue(new Big(itemHeight.toFixed(8)));
                savedAngleRef.current?.setValue(new Big(itemAngle.toFixed(8)));

                savedActionRef.current?.execute();

                // data.reload();
            }
        }
    }

    const onItemActive = (id: string | number) => {
        clickedItemID?.setValue(new Big(id));
    }

    const onSurfaceClick = () => {
        presentationClickAction?.execute();
    }

  useEffect(() => {
    if (data.status === ValueStatus.Available) {
        const canvasItems = getCanvasItems(data.items);
        const updatedItems = updateItems(canvasItems, lockedItemsData.items ?? []);

        itemsRef.current = [...updatedItems];
        objectItemsRef.current = [...canvasItems];
        setCanvasItems([...updatedItems]);
    } 
    }, [
        data?.status === ValueStatus.Available,
        lockedItemsData?.status === ValueStatus.Available,
        data?.items,
        lockedItemsData?.items
    ]);

  useEffect(() => {
    return (() => {
        // itemsRef.current = [];
        // setCanvasItems([]);
    })
  }, []);

  useEffect(() => {
    if (
        savedWidth?.status === ValueStatus.Available &&
        savedHeight?.status === ValueStatus.Available &&
        savedXpos?.status === ValueStatus.Available &&
        savedYpos?.status === ValueStatus.Available && 
        savedAngle?.status === ValueStatus.Available 
    ) {
        savedWidthRef.current = savedWidth;
        savedHeightRef.current = savedHeight;
        savedXposRef.current = savedXpos;
        savedYposRef.current = savedYpos;
        savedAngleRef.current = savedAngle;
        savedIdRef.current = savedID;
        savedActionRef.current = savedAction;

        canSaveItemDimension.current = true;
    }
  }, [
    savedWidth?.status,
    savedHeight?.status,
    savedXpos?.status,
    savedYpos?.status,
    savedAngle?.status,
    savedAction?.canExecute
  ])

  useEffect(() => {
    if (widgetId?.value) {
        setWidgetName(widgetId.value);
        widgetNameRef.current = widgetId.value;
    }
  }, [widgetId?.value])
    
    return (
        <CanvasInteract
            id={widgetName}
            items={[...canvasItems]}
            activeItemID={activeID?.displayValue}
            onItemActivate={id => onItemActive(id)}
            onDimensionChange={saveItemDimension}
            onSurfaceClick={onSurfaceClick}
        />
    );
}