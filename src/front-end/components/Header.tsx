import { Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons"

export default function Header() {
    {/* Header */ }
    <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <View style={styles.locationContainer}>
            <Text style={styles.locationText}>Bauru, SP</Text>
        </View>
        <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="options-outline" size={24} color="black" />
        </TouchableOpacity>
    </View>
}

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    backButton: {
        padding: 8,
    },
    locationContainer: {
        flex: 1,
        alignItems: "center",
        backgroundColor: "#f5f5f5",
        borderRadius: 20,
        paddingVertical: 8,
        marginHorizontal: 8,
    },
    locationText: {
        fontSize: 16,
        fontWeight: "500",
    },
    filterButton: {
        padding: 8,
    },
});