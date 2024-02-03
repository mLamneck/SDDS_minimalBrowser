import { Tdescr } from "../../system/sdds/types";

export type TCommonProps = {
    item : Tdescr
    editing : boolean

    onStartEdit: () => void,
    onEditStarted: () => void,
    onFinishEdit: (value : any) => void,
    onCancelEdit: () => void,
    onEditDone: () => void,
    setValue: (value : any) => void
}