import { useEffect, useRef } from 'react'
import './MySelect.css'
import Select, { MultiValue, SingleValue } from 'react-select';
import { SelectStyle } from '@/styles/selectStyle';

type Props = {
    values: MyOptionTypeString[]
    defaultValue?: MyOptionTypeString
    onChange?: (newValue: string) => void
}

type MyOptionTypeString = {
    label: string;
    value: string;
};

const mySelectStyle = SelectStyle<MyOptionTypeString>()

export function MySelect(props: Props) {
    
    function onChange(newValue: any) {
        if (props.onChange)
            props.onChange(newValue.value)
    }

    return (
        <Select className='my_select' options={props.values} styles={mySelectStyle} defaultValue={props.defaultValue} onChange={onChange} isSearchable={false} />
    )
}
