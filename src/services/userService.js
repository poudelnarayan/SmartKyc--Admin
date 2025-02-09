import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { deleteObject, getDownloadURL, listAll, ref } from "firebase/storage";
import { db, storage } from "../lib/firebase";

// Cache for storing file URLs
const fileCache = new Map();

export const userService = {
  subscribeToUsers(callback) {
    const usersRef = collection(db, "users");
    return onSnapshot(usersRef, (snapshot) => {
      const users = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          ...data,
          uid: doc.id,
          // Store dates as ISO strings for consistency
          dob: data.dob?.toDate?.()
            ? data.dob.toDate().toISOString().split("T")[0]
            : data.dob,
          idIssueDate: data.idIssueDate?.toDate?.()
            ? data.idIssueDate.toDate().toISOString().split("T")[0]
            : data.idIssueDate,
          idExpiryDate: data.idExpiryDate?.toDate?.()
            ? data.idExpiryDate.toDate().toISOString().split("T")[0]
            : data.idExpiryDate,
        };
      });
      callback(users);
    });
  },

  subscribeToUser(uid, callback) {
    const userRef = doc(db, "users", uid);
    return onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        callback({
          ...data,
          uid: doc.id,
          // Store dates as ISO strings for consistency
          dob: data.dob?.toDate?.()
            ? data.dob.toDate().toISOString().split("T")[0]
            : data.dob,
          idIssueDate: data.idIssueDate?.toDate?.()
            ? data.idIssueDate.toDate().toISOString().split("T")[0]
            : data.idIssueDate,
          idExpiryDate: data.idExpiryDate?.toDate?.()
            ? data.idExpiryDate.toDate().toISOString().split("T")[0]
            : data.idExpiryDate,
        });
      }
    });
  },

  async updateUser(uid, data) {
    try {
      const userRef = doc(db, "users", uid);
      // Remove undefined values to prevent Firebase errors
      const cleanData = Object.entries(data).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          // Store dates as strings in YYYY-MM-DD format
          if (
            key === "dob" ||
            key === "idIssueDate" ||
            key === "idExpiryDate"
          ) {
            acc[key] = value; // Keep as string for Flutter compatibility
          } else {
            acc[key] = value;
          }
        }
        return acc;
      }, {});

      await updateDoc(userRef, cleanData);
    } catch (error) {
      console.error(`Error updating user ${uid}:`, error);
      throw error;
    }
  },

  async deleteUser(uid) {
    try {
      await deleteDoc(doc(db, "users", uid));

      const paths = ["documents", "liveliness", "selfies"];
      for (const path of paths) {
        const storageRef = ref(storage, `users/${uid}/${path}`);
        try {
          const files = await listAll(storageRef);
          await Promise.all(files.items.map((file) => deleteObject(file)));
        } catch (error) {
          console.warn(`No files found in ${path} for user ${uid}:`, error);
        }
      }

      // Clear cache for this user
      fileCache.delete(uid);
    } catch (error) {
      console.error(`Error deleting user ${uid}:`, error);
      throw error;
    }
  },

  async getUserFiles(uid, type) {
    try {
      // Check cache first
      const cacheKey = `${uid}-${type}`;
      if (fileCache.has(cacheKey)) {
        return fileCache.get(cacheKey);
      }

      const storageRef = ref(storage, `users/${uid}/${type}`);
      const files = await listAll(storageRef);
      const urls = await Promise.all(
        files.items.map((file) => getDownloadURL(file))
      );

      // Cache the results
      fileCache.set(cacheKey, urls);

      return urls;
    } catch (error) {
      console.error(`Error fetching ${type} files for user ${uid}:`, error);
      throw error;
    }
  },

  // Clear cache for testing or when needed
  clearCache() {
    fileCache.clear();
  },
};
