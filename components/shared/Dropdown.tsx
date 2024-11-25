import React, { useState } from 'react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { ICategory } from '@/lib/database/models/category.model'


type DropdownProps = {
    value?: string
    onChangeHandler?: () => void
}

const Dropdown = ({ value, onChangeHandler }: DropdownProps) => {
    const [categories, useCategories] = useState<ICategory[]>([])
    return (
        <Select>
            <SelectTrigger className="select-field">
                <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
                {categories.length > 0 && categories.map((category) =>(
                    <SelectItem key={category._id} value='category._id' className='select.item p-regular-14'>
                        {category.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}

export default Dropdown
