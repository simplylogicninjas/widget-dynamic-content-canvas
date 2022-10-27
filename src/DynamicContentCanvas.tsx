import { ReactElement, createElement, useEffect, useRef, useState } from "react";
import { DynamicContentCanvasContainerProps } from "../typings/DynamicContentCanvasProps";
import "./ui/DynamicContentCanvas.css";
import Big from "big.js";
import { ObjectItem, EditableValue, ActionValue, ValueStatus } from "mendix";
import CanvasInteract, { Item } from "./components/CanvasInteract";
import { listUnique } from "./utils/utils";
export function DynamicContentCanvas({
    data,
    clickedItemID,
    content,
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
    itemAngle,
    itemAutoHeight,
    itemLockPosition
}: DynamicContentCanvasContainerProps): ReactElement {
    const itemsRef = useRef<ObjectItem[]>([]);
    const [canvasItems, setCanvasItems] = useState<Item[]>([]);
    const savedIdRef = useRef<EditableValue<Big>>();
    const savedWidthRef = useRef<EditableValue<Big>>();
    const savedHeightRef = useRef<EditableValue<Big>>();
    const savedXposRef = useRef<EditableValue<Big>>();
    const savedYposRef = useRef<EditableValue<Big>>();
    const savedAngleRef = useRef<EditableValue<Big>>();
    const savedActionRef = useRef<ActionValue | undefined>();
    const canSaveItemDimension = useRef<boolean>(false);

    const calculateCanvasItems = (items: ObjectItem[]) => {
        setCanvasItems(
            items.map(item => {
                const itemID = itemId.get(item);
                const width = itemWidth.get(item);
                const height = itemHeight.get(item);
                const xPos = itemXpos.get(item);
                const yPos = itemYpos.get(item);
                const angle = itemAngle.get(item);

                return {
                    id: itemID.value ? itemID.value.toString() : '',
                    content: content?.get(item),
                    width: width.value?.toNumber() ?? 0,
                    height: height.value?.toNumber() ?? 0,
                    x: xPos.value?.toNumber() ?? 0,
                    y: yPos.value?.toNumber() ?? 0,
                    rotation: angle.value?.toNumber() ?? 0,
                    autoHeight: itemAutoHeight.get(item).value ?? false,
                    lockPosition: itemLockPosition.get(item).value ?? false
                }
            })
        )
    }

    const saveItemDimension = (target: HTMLElement) => {
        const id = target.getAttribute('data-id') || target.getAttribute('data-itemid');

        if (canSaveItemDimension.current && id) {
            const item = document.getElementById(`canvas-item-${id}`);

            if (item) {
                const itemX = (parseFloat(item.getAttribute('data-x') as string) || 0);
                const itemY = (parseFloat(item.getAttribute('data-y') as string) || 0);
                const itemWidth = (parseFloat(item.style.width as string) || 0);
                const itemHeight = (parseFloat(item.style.height as string) || 0);
                const itemAngle = (parseFloat(item.getAttribute('data-rotate') as string) || 0);

                console.log('itemX to Mendix', itemX, itemY);

                savedID.setValue(new Big(id));
                savedXposRef.current?.setValue(new Big(itemX.toFixed(8)));
                savedYposRef.current?.setValue(new Big(itemY.toFixed(8)));
                savedWidthRef.current?.setValue(new Big(itemWidth.toFixed(8)));
                savedHeightRef.current?.setValue(new Big(itemHeight.toFixed(8)));
                savedAngleRef.current?.setValue(new Big(itemAngle.toFixed(8)));

                savedActionRef.current?.execute();
            }
        }
    }

    const onItemActive = (id: string | number) => {
        clickedItemID.setValue(new Big(id));
    }

    // const initInteractable = () => {
    //     interactable.current = interact('.canvas-item-resizable')
    //         .resizable({
    //             // resize from all edges and corners
    //             edges: {
    //                 left: true,
    //                 right: true,
    //                 bottom: '.resize-bottom',
    //                 top: '.resize-top',
    //             },

    //             listeners: {
    //                 start: () => isInteractingRef.current = true,
    //                 move: onResizeMove,
    //                 end: (event) => {
    //                     const target = event.target as HTMLElement;

    //                     saveItemDimension(target);
    //                     isInteractingRef.current = false;
    //                 }
    //             },
    //             modifiers: [
    //             // keep the edges inside the parent
    //             interact.modifiers.restrictEdges({
    //                 outer: 'parent'
    //             }),

    //             // minimum size
    //             interact.modifiers.restrictSize({
    //                 min: { width: 20, height: 20 }
    //             }) 
    //             ],
    //         })

    //     let dynamicTargets: {
    //         x?: number;
    //         y?: number;
    //         range: number;
    //     }[] = [];

    //     interactable.current = interact('.canvas-item-draggable')
    //         .draggable ({
    //             inertia: true,
    //             modifiers: [
    //             ],

    //             listeners: {
    //                 start: (event) => {},
    //                 move: onDragMove,
    //                 end: (event) => {
                        
    //                     const target = event.target as HTMLElement;
    //                 }
    //         }
    //         })

    //     rotateInteractable.current = interact('.rotate-handle')
    //         .draggable({
    //             listeners: {
    //                 start: onDragRotateStart,
    //                 move: onDragRotateMove,
    //                 end: (event) => {
    //                     const target = event.target as HTMLElement;

    //                     onDragRotateEnd(event);
    //                     saveItemDimension(target);
    //                 }
    //             }
    //         })
    //     }

  useEffect(() => {
    calculateCanvasItems(data.items ?? []);
    itemsRef.current = data.items ?? [];
  }, [data.items?.length, listUnique(itemsRef.current, data.items)]);

  useEffect(() => {
    if (
        savedWidth.status === ValueStatus.Available &&
        savedHeight.status === ValueStatus.Available &&
        savedXpos.status === ValueStatus.Available &&
        savedYpos.status === ValueStatus.Available && 
        savedAngle.status === ValueStatus.Available 
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
    savedWidth.status,
    savedHeight.status,
    savedXpos.status,
    savedYpos.status,
    savedAngle.status
  ])
    
    return (
        <CanvasInteract
            items={[...canvasItems]}
            onItemActivate={id => onItemActive(id)}
            onDimensionChange={saveItemDimension}
        />

        // <div className='canvas-root' onClick={() => onRootClick()} ref={canvasRootRef}>
        //     { 
        //         items.map(item => {
        //             const itemID = itemId.get(item);
        //             const width = itemWidth.get(item);
        //             const height = itemHeight.get(item);
        //             const xPos = itemXpos.get(item);
        //             const yPos = itemYpos.get(item);
        //             const angle = itemAngle.get(item);
        //             //get other properties of item and return

        //             const renderCanvasItem = (
        //                 itemID.status === ValueStatus.Available &&
        //                 width.status === ValueStatus.Available &&
        //                 height.status === ValueStatus.Available &&
        //                 xPos.status === ValueStatus.Available &&
        //                 yPos.status === ValueStatus.Available &&
        //                 angle.status === ValueStatus.Available
        //             );

        //             const itemIdValue = new Big(itemID.value!).toNumber();

        //             return (
        //                 renderCanvasItem
        //                 ?
        //                 <CanvasItem
        //                     key={itemIdValue}
        //                     id={itemIdValue}
        //                     locked={!!lockedItems.find(it => it.id === item.id)}
        //                     active={activeItemId ? activeItemId === itemIdValue : false}
        //                     width={width.value!.toNumber()}
        //                     height={height.value!.toNumber()}
        //                     x={xPos.value!.toNumber()}
        //                     y={yPos.value!.toNumber()}
        //                     rotation={angle.value!.toNumber()}
        //                     autoHeight={itemAutoHeight.get(item).value ?? false}
        //                     lockPosition={itemLockPosition.get(item).value ?? false}
        //                     onActivate={id => onItemActive(id)}
        //                 >{ content?.get(item) }</CanvasItem>
        //                 :
        //                 <React.Fragment />
        //             )
        //         })
        //     }
        // </div>
    );
}