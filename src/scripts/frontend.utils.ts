import { useState } from "react";

/**
 * @param element HTML element that will have a height transition
 * @returns True if element's next state is 'opened' (height == auto)
 * @returns False if element's next state is 'closed' (height == 0)
 */
export function height_0auto_startTransition(element: HTMLElement): boolean {
    if (element.style.height === "0px") {
        element.style.height = `${element.scrollHeight}px`

        return true
    }
    else {
        element.style.height = `${element.scrollHeight}px`;
        window.getComputedStyle(element, null).getPropertyValue("height");
        element.style.height = "0px";

        return false
    }
}

/**
 * @param e element's 'onTransitionEnd' event
 * @returns True if element is now in 'opened' state (height == auto)
 * @returns False if element is now in 'closed' state (height == 0)
 */
export function height_0auto_endTransition(e: React.TransitionEvent<HTMLElement>): boolean {
    const block = e.currentTarget

    if (block.style.height !== '0px') {
        block.style.height = 'auto'

        return true
    }

    return false
}

export function getScrollParent(node: HTMLElement | null): HTMLElement | null {
    if (!node) return null

    const overflowY = window.getComputedStyle(node).overflowY
    const isScrollable = !(overflowY.includes('visible') || overflowY.includes('hidden'))

    if (isScrollable && node.scrollHeight > node.clientHeight)
        return node
    else
        return getScrollParent(node.parentElement)
}

export function getSelectionLength(window: Window): number {
    const selectedRange = window.getSelection()?.getRangeAt(0)
    const startSelection = selectedRange?.startOffset ?? 0
    const endSelection = selectedRange?.endOffset ?? 0

    return endSelection - startSelection
}



export function enableContentEditable(e: React.MouseEvent<HTMLElement>, mode: string = 'plaintext-only') {
    e.currentTarget.contentEditable = mode
    e.currentTarget.focus()

    const selection = window.getSelection()
    selection?.getRangeAt(0).collapse()
}



/**
 * @param action function that is called on mouseUp event. Takes as input start click position (captured on mouseDown)
 * @returns mouseDown & mouseUp events that have to be transfered to desired object
 */
export function useClickCapture<T>(action: (e: React.MouseEvent<T, MouseEvent>, clickStartX: number, clickStartY: number) => void) {
    const [clicking, setClicking] = useState(false)
    const [startX, setstartX] = useState(-1)
    const [startY, setstartY] = useState(-1)

    function mouseDown(e: React.MouseEvent<T, MouseEvent>) {
        setClicking(true)
        setstartX(e.clientX)
        setstartY(e.clientY)
    }

    function mouseUp(e: React.MouseEvent<T, MouseEvent>) {
        if (!clicking) return

        action(e, startX, startY)
        setClicking(false)
    }

    return { mouseDown, mouseUp }
}

/**
 * Closes dialog if provided click position is out of dialog bounds
 */
export function closeDialog_onOutOfBoundsClick(e: React.MouseEvent<HTMLDialogElement, MouseEvent>, startX: number, startY: number) {
    const dialog = e.currentTarget
    const rect = dialog.getBoundingClientRect()

    const startIsInDialog = (
        rect.top <= startY &&
        startY <= rect.top + rect.height &&
        rect.left <= startX &&
        startX <= rect.left + rect.width
    )

    const endIsInDialog = (
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width
    )

    if (!startIsInDialog && !endIsInDialog) {
        dialog.close()
    }
}

export function useCloseDialog_clickHandler() {
    return useClickCapture(closeDialog_onOutOfBoundsClick)
}
