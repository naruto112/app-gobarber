/* eslint-disable quotes */
/* eslint-disable react/jsx-one-expression-per-line */
import React, { useCallback, useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";

import Icon from "react-native-vector-icons/Feather";
import { useAuth } from "../../hooks/auth";
import api from "../../services/api";
import placeholderUser from "../../assets/placeholder.png";
import {
    Container,
    Header,
    HeaderTitle,
    UserName,
    ProfileButton,
    UserVatar,
    ProvidersList,
    ProvidersListTitle,
    ProviderContainer,
    ProviderAvatar,
    ProviderName,
    ProviderInfo,
    ProviderMeta,
    ProviderMetaText,
    SignOut,
} from "./styles";

export interface Provider {
    id: string;
    name: string;
    avatar_url: string;
}

const Dashboard: React.FC = () => {
    const [providers, setProviders] = useState<Provider[]>([]);

    const { user, signOut } = useAuth();
    const { navigate } = useNavigation();

    useEffect(() => {
        api.get("providers").then((response) => {
            setProviders(response.data);
            console.log(response.data);
        });
    }, []);

    const navigateToProfile = useCallback(() => {
        navigate("Profile");
    }, [navigate]);

    const userSignOut = useCallback(() => {
        signOut();
    }, [signOut]);

    const navigateToCreateAppointment = useCallback(
        (providerId: string) => {
            navigate("CreateAppointment", { providerId });
        },
        [navigate]
    );

    return (
        <Container>
            <Header>
                <HeaderTitle>
                    Bem vindo, {"\n"}
                    <UserName>{user.name}</UserName>
                </HeaderTitle>

                <ProfileButton onPress={navigateToProfile}>
                    {user.avatar_url ? (
                        <UserVatar source={{ uri: user.avatar_url }} />
                    ) : (
                        <UserVatar source={placeholderUser} />
                    )}
                </ProfileButton>
                <SignOut onPress={userSignOut}>
                    <Icon name="log-out" size={25} color="#f4ede8" />
                </SignOut>
            </Header>

            <ProvidersList
                data={providers}
                keyExtractor={(provider) => provider.id}
                ListHeaderComponent={
                    <ProvidersListTitle>Cabeleireiros</ProvidersListTitle>
                }
                renderItem={({ item: provider }) => (
                    <ProviderContainer
                        onPress={() => navigateToCreateAppointment(provider.id)}
                    >
                        {provider.avatar_url ? (
                            <ProviderAvatar
                                source={{ uri: provider.avatar_url }}
                            />
                        ) : (
                            <ProviderAvatar source={placeholderUser} />
                        )}

                        <ProviderInfo>
                            <ProviderName>{provider.name}</ProviderName>

                            <ProviderMeta>
                                <Icon
                                    name="calendar"
                                    size={14}
                                    color="#ff9000"
                                />
                                <ProviderMetaText>
                                    Segunda à Sexta
                                </ProviderMetaText>
                            </ProviderMeta>

                            <ProviderMeta>
                                <Icon name="clock" size={14} color="#ff9000" />
                                <ProviderMetaText>8h às 18h</ProviderMetaText>
                            </ProviderMeta>
                        </ProviderInfo>
                    </ProviderContainer>
                )}
            />
        </Container>
    );
};

export default Dashboard;
