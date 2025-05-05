import {Popover, PopoverContent, PopoverTrigger} from "./popover";
import {Button} from "./button";
import {cn} from "../../utils";
import {CalendarIcon} from "lucide-react";
import {format} from "date-fns";
import {Calendar} from "./calendar"; 
import {DateRange, SelectSingleEventHandler} from "react-day-picker";

const DatePicker = ({selected, onSelect, id,dateFormat,disabledDays}: {
    selected: Date | undefined,
    onSelect: SelectSingleEventHandler,
    disabledDays?: DateRange,
    id?: string,
    dateFormat: string ,
}) => {
    return <Popover>
        <PopoverTrigger asChild>
            <Button
                variant={"outline"}
                className={cn(
                    "w-[280px] justify-start text-left font-normal",
                    !selected && "text-muted-foreground"
                )}
            >
                <CalendarIcon className="mr-2 h-4 w-4"/>
                {selected ? format(selected, dateFormat) : <span>Pick a date</span>}
            </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
            <Calendar
                id={id}
                mode="single"
                selected={selected}
                onSelect={onSelect}
                initialFocus
                disabled={disabledDays}

            />
        </PopoverContent>
    </Popover>
}

export default DatePicker;