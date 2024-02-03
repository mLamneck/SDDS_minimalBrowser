import { Tdescr } from "../../system/sdds/types";

export type TCommonProps = {
    item : Tdescr
    editing : boolean

    onStartEdit: () => void,
    onFinishEdit: (value : any) => void,
    onCancelEdit: () => void,
    setValue: (value : any) => void
}