import { forwardRef, useState } from 'react'
import { DragDropContext, Draggable } from 'react-beautiful-dnd'
import { StrictModeDroppable } from '../StrictModeDroppable'
import { getDropEndFunc } from '@/scripts/utils'
import { useCloseDialog_clickHandler } from '@/scripts/frontend.utils'
import CloseBoldIcon from '@/assets/close_bold.svg?react'
import EditIcon from '@/assets/edit.svg?react'
import TrashIcon from '@/assets/trash.svg?react'
import DragIcon from '@/assets/drag.svg?react'
import './ChunkExtensionsList.css'

export const ChunkExtensionsList = forwardRef<HTMLDialogElement>((_, ref) => {
    const { mouseDown, mouseUp } = useCloseDialog_clickHandler()
    const [extensions, setExtensions] = useState(['hello ajhasdasdsdllasjkhdlkasjhdkjahslkjdhlaksjhdlkajshd askjhgdklasdasdjash lkdhalksj hdkljhsa lkdhlka shkljd ks', 'world', 'test'])

    function addExtension() {
        const arr = [...extensions, 'new']
        setExtensions(arr)
    }

    function editExtension(index: number) {
        // TODO: edit extension
    }

    function deleteExtension(index: number) {
        const arr = extensions.toSpliced(index, 1)
        setExtensions(arr)
    }

    function close_dialog() {
        const dialog = ref as React.RefObject<HTMLDialogElement>
        dialog?.current?.close()
    }



    const extensionNames = extensions.map((x, index) => {
        return <Draggable draggableId={index.toString()} index={index} key={index}>
            {(provided) =>
                <div className='extension_name' key={index} {...provided.draggableProps} ref={provided.innerRef}>
                    <div  {...provided.dragHandleProps} className='dragger'>
                        <DragIcon width="16" height="35" />
                    </div>

                    {index} {x}
                    <button className='edit_button'><EditIcon width={25} height={25} onClick={() => editExtension(index)} /></button>
                    <button className='delete_button'><TrashIcon width={25} height={25} onClick={() => deleteExtension(index)} /></button>
                </div>
            }
        </Draggable>
    })

    return (
        <DragDropContext onDragEnd={getDropEndFunc(extensions, setExtensions)}>
            <dialog id='chunkExtensionsListDialog' onMouseDown={mouseDown} onMouseUp={mouseUp} ref={ref}>

                <h2>Chunk extensions</h2>

                <StrictModeDroppable droppableId='extensionNames'>
                    {(provided) =>
                        <div className='extensionNames'
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                        >
                            {extensionNames}
                            {provided.placeholder}
                        </div>
                    }
                </StrictModeDroppable>

                <button onClick={addExtension} className='add_button'>Add</button>

                <button onClick={close_dialog} className='close_button'>
                    <CloseBoldIcon color="whitesmoke" />
                </button>
            </dialog>
        </DragDropContext>
    )
})