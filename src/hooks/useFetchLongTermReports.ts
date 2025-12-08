import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase/firebase";

interface HealthReports {
    createdAt: string;
    dateOfBirth: string;
    id: string;
    patientLastName: string;
    patientName: string;
    patientUID: string;
    sharedAt: string;
}

const useFetchLongTermReports = (userUid: string | undefined, trigger: number) => {
    const [healthReports, setHealthReports] = useState<HealthReports[]>([]);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [noPatients, setNoPatients] = useState(false);

    async function fetchHealthReportsForDoctor(uid: string | undefined
    ): Promise<HealthReports[]> {
        const q = query(
            collection(db, "healthReports"),
            where("doctors_access", "array-contains", userUid)
        );

        try {
            const querySnapshot = await getDocs(q);

            const healthReports: HealthReports[] = [];
            let reportIds = new Set();

            for (const doc of querySnapshot.docs) {
                if (reportIds.has(doc.id)) {
                    continue; // Skip if this report ID has already been processed
                }

                const data = doc.data();
                reportIds.add(doc.id);

                const reportCreatedAt = data.created_at
                    .toDate()
                    .toLocaleDateString("sv-SE");
                const dateOfBirth = data.date_of_birth
                    .toDate()
                    .toLocaleDateString("sv-SE");
                const reportSharedAt = data.shared_at
                    .toDate()
                    .toLocaleDateString("sv-SE");

                const reportInfo = {
                    id: doc.id,
                    patientUID: data.userID.id,
                    patientName: data.first_name,
                    patientLastName: data.last_name,
                    createdAt: reportCreatedAt,
                    dateOfBirth: dateOfBirth,
                    sharedAt: reportSharedAt,
                };
                healthReports.push(reportInfo);
            }
            return healthReports;
        } catch (error) {
            setError(error as any);
            throw error;
        }
    }

    useEffect(() => {
        const fetchHealthReportsDataForDoctor = async () => {
            try {
                if (!userUid) {
                    setError(
                        "Failed to fetch health reports. Please check the provided id."
                    );
                    return;
                }
                const healthReports = await fetchHealthReportsForDoctor(userUid);
                if (healthReports.length === 0) {
                    setNoPatients(true);
                }
                if (healthReports.length > 0) {
                    setNoPatients(false);
                }
                setHealthReports(healthReports);
                setIsLoading(false);
            } catch (error) {
                setError("Failed to fetch health reports. Try again.");
            }
        };
        fetchHealthReportsDataForDoctor();
    }, [userUid, trigger]); // Trigger re-fetch when `trigger` changes

    return {
        healthReports,
        error,
        isLoading,
        noPatients,
    };
};

export default useFetchLongTermReports;