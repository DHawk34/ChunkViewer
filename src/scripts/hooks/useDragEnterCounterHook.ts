import { useState } from "react";

export type DragEnterCounter = {
    enterCount: number
    incrementDragEnterCount: () => void
    decrementDragEnterCount: () => void
    setDragEnterCount: (num: number) => void
}

export function useDragEnterCounter(): DragEnterCounter {
    const [enterCount, setEnterCount] = useState(0)

    function incr() {
        setEnterCount(enterCount => {
            addClass(enterCount + 1)
            console.log('add: ' + (enterCount + 1));
            return enterCount + 1
        });
    }
    function decr() {
        setEnterCount(enterCount => {
            removeClass(enterCount - 1)
            console.log('decr: ' + (enterCount - 1));
            return enterCount - 1
        });
    }

    function set(num: number) {
        setEnterCount(enterCount => {
            addClass(num)
            removeClass(num)
            console.log('set: ' + num);
            return num
        });
    }



    function addClass(enterCount: number) {
        if (enterCount == 1) {
            var dragObjs = document.getElementsByClassName('drop_object');

            for (let index = 0; index < dragObjs.length; index++) {
                dragObjs[index].classList.add('drag_start')
            }
        }
    }

    function removeClass(enterCount: number) {
        if (enterCount == 0) {
            var dragObjs = document.getElementsByClassName('drop_object');

            for (let index = 0; index < dragObjs.length; index++) {
                dragObjs[index].classList.remove('drag_start')
            }
        }
    }

    return { enterCount, incrementDragEnterCount: incr, decrementDragEnterCount: decr, setDragEnterCount: set }
}