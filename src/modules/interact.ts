import { Modifier } from "@interactjs/modifiers/types";
import { Interactable, SnapTarget } from "@interactjs/types";
import interact from "interactjs";
import { InteractItem, Item } from "src/components/CanvasInteract";
import { updateItemPositionStyle } from "src/utils/interactjs";

const AXIS_RANGE = 10;

type Axis = 'x' | 'y' | 'xy';

interface SnapItem {
    id?: string | number;
    type: 'root' | 'item';
    axis: Axis;
    x: number;
    y: number;
    width: number;
    height: number;
    range: number;
}

export interface SnapLineEvent {
    snapItem: SnapItem;
    x: number;
    y: number;
    targetX: number;
    targetY: number;
    targetWidth: number;
    targetHeight: number;
}

export class InteractModule {
    public snapItems: SnapItem[] = [];
    public canvasRootRect: DOMRect | undefined;

    private interactableResize: Interactable | undefined = undefined;
    private interactableDraggable: Interactable | undefined = undefined;
    private interactableRotate: Interactable | undefined = undefined;
    private items: InteractItem[] = [];

    private aspectRatioModifier: Modifier = interact.modifiers.aspectRatio({ ratio: 'preserve', enabled: true });
    
    private canvasRootName: string;
    private currentTargetId: string | undefined | null;

    private presentationSlidesElement: HTMLElement | undefined;
    private presentationScale: number = 1;
    // private currentTargetWidth = 0;
    // private currentTargetHalfWidth = 0;
    // private currentTargetHeight = 0;
    // private currentTargetHalfHeight = 0;

    onDimensionChange: (target: HTMLElement) => void;
    onSnap: (event: SnapLineEvent) => void;
    onStart: () => void;
    onEnd: () => void;
    onDragStart: () => void;
    onDragEnd: () => void;

    constructor(
        canvasRootName: string,
        onDimensionChange: (target: HTMLElement) => void,
        onSnap: (event: SnapLineEvent) => void,
        onStart: () => void,
        onEnd: () => void,
        onDragStart: () => void,
        onDragEnd: () => void
    ) {
        this.onDimensionChange = onDimensionChange;
        this.onSnap = onSnap;
        this.onStart = onStart;
        this.onEnd = onEnd;
        this.onDragStart = onDragStart;
        this.onDragEnd = onDragEnd;
        this.canvasRootName = canvasRootName;

        window.addEventListener('resize', () => this.updateCanvasRootRect())
    }

    destroy() {
        if (this.interactableResize) {
            this.interactableResize.unset();
        }

        if (this.interactableDraggable) {
            this.interactableDraggable.unset();
        }

        if (this.interactableRotate) {
            this.interactableRotate.unset();
        }

        window.removeEventListener('resize', () => this.updateCanvasRootRect())
    }

    init(canvasRootName: string) {
        this.canvasRootName = canvasRootName;
        this.interactableResize = interact(`.${this.canvasRootName} .canvas-item-resizable.active`)
        .resizable(this.getResizableConfig())

        this.interactableDraggable = interact(`.${this.canvasRootName} .canvas-item-draggable.active`)
        .actionChecker((_: any, event: any, action: any) => {
            if (
                event.target.closest('.drag-disabled')
            ) {
                return null;
            } else return action;
        })
        .draggable({
            inertia: false,
            listeners: {
                start: (event: any) => {
                    const target = event.target as HTMLElement;
                    const id = target.getAttribute('data-id');

                    this.onDragStart();
                    this.setPresentationScale(target);

                    if (id) {
                        const item = this.items.find(it => it.id === id);

                        if (item) {
                            // this.currentTarget = target;
                            this.currentTargetId = id;
                            
                            // const {width, height} = item;

                            // this.currentTargetWidth = width;
                            // this.currentTargetHeight = height;
                            // this.currentTargetHalfWidth = width / 2;
                            // this.currentTargetHalfHeight = height / 2;
                        }
                    }
                },
                move: (event: any) => {
                    this.onDragMove(event);
                    // TODO: ENABLE WHEN SNAPPING WORKS
                    // const dragInfo = this.onDragMove(event);

                    // const {x, y, index} = event.modifiers[0].target;
                    // const snapItem = this.snapItems[index];

                    // this.onSnap({
                    //     x,
                    //     y,
                    //     snapItem,
                    //     targetX: dragInfo.x,
                    //     targetY: dragInfo.y,
                    //     targetWidth: this.currentTargetWidth,
                    //     targetHeight: this.currentTargetHeight
                    // })
                    
                },
                end: (event: Interactable) => {
                    this.onDragEnd();
                    this.syncItems(this.items);
                    this.onDimensionChange(event.target as HTMLElement);
                }
            }
        })

        // this.interactableRotate = interact('.rotate-handle')
        // .draggable({
        //     listeners: {
        //         start: this.onDragRotateStart.bind(this),
        //         move: this.onDragRotateMove.bind(this),
        //         end: (event) => {
        //             this.onDragRotateEnd(event);
        //             this.onDimensionChange(event.target as HTMLElement);
        //         }
        //     }
        // })
    }

