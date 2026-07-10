import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import WeatherService from '../services/weatherService';
import { useTheme } from '../context/ThemeContext';

const FALLBACK_CITY = 'Bandung';

const WeatherScreen = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const fetchWeather = async (cityName) => {
    if (!cityName.trim()) {
      Alert.alert('Error', 'Masukkan nama kota');
      return;
    }

    setLoading(true);
    const result = await WeatherService.getWeatherByCity(cityName);
    setLoading(false);

    if (result.success) {
      setWeather(result.data);
    } else {
      Alert.alert('Error', result.error);
    }
  };

  const fetchWeatherByCoords = async (lat, lon) => {
    setLoading(true);
    const result = await WeatherService.getWeatherByCoords(lat, lon);
    setLoading(false);

    if (result.success) {
      setWeather(result.data);
    } else {
      fetchWeather(FALLBACK_CITY);
    }
  };

  const handleSearch = () => fetchWeather(searchInput);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        fetchWeather(FALLBACK_CITY);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      fetchWeatherByCoords(loc.coords.latitude, loc.coords.longitude);
    })();
  }, []);

  const getComfortAnalysis = (temp, humidity) => {
    if (temp < 20) {
      return { level: 'Dingin / Sejuk', color: '#2196F3', barWidth: '25%', icon: 'snow-outline',
        tip: 'Suhu dingin khas Bandung. Cocok untuk aktivitas outdoor seperti jalan-jalan ke Lembang atau Dago. Bawa jaket.' };
    } else if (temp < 24) {
      return { level: 'Sangat Nyaman', color: '#4CAF50', barWidth: '45%', icon: 'leaf-outline',
        tip: 'Suhu sangat nyaman, khas Bandung pagi-sore. Waktu ideal untuk jalan-jalan ke Alun-Alun atau kafe di Dago.' };
    } else if (temp < 28) {
      if (humidity < 70) {
        return { level: 'Nyaman', color: '#8BC34A', barWidth: '60%', icon: 'happy-outline',
          tip: 'Suhu cukup hangat tapi masih nyaman. Cocok untuk aktivitas luar ruangan.' };
      } else {
        return { level: 'Cukup Nyaman', color: '#CDDC39', barWidth: '70%', icon: 'thermometer-outline',
          tip: 'Agak hangat dan lembab. Disarankan pakaian longgar dan minum cukup.' };
      }
    } else if (temp < 32) {
      if (humidity < 65) {
        return { level: 'Hangat', color: '#FFC107', barWidth: '80%', icon: 'sunny-outline',
          tip: 'Suhu hangat. Batasi paparan matahari langsung di siang hari.' };
      } else {
        return { level: 'Gerah', color: '#FF9800', barWidth: '88%', icon: 'warning-outline',
          tip: 'Kombinasi hangat + lembab bikin gerah. Pastikan sirkulasi udara baik.' };
      }
    } else {
      return { level: 'Panas Ekstrem', color: '#F44336', barWidth: '100%', icon: 'flame-outline',
        tip: 'Suhu sangat tinggi. Hindari aktivitas berat di luar. Minum air putih ekstra.' };
    }
  };

  const getActivityTip = (weatherData) => {
    const desc = weatherData.description.toLowerCase();
    const temp = weatherData.temperature;

    if (desc.includes('hujan') || desc.includes('gerimis') || desc.includes('petir')) {
      return { title: 'Saatnya Hujan', icon: 'umbrella-outline', color: '#2196F3',
        text: 'Bawa payung atau jas hujan. Hati-hati jalan licin. Kurangi kecepatan berkendara.' };
    }
    if (desc.includes('awan') || desc.includes('mendung') || desc.includes('berawan')) {
      return { title: 'Cuaca Berawan', icon: 'cloud-outline', color: '#607D8B',
        text: 'Udara cenderung sejuk. Cocok untuk aktivitas outdoor tanpa risiko panas berlebih.' };
    }
    if (desc.includes('cerah') || desc.includes('terang')) {
      return { title: 'Cuaca Cerah', icon: 'sunny-outline', color: '#FF9800',
        text: 'Cuaca cerah. Saat yang tepat untuk jalan-jalan atau piknik. Jangan lupa sunscreen.' };
    }
    if (desc.includes('kabut')) {
      return { title: 'Waspada Kabut', icon: 'eye-off-outline', color: '#795548',
        text: 'Jarak pandang terbatas. Hati-hati berkendara, nyalakan lampu utama.' };
    }
    if (temp >= 32) {
      return { title: 'Cuaca Panas', icon: 'flame-outline', color: '#F44336',
        text: 'Gunakan topi dan sunscreen. Hindari olahraga berat di luar. Minum air putih lebih banyak.' };
    }
    return { title: 'Cuaca Kondusif', icon: 'sparkles-outline', color: '#4CAF50',
      text: 'Cuaca mendukung aktivitas harian. Nikmati hari Anda!' };
  };

  const comfort = weather ? getComfortAnalysis(weather.temperature, weather.humidity) : null;
  const activityTip = weather ? getActivityTip(weather) : null;

  const WeatherCard = ({ icon, label, value, color }) => (
    <View style={[styles.weatherCard, { borderLeftColor: color }]}>
      <Ionicons name={icon} size={24} color={color} />
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.cardValue}>{value}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cek Cuaca</Text>
        <Text style={styles.headerSubtitle}>Informasi cuaca real-time</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari kota lain..."
            placeholderTextColor={colors.textMuted}
            value={searchInput}
            onChangeText={setSearchInput}
            onSubmitEditing={handleSearch}
          />
        </View>
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Cari</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Mengambil data cuaca...</Text>
        </View>
      ) : weather ? (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Main Weather Card */}
          <View style={styles.mainCard}>
            <Text style={styles.cityName}>
              <Ionicons name="location" size={20} color="#2196F3" /> {weather.city}, {weather.country}
            </Text>
            <View style={styles.mainWeatherRow}>
              <Image
                source={{ uri: WeatherService.getIconUrl(weather.icon) }}
                style={styles.weatherIcon}
              />
              <View style={styles.mainTempInfo}>
                <Text style={styles.temperature}>{weather.temperature}°C</Text>
                <Text style={styles.description}>{weather.description}</Text>
                <Text style={styles.feelsLike}>Terasa {weather.feelsLike}°C</Text>
              </View>
            </View>
            <View style={styles.minMaxRow}>
              <View style={styles.minMaxItem}>
                <Ionicons name="arrow-down" size={14} color="#2196F3" />
                <Text style={styles.minMaxText}>{weather.tempMin}°C</Text>
              </View>
              <Text style={styles.minMaxSep}>|</Text>
              <View style={styles.minMaxItem}>
                <Ionicons name="arrow-up" size={14} color="#F44336" />
                <Text style={styles.minMaxText}>{weather.tempMax}°C</Text>
              </View>
            </View>
          </View>

          {/* Comfort Analysis */}
          {comfort && (
            <View style={styles.analysisCard}>
              <View style={styles.analysisHeader}>
                <Ionicons name={comfort.icon} size={20} color={comfort.color} />
                <Text style={styles.analysisTitle}>Indeks Kenyamanan</Text>
                <Text style={[styles.analysisLevel, { color: comfort.color }]}>{comfort.level}</Text>
              </View>
              <View style={styles.gaugeBg}>
                <View style={[styles.gaugeFill, { width: comfort.barWidth, backgroundColor: comfort.color }]} />
              </View>
              <Text style={styles.analysisTip}>{comfort.tip}</Text>
            </View>
          )}

          {/* Activity Recommendation */}
          {activityTip && (
            <View style={[styles.tipCard, { borderLeftColor: activityTip.color }]}>
              <View style={styles.tipHeader}>
                <Ionicons name={activityTip.icon} size={22} color={activityTip.color} />
                <Text style={[styles.tipTitle, { color: activityTip.color }]}>{activityTip.title}</Text>
              </View>
              <Text style={styles.tipText}>{activityTip.text}</Text>
            </View>
          )}

          {/* Weather Details Grid (4 cards) */}
          <Text style={styles.sectionTitle}>Detail Cuaca</Text>
          <View style={styles.detailsGrid}>
            <WeatherCard icon="water-outline" label="Kelembaban" value={`${weather.humidity}%`} color="#2196F3" />
            <WeatherCard icon="speedometer-outline" label="Tekanan" value={`${weather.pressure} hPa`} color="#9C27B0" />
            <WeatherCard icon="wind-outline" label="Angin" value={`${weather.windSpeed} m/s`} color="#4CAF50" />
            <WeatherCard icon="eye-outline" label="Visibilitas" value={`${(weather.visibility / 1000).toFixed(1)} km`} color="#FF9800" />
          </View>

          {/* Extra Details Row */}
          <View style={styles.extraRow}>
            <View style={styles.extraItem}>
              <Ionicons name="compass-outline" size={20} color="#607D8B" />
              <Text style={styles.extraLabel}>Arah Angin</Text>
              <Text style={styles.extraValue}>{weather.windDir}</Text>
            </View>
            <View style={styles.extraItem}>
              <Ionicons name="cloud-outline" size={20} color="#607D8B" />
              <Text style={styles.extraLabel}>Tutupan Awan</Text>
              <Text style={styles.extraValue}>{weather.clouds ?? '-'}%</Text>
            </View>
            <View style={styles.extraItem}>
              <Ionicons name="trending-up-outline" size={20} color="#607D8B" />
              <Text style={styles.extraLabel}>Tek. Laut</Text>
              <Text style={styles.extraValue}>{weather.seaLevel ?? '-'} hPa</Text>
            </View>
          </View>

          {/* Sunrise/Sunset */}
          <Text style={styles.sectionTitle}>Matahari</Text>
          <View style={styles.sunCard}>
            <View style={styles.sunItem}>
              <Ionicons name="sunny-outline" size={28} color="#FF9800" />
              <View style={styles.sunTextContainer}>
                <Text style={styles.sunLabel}>Terbit</Text>
                <Text style={styles.sunValue}>{weather.sunrise}</Text>
              </View>
            </View>
            <View style={styles.sunDivider} />
            <View style={styles.sunItem}>
              <Ionicons name="moon-outline" size={28} color="#5C6BC0" />
              <View style={styles.sunTextContainer}>
                <Text style={styles.sunLabel}>Terbenam</Text>
                <Text style={styles.sunValue}>{weather.sunset}</Text>
              </View>
            </View>
          </View>

          {/* Quick Cities */}
          <Text style={styles.sectionTitle}>Cari Kota Lain</Text>
          <View style={styles.quickCities}>
            {['Bandung', 'Jakarta', 'Surabaya', 'Yogyakarta', 'Semarang', 'Medan'].map((cityName) => (
              <TouchableOpacity
                key={cityName}
                style={[styles.cityButton, weather.city === cityName && styles.cityButtonActive]}
                onPress={() => {
                  setSearchInput('');
                  fetchWeather(cityName);
                }}
              >
                <Text style={[styles.cityButtonText, weather.city === cityName && styles.cityButtonTextActive]}>
                  {cityName}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      ) : null}
    </KeyboardAvoidingView>
  );
};

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: colors.surface,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
  },
  searchButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: colors.textSecondary,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  mainCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cityName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  mainWeatherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weatherIcon: {
    width: 80,
    height: 80,
    marginRight: 15,
  },
  mainTempInfo: {
    alignItems: 'flex-start',
  },
  temperature: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    textTransform: 'capitalize',
    marginTop: 2,
  },
  feelsLike: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  minMaxRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  minMaxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  minMaxSep: {
    color: colors.textMuted,
  },
  minMaxText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 4,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 15,
    justifyContent: 'space-between',
  },
  weatherCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  cardLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 8,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 4,
  },
  analysisCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginTop: 15,
  },
  analysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  analysisTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
    flex: 1,
  },
  analysisLevel: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  gaugeBg: {
    height: 8,
    backgroundColor: colors.mode === 'dark' ? '#333' : '#ECEFF1',
    borderRadius: 4,
    marginBottom: 10,
    overflow: 'hidden',
  },
  gaugeFill: {
    height: '100%',
    borderRadius: 4,
  },
  analysisTip: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  tipCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderLeftWidth: 5,
    marginTop: 12,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  tipText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  extraRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 15,
    marginTop: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  extraItem: {
    flex: 1,
    alignItems: 'center',
  },
  extraLabel: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 4,
  },
  extraValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 2,
  },
  sunCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  sunItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  sunTextContainer: {
    marginLeft: 15,
  },
  sunLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  sunValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 2,
  },
  sunDivider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 20,
    marginBottom: 10,
  },
  quickCities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  cityButton: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cityButtonActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  cityButtonText: {
    color: '#2196F3',
    fontSize: 13,
  },
  cityButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default WeatherScreen;
