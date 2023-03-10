import firebase from 'firebase/compat/app';
import { apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId, measurementId } from './config';
import { initializeApp } from 'firebase/app';
import 'firebase/compat/firestore';
import { doc, setDoc } from 'firebase/firestore';
import initialData from '../initial-data';
import {
    getFirestore,
    query,
    getDocs,
    collection,
    where,
    addDoc,
} from "firebase/firestore";
import {
    GoogleAuthProvider, getAuth, signInWithPopup, signInWithEmailAndPassword,
    createUserWithEmailAndPassword, sendPasswordResetEmail, signOut
} from "firebase/auth";

const firebaseConfig = {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
    measurementId,
};

const googleProvider = new GoogleAuthProvider();
const signInWithGoogle = async () => {
    try {
        const res = await signInWithPopup(auth, googleProvider);
        const user = res.user;
        const q = query(collection(db, "users"), where("uid", "==", user.uid));
        const docs = await getDocs(q);
        if (docs.docs.length === 0) {
            await addDoc(collection(db, "users"), {
                uid: user.uid,
                name: user.displayName,
                authProvider: "google",
                email: user.email,
            });
            await addInitialData();
        }
    } catch (err) {
        console.error(err);
        alert(err.message);
    }
};

async function checkInitialData() {
    const users = collection(db, "users");
    const userQuery = query(users, where("uid", "==", auth.currentUser.uid));
    const querySnapshot = await getDocs(userQuery);
    var docId = null;
    querySnapshot.forEach((doc) => {
        docId = doc.id;
    });
    try {
        const columnTest = await getDocs(collection(db, "users", docId, "columns"));
    } catch {
        await addInitialData();
    }
}

async function addInitialData() {
    const users = collection(db, "users");
    const userQuery = query(users, where("uid", "==", auth.currentUser.uid));
    const querySnapshot = await getDocs(userQuery);
    var docId = null;
    querySnapshot.forEach((doc) => {
        docId = doc.id;
    });
    const tasks = initialData.tasks;
    const columns = initialData.columns;
    // const columnTest = await getDocs(collection(db, "users", docId, "columns"));
    // if (columnTest.length == 0) {
    //     return;
    // }
    for (const element in tasks) {
        const task = tasks[element];
        await setDoc(doc(db, "users", docId, "tasks", task.id), {
            task
        })
    };
    for (const element in columns) {
        const column = columns[element];
        await setDoc(doc(db, "users", docId, "columns", column.id), {
            column
        });
    };
}

const registerWithEmailAndPassword = async (name, email, password) => {
    try {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        const user = res.user;
        await addDoc(collection(db, "users"), {
            uid: user.uid,
            name,
            authProvider: "local",
            email,
        })
        await addInitialData();
    } catch (err) {
        console.error(err);
        alert(err.message);
    }
};

const logInWithEmailAndPassword = async (email, password) => {
    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
        console.error(err);
        alert(err.message);
    }
};

const sendPasswordReset = async (email) => {
    try {
        await sendPasswordResetEmail(auth, email);
        alert("Password reset link sent!");
    } catch (err) {
        console.error(err);
        alert(err.message);
    }
};

const logout = () => {
    signOut(auth);
};

const app = firebase.initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);



export {
    auth,
    db,
    app,
    signInWithGoogle,
    logInWithEmailAndPassword,
    registerWithEmailAndPassword,
    sendPasswordReset,
    logout,
    addInitialData,
    checkInitialData,
};

export default firebase;