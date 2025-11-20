import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Image } from "react-native";
import * as Location from "expo-location";

const API_KEY = "4836c38890b487b1557ddd6ed9714b54";

export default function weatherScreen() {
  const [city, setCity] = useState(null);
  const [temp, setTemp] = useState(null);
  const [desc, setDesc] = useState(null);
  const [icon, setIcon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  // 안전한 위치 가져오기 함수
  const getSafeLocation = async () => {
    try {
      // 위치 권한 요청
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("위치 권한이 필요합니다.");
        return null;
      }

      // 위치 가져오기 + 정확도 향상
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      if (!location || !location.coords) {
        setErrorMsg("현재 위치를 확인할 수 없습니다.");
        return null;
      }

      return location;
    } catch (e) {
      console.log("위치 오류:", e);
      setErrorMsg("위치 정보를 가져오지 못했습니다. GPS를 켜주세요.");
      return null;
    }
  };

  useEffect(() => {
    (async () => {
      const location = await getSafeLocation();
      if (!location) {
        setLoading(false);
        return;
      }

      const { latitude, longitude } = location.coords;

      try {
        // Reverse Geocode → 도시명
        const geo = await Location.reverseGeocodeAsync({ latitude, longitude });

        if (geo.length > 0) {
          setCity(
            geo[0].city ||
              geo[0].district ||
              geo[0].region ||
              geo[0].subregion ||
              "현재 위치"
          );
        }

        // OpenWeather API 호출
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=kr`
        );

        const result = await response.json();

        if (!result.main) {
          setErrorMsg("날씨 정보를 가져올 수 없습니다.");
        } else {
          setTemp(result.main.temp);
          setDesc(result.weather?.[0]?.description);
          setIcon(result.weather?.[0]?.icon);
        }
      } catch (e) {
        console.log("날씨 API 오류:", e);
        setErrorMsg("날씨 데이터를 불러오지 못했습니다.");
      }

      setLoading(false);
    })();
  }, []);

  // 로딩 화면
  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 12, fontSize: 16 }}>
          날씨 정보를 불러오는 중…
        </Text>
      </View>
    );
  }

  // 오류 화면
  if (errorMsg) {
    return (
      <View style={styles.error}>
        <Text style={styles.errorText}>{errorMsg}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.city}>{city}</Text>

      {icon && (
        <Image
          source={{
            uri: `https://openweathermap.org/img/wn/${icon}@4x.png`,
          }}
          style={{ width: 150, height: 150 }}
        />
      )}

      <Text style={styles.temp}>{Math.round(temp)}°C</Text>
      <Text style={styles.desc}>{desc}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  error: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 20,
    color: "red",
    textAlign: "center",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#87CEEB",
  },
  city: {
    fontSize: 50,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 8,
  },
  temp: {
    fontSize: 80,
    color: "#fff",
    fontWeight: "bold",
  },
  desc: {
    fontSize: 30,
    color: "#fff",
    marginTop: 8,
  },
});