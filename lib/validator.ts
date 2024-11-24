import { z } from "zod"

export const EventformSchema = z.object({
    title: z.string().min(4, "Title must be at least 4 characters."),
    description: z.string().min(4, "description must be at least 4 characters.").max(400, 'Description must be less than 400 characters'),
    locaiton: z.string().min(4, "Location must be at least 4 characters.").max(400, 'Location must be less than 400 characters'),
    imageUrl: z.string(),
    startDateTime: z.date(),
    endDateTime: z.date(),
    categoryId: z.string(),
    price: z.string(),
    isFree: z.boolean(),
    url: z.string().url()
    
  })


