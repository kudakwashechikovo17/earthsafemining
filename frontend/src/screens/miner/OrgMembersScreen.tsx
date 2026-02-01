import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert, RefreshControl } from 'react-native';
import {
    Appbar,
    Avatar,
    List,
    Text,
    IconButton,
    Button,
    useTheme,
    Surface,
    Divider,
    FAB,
    Portal,
    Modal,
    TextInput
} from 'react-native-paper';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { apiService } from '../../services/apiService';
import ScreenWrapper from '../../components/ScreenWrapper';

const OrgMembersScreen = ({ navigation }: any) => {
    const theme = useTheme();
    const { currentOrg, user } = useSelector((state: RootState) => state.auth);

    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [inviteVisible, setInviteVisible] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviting, setInviting] = useState(false);

    const isAdmin = currentOrg?.role === 'admin' || currentOrg?.role === 'owner';

    const fetchMembers = useCallback(async () => {
        if (!currentOrg) return;
        try {
            const data = await apiService.getOrgMembers(currentOrg._id);
            setMembers(data);
        } catch (error) {
            console.error('Fetch members error:', error);
            Alert.alert('Error', 'Failed to load members');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [currentOrg]);

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchMembers();
    };

    const handleRemoveMember = (memberId: string, memberName: string) => {
        Alert.alert(
            'Remove Member',
            `Are you sure you want to remove ${memberName}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        if (!currentOrg) return;
                        try {
                            await apiService.removeMember(currentOrg._id, memberId);
                            Alert.alert('Success', 'Member removed');
                            fetchMembers();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to remove member');
                        }
                    }
                }
            ]
        );
    };

    const handleInvite = async () => {
        if (!inviteEmail) {
            Alert.alert('Error', 'Please enter an email address');
            return;
        }

        setInviting(true);
        try {
            // Need to add this method to apiService/backend first or use existing member add
            // For now, assuming invite functionality or direct add if user exists
            await apiService.post(`/orgs/${currentOrg._id}/members`, {
                email: inviteEmail,
                role: 'miner' // Default role
            });

            Alert.alert('Success', 'User added to organization');
            setInviteVisible(false);
            setInviteEmail('');
            fetchMembers();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to add member');
        } finally {
            setInviting(false);
        }
    };

    const renderItem = ({ item }: { item: any }) => {
        const isSelf = item.userId?._id === user?.id;
        const initials = item.userId?.firstName ? item.userId.firstName[0] : '?';
        const name = item.userId ? `${item.userId.firstName} ${item.userId.lastName}` : 'Unknown User';

        return (
            <Surface style={styles.memberCard} elevation={1}>
                <List.Item
                    title={name}
                    description={item.role.charAt(0).toUpperCase() + item.role.slice(1)}
                    left={props => (
                        <Avatar.Text
                            {...props}
                            label={initials}
                            size={40}
                            style={{ backgroundColor: isSelf ? theme.colors.primaryContainer : theme.colors.surfaceVariant }}
                            color={isSelf ? theme.colors.primary : theme.colors.onSurfaceVariant}
                        />
                    )}
                    right={props => (
                        isAdmin && !isSelf && item.role !== 'owner' ? (
                            <IconButton
                                {...props}
                                icon="delete-outline"
                                iconColor={theme.colors.error}
                                onPress={() => handleRemoveMember(item.userId._id, name)}
                            />
                        ) : null
                    )}
                />
            </Surface>
        );
    };

    return (
        <ScreenWrapper>
            <Appbar.Header style={{ backgroundColor: theme.colors.background }}>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content title="Team Members" />
            </Appbar.Header>

            <FlatList
                data={members}
                renderItem={renderItem}
                keyExtractor={item => item._id}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.emptyState}>
                            <Text style={{ color: theme.colors.outline }}>No members found.</Text>
                        </View>
                    ) : null
                }
            />

            {isAdmin && (
                <FAB
                    icon="plus"
                    label="Add Member"
                    style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                    color={theme.colors.onPrimary}
                    onPress={() => setInviteVisible(true)}
                />
            )}

            <Portal>
                <Modal visible={inviteVisible} onDismiss={() => setInviteVisible(false)} contentContainerStyle={styles.modal}>
                    <Text variant="titleLarge" style={{ marginBottom: 16 }}>Add New Member</Text>
                    <Text variant="bodyMedium" style={{ marginBottom: 16, color: theme.colors.outline }}>
                        Enter the email address of the existing user you want to add to your team.
                    </Text>

                    <TextInput
                        label="Email Address"
                        value={inviteEmail}
                        onChangeText={setInviteEmail}
                        mode="outlined"
                        autoCapitalize="none"
                        keyboardType="email-address"
                        style={{ marginBottom: 24 }}
                    />

                    <View style={styles.modalActions}>
                        <Button onPress={() => setInviteVisible(false)} style={{ marginRight: 8 }}>Cancel</Button>
                        <Button mode="contained" onPress={handleInvite} loading={inviting}>Add User</Button>
                    </View>
                </Modal>
            </Portal>

        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    listContent: {
        padding: 16,
    },
    memberCard: {
        backgroundColor: '#fff',
        marginBottom: 12,
        borderRadius: 12,
        overflow: 'hidden',
    },
    emptyState: {
        padding: 40,
        alignItems: 'center',
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
    },
    modal: {
        backgroundColor: 'white',
        padding: 24,
        margin: 24,
        borderRadius: 12,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    }
});

export default OrgMembersScreen;
