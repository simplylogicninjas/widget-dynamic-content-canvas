import { Interactable, SnapTarget } from "@interactjs/types";
import interact from "interactjs";
import { Item } from "src/components/CanvasInteract";

const AXIS_RANGE = 6;
const CORNER_RANGE = 14;
const CORNER_EXCLUDE_AXIS = 8;
const AXIS_EXTRA_RANGE = -6;

export class InteractModule {
    interactable: Interactable | undefined = undefined;
    interactableRotate: Interactable | undefined = undefined;
    isInteracting = false;
    items: Item[] = [];
    currentElement: HTMLElement | undefined = undefined;
    offX1: number = 0;
    offX2: number = 0;
    offY1: number = 0;
    offY2: number = 0;
    snapTargets: SnapTarget[] = [];
    onDimensionChange: (target: HTMLElement) => void;

    constructor(
        onDimensionChange: (target: HTMLElement) => void
    ) {
        this.onDimensionChange = onDimensionChange;
    }

    init() {
        this.interactable = interact('.canvas-item-resizable')
        .resizable(this.getResizableConfig())
        .draggable({
            inertia: true,
            modifiers: [
                interact.modifiers.snap({
                    targets: (() => [...this.snapTargets])(),
                    relativePoints: [
                        { x: 0  , y: 0   }
                    ]
                })
            ],
            listeners: {
                start: (event) => {
                    const target = event.target as HTMLElement;

                    this.currentElement = target;

                    const pos = this.getPosition(target);

                    this.offX1 = event.clientX - pos.x;
                    this.offY1 = event.clientY - pos.y;
                    this.offX2 = event.clientX - this.currentElement.offsetWidth - pos.x;
                    this.offY2 = event.clientY - this.currentElement.offsetHeight - pos.y;
                },
                move: this.onDragMove.bind(this),
                end: (event: any) => {
                    this.isInteracting = false;
                    this.onDimensionChange(event.target as HTMLElement);
                }
            }
        })

        this.interactableRotate = interact('.rotate-handle')
        .draggable({
            listeners: {
                start: this.onDragRotateStart.bind(this),
                move: this.onDragRotateMove.bind(this),
                end: (event) => {
                    this.onDragRotateEnd(event);
                    this.onDimensionChange(event.target as HTMLElement);
                }
            }
        })
    }

    syncItems(items: Item[]) {
        this.items = [...items];
        
        this.getSnapTargets();

        if (this.interactable) {
            this.interactable.options.drag.modifiers = [
                interact.modifiers.snap({
                    targets: this.snapTargets
                })
            ]
        }
    }

    private getSnapTargets() {
        this.snapTargets = [];

        console.log(AXIS_EXTRA_RANGE, CORNER_RANGE, this.getSnapCoords);

        this.snapTargets.push(
            () => {
                return {
                    y: 100,
                    range: AXIS_RANGE
                }
            }
        )

        this.items.forEach(item => {
            const element = document.getElementById(`canvas-item-${item.id}`);

            if (element) {
                // Slide along the X axis
                // this.snapTargets.push(
                //     () => {
                //         return {
                //             x: item.x,
                //             y: item.y,
                //             range: AXIS_RANGE
                //         }
                //     }
                // )

                this.snapTargets.push(
                    () => {
                        return {
                            x: item.x,
                            range: AXIS_RANGE
                        }
                    }
                )

                this.snapTargets.push(
                    () => {
                        return {
                            y: item.y,
                            range: AXIS_RANGE
                        }
                    }
                )
                    /*
                    () => {
                    const data = this.getSnapCoords(element, "x");
                    if (data.isOK) {
                        return {
                        x: data.x,
                        range: AXIS_RANGE
                        };
                    }
                    });
                // Slide along the Y axis
                this.snapTargets.push(
                    () => {
                    const data = this.getSnapCoords(element, "y");
                    if (data.isOK) {
                        return {
                        y: data.y,
                        range: AXIS_RANGE
                        };
                    }
                    });
                // Snap to corner
                this.snapTargets.push(
                    () => {
                    const data = this.getSnapCoords(element);
                    if (data.isOK) {
                        return {
                        x: data.x,
                        y: data.y,
                        range: CORNER_RANGE
                        };
                    }
                    
                    })*/;
            }
        });
    }

