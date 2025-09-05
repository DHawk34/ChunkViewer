import React, { createContext, ReactNode, useEffect, useRef, useState } from "react";

type ExpandableGroupProps = {
    children?: ReactNode
}

const ExpandContext = createContext<{ activeExpandable: string | undefined, changeActive: (newActive: string | undefined) => void } | undefined>(undefined);

function ExpandableGroup(props: ExpandableGroupProps) {
    const [activeExpandable, setActive] = useState<string | undefined>()

    function changeActive(newActive: string | undefined) {
        setActive(newActive)
    }

    return (
        <ExpandContext.Provider value={{ activeExpandable, changeActive }}>
            {props.children}
        </ExpandContext.Provider>
    )
}

function useExpandContext() {
    const context = React.useContext(ExpandContext)

    // if (context === undefined) {
    //     throw new Error('useExpandContext must be used within a ExpandContext.Provider')
    // }
    return context
}

export { ExpandableGroup, useExpandContext }