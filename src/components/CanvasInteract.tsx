import React, { createElement, useEffect, useRef, useState, ReactNode } from "react"
import { InteractModule, SnapLineEvent } from "src/modules/interact";
import CanvasItem from "./CanvasItem";
import CanvasLine from "./CanvasLine";
import { listUnique } from "src/utils/utils";

export interface Item {
    id: string;
    itemId: string | number;
    x: number;
    y: number;
    z: number;
    active?: boolean;
    width: number;
    height: number;
    rotation: number;
    autoHeight: boolean;
    lockPosition: boolean;
    locked: boolean;
    preserveAspectRatio: boolean;
    content: ReactNode;
    popoverContent?: ReactNode;
}

export interface InteractItem extends Item {
    top: number;
    left: number;
    bottom: number;
    right: number;
}

interface Props {
    id: string;
    items: Item[];
    activeItemID?: string | undefined;
    onItemActivate: (id: string | number) => void;
    onSurfaceClick: () => void;
    onDimensionChange: (target: HTMLElement) => void;
}

const CanvasInteract = ({
    id,
    items,
    activeItemID,
    onItemActivate,
    onSurfaceClick,
    onDimensionChange
}: Props) => {
    const isInteractingRef = useRef(false);
    const currentItemsRef = useRef<Item[]>([]);
    const currentItemActiveRef = useRef<string | number>(-1);
    const [snapLine, setSnapLine] = useState<SnapLineEvent>();
    const [dragActive, setDragActive] = useState(false);
    
    const onItemActive = (id: string | number) => {
        onItemActivate(id);
        currentItemActiveRef.current = id;
    }

    const onSnapInteract = (event: SnapLineEvent) => {
        setSnapLine({...event});
    }

    const onStartInteract = () => {
        isInteractingRef.current = true;
    }

    const onEndInteract = () => {
        isInteractingRef.current = false;
        // setSnapLine(undefined);
    }

    const onDragStart = () => {
        setDragActive(true);
    }

    const onDragEnd = () => {
        setDragActive(false);
        // setSnapLine(undefined);
    }

    const interactModule = useRef<InteractModule>(
        new InteractModule(
            id,
            onDimensionChange,
            onSnapInteract,
            onStartInteract,
            onEndInteract,
            onDragStart,
            onDragEnd
        )
    );

    useEffect(() => {
        if (id) {
            interactModule.current.init(id);
        }

        return (() => {
            currentItemsRef.current = [];

            if (interactModule.current) {
                interactModule.current.destroy();
            }
        })
    }, [id]);

    useEffect(() => {
        interactModule.current.syncItems(items);
        currentItemsRef.current = items;
    }, [listUnique(items, currentItemsRef.current)])

    return (
        <div className={`canvas-root ${id}`}>
            <div className={'canvas-root__items'}>
            {
                items.map(item => (
                    <CanvasItem
                        key={item.id}
                        active={activeItemID === item.itemId}
                        canActivate={activeItemID === '' || activeItemID === '0'}
                        onActivate={onItemActive}
                        dragInteractActive={dragActive}
                        {...item}
                    >
                        {item.content}
                    </CanvasItem>
                ))
            }
            </div>
            <div className={'canvas-root__surface'} onClick={onSurfaceClick}>
            {
                snapLine !== undefined ? (
                    <React.Fragment>
                        <CanvasLine
                        snapLine={snapLine}
                        canvasRootRect={interactModule.current.canvasRootRect}
                        />
                    </React.Fragment>
                ) : undefined
            }
            </div>
        </div>
    )
}

export default CanvasInteract