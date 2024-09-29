import { StylesConfig } from "react-select";

export function SelectStyle<T>() {
    const mySelectStyle: StylesConfig<T> = {
        control: (styles, { isFocused }) => {
            return {
                ...styles,
                borderRadius: '8px',
                borderWidth: '1px',
                borderColor: 'gray',
                minHeight: '40px',
                boxShadow: isFocused ? '0 0 0 1px gray' : '',
                backgroundColor: 'var(--button-color-light)',

                ':hover': {
                    ...styles[':hover'],
                    borderColor: 'gray'
                },
                ':active': {
                    ...styles[':active'],
                    borderColor: 'gray',
                },
                '::selection': {

                }
            }
        },
        singleValue: (styles, { }) => {
            return {
                ...styles,
                color: 'lightgray'
            }
        },
        option: (styles, { data, isDisabled, isFocused, isSelected }) => {
            //const color = chroma(data.color);
            return {
                ...styles,
                backgroundColor: undefined,
                color: 'lightgray',
                borderBottom: '2px solid var(--button-color-light-hover)',

                ':active': {
                    ...styles[':active'],
                    backgroundColor: undefined,

                },
                ':hover': {
                    ...styles[':hover'],
                    backgroundColor: undefined,
                    color: 'white'
                },
                ':last-of-type': {
                    ...styles[':last-of-type'],
                    borderWidth: 0
                }
            };
        },
        menu: (styles, { }) => {
            return {
                ...styles,
                backgroundColor: 'var(--button-color-light)'
            }
        },
        menuList: (styles, { }) => {
            return {
                ...styles,
                paddingTop: 0,
                paddingBottom: 0,
            }
        },
        indicatorSeparator: (styles, { }) => {
            return {
                display: 'none'
            }
        },
    };
    return mySelectStyle
}