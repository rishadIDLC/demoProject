import PropTypes from 'prop-types'
import {getCountries, getCountryCallingCode} from 'react-phone-number-input'
import labels from 'react-phone-number-input/locale/en.json'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "./select";

const CountrySelect = ({defaultCountry, onCountryChange, ...rest}: { defaultCountry: string, onCountryChange: (val: string ) => void }) => {

 return  ( <Select
        onValueChange={onCountryChange}
        defaultValue={defaultCountry}
    >
        <SelectTrigger >
            <SelectValue placeholder="Select Country"/>
        </SelectTrigger>
        <SelectContent>
            {getCountries().map((country) => (
                <SelectItem key={country} value={country}> {labels[country]} +{getCountryCallingCode(country)}</SelectItem>
            ))}
        </SelectContent>
    </Select>)
}

export default CountrySelect

