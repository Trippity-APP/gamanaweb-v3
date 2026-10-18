import { z } from "zod";
import { nullish } from "@/lib/api/schemas/common";

const contactDetailsSchema = z
  .object({
    phone: nullish(z.union([z.string(), z.number()]).transform(String)),
    country_code: nullish(z.string()),
  })
  .passthrough();

export const userProfileSchema = z
  .object({
    id: nullish(z.string()),
    _id: nullish(z.string()),
    user_id: nullish(z.string()),
    first_name: nullish(z.string()),
    last_name: nullish(z.string()),
    email: nullish(z.string()),
    phone: nullish(z.union([z.string(), z.number()]).transform(String)),
    country_code: nullish(z.string()),
    contact_details: nullish(contactDetailsSchema),
    profile_pic: nullish(z.string()),
    profile_picture: nullish(z.string()),
    dob: nullish(z.string()),
    gender: nullish(z.string()),
  })
  .passthrough();

export type UserProfile = z.infer<typeof userProfileSchema>;

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryCode: string;
  profilePic: string | null;
}

export function toAuthUser(profile: UserProfile): AuthUser {
  return {
    id: profile.id ?? profile._id ?? profile.user_id ?? "",
    firstName: profile.first_name ?? "",
    lastName: profile.last_name ?? "",
    email: profile.email ?? "",
    phone: profile.contact_details?.phone ?? profile.phone ?? "",
    countryCode: profile.contact_details?.country_code ?? profile.country_code ?? "",
    profilePic: profile.profile_pic ?? profile.profile_picture ?? null,
  };
}
