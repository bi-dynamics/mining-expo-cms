import { db } from "@/app/firebase/config";
import {
  collection,
  doc,
  DocumentSnapshot,
  endAt,
  endBefore,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  startAt,
} from "firebase/firestore";
import { ExhibitorType } from "./definitions";

let lastDocumentSnapshot: DocumentSnapshot | null = null; //stores the last document fetched from previous query
let firstDocumentSnapshot: DocumentSnapshot | null = null; //stores the first document of the current page

export async function getExhibitors(
  nextPage: boolean = false,
  prevPage: boolean = false
): Promise<ExhibitorType[]> {
  const ref = collection(db, "exhibitors");
  let q = query(ref, orderBy("name"), limit(5));

  if (nextPage && lastDocumentSnapshot) {
    // If it's the next page, start after the last document of the previous page
    q = query(ref, orderBy("name"), startAfter(lastDocumentSnapshot), limit(5));
  }

  if (prevPage && firstDocumentSnapshot) {
    q = query(ref, orderBy("name"), endBefore(firstDocumentSnapshot), limit(5));
  }

  try {
    const querySnapshot = await getDocs(q);

    const exhibitors: ExhibitorType[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      exhibitors.push({
        id: doc.id,
        logo: data.logo,
        name: data.name,
        description: data.description,
        yearsAtEvent: data.yearsAtEvent || [],
        status: data.status || "draft",
      });
    });

    if (querySnapshot.docs.length > 0) {
      lastDocumentSnapshot = querySnapshot.docs[querySnapshot.docs.length - 1]; // Update lastDocumentSnapshot. Set it to the last doc of the snapshot
      firstDocumentSnapshot = querySnapshot.docs[0]; //update firstDocumentSnapshot to be the first doc in the snapshot
    } else {
      lastDocumentSnapshot = null; // No more documents
      firstDocumentSnapshot = null;
    }

    return exhibitors;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch exhibitors data");
  }
}

export async function getExhibitor(id: string) {
  try {
    const docRef = doc(db, "exhibitors", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as ExhibitorType;
    } else {
      return null;
    }
  } catch (error) {
    throw new Error("Failed to fetch exhibitor data");
  }
}

export async function searchExhibitorsByName(
  searchTerm: string
): Promise<ExhibitorType[]> {
  if (!searchTerm) return [];
  const ref = collection(db, "exhibitors");
  // Firestore prefix search: orderBy name, startAt searchTerm, endAt searchTerm + '\uf8ff'
  const q = query(
    ref,
    orderBy("name"),
    startAt(searchTerm),
    endAt(searchTerm + "\uf8ff"),
    limit(10)
  );
  try {
    const querySnapshot = await getDocs(q);
    const exhibitors: ExhibitorType[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      exhibitors.push({
        id: doc.id,
        logo: data.logo,
        name: data.name,
        description: data.description,
        yearsAtEvent: data.yearsAtEvent || [],
        status: data.status || "draft",
      });
    });
    return exhibitors;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to search exhibitors");
  }
}

export async function searchExhibitorsByYearsAtEvent(
  direction: "asc" | "desc"
): Promise<ExhibitorType[]> {
  const ref = collection(db, "exhibitors");
  const q = query(ref, orderBy("yearsAtEvent", direction), limit(10));
  try {
    const querySnapshot = await getDocs(q);
    const exhibitors: ExhibitorType[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      exhibitors.push({
        id: doc.id,
        logo: data.logo,
        name: data.name,
        description: data.description,
        yearsAtEvent: data.yearsAtEvent || [],
        status: data.status || "draft",
      });
    });
    return exhibitors;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to search exhibitors by yearsAtEvent");
  }
}
