"use server";

import { db } from "@/app/firebase/config";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getErrorMessage } from "../utils";
import { v4 as uuidv4 } from "uuid";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/app/firebase/config";

export async function deleteExhibitor(id: string) {
  try {
    await deleteDoc(doc(db, "exhibitors", id));
    return { success: true };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

type ExhibitorStatus = "active" | "draft";
export async function updateExhibitor(
  id: string,
  formData: FormData
): Promise<void> {
  const data = Object.fromEntries(formData);

  // Prepare update object
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: Record<string, any> = {};

  if (data.name) updateData.name = data.name;
  if (data.description) updateData.description = data.description;
  if (data.status) updateData.status = data.status as ExhibitorStatus;

  // Handle logo upload if it's a File
  if (data.logo instanceof File) {
    const uniqueFileName = `${uuidv4()}-${data.logo.name}`;
    const storageRef = ref(storage, `img/exhibitors/${uniqueFileName}`);
    await uploadBytes(storageRef, data.logo as Blob);
    updateData.logo = await getDownloadURL(storageRef);
  } else if (data.logo) {
    updateData.logo = data.logo;
  }

  if (data.yearsAtEvent) {
    try {
      updateData.yearsAtEvent = JSON.parse(data.yearsAtEvent as string).map(
        Number
      );
    } catch {
      updateData.yearsAtEvent = [];
    }
  }

  if (Object.keys(updateData).length > 0) {
    await updateDoc(doc(db, "exhibitors", id), {
      ...updateData,
    });
  }

  revalidatePath("/dashboard/exhibitors");
  redirect("/dashboard/exhibitors");
}

export async function createExhibitor(formData: FormData): Promise<void> {
  const data = Object.fromEntries(formData);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const newExhibitor: Record<string, any> = {};

  if (data.name) newExhibitor.name = data.name;
  if (data.description) newExhibitor.description = data.description;
  if (data.status) newExhibitor.status = data.status as ExhibitorStatus;

  // Only handle logo as a URL string
  if (data.logo) {
    newExhibitor.logo = data.logo;
  }

  if (data.yearsAtEvent) {
    try {
      newExhibitor.yearsAtEvent = JSON.parse(data.yearsAtEvent as string).map(
        Number
      );
    } catch {
      newExhibitor.yearsAtEvent = [];
    }
  }

  await addDoc(collection(db, "exhibitors"), newExhibitor);

  revalidatePath("/dashboard/exhibitors");
  redirect("/dashboard/exhibitors");
}
