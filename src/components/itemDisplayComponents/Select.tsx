import { TenumDescr } from "../../system/sdds/types";
import { TCommonProps } from "./CommonProps"
import useFocusHtmlElement from "../../hooks/useFocusHtmlElement";

function Select({item, editing, onFinishEdit, onEditStarted, onCancelEdit}: TCommonProps) {
    const options = (item as TenumDescr).enums;
    const ref = useFocusHtmlElement<HTMLSelectElement>(editing)

    return (
        <div>
            <select 
                value={item.toString()}
                className={"editField selectField"}
                onFocus={onEditStarted}
                onKeyDown={e=>{if (e.key === "Escape") onCancelEdit()}}
                onChange={e=>onFinishEdit(e.currentTarget.value)}
                ref={ref}
            >
                {options.map((option, idx) => {
                    return (
                        <option key={idx}>
                            {option}
                        </option>
                    );
                })}

            </select>
        </div>
    )
}

export default Select