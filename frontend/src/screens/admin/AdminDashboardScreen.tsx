import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Paragraph, List, Button, Avatar } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import apiService from '../../services/apiService';
import ScreenWrapper from '../../components/ScreenWrapper';

const AdminDashboardScreen = ({ navigation }: any) => {
    const { currentOrg } = useSelector((state: RootState) => state.auth);
    const [shifts, setShifts] = useState<any[]>([]);
    const [creditScore, setCreditScore] = useState<any>(null);

    useEffect(() => {
        if (currentOrg) {
            fetchData();
        }
    }, [currentOrg]);

    const fetchData = async () => {
        try {
            const shiftsRes = await (apiService as any).get(`/orgs/${currentOrg?._id}/shifts`);
            setShifts(shiftsRes.data);

            const scoreRes = await (apiService as any).get(`/orgs/${currentOrg?._id}/credit-score`);
            setCreditScore(scoreRes.data);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <ScreenWrapper>
            <ScrollView contentContainerStyle={styles.container}>
                <Title style={styles.header}>Mine Administration</Title>
                <Paragraph>Organzation: {currentOrg?.name}</Paragraph>

                {/* Credit Score Card */}
                <Card style={styles.card}>
                    <Card.Content>
                        <Title>Credit Score</Title>
                        {creditScore ? (
                            <View style={styles.scoreRow}>
                                <Avatar.Text size={60} label={creditScore.grade || 'N/A'} style={{ backgroundColor: '#2E7D32' }} />
                                <View style={{ marginLeft: 20 }}>
                                    <Title style={{ fontSize: 32 }}>{creditScore.score}</Title>
                                    <Paragraph>Last calculated: {new Date(creditScore.calculatedAt).toLocaleDateString()}</Paragraph>
                                </View>
                            </View>
                        ) : (
                            <Paragraph>No credit score available yet.</Paragraph>
                        )}
                        <Button mode="outlined" onPress={() => fetchData()} style={{ marginTop: 10 }}>Refresh Score</Button>
                    </Card.Content>
                </Card>

                {/* Recent Shifts */}
                <Title style={styles.sectionTitle}>Recent Shifts</Title>
                {shifts.map((shift: any) => (
                    <Card key={shift._id} style={styles.shiftCard}>
                        <Card.Content>
                            <Paragraph>Date: {new Date(shift.createdAt).toLocaleDateString()}</Paragraph>
                            <Title>Type: {shift.type.toUpperCase()}</Title>
                            <Paragraph>Status: {shift.status}</Paragraph>
                        </Card.Content>
                        <Card.Actions>
                            <Button onPress={() => console.log('View Shift Details')}>View Details</Button>
                            <Button onPress={() => console.log('Verify Shift')} disabled={shift.status === 'verified'}>Verify</Button>
                        </Card.Actions>
                    </Card>
                ))}

            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: { padding: 16 },
    header: { fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
    card: { marginBottom: 20 },
    scoreRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
    sectionTitle: { fontSize: 20, marginBottom: 10, marginTop: 10 },
    shiftCard: { marginBottom: 10 }
});

export default AdminDashboardScreen;
