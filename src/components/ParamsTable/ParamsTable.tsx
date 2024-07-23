import { Param } from '@/scripts/parsers/sdWebUIParamParser'
import './ParamsTable.css'

type Props = {
    params: Param[] | undefined
}

export function ParamsTable(props: Props) {

    const parameters = props.params?.map((param: Param, index: number) => {
        return <tr key={index}>
            <td className='param_name'>{param.key}</td>
            <td className='param_text'>{param.value}</td>
        </tr>
    })

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