    private getResizableConfig() {
        return {
            edges: {
                left: true,
                right: true,
                bottom: '.resize-bottom',
                top: '.resize-top',
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
            listeners: {
                start: () => this.isInteracting = true,
                    move: this.onResizeMove.bind(this),
                    end: (event: any) => {
                        // const target = event.target as HTMLElement;
                        this.isInteracting = false;
                        this.onDimensionChange(event.target as HTMLElement);
                    }
            }
        }
    }

    private onResizeMove(event: any) {
        const target = event.target as HTMLElement;
        const hasAutoHeight = target.getAttribute('data-autoheight');

        let x = (parseFloat(target.getAttribute('data-x') as string) || 0);
        let y = (parseFloat(target.getAttribute('data-y') as string) || 0);
        let angle = target.getAttribute('data-rotate');

        // update the element's style
        target.style.width = event.rect.width + 'px'

        if (!hasAutoHeight) {
            target.style.height = event.rect.height + 'px'
        }

        x += event.deltaRect.left;
        y += event.deltaRect.top;

        target.setAttribute('data-x', `${x}`);
        target.setAttribute('data-y', `${y}`);
        target.style.transform = 'translate(' + x + 'px, ' + y + 'px) rotate(' + angle + 'rad' + ')'
    }

    private onDragMove(event: any) {
        const target = event.target as HTMLElement;

        let x = (parseFloat(target.getAttribute('data-x') as string) || 0);
        let y = (parseFloat(target.getAttribute('data-y') as string) || 0);
        let angle = target.getAttribute('data-rotate');

        x += event.dx;
        y += event.dy;

        target.style.transform = 'translate(' + x + 'px, ' + y + 'px) rotate(' + angle + 'rad' + ')'
        target.setAttribute('data-x', `${x}`);
        target.setAttribute('data-y', `${y}`);
    }

    private onDragRotateStart(event: any) {
        const target = event.target as HTMLElement;
        const id = target.getAttribute('data-itemid');
        const canvasItem = document.querySelector(`div[data-id="${id}"]`) as HTMLElement;

        if (canvasItem) {
            const {left, top, width, height} = canvasItem.getBoundingClientRect();
            
            canvasItem.setAttribute('data-center-x', `${left + width / 2}`);
            canvasItem.setAttribute('data-center-y', `${top + height / 2}`);
            canvasItem.setAttribute('data-rotate', `${this.getDragAngle(canvasItem, event.clientY, event.clientX)}`)
            
        }
    }

    private onDragRotateMove(event: any) {
        const target = event.target as HTMLElement;
        const id = target.getAttribute('data-itemid');
        const canvasItem = document.querySelector(`div[data-id="${id}"]`) as HTMLElement;
        if (canvasItem) {
            const angle = this.getDragAngle(canvasItem, event.clientY, event.clientX);
            const x = canvasItem.getAttribute('data-x');
            const y = canvasItem.getAttribute('data-y');
            canvasItem.style.transform = 'translate(' + x + 'px, ' + y + 'px) rotate(' + angle + 'rad' + ')'
        }
    }

    private onDragRotateEnd(event: any) {
        const target = event.target as HTMLElement;
        const id = target.getAttribute('data-itemid');
        const canvasItem = document.querySelector(`div[data-id="${id}"]`) as HTMLElement;

        if (canvasItem) {
            canvasItem.setAttribute('data-rotate', `${this.getDragAngle(canvasItem, event.clientY, event.clientX)}`)
        }
    }

    private getDragAngle(element: HTMLElement, clientY: number, clientX: number) {
        const startAngle = parseFloat(element.getAttribute('data-rotate') ?? '');
        const x = parseFloat(element.getAttribute('data-center-x') ?? '');
        const y = parseFloat(element.getAttribute('data-center-y') ?? '');
    
        const angle = Math.atan2(y - clientY, x - clientX);
    
        return angle - startAngle;
    }

    private getPosition(element: HTMLElement): {x: number, y: number} {
        return {
          x: parseFloat(element.getAttribute('data-x') as string) || 0,
          y: parseFloat(element.getAttribute('data-y') as string) || 0
        };
      }
      
    private isBetween(value: number, min: number, length: number) {
        return min - AXIS_EXTRA_RANGE < value && value < (min + length) + AXIS_EXTRA_RANGE;
    }
    
    private getDistance(value1: number, value2: number) {
        return Math.abs(value1 - value2);
    }

    private getSnapCoords(element: HTMLElement, axis?: string) {
        const result: {
            isOK: boolean;
            offX: number;
            offY: number;
            x: number;
            y: number;
        } = {
          isOK: false,
          x: 0,
          y: 0,
          offX: 0,
          offY: 0
        };
        
        const currentElement = this.currentElement;

        if (currentElement && currentElement !== element) {
          const pos = this.getPosition(element);
          const cur = this. getPosition(currentElement);
          const distX1a = this.getDistance(pos.x, cur.x);
          const distX1b = this.getDistance(pos.x, cur.x + currentElement.offsetWidth);
          const distX2a = this.getDistance(pos.x + element.offsetWidth, cur.x);
          const distX2b = this.getDistance(pos.x + element.offsetWidth, cur.x + currentElement.offsetWidth);
          const distY1a = this.getDistance(pos.y, cur.y);
          const distY1b = this.getDistance(pos.y, cur.y + currentElement.offsetHeight);
          const distY2a = this.getDistance(pos.y + element.offsetHeight, cur.y);
          const distY2b = this.getDistance(pos.y + element.offsetHeight, cur.y + currentElement.offsetHeight);
          const distXa = Math.min(distX1a, distX2a);
          const distXb = Math.min(distX1b, distX2b);
          const distYa = Math.min(distY1a, distY2a);
          const distYb = Math.min(distY1b, distY2b);
          if (distXa < distXb) {
            result.offX = this.offX1;
          } else {
            result.offX = this.offX2
          }
          if (distYa < distYb) {
            result.offY = this.offY1;
          } else {
            result.offY = this.offY2
          }
          const distX1 = Math.min(distX1a, distX1b);
          const distX2 = Math.min(distX2a, distX2b);
          const distY1 = Math.min(distY1a, distY1b);
          const distY2 = Math.min(distY2a, distY2b);
          const distX = Math.min(distX1, distX2);
          const distY = Math.min(distY1, distY2);
          const dist = Math.max(distX, distY);
          const acceptAxis = dist > CORNER_EXCLUDE_AXIS;
      
          result.x = distX1 < distX2 ? pos.x : pos.x + element.offsetWidth;
          result.y = distY1 < distY2 ? pos.y : pos.y + element.offsetHeight;
      
          const inRangeX1 = this.isBetween(pos.x, cur.x, currentElement.offsetWidth);
          const inRangeX2 = this.isBetween(cur.x, pos.x, element.offsetWidth);
          const inRangeY1 = this.isBetween(pos.y, cur.y, currentElement.offsetHeight);
          const inRangeY2 = this.isBetween(cur.y, pos.y, element.offsetHeight);
      
          switch (axis) {
            case "x":
              result.isOK = acceptAxis && (inRangeY1 || inRangeY2);
              break;
            case "y":
              result.isOK = acceptAxis && (inRangeX1 || inRangeX2);
              break;
            default:
              result.isOK = true;
              break;
          }
        }
        return result;
      }
}