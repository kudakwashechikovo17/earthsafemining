import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Paragraph, Searchbar, Button, Avatar, Text } from 'react-native-paper';
import ScreenWrapper from '../../components/ScreenWrapper';

// Mock list of mines since user is a Lender looking at many mines
const LenderDashboardScreen = ({ navigation }: any) => {
    const [searchQuery, setSearchQuery] = useState('');

    const mines = [
        { id: '1', name: 'Golden Valley Mine', score: 85, grade: 'A', location: 'Kadoma' },
        { id: '2', name: 'Red Rock Cooperative', score: 72, grade: 'B', location: 'Gwanda' },
        { id: '3', name: 'Sunrise Mining', score: 55, grade: 'C', location: 'Mazowe' },
    ];

    return (
        <ScreenWrapper>
            <ScrollView contentContainerStyle={styles.container}>
                <Title style={styles.header}>Lender Dashboard</Title>
                <Paragraph style={styles.subtitle}>Find and evaluate mining opportunities.</Paragraph>

                <Searchbar
                    placeholder="Search mines..."
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={styles.search}
                />

                {mines.map((mine) => (
                    <Card key={mine.id} style={styles.card}>
                        <Card.Content style={styles.cardContent}>
                            <View>
                                <Title>{mine.name}</Title>
                                <Paragraph>{mine.location}</Paragraph>
                            </View>
                            <View style={styles.scoreBadge}>
                                <Avatar.Text size={40} label={mine.grade} style={{ backgroundColor: mine.grade === 'A' ? 'green' : (mine.grade === 'B' ? 'orange' : 'red') }} />
                                <Text style={{ textAlign: 'center', fontWeight: 'bold' }}>{mine.score}</Text>
                            </View>
                        </Card.Content>
                        <Card.Actions>
                            <Button>View Profile</Button>
                            <Button mode="contained">Offer Loan</Button>
                        </Card.Actions>
                    </Card>
                ))}
            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: { padding: 16 },
    header: { fontSize: 28, fontWeight: 'bold' },
    subtitle: { marginBottom: 20 },
    search: { marginBottom: 20 },
    card: { marginBottom: 15 },
    cardContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    scoreBadge: { alignItems: 'center' }
});

export default LenderDashboardScreen;
