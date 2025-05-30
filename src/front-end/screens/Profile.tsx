import { SafeAreaView, StyleSheet, View, Text, Image, TouchableOpacity, Dimensions, StatusBar } from "react-native"

const { width } = Dimensions.get("window")

export const Profile = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#076df2" />

      {/* Blue header with curved bottom */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Seu Perfil</Text>

        {/* Curved bottom shape */}
        <View style={styles.curveContainer}>
          <View style={styles.curve} />
        </View>
      </View>

      {/* Profile picture */}
      <View style={styles.profileImageContainer}>
        <Image source={{ uri: "https://via.placeholder.com/160" }} style={styles.profileImage} />
      </View>

      {/* Profile information */}
      <Text style={styles.profileName}>André Bicudo</Text>
      <Text style={styles.statusMessage}>você ainda não tem moradia cadastrada</Text>

      {/* Action buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} activeOpacity={0.8}>
          <Text style={styles.buttonText}>Cadastre sua moradia</Text>
        </TouchableOpacity>

        <Text style={styles.orText}>ou</Text>

        <TouchableOpacity style={styles.button} activeOpacity={0.8}>
          <Text style={styles.buttonText}>Procurar república</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    backgroundColor: "#076df2",
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: "center",
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  headerTitle: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
  },
  curveContainer: {
    height: 50,
    width: "100%",
    position: "absolute",
    bottom: -25,
    overflow: "hidden",
  },
  curve: {
    backgroundColor: "#076df2",
    height: 100,
    width: "140%",
    marginLeft: "-20%",
    borderBottomLeftRadius: 300,
    borderBottomRightRadius: 300,
  },
  profileImageContainer: {
    alignSelf: "center",
    marginTop: -60,
    borderRadius: 80,
    borderWidth: 4,
    borderColor: "white",
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profileName: {
    color: "#076df2",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 16,
  },
  statusMessage: {
    color: "#666",
    fontSize: 16,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 40,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    width: "100%",
    alignItems: "center",
  },
  button: {
    backgroundColor: "#076df2",
    borderRadius: 30,
    paddingVertical: 16,
    width: "100%",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "500",
  },
  orText: {
    color: "#888",
    fontSize: 16,
    marginVertical: 16,
  },
})
