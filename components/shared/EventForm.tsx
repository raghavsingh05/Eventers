'use client'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { EventformSchema } from "@/lib/validator"
import { z } from "zod"
import { eventDefaultValues } from "@/constants"
import Dropdown from "./Dropdown"
import { Textarea } from "@/components/ui/textarea"
import FileUploader from "./FileUploader"
import { useState } from "react"
import Image from "next/image"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css";
import { Checkbox } from "@/components/ui/checkbox"
import {useUploadThing} from '@/lib/uploadthing'
import CreateEvent from "@/app/(root)/events/create/page"
import { useRouter } from "next/navigation"
import { createEvent, updateEvent } from "@/lib/actions/event.actions"
import { IEvent } from "@/lib/database/models/event.model"

type EventFormProps = {
    userId: string
    type: "Create" | "Update"
    event?:IEvent
    eventId?: string
}

const EventForm = ({ userId, type, event, eventId }: EventFormProps) => {
    const [files, setFiles] = useState<File[]>([])
    const initialValues = event && type === 'Update'?{
        ...event,
        startDateTime:new Date(event.startDateTime),
        endDateTime:new Date(event.endDateTime)
    }
    : eventDefaultValues;
    const router = useRouter()
    const { startUpload } = useUploadThing('imageUploader')
    const form = useForm<z.infer<typeof EventformSchema>>({
        resolver: zodResolver(EventformSchema),
        defaultValues: initialValues
    })

    async function onSubmit(values: z.infer<typeof EventformSchema>) {
        let uploadedImageUrl = values.imageUrl;

        if(files.length>0){
            const uploadedImages = await startUpload(files)
            if(!uploadedImages){
                return
            }
            uploadedImageUrl = uploadedImages[0].url;
        }
        if(type==='Create'){
            try {
                const newEvent = await createEvent({
                    event:{...values, imageUrl:uploadedImageUrl},
                    userId,
                    path:'/profile'
                })
                if(newEvent){
                    form.reset();
                    router.push(`/events/${newEvent._id}`)
                }
            } catch (error) {
                console.log(error)
            }
        }
        if(type==='Update'){
            if(!eventId){
                router.back()
                return;
            }
            if(files.length>0){
                const uploadedImages = await startUpload(files)
                if(!uploadedImages){
                    return
                }
                uploadedImageUrl = uploadedImages[0].url;
            }
            try {
                const updatedEvent = await updateEvent({
                    event:{...values, imageUrl:uploadedImageUrl, _id:eventId},
                    userId,
                    path:`/event/${eventId}`
                })
                if(updatedEvent){
                    form.reset();
                    router.push(`/events/${updatedEvent._id}`)
                }
            } catch (error) {
                console.log(error)
            }
        }
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
                <div className="flex flex-col gap-5 md:flex-row">
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormControl className="h-72">
                                    <Textarea placeholder="Description" {...field} className="textarea rounded-2xl" />
                                </FormControl >
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="imageUrl"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormControl className="h-72">
                                    <FileUploader onFieldChange={field.onChange} imageUrl={field.value} setFiles={setFiles} />
                                </FormControl >
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="flex flex-col gap-5  md:flex-row ">
                    <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormControl>
                                    <div className="flex-center h-[55px] w-full overflow-hidden rounded-full bg-grey-50 px-4 py-2">
                                        <Image src="/assets/icons/location-grey.svg" alt="location" width={24} height={24} />
                                        <Input placeholder="Event location or online" {...field} className="input-field" />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="flex flex-col gap-5  md:flex-row ">
                    <FormField
                        control={form.control}
                        name="startDateTime"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormControl>
                                    <div className="flex-center h-[55px] w-full overflow-hidden rounded-full bg-grey-50 px-4 py-2">
                                        <Image src="/assets/icons/calendar.svg" alt="calender" width={24} height={24} className="filter-grey" />
                                        <p className="ml-3 whitespace-nowrap text-grey-600">Start Date</p>
                                        <DatePicker
                                            selected={field.value} onChange={(date: Date | null, event?: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement> | undefined) => field.onChange(date)}
                                            showTimeSelect
                                            timeInputLabel="Time:"
                                            dateFormat="MM/dd/yyyy h:mm aa"
                                            wrapperClassName="datePicker"
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="endDateTime"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormControl>
                                    <div className="flex-center h-[55px] w-full overflow-hidden rounded-full bg-grey-50 px-4 py-2">
                                        <Image src="/assets/icons/calendar.svg" alt="calender" width={24} height={24} className="filter-grey" />
                                        <p className="ml-3 whitespace-nowrap text-grey-600">End Date</p>
                                        <DatePicker
                                            selected={field.value} onChange={(date: Date | null, event?: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement> | undefined) => field.onChange(date)}
                                            showTimeSelect
                                            timeInputLabel="Time:"
                                            dateFormat="MM/dd/yyyy h:mm aa"
                                            wrapperClassName="datePicker"
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="flex flex-col gap-5 md:flex-row">
                    <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormControl>
                                    <div className="flex-center h-[55px] w-full overflow-hidden rounded-full bg-grey-50 px-4 py-2">
                                        <Image src="/assets/icons/dollar.svg" alt="INR" width={24} height={24} className="filter-grey" />
                                        <Input type="number" placeholder="Price" {...field} className="p-regular-16 border-0 bg-grey-50 outline-offset-0 focus:border-0 focus-visible:ring-0 focus-visible:ring-offset-0" />
                                        <FormField
                                            control={form.control}
                                            name="isFree"
                                            render={({ field }) => (
                                                <FormItem className="w-full">
                                                    <FormControl>
                                                        <div className="flex items-center">
                                                            <label htmlFor="isFree" className="whitespace-nowrap pr-3 pl-3 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Free Ticket </label>
                                                            <Checkbox onCheckedChange={field.onChange} checked={field.value} id="isFree" className="mr-2 h-5 w-5 border-2 border-primary-500" />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="url"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormControl>
                                    <div className="flex-center h-[55px] w-full overflow-hidden rounded-full bg-grey-50 px-4 py-2">
                                        <Image src="/assets/icons/link.svg" alt="link" width={24} height={24} />
                                        <Input placeholder="URL" {...field} className="input-field" />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                </div>
                <Button type="submit" size="lg" disabled={form.formState.isSubmitting} className=" button col-span-2 w-full">{form.formState.isSubmitting ? (
                    'Submitting...'
                ) : `${type} Event `} </Button>
            </form>
        </Form>
    )
}

export default EventForm
