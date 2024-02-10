import { getScrollParent } from "./frontend.utils"

export class ScrollStateSaver {

    /** @internal */
    private element: HTMLElement

    /** @internal */
    private scrollParent: HTMLElement | null

    /** @internal */
    private startScroll: number = 0

    /** @internal */
    private pixelsVisible: number = 0

    constructor(element: HTMLElement) {
        this.element = element
        this.scrollParent = getScrollParent(element)
    }


    captureScrollState() {
        const scroll = this.scrollParent?.scrollTop ?? 0
        this.startScroll = scroll

        const elementEnd = this.getElementEnd()
        this.pixelsVisible = elementEnd - scroll
    }

    restoreState() {
        const elementStart = this.getElementStart()
        const scrollBelowElementStart = (this.startScroll - elementStart) > 0

        if (scrollBelowElementStart) {
            const elementEnd = this.getElementEnd()
            const scroll = elementEnd - this.pixelsVisible

            this.scrollParent?.scrollTo({ top: scroll })
        }
        else {
            this.scrollParent?.scrollTo({ top: this.startScroll })
        }
    }


    /** @internal */
    private getElementStart() {
        return this.element.offsetTop
    }

    /** @internal */
    private getElementEnd() {
        return this.getElementStart() + this.element.scrollHeight
    }
}