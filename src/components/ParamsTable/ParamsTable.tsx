import { Param } from '@/scripts/parsers/sdWebUIParamParser'
import styles from './ParamsTable.module.css'

type Props = {
    params: Param[] | undefined
}

export function ParamsTable(props: Props) {

    const parameters = props.params?.map((param: Param, index: number) => {
        return <tr key={index}>
            <td className={styles.param_name}>{param.key}</td>
            <td className={styles.param_text}>{param.value}</td>
        </tr>
    })

    return (
        <table className={styles.parameters_table}>
            <colgroup>
                <col className={styles.param_name_col} />
                <col className={styles.param_value_col} />
            </colgroup>
            <tbody>
                {parameters}
            </tbody>
        </table>
    )
}
