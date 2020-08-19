import React, { useCallback, useMemo } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Feather";
import { format } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";

import {
    Container,
    Title,
    Description,
    OkButton,
    OkButtonText,
} from "./styles";

interface RouteParams {
    date: number;
    name: {
        name: string;
    };
}

const AppointmentCreated: React.FC = () => {
    const { reset } = useNavigation();
    const { params } = useRoute();

    const routeParams = params as RouteParams;

    const handleOkPressed = useCallback(() => {
        reset({
            routes: [{ name: "Dashboard" }],
            index: 0,
        });
    }, [reset]);

    const formattedDate = useMemo(() => {
        return format(
            routeParams.date,
            "EEEE', dia' dd 'de' MMMM 'de'yyyy 'às' HH:mm'h'",
            { locale: ptBR }
        );
    }, [routeParams.date]);

    const formattedName = useMemo(() => {
        return ` do colaborador ${routeParams.name.name}`;
    }, [routeParams.name.name]);

    return (
        <Container>
            <Icon name="check" size={80} color="#04de61" />

            <Title>Agendamento concluído</Title>
            <Description>
                {formattedDate}
                {formattedName}
            </Description>

            <OkButton onPress={handleOkPressed}>
                <OkButtonText>Ok</OkButtonText>
            </OkButton>
        </Container>
    );
};

export default AppointmentCreated;