    updateCanvasRootRect() {
        const element = document.querySelector(`.${this.canvasRootName}`) as HTMLElement;

        this.canvasRootRect = new DOMRect(
            element?.offsetLeft,
            element?.offsetTop,
            element?.offsetWidth,
            element?.offsetHeight
        )
    }

    syncItems(items: Item[]) {
        this.items = items.map(item => {
            const itemElement = document.querySelector(`.canvas-item-${item.itemId}`) as HTMLElement;

            if (itemElement) {
                return {
                    ...item,
                    x: itemElement.offsetLeft,
                    y: itemElement.offsetTop,
                    left: itemElement.offsetLeft,
                    top: itemElement.offsetTop,
                    bottom: itemElement.offsetTop + itemElement.offsetHeight,
                    right: itemElement.offsetLeft + itemElement.offsetWidth
                }
            } else {
                return {
                    ...item,
                    left: 0,
                    top: 0,
                    bottom: 0,
                    right: 0
                }
            }
        });

        this.snapItems = this.getSnapItems();

        if (this.interactableDraggable) {
            this.interactableDraggable.options.drag.modifiers = [
                interact.modifiers.snap({
                    targets: this.getSnapTargets(),
                    relativePoints: [
                        {
                            x: 0,
                            y: 0
                        },
                        {
                            x: 0.5,
                            y: 0.5
                        },
                        {
                            x: 1,
                            y: 1
                        },
                    ],
                    offset: 'parent'
                })
            ]
        }
    }

    private setPresentationScale(currentTarget: HTMLElement) {
        if (!this.presentationSlidesElement) {
            this.presentationSlidesElement = currentTarget.closest('.reveal') as HTMLElement;
        }

        if (this.presentationSlidesElement) {
            this.presentationScale = +this.presentationSlidesElement.style.getPropertyValue('--slide-scale');
        }
    }

