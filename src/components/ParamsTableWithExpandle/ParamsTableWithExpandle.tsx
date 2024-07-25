import { isObject, Dictionary, capitalizeFirstLetter } from '@/scripts/utils'
import { forwardRef, useEffect, useRef, useState } from 'react'
import Arrow from '@/assets/arrowDown_bold.svg?react'
import styles from './ParamsTableWithExpandle.module.css'

type Props = {
    params: Dictionary<string> | undefined
    id: string
    class?: string
    opened?: boolean
}

export function ParamsTableWithExpandle(props: Props) {

    const [tables, setTables] = useState<JSX.Element[]>([])

    useEffect(() => {
        createTables()
    }, [props.params])

    function toggleTable(ev: React.MouseEvent<SVGSVGElement, MouseEvent>, tableId: string) {
        ev.currentTarget.classList.toggle(styles.rotated)
        ev.currentTarget.parentElement?.parentElement?.classList.toggle(styles.table_opened)

        const table = document.getElementById(tableId)
        table?.classList.toggle(styles.hidden)
    }

    function decorateKey(key: string) {
        key = capitalizeFirstLetter(key)
        key = key.replaceAll('_', ' ')
        return key;
    }

    function createRow(key: string, value: string, tableId: string | undefined = undefined, dark: boolean = false) {
        return (<tr key={`${props.id}_${key}`} className={dark ? styles.dark_row : undefined}>
            <td className={styles.param_expand}>{tableId !== undefined && <Arrow className={`${styles.arrow} ${styles.rotated}`} height={15} width={15} onClick={(e) => toggleTable(e, tableId)} />}</td>
            <td className={styles.param_name}>{decorateKey(key)}</td>
            <td className={styles.param_text}>{value}</td>
        </tr>)
    }

    function createTable(key: string | number, params_row: JSX.Element[]) {
        return (<table key={`${props.id}_${key}`} className={styles.parameters_table}>
            <colgroup>
                <col className={styles.param_expand_col} />
                <col className={styles.param_name_col} />
                <col className={styles.param_value_col} />
            </colgroup>
            <tbody>
                {params_row}
            </tbody>
        </table>)
    }

    function createTables() {
        if (!props.params)
            return

        const tables: JSX.Element[] = []
        let params_row: JSX.Element[] = []

        const keys = Object.keys(props.params)

        for (let i = 0; i < keys.length; i++) {
            const key = keys[i]
            const value = props.params[keys[i]]

            if (!isObject(value)) {
                params_row.push(createRow(key, value, undefined, (i + 1) % 2 === 0))
            }
            else {
                if (value.hasOwnProperty('display_value') && value.hasOwnProperty('add_info')) {

                    const tableID = `${props.id}_${key}`

                    params_row.push(createRow(key, value.display_value, tableID, (i + 1) % 2 === 0))
                    tables.push(createTable(i, params_row))

                    tables.push(<ParamsTableWithExpandle class={styles.inner_table} key={tableID} id={tableID} params={value.add_info} />)

                    params_row = []

                }
                else {
                    params_row.push(createRow(key, key, undefined, (i + 1) % 2 === 0))
                }
            }
        }

        tables.push(createTable(`endTable`, params_row))
        setTables(tables)
    }


    return (
        <div key={props.id} id={props.id} className={`${!props.opened && styles.hidden} ${props.class}`}>
            {tables}
        </div>
    )
}