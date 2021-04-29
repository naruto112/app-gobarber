import React, { useCallback, useEffect, useState, useMemo } from "react";
import { useRoute, useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Feather";
import { Platform, Alert, Text } from "react-native";
import { format } from "date-fns";
import DateTimePicker from "@react-native-community/datetimepicker";

import { useAuth } from "../../hooks/auth";
import api from "../../services/api";

import {
    Container,
    Header,
    BackButton,
    HeaderTitle,
    UserAvatar,
    Content,
    ProvidersListContainer,
    ProvidersList,
    ProviderContainer,
    ProviderAvatar,
    ProviderName,
    Calendar,
    DatePicketCalendar,
    Title,
    OpenDatePickerButton,
    OpenDatePickerButtonText,
    Schedule,
    Section,
    SectionTitle,
    SectionContent,
    Hour,
    HourText,
    CreateAppointmentButton,
    CreateAppointmentButtonText,
} from "./styles";
import AppointmentCreated from "../AppointmentCreated";

interface RouteParams {
    providerId: string;
}

export interface Provider {
    id: string;
    name: string;
    avatar_url: string;
}

interface AvailabilityItem {
    hour: number;
    available: boolean;
}

const CreateAppointment: React.FC = () => {
    const { user } = useAuth();
    const route = useRoute();
    const { goBack, navigate } = useNavigation();

    const routeParams = route.params as RouteParams;

    const [availability, setAvailability] = useState<AvailabilityItem[]>([]);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedHour, setSelectedHour] = useState(0);
    const [providers, setProviders] = useState<Provider[]>([]);
    const [selectedProvider, setSelectedProvider] = useState(
        routeParams.providerId
    );

    useEffect(() => {
        api.get("providers").then((response) => {
            setProviders(response.data);
        });
    }, []);

    useEffect(() => {
        api.get(`providers/${selectedProvider}/day-availability`, {
            params: {
                year: selectedDate.getFullYear(),
                month: selectedDate.getMonth() + 1,
                day: selectedDate.getDate(),
            },
        }).then((response) => {
            setAvailability(response.data);
        });
    }, [selectedDate, selectedProvider]);

    const navigateBack = useCallback(() => {
        goBack();
    }, [goBack]);

    const handleSelectProvider = useCallback((providerId: string) => {
        setSelectedProvider(providerId);
    }, []);

    const handleToggleDatePicker = useCallback(() => {
        setShowDatePicker((state) => !state);
    }, []);

    const handleDateChanged = useCallback(
        (event: any, date: Date | undefined) => {
            if (Platform.OS === "android") {
                setShowDatePicker(false);
            }

            if (date) {
                setSelectedDate(date);
            }
        },
        []
    );

    const handleCreateAppointment = useCallback(async () => {
        try {
            const date = new Date(selectedDate);
            date.setHours(selectedHour);
            date.setMinutes(0);
            await api.post("appointments", {
                provider_id: selectedProvider,
                date,
            });

            navigate("AppointmentCreated", {
                date: date.getTime(),
                name: user,
            });
        } catch (error) {
            Alert.alert(
                "Erro ao criar agendamento",
                "Ocorreu um erro ai tentar criar o agendamento, tente novamente"
            );
        }
    }, [navigate, selectedDate, selectedHour, selectedProvider, user]);

    const morningAvailability = useMemo(() => {
        return availability
            .filter(({ hour }) => hour < 12)
            .map(({ hour, available }) => {
                return {
                    hour,
                    available,
                    hourFormatted: format(new Date().setHours(hour), "HH:00"),
                };
            });
    }, [availability]);

    const afternoonAvailability = useMemo(() => {
        return availability
            .filter(({ hour }) => hour >= 12)
            .map(({ hour, available }) => {
                return {
                    hour,
                    available,
                    hourFormatted: format(new Date().setHours(hour), "HH:00"),
                };
            });
    }, [availability]);

    const handleSelecthour = useCallback((hour: number) => {
        setSelectedHour(hour);
    }, []);

    return (
        <Container>
            <Header>
                <BackButton onPress={navigateBack}>
                    <Icon name="chevron-left" size={24} color="#999591" />
                </BackButton>

                <HeaderTitle>Cabeleireiros</HeaderTitle>

                <UserAvatar source={{ uri: user.avatar_url }} />
            </Header>

            <Content>
                <ProvidersListContainer>
                    <ProvidersList
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        data={providers}
                        keyExtractor={(provider) => provider.id}
                        renderItem={({ item: provider }) => (
                            <ProviderContainer
                                onPress={() =>
                                    handleSelectProvider(provider.id)
                                }
                                selected={provider.id === selectedProvider}
                            >
                                <ProviderAvatar
                                    source={{ uri: provider.avatar_url }}
                                />
                                <ProviderName
                                    selected={provider.id === selectedProvider}
                                >
                                    {provider.name}
                                </ProviderName>
                            </ProviderContainer>
                        )}
                    />
                </ProvidersListContainer>

                <Calendar>
                    <Title>Escolha a data</Title>
                    {Platform.OS === "android" && (
                        <OpenDatePickerButton>
                            <OpenDatePickerButtonText
                                onPress={handleToggleDatePicker}
                            >
                                Abrir calendário
                            </OpenDatePickerButtonText>
                        </OpenDatePickerButton>
                    )}
                </Calendar>

                {Platform.OS === "ios" ? (
                    <DatePicketCalendar>
                        <DateTimePicker
                            mode="date"
                            locale="pt-BR"
                            display="spinner"
                            onChange={handleDateChanged}
                            value={selectedDate}
                            textColor="#fff"
                            style={{
                                backgroundColor: "#232129",
                                width: 300,
                                height: 300,
                                borderRadius: 30,
                            }}
                        />
                    </DatePicketCalendar>
                ) : (
                    <>
                        {showDatePicker && (
                            <DateTimePicker
                                mode="date"
                                locale="pt-BR"
                                display="default"
                                onChange={handleDateChanged}
                                value={selectedDate}
                                textColor="#fff"
                                style={{
                                    backgroundColor: "#232129",
                                    width: 300,
                                    height: 300,
                                    borderRadius: 30,
                                }}
                            />
                        )}
                    </>
                )}

                <Schedule>
                    <Title>Escolha o horário</Title>
                    <Section>
                        <SectionTitle>Manhã</SectionTitle>
                    </Section>

                    <SectionContent>
                        {morningAvailability.map(
                            ({ hourFormatted, hour, available }) => (
                                <Hour
                                    enabled={available}
                                    selected={selectedHour === hour}
                                    available={available}
                                    key={hourFormatted}
                                    onPress={() => handleSelecthour(hour)}
                                >
                                    <HourText selected={selectedHour === hour}>
                                        {hourFormatted}
                                    </HourText>
                                </Hour>
                            )
                        )}
                    </SectionContent>
                    <Section>
                        <SectionTitle>Tarde</SectionTitle>

                        <SectionContent>
                            {afternoonAvailability.map(
                                ({ hourFormatted, hour, available }) => (
                                    <Hour
                                        enabled={available}
                                        selected={selectedHour === hour}
                                        available={available}
                                        key={hourFormatted}
                                        onPress={() => handleSelecthour(hour)}
                                    >
                                        <HourText
                                            selected={selectedHour === hour}
                                        >
                                            {hourFormatted}
                                        </HourText>
                                    </Hour>
                                )
                            )}
                        </SectionContent>
                    </Section>
                </Schedule>
                <CreateAppointmentButton onPress={handleCreateAppointment}>
                    <CreateAppointmentButtonText>
                        Agendar
                    </CreateAppointmentButtonText>
                </CreateAppointmentButton>
            </Content>
        </Container>
    );
};

export default CreateAppointment;