    private getSnapItems(): SnapItem[] {
        this.updateCanvasRootRect();

        const snapItems: SnapItem[] = [];

        const rootLeft = this.canvasRootRect?.left ?? 0;
        const rootRight = this.canvasRootRect?.right ?? 0;
        const rootTop = this.canvasRootRect?.top ?? 0;
        // const rootX = this.canvasRootRect?.x ?? 0;
        // const rootY = this.canvasRootRect?.y ?? 0;
        const rootBottom = this.canvasRootRect?.bottom ?? 0;
        const rootWidth = this.canvasRootRect?.width ?? 0;
        const rootHeight = this.canvasRootRect?.height ?? 0;

        /** Canvas Root */
        snapItems.push({
            type: 'root',
            axis: 'x',
            x: rootLeft,
            y: 0,
            range: AXIS_RANGE,
            width: rootWidth,
            height: rootHeight
        })

        snapItems.push({
            type: 'root',
            axis: 'x',
            x: rootRight - 4,
            y: 0,
            range: AXIS_RANGE,
            width: rootWidth,
            height: rootHeight
        })

        snapItems.push({
            type: 'root',
            axis: 'y',
            x: 0,
            y: rootTop,
            range: AXIS_RANGE,
            width: rootWidth,
            height: rootHeight
        })

        snapItems.push({
            type: 'root',
            axis: 'y',
            x: 0,
            y: rootBottom - 4,
            range: AXIS_RANGE,
            width: rootWidth,
            height: rootHeight
        })

        snapItems.push({
            type: 'root',
            axis: 'xy',
            x: rootLeft,
            y: rootTop,
            range: AXIS_RANGE * 2,
            width: rootWidth,
            height: rootHeight
        })

        snapItems.push({
            type: 'root',
            axis: 'xy',
            x: rootRight - 4,
            y: rootTop,
            range: AXIS_RANGE * 2,
            width: rootWidth,
            height: rootHeight
        })

        snapItems.push({
            type: 'root',
            axis: 'xy',
            x: rootLeft,
            y: rootBottom - 4,
            range: AXIS_RANGE * 2,
            width: rootWidth,
            height: rootHeight
        })

        snapItems.push({
            type: 'root',
            axis: 'xy',
            x: rootRight - 4,
            y: rootTop,
            range: AXIS_RANGE * 2,
            width: rootWidth,
            height: rootHeight
        })

        snapItems.push({
            type: 'root',
            axis: 'xy',
            x: rootRight - 4,
            y: rootBottom - 4,
            range: AXIS_RANGE * 2,
            width: rootWidth,
            height: rootHeight
        })

        /** Items */
        this.items.forEach(item => {
            snapItems.push({
                type: 'item',
                axis: 'x',
                id: item.itemId,
                x: item.left,
                y: item.top,
                range: AXIS_RANGE * 1.5,
                width: item.width,
                height: item.height
            })

            snapItems.push({
                type: 'item',
                axis: 'x',
                id: item.itemId,
                x: item.right,
                y: item.top,
                range: AXIS_RANGE * 1.5,
                width: item.width,
                height: item.height
            })

            snapItems.push({
                type: 'item',
                axis: 'y',
                id: item.itemId,
                y: item.top,
                x: item.left,
                range: AXIS_RANGE,
                width: item.width,
                height: item.height
            })

            snapItems.push({
                type: 'item',
                axis: 'y',
                id: item.itemId,
                y: item.bottom,
                x: item.left,
                range: AXIS_RANGE,
                width: item.width,
                height: item.height
            })

            snapItems.push({
                type: 'item',
                axis: 'xy',
                id: item.itemId,
                x: item.left,
                y: item.top,
                range: AXIS_RANGE * 2,
                width: item.width,
                height: item.height
            })

            snapItems.push({
                type: 'item',
                axis: 'xy',
                id: item.itemId,
                x: item.right,
                y: item.top,
                range: AXIS_RANGE * 2,
                width: item.width,
                height: item.height
            })

            snapItems.push({
                type: 'item',
                axis: 'xy',
                id: item.itemId,
                x: item.left,
                y: item.bottom,
                range: AXIS_RANGE * 2,
                width: item.width,
                height: item.height
            })

            snapItems.push({
                type: 'item',
                axis: 'xy',
                id: item.itemId,
                x: item.right,
                y: item.bottom,
                range: AXIS_RANGE * 2,
                width: item.width,
                height: item.height
            })
        })

        // return snapItems;
        return [];
    }

    private getSnapTargets(): SnapTarget[] {
        return this.snapItems.map((_, index) => {
            return () => {
                const snapItem = this.snapItems[index] as SnapItem;

                if (snapItem) {
                    if (snapItem.type === 'item') {
                        if (this.currentTargetId && this.currentTargetId === snapItem.id) {
                            return;
                        }
                    }

                    if (snapItem.axis === 'x') {
                        return {
                            x: snapItem.x,
                            range: snapItem.range
                        }
                    }

                    if (snapItem.axis === 'y') {
                        return {
                            y: snapItem.y,
                            range: snapItem.range
                        }
                    }

                    if (snapItem.axis === 'xy') {
                        return {
                            x: snapItem.x,
                            y: snapItem.y,
                            range: snapItem.range
                        }
                    }
                }
            }
        }) as SnapTarget[];
    }

    private getResizableConfig() {
        return {
            edges: {
                left: '.rl',
                right: '.rr',
                bottom: '.rb',
                top: '.rt'
            },
            modifiers: [
                this.aspectRatioModifier,
                interact.modifiers.restrictSize({
                    min: { width: 20, height: 20 }
                })

            ],
            listeners: {
                start: this.onResizeStart.bind(this),
                move: this.onResizeMove.bind(this),
                end: this.onResizeEnd.bind(this)
            }
        }
    }

    private onResizeEnd(event: any) {
        this.onEnd();
        this.onDimensionChange(event.target as HTMLElement);
    }

