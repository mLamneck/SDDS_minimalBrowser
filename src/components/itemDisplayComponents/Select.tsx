import { useEffect, useRef } from "preact/hooks";
import { TenumDescr } from "../../system/sdds/types";
import { TCommonProps } from "./CommonProps"

function Select({item, editing}: TCommonProps) {
    const options = (item as TenumDescr).enums;
    const ref = useRef<HTMLSelectElement>(null)
    useEffect(()=>{
        if (editing && ref.current){
            
        }
    },[editing])
    return (
        <div>
            <select 
                id="123"
                className={"editField selectField"}
                ref={ref}
            >
                {options.map((option, idx) => {
                    return (
                        <option key={idx} selected={item.idx===idx}>
                            {option}
                        </option>
                    );
                })}

            </select>
        </div>
    )
}

export default Select