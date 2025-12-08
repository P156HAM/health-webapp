import React, { useEffect, useState } from 'react';
import "../../styles/AuthenticationAnimation.css";
import { useTranslation } from 'react-i18next';
import { Progress } from '../ui/progress';

const LoadingDefault = () => {
    const { t: translation } = useTranslation("global");
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const totalDuration = 5000; // 5 seconds
        const intervalDuration = 100; // 0.1 second
        const totalIntervals = totalDuration / intervalDuration;
        let currentInterval = 0;

        const interval = setInterval(() => {
            currentInterval += 1;
            const newProgress = (currentInterval / totalIntervals) * 100;
            setProgress(newProgress);

            if (currentInterval >= totalIntervals) {
                clearInterval(interval);
            }
        }, intervalDuration);

        return () => clearInterval(interval); // Cleanup interval on component unmount
    }, []);

    return (
        <div className="flex items-center justify-center h-screen w-screen bg-slate-100">
            <div className="flex flex-col gap-8">
                <div className="flex items-center">
                    <h1 className="text-3xl text-blue-600 mr-2">
                        {translation("landingPage.Login.loading")}
                    </h1>
                    <span className="dot text-4xl text-blue-600">.</span>
                    <span className="dot text-4xl text-blue-600">.</span>
                    <span className="dot text-4xl text-blue-600">.</span>
                </div>
                <Progress value={progress} className="[&>*]:bg-blue-600 bg-white" />
            </div>
        </div>
    );
}

export default LoadingDefault;
