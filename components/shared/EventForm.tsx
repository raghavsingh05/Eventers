'use client'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { EventformSchema } from "@/lib/validator"
import { z } from "zod"
import { eventDefaultValues } from "@/constants"
import Dropdown from "./Dropdown"


type EventFormProps = {
    userId: string
    type: "Create" | "Update"
}

const EventForm = ({ userId, type }: EventFormProps) => {
    const initialValues = eventDefaultValues;
    const form = useForm<z.infer<typeof EventformSchema>>({
        resolver: zodResolver(EventformSchema),
        defaultValues: initialValues
    })

    function onSubmit(values: z.infer<typeof EventformSchema>) {
        console.log(values)
    }
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
                <div className=" flex flex-col gap-5 md:flex-row">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormControl>
                                    <Input placeholder="Event title" {...field} className="input-field" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="categoryId"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormControl>
                                    <Dropdown onChangeHandler={field.onChange} value={field.value} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <Button type="submit">Submit</Button>
            </form>
        </Form>
    )
}

export default EventForm
