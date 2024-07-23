import { isObject, Dictionary } from '@/scripts/utils'
import './ParamsTableWithExpandle.css'

type Props = {
    params: Dictionary<string> | undefined
}

export function ParamsTableWithExpandle(props: Props) {

    const parameters = props.params ? Object.entries(props.params)?.map(([key, value], index) => {
        return <tr key={index}>
            <td className='param_name'>{key}</td>
            <td className='param_text'>{getDisplayValue(key, value)}</td>
        </tr>
    }) : undefined

    function getDisplayValue(key: string, value: any) {
        if (isObject(value)) {
            if (value.hasOwnProperty('display_value')) {
                return value.display_value
            }
            else
                return key
        }
        else
            return value
    }

    return (
        <table className='parameters_table'>
            <colgroup>
                <col className='param_name_col' />
                <col className='param_value_col' />
            </colgroup>
            <tbody>
                {parameters}
            </tbody>
        </table>
    )
}