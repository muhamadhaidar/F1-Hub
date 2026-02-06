import { Colors } from '@/constants/theme';
import { useCountdown } from '@/hooks/useCountdown';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface CountdownProps {
    targetDate: string;
}

export const Countdown = ({ targetDate }: CountdownProps) => {
    const { timeLeft, isFinished } = useCountdown(targetDate);

    if (isFinished) {
        return (
            <View style={styles.container}>
                <Text style={styles.finishedText}>LIGHTS OUT!</Text>
            </View>
        );
    }

    if (!timeLeft) return null;

    return (
        <View style={styles.container}>
            <View style={styles.timeBlock}>
                <Text style={styles.timeValue}>{timeLeft.days ?? 0}</Text>
                <Text style={styles.timeLabel}>DAYS</Text>
            </View>
            <View style={styles.timeBlock}>
                <Text style={styles.timeValue}>{timeLeft.hours?.toString().padStart(2, '0') ?? '00'}</Text>
                <Text style={styles.timeLabel}>HOURS</Text>
            </View>
            <View style={styles.timeBlock}>
                <Text style={styles.timeValue}>{timeLeft.minutes?.toString().padStart(2, '0') ?? '00'}</Text>
                <Text style={styles.timeLabel}>MINS</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 12,
        marginVertical: 20,
    },
    timeBlock: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000000', // Darker background for box
        borderRadius: 8,
        width: 70,
        height: 70,
        borderWidth: 1,
        borderColor: '#333',
    },
    timeValue: {
        color: '#FF1801', // F1 Red
        fontSize: 24,
        fontWeight: '700',
    },
    timeLabel: {
        color: '#666',
        fontSize: 10,
        fontWeight: '500',
        marginTop: 2,
    },
    finishedText: {
        color: Colors.dark.primary,
        fontSize: 24,
        fontWeight: 'bold',
    },
});
