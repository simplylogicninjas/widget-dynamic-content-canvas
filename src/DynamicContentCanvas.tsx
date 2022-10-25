import React, { ReactElement, createElement, useEffect, useRef, useState, createRef } from "react";
import { DynamicContentCanvasContainerProps } from "../typings/DynamicContentCanvasProps";
import "./ui/DynamicContentCanvas.css";
import interact from 'interactjs';
import Big from "big.js";
import { EditableValue, ActionValue, ValueStatus } from "mendix";
import CanvasItem from "./components/CanvasItem";
import { onDragMove, onDragRotateEnd, onDragRotateMove, onDragRotateStart, onResizeMove } from "./utils/interactjs";
export function DynamicContentCanvas({
    data,
    lockedItemsData,
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
    const items = [...data.items ?? []];
    const lockedItems = [...lockedItemsData.items ?? []];
    const [activeItemId, setActiveItemId] = useState<string | number | undefined>();
    const isInteractingRef = useRef(false);
    const savedIdRef = useRef<EditableValue<Big>>();
    const savedWidthRef = useRef<EditableValue<Big>>();
    const savedHeightRef = useRef<EditableValue<Big>>();
    const savedXposRef = useRef<EditableValue<Big>>();
    const savedYposRef = useRef<EditableValue<Big>>();
    const savedAngleRef = useRef<EditableValue<Big>>();
    const savedActionRef = useRef<ActionValue | undefined>();
    const canSaveItemDimension = useRef<boolean>(false);
    const interactable = useRef<any>();
    const rotateInteractable = useRef<any>();

    const canvasRootRef = createRef<HTMLDivElement>();
    const canvasRootBoundingRect = useRef<DOMRect>();
    const currentItemRef = useRef<HTMLDivElement>();
    const currentItemBoundingRect = useRef<DOMRect>();

    const saveItemDimension = (target: HTMLElement) => {
        const id = target.getAttribute('data-id');

        if (canSaveItemDimension.current && items.length && id) {
            const itemX = (parseFloat(target.getAttribute('data-x') as string) || 0);
            const itemY = (parseFloat(target.getAttribute('data-y') as string) || 0);
            const itemWidth = (parseFloat(target.style.width as string) || 0);
            const itemHeight = (parseFloat(target.style.height as string) || 0);
            const itemAngle = (parseFloat(target.getAttribute('data-rotate') as string) || 0);
            savedID.setValue(new Big(id));
            savedXposRef.current?.setValue(new Big(itemX.toFixed(8)));
            savedYposRef.current?.setValue(new Big(itemY.toFixed(8)));
            savedWidthRef.current?.setValue(new Big(itemWidth.toFixed(8)));
            savedHeightRef.current?.setValue(new Big(itemHeight.toFixed(8)));
            savedAngleRef.current?.setValue(new Big(itemAngle.toFixed(8)));

            savedActionRef.current?.execute();
        }
    }
    const onItemActive = (id: string | number) => {
        setActiveItemId(id);
        clickedItemID.setValue(new Big(id));
    }

    const onRootClick = () => {
        if (!isInteractingRef.current) {
            setActiveItemId(undefined);
        }
    }

    const initInteractable = () => {
        interactable.current = interact('.canvas-item-resizable')
            .resizable({
                // resize from all edges and corners
                edges: {
                    left: true,
                    right: true,
                    bottom: '.resize-bottom',
                    top: '.resize-top',
                },

                listeners: {
                    start: () => isInteractingRef.current = true,
                    move: onResizeMove,
                    end: (event) => {
                        const target = event.target as HTMLElement;

                        saveItemDimension(target);
                        isInteractingRef.current = false;
                    }
                },
                modifiers: [
                // keep the edges inside the parent
                interact.modifiers.restrictEdges({
                    outer: 'parent'
                }),

                // minimum size
                interact.modifiers.restrictSize({
                    min: { width: 20, height: 20 }
                }) 
                ],
            })

        let dynamicTargets: {
            x?: number;
            y?: number;
            range: number;
        }[] = [];

        interactable.current = interact('.canvas-item-draggable')
            .draggable ({
                inertia: true,
                modifiers: [
                    interact.modifiers.snap({
                        targets: dynamicTargets,
                        relativePoints: [{
                            x: 0,
                            y: 0
                        }]
                    })
                ],

                listeners: {
                    start: (event) => {
                        const canvasRoot = document.querySelector('.canvas-root');

                        let element = event.target;
                        let element_width  = (element.offsetWidth);
                        let element_height = (element.offsetHeight);
                        let element_half_width = (element_width / 2);
                        let element_half_height = (element_height / 2);
                        if (canvasRootBoundingRect.current){
                            let x_axis = canvasRootBoundingRect.current.x / 2;
                            let y_axis = canvasRootBoundingRect.current.y / 2;

                            dynamicTargets.push({x: x_axis, range:20})
                            dynamicTargets.push({x: (x_axis - element_half_width), range: 20});
                            dynamicTargets.push({x: (x_axis - element_width), range:20});

                            dynamicTargets.push({y: y_axis, range:20});
                            dynamicTargets.push({y: (y_axis - element_half_height), range: 20});
                            dynamicTargets.push({y: (y_axis - element_height), range:20});

                            dynamicTargets.push({x: x_axis, y: y_axis, range: 20})
                        }

                        isInteractingRef.current = true;
                        currentItemRef.current = event.target as HTMLDivElement;


                        if (currentItemRef.current) {
                            currentItemBoundingRect.current = currentItemRef.current.getBoundingClientRect();
                        }

                        if (canvasRoot) {
                            canvasRootBoundingRect.current = canvasRoot.getBoundingClientRect();
                        }
                    },
                    move: onDragMove,
                    end: (event) => {
                        const target = event.target as HTMLElement;
                        dynamicTargets.length = 0;
                        saveItemDimension(target);
                        isInteractingRef.current = false;
                    }
            }
            })

        rotateInteractable.current = interact('.rotate-handle')
            .draggable({
                listeners: {
                    start: onDragRotateStart,
                    move: onDragRotateMove,
                    end: onDragRotateEnd
                }
            })
        }

  useEffect(() => {
    if (!interactable.current && items.length && canSaveItemDimension) {
        initInteractable();
    }
  }, [items.length, canSaveItemDimension]);

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
        <div className='canvas-root' onClick={() => onRootClick()} ref={canvasRootRef}>
            { 
                items.map(item => {
                    const itemID = itemId.get(item);
                    const width = itemWidth.get(item);
                    const height = itemHeight.get(item);
                    const xPos = itemXpos.get(item);
                    const yPos = itemYpos.get(item);
                    const angle = itemAngle.get(item);
                    //get other properties of item and return

                    const renderCanvasItem = (
                        itemID.status === ValueStatus.Available &&
                        width.status === ValueStatus.Available &&
                        height.status === ValueStatus.Available &&
                        xPos.status === ValueStatus.Available &&
                        yPos.status === ValueStatus.Available &&
                        angle.status === ValueStatus.Available
                    );

                    const itemIdValue = new Big(itemID.value!).toNumber();

                    return (
                        renderCanvasItem
                        ?
                        <CanvasItem
                            key={itemIdValue}
                            id={itemIdValue}
                            locked={!!lockedItems.find(it => it.id === item.id)}
                            active={activeItemId ? activeItemId === itemIdValue : false}
                            width={width.value!.toNumber()}
                            height={height.value!.toNumber()}
                            x={xPos.value!.toNumber()}
                            y={yPos.value!.toNumber()}
                            rotation={angle.value!.toNumber()}
                            autoHeight={itemAutoHeight.get(item).value ?? false}
                            lockPosition={itemLockPosition.get(item).value ?? false}
                            onActivate={id => onItemActive(id)}
                        >{ content?.get(item) }</CanvasItem>
                        :
                        <React.Fragment />
                    )
                })
            }
        </div>
    );
}