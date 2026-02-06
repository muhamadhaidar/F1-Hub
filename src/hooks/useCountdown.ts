import { useEffect, useState } from 'react';

export interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

export function useCountdown(targetDate: string) {
    const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
    const [isFinished, setIsFinished] = useState(false);

    useEffect(() => {
        const target = new Date(targetDate);

        const calculateTimeLeft = () => {
            const now = new Date();
            const diff = target.getTime() - now.getTime();

            if (diff <= 0) {
                setIsFinished(true);
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeft({ days, hours, minutes, seconds });
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    return { timeLeft, isFinished };
}