    private onResizeStart(event: any) {
        const target = event.target as HTMLElement;
        const id = target.getAttribute('data-id');

        this.onStart();
        this.setPresentationScale(target);

        if (id) {
            // this.currentTargetWidth = Number(target.getAttribute('data-width'));
            // this.currentTargetHeight = Number(target.getAttribute('data-height'));
            const enablePreserveAspectRatio = target.getAttribute('data-preserveratio') && target.getAttribute('data-preserveratio') === 'true';

            enablePreserveAspectRatio ? this.aspectRatioModifier.enable() : this.aspectRatioModifier.disable();
        }
    }

    private onResizeMove(event: any) {
        const target = event.target as HTMLElement;
        const hasAutoHeight = target.getAttribute('data-autoheight') && target.getAttribute('data-autoheight') === 'true';

        const currentX = (parseFloat(target.getAttribute('data-x') as string) || 0);
        const currentY = (parseFloat(target.getAttribute('data-y') as string) || 0);
        // const currentAngle = parseFloat(target.getAttribute('data-rotate') as string) || 0;
        const newX = currentX + (event.deltaRect.left / this.presentationScale);
        const newY = currentY + (event.deltaRect.top / this.presentationScale);

        // const matrix = getRotationMatrix(currentAngle);

        // const calculatedLeftTop = calcNewPos(
        //     newX,
        //     newY,
        //     this.currentTargetWidth,
        //     this.currentTargetHeight,
        //     event.rect.width,
        //     event.rect.height,
        //     currentAngle
        // )

        target.style.width = (event.rect.width / this.presentationScale) + 'px'

        if (!hasAutoHeight) {
            target.style.height = (event.rect.height / this.presentationScale) + 'px';
        }

        updateItemPositionStyle(target, newX, newY);
    }

    private onDragMove(event: any) {
        const target = event.target as HTMLElement;

        let x = (parseFloat(target.getAttribute('data-x') as string) || 0);
        let y = (parseFloat(target.getAttribute('data-y') as string) || 0);
        // const matrix = getRotationMatrix(
        //     parseFloat(target.getAttribute('data-rotate') as string) || 0
        // );

        x += (event.dx / this.presentationScale);
        y += (event.dy / this.presentationScale);

        updateItemPositionStyle(target, x, y);

        return {
            x,
            y
        }
    }

    // private onDragRotateStart(event: any) {
    //     const target = event.target as HTMLElement;
    //     const id = target.getAttribute('data-itemid');
    //     const canvasItem = document.querySelector(`div[data-id="${id}"]`) as HTMLElement;

    //     if (canvasItem) {
    //         const {left, top, width, height} = canvasItem.getBoundingClientRect();
            
    //         canvasItem.setAttribute('data-center-x', `${left + width / 2}`);
    //         canvasItem.setAttribute('data-center-y', `${top + height / 2}`);
    //         canvasItem.setAttribute('data-rotate', `${this.getDragAngle(canvasItem, event.clientY, event.clientX)}`)
    //     }
    // }

    // private onDragRotateMove(event: any) {
    //     const target = event.target as HTMLElement;
    //     const id = target.getAttribute('data-itemid');
    //     const canvasItem = document.querySelector(`div[data-id="${id}"]`) as HTMLElement;
    //     if (canvasItem) {
    //         const angle = this.getDragAngle(canvasItem, event.clientY, event.clientX);
    //         const matrix = getRotationMatrix(angle);

    //         const x = canvasItem.getAttribute('data-x');
    //         const y = canvasItem.getAttribute('data-y');
    //         canvasItem.style.transform = `translate(${x}px, ${y}px) matrix(${matrix})`
    //     }
    // }

    // private onDragRotateEnd(event: any) {
    //     const target = event.target as HTMLElement;
    //     const id = target.getAttribute('data-itemid');
    //     const canvasItem = document.querySelector(`div[data-id="${id}"]`) as HTMLElement;

    //     if (canvasItem) {
    //         canvasItem.setAttribute('data-rotate', `${this.getDragAngle(canvasItem, event.clientY, event.clientX)}`)
    //     }
    // }

    // private getDragAngle(element: HTMLElement, clientY: number, clientX: number) {
    //     const startAngle = parseFloat(element.getAttribute('data-rotate') ?? '');
    //     const x = parseFloat(element.getAttribute('data-center-x') ?? '');
    //     const y = parseFloat(element.getAttribute('data-center-y') ?? '');
    
    //     const angle = Math.atan2(y - clientY, x - clientX);
    
    //     return angle - startAngle;
    // }
}